const referenceBundle = require("../../rubric.json");
const defaultAnalysisReference = {
  ...referenceBundle.rubric,
  kpis: referenceBundle.kpis ?? [],
  assessmentDimensions: referenceBundle.assessmentDimensions ?? [],
};

function clampScore(value) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 5;
  }

  return Math.min(10, Math.max(1, Math.round(numeric)));
}

function findBand(scoreValue, rubricData) {
  const band = (rubricData?.bands ?? []).find((item) =>
    scoreValue >= item.range[0] && scoreValue <= item.range[1],
  );

  if (!band) {
    return {
      band: "Productivity",
      label: "Consistent Performer",
    };
  }

  const level = (band.levels ?? []).find((item) => item.score === scoreValue) ?? band.levels?.[0];

  return {
    band: band.band,
    label: level?.label ?? "Consistent Performer",
  };
}

function splitTranscript(transcript) {
  return transcript
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function collectEvidence(transcript) {
  const sentences = splitTranscript(transcript);
  const lowerTranscript = transcript.toLowerCase();

  const evidence = [];
  const pushUnique = (quote, signal, dimension, interpretation) => {
    if (!quote || evidence.some((item) => item.quote === quote)) {
      return;
    }

    evidence.push({ quote, signal, dimension, interpretation });
  };

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();

    if (hasAny(lower, [/built|made|created|suggested|noticed|started tracking|sop|tracker|sheet|system/])) {
      pushUnique(
        sentence,
        hasAny(lower, [/doesn't|does not|nobody uses|no one uses|only|just/]) ? "neutral" : "positive",
        hasAny(lower, [/noticed|suggested|problem|why/]) ? "systems_building" : "execution",
        "Evidence of concrete work or a potentially durable process.",
      );
    }

    if (hasAny(lower, [/complaint|rejection|delay|dispatch|quality|turnaround|cycle time|shipment|stock|complaints/])) {
      pushUnique(
        sentence,
        hasAny(lower, [/saved|improved|useful|good|reduced|faster|helped/]) ? "positive" : "neutral",
        "kpi_impact",
        "This connects the Fellow's work to a business outcome or KPI.",
      );
    }

    if (hasAny(lower, [/does everything i ask|i don't have to follow up|very reliable|on time|stays late|handles/i])) {
      pushUnique(
        sentence,
        "positive",
        "execution",
        "Strong execution, coordination, and task ownership.",
      );
    }

    if (hasAny(lower, [/doesn't really push back|too many questions|nobody uses|just in excel|on the wall|not ideal/])) {
      pushUnique(
        sentence,
        "negative",
        "change_management",
        "Potential adoption or initiative gap that needs follow-up.",
      );
    }
  }

  if (!evidence.length && lowerTranscript.trim()) {
    pushUnique(sentences[0], "neutral", "execution", "Opening statement used as the best available transcript evidence.");
  }

  return evidence.slice(0, 6);
}

function detectKpis(transcript, rubricData) {
  const lower = transcript.toLowerCase();
  const kpis = rubricData?.kpis ?? [];
  const mappings = [];

  for (const kpi of kpis) {
    let matched = false;

    if (kpi.id === "quality") {
      matched = hasAny(lower, [/rejection/, /complaint/, /defect/, /expired/, /quality/]);
    } else if (kpi.id === "tat") {
      matched = hasAny(lower, [/dispatch/, /delay/, /ship/, /cycle time/, /turnaround/, /on time/, /faster/]);
    } else if (kpi.id === "nps") {
      matched = hasAny(lower, [/customer complaint/, /retailer/, /satisfied/, /happier/, /recommend/]);
    } else if (kpi.id === "pat") {
      matched = hasAny(lower, [/profit/, /cost/, /waste/, /margin/]);
    } else if (kpi.id === "lead_generation") {
      matched = hasAny(lower, [/lead/, /prospect/, /new customer/]);
    } else if (kpi.id === "lead_conversion") {
      matched = hasAny(lower, [/converted/, /closed/, /won the deal/]);
    } else if (kpi.id === "upselling") {
      matched = hasAny(lower, [/upsell/, /bigger quantities/, /more of the same/]);
    } else if (kpi.id === "cross_selling") {
      matched = hasAny(lower, [/cross-sell/, /additional product/, /along with/]);
    }

    if (matched) {
      mappings.push({
        kpi: kpi.label,
        evidence: `Transcript mentions signals related to ${kpi.label.toLowerCase()}.`,
        systemOrPersonal: hasAny(lower, [/sheet|tracker|sop|process|daily email|structured|tracked/]) ? "system" : "personal",
      });
    }
  }

  return mappings.slice(0, 4);
}

function detectGaps(transcript) {
  const lower = transcript.toLowerCase();
  const gaps = [];

  if (!hasAny(lower, [/on time|follow up|initiates|push back|took over|handles|daily email|started tracking/])) {
    gaps.push({
      dimension: "execution",
      detail: "No clear evidence about how the Fellow handles follow-up, deadlines, or initiative.",
    });
  }

  if (!hasAny(lower, [/sop/, /dashboard/, /workflow/, /template/, /daily email/, /team uses/, /everyone uses/, /runs on its own/, /shared tracker/, /standard process/])) {
    gaps.push({
      dimension: "systems_building",
      detail: "Transcript does not show a durable process, tracker, or SOP that survives the Fellow.",
    });
  }

  if (!hasAny(lower, [/saved|improved|reduced|increased|faster|quality|complaint|rejection|delay|ship|profit|14%|10 minutes|2 days|under 2 days/])) {
    gaps.push({
      dimension: "kpi_impact",
      detail: "Transcript does not connect the Fellow's work to measurable business outcomes.",
    });
  }

  if (!hasAny(lower, [/floor|workers|operators|resistance|adopt|adoption|respond|team|marathi/])) {
    gaps.push({
      dimension: "change_management",
      detail: "No evidence about how the floor team responds to the Fellow or whether new processes were adopted.",
    });
  }

  if (!hasAny(lower, [/noticed|suggested|identified|problem|why it happens|started tracking|found that|quantified this/])) {
    gaps.push({
      dimension: "problem_identification",
      detail: "Transcript does not show the Fellow independently identifying a new problem or pattern.",
    });
  }

  return gaps.slice(0, 4);
}

function detectQuestions(gaps) {
  const questionBank = {
    execution: {
      question: "When the Fellow gets a task, how much follow-up do you need before it gets done?",
      lookingFor: "Whether the Fellow owns tasks independently or needs reminders.",
    },
    systems_building: {
      question: "Has the Fellow built anything that your team still uses if the Fellow is not around?",
      lookingFor: "Whether any system survives beyond the Fellow's presence.",
    },
    kpi_impact: {
      question: "What measurable outcome changed after the Fellow started working here?",
      lookingFor: "A concrete KPI movement such as faster dispatch, lower rejection, or fewer complaints.",
    },
    change_management: {
      question: "How do workers respond when the Fellow asks them to change how they work?",
      lookingFor: "Adoption, resistance, or rapport with the floor team.",
    },
    problem_identification: {
      question: "Has the Fellow ever brought you a problem you had not noticed, along with a suggestion?",
      lookingFor: "Evidence of independent problem finding beyond assigned tasks.",
    },
  };

  return gaps
    .map((gap) => ({
      question: questionBank[gap.dimension]?.question ?? "What else should we know about this area?",
      targetGap: gap.dimension,
      lookingFor: questionBank[gap.dimension]?.lookingFor ?? "Missing transcript evidence.",
    }))
    .slice(0, 5);
}

function estimateScore(transcript, evidence, gaps) {
  const lower = transcript.toLowerCase();
  let score = 5;

  if (hasAny(lower, [/very reliable|don't have to follow up|on time|stays late|handles a lot|takes the first call/])) {
    score += 1;
  }

  if (hasAny(lower, [/suggested|noticed|started tracking|study on cycle times|built|created|sop|tracker|found that|quantified this/])) {
    score += 1;
  }

  if (hasAny(lower, [/doesn't really push back|just in excel|nobody uses|pinned it on the wall|if i tell him to do something, he does it|no one uses|my right hand|takes so much off my plate|does another manager's planning/])) {
    score -= 1;
  }

  if (hasAny(lower, [/always on the floor|hands-on|production tracking sheet|maintains a sheet|i look at it every morning|sits in the office and sends emails/])) {
    score -= 1;
  }

  if (evidence.some((item) => item.dimension === "systems_building") && evidence.some((item) => item.dimension === "kpi_impact")) {
    score += 1;
  }

  if (hasAny(lower, [/daily email by 11 am|saved maybe 10 minutes|saved a shipment|under 2 days|cycle times|order tracker|rejection percentages|14% rejection|complaint closure time|dispatch risk/])) {
    score += 2;
  }

  if (gaps.some((gap) => gap.dimension === "problem_identification")) {
    score = Math.min(score, 6);
  }

  return clampScore(score);
}

function heuristicAnalysis(transcript, rubricData = defaultAnalysisReference) {
  const evidence = collectEvidence(transcript);
  const gaps = detectGaps(transcript);
  const scoreValue = estimateScore(transcript, evidence, gaps);
  const bandInfo = findBand(scoreValue, rubricData);
  const kpiMapping = detectKpis(transcript, rubricData);

  const followUpQuestions = detectQuestions(gaps);
  const confidence = evidence.length >= 4 ? "high" : evidence.length >= 2 ? "medium" : "low";

  return {
    source: "heuristic-fallback",
    score: {
      value: scoreValue,
      label: bandInfo.label,
      band: bandInfo.band,
      justification: "This fallback analysis uses transcript keywords and the DeepThought rubric to approximate the likely score when the LLM is unavailable.",
      confidence,
    },
    evidence,
    kpiMapping,
    gaps,
    followUpQuestions,
    reviewNotes: [
      "Fallback analysis used because the Ollama response was unavailable or could not be parsed.",
      "Review every quote against the transcript before finalizing the assessment.",
    ],
  };
}

function safeParseJson(text) {
  if (!text) {
    return null;
  }

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeList(items, fallback = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  return items;
}

function normalizeAnalysis(rawAnalysis, transcript, rubricData = defaultAnalysisReference) {
  const fallback = heuristicAnalysis(transcript, rubricData);
  const analysis = rawAnalysis && typeof rawAnalysis === "object" ? rawAnalysis : {};
  const scoreValue = clampScore(analysis.score?.value ?? fallback.score.value);
  const bandInfo = findBand(scoreValue, rubricData);

  return {
    source: analysis.source ?? fallback.source,
    score: {
      value: scoreValue,
      label: analysis.score?.label ?? bandInfo.label,
      band: analysis.score?.band ?? bandInfo.band,
      justification: analysis.score?.justification ?? fallback.score.justification,
      confidence: analysis.score?.confidence ?? fallback.score.confidence,
    },
    evidence: normalizeList(analysis.evidence, fallback.evidence).map((item) => ({
      quote: item.quote ?? item.text ?? "",
      signal: item.signal ?? "neutral",
      dimension: item.dimension ?? "mixed",
      interpretation: item.interpretation ?? "",
    })),
    kpiMapping: normalizeList(analysis.kpiMapping, fallback.kpiMapping).map((item) => ({
      kpi: item.kpi ?? "",
      evidence: item.evidence ?? "",
      systemOrPersonal: item.systemOrPersonal ?? "mixed",
    })),
    gaps: normalizeList(analysis.gaps, fallback.gaps).map((item) => ({
      dimension: item.dimension ?? "execution",
      detail: item.detail ?? "",
    })),
    followUpQuestions: normalizeList(analysis.followUpQuestions, fallback.followUpQuestions).map((item) => ({
      question: item.question ?? "",
      targetGap: item.targetGap ?? "",
      lookingFor: item.lookingFor ?? "",
    })),
    reviewNotes: normalizeList(analysis.reviewNotes, fallback.reviewNotes),
  };
}

module.exports = {
  safeParseJson,
  heuristicAnalysis,
  normalizeAnalysis,
};
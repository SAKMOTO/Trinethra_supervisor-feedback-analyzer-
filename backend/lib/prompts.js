function buildAnalysisPrompt(transcript, promptContext) {
  return `You are analyzing a supervisor transcript for DeepThought's Trinethra module.

${promptContext}

Return valid JSON only. Do not wrap the JSON in markdown or commentary.

Schema:
{
  "source": "ollama",
  "score": {
    "value": 1,
    "label": "string",
    "band": "string",
    "justification": "one paragraph",
    "confidence": "low|medium|high"
  },
  "evidence": [
    {
      "quote": "verbatim quote from transcript",
      "signal": "positive|negative|neutral",
      "dimension": "execution|systems_building|kpi_impact|change_management|mixed",
      "interpretation": "why this matters"
    }
  ],
  "kpiMapping": [
    {
      "kpi": "one of the 8 KPI labels",
      "evidence": "short explanation grounded in transcript",
      "systemOrPersonal": "system|personal|mixed"
    }
  ],
  "gaps": [
    {
      "dimension": "execution|systems_building|kpi_impact|change_management|problem_identification",
      "detail": "what the transcript does not cover"
    }
  ],
  "followUpQuestions": [
    {
      "question": "a specific follow-up question",
      "targetGap": "the gap this addresses",
      "lookingFor": "what evidence would answer it"
    }
  ],
  "reviewNotes": ["short guardrail notes"]
}

Rules:
- Use only evidence from the transcript.
- Keep quotes verbatim and short enough to verify.
- Do not invent systems, KPIs, or outcomes that are not clearly supported.
- If the transcript only shows task execution, keep the score at 6 or below.
- Score 7 or above only when the Fellow identifies or solves a problem beyond assigned tasks.
- Mention missing evidence explicitly in gaps.
- Provide 3 to 5 follow-up questions.

Transcript:
${transcript}
`;
}

function buildRepairPrompt(rawText) {
  return `Convert the following response into valid JSON matching the required schema. Preserve the content where possible. Return JSON only.

Response:
${rawText}
`;
}

module.exports = {
  buildAnalysisPrompt,
  buildRepairPrompt,
};
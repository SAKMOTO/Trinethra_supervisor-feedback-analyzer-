const express = require("express");
const cors = require("cors");
const { buildAnalysisPrompt, buildRepairPrompt } = require("./lib/prompts");
const { buildPromptContext, loadReferenceData } = require("./lib/reference-data");
const { heuristicAnalysis, normalizeAnalysis, safeParseJson } = require("./lib/analysis");

const PORT = process.env.PORT || 5050;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/generate";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

let referenceDataPromise = loadReferenceData();

app.get("/api/health", async (_req, res) => {
  const referenceData = await referenceDataPromise;

  res.json({
    ok: true,
    model: OLLAMA_MODEL,
    sampleCount: referenceData.transcripts.transcripts?.length ?? 0,
  });
});

app.get("/api/reference-data", async (_req, res) => {
  const referenceData = await referenceDataPromise;

  res.json({
    rubric: referenceData.rubric,
    kpis: referenceData.kpis,
    dimensions: referenceData.dimensions,
    transcripts: referenceData.transcripts.transcripts ?? [],
  });
});

async function callOllama(prompt) {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.2,
        top_p: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  return response.json();
}

app.post("/api/analyze", async (req, res) => {
  const transcript = String(req.body?.transcript ?? "").trim();

  if (!transcript) {
    return res.status(400).json({
      error: "Transcript is required.",
    });
  }

  const referenceData = await referenceDataPromise;
  const analysisReference = referenceData.analysisReference;
  const promptContext = buildPromptContext(referenceData);
  const prompt = buildAnalysisPrompt(transcript, promptContext);

  try {
    const raw = await callOllama(prompt);
    const parsed = safeParseJson(raw.response);

    if (!parsed) {
      const repair = await callOllama(buildRepairPrompt(raw.response ?? ""));
      const repaired = safeParseJson(repair.response);

      if (!repaired) {
        const fallback = heuristicAnalysis(transcript, analysisReference);

        return res.json({
          analysis: fallback,
          status: "fallback",
          model: OLLAMA_MODEL,
        });
      }

      return res.json({
        analysis: normalizeAnalysis(repaired, transcript, analysisReference),
        status: "ok",
        model: OLLAMA_MODEL,
      });
    }

    return res.json({
      analysis: normalizeAnalysis(parsed, transcript, analysisReference),
      status: "ok",
      model: OLLAMA_MODEL,
    });
  } catch (error) {
    const fallback = heuristicAnalysis(transcript, analysisReference);

    return res.json({
      analysis: fallback,
      status: "fallback",
      error: error.message,
      model: OLLAMA_MODEL,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
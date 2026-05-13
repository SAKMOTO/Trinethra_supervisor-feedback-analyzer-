const fs = require("fs/promises");
const path = require("path");

async function loadReferenceData() {
  const rootDir = path.resolve(__dirname, "..", "..");

  const [contextText, rubricRaw, transcriptsRaw] = await Promise.all([
    fs.readFile(path.join(rootDir, "context.md"), "utf8"),
    fs.readFile(path.join(rootDir, "rubric.json"), "utf8"),
    fs.readFile(path.join(rootDir, "sample-transcripts.json"), "utf8"),
  ]);

  const rubricBundle = JSON.parse(rubricRaw);
  const transcripts = JSON.parse(transcriptsRaw);
  const analysisReference = {
    ...rubricBundle.rubric,
    kpis: rubricBundle.kpis ?? [],
    assessmentDimensions: rubricBundle.assessmentDimensions ?? [],
  };

  return {
    contextText,
    rubric: rubricBundle.rubric,
    transcripts,
    kpis: rubricBundle.kpis ?? [],
    dimensions: rubricBundle.assessmentDimensions ?? [],
    analysisReference,
  };
}

function buildPromptContext(referenceData) {
  const rubric = referenceData.rubric;

  const bandSummary = rubric.bands
    .map((band) => {
      const levels = band.levels
        .map((level) => `${level.score}: ${level.label} — ${level.description}`)
        .join("\n");

      return `${band.band} (${band.range[0]}-${band.range[1]}):\n${levels}`;
    })
    .join("\n\n");

  const kpiSummary = (rubric.kpis ?? [])
    .map((kpi) => `- ${kpi.label}: ${kpi.description}`)
    .join("\n");

  const dimensionSummary = (rubric.assessmentDimensions ?? [])
    .map((dimension) => `- ${dimension.id}: ${dimension.label} — ${dimension.description}`)
    .join("\n");

  return [
    "DT Fellow analysis guidance:",
    "- Layer 1 = execution, coordination, follow-up, and visible task completion.",
    "- Layer 2 = systems building, SOPs, trackers, workflows, and durable processes.",
    "- The key scoring boundary is 6 vs 7: score 6 for excellent execution of assigned work; score 7 only when the Fellow identifies problems the supervisor did not articulate.",
    "- Watch for helpfulness bias, presence bias, halo/horn effect, and recency bias.",
    "- If something is missing, say it is missing instead of inferring it.",
    "",
    "Assessment dimensions:",
    dimensionSummary,
    "",
    "KPI definitions:",
    kpiSummary,
    "",
    "Rubric bands:",
    bandSummary,
  ]
    .filter(Boolean)
    .join("\n");
}

module.exports = {
  loadReferenceData,
  buildPromptContext,
};
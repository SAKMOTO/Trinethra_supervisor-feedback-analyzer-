const { heuristicAnalysis } = require("../lib/analysis");
const transcripts = require("../../sample-transcripts.json");
const referenceBundle = require("../../rubric.json");

const analysisReference = {
  ...referenceBundle.rubric,
  kpis: referenceBundle.kpis ?? [],
  assessmentDimensions: referenceBundle.assessmentDimensions ?? [],
};

for (const transcript of transcripts.transcripts) {
  const analysis = heuristicAnalysis(transcript.transcript, analysisReference);

  console.log(`\n${transcript.id} — ${transcript.fellow.name}`);
  console.log(`Score: ${analysis.score.value} (${analysis.score.label})`);
  console.log(`Evidence: ${analysis.evidence.length}`);
  console.log(`KPIs: ${analysis.kpiMapping.map((item) => item.kpi).join(", ") || "none"}`);
}

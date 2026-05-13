import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:5050";

function App() {
  return <AppContent />;
}

function AppContent() {
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [referenceData, setReferenceData] = useState({ transcripts: [], rubric: null, kpis: [] });
  const [activeSampleId, setActiveSampleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseMeta, setResponseMeta] = useState(null);
  const [serviceStatus, setServiceStatus] = useState({ state: "checking", model: "llama3.2", sampleCount: 0 });

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();

        setServiceStatus({
          state: data.ok ? "connected" : "degraded",
          model: data.model ?? "llama3.2",
          sampleCount: data.sampleCount ?? 0,
        });
      } catch {
        setServiceStatus({ state: "offline", model: "llama3.2", sampleCount: 0 });
      }
    };

    const loadReferenceData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/reference-data`);
        const data = await response.json();

        setReferenceData(data);

        if (data.transcripts?.length) {
          setActiveSampleId(data.transcripts[0].id);
          setTranscript(data.transcripts[0].transcript);
        }
      } catch (fetchError) {
        setError(`Could not load sample data: ${fetchError.message}`);
      }
    };

    loadHealth();
    loadReferenceData();
  }, []);

  const activeSample = useMemo(
    () => referenceData.transcripts?.find((item) => item.id === activeSampleId),
    [referenceData.transcripts, activeSampleId],
  );

  const loadSample = (sample) => {
    setActiveSampleId(sample.id);
    setTranscript(sample.transcript);
    setAnalysis(null);
    setError("");
  };

  const analyzeTranscript = async () => {
    if (!transcript.trim()) {
      setError("Paste a supervisor transcript before running analysis.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Analysis failed.");
      }

      setAnalysis(data.analysis);
      setResponseMeta({ status: data.status, model: data.model, error: data.error });
    } catch (analysisError) {
      setError(analysisError.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreValue = analysis?.score?.value ?? "—";
  const scoreLabel = analysis?.score?.label ?? "Waiting for analysis";
  const scoreBand = analysis?.score?.band ?? "Layer-aware assessment";

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Trinethra — Supervisor Feedback Analyzer</p>
          <h1 className="hero-title">TRINETHRA _ SUPERVISOR FEEDBACK ANALYZER</h1>
          <p className="subtitle">
            Local Ollama-backed analysis with rubric-guided guardrails, direct evidence quotes, KPI mapping,
            gap detection, and follow-up questions for the psychology intern.
          </p>
        </div>
        <div className="hero-note">
          <strong>Hallucination guardrails</strong>
          <ul>
            <li>Uses only transcript evidence</li>
            <li>Separates execution from systems building</li>
            <li>Keeps the 6 vs 7 boundary explicit</li>
          </ul>
        </div>
      </header>

      <main className="grid-layout">
        <section className="panel input-panel">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Input</p>
              <h2>Transcript and sample picker</h2>
            </div>
            <button className="secondary-button" onClick={analyzeTranscript} disabled={loading}>
              {loading ? "Running..." : "Run Analysis"}
            </button>
          </div>

          <div className="sample-row">
            {referenceData.transcripts.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className={`sample-chip ${sample.id === activeSampleId ? "active" : ""}`}
                onClick={() => loadSample(sample)}
              >
                <span>{sample.fellow.name}</span>
                <small>{sample.company.name}</small>
              </button>
            ))}
          </div>

          {activeSample && (
            <div className="sample-meta">
              <div>
                <span className="meta-label">Placement</span>
                <p>{activeSample.fellow.placement}</p>
              </div>
              <div>
                <span className="meta-label">Target KPIs</span>
                <p>{activeSample.fellow.targetKpis.join(", ")}</p>
              </div>
            </div>
          )}

          <label className="field-label" htmlFor="transcript-input">
            Supervisor transcript
          </label>
          <textarea
            id="transcript-input"
            className="transcript-input"
            rows={18}
            placeholder="Paste the supervisor transcript here..."
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
          />

          <div className="action-row">
            <button type="button" className="primary-button" onClick={analyzeTranscript} disabled={loading}>
              {loading ? "Analyzing with guardrails..." : "Run Analysis"}
            </button>
            <p className="helper-text">
              This button sends the transcript to the backend, which tries Ollama first and falls back to guardrails if needed.
            </p>
          </div>

          {error && <div className="alert error">{error}</div>}

          <div className="reference-box">
            <p className="section-kicker">Live status</p>
            <p>
              Backend: <strong>{serviceStatus.state}</strong> | Ollama model: <strong>{serviceStatus.model}</strong>
            </p>
            <p>Sample transcripts loaded: <strong>{serviceStatus.sampleCount}</strong></p>
          </div>

          <div className="reference-box">
            <p className="section-kicker">What the output means</p>
            <p>
              <strong>Evidence</strong> = exact lines from the transcript.
            </p>
            <p>
              <strong>KPI mapping</strong> = business results like Quality or TAT.
            </p>
            <p>
              <strong>Gap analysis</strong> = what the supervisor did not mention.
            </p>
            <p>
              <strong>Follow-up questions</strong> = what the intern should ask next.
            </p>
            <p>
              <strong>6 vs 7</strong> is the key scoring line: reliable execution versus independent problem finding.
            </p>
          </div>
        </section>

        <section className="panel output-panel">
          <div className="panel-header">
            <div>
              <p className="section-kicker">Output</p>
              <h2 className="output-title">Structured draft for review</h2>
              <p className="helper-text">The analysis is a draft, not a final verdict.</p>
            </div>
            <div className="status-badges">
              <span className="badge">{responseMeta?.status ?? "idle"}</span>
              <span className="badge muted">{responseMeta?.model ?? "ollama"}</span>
            </div>
          </div>

          <div className="score-card">
            <div>
              <span className="score-value">{scoreValue}</span>
              <p className="score-label">{scoreLabel}</p>
              <p className="score-band">{scoreBand}</p>
            </div>
            <div className="justification">
              <p className="section-kicker">Justification</p>
              <p>{analysis?.score?.justification ?? "Run the analysis to generate a rubric-based justification."}</p>
              <p className="confidence">
                Confidence: <strong>{analysis?.score?.confidence ?? "—"}</strong>
              </p>
            </div>
          </div>

          <ContentSection title="Extracted evidence" emptyText="Evidence quotes will appear here.">
            <p className="section-help">These are short transcript quotes that support the score.</p>
            {analysis?.evidence?.map((item, index) => (
              <article key={`${item.quote}-${index}`} className="evidence-item">
                <div className="evidence-topline">
                  <span className={`signal signal-${item.signal}`}>{item.signal}</span>
                  <span className="dimension-tag">{item.dimension}</span>
                </div>
                <blockquote>“{item.quote}”</blockquote>
                <p>{item.interpretation}</p>
              </article>
            ))}
          </ContentSection>

          <ContentSection title="KPI mapping" emptyText="KPI links will appear here.">
            <p className="section-help">This links the Fellow’s work to business outcomes in the rubric.</p>
            <div className="chip-grid">
              {analysis?.kpiMapping?.map((item, index) => (
                <article className="kpi-card" key={`${item.kpi}-${index}`}>
                  <strong>{item.kpi}</strong>
                  <span className="mini-tag">{item.systemOrPersonal}</span>
                  <p>{item.evidence}</p>
                </article>
              ))}
            </div>
          </ContentSection>

          <div className="two-column">
            <ContentSection title="Gap analysis" emptyText="Missing dimensions will be listed here.">
              <p className="section-help">These are the missing questions the next call should cover.</p>
              {analysis?.gaps?.map((gap, index) => (
                <div className="list-card" key={`${gap.dimension}-${index}`}>
                  <strong>{gap.dimension}</strong>
                  <p>{gap.detail}</p>
                </div>
              ))}
            </ContentSection>

            <ContentSection title="Follow-up questions" emptyText="Questions for the next call will appear here.">
              <p className="section-help">Ask these to fill the gaps and avoid guessing.</p>
              {analysis?.followUpQuestions?.map((question, index) => (
                <div className="list-card" key={`${question.question}-${index}`}>
                  <strong>{question.question}</strong>
                  <p>
                    <span className="mini-tag">{question.targetGap}</span> {question.lookingFor}
                  </p>
                </div>
              ))}
            </ContentSection>
          </div>

          <ContentSection title="Guardrail notes" emptyText="Review notes from the analysis engine appear here.">
            <p className="section-help">These notes explain when the app used fallback logic instead of live Ollama output.</p>
            {analysis?.reviewNotes?.map((note, index) => (
              <div className="list-card compact" key={`${note}-${index}`}>
                <p>{note}</p>
              </div>
            ))}
          </ContentSection>
        </section>
      </main>
    </div>
  );
}

function ContentSection({ title, emptyText, children }) {
  const hasChildren = Boolean(children) && (Array.isArray(children) ? children.length > 0 : true);

  return (
    <section className="content-section">
      <div className="section-heading">
        <h3>{title}</h3>
      </div>
      {hasChildren ? children : <p className="empty-state">{emptyText}</p>}
    </section>
  );
}

export default App;
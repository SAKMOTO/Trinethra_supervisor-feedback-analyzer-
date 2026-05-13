# Trinethra Supervisor Feedback Analyzer

Local web app for DeepThought's Trinethra assignment. It analyzes a pasted supervisor transcript with Ollama, extracts evidence, suggests a rubric score, maps business KPIs, highlights missing dimensions, and generates follow-up questions for an intern to review.

## Setup

### 1) Install dependencies

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm install

cd ../frontend
npm install
```

### 2) Start Ollama locally

Install Ollama from `https://ollama.com`, then pull a small model:

```bash
ollama pull llama3.2
```

### 3) Start the backend

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm start
```

### 4) Start the frontend

```bash
cd /Users/fathimabegum/trinethra-analyzer/frontend
npm run dev
```

Open the Vite URL in your browser. The frontend talks to `http://127.0.0.1:5050` by default. Set `VITE_API_BASE_URL` if you want a different backend URL.

## Ollama model

I used `llama3.2` as the default because it is small, fast enough for a local demo, and works well for structured extraction when paired with a strict JSON prompt.

## Architecture

- `frontend/` is a React + Vite UI for transcript input and review.
- `backend/` is an Express API that loads `context.md`, `rubric.json`, and `sample-transcripts.json`.
- The backend sends the transcript to Ollama at `http://localhost:11434/api/generate`.
- If Ollama is unavailable or returns invalid JSON, the backend falls back to deterministic guardrails so the UI still has something safe to display.

On macOS, port `5000` may be reserved by a system service, so this app defaults to `5050` for the backend.

## Design challenges tackled

### Structured output reliability

The backend asks Ollama for JSON only, parses the response, retries with a repair prompt if needed, and falls back to a deterministic analyzer if the response is still unusable.

### Showing uncertainty

The UI labels the output as a draft, shows confidence, and keeps the score alongside the explanation instead of presenting it as a final verdict.

### Evidence linking

Every evidence card displays a verbatim quote, a signal tag, and an interpretation so the intern can trace why a score was suggested.

### Gap detection

The app explicitly lists missing dimensions like systems building, KPI impact, and change management, then turns those gaps into follow-up questions.

## What I would improve next

- Add side-by-side transcript highlighting so clicking an evidence quote scrolls to the source passage.
- Add a richer comparison view for multiple transcripts and past calls.
- Save review edits so an intern can finalize an assessment draft after the model suggests it.

## Validation

Run the backend self-test to sanity-check the heuristic fallback on the sample transcripts:

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm run self-test
```<<<<<<< HEAD
# Trinethra Supervisor Feedback Analyzer

Local web app for DeepThought's Trinethra assignment. It analyzes a pasted supervisor transcript with Ollama, extracts evidence, suggests a rubric score, maps business KPIs, highlights missing dimensions, and generates follow-up questions for an intern to review.

## Setup

### 1) Install dependencies

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm install

cd ../frontend
npm install
```

### 2) Start Ollama locally

Install Ollama from `https://ollama.com`, then pull a small model:

```bash
ollama pull llama3.2
```

### 3) Start the backend

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm start
```

### 4) Start the frontend

```bash
cd /Users/fathimabegum/trinethra-analyzer/frontend
npm run dev
```

Open the Vite URL in your browser. The frontend talks to `http://127.0.0.1:5050` by default. Set `VITE_API_BASE_URL` if you want a different backend URL.

## Ollama model

I used `llama3.2` as the default because it is small, fast enough for a local demo, and works well for structured extraction when paired with a strict JSON prompt.

## Architecture


On macOS, port `5000` may be reserved by a system service, so this app defaults to `5050` for the backend.

## Design challenges tackled

### Structured output reliability

The backend asks Ollama for JSON only, parses the response, retries with a repair prompt if needed, and falls back to a deterministic analyzer if the response is still unusable.

### Showing uncertainty

The UI labels the output as a draft, shows confidence, and keeps the score alongside the explanation instead of presenting it as a final verdict.

### Evidence linking

Every evidence card displays a verbatim quote, a signal tag, and an interpretation so the intern can trace why a score was suggested.
# Trinethra Supervisor Feedback Analyzer

Local web app for DeepThought's Trinethra assignment. It analyzes a pasted supervisor transcript with Ollama, extracts evidence, suggests a rubric score, maps business KPIs, highlights missing dimensions, and generates follow-up questions for an intern to review.

## Setup

### 1) Install dependencies

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm install

cd ../frontend
npm install
```

### 2) Start Ollama locally

Install Ollama from `https://ollama.com`, then pull a small model:

```bash
ollama pull llama3.2
```

### 3) Start the backend

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm start
```

### 4) Start the frontend

```bash
cd /Users/fathimabegum/trinethra-analyzer/frontend
npm run dev
```

Open the Vite URL in your browser. The frontend talks to `http://127.0.0.1:5050` by default. Set `VITE_API_BASE_URL` if you want a different backend URL.

## Ollama model

I used `llama3.2` as the default because it is small, fast enough for a local demo, and works well for structured extraction when paired with a strict JSON prompt.

## Architecture

- `frontend/` is a React + Vite UI for transcript input and review.
- `backend/` is an Express API that loads `context.md`, `rubric.json`, and `sample-transcripts.json`.
- The backend sends the transcript to Ollama at `http://localhost:11434/api/generate`.
- If Ollama is unavailable or returns invalid JSON, the backend falls back to deterministic guardrails so the UI still has something safe to display.

On macOS, port `5000` may be reserved by a system service, so this app defaults to `5050` for the backend.

## Design challenges tackled

### Structured output reliability

The backend asks Ollama for JSON only, parses the response, retries with a repair prompt if needed, and falls back to a deterministic analyzer if the response is still unusable.

### Showing uncertainty

The UI labels the output as a draft, shows confidence, and keeps the score alongside the explanation instead of presenting it as a final verdict.

### Evidence linking

Every evidence card displays a verbatim quote, a signal tag, and an interpretation so the intern can trace why a score was suggested.

### Gap detection

The app explicitly lists missing dimensions like systems building, KPI impact, and change management, then turns those gaps into follow-up questions.

## What I would improve next

- Add side-by-side transcript highlighting so clicking an evidence quote scrolls to the source passage.
- Add a richer comparison view for multiple transcripts and past calls.
- Save review edits so an intern can finalize an assessment draft after the model suggests it.

## Validation

Run the backend self-test to sanity-check the heuristic fallback on the sample transcripts:

```bash
cd /Users/fathimabegum/trinethra-analyzer/backend
npm run self-test
```

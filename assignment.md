# Assignment: Supervisor Feedback Analyzer — Trinethra Module
### DeepThought — Software Developer Internship

---

## Your Files

| # | File | What it is | When to read |
|---|------|-----------|-------------|
| 1 | **assignment.md** (this file) | The assignment brief — what to build, how to submit, how you'll be graded | Read first |
| 2 | **context.md** | Domain knowledge — the Fellow model, rubric logic, KPIs, supervisor biases, sample transcript scoring notes | Read before writing your LLM prompt |
| 3 | **rubric.json** | The 1-10 rubric as structured data — use this in your code and/or LLM prompt | Load into your app |
| 4 | **sample-transcripts.json** | 3 supervisor transcripts with metadata — use these to test your app | Load into your app |

---

## About DeepThought

DeepThought is a B2B company that helps Indian manufacturing MSMEs become better-run organizations. We do this through two things:

1. **Execution consulting** — we place operating Fellows inside client organizations who work alongside the founder's team to structure daily operations, build accountability systems, and diagnose execution gaps.

2. **PDGMS** — an AI-powered SaaS platform that structures daily work so that leadership gets diagnostic data as a byproduct.

Our Fellows are placed inside factories, warehouses, and offices of small manufacturing companies. The Fellow works there full-time for 3-6 months, building systems that make the company run better after the Fellow leaves.

---

## About This Role

Every software developer at DeepThought is a **Full-Stack Builder**. That means:

- **Product thinking** — you scope the problem, decide what's MVP, and make tradeoffs without someone handing you a spec
- **Frontend** — you build the UI that real users interact with
- **Backend** — you build the API, handle data flow, and integrate external services
- **UX** — you make it usable by non-technical people (factory managers, HR, interns)
- **AI/LLM integration** — you connect local models (Ollama) to production workflows
- **Self-management** — you break the work into commits, track your own progress, and ship incrementally

This assignment tests all six. You are given a real problem from our product, a real rubric, and real supervisor transcripts. Build a working tool that solves the problem.

---

## The Problem

### What is Trinethra?

Trinethra ("Three Eyes" in Sanskrit) is the management and supervisory layer of PDGMS. It's the view that DeepThought's internal team — TPMs (Technical Program Managers), HR, and psychology interns — uses to monitor Fellow performance across all client engagements.

One of Trinethra's key workflows is **processing supervisor feedback**. Here's how it currently works:

1. A DT psychology intern calls the client supervisor (factory owner, COO, production head)
2. The supervisor talks for 10-15 minutes about how the Fellow is doing
3. The intern manually reads the transcript, extracts behavioral evidence, maps it to a 1-10 rubric, identifies gaps, and writes an assessment

**This manual process takes 45-60 minutes per transcript.** We want to bring it down to 10 minutes by building an AI-assisted analysis tool.

### What You're Building

A web application that takes a supervisor transcript as input, runs it through a local LLM (Ollama), and produces a structured analysis that a psychology intern can review, edit, and finalize.

**The tool does NOT replace the intern's judgment.** It produces a draft analysis that the intern reviews — accepting, rejecting, or editing each finding. The AI suggests; the human decides.

---

## Important: Read This Before Starting

> **We use AI tools extensively at DeepThought — Claude, Gemini, GitHub Copilot, and others. We encourage you to use them too for coding assistance. But there is a difference between using AI to help you write code and submitting a project you don't understand.**
>
> **This is why we require a screen recording of the app running locally with Ollama, and a separate video walkthrough of your codebase.** You need to demonstrate the app working and explain the decisions you made. These cannot be faked.
>
> **If you skip either video, your application will not be reviewed.**

---

## The Assignment Has Two Parts

| Part | What | Submit Where |
|------|------|-------------|
| **Part A** | Working app: GitHub repo with code, README, and commit history | Share GitHub link on Internshala |
| **Part B** | Two videos: (1) app demo, (2) code walkthrough | Send directly in the Internshala chat window |

### Part A: The Working App (GitHub)

Build a web app with the following:

**Input:**
- A text area where the user pastes a supervisor transcript
- A "Run Analysis" button

**Processing (backend):**
- Send the transcript to Ollama (any model — Llama 3, Mistral, Phi, Gemma — your choice)
- Extract a structured analysis (see Expected Output below)

**Output (frontend):**
- Display the analysis in a clean, usable interface

**Expected Output — what the analysis must contain:**

1. **Extracted Evidence** — specific quotes from the transcript that reveal behavioral patterns, with each quote tagged as positive, negative, or neutral
2. **Rubric Score** (1-10) — a suggested score with a one-paragraph justification citing the extracted evidence
3. **KPI Mapping** — which of the 8 business KPIs (see `context.md`) the Fellow's work connects to, based on what the supervisor described
4. **Gap Analysis** — which assessment dimensions the transcript did NOT cover (e.g., "no mention of systems building", "no information about how the team responds to the Fellow")
5. **Suggested Follow-up Questions** — 3-5 questions the intern should ask in the next call, each targeting a specific gap

**The rubric, KPI definitions, and sample transcripts are in `context.md`, `rubric.json`, and `sample-transcripts.json`.**

### Technical Requirements

| Requirement | Detail |
|------------|--------|
| **LLM** | Must use Ollama running locally. Any model. No cloud APIs (no OpenAI, no Anthropic, no Google). |
| **Frontend** | Any framework (React, Vue, Svelte, vanilla HTML/JS). Must run in a browser. |
| **Backend** | Any language/framework (Node/Express, Python/FastAPI, Go — your choice). |
| **No deployment required** | Everything runs locally. `README.md` must include setup instructions so we can run it. |
| **Git history** | We will look at your commit history. Incremental commits that show your thinking process. One giant commit = instant rejection. |

### Tech Stack

**For this assignment:** Use whatever you're comfortable with. Any frontend framework, any backend language, any database (or none). We care about the output, not the stack.

**At DeepThought:** If hired, you'd work with our production stack — **Next.js, Tailwind CSS, MongoDB, PostgreSQL, Redis, Prisma**. Familiarity with any of these is a plus but not required for the assignment. We'd rather see a well-built app in a stack you know than a broken app in a stack you're learning for the first time.

### Getting Started with Ollama

Ollama runs LLMs locally on your machine. No API key, no cloud, no cost.

**Setup:**
1. Download from [ollama.com](https://ollama.com) and install
2. Pull a model: `ollama pull llama3.2` (or `mistral`, `phi3`, `gemma` — your choice)
3. Start Ollama (it runs as a background service after install)
4. Test it: `ollama run llama3.2 "Hello"` — if you get a response, you're set

**The API:**

Ollama exposes a local HTTP API at `http://localhost:11434`. Your backend sends POST requests to it.

```bash
# Test from terminal
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "What is 2+2?",
  "stream": false
}'
```

**In Node.js:**
```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    prompt: 'Your prompt here',
    stream: false
  })
});
const data = await response.json();
console.log(data.response); // The model's output
```

**In Python:**
```python
import requests

response = requests.post('http://localhost:11434/api/generate', json={
    'model': 'llama3.2',
    'prompt': 'Your prompt here',
    'stream': False
})
print(response.json()['response'])  # The model's output
```

**Hardware:** You need at least 8 GB RAM. Models like `llama3.2` (3B) and `phi3` (3.8B) run on most laptops. If your machine is slow, use a smaller model — correctness matters more than model size.

---

### What We Don't Care About

- Visual polish (no need for animations, gradients, or fancy styling — clean and functional is enough)
- Authentication, database, deployment
- Mobile responsiveness (desktop-only is fine)
- Comprehensive error handling for edge cases (handle the obvious ones, don't over-engineer)

### What We Care About Deeply

- **Does the LLM produce useful structured output?** This is the core AI challenge. How do you prompt to get consistent, structured responses? How do you handle when the model gives messy output?
- **Is the UI usable by a non-developer?** A psychology intern will use this tool. They don't know what JSON is. The interface must make sense to them.
- **Did you make product decisions?** What did you include, what did you cut, and why? This shows PM thinking.
- **Does it actually run?** We will clone your repo, follow your README, and test it with the sample transcripts.

---

### Part B: Two Videos (Internshala Chat)

**Video 1: App Demo (2-3 min)**
Screen recording of you running the app:
- Start Ollama
- Start the app
- Paste one of the sample transcripts
- Show the analysis output
- Walk through what each section shows

**Video 2: Code Walkthrough (3-5 min)**
Screen recording of you walking through your codebase:
- How is the project structured?
- How does the prompt work? Why did you design it that way?
- What was the hardest technical problem you solved?
- What would you improve with more time?

> **Both videos are mandatory. Applications without them will not be reviewed.**

---

## Evaluation Criteria

1. **LLM integration quality** — Does the prompt produce structured, consistent output? Can it handle different transcript styles (positive, negative, mixed)? How do you parse the response?
2. **Product thinking** — Did you scope an MVP and execute it well? Or did you try to build everything and finish nothing? What tradeoffs did you make?
3. **Frontend usability** — Can a non-technical person (psychology intern) understand and use the interface? Is information hierarchy clear?
4. **Backend architecture** — Is the API clean? Is the code organized? Could another developer read and extend it?
5. **Prompt engineering** — How thoughtful is your prompt design? Did you use the rubric and KPI definitions in the prompt? Did you handle structured output parsing?
6. **Incremental development** — Does the git history show real iterative work? Or is it one dump?

---

## What Your README Must Contain

Your `README.md` is the first thing we read. It should include:

1. **Setup instructions** — step-by-step commands to get the app running (install dependencies, start Ollama, start backend, start frontend). Assume the reader has Node/Python installed but nothing else.
2. **Which Ollama model you used** and why you chose it.
3. **Architecture overview** — one paragraph or a simple diagram: what's the frontend, what's the backend, how do they talk to each other, where does Ollama fit.
4. **Which design challenges you tackled** (pick at least 2 from the list below) and what approach you took.
5. **What you'd improve with more time** — be specific. "Better UI" is vague. "Add a side-by-side view so the intern can see the transcript and analysis together" is specific.

---

## Logistics

- **Time:** You have 48 hours from receiving this assignment.
- **Tools:** Use whatever you want — AI coding assistants, boilerplate generators, component libraries. The videos prove whether you understand what you built.
- **Ollama:** Free, runs locally, no API key needed. Download from [ollama.com](https://ollama.com). We recommend starting with `llama3.2` or `mistral` — small enough to run on most laptops.
- **Questions:** If something is unclear, make a reasonable assumption and state it in your README.

### Submission Checklist

| # | Item | Where |
|---|------|-------|
| 1 | GitHub repo (public) with working code + README with setup instructions | Link on Internshala |
| 2 | Commit history showing incremental development | Same repo |
| 3 | **App demo video (2-3 min)** | **Internshala chat** |
| 4 | **Code walkthrough video (3-5 min)** | **Internshala chat** |

---

## Design Challenges — Pick Your Battles

These are open problems we haven't fully solved. Your app should take a clear position on at least 2. Mention which ones you tackled in your README.

### Challenge 1: One Prompt or Many?

Should you send the entire transcript to the LLM in one big prompt asking for everything (score + evidence + gaps + questions)? Or should you make multiple focused calls — one for evidence extraction, one for scoring, one for gap analysis?

One prompt is simpler but the output quality may suffer. Multiple prompts give better results but are slower and harder to coordinate. What's the right tradeoff for a 10-minute transcript?

### Challenge 2: Structured Output Reliability

LLMs don't always return clean JSON. Sometimes they add commentary, skip fields, or change the format between runs. How do you handle this?

Options: strict JSON mode (if the model supports it), retry on parse failure, regex extraction as fallback, asking the model to validate its own output, or accepting partial results and showing what you got.

### Challenge 3: Evidence Linking

When the tool suggests "Score: 6 — Reliable and Productive," how does the user know which parts of the transcript led to that score? Can you highlight or link the relevant quotes? Can the user click a quote and see why it maps to a particular rubric level?

### Challenge 4: Showing Uncertainty

The LLM might be wrong. The suggested score might be a 6 when it should be a 7. How do you design the UI so the intern treats the output as a draft to review, not a verdict to accept? How do you prevent automation bias (blindly trusting the AI)?

### Challenge 5: Gap Detection

Figuring out what the transcript says is extraction. Figuring out what the transcript *doesn't* say is reasoning about absence — harder for LLMs. How do you detect that the supervisor never mentioned systems building, or never talked about how the team responds to the Fellow?

---

Now open `context.md` for the Fellow model, rubric details, KPI definitions, and sample transcripts. Use `rubric.json` and `sample-transcripts.json` in your code.

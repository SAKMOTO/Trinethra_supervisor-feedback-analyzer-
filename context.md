# Reference Material: Fellow Model, Rubric, KPIs, and Sample Data
### DeepThought — Software Developer Internship

This is the companion document to `assignment.md`. It contains the domain knowledge your tool needs to work correctly — the Fellow model, the rubric, the KPIs, and sample transcripts to test with.

---

## Part 1: The Fellow Model

### Who are DT Fellows?

DT Fellows are early-career professionals (0-3 years experience) placed inside client organizations for 3-6 month engagements. They work on the factory floor alongside the client's team.

### The Two Layers

A Fellow's work has two layers. **Your tool must assess both.**

**Layer 1 — Execution (visible work):**
- Attending meetings, tracking output, following up on delays
- Coordinating between departments
- Handling operational tasks — data entry, vendor calls, report preparation
- Being physically present and responsive

**Layer 2 — Systems building (the actual mandate):**
- Creating SOPs for recurring tasks
- Building trackers, dashboards, or workflows
- Designing accountability structures
- Documenting processes that continue working after the Fellow leaves

**The critical distinction:** Layer 1 is necessary. Layer 2 is the job. A Fellow who only does Layer 1 leaves no lasting value. Your tool should flag when a transcript only shows Layer 1 evidence.

### The Survivability Test

The simplest diagnostic: *If the Fellow left tomorrow, would any system they built continue running?* If yes → systems building. If no → task execution only.

---

## Part 2: The 8 KPIs

Every Fellow placement is tied to business outcomes. Your tool should identify which KPIs the Fellow's work connects to, based on the supervisor's description.

| KPI | What it measures | Supervisor might say... |
|-----|-----------------|----------------------|
| **Lead Generation** | New customers identified/contacted | "She finds new schools to partner with" |
| **Lead Conversion** | Leads that become paying customers | "He closed 3 new accounts this month" |
| **Upselling** | Selling more to existing customers | "Our existing clients are ordering bigger quantities" |
| **Cross-selling** | Selling additional products to existing customers | "We started supplying packaging along with the core product" |
| **NPS** | Customer satisfaction | "Our retailers are much happier now", "Fewer complaints" |
| **PAT** | Profitability | "We reduced waste", "Costs came down" |
| **TAT** | Turnaround time | "Dispatch is faster now", "We don't miss deadlines anymore" |
| **Quality** | Defect/rejection/complaint rates | "Rejection rate dropped", "Fewer customer complaints" |

Supervisors never use the term "KPI." They describe outcomes in plain language. Your LLM prompt needs to map their words to these categories.

---

## Part 3: The Rubric (1-10 Scale)

The rubric is provided as structured data in `rubric.json`. Here's the logic your tool needs to understand:

### Need Attention (1-3)

| Score | Label | What to look for in transcript |
|-------|-------|-------------------------------|
| 1 | Not Interested | Supervisor describes disengagement, no effort |
| 2 | Lacks Discipline | "Works only when I tell him", no self-initiative |
| 3 | Motivated but Directionless | Enthusiasm + confusion: "She wants to help but doesn't know where to start" |

### Productivity (4-6)

| Score | Label | What to look for in transcript |
|-------|-------|-------------------------------|
| 4 | Careless and Inconsistent | Output exists but quality varies: "Sometimes good, sometimes sloppy" |
| 5 | Consistent Performer | Reliable task execution: "Does what I ask, meets standards" |
| 6 | Reliable and Productive | High trust: "I give him a task and forget about it. It gets done." |

### Performance (7-10)

| Score | Label | What to look for in transcript |
|-------|-------|-------------------------------|
| 7 | Problem Identifier | Spots patterns: "She noticed our rejection rate goes up on Mondays" |
| 8 | Problem Solver | Identifies AND fixes: "He built a tracking system for dispatch delays" |
| 9 | Innovative and Experimental | Builds new tools/processes, tests approaches, creates MVPs |
| 10 | Exceptional Performer | Everything at 9, flawlessly, and others learn from their work |

### The Critical Boundary: 6 vs 7

This is the most important scoring decision. Your tool must distinguish between:
- **Score 6:** "He does everything I give him. Very reliable." → executes tasks defined by someone else
- **Score 7:** "She noticed that our rejection rate goes up on Mondays and started tracking why." → identifies problems the supervisor hadn't asked about

The difference is **initiative direction.** A 6 takes initiative within assigned scope. A 7 expands the scope.

---

## Part 4: Assessment Dimensions (for Gap Analysis)

When your tool analyzes a transcript, it should check whether the supervisor covered these 4 dimensions. If a dimension is missing, it's a gap that needs follow-up questions.

### Dimension 1: Driving Execution
Does the transcript mention whether the Fellow gets things done on time, follows up without reminders, initiates work?

### Dimension 2: Systems Building
Does the transcript mention anything the Fellow created — a tracker, a process, an SOP, a template — that others use or that would survive the Fellow's departure?

### Dimension 3: KPI Impact
Does the transcript connect the Fellow's work to any measurable business outcome (speed, quality, costs, customer satisfaction)?

### Dimension 4: Change Management
Does the transcript describe how the Fellow interacts with the floor team — getting people to adopt new processes, handling resistance, building rapport with workers who are older and more experienced?

**Change management is where most Fellows struggle.** A 23-year-old asking a 45-year-old machine operator to fill out a new checklist — the power dynamic is inverted and there's no formal authority. Your tool should flag when the transcript has no change management evidence.

---

## Part 5: Supervisor Biases Your Tool Should Account For

Supervisors are honest but biased. Your tool (or at minimum, your prompt) should be aware of:

1. **Helpfulness bias** — "She handles all my calls now" sounds like an 8, but it's actually a 5-6 (task absorption, not systems building)
2. **Presence bias** — "He's always on the floor" gets rated higher than "She spends time on the computer building trackers"
3. **Halo/horn effect** — one big story (positive or negative) coloring the entire assessment
4. **Recency bias** — supervisor remembers the last 2 weeks, not the full tenure

**In your prompt engineering:** You might instruct the model to identify when a supervisor's praise describes task absorption vs. systems building, or when a negative comment might actually indicate systems work the supervisor doesn't recognize.

---

## Part 6: Sample Transcripts

Three sample transcripts are provided in `sample-transcripts.json`. Here's what each one tests:

### Transcript 1: Karthik at Veerabhadra Auto Components
**The trap:** Supervisor is positive and warm. "Very sincere boy. Always on the floor." The evidence mostly shows Layer 1 (task execution) with one genuine Layer 2 signal (cycle time study). A lazy tool gives an 8. A good tool recognizes this is a 6 with one signal toward 7.

### Transcript 2: Meena at Lakshmi Textiles
**The trap:** Supervisor is critical. "Spends too much time on her laptop." But the evidence shows genuine systems building (order tracker, rejection analysis, dispatch risk alert). The supervisor's presence bias is masking real Layer 2 work. A lazy tool gives a 4. A good tool recognizes this is a 7 with a change management gap.

### Transcript 3: Anil at Prabhat Foods
**The trap:** Supervisor is glowing. "My right hand. Don't know how we managed before him." But the evidence shows Anil is absorbing the founder's workload — running her meetings, handling her calls, doing another manager's planning. If he leaves, everything collapses. A lazy tool gives a 9. A good tool recognizes this is a 5-6 with a dependency problem.

**Use these transcripts to test your tool. If your tool scores all three correctly (within ±1), your prompt engineering is strong. If it gives the "lazy" scores described above, iterate on your prompt.**

---

## Part 7: Expected Output Format

Your API should return something like this structure (adapt as needed):

```json
{
  "score": {
    "value": 6,
    "label": "Reliable and Productive",
    "band": "Productivity",
    "justification": "The supervisor describes strong task execution...",
    "confidence": "medium"
  },
  "evidence": [
    {
      "quote": "He helps me with production tracking. Every evening he updates it and sends it to me on WhatsApp.",
      "signal": "positive",
      "dimension": "execution",
      "interpretation": "Reliable daily task completion, but the tracking sheet is maintained by the Fellow personally — not a self-sustaining system."
    },
    {
      "quote": "He doesn't really push back. If I tell him to do something, he does it.",
      "signal": "negative",
      "dimension": "execution",
      "interpretation": "Supervisor explicitly flags lack of independent initiative — a ceiling on scoring above 6."
    }
  ],
  "kpiMapping": [
    {
      "kpi": "Quality",
      "evidence": "Handles quality complaints from Tier 1 customers",
      "systemOrPersonal": "personal"
    },
    {
      "kpi": "TAT",
      "evidence": "Cycle time study for drum brake line saved 10 min per batch",
      "systemOrPersonal": "system"
    }
  ],
  "gaps": [
    {
      "dimension": "systems_building",
      "detail": "Transcript mentions one system (production tracking sheet) but it's personally maintained by the Fellow. No evidence of systems that run without the Fellow."
    },
    {
      "dimension": "change_management",
      "detail": "No mention of how the Fellow handles resistance or gets the floor team to adopt new processes."
    }
  ],
  "followUpQuestions": [
    {
      "question": "If Karthik took a week off, what would stop working? What would keep running on its own?",
      "targetGap": "systems_building",
      "lookingFor": "Whether any of Karthik's work is self-sustaining or everything depends on his personal presence."
    },
    {
      "question": "Has Karthik ever come to you with a problem you hadn't noticed, and a suggestion for how to fix it?",
      "targetGap": "problem_identification",
      "lookingFor": "Evidence of Level 7 behavior — independent problem identification beyond assigned tasks."
    },
    {
      "question": "How do the floor workers respond when Karthik asks them to do something differently?",
      "targetGap": "change_management",
      "lookingFor": "Whether the Fellow can get experienced workers to adopt new processes."
    }
  ]
}
```

**This is a reference, not a rigid spec.** You can adapt the format — add fields, rename things, restructure. What matters is that all 5 sections (score, evidence, KPI mapping, gaps, follow-up questions) are present and grounded in the actual transcript.

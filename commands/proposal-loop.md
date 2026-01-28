# /proposal-loop Command

Orchestrate the full proposal creation loop with 6 phases, 5 quality gates, and 7 skills. Produces a polished, evidence-backed proposal document.

## Purpose

This command is the **single entry point** for the proposal loop. It handles everything: state detection, context gathering, insight cultivation, priority analysis, content validation, and final assembly — with enforced human-in-the-loop gates at every transition.

**The flow you want:** Receive a proposal request, invoke `/proposal-loop`, provide context, and walk through all gates to a finished proposal.

## Usage

```
/proposal-loop [--resume] [--phase=PHASE] [--skip-gate=GATE]
```

**Options:**
- `--resume`: Resume from existing proposal-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | VALIDATE | DOCUMENT | COMPLETE)
- `--skip-gate=GATE`: Skip a gate with documented reason (requires explicit justification)

## Execution Flow

### Step 1: State Detection

```
if proposal-state.json exists:
  → Show current phase, pending gates, progress
  → Ask: "Resume from {phase}? [Y/n]"
else:
  → Fresh start, initialize state
```

### Step 2: Initialize Loop State

Create `proposal-state.json`:

```json
{
  "loop": "proposal-loop",
  "version": "2.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "context-gate": { "status": "pending", "required": true },
    "synthesis-gate": { "status": "pending", "required": true },
    "priorities-gate": { "status": "pending", "required": true },
    "quality-gate": { "status": "pending", "required": true },
    "proposal-gate": { "status": "pending", "required": true }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["context-ingestion", "requirements"], "deliverables": [] },
    "SCAFFOLD": { "status": "pending", "skills": ["context-cultivation"], "deliverables": [] },
    "IMPLEMENT": { "status": "pending", "skills": ["priority-matrix"], "deliverables": [] },
    "VALIDATE": { "status": "pending", "skills": ["content-analysis"], "deliverables": [] },
    "DOCUMENT": { "status": "pending", "skills": ["proposal-builder"], "deliverables": [] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"], "deliverables": [] }
  },
  "metrics": {
    "sources_processed": 0,
    "requirements_extracted": 0,
    "patterns_identified": 0,
    "gaps_found": 0,
    "priorities_ranked": 0,
    "claims_with_evidence": 0,
    "quality_score": 0
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

Run through all 6 phases with 5 gates:

```
INIT ─[context-gate]─► SCAFFOLD ─[synthesis-gate]─► IMPLEMENT ─[priorities-gate]─► VALIDATE ─[quality-gate]─► DOCUMENT ─[proposal-gate]─► COMPLETE
  │                       │                           │                               │                          │                           │
  ▼                       ▼                           ▼                               ▼                          ▼                           ▼
context-ingestion     context-cultivation        priority-matrix                content-analysis          proposal-builder            retrospective
requirements              │                           │                               │                          │                           │
  │                       ▼                           ▼                               ▼                          ▼                           ▼
  ▼                   CULTIVATED-CONTEXT.md      PRIORITIES.md                 CONTENT-ANALYSIS.md        PROPOSAL.md                RETROSPECTIVE.md
CONTEXT-SOURCES.md    PATTERNS.md                MATRIX.md
RAW-CONTEXT.md
REQUIREMENTS.md
```

---

## Phase Details

### Phase 1: INIT — Context Ingestion & Requirements

**Skills:** `context-ingestion`, `requirements`

**Load skills from MCP:**
```
mcp__skills-library__get_skill(name: "context-ingestion", includeReferences: true)
mcp__skills-library__get_skill(name: "requirements", includeReferences: true)
```

**Process:**
1. Ask the user what proposal they are creating
2. Gather all context sources (documents, URLs, stakeholder inputs, constraints)
3. Execute `context-ingestion` — discover, classify, extract, and verify sources
4. Execute `requirements` — clarify proposal requirements, scope, and acceptance criteria
5. Produce deliverables: CONTEXT-SOURCES.md, RAW-CONTEXT.md, REQUIREMENTS.md

**Update state:**
```json
{ "phase": "INIT", "status": "in-progress" }
→ After completion:
{ "phase": "INIT", "status": "completed", "deliverables": ["CONTEXT-SOURCES.md", "RAW-CONTEXT.md", "REQUIREMENTS.md"] }
```

**Gate: context-gate**

```
═══════════════════════════════════════════════════════════════
║  CONTEXT & REQUIREMENTS REVIEW                [HUMAN]      ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 CONTEXT-SOURCES.md — Source registry and coverage     ║
║    📄 RAW-CONTEXT.md — Extracted context by source          ║
║    📄 REQUIREMENTS.md — Proposal requirements and scope     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Source coverage: {N}% (threshold: 80%)                 ║
║    ✓ Requirements documented with acceptance criteria       ║
║    ✓ Constraints identified                                 ║
║    ✓ Stakeholder inputs captured                            ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to SCAFFOLD          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

---

### Phase 2: SCAFFOLD — Context Cultivation

**Skill:** `context-cultivation`

**Load skill from MCP:**
```
mcp__skills-library__get_skill(name: "context-cultivation", includeReferences: true)
```

**Process:**
1. Read CONTEXT-SOURCES.md, RAW-CONTEXT.md, REQUIREMENTS.md from INIT phase
2. Execute `context-cultivation` — synthesize themes, identify patterns, find contradictions, map gaps
3. Produce deliverables: CULTIVATED-CONTEXT.md, PATTERNS.md

**Gate: synthesis-gate**

```
═══════════════════════════════════════════════════════════════
║  INSIGHTS & PATTERNS REVIEW                   [HUMAN]      ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 CULTIVATED-CONTEXT.md — Synthesized themes            ║
║    📄 PATTERNS.md — Identified patterns and gaps            ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Themes identified: {N}                                 ║
║    ✓ Patterns documented: {N}                               ║
║    ✓ Contradictions resolved: {N}                           ║
║    ✓ Gaps mapped: {N}                                       ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to IMPLEMENT         ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

---

### Phase 3: IMPLEMENT — Priority Matrix

**Skill:** `priority-matrix`

**Load skill from MCP:**
```
mcp__skills-library__get_skill(name: "priority-matrix", includeReferences: true)
```

**Process:**
1. Read CULTIVATED-CONTEXT.md, PATTERNS.md, REQUIREMENTS.md
2. Execute `priority-matrix` — score opportunities using weighted criteria, rank by value
3. Produce deliverables: PRIORITIES.md, MATRIX.md

**Gate: priorities-gate**

```
═══════════════════════════════════════════════════════════════
║  PRIORITIES & STRATEGY REVIEW                  [HUMAN]      ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 PRIORITIES.md — Ranked recommendations                ║
║    📄 MATRIX.md — Scoring methodology                       ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Items prioritized: {N}                                 ║
║    ✓ Scoring methodology: documented                        ║
║    ✓ Top priorities feasible within constraints             ║
║    ✓ Stakeholder alignment: {score}%                        ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

---

### Phase 4: VALIDATE — Content Analysis

**Skill:** `content-analysis`

**Load skill from MCP:**
```
mcp__skills-library__get_skill(name: "content-analysis", includeReferences: true)
```

**Process:**
1. Read all deliverables from prior phases
2. Execute `content-analysis` — validate content quality, check for gaps, verify evidence backing
3. Assess proposal readiness before final assembly
4. Produce deliverable: CONTENT-ANALYSIS.md

**Gate: quality-gate**

```
═══════════════════════════════════════════════════════════════
║  CONTENT QUALITY REVIEW                        [HUMAN]      ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 CONTENT-ANALYSIS.md — Quality validation results      ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Evidence coverage: {N}% of claims backed               ║
║    ✓ Argument coherence: {score}                            ║
║    ✓ Requirements traceability: {N}% addressed              ║
║    ⚠ Gaps needing attention: {N}                            ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to DOCUMENT          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

---

### Phase 5: DOCUMENT — Proposal Assembly

**Skill:** `proposal-builder`

**Load skill from MCP:**
```
mcp__skills-library__get_skill(name: "proposal-builder", includeReferences: true)
```

**Process:**
1. Read PRIORITIES.md, CONTENT-ANALYSIS.md, REQUIREMENTS.md, CULTIVATED-CONTEXT.md
2. Execute `proposal-builder` — assemble final proposal with executive summary, problem statement, solution narrative, scope, timeline, pricing, differentiation, and call-to-action
3. Produce deliverable: PROPOSAL.md

**Gate: proposal-gate**

```
═══════════════════════════════════════════════════════════════
║  FINAL PROPOSAL REVIEW                         [HUMAN]      ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 PROPOSAL.md — Final proposal document                 ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Executive summary: present                             ║
║    ✓ Problem/solution narrative: coherent                   ║
║    ✓ Scope and timeline: defined                            ║
║    ✓ All claims evidenced: {N}/{total}                      ║
║    ✓ Call-to-action: compelling                             ║
║    ✓ Word count: ~{N} words                                 ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, finalize                      ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

---

### Phase 6: COMPLETE — Retrospective

**Skill:** `retrospective`

**Load skill from MCP:**
```
mcp__skills-library__get_skill(name: "retrospective", includeReferences: true)
```

**Process:**
1. Review full execution: phases completed, gates passed, metrics collected
2. Execute `retrospective` — analyze what went well, what didn't, capture improvements
3. Produce deliverable: RETROSPECTIVE.md
4. Capture any skill improvements via `improve:` feedback

**Completion Summary:**

```
╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   PROPOSAL LOOP COMPLETE                                            ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT         Context gathered                                   ║
║   ✓ SCAFFOLD     Insights synthesized                               ║
║   ✓ IMPLEMENT    Priorities ranked                                   ║
║   ✓ VALIDATE     Content validated                                   ║
║   ✓ DOCUMENT     Proposal assembled                                  ║
║   ✓ COMPLETE     Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Context & Requirements Review [HUMAN]                            ║
║   ✓ Insights & Patterns Review [HUMAN]                               ║
║   ✓ Priorities & Strategy Review [HUMAN]                             ║
║   ✓ Content Quality Review [HUMAN]                                   ║
║   ✓ Final Proposal Review [HUMAN]                                    ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 CONTEXT-SOURCES.md      Source registry and coverage            ║
║   📄 RAW-CONTEXT.md          Extracted context by source             ║
║   📄 REQUIREMENTS.md         Proposal requirements and scope         ║
║   📄 CULTIVATED-CONTEXT.md   Synthesized themes and insights         ║
║   📄 PATTERNS.md             Identified patterns                     ║
║   📄 PRIORITIES.md           Ranked recommendations                  ║
║   📄 MATRIX.md               Scoring methodology                     ║
║   📄 CONTENT-ANALYSIS.md     Quality validation results              ║
║   📄 PROPOSAL.md             Final proposal document                 ║
║   📄 RETROSPECTIVE.md        Process learning and improvements       ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

Update state:
```json
{ "phase": "COMPLETE", "status": "completed" }
```

---

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate |
| `changes: [feedback]` | Request changes at current gate |
| `pause` | Stop after current phase |
| `skip-gate [gate] --reason "[why]"` | Skip a gate with explicit reason |
| `show [deliverable]` | Display a deliverable file |
| `show metrics` | Display current metrics |
| `improve: [feedback]` | Capture improvement for skills library |

## Skill Invocation Sequence

For each skill, load the full SKILL.md and references from the skills library:

```
Phase 1 — INIT:
  1. context-ingestion
     ├── Read: SKILL.md + references (source-evaluation.md, extraction-patterns.md, etc.)
     └── Output: CONTEXT-SOURCES.md, RAW-CONTEXT.md
  2. requirements
     ├── Read: SKILL.md + references (requirements-template.md, acceptance-criteria.md, etc.)
     └── Output: REQUIREMENTS.md

Phase 2 — SCAFFOLD:
  3. context-cultivation
     ├── Read: SKILL.md + references (qualitative-analysis.md, synthesis-framework.md, etc.)
     └── Output: CULTIVATED-CONTEXT.md, PATTERNS.md

Phase 3 — IMPLEMENT:
  4. priority-matrix
     ├── Read: SKILL.md + references (prioritization-frameworks.md, scoring-calibration.md, etc.)
     └── Output: PRIORITIES.md, MATRIX.md

Phase 4 — VALIDATE:
  5. content-analysis
     ├── Read: SKILL.md + references (content-taxonomy.md, confidence-scoring.md, etc.)
     └── Output: CONTENT-ANALYSIS.md

Phase 5 — DOCUMENT:
  6. proposal-builder
     ├── Read: SKILL.md + references (proposal-templates.md, persuasion-principles.md, etc.)
     └── Output: PROPOSAL.md

Phase 6 — COMPLETE:
  7. retrospective
     ├── Read: SKILL.md + references (retrospective-templates.md, improvement-pipeline.md, etc.)
     └── Output: RETROSPECTIVE.md
```

## Resuming a Session

```
User: /proposal-loop

Proposal Loop: Found existing proposal state.

  Loop: proposal-loop v2.0.0
  Phase: IMPLEMENT (in progress)

  Completed:
    ✓ INIT       — 3 deliverables
    ✓ SCAFFOLD   — 2 deliverables

  Gates:
    ✓ context-gate    (passed)
    ✓ synthesis-gate   (passed)
    ○ priorities-gate  (pending)
    ○ quality-gate     (pending)
    ○ proposal-gate    (pending)

  Metrics:
    Sources: 12 | Requirements: 8 | Patterns: 6

  Resume? [Y/n]:
```

## Example Session

```
User: /proposal-loop

Proposal Loop v2.0.0: Scanning directory...

  No existing loop state found.

  What proposal are you creating?

User: A strategic partnership proposal for integrating our analytics
      platform with Acme Corp's data infrastructure.

Proposal Loop: Initializing...

  ═══════════════════════════════════════════════════════
  ║  READY — Proposal Loop v2.0.0                      ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 6                                          ║
  ║  Gates: context → synthesis → priorities             ║
  ║         → quality → proposal                        ║
  ║  All gates: [HUMAN]                                 ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════
  INIT                          [1/6]
══════════════════════════════════════

  ┌─ context-ingestion
  │  Discovering context sources...
  │  Classifying 8 documents, 3 URLs, 2 stakeholder inputs...
  │  Extracting and verifying sources...
  │
  │  Output:
  │    📄 CONTEXT-SOURCES.md — 13 sources, 92% coverage
  │    📄 RAW-CONTEXT.md — Extracted context by source
  └─ ✓ context-ingestion complete

  ┌─ requirements
  │  Clarifying proposal requirements...
  │  Defining scope and acceptance criteria...
  │
  │  Output:
  │    📄 REQUIREMENTS.md — 8 requirements, 5 acceptance criteria
  └─ ✓ requirements complete

  ✓ INIT complete (2 skills, 3 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  CONTEXT & REQUIREMENTS REVIEW                [HUMAN]      ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 CONTEXT-SOURCES.md — Source registry and coverage     ║
  ║    📄 RAW-CONTEXT.md — Extracted context by source          ║
  ║    📄 REQUIREMENTS.md — Proposal requirements and scope     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Source coverage: 92% (threshold: 80%)                  ║
  ║    ✓ Requirements documented with acceptance criteria       ║
  ║    ✓ Constraints identified                                 ║
  ║    ✓ Stakeholder inputs captured                            ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SCAFFOLD          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: context-gate ✓

══════════════════════════════════════
  SCAFFOLD                      [2/6]
══════════════════════════════════════

  ┌─ context-cultivation
  │  Reading CONTEXT-SOURCES.md, RAW-CONTEXT.md, REQUIREMENTS.md...
  │  Synthesizing themes and identifying patterns...
  │  Mapping contradictions and gaps...
  │
  │  Output:
  │    📄 CULTIVATED-CONTEXT.md — 5 themes, 3 insights
  │    📄 PATTERNS.md — 6 patterns, 2 gaps identified
  └─ ✓ context-cultivation complete

  ✓ SCAFFOLD complete (1 skill, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  INSIGHTS & PATTERNS REVIEW                   [HUMAN]      ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 CULTIVATED-CONTEXT.md — Synthesized themes            ║
  ║    📄 PATTERNS.md — Identified patterns and gaps            ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Themes identified: 5                                   ║
  ║    ✓ Patterns documented: 6                                 ║
  ║    ✓ Contradictions resolved: 1                             ║
  ║    ✓ Gaps mapped: 2                                         ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPLEMENT         ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: synthesis-gate ✓

══════════════════════════════════════
  IMPLEMENT                     [3/6]
══════════════════════════════════════

  ┌─ priority-matrix
  │  Reading CULTIVATED-CONTEXT.md, PATTERNS.md, REQUIREMENTS.md...
  │  Scoring opportunities using weighted criteria...
  │  Ranking by strategic value...
  │
  │  Output:
  │    📄 PRIORITIES.md — 12 items ranked, top 5 highlighted
  │    📄 MATRIX.md — Scoring methodology documented
  └─ ✓ priority-matrix complete

  ✓ IMPLEMENT complete (1 skill, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  PRIORITIES & STRATEGY REVIEW                  [HUMAN]      ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 PRIORITIES.md — Ranked recommendations                ║
  ║    📄 MATRIX.md — Scoring methodology                       ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Items prioritized: 12                                  ║
  ║    ✓ Scoring methodology: documented                        ║
  ║    ✓ Top priorities feasible within constraints             ║
  ║    ✓ Stakeholder alignment: 87%                             ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to VALIDATE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: priorities-gate ✓

══════════════════════════════════════
  VALIDATE                      [4/6]
══════════════════════════════════════

  ┌─ content-analysis
  │  Reading all prior deliverables...
  │  Validating evidence backing for claims...
  │  Checking argument coherence and traceability...
  │
  │  Output:
  │    📄 CONTENT-ANALYSIS.md — 94% evidence coverage, 2 gaps flagged
  └─ ✓ content-analysis complete

  ✓ VALIDATE complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  CONTENT QUALITY REVIEW                        [HUMAN]      ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 CONTENT-ANALYSIS.md — Quality validation results      ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Evidence coverage: 94% of claims backed                ║
  ║    ✓ Argument coherence: strong                             ║
  ║    ✓ Requirements traceability: 100% addressed              ║
  ║    ⚠ Gaps needing attention: 2                              ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to DOCUMENT          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: quality-gate ✓

══════════════════════════════════════
  DOCUMENT                      [5/6]
══════════════════════════════════════

  ┌─ proposal-builder
  │  Reading PRIORITIES.md, CONTENT-ANALYSIS.md, REQUIREMENTS.md...
  │  Assembling executive summary...
  │  Building solution narrative and scope...
  │  Compiling timeline, pricing, and differentiation...
  │
  │  Output:
  │    📄 PROPOSAL.md — Final proposal (~4,200 words)
  └─ ✓ proposal-builder complete

  ✓ DOCUMENT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  FINAL PROPOSAL REVIEW                         [HUMAN]      ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 PROPOSAL.md — Final proposal document                 ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Executive summary: present                             ║
  ║    ✓ Problem/solution narrative: coherent                   ║
  ║    ✓ Scope and timeline: defined                            ║
  ║    ✓ All claims evidenced: 47/50                            ║
  ║    ✓ Call-to-action: compelling                             ║
  ║    ✓ Word count: ~4,200 words                               ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, finalize                      ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: proposal-gate ✓

══════════════════════════════════════
  COMPLETE                      [6/6]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing full execution across 6 phases...
  │  Analyzing gate feedback and metrics...
  │  Capturing improvements for skills library...
  │
  │  Output:
  │    📄 RETROSPECTIVE.md — Process learning and improvements
  └─ ✓ retrospective complete

  ✓ COMPLETE complete (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   PROPOSAL LOOP COMPLETE                                            ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT         Context gathered                                   ║
║   ✓ SCAFFOLD     Insights synthesized                               ║
║   ✓ IMPLEMENT    Priorities ranked                                   ║
║   ✓ VALIDATE     Content validated                                   ║
║   ✓ DOCUMENT     Proposal assembled                                  ║
║   ✓ COMPLETE     Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Context & Requirements Review [HUMAN]                            ║
║   ✓ Insights & Patterns Review [HUMAN]                               ║
║   ✓ Priorities & Strategy Review [HUMAN]                             ║
║   ✓ Content Quality Review [HUMAN]                                   ║
║   ✓ Final Proposal Review [HUMAN]                                    ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 CONTEXT-SOURCES.md      Source registry and coverage            ║
║   📄 RAW-CONTEXT.md          Extracted context by source             ║
║   📄 REQUIREMENTS.md         Proposal requirements and scope         ║
║   📄 CULTIVATED-CONTEXT.md   Synthesized themes and insights         ║
║   📄 PATTERNS.md             Identified patterns                     ║
║   📄 PRIORITIES.md           Ranked recommendations                  ║
║   📄 MATRIX.md               Scoring methodology                     ║
║   📄 CONTENT-ANALYSIS.md     Quality validation results              ║
║   📄 PROPOSAL.md             Final proposal document                 ║
║   📄 RETROSPECTIVE.md        Process learning and improvements       ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## State Files

| File | Purpose |
|------|---------|
| `proposal-state.json` | Current phase, gate status, metrics |
| `CONTEXT-SOURCES.md` | Source registry and coverage |
| `RAW-CONTEXT.md` | Extracted context by source |
| `REQUIREMENTS.md` | Proposal requirements and scope |
| `CULTIVATED-CONTEXT.md` | Synthesized themes |
| `PATTERNS.md` | Identified patterns |
| `PRIORITIES.md` | Priority rankings |
| `MATRIX.md` | Scoring methodology |
| `CONTENT-ANALYSIS.md` | Quality validation results |
| `PROPOSAL.md` | Final proposal |
| `RETROSPECTIVE.md` | Process retrospective |

## Continuous Improvement

Use `improve: [feedback]` during the loop to enhance skills:

```
improve: The quality gate should check for competitive differentiation
```

This feeds back into the skills library for future improvement.

---

## References

This command uses the **skills-library MCP server** for skill definitions:

```
mcp__skills-library__get_skill(name: "context-ingestion", includeReferences: true)
mcp__skills-library__get_skill(name: "requirements", includeReferences: true)
mcp__skills-library__get_skill(name: "context-cultivation", includeReferences: true)
mcp__skills-library__get_skill(name: "priority-matrix", includeReferences: true)
mcp__skills-library__get_skill(name: "content-analysis", includeReferences: true)
mcp__skills-library__get_skill(name: "proposal-builder", includeReferences: true)
mcp__skills-library__get_skill(name: "retrospective", includeReferences: true)
```

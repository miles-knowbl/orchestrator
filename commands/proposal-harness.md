# /proposal-harness Command

Orchestrate the full proposal creation loop with 6 phases, 5 quality gates, and 7 skills. Produces a polished, evidence-backed proposal document.

## Purpose

This command is the **single entry point** for the proposal loop. It handles everything: state detection, context gathering, insight cultivation, priority analysis, content validation, and final assembly — with enforced human-in-the-loop gates at every transition.

**The flow you want:** Receive a proposal request, invoke `/proposal-harness`, provide context, and walk through all gates to a finished proposal.

## Usage

```
/proposal-harness [--resume] [--phase=PHASE] [--skip-gate=GATE]
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
║  CONTEXT & REQUIREMENTS REVIEW                             ║
║                                                             ║
║  Validating context coverage and requirements clarity...    ║
║                                                             ║
║  ✓ Source coverage: {N}% (threshold: 80%)                   ║
║  ✓ Requirements documented with acceptance criteria         ║
║  ✓ Constraints identified                                   ║
║  ✓ Stakeholder inputs captured                              ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to SCAFFOLD           ║
║    changes: [x] — Request changes                           ║
║    show [file]  — Display deliverable                       ║
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
║  INSIGHTS & PATTERNS REVIEW                                ║
║                                                             ║
║  ✓ Themes identified: {N}                                   ║
║  ✓ Patterns documented: {N}                                 ║
║  ✓ Contradictions resolved: {N}                             ║
║  ✓ Gaps mapped: {N}                                         ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to IMPLEMENT          ║
║    changes: [x] — Request changes                           ║
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
║  PRIORITIES & STRATEGY REVIEW                              ║
║                                                             ║
║  ✓ Items prioritized: {N}                                   ║
║  ✓ Scoring methodology: documented                          ║
║  ✓ Top priorities feasible within constraints               ║
║  ✓ Stakeholder alignment: {score}%                          ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to VALIDATE           ║
║    changes: [x] — Adjust priorities                         ║
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
║  CONTENT QUALITY REVIEW                                    ║
║                                                             ║
║  ✓ Evidence coverage: {N}% of claims backed                ║
║  ✓ Argument coherence: {score}                              ║
║  ✓ Requirements traceability: {N}% addressed                ║
║  ⚠ Gaps needing attention: {N}                              ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to DOCUMENT           ║
║    changes: [x] — Address quality issues                    ║
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
║  FINAL PROPOSAL REVIEW                                     ║
║                                                             ║
║  ✓ Executive summary: present                               ║
║  ✓ Problem/solution narrative: coherent                     ║
║  ✓ Scope and timeline: defined                              ║
║  ✓ All claims evidenced: {N}/{total}                        ║
║  ✓ Call-to-action: compelling                               ║
║  ✓ Word count: ~{N} words                                   ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, finalize                       ║
║    changes: [x] — Request edits                             ║
║    show PROPOSAL.md — Review full document                  ║
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
║   PROPOSAL LOOP COMPLETE                                           ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                           ║
║   ──────                                                           ║
║   ✓ INIT        Context gathered, requirements clarified           ║
║   ✓ SCAFFOLD    Insights cultivated, patterns identified           ║
║   ✓ IMPLEMENT   Priorities scored and ranked                       ║
║   ✓ VALIDATE    Content quality verified                           ║
║   ✓ DOCUMENT    Proposal assembled                                 ║
║   ✓ COMPLETE    Retrospective captured                             ║
║                                                                     ║
║   GATES PASSED                                                     ║
║   ────────────                                                     ║
║   ✓ Context & Requirements Review                                  ║
║   ✓ Insights & Patterns Review                                     ║
║   ✓ Priorities & Strategy Review                                   ║
║   ✓ Content Quality Review                                         ║
║   ✓ Final Proposal Review                                          ║
║                                                                     ║
║   DELIVERABLES                                                     ║
║   ────────────                                                     ║
║   📄 CONTEXT-SOURCES.md      Source registry and coverage          ║
║   📄 RAW-CONTEXT.md          Extracted context by source           ║
║   📄 REQUIREMENTS.md         Proposal requirements and scope       ║
║   📄 CULTIVATED-CONTEXT.md   Synthesized themes and insights       ║
║   📄 PATTERNS.md             Identified patterns                   ║
║   📄 PRIORITIES.md           Ranked recommendations                ║
║   📄 MATRIX.md               Scoring methodology                   ║
║   📄 CONTENT-ANALYSIS.md     Quality validation results            ║
║   📄 PROPOSAL.md             Final proposal document               ║
║   📄 RETROSPECTIVE.md        Process learning and improvements     ║
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
User: /proposal-harness

Proposal Harness: Found existing proposal state.

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

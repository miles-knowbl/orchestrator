# /transpose-loop Command

**Extract an existing architecture, map it to a new tech stack, and produce a production-ready feature spec.**

## Purpose

This command is the **single entry point** for architecture transposition. It handles everything: reverse-engineering a source system's architecture, mapping each concept to a target tech stack, and compiling a full feature spec ready for `/engineering-loop`.

**The flow you want:** point at a source system, name your target stack, say `go`, and get a FEATURESPEC.md that faithfully transposes the architecture.

Works for:
- **Full system transposition** --- rebuild an existing system in a completely different stack
- **Selective porting** --- extract specific subsystems and transpose them
- **Stack evaluation** --- test whether a target stack can express a given architecture
- **Spec generation from reference** --- use an existing system as the blueprint for a new build

## Usage

```
/transpose-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing transpose-state.json
- `--phase=PHASE`: Start from specific phase (EXTRACT | MAP | SPEC | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if transpose-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, identify source and target
```

### Step 2: Initialize State

Create `transpose-state.json`:

```json
{
  "loop": "transpose-loop",
  "version": "2.0.0",
  "phase": "EXTRACT",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "target-project",
    "module": null
  },

  "gates": {
    "arch-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "map-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "spec-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "EXTRACT": { "status": "pending", "skills": ["architecture-extractor"] },
    "MAP": { "status": "pending", "skills": ["stack-analyzer", "architect"] },
    "SPEC": { "status": "pending", "skills": ["spec"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
EXTRACT ──────────► MAP ──────────► SPEC ──────────► COMPLETE
    │                  │                │
    │ [arch-gate]      │ [map-gate]     │ [spec-gate]
    │  human           │  human         │  human
    ▼                  ▼                ▼
architecture-      stack-analyzer     spec            retrospective
extractor          architect
    │                  │                │
    ▼                  ▼                ▼
ARCHITECTURE.md    STACK-MAP.md     FEATURESPEC.md
                   ADRs
```

**5 skills across 4 phases, 3 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `arch-gate` | EXTRACT | human | User confirms extracted architecture is accurate | ARCHITECTURE.md |
| `map-gate` | MAP | human | User confirms stack mapping and ADRs are sound | STACK-MAP.md, ADRs |
| `spec-gate` | SPEC | human | User confirms feature spec is complete | FEATURESPEC.md |

**Gate presentation (arch-gate):**
```
═══════════════════════════════════════════════════════════════
║  ARCHITECTURE GATE                             [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 ARCHITECTURE.md — Extracted source architecture       ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Components: 12 extracted                               ║
║    ✓ Data flows: 8 traced                                   ║
║    ✓ API surfaces: 5 documented                             ║
║    ✓ Confidence: 9 High, 2 Medium, 1 Low                   ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Architecture is accurate, continue to MAP║
║    changes: ...  — Request corrections                      ║
║    show architecture — Display ARCHITECTURE.md              ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (map-gate):**
```
═══════════════════════════════════════════════════════════════
║  MAPPING GATE                                  [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 STACK-MAP.md — Concept-to-stack mapping               ║
║    📄 docs/adr/*.md — Architecture Decision Records         ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Concepts mapped: 18                                    ║
║    ✓ Confidence: 14 High, 3 Medium, 1 Low                  ║
║    ✓ Gaps identified: 2 (with library recommendations)      ║
║    ✓ ADRs created: 3                                        ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Mapping is sound, continue to SPEC       ║
║    changes: ...  — Request corrections                      ║
║    show stack-map — Display STACK-MAP.md                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (spec-gate):**
```
═══════════════════════════════════════════════════════════════
║  SPEC GATE                                     [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 FEATURESPEC.md — Full 18-section feature spec         ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Sections: 18 complete                                  ║
║    ✓ Architecture coverage: 100%                            ║
║    ✓ Stack mapping integrated                               ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Spec is complete, continue to COMPLETE   ║
║    changes: ...  — Request corrections                      ║
║    show spec     — Display FEATURESPEC.md                   ║
═══════════════════════════════════════════════════════════════
```

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `transpose-state.json` | Current phase, gate status, progress |
| `ARCHITECTURE.md` | Extracted source architecture |
| `STACK-MAP.md` | Concept-to-stack mapping with gaps and risks |
| `docs/adr/*.md` | Architecture Decision Records for key mapping decisions |
| `FEATURESPEC.md` | Production-ready feature specification |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /transpose-loop

Transpose Loop v1.0.0: Starting architecture transposition...

  No existing transpose state found.

  ═══════════════════════════════════════════════════════════════
  ║  READY — Transpose Loop v1.0.0                             ║
  ║                                                             ║
  ║  Phase: EXTRACT                                             ║
  ║  Phases: 4                                                  ║
  ║  Gates: arch [HUMAN] → map [HUMAN] → spec [HUMAN]          ║
  ║                                                             ║
  ║  I need two things:                                         ║
  ║    1. Source: codebase, docs, or description of the system  ║
  ║    2. Target: the tech stack to transpose into              ║
  ║                                                             ║
  ║  Say 'go' to begin.                                         ║
  ═══════════════════════════════════════════════════════════════

User: Source is the Express + Sequelize + PostgreSQL API in ~/projects/old-api.
      Target stack: Next.js 14 App Router + Prisma + PostgreSQL + tRPC.

Transpose Loop: Starting EXTRACT phase...

══════════════════════════════════════
  EXTRACT                        [1/4]
══════════════════════════════════════

  ┌─ architecture-extractor
  │  Surveying source material...
  │  Mapping components...
  │  Tracing data flows...
  │  Extracting data model...
  │  Identifying interfaces...
  │
  │  Output:
  │    📄 ARCHITECTURE.md
  │      12 components (3 services, 5 modules, 4 external)
  │      8 data flows traced
  │      24 entities extracted
  │      5 API surfaces (REST)
  │      Confidence: 9 High, 2 Medium, 1 Low
  └─ ✓ architecture-extractor complete

  ✓ EXTRACT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  ARCHITECTURE GATE                             [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 ARCHITECTURE.md — Extracted source architecture       ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Components: 12 extracted                               ║
  ║    ✓ Data flows: 8 traced                                   ║
  ║    ✓ API surfaces: 5 documented                             ║
  ║    ✓ Confidence: 9 High, 2 Medium, 1 Low                   ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Architecture is accurate, continue to MAP║
  ║    changes: ...  — Request corrections                      ║
  ║    show architecture — Display ARCHITECTURE.md              ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: arch-gate

Transpose Loop: Starting MAP phase...

══════════════════════════════════════
  MAP                            [2/4]
══════════════════════════════════════

  ┌─ stack-analyzer
  │  Reading: ARCHITECTURE.md
  │  Inventorying target stack (Next.js + Prisma + tRPC)...
  │  Mapping 18 architectural concepts...
  │  Identifying gaps and library recommendations...
  │
  │  Output:
  │    📄 STACK-MAP.md — 18 concepts mapped (14 High, 3 Medium, 1 Low)
  └─ ✓ stack-analyzer complete

  ┌─ architect
  │  Reading: ARCHITECTURE.md, STACK-MAP.md
  │  Reviewing mapping decisions...
  │  Creating ADRs for key decisions...
  │
  │  Output:
  │    📄 ADR-001: Replace REST with tRPC
  │    📄 ADR-002: Server Components for data fetching
  │    📄 ADR-003: Inngest for background job replacement
  └─ ✓ architect complete

  ✓ MAP complete (2 skills, 4 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  MAPPING GATE                                  [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 STACK-MAP.md — Concept-to-stack mapping               ║
  ║    📄 docs/adr/*.md — Architecture Decision Records         ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Concepts mapped: 18                                    ║
  ║    ✓ Confidence: 14 High, 3 Medium, 1 Low                  ║
  ║    ✓ Gaps identified: 2 (with library recommendations)      ║
  ║    ✓ ADRs created: 3                                        ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Mapping is sound, continue to SPEC       ║
  ║    changes: ...  — Request corrections                      ║
  ║    show stack-map — Display STACK-MAP.md                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: map-gate

Transpose Loop: Starting SPEC phase...

══════════════════════════════════════
  SPEC                           [3/4]
══════════════════════════════════════

  ┌─ spec
  │  Reading: ARCHITECTURE.md, STACK-MAP.md, docs/adr/*.md
  │  Compiling full 18-section feature specification...
  │
  │  Output:
  │    📄 FEATURESPEC.md — 18 sections, 1500+ lines
  └─ ✓ spec complete

  ✓ SPEC complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  SPEC GATE                                     [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 FEATURESPEC.md — Full 18-section feature spec         ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Sections: 18 complete                                  ║
  ║    ✓ Architecture coverage: 100%                            ║
  ║    ✓ Stack mapping integrated                               ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Spec is complete, continue to COMPLETE   ║
  ║    changes: ...  — Request corrections                      ║
  ║    show spec     — Display FEATURESPEC.md                   ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: spec-gate

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   TRANSPOSE LOOP COMPLETE                                           ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ EXTRACT     Architecture reverse-engineered                     ║
║   ✓ MAP         Stack mapping and ADRs produced                     ║
║   ✓ SPEC        Feature specification compiled                      ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Architecture Extraction Review [HUMAN]                          ║
║   ✓ Stack Mapping Review [HUMAN]                                    ║
║   ✓ Feature Spec Review [HUMAN]                                     ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 ARCHITECTURE.md      Extracted source architecture             ║
║   📄 STACK-MAP.md         Concept-to-stack mapping                  ║
║   📄 docs/adr/*.md        Architecture Decision Records             ║
║   📄 FEATURESPEC.md       Production-ready feature spec             ║
║   📄 RETROSPECTIVE.md     Loop learnings                            ║
║                                                                     ║
║   Ready for: /engineering-loop with FEATURESPEC.md                  ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

## Resuming a Session

```
User: /transpose-loop --resume

Transpose Loop v1.0.0: Resuming...

  Found transpose-state.json
  ┌──────────┬──────────────┬─────────┐
  │ Phase    │ Status       │ Skills  │
  ├──────────┼──────────────┼─────────┤
  │ EXTRACT  │ ✓ complete   │ 1/1     │
  │ MAP      │ ▶ active     │ 1/2     │
  │ SPEC     │ ○ pending    │ 0/1     │
  │ COMPLETE │ ○ pending    │ 0/1     │
  └──────────┴──────────────┴─────────┘

  Resume from MAP phase? [Y/n]

User: y

Transpose Loop: Resuming MAP phase...
  [2/2] architect -> Creating ADRs...
```

## Skill Invocation Sequence

```
1. architecture-extractor (EXTRACT)
   +-- Survey source material
   +-- Map components, trace flows, extract model
   +-- Output: ARCHITECTURE.md

--- arch-gate (human) ---

2. stack-analyzer (MAP)
   +-- Read: ARCHITECTURE.md
   +-- Inventory target stack
   +-- Map concepts, translate idioms, find gaps
   +-- Output: STACK-MAP.md

3. architect (MAP)
   +-- Read: ARCHITECTURE.md
   +-- Read: STACK-MAP.md
   +-- Read: references/adr-template.md
   +-- Create ADRs for key mapping decisions
   +-- Output: docs/adr/ADR-*.md

--- map-gate (human) ---

4. spec (SPEC)
   +-- Read: ARCHITECTURE.md
   +-- Read: STACK-MAP.md
   +-- Read: docs/adr/*.md
   +-- Read: references/18-section-template.md
   +-- Compile full 18-section FeatureSpec
   +-- Output: FEATURESPEC.md (1500+ lines)

--- spec-gate (human) ---

5. retrospective (COMPLETE)
   +-- Review transposition quality
   +-- Note confidence gaps and risk areas
   +-- Output: RETROSPECTIVE.md
```

## References

This command uses the **skills-library MCP server** for skill definitions:

```
mcp__skills-library__get_skill(name: "architecture-extractor", includeReferences: true)
mcp__skills-library__get_skill(name: "stack-analyzer", includeReferences: true)
mcp__skills-library__get_skill(name: "architect", includeReferences: true)
mcp__skills-library__get_skill(name: "spec", includeReferences: true)
mcp__skills-library__get_skill(name: "retrospective", includeReferences: true)
```

---

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past EXTRACT:

1. **Probe relentlessly** — Ask 5-10+ questions about source and target stacks
2. **Surface assumptions** — "I'm assuming you want a 1:1 mapping — correct?"
3. **Gather constraints** — What parts must change? What should stay similar? Priorities?
4. **Don't stop early** — Keep asking until the transposition goals are clear

At every phase transition and gate, pause to ask:
- "Does this architecture extraction look complete?"
- "Any concepts I'm mapping incorrectly?"
- "Ready to proceed with this approach?"

See `commands/_shared/clarification-protocol.md` for detailed guidance.

---

## Context Hierarchy

This loop operates within the **Organization → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All systems across workspace | `~/.claude/DREAM-STATE.md` |
| **System** | This repository/application | `{repo}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{repo}/{path}/.claude/DREAM-STATE.md` or inline |

### Context Loading (Automatic on Init)

When this loop initializes, it automatically loads:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Org-wide vision, active systems, master checklist

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

3. Recent Runs (auto-injected via query_runs)
   └── Last 3-5 relevant runs for context continuity

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

---

## On Completion

When this loop reaches COMPLETE phase and finishes:

### 1. Archive Run

**Location:** `~/.claude/runs/{year-month}/{system}-transpose-loop-{timestamp}.json`

**Contents:** Full state + summary including:
- Source and target stacks
- Architecture components mapped
- Gates passed
- Feature spec produced

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note transposition completed

### 3. Prune Active State

**Delete:** `transpose-state.json` from working directory.

**Result:** Next `/transpose-loop` invocation starts fresh with context gathering.

### 4. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

See `commands/_shared/leverage-protocol.md` for full details.

**Output:**
```
══════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /{loop} → {target}
  Value Score: X.X/10

  Say 'go' to start, or specify a different loop.
══════════════════════════════════════════════════════════════
```

### 5. Completion Message

```
══════════════════════════════════════════════════════════════
  Run archived: ~/.claude/runs/2025-01/targetproject-transpose-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```

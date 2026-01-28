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
  "version": "1.0.0",
  "phase": "EXTRACT",
  "status": "active",
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
===============================================================
|  ARCHITECTURE GATE                                           |
|                                                              |
|  ARCHITECTURE.md ready for review:                           |
|    12 components extracted                                   |
|    8 data flows traced                                       |
|    5 API surfaces documented                                 |
|    Confidence: 9 High, 2 Medium, 1 Low                      |
|                                                              |
|  Commands:                                                   |
|    approved      - Architecture is accurate, continue to MAP |
|    changes: ...  - Request corrections                       |
|    show architecture - Display ARCHITECTURE.md               |
===============================================================
```

**Gate presentation (map-gate):**
```
===============================================================
|  MAPPING GATE                                                |
|                                                              |
|  STACK-MAP.md and ADRs ready for review:                     |
|    18 concepts mapped                                        |
|    14 High confidence, 3 Medium, 1 Low                       |
|    2 gaps identified with library recommendations            |
|    3 ADRs created for key decisions                          |
|                                                              |
|  Commands:                                                   |
|    approved      - Mapping is sound, continue to SPEC        |
|    changes: ...  - Request corrections                       |
|    show stack-map - Display STACK-MAP.md                     |
===============================================================
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

  ===============================================================
  |  READY - Transpose Loop v1.0.0                              |
  |                                                              |
  |  Phase: EXTRACT                                              |
  |  Phases: 4                                                   |
  |  Gates: arch(human) -> map(human) -> spec(human)             |
  |                                                              |
  |  I need two things:                                          |
  |    1. Source: codebase, docs, or description of the system   |
  |    2. Target: the tech stack to transpose into               |
  |                                                              |
  |  Say 'go' to begin.                                          |
  ===============================================================

User: Source is the Express + Sequelize + PostgreSQL API in ~/projects/old-api.
      Target stack: Next.js 14 App Router + Prisma + PostgreSQL + tRPC.

Transpose Loop: Starting EXTRACT phase...

  [1/1] architecture-extractor -> Analyzing ~/projects/old-api...
        Surveying source material...
        Mapping components...
        Tracing data flows...
        Extracting data model...
        Identifying interfaces...

        ARCHITECTURE.md
          12 components (3 services, 5 modules, 4 external)
          8 data flows traced
          24 entities extracted
          5 API surfaces (REST)
          Confidence: 9 High, 2 Medium, 1 Low

  EXTRACT phase complete

  ===============================================================
  |  ARCHITECTURE GATE                                           |
  |                                                              |
  |  ARCHITECTURE.md ready for review.                           |
  |  Say 'approved' to continue to MAP.                          |
  ===============================================================

User: approved

  Gate passed: arch-gate

Transpose Loop: Starting MAP phase...

  [1/2] stack-analyzer -> Mapping architecture to Next.js + Prisma + tRPC...
        18 concepts mapped (14 High, 3 Medium, 1 Low)
        2 gaps: background jobs, WebSocket notifications
        Recommended: Inngest for jobs, SSE for notifications

        STACK-MAP.md

  [2/2] architect -> Reviewing mapping, creating ADRs...
        ADR-001: Replace REST with tRPC
        ADR-002: Server Components for data fetching
        ADR-003: Inngest for background job replacement

  MAP phase complete

  ===============================================================
  |  MAPPING GATE                                                |
  |                                                              |
  |  STACK-MAP.md + 3 ADRs ready for review.                    |
  |  Say 'approved' to continue to SPEC.                         |
  ===============================================================

User: approved

  Gate passed: map-gate

Transpose Loop: Starting SPEC phase...

  [1/1] spec -> Compiling FEATURESPEC.md from architecture + stack map...
        ...
```

## Resuming a Session

```
User: /transpose-loop --resume

Transpose Loop v1.0.0: Resuming...

  Found transpose-state.json
  +----------+--------------+---------+
  | Phase    | Status       | Skills  |
  +----------+--------------+---------+
  | EXTRACT  | complete     | 1/1     |
  | MAP      | active       | 1/2     |
  | SPEC     | pending      | 0/1     |
  | COMPLETE | pending      | 0/1     |
  +----------+--------------+---------+

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

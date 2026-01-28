# /meta-loop Command

**Single entry point for loop authorship.** Design, compose, and publish new loops and skills — the loop that creates loops.

## Purpose

This command orchestrates the creation of new loops and skills for the skills library: gathering requirements for the new loop, composing its phases and gates, designing individual skills, generating slash command documentation, and publishing. It is self-referential by design — it follows the same patterns it creates.

**The flow you want:** describe the loop you need, say `go`, and the meta-loop produces a fully documented, publishable loop definition.

## Usage

```
/meta-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing meta-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | DOCUMENT | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if meta-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather loop requirements
```

### Step 2: Initialize State

Create `meta-state.json`:

```json
{
  "loop": "meta-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "design-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "composition-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "SCAFFOLD": { "status": "pending", "skills": ["loop-composer", "skill-design"] },
    "DOCUMENT": { "status": "pending", "skills": ["loop-to-slash-command", "document"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► DOCUMENT ──────────► COMPLETE
  │                │
  │ [design-gate]  │ [composition-gate]
  │  human         │  human
  ▼                ▼
requirements     loop-composer        loop-to-slash-command   retrospective
                 skill-design         document
```

**5 skills across 4 phases, 2 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `design-gate` | INIT | human | User says `approved` | LOOP-REQUIREMENTS.md |
| `composition-gate` | SCAFFOLD | human | User says `approved` | loop.json, SKILL.md files |

**Gate presentation (composition-gate):**
```
═══════════════════════════════════════════════════════════════
║  COMPOSITION GATE                                           ║
║                                                             ║
║  Loop composition ready for review:                         ║
║    loop.json — 6 phases, 3 gates, 8 skills                 ║
║    4 SKILL.md files generated                               ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to DOCUMENT           ║
║    changes: ... — Adjust loop composition                   ║
║    show loop    — Display loop.json                         ║
║    show skills  — List generated SKILL.md files             ║
═══════════════════════════════════════════════════════════════
```

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current human gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `meta-state.json` | Current phase, gate status, progress |
| `LOOP-REQUIREMENTS.md` | Requirements for the new loop |
| `loop.json` | Loop definition (phases, gates, skills) |
| `skills/*/SKILL.md` | Individual skill definitions |
| `commands/{name}-loop.md` | Generated slash command file |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /meta-loop

Meta Loop v1.0.0: Starting loop authorship...

  No existing meta state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Meta Loop v1.0.0                          ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 4                                          ║
  ║  Gates: design → composition                        ║
  ║  Output: a new loop definition + slash command      ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Meta Loop: Starting INIT phase...

  [1/1] requirements → What loop do you need?

User: I need a data pipeline loop that ingests, transforms, validates,
      and publishes datasets with quality checks.

  [1/1] requirements → Structuring loop requirements...
        ✓ LOOP-REQUIREMENTS.md
          Domain: data engineering
          Phases: 6 (INIT → INGEST → TRANSFORM → VALIDATE → PUBLISH → COMPLETE)
          Gates: 3 (schema-gate, quality-gate, publish-gate)

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  DESIGN GATE                                        ║
  ║                                                     ║
  ║  LOOP-REQUIREMENTS.md ready for review.             ║
  ║  Proposed: 6 phases, 3 gates, 7 skills.             ║
  ║                                                     ║
  ║  Say 'approved' to continue to SCAFFOLD.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: design-gate ✓

Meta Loop: Starting SCAFFOLD phase...
  [1/2] loop-composer → Composing loop definition...
  ...
```

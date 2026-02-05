# Dream Loop

Define what "done" looks like. This is the **upstream artifact** that all other work flows from.

## Why Dream State First?

**Dream State and Roadmap are the foundation of the orchestrator workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    UPSTREAM ARTIFACTS                        │
│                                                              │
│   DREAM-STATE.md      →      ROADMAP.md                      │
│   "What does done       "What modules/steps                  │
│    look like?"           get us there?"                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    DOWNSTREAM LOOPS                          │
│                                                              │
│   /engineering-loop    /bugfix-loop    /distribution-loop    │
│   /audit-loop          /proposal-loop  /learning-loop        │
│                                                              │
│   All reference dream state for context and direction        │
└─────────────────────────────────────────────────────────────┘
```

**Without a dream state:**
- Engineering loops lack direction
- Progress can't be measured
- Roadmap has no target to decompose toward

**Run this loop FIRST when:**
- Starting a new project
- Joining an existing project without dream state
- Major pivot or scope change

## Overview

The dream loop guides you through structured discovery to create DREAM-STATE.md and ROADMAP.md files. It answers:

1. Where are we at? (current state)
2. Where are we going? (dream state vision)
3. What does done mean? (completion criteria)
4. How do we get there? (roadmap modules)

## Phases

```
DISCOVER → DEFINE → VALIDATE → COMPLETE
              │
              └── [definition-gate] human approval
```

| Phase | Skills | Purpose |
|-------|--------|---------|
| DISCOVER | observe, context-ingestion | Situational awareness, tier detection |
| DEFINE | define-dream-state | Vision, decomposition, completion criteria |
| VALIDATE | skill-verifier | Review and validate structure |
| COMPLETE | retrospective | Finalize, update parent, archive |

## Tiers

| Tier | Location | Decomposes Into |
|------|----------|-----------------|
| Organization | `~/workspaces/{org}/.claude/DREAM-STATE.md` | Domains |
| Domain | `~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md` | Systems |
| System | `{project}/.claude/DREAM-STATE.md` | Modules |
| Module | `{project}/src/{module}/DREAM-STATE.md` | Functions |

## Usage

```bash
/dream-loop                    # Auto-detect tier
/dream-loop --tier=organization # Explicit tier
/dream-loop --resume           # Resume existing
```

## Deliverables

**Primary (upstream artifacts):**
- `DREAM-STATE.md` at tier-appropriate location — defines completion vision
- `ROADMAP.md` or `.claude/roadmap.json` — decomposes vision into modules

**Secondary:**
- Parent tier update (if creating child)
- Run archive on completion

These artifacts are **read by all downstream loops** to provide context, measure progress, and guide decisions.

## Version

1.0.0 — Initial release with four-tier support

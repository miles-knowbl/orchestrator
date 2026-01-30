# Dream Loop

Define what "done" looks like at any tier of the hierarchy.

## Overview

The dream loop guides you through structured discovery to create DREAM-STATE.md files for organizations, domains, systems, or modules. It answers:

1. Where are we at?
2. Where are we going?
3. How do we get there?
4. What does done mean?

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

- `DREAM-STATE.md` at tier-appropriate location
- Parent tier update (if creating child)
- Run archive on completion

## Version

1.0.0 — Initial release with four-tier support

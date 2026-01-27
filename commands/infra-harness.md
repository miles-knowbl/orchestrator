# /infra-harness Command

**Single entry point for infrastructure provisioning.** Sets up dev environments, databases, containers, and CI/CD pipelines through a structured 5-phase pipeline.

## Purpose

This command orchestrates the complete infrastructure setup workflow: gathering requirements, planning architecture, provisioning services, and deploying to production. It handles dev environments, Docker containerization, database setup, monorepo configuration, and CI/CD distribution.

**The flow you want:** describe your infrastructure needs, say `go`, and the loop provisions everything from local dev to production deployment.

## Usage

```
/infra-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing infra-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | SHIP | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if infra-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather infrastructure requirements
```

### Step 2: Initialize State

Create `infra-state.json`:

```json
{
  "loop": "infra-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "infra-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "deploy-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "SCAFFOLD": { "status": "pending", "skills": ["scaffold", "infra-devenv"] },
    "IMPLEMENT": { "status": "pending", "skills": ["infra-docker", "infra-database", "infra-monorepo", "infra-services"] },
    "SHIP": { "status": "pending", "skills": ["deploy", "distribute"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT
  │                │
  │                │ [infra-gate]
  │                │  human
  ▼                ▼
requirements     scaffold              infra-docker
                 infra-devenv          infra-database
                                       infra-monorepo
                                       infra-services

  ▼                ▼                    ▼

SHIP ──────────► COMPLETE
  │
  │ [deploy-gate]
  │  human
  ▼
deploy            retrospective
distribute
```

**9 skills across 5 phases, 2 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `infra-gate` | SCAFFOLD | human | User says `approved` | INFRASTRUCTURE-PLAN.md |
| `deploy-gate` | SHIP | human | User says `approved` | Deploy artifacts, CI/CD config |

**Gate presentation:**
```
═══════════════════════════════════════════════════════════════
║  INFRA GATE                                                 ║
║                                                             ║
║  INFRASTRUCTURE-PLAN.md ready for review.                   ║
║  Covers: dev environment, containers, database, services.   ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to IMPLEMENT          ║
║    changes: ... — Request modifications                     ║
║    show plan    — Display INFRASTRUCTURE-PLAN.md            ║
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
| `infra-state.json` | Current phase, gate status, progress |
| `REQUIREMENTS.md` | Infrastructure requirements |
| `INFRASTRUCTURE-PLAN.md` | Full infra architecture and provisioning plan |
| `docker-compose.yml` | Container orchestration |
| `Dockerfile` | Container build definition |
| `.github/workflows/distribute.yml` | CI/CD pipeline |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /infra-harness

Infra Harness v1.0.0: Starting infrastructure provisioning...

  No existing infra state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Infra Loop v1.0.0                         ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 5                                          ║
  ║  Gates: infra → deploy                              ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Infra Harness: Starting INIT phase...

  [1/1] requirements → Gathering infrastructure requirements...
        ✓ REQUIREMENTS.md (database, Docker, CI/CD, dev environment)

  ✓ INIT phase complete

Infra Harness: Starting SCAFFOLD phase...

  [1/2] scaffold → Creating project structure...
        ✓ Directory structure scaffolded
  [2/2] infra-devenv → Configuring dev environment...
        ✓ Dev environment configured

  ✓ SCAFFOLD phase complete

  ═══════════════════════════════════════════════════════
  ║  INFRA GATE                                         ║
  ║                                                     ║
  ║  INFRASTRUCTURE-PLAN.md ready for review.            ║
  ║                                                     ║
  ║  Say 'approved' to continue to IMPLEMENT.           ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: infra-gate ✓

Infra Harness: Starting IMPLEMENT phase...
  [1/4] infra-docker → Building container definitions...
  ...
```

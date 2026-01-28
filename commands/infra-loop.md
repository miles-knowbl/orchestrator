# /infra-loop Command

**Single entry point for infrastructure provisioning.** Sets up dev environments, databases, containers, and CI/CD pipelines through a structured 5-phase pipeline.

## Purpose

This command orchestrates the complete infrastructure setup workflow: gathering requirements, planning architecture, provisioning services, and deploying to production. It handles dev environments, Docker containerization, database setup, monorepo configuration, and CI/CD distribution.

**The flow you want:** describe your infrastructure needs, say `go`, and the loop provisions everything from local dev to production deployment.

## Usage

```
/infra-loop [--resume] [--phase=PHASE]
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
| `infra-gate` | SCAFFOLD | human | User says `approved` | INFRA-PLAN.md |
| `deploy-gate` | SHIP | human | User says `approved` | DEPLOY-REPORT.md |

**Gate presentation (infra-gate):**
```
═══════════════════════════════════════════════════════════════
║  INFRA GATE                                    [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 INFRA-PLAN.md — Infrastructure architecture plan      ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Services provisioned: Docker, database, CI/CD          ║
║    ✓ Environments configured: dev, staging, production      ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to IMPLEMENT         ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (deploy-gate):**
```
═══════════════════════════════════════════════════════════════
║  DEPLOY GATE                                   [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 DEPLOY-REPORT.md — Deployment verification report     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Deployment status: all targets healthy                 ║
║    ✓ CI/CD pipeline: distribute.yml operational             ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to COMPLETE          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
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
User: /infra-loop

Infra Loop v1.0.0: Starting infrastructure provisioning...

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

══════════════════════════════════════
  INIT                           [1/5]
══════════════════════════════════════

  ┌─ requirements
  │  Gathering infrastructure requirements...
  │  Analyzing database, Docker, CI/CD, dev environment needs...
  │
  │  Output:
  │    📄 REQUIREMENTS.md — Infrastructure requirements captured
  └─ ✓ requirements complete

  ✓ INIT complete (1 skill, 1 deliverable)

══════════════════════════════════════
  SCAFFOLD                       [2/5]
══════════════════════════════════════

  ┌─ scaffold
  │  Creating project structure...
  │  Generating directory layout and config files...
  │
  │  Output:
  │    📄 Directory structure scaffolded
  └─ ✓ scaffold complete

  ┌─ infra-devenv
  │  Configuring dev environment...
  │  Setting up local tooling and environment variables...
  │
  │  Output:
  │    📄 Dev environment configured
  └─ ✓ infra-devenv complete

  ✓ SCAFFOLD complete (2 skills, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  INFRA GATE                                    [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 INFRA-PLAN.md — Infrastructure architecture plan      ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Services provisioned: Docker, database, CI/CD          ║
  ║    ✓ Environments configured: dev, staging, production      ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPLEMENT         ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: infra-gate ✓

══════════════════════════════════════
  IMPLEMENT                      [3/5]
══════════════════════════════════════

  ┌─ infra-docker
  │  Building container definitions...
  │  Creating Dockerfile and docker-compose.yml...
  │
  │  Output:
  │    📄 Docker configuration created
  └─ ✓ infra-docker complete

  ┌─ infra-database
  │  Provisioning database...
  │  Setting up schemas, migrations, connection pooling...
  │
  │  Output:
  │    📄 Database provisioned and configured
  └─ ✓ infra-database complete

  ┌─ infra-monorepo
  │  Configuring monorepo structure...
  │  Setting up workspaces and shared dependencies...
  │
  │  Output:
  │    📄 Monorepo workspace configured
  └─ ✓ infra-monorepo complete

  ┌─ infra-services
  │  Configuring services...
  │  Setting up service discovery and networking...
  │
  │  Output:
  │    📄 Services configured and connected
  └─ ✓ infra-services complete

  ✓ IMPLEMENT complete (4 skills, 4 deliverables)

══════════════════════════════════════
  SHIP                           [4/5]
══════════════════════════════════════

  ┌─ deploy
  │  Deploying to target environments...
  │  Verifying deployment health...
  │
  │  Output:
  │    📄 DEPLOY-REPORT.md — Deployment verification
  └─ ✓ deploy complete

  ┌─ distribute
  │  Setting up CI/CD workflow...
  │
  │  Output:
  │    📄 .github/workflows/distribute.yml
  └─ ✓ distribute complete

  ✓ SHIP complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  DEPLOY GATE                                   [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 DEPLOY-REPORT.md — Deployment verification report     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Deployment status: all targets healthy                 ║
  ║    ✓ CI/CD pipeline: distribute.yml operational             ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to COMPLETE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: deploy-gate ✓

══════════════════════════════════════
  COMPLETE                       [5/5]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing loop execution...
  │  Capturing infrastructure learnings...
  │
  │  Output:
  │    📄 RETROSPECTIVE.md — Infrastructure learnings
  └─ ✓ retrospective complete

  ✓ COMPLETE (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   INFRA LOOP COMPLETE                                               ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Requirements gathered                               ║
║   ✓ SCAFFOLD    Dev environment and scaffold set up                 ║
║   ✓ IMPLEMENT   Docker, database, monorepo, services configured    ║
║   ✓ SHIP        Deployed and distributed                            ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Infrastructure Review [HUMAN]                                   ║
║   ✓ Deployment Review [HUMAN]                                       ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 INFRA-PLAN.md        Infrastructure architecture               ║
║   📄 DEPLOY-REPORT.md     Deployment verification                   ║
║   📄 RETROSPECTIVE.md     Infrastructure learnings                  ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

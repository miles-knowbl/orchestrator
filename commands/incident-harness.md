# /incident-harness Command

**Single entry point for incident response.** Triage, mitigate, deploy fix, write postmortem. Optimized for speed with minimal gates during active incident.

## Purpose

This command orchestrates incident resolution under time pressure: triaging severity, implementing a mitigation, verifying the fix, deploying to restore service, and then writing the postmortem after service is restored. The DOCUMENT phase intentionally comes after SHIP because restoring service is the priority — learning happens after.

**The flow you want:** declare an incident, say `go`, and the loop gets you to resolution as fast as possible, then handles the postmortem.

## Usage

```
/incident-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing incident-state.json
- `--phase=PHASE`: Start from specific phase (INIT | IMPLEMENT | VERIFY | SHIP | DOCUMENT | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if incident-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, triage the incident
```

### Step 2: Initialize State

Create `incident-state.json`:

```json
{
  "loop": "incident-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "severity-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "deploy-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["incident-triage"] },
    "IMPLEMENT": { "status": "pending", "skills": ["mitigation"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification"] },
    "SHIP": { "status": "pending", "skills": ["deploy"] },
    "DOCUMENT": { "status": "pending", "skills": ["postmortem"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

**Note: DOCUMENT comes after SHIP — restore service first, learn after.**

```
INIT ──────────► IMPLEMENT ──────────► VERIFY ──────────► SHIP
  │                                      │                  │
  │ [severity-gate]                      │ [verification]   │ [deploy-gate]
  │  human                               │  auto            │  human
  ▼                                      ▼                  ▼
incident-triage   mitigation          code-verification    deploy

  ▼                ▼                    ▼                    ▼

DOCUMENT ──────────► COMPLETE
  ▼
postmortem          retrospective
```

**6 skills across 6 phases, 3 gates (2 human, 1 auto) — deliberately lightweight for speed**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `severity-gate` | INIT | human | User says `approved` | INCIDENT-TRIAGE.md |
| `verification-gate` | VERIFY | auto | Build passes, tests pass | VERIFICATION.md |
| `deploy-gate` | SHIP | human | User says `approved` | Deploy artifacts |

**Gate presentation (severity-gate):**
```
═══════════════════════════════════════════════════════════════
║  SEVERITY GATE                                              ║
║                                                             ║
║  INCIDENT-TRIAGE.md ready for review.                       ║
║  Severity: SEV-1 (service down, users affected)             ║
║  Impact: 100% of write operations failing                   ║
║  Blast radius: all production users                         ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Confirm severity, begin mitigation        ║
║    changes: ... — Adjust triage assessment                  ║
║    show triage  — Display INCIDENT-TRIAGE.md                ║
═══════════════════════════════════════════════════════════════
```

### Design Decision: DOCUMENT after SHIP

Unlike other loops where DOCUMENT precedes SHIP, the incident loop deliberately reverses this order:

1. **SHIP** deploys the fix to restore service
2. **DOCUMENT** writes the postmortem with full context

This matches industry incident response practice: stop the bleeding first, then do the retrospective. The postmortem benefits from having complete data including deployment success/failure.

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
| `incident-state.json` | Current phase, gate status, progress |
| `INCIDENT-TRIAGE.md` | Severity, impact, blast radius, timeline |
| `VERIFICATION.md` | Build/test results for mitigation |
| `POSTMORTEM.md` | Root cause, timeline, action items |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /incident-harness

Incident Harness v1.0.0: Starting incident response...

  No existing incident state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Incident Loop v1.0.0                      ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 6                                          ║
  ║  Gates: severity → verification(auto) → deploy      ║
  ║  Priority: restore service first, postmortem after   ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Incident Harness: Starting INIT phase...

  [1/1] incident-triage → Describe the incident.

User: Production API returning 503 for all authenticated endpoints.
      Started 15 minutes ago. Redis connection pool exhausted.

  [1/1] incident-triage → Triaging...
        ✓ INCIDENT-TRIAGE.md
          Severity: SEV-1
          Impact: all authenticated API calls failing
          Root signal: Redis connection pool exhausted
          Started: 15 minutes ago
          Candidate mitigation: restart Redis, increase pool size

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  SEVERITY GATE                                      ║
  ║                                                     ║
  ║  SEV-1: all authenticated endpoints down.           ║
  ║  Mitigation path identified.                        ║
  ║                                                     ║
  ║  Say 'approved' to begin mitigation.                ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: severity-gate ✓

Incident Harness: Starting IMPLEMENT phase...
  [1/1] mitigation → Implementing fix...
        ✓ Redis pool size increased from 10 to 50
        ✓ Connection retry logic added
        ✓ Health check endpoint updated

  ...continues through VERIFY → SHIP → DOCUMENT → COMPLETE
```

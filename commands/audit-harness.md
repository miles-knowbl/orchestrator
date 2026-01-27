# /audit-harness Command

**Single entry point for system audits.** Evaluates existing systems for architecture, security, and performance — produces findings, not fixes.

## Purpose

This command orchestrates a comprehensive system audit: scoping the evaluation, reviewing architecture and security posture, analyzing performance characteristics, validating findings, and producing a consolidated audit report. The loop is read-only by design — it observes and documents, never modifies code.

**The flow you want:** point it at a codebase, say `go`, and receive a structured audit report with prioritized findings.

## Usage

```
/audit-harness [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing audit-state.json
- `--phase=PHASE`: Start from specific phase (INIT | REVIEW | VALIDATE | DOCUMENT | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if audit-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, define audit scope
```

### Step 2: Initialize State

Create `audit-state.json`:

```json
{
  "loop": "audit-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "scope-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "findings-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "report-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["requirements"] },
    "REVIEW": { "status": "pending", "skills": ["architecture-review", "security-audit", "perf-analysis"] },
    "VALIDATE": { "status": "pending", "skills": ["integration-test", "code-verification"] },
    "DOCUMENT": { "status": "pending", "skills": ["document"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► REVIEW ──────────► VALIDATE
  │                │
  │ [scope-gate]   │ [findings-gate]
  │  human         │  human
  ▼                ▼
requirements     architecture-review    integration-test
                 security-audit         code-verification
                 perf-analysis

  ▼                ▼                    ▼

DOCUMENT ──────────► COMPLETE
  │
  │ [report-gate]
  │  human
  ▼
document            retrospective
```

**7 skills across 5 phases, 3 human gates**

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `scope-gate` | INIT | human | User says `approved` | AUDIT-SCOPE.md |
| `findings-gate` | REVIEW | human | User says `approved` | ARCHITECTURE-REVIEW.md, SECURITY-AUDIT.md, PERF-ANALYSIS.md |
| `report-gate` | DOCUMENT | human | User says `approved` | AUDIT-REPORT.md |

**Gate presentation (findings-gate):**
```
═══════════════════════════════════════════════════════════════
║  FINDINGS GATE                                              ║
║                                                             ║
║  3 review deliverables ready:                               ║
║    ARCHITECTURE-REVIEW.md — 5 findings (1 critical)         ║
║    SECURITY-AUDIT.md — 3 findings (0 critical)              ║
║    PERF-ANALYSIS.md — 4 findings (2 high)                   ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to VALIDATE           ║
║    changes: ... — Request deeper analysis on specific area   ║
║    show arch    — Display ARCHITECTURE-REVIEW.md            ║
║    show security — Display SECURITY-AUDIT.md                ║
║    show perf    — Display PERF-ANALYSIS.md                  ║
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
| `audit-state.json` | Current phase, gate status, progress |
| `AUDIT-SCOPE.md` | Defined audit boundaries and focus areas |
| `ARCHITECTURE-REVIEW.md` | Architecture findings and recommendations |
| `SECURITY-AUDIT.md` | Security posture assessment |
| `PERF-ANALYSIS.md` | Performance analysis and bottlenecks |
| `AUDIT-REPORT.md` | Consolidated audit report with prioritized findings |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /audit-harness

Audit Harness v1.0.0: Starting system audit...

  No existing audit state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Audit Loop v1.0.0                         ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 5                                          ║
  ║  Gates: scope → findings → report                   ║
  ║  Mode: read-only (no code modifications)            ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Audit Harness: Starting INIT phase...

  [1/1] requirements → Defining audit scope...
        ✓ AUDIT-SCOPE.md (architecture, security, performance)

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  SCOPE GATE                                         ║
  ║                                                     ║
  ║  AUDIT-SCOPE.md ready for review.                   ║
  ║  Coverage: architecture, security, performance.     ║
  ║                                                     ║
  ║  Say 'approved' to continue to REVIEW.              ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: scope-gate ✓

Audit Harness: Starting REVIEW phase...

  [1/3] architecture-review → Analyzing architecture...
        ✓ ARCHITECTURE-REVIEW.md (5 findings)
  [2/3] security-audit → Assessing security posture...
        ✓ SECURITY-AUDIT.md (3 findings)
  [3/3] perf-analysis → Analyzing performance...
        ✓ PERF-ANALYSIS.md (4 findings)

  ✓ REVIEW phase complete

  ═══════════════════════════════════════════════════════
  ║  FINDINGS GATE                                      ║
  ║                                                     ║
  ║  12 total findings across 3 domains.                ║
  ║  1 critical, 2 high, 5 medium, 4 low.              ║
  ║                                                     ║
  ║  Say 'approved' to continue to VALIDATE.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: findings-gate ✓

  ...continues through VALIDATE → DOCUMENT → COMPLETE
```

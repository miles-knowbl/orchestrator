# /audit-loop Command

**Single entry point for system audits.** Evaluates existing systems for architecture, security, and performance — produces findings, not fixes.

## Purpose

This command orchestrates a comprehensive system audit: scoping the evaluation, reviewing architecture and security posture, analyzing performance characteristics, validating findings, and producing a consolidated audit report. The loop is read-only by design — it observes and documents, never modifies code.

**The flow you want:** point it at a codebase, say `go`, and receive a structured audit report with prioritized findings.

## Usage

```
/audit-loop [--resume] [--phase=PHASE]
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

**Gate presentation (scope-gate):**
```
═══════════════════════════════════════════════════════════════
║  SCOPE GATE                                    [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 AUDIT-SCOPE.md — Audit boundaries and focus areas     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Scope: architecture, security, performance             ║
║    ✓ Coverage: all modules included                         ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to REVIEW            ║
║    changes: ...  — Request modifications                    ║
║    show scope    — Display AUDIT-SCOPE.md                   ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (findings-gate):**
```
═══════════════════════════════════════════════════════════════
║  FINDINGS GATE                                 [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 ARCHITECTURE-REVIEW.md — Architecture findings        ║
║    📄 SECURITY-AUDIT.md — Security posture assessment       ║
║    📄 PERF-ANALYSIS.md — Performance analysis               ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Architecture: 5 findings (1 critical, 2 high)          ║
║    ✓ Security: 3 findings (0 critical, 1 medium)            ║
║    ✓ Performance: 4 findings (2 high, 2 medium)             ║
║    ✓ Total: 12 findings across 3 domains                    ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request deeper analysis on specific area  ║
║    show arch     — Display ARCHITECTURE-REVIEW.md           ║
║    show security — Display SECURITY-AUDIT.md                ║
║    show perf     — Display PERF-ANALYSIS.md                 ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (report-gate):**
```
═══════════════════════════════════════════════════════════════
║  REPORT GATE                                   [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 AUDIT-REPORT.md — Consolidated audit report           ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Executive summary compiled                             ║
║    ✓ Findings prioritized by severity                       ║
║    ✓ Recommendations with effort estimates                  ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to COMPLETE          ║
║    changes: ...  — Request modifications                    ║
║    show report   — Display AUDIT-REPORT.md                  ║
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
User: /audit-loop

Audit Loop v1.0.0: Starting system audit...

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

══════════════════════════════════════
  INIT                           [1/5]
══════════════════════════════════════

  ┌─ requirements
  │  Defining audit scope...
  │  Identifying evaluation criteria...
  │
  │  Output:
  │    📄 AUDIT-SCOPE.md — architecture, security, performance
  └─ ✓ requirements complete

  ✓ INIT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  SCOPE GATE                                    [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 AUDIT-SCOPE.md — Audit boundaries and focus areas     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Scope: architecture, security, performance             ║
  ║    ✓ Coverage: all modules included                         ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to REVIEW            ║
  ║    changes: ...  — Request modifications                    ║
  ║    show scope    — Display AUDIT-SCOPE.md                   ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: scope-gate ✓

══════════════════════════════════════
  REVIEW                         [2/5]
══════════════════════════════════════

  ┌─ architecture-review
  │  Analyzing architecture patterns...
  │  Evaluating component boundaries...
  │
  │  Output:
  │    📄 ARCHITECTURE-REVIEW.md — 5 findings (1 critical)
  └─ ✓ architecture-review complete

  ┌─ security-audit
  │  Assessing security posture...
  │  Scanning for vulnerabilities...
  │
  │  Output:
  │    📄 SECURITY-AUDIT.md — 3 findings (0 critical)
  └─ ✓ security-audit complete

  ┌─ perf-analysis
  │  Analyzing performance characteristics...
  │  Identifying bottlenecks...
  │
  │  Output:
  │    📄 PERF-ANALYSIS.md — 4 findings (2 high)
  └─ ✓ perf-analysis complete

  ✓ REVIEW complete (3 skills, 3 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  FINDINGS GATE                                 [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 ARCHITECTURE-REVIEW.md — Architecture findings        ║
  ║    📄 SECURITY-AUDIT.md — Security posture assessment       ║
  ║    📄 PERF-ANALYSIS.md — Performance analysis               ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Architecture: 5 findings (1 critical, 2 high)          ║
  ║    ✓ Security: 3 findings (0 critical, 1 medium)            ║
  ║    ✓ Performance: 4 findings (2 high, 2 medium)             ║
  ║    ✓ Total: 12 findings across 3 domains                    ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to VALIDATE          ║
  ║    changes: ...  — Request deeper analysis on specific area  ║
  ║    show arch     — Display ARCHITECTURE-REVIEW.md           ║
  ║    show security — Display SECURITY-AUDIT.md                ║
  ║    show perf     — Display PERF-ANALYSIS.md                 ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: findings-gate ✓

══════════════════════════════════════
  VALIDATE                       [3/5]
══════════════════════════════════════

  ┌─ integration-test
  │  Running integration checks...
  │  Verifying cross-module interactions...
  │
  │  Output:
  │    📄 Integration tests passed
  └─ ✓ integration-test complete

  ┌─ code-verification
  │  Verifying findings against codebase...
  │  Confirming severity classifications...
  │
  │  Output:
  │    📄 All findings verified
  └─ ✓ code-verification complete

  ✓ VALIDATE complete (2 skills, 0 new deliverables)

══════════════════════════════════════
  DOCUMENT                       [4/5]
══════════════════════════════════════

  ┌─ document
  │  Compiling audit report...
  │  Writing executive summary...
  │  Prioritizing recommendations...
  │
  │  Output:
  │    📄 AUDIT-REPORT.md — Consolidated report with prioritized findings
  └─ ✓ document complete

  ✓ DOCUMENT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  REPORT GATE                                   [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 AUDIT-REPORT.md — Consolidated audit report           ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Executive summary compiled                             ║
  ║    ✓ Findings prioritized by severity                       ║
  ║    ✓ Recommendations with effort estimates                  ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to COMPLETE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show report   — Display AUDIT-REPORT.md                  ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: report-gate ✓

══════════════════════════════════════
  COMPLETE                       [5/5]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing audit execution...
  │  Capturing learnings...
  │
  │  Output:
  │    📄 RETROSPECTIVE.md — Audit learnings
  └─ ✓ retrospective complete

  ✓ COMPLETE (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   AUDIT LOOP COMPLETE                                               ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Audit scope defined                                 ║
║   ✓ REVIEW      Architecture, security, performance reviewed        ║
║   ✓ VALIDATE    Findings verified                                   ║
║   ✓ DOCUMENT    Audit report compiled                               ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Scope Review [HUMAN]                                            ║
║   ✓ Findings Review [HUMAN]                                         ║
║   ✓ Report Review [HUMAN]                                           ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 AUDIT-SCOPE.md       Scope and evaluation criteria             ║
║   📄 FINDINGS.md          Categorized findings by severity          ║
║   📄 AUDIT-REPORT.md      Consolidated audit report                 ║
║   📄 RETROSPECTIVE.md     Audit learnings                           ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

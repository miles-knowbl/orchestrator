# /bugfix-loop Command

**Single entry point for systematic bug fixing.** From reproduction to verified fix with regression protection through a structured 7-phase pipeline.

## Purpose

This command orchestrates the complete bug resolution workflow: reproducing the issue, diagnosing root cause, implementing the fix, generating regression tests, and verifying the fix holds. It enforces discipline against "shotgun debugging" by requiring confirmed reproduction before any code changes.

**The flow you want:** describe the bug, say `go`, and the loop walks from reproduction through verified fix with regression tests.

**Batch mode:** For multiple minor bugs, start with `collect-bugs` to gather a prioritized backlog before fixing.

## Usage

```
/bugfix-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing bugfix-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | TEST | VERIFY | REVIEW | COMPLETE)

## Execution Flow

### Step 1: Cold Start Detection

```
if bugfix-state.json exists:
  -> Show current phase, pending gates, progress
  -> Ask: "Resume from {phase}? [Y/n]"
else:
  -> Fresh start, gather bug report details
```

### Step 2: Initialize State

Create `bugfix-state.json`:

```json
{
  "loop": "bugfix-loop",
  "version": "3.0.0",
  "phase": "INIT",
  "status": "active",

  "bug": {
    "id": "BUG-001",
    "title": "Brief description",
    "severity": "P0|P1|P2|P3"
  },

  "reproduction": {
    "steps": [
      "Step 1: Navigate to /app",
      "Step 2: Click the button",
      "Step 3: Observe the error"
    ],
    "expected_error": "ReferenceError: Cannot access 'X' before initialization",
    "environment": "production build",
    "frequency": "100% reproducible"
  },

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "my-app",
    "module": null
  },

  "gates": {
    "repro-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "diagnosis-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "verification-gate": { "status": "pending", "required": true, "approvalType": "auto" },
    "review-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["collect-bugs", "bug-reproducer"] },
    "SCAFFOLD": { "status": "pending", "skills": ["debug-assist", "root-cause-analysis"] },
    "IMPLEMENT": { "status": "pending", "skills": ["implement"] },
    "TEST": { "status": "pending", "skills": ["test-generation"] },
    "VERIFY": { "status": "pending", "skills": ["code-verification", "bug-re-reproducer"] },
    "REVIEW": { "status": "pending", "skills": ["code-review"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

> **CRITICAL: The `reproduction` object is captured at INIT and re-used at VERIFY**
>
> At VERIFY, the exact reproduction steps are re-run to confirm the bug no longer occurs.
> This prevents "fix the wrong thing" errors where automated checks pass but the original bug persists.

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT ──────────► TEST
  │                │  ▲
  │ [repro-gate]   │  │ (if re-repro fails)
  │  human         │  │
  ▼                ▼  │
collect-bugs     debug-assist          implement          test-generation
bug-reproducer   root-cause-analysis

  ▼                ▼                    ▼                    ▼

VERIFY ──────────► REVIEW ──────────► COMPLETE
  │                  │
  │ [verification]   │ [review-gate]
  │  auto+re-repro   │  human
  ▼                  ▼
code-verification  code-review         retrospective
+ bug-re-reproducer
```

**9 skills across 7 phases, 4 gates (3 human, 1 auto)**

> **Auto gate includes production E2E + bug re-reproduction**
> If re-reproduction shows bug still occurs → return to SCAFFOLD

> **Note:** `collect-bugs` is optional. Skip it with `skip collect-bugs: single known bug` when you already know exactly what to fix.

### Step 4: Gate Enforcement

| Gate | After Phase | Type | Blocks Until | Deliverables |
|------|-------------|------|--------------|-------------|
| `repro-gate` | INIT | human | User says `approved` | BUG-REPRODUCTION.md |
| `diagnosis-gate` | SCAFFOLD | human | User says `approved` | ROOT-CAUSE.md |
| `verification-gate` | VERIFY | auto | Build + tests + lint + **production E2E** all pass | VERIFICATION.md |
| `review-gate` | REVIEW | human | User says `approved` | CODE-REVIEW.md |

> **CRITICAL: verification-gate has THREE mandatory checks**
>
> ```
> ┌─────────────────────────────────────────────────────────────────┐
> │  VERIFICATION GATE — All three must pass                       │
> ├─────────────────────────────────────────────────────────────────┤
> │  1. AUTO CHECKS                                                 │
> │     npm run build      → must pass                              │
> │     npm test           → must pass                              │
> │     npm run lint       → 0 errors                               │
> │                                                                 │
> │  2. PRODUCTION E2E                                              │
> │     npm run test:e2e:prod  → must pass                          │
> │     - Builds production bundle                                  │
> │     - Runs Playwright against production server                 │
> │     - Catches ErrorBoundary, TDZ, ReferenceError                │
> │                                                                 │
> │  3. BUG RE-REPRODUCTION (THE KEY CHECK)                         │
> │     Re-run the exact steps from bugfix-state.json.reproduction  │
> │     - The original error MUST NOT appear                        │
> │     - The app MUST behave correctly now                         │
> │     - If bug still occurs → return to SCAFFOLD                  │
> └─────────────────────────────────────────────────────────────────┘
> ```
>
> **Why re-reproduction?** Build/lint/tests can pass while the original bug persists.
> You might have fixed a *different* issue than the one reported. Re-running the
> exact reproduction steps confirms the *actual bug* is gone, not just that the
> code compiles.

**Gate presentation (repro-gate):**
```
═══════════════════════════════════════════════════════════════
║  REPRO GATE                                    [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 BUG-REPRODUCTION.md — Reproduction steps and evidence ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Reproduced: 3/3 attempts                               ║
║    ✓ Environment: Node 20.x, macOS, SQLite 3.42            ║
║    ✓ Trigger identified                                     ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to SCAFFOLD           ║
║    changes: ... — Adjust reproduction steps                 ║
║    show repro   — Display BUG-REPRODUCTION.md               ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (verification-gate):**
```
═══════════════════════════════════════════════════════════════
║  VERIFICATION GATE                              [AUTO]     ║
║                                                             ║
║  1. Unit Checks:                                            ║
║     ✓ Build: passed                                         ║
║     ✓ Tests: 196/196 passed                                 ║
║     ✓ Lint: 0 errors                                        ║
║                                                             ║
║  2. Production E2E (npm run test:e2e:prod):                 ║
║     ✓ Production build: passed                              ║
║     ✓ App loads without ErrorBoundary                       ║
║     ✓ No critical console errors                            ║
║                                                             ║
║  3. Bug Re-Reproduction:                                    ║
║     Original bug: "Cannot access 'oe' before initialization"║
║     Steps: Build prod → Load app → Check console            ║
║     ✓ Error NO LONGER appears                               ║
║     ✓ App loads correctly                                   ║
║                                                             ║
║  Result: PASSED — Bug confirmed FIXED                       ║
═══════════════════════════════════════════════════════════════
```

> **The re-reproduction check is the most important one.**
> It uses the exact steps captured at INIT to verify the *specific bug* is gone.
> Without this, you might fix something else and declare victory prematurely.

**When re-reproduction FAILS (bug still occurs):**
```
═══════════════════════════════════════════════════════════════
║  VERIFICATION GATE                             [FAILED]    ║
║                                                             ║
║  1. Unit Checks: ✓ passed                                   ║
║  2. Production E2E: ✓ passed                                ║
║  3. Bug Re-Reproduction: ✗ FAILED                           ║
║                                                             ║
║  Original bug STILL OCCURS:                                 ║
║     "Cannot access 'oe' before initialization"              ║
║                                                             ║
║  Analysis:                                                  ║
║     You fixed something, but not the actual bug.            ║
║     The root cause was misdiagnosed.                        ║
║                                                             ║
║  Action: Returning to SCAFFOLD for re-diagnosis             ║
║                                                             ║
║  Tip: Look for other forward references, circular imports,  ║
║       or production-only code paths.                        ║
═══════════════════════════════════════════════════════════════
```

When this happens:
1. Reset phase to SCAFFOLD
2. Keep the reproduction steps (they're still valid)
3. Mark the previous diagnosis as "incorrect" in ROOT-CAUSE.md
4. Re-analyze with fresh eyes — the bug is something else

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current human gate |
| `changes: [feedback]` | Request changes at gate |
| `still-broken` | Bug still reproduces after fix — return to SCAFFOLD |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `bugfix-state.json` | Current phase, gate status, progress |
| `BUG-BACKLOG.md` | Collected bugs with categories and priorities (from collect-bugs) |
| `BUG-REPRODUCTION.md` | Steps to reproduce, environment, frequency |
| `ROOT-CAUSE.md` | Diagnosis with debug traces and root cause |
| `VERIFICATION.md` | Build/test/lint results post-fix |
| `CODE-REVIEW.md` | Review of fix quality and regression coverage |
| `RETROSPECTIVE.md` | Loop learnings and prevention recommendations |

## Example Session

```
User: /bugfix-loop

Bugfix Loop v1.0.0: Starting systematic bug fix...

  No existing bugfix state found.

  ═══════════════════════════════════════════════════════
  ║  READY — Bugfix Loop v1.0.0                        ║
  ║                                                     ║
  ║  Phase: INIT                                        ║
  ║  Phases: 7                                          ║
  ║  Gates: repro → diagnosis → verification(auto)      ║
  ║         → review                                    ║
  ║  Rule: no code changes until reproduction confirmed ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

══════════════════════════════════════
  INIT                           [1/7]
══════════════════════════════════════

  ┌─ collect-bugs
  │  Sweep the app for minor bugs? (skip if single known bug)
  │
  │  Options:
  │    go        — Sweep console, UI, UX, data for bugs
  │    skip      — I have a specific bug to fix
  └─ ...

User: skip collect-bugs: single known bug

  ┌─ bug-reproducer
  │  Gathering bug report details...

User: Users report 500 error when submitting forms with file attachments
      larger than 5MB. Started after last deploy. Error: "PayloadTooLargeError".

  │  Attempting reproduction (attempt 1/3)...
  │  Attempting reproduction (attempt 2/3)...
  │  Attempting reproduction (attempt 3/3)...
  │
  │  Output:
  │    📄 BUG-REPRODUCTION.md — 3/3 reproduced, trigger: file > 5MB
  └─ ✓ bug-reproducer complete

  ✓ INIT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  REPRO GATE                                    [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 BUG-REPRODUCTION.md — Reproduction steps              ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Reproduced: 3/3 attempts with 6MB upload              ║
  ║    ✓ Trigger: file upload > 5MB                             ║
  ║    ✓ Error: PayloadTooLargeError at body-parser             ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SCAFFOLD          ║
  ║    changes: ...  — Adjust reproduction steps                ║
  ║    show repro    — Display BUG-REPRODUCTION.md              ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: repro-gate ✓

══════════════════════════════════════
  SCAFFOLD                       [2/7]
══════════════════════════════════════

  ┌─ debug-assist
  │  Reading: BUG-REPRODUCTION.md
  │  Tracing error path through codebase...
  │  Identifying suspect components...
  └─ ✓ debug-assist complete

  ┌─ root-cause-analysis
  │  Reading: BUG-REPRODUCTION.md
  │  Analyzing debug traces...
  │  Identifying root cause...
  │
  │  Output:
  │    📄 ROOT-CAUSE.md — body-parser limit reduced in config refactor
  └─ ✓ root-cause-analysis complete

  ✓ SCAFFOLD complete (2 skills, 1 deliverable)

  ...

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   BUGFIX LOOP COMPLETE                                              ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Bug reproduced consistently                        ║
║   ✓ SCAFFOLD    Root cause identified                               ║
║   ✓ IMPLEMENT   Fix applied                                        ║
║   ✓ TEST        Regression tests generated                          ║
║   ✓ VERIFY      Build, tests, lint all passing                      ║
║   ✓ REVIEW      Code review approved                                ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Reproduction Confirmation [HUMAN]                               ║
║   ✓ Diagnosis Approval [HUMAN]                                      ║
║   ✓ Verification Check [AUTO]                                       ║
║   ✓ Code Review Approval [HUMAN]                                    ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 BUG-BACKLOG.md         Collected bugs (if batch mode)          ║
║   📄 BUG-REPRODUCTION.md    Reproduction steps and evidence         ║
║   📄 ROOT-CAUSE.md          Diagnosis with debug traces             ║
║   📄 VERIFICATION.md        Build/test/lint results                  ║
║   📄 CODE-REVIEW.md         Fix quality review                      ║
║   📄 RETROSPECTIVE.md       Learnings and prevention                ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
```

---

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past INIT:

1. **Probe relentlessly** — Ask 5-10+ clarifying questions about the bug
2. **Surface assumptions** — "I'm assuming the issue is X — correct?"
3. **Gather reproduction details** — Environment, steps, frequency, recent changes
4. **Don't stop early** — Keep asking until you can reproduce reliably

At every phase transition and gate, pause to ask:
- "Does this diagnosis match your understanding?"
- "Any other symptoms I should know about?"
- "Ready to proceed with this fix approach?"

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

**Location:** `~/.claude/runs/{year-month}/{system}-bugfix-loop-{timestamp}.json`

**Contents:** Full state + summary including:
- Bug reproduction details
- Root cause analysis
- Fix applied
- Gates passed
- Regression tests added

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note any patterns learned

### 3. Prune Active State

**Delete:** `bugfix-state.json` from working directory.

**Result:** Next `/bugfix-loop` invocation starts fresh with context gathering.

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
  Run archived: ~/.claude/runs/2025-01/myapp-bugfix-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```

# /complete-loop Command

**Take nearly-done apps across the finish line.** Systematically catalog what's broken, triage with MoSCoW, fix, verify, and ship.

## Purpose

This command is for apps that are **most of the way there** — features built, architecture decided, code exists — but haven't been systematically verified to actually work. The hard part isn't writing new code; it's finding everything that's broken and fixing it.

**The flow you want:** point it at an app, it walks every feature, finds what's broken, prioritizes fixes, executes them, and ships.

**Targets:** Apps at 60-90% completion with silent failures, data pipeline bugs, or UI/UX issues.

## Usage

```
/complete-loop [--resume] [--phase=PHASE] [--module=MODULE]
```

**Options:**
- `--resume`: Resume from existing complete-state.json
- `--phase=PHASE`: Start from specific phase (CATALOG | TRIAGE | FIX | VERIFY | SHIP | COMPLETE)
- `--module=MODULE`: Focus on a specific module instead of the whole app

---

## Prerequisites (MUST DO FIRST)

**Before starting the loop, ensure the orchestrator server is running.**

### Step 1: Check Server Health

```bash
curl -s http://localhost:3002/health
```

**Expected response:** `{"status":"ok","timestamp":"...","version":"..."}`

### Step 2: If Server Not Running

If the health check fails, **DO NOT manually start the server**. The `ensure-orchestrator.sh` hook will automatically:

1. Open a new Terminal/iTerm window
2. Start the server there (with visible logs)
3. Wait for it to become healthy

**Just proceed to call an MCP tool** (like `start_execution`) — the hook triggers on any `mcp__orchestrator__*` call and handles server startup automatically.

**NEVER run `npm start &` in background.** The server needs its own Terminal window for persistent operation and log visibility.

---

## Phase Structure

```
CATALOG ──► TRIAGE ──► FIX ──► VERIFY ──► SHIP ──► COMPLETE
   │           │                  │         │
   │[catalog]  │[triage]          │[verify]  │[ship]
   │ human     │ human            │ auto     │ auto
```

**6 phases, 28 skills (20 required, 8 optional), 4 gates**

---

## CATALOG Phase — What's Actually Broken?

The hardest and most valuable phase. This is where the real work happens: systematically walking every module and feature, testing each one, and documenting its state.

### Approach

1. **Load the app's feature map** — Read dream state, roadmap, or README to get the module/feature list
2. **For each module:**
   - Does it build? Does it render?
   - Walk each feature path manually (or via smoke test)
   - Check data pipeline end-to-end: does data flow correctly from input to storage to display?
   - Check for silent failures: look at console, network tab, server logs
   - Check UI: does it look right? Does it respond correctly?
3. **Tag each feature:** WORKS / BROKEN / PARTIAL / MISSING
4. **Document everything** in COMPLETION-MANIFEST.md

### Required Skills

| Skill | Purpose |
|-------|---------|
| `collect-bugs` | Breadth-first sweep — UI/UX/data/console bugs into prioritized BUG-BACKLOG.md |
| `pipeline-discovery` | Map backend data pipelines (P-series) — triggers, steps, failure points |
| `ui-pipeline-discovery` | Map client-side interaction flows (U-series) — state, context, feedback |
| `smoke-test` | Hit live endpoints, verify which features work vs. break |

### Optional Skills

| Skill | When to Use |
|-------|-------------|
| `architecture-review` | Suspect structural issues blocking multiple features |
| `taste-discovery` | App has quality eval definitions to load |
| `taste-eval` | Want subjective quality scoring alongside technical catalog |

### COMPLETION-MANIFEST.md Format

```markdown
# Completion Manifest

**App:** [name]
**Date:** [ISO date]
**Modules:** [X total] — [Y works] / [Z broken] / [W partial] / [V missing]

## Module: [module-name]

| Feature | Status | Details | Severity |
|---------|--------|---------|----------|
| User login | WORKS | OAuth + email both functional | — |
| Password reset | BROKEN | Email sends but link 404s | P1 |
| Profile edit | PARTIAL | Name saves, avatar upload fails silently | P2 |
| Account deletion | MISSING | No UI or backend handler | P3 |

### Pipeline Issues
- P1: [pipeline-name] — [what fails and where]

### UI Issues
- U1: [flow-name] — [what's wrong]

### Silent Failures
- [description of what fails without error]
```

### Gate: catalog-gate [HUMAN]

```
═══════════════════════════════════════════════════════════════
║  CATALOG GATE                                     [HUMAN]  ║
║                                                             ║
║  Modules scanned: [X]                                       ║
║  Features tagged:                                           ║
║    WORKS:   [count]                                         ║
║    BROKEN:  [count]                                         ║
║    PARTIAL: [count]                                         ║
║    MISSING: [count]                                         ║
║                                                             ║
║  Pipelines mapped: [P-count] backend, [U-count] UI         ║
║  Silent failures found: [count]                             ║
║                                                             ║
║  Commands:                                                  ║
║    approved  — Proceed to TRIAGE                            ║
║    show manifest — View full COMPLETION-MANIFEST.md         ║
║    changes: ... — Request deeper scan on specific module    ║
═══════════════════════════════════════════════════════════════
```

---

## TRIAGE Phase — MoSCoW Prioritization

Apply the MoSCoW framework to everything found in CATALOG.

### MoSCoW Categories

| Priority | Meaning | Action | Examples |
|----------|---------|--------|----------|
| **Must** | Blocks launch. App unusable without this. Core flows broken. | Fix in this loop iteration. | Login broken, data not saving, payment fails |
| **Should** | Degrades experience significantly. Users will notice and be frustrated. | Fix in this loop if time allows. | Slow load, confusing UI, missing feedback |
| **Could** | Nice polish. Users can work around it. | Fix if easy, otherwise defer. | Minor styling, edge case handling |
| **Won't** | Out of scope for this release. | Document and defer. | New features, platform expansion |

### Required Skills

| Skill | Purpose |
|-------|---------|
| `triage` | MoSCoW classification with rationale for each item |
| `failure-mode-analysis` | MECE taxonomy for backend failure modes (Location x Type x Severity) |
| `ui-failure-mode-analysis` | MECE taxonomy for UI failure modes (Dead Click, Stale Closure, State Desync, etc.) |

### Optional Skills

| Skill | When to Use |
|-------|-------------|
| `estimation` | Want effort estimates to inform prioritization |
| `blocker-analyzer` | Some fixes depend on others |

### TRIAGE.md Format

```markdown
# Triage — MoSCoW Prioritization

**Total items:** [X]
**Must:** [count] | **Should:** [count] | **Could:** [count] | **Won't:** [count]

## Must Have (blocks launch)

| # | Item | Module | Type | Effort | Blocked By |
|---|------|--------|------|--------|------------|
| 1 | Password reset link 404s | auth | Bug | S | — |
| 2 | Invoice total calculation wrong | billing | Data | M | — |

## Should Have (degrades experience)

| # | Item | Module | Type | Effort | Blocked By |
|---|------|--------|------|--------|------------|
| 3 | Avatar upload fails silently | profile | Bug | S | — |
| 4 | No loading state on generation | content | UX | S | — |

## Could Have (nice polish)

| # | Item | Module | Type | Effort |
|---|------|--------|------|--------|
| 5 | Dark mode toggle | settings | Feature | M |

## Won't Have (deferred)

| # | Item | Reason |
|---|------|--------|
| 6 | Instagram integration | Platform expansion — next release |
```

### Gate: triage-gate [HUMAN]

```
═══════════════════════════════════════════════════════════════
║  TRIAGE GATE                                      [HUMAN]  ║
║                                                             ║
║  MoSCoW Breakdown:                                          ║
║    Must:   [count] items ([effort] estimated)               ║
║    Should: [count] items ([effort] estimated)               ║
║    Could:  [count] items                                    ║
║    Won't:  [count] items (deferred)                         ║
║                                                             ║
║  Failure Modes:                                             ║
║    Backend: [count] modes, [validated]% validated            ║
║    UI: [count] modes, [validated]% validated                 ║
║                                                             ║
║  Commands:                                                  ║
║    approved  — Proceed to FIX (Must + Should items)         ║
║    must-only — Only fix Must items                           ║
║    changes: ... — Reclassify items                           ║
═══════════════════════════════════════════════════════════════
```

---

## FIX Phase — Targeted Engineering

Work through Must and Should items. Each fix follows the same pattern.

### Fix Pattern

```
For each item in Must, then Should:
  1. bug-reproducer → Create reliable reproduction
  2. implement → Write the fix (small, targeted)
  3. code-verification → Fast structural check
  4. Next item
```

### Required Skills

| Skill | Purpose |
|-------|---------|
| `implement` | Write the fix |
| `bug-reproducer` | Create reliable reproduction before fixing |
| `code-verification` | Fast structural checks after each fix |

### Optional Skills

| Skill | When to Use |
|-------|-------------|
| `root-cause-analysis` | Bug is tricky — need 5-whys |
| `debug-assist` | Complex isolation needed |

### Principles

- **One fix at a time.** Commit each fix separately.
- **No refactoring** beyond what's needed for the fix.
- **If a fix takes >30min**, stop and re-evaluate — it might be a Should, not a Must.
- **Track progress** against the TRIAGE.md checklist.

---

## VERIFY Phase — Regression Check

Re-run everything from CATALOG to confirm fixes landed and nothing new broke.

### Required Skills

| Skill | Purpose |
|-------|---------|
| `smoke-test` | Re-run all endpoint checks (before/after comparison) |
| `integration-test` | Cross-system contract validation |
| `test-generation` | Generate regression tests for all fixes |
| `code-validation` | Semantic correctness checks |
| `code-review` | 4-pass review |

### Verification Checklist

- [ ] All Must items: BROKEN → WORKS
- [ ] All Should items addressed: BROKEN → WORKS or documented reason for deferral
- [ ] No new BROKEN items that were WORKS in CATALOG
- [ ] Build passes
- [ ] All tests pass (existing + new regression tests)
- [ ] Smoke test green

### Gate: verification-gate [AUTO]

```
═══════════════════════════════════════════════════════════════
║  VERIFICATION GATE                                 [AUTO]  ║
║                                                             ║
║  ✓ Build: clean compile                                     ║
║  ✓ Tests: [X]/[X] passing                                   ║
║  ✓ Smoke tests: [X]/[X] green                               ║
║  ✓ Must items: [count]/[count] fixed                        ║
║  ✓ Should items: [count]/[count] fixed                      ║
║  ✓ No regressions detected                                  ║
║                                                             ║
║  All checks passed. Continuing to SHIP.                     ║
═══════════════════════════════════════════════════════════════
```

---

## SHIP Phase — Deploy and Document

### Required Skills

| Skill | Purpose |
|-------|---------|
| `git-workflow` | Commit, PR, merge |
| `document` | README, API docs, user guides |
| `deploy` | Production deployment |
| `distribute` | CI/CD pipeline confirmation |
| `changelog-generator` | Structured changelog |

### Optional Skills

| Skill | When to Use |
|-------|-------------|
| `gotcha-documenter` | Non-obvious edge cases worth documenting |

### Gate: ship-gate [AUTO]

```
═══════════════════════════════════════════════════════════════
║  SHIP GATE                                         [AUTO]  ║
║                                                             ║
║  ✓ Committed and pushed                                     ║
║  ✓ CI pipeline green                                        ║
║  ✓ Deployed to production                                   ║
║  ✓ Docs updated                                             ║
║  ✓ Changelog generated                                      ║
║                                                             ║
║  All checks passed. Continuing to COMPLETE.                 ║
═══════════════════════════════════════════════════════════════
```

---

## Iteration

The complete-loop is iterative. After SHIP:

1. If Could/Won't items are worth revisiting → run again with narrower scope
2. Each iteration should have **fewer Must items**
3. When Must = 0 and Should = 0, the app is complete

```
Iteration 1: Must=12, Should=8, Could=15, Won't=5  → Fix 20
Iteration 2: Must=2,  Should=4, Could=10, Won't=3  → Fix 6
Iteration 3: Must=0,  Should=1, Could=6,  Won't=2  → Fix 1
Done: Must=0, Should=0 → Ship
```

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "complete-loop",
  project: "[app name]"
})
```

**Store the returned `executionId`** — you'll need it for all subsequent calls.

### Pre-Loop Context Loading (MANDATORY)

**CRITICAL: Before proceeding with any phase, you MUST process the `preLoopContext` returned by start_execution.**

The response includes:
```json
{
  "executionId": "...",
  "preLoopContext": {
    "requiredDeliverables": [...],
    "skillGuarantees": [...],
    "dreamStatePath": ".claude/DREAM-STATE.md",
    "roadmapPath": "ROADMAP.md"
  }
}
```

**You MUST:**
1. **Read the Dream State** (if `dreamStatePath` provided) — understand the vision and module list
2. **Read the ROADMAP** (if `roadmapPath` provided) — see module completion status
3. **Note all required deliverables** — know what each skill must produce
4. **Note guarantee counts** — understand what will be validated

**DO NOT proceed to CATALOG phase until you have loaded this context.** The dream state and roadmap are the feature map that CATALOG walks through.

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["COMPLETION-MANIFEST.md"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({ executionId: "[stored executionId]" })
```

### At Gates

**When user approves a gate**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name]",
  approvedBy: "user"  // or "auto" for auto gates
})
```

### Phase Transitions

**To advance to the next phase**, call:
```
mcp__orchestrator__advance_phase({ executionId: "[stored executionId]" })
```

### Server Resilience (CRITICAL)

**If any MCP tool call fails with a connection error, DO NOT exit the loop.** Follow the retry protocol in `commands/_shared/server-resilience-protocol.md`:

1. Tell the user the server connection was lost
2. Wait 5 seconds, then retry the same call (the PreToolUse hook will restart the server)
3. If 3 retries fail, ask the user whether to wait, skip, or stop
4. Your executionId survives server restarts — do NOT create a new execution
5. Continue the loop from where you left off

---

## On Completion

When this loop reaches COMPLETE phase:

### 1. Archive Run

**Location:** `~/.claude/runs/{year-month}/{project}-complete-loop-{timestamp}/`

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-complete-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

mv complete-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp COMPLETION-MANIFEST.md TRIAGE.md BUG-BACKLOG.md SMOKE-TEST.md \
   PIPELINE-MAP.md FAILURE-MODES.md RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

### 2. Commit and Push

```bash
git add -A
git diff --cached --quiet || git commit -m "Complete loop: [app] [iteration] — [Must fixed]/[Should fixed]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Clean Project Directory

```bash
rm -f COMPLETION-MANIFEST.md TRIAGE.md BUG-BACKLOG.md SMOKE-TEST.md \
      PIPELINE-MAP.md FAILURE-MODES.md RETROSPECTIVE.md \
      complete-state.json 2>/dev/null || true
```

### 4. Leverage Proposal (REQUIRED)

Before showing completion, propose the next move:
- If Must > 0 remaining → recommend another `/complete-loop` iteration
- If Must = 0, Should > 0 → recommend another iteration for Should items
- If Must = 0, Should = 0 → recommend `/distribution-loop` to ship, or next app

---

## Example Session

```
User: /complete-loop

Complete Loop v1.0.0: Starting...

  Loading app context...
  Dream State: servicegrid (18/28 modules)
  ROADMAP.md: Layer 5.5 (QA) blocking

  ══════════════════════════════════════
    CATALOG                       [1/6]
  ══════════════════════════════════════

  ┌─ collect-bugs
  │  Walking 28 modules...
  │  Module: auth — WORKS (login, signup, OAuth all functional)
  │  Module: jobs — PARTIAL (create works, status transitions fail silently)
  │  Module: invoices — BROKEN (Stripe webhook handler 500s on refunds)
  │  ...
  │  Tagged: 18 WORKS, 4 BROKEN, 5 PARTIAL, 1 MISSING
  └─ ✓ collect-bugs complete

  ┌─ smoke-test
  │  Testing 42 endpoints...
  │  38 PASS, 4 FAIL
  │  Failures: POST /api/refund, GET /api/analytics, ...
  └─ ✓ smoke-test complete

  ═══════════════════════════════════════════════════════════════
  ║  CATALOG GATE                                     [HUMAN]  ║
  ║                                                             ║
  ║  Modules: 28 scanned                                        ║
  ║    WORKS: 18 | BROKEN: 4 | PARTIAL: 5 | MISSING: 1         ║
  ║  Endpoints: 38/42 passing                                   ║
  ║  Silent failures: 3 found                                   ║
  ║                                                             ║
  ║  Say 'approved' to proceed to TRIAGE.                       ║
  ═══════════════════════════════════════════════════════════════

User: approved

  ══════════════════════════════════════
    TRIAGE                        [2/6]
  ══════════════════════════════════════

  ┌─ triage (MoSCoW)
  │  Must:   6 items (core flows broken)
  │  Should: 8 items (UX degraded)
  │  Could:  5 items (polish)
  │  Won't:  3 items (next release)
  └─ ✓ triage complete

  ═══════════════════════════════════════════════════════════════
  ║  TRIAGE GATE                                      [HUMAN]  ║
  ║                                                             ║
  ║  Must: 6 | Should: 8 | Could: 5 | Won't: 3                ║
  ║                                                             ║
  ║  Say 'approved' to fix Must + Should (14 items).            ║
  ═══════════════════════════════════════════════════════════════

User: approved

  [FIX phase: works through 14 items...]
  [VERIFY phase: re-runs smoke tests, generates regression tests...]
  [SHIP phase: commits, deploys, updates docs...]

  ╔═════════════════════════════════════════════════════════════╗
  ║  COMPLETE LOOP — ITERATION 1 DONE                          ║
  ║                                                             ║
  ║  Fixed: 6 Must + 7 Should = 13 items                       ║
  ║  Remaining: 1 Should + 5 Could + 3 Won't                   ║
  ║  Tests: 61 passing (12 new regression tests)                ║
  ║  Deployed: ✓                                                ║
  ║                                                             ║
  ║  NEXT: /complete-loop (iteration 2) for remaining items     ║
  ╚═════════════════════════════════════════════════════════════╝
```

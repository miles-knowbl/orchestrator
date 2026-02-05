# Complete Loop

> Take nearly-done apps across the finish line.

## Purpose

The complete-loop is for apps that are **most of the way there** — features built, architecture decided, code exists — but haven't been systematically verified to actually work. The hard part isn't writing new code; it's finding everything that's broken and fixing it.

**Targets:** Apps at 60-90% completion with silent failures, data pipeline bugs, or UI/UX issues that are difficult to discover.

## Phase Structure

```
CATALOG ──► TRIAGE ──► FIX ──► VERIFY ──► SHIP ──► COMPLETE
   │           │                  │         │
   │[catalog]  │[triage]          │[verify]  │[ship]
   │ human     │ human            │ auto     │ auto
```

**6 phases, 28 skills (20 required, 8 optional), 4 gates**

## Phases

### CATALOG — What's actually broken?

The hardest and most valuable phase. Walk every module and feature, test each one, and document the state.

**Required skills:**
- `collect-bugs` — Breadth-first sweep of UI/UX/data/console bugs into prioritized backlog
- `pipeline-discovery` — Map backend data pipelines (triggers, steps, failure points)
- `ui-pipeline-discovery` — Map client-side interaction flows (state, context, feedback)
- `smoke-test` — Hit live endpoints, verify which features work vs. break

**Optional skills:**
- `architecture-review` — Structural issues blocking completion
- `taste-discovery` / `taste-eval` — Subjective quality scoring

**Output:** `COMPLETION-MANIFEST.md` — Every module tagged WORKS / BROKEN / PARTIAL / MISSING

**Gate:** Human reviews the manifest before proceeding.

### TRIAGE — MoSCoW prioritization

Apply the MoSCoW framework to everything found in CATALOG:

| Priority | Meaning | Action |
|----------|---------|--------|
| **Must** | Blocks launch. App unusable without this. | Fix in this loop. |
| **Should** | Degrades experience significantly. | Fix in this loop if time allows. |
| **Could** | Nice polish. Users can work around it. | Fix if easy, otherwise defer. |
| **Won't** | Out of scope for this release. | Document and defer. |

**Required skills:**
- `triage` — MoSCoW classification with rationale
- `failure-mode-analysis` — MECE taxonomy for backend failure modes
- `ui-failure-mode-analysis` — MECE taxonomy for UI failure modes (L5/L6 patterns)

**Optional skills:**
- `estimation` — Effort estimates for each fix
- `blocker-analyzer` — Dependency analysis for blocked items

**Output:** `TRIAGE.md` — Prioritized fix list with MoSCoW categories and effort estimates

**Gate:** Human approves prioritization before investing in fixes.

### FIX — Targeted engineering

Work through Must and Should items. Each fix follows the same pattern: reproduce, diagnose, fix, verify.

**Required skills:**
- `implement` — Write the fix
- `bug-reproducer` — Create reliable reproduction before fixing
- `code-verification` — Fast structural checks after each fix

**Optional skills:**
- `root-cause-analysis` — 5-whys for tricky bugs
- `debug-assist` — Systematic isolation for complex issues

**Approach:** Small, targeted changes. No refactoring beyond what's needed. Fix one thing at a time.

### VERIFY — Regression check

Re-run everything from CATALOG to confirm fixes landed and nothing new broke.

**Required skills:**
- `smoke-test` — Re-run all endpoint checks (before/after comparison)
- `integration-test` — Cross-system contract validation
- `test-generation` — Regression tests for all fixes
- `code-validation` — Semantic correctness checks
- `code-review` — 4-pass review (verification, validation, hygiene, maintainability)

**Optional skills:**
- `ui-interaction-test` — Walk UI pipeline flows
- `security-audit` — OWASP check

**Gate:** Auto — build passes, tests pass, smoke tests green.

### SHIP — Deploy and document

**Required skills:**
- `git-workflow` — Commit, PR, merge
- `document` — README, API docs, user guides
- `deploy` — Production deployment
- `distribute` — CI/CD pipeline confirmation
- `changelog-generator` — Structured changelog

**Optional skills:**
- `gotcha-documenter` — Non-obvious edge cases

**Gate:** Auto — deployed, CI green, docs updated.

### COMPLETE — Archive and propose next move

- Archive run to `~/.claude/runs/`
- Update dream state progress
- Propose next highest leverage move

## Deliverables

| File | Phase | Purpose |
|------|-------|---------|
| `COMPLETION-MANIFEST.md` | CATALOG | Every feature tagged WORKS/BROKEN/PARTIAL/MISSING |
| `BUG-BACKLOG.md` | CATALOG | Prioritized bug list with severity |
| `PIPELINE-MAP.md` | CATALOG | Backend + UI pipeline documentation |
| `SMOKE-TEST.md` | CATALOG | Pass/fail per feature endpoint |
| `TRIAGE.md` | TRIAGE | MoSCoW prioritized fix list |
| `FAILURE-MODES.md` | TRIAGE | MECE failure mode taxonomy |
| `CHANGELOG.md` | SHIP | What changed |
| `RETROSPECTIVE.md` | COMPLETE | Learnings and patterns |

## When to Use This Loop

**Use /complete-loop when:**
- App is 60-90% done — features exist but haven't been verified
- You suspect silent failures or data pipeline bugs
- The codebase builds but you're not confident everything works
- You want to ship but need to find what's left

**Use /engineering-loop instead when:**
- Starting from scratch or adding major new features
- Architecture decisions haven't been made yet
- You need full spec/scaffold/review cycle

**Use /bugfix-loop instead when:**
- You know exactly what's broken and just need to fix it
- Single known bug, not a systematic sweep

## Iteration

The complete-loop is iterative. After SHIP, if the CATALOG found Could/Won't items worth revisiting, run again with a narrower scope. Each iteration should have fewer Must items until the app is fully complete.

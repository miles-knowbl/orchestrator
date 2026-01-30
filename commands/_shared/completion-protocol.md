# Shared: Completion Protocol

> This section is included in all loop command definitions.

## On Completion

When this loop reaches the COMPLETE phase and finishes:

### 1. Generate Run Summary

```json
{
  "summary": {
    "loop": "{loop-name}",
    "organization": "{org-name}",
    "domain": "{domain-name or null}",
    "system": "{system-name}",
    "module": "{module-name or null}",
    "started_at": "ISO-timestamp",
    "completed_at": "ISO-timestamp",
    "duration_minutes": N,
    "outcome": "success | failed | abandoned",
    "phases_completed": N,
    "gates_passed": N,
    "deliverables": ["file1.md", "file2.md"],
    "checklist_progress": {
      "completed": N,
      "total": N
    },
    "opportunities_identified": N,
    "opportunities_pursued": N
  }
}
```

### 2. Archive Run

**Location:** `~/.claude/runs/{year-month}/{system}-{loop}-{timestamp}.json`

**Example:** `~/.claude/runs/2025-01/orchestrator-learning-loop-29T14-30-00.json`

**Contents:** Full state + summary (for historical analysis and cross-loop queries)

### 3. Update Dream State

At the appropriate tier(s) in the hierarchy:

| Tier | Update Location | What Gets Updated |
|------|-----------------|-------------------|
| Organization | `~/workspaces/{org}/.claude/DREAM-STATE.md` | Recent completions, master checklist |
| Domain | `~/workspaces/{org}/.claude/domains/{domain}/DREAM-STATE.md` | System progress, domain patterns |
| System | `{project}/.claude/DREAM-STATE.md` | Module progress, checklist items |
| Module | `{project}/src/{module}/DREAM-STATE.md` | Function status, completion criteria |

Actions:
- Mark completed checklist items
- Update module/system/domain progress percentages
- Append to "Recent Completions" section
- Promote patterns if applicable (module → system → domain → org)
- Record opportunities identified/pursued in opportunity backlog

### 4. Prune Active State

**Delete** the active state file (`{loop}-state.json`) from working directory.

**Result:** Next invocation of this loop starts fresh with context gathering.

### 5. Complete Run Tracking (REQUIRED)

Finalize the learning system's run tracking to persist signals and generate proposals:

```
Call: complete_run_tracking(executionId)

Response:
  runId: "run-xxx"
  newProposals: N
  summary: "Signals captured: X skills, Y section notes. New proposals: N."
```

This:
1. Persists all captured rubric scores and section recommendations to `memory/learning/signals.json`
2. Analyzes patterns against thresholds in `memory/learning/config.json`
3. Generates skill upgrade proposals when patterns warrant changes
4. Returns summary of learning captured from this run

**Skip condition:** If no `complete_skill()` calls included rubric data during this run, this step can be skipped.

**Note:** Rubric data is captured during execution via `complete_skill(rubric={...})`. This step finalizes and persists that data.

### 6. Leverage Proposal (REQUIRED)

Before showing the completion message, evaluate and propose the next highest leverage move.

**Evaluation Process:**

1. Load dream state checklist (what's incomplete?)
2. Enumerate available loops (static catalog + meta-loop wildcard)
3. Score each candidate against value equation:
   ```
          (DSA × 0.40) + (Downstream Unlock × 0.25) + (Likelihood × 0.15)
   V = ─────────────────────────────────────────────────────────────────────
                       (Time × 0.10) + (Effort × 0.10)
   ```
4. Select highest-value candidate
5. Present proposal with reasoning

**Output Format:**

```
══════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /{loop} → {target}

  Reasoning:
    • Dream State: {alignment explanation}
    • Downstream Unlock: {what this enables}
    • Likelihood: {confidence level and why}
    • Time/Effort: {estimate}

  Value Score: X.X/10

  Alternatives considered:
    2. /{loop} → {target} (V: X.X — {brief reason})
    3. /{loop} → {target} (V: X.X — {brief reason})

  Say 'go' to start, or specify a different loop.
══════════════════════════════════════════════════════════════
```

**If meta-loop needed (capability doesn't exist):**

```
  Recommended: /meta-loop → create "{new-loop-name}"

  Strategic Value (eventual capability): X.X/10
  Tactical Value (this action): X.X/10

  After completion: /{new-loop} → {target} (V: X.X)
```

**Record the decision** for learning/calibration:

```json
{
  "leverage_decision": {
    "timestamp": "ISO-timestamp",
    "candidates": [...],
    "selected": {...},
    "reasoning": "..."
  }
}
```

This is stored in both:
- The archived run JSON
- `memory/leverage/decisions.json` (append)

See `commands/_shared/leverage-protocol.md` for full protocol details.

### 7. Completion Message

```
══════════════════════════════════════════════════════════════
  Run archived: ~/.claude/runs/2025-01/orchestrator-{loop}-29T14-30-00.json
  Dream State updated: {repo}/.claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```

## Archival Directory Structure

```
~/.claude/runs/
├── 2025-01/
│   ├── orchestrator-engineering-loop-15T09-00-00.json
│   ├── orchestrator-engineering-loop-20T14-30-00.json
│   ├── orchestrator-learning-loop-29T14-30-00.json
│   └── dashboard-bugfix-loop-28T11-00-00.json
└── 2025-02/
    └── ...
```

## Querying Past Runs

Use `query_runs` to search archived executions:

```typescript
query_runs({
  loop: "engineering-loop",      // Filter by loop type
  system: "orchestrator",        // Filter by system
  since: "2025-01-01",          // Date range
  limit: 5                       // Max results
})
```

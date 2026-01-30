# Analysis Findings: Loop Architecture Review

**Date:** 2025-01-29
**Scope:** All 10 loop command definitions
**Focus:** Hierarchy awareness, archival patterns, unification gaps

---

## Executive Summary

**Current State:** 10 loops with consistent patterns but ZERO hierarchy awareness and NO archival logic.

**Key Findings:**
1. All loops follow similar state/phase/gate patterns — easy to unify
2. Engineering-loop has system-queue concept but not integrated with hierarchy
3. Universal retrospective pattern at COMPLETE phase — natural hook for archival
4. ~4,670 lines of loop definitions need updating

---

## Loop Inventory

| Loop | Phases | Gates | State File | Hierarchy | Archival |
|------|--------|-------|------------|-----------|----------|
| engineering-loop | 10 | 6 | loop-state.json | partial* | none |
| bugfix-loop | 7 | 4 | bugfix-state.json | none | none |
| proposal-loop | 6 | 5 | proposal-state.json | none | none |
| learning-loop | 5 | 2 | learning-state.json | none | none |
| meta-loop | 4 | 2 | meta-state.json | none | none |
| infra-loop | 5 | 2 | infra-state.json | none | none |
| distribution-loop | 4 | 2 | distribution-state.json | none | none |
| audit-loop | 5 | 3 | audit-state.json | none | none |
| deck-loop | 6 | 5 | deck-state.json | none | none |
| transpose-loop | 4 | 3 | transpose-state.json | none | none |

*Engineering-loop has `system-queue.json` for tracking systems but no Organization/Module awareness.

---

## Gap Analysis

### Gap 1: No Hierarchy Context

**Problem:** Loops don't know what Organization/System/Module they're operating within.

**Impact:**
- Cannot trace which System a bugfix belongs to
- Cannot correlate learning-loop improvements to specific systems
- Cannot query "show me all runs for System X"

**Current State:**
```json
// Current state file (all loops)
{
  "loop": "bugfix-loop",
  "phase": "IMPLEMENT"
  // No context about WHERE this is happening
}
```

**Target State:**
```json
{
  "loop": "bugfix-loop",
  "phase": "IMPLEMENT",
  "context": {
    "organization": "personal",
    "system": "orchestrator",
    "module": "execution-engine"
  }
}
```

### Gap 2: No Run Archival

**Problem:** When loops complete, state files remain. Next invocation sees "completed" loop instead of fresh start.

**Impact:**
- User must manually delete state files
- Historical runs not preserved for analysis
- Cannot query past executions

**Current State:**
```
loop completes → state file stays → next invocation confused
```

**Target State:**
```
loop completes → archive to runs/ → prune state → next invocation fresh
```

### Gap 3: No Cross-Loop Traceability

**Problem:** Cannot link related loop executions.

**Impact:**
- Learning-loop can't find engineering-loop runs to analyze
- Audit-loop findings can't link to bugfix-loop that addresses them
- No dependency graph of loop executions

### Gap 4: No Dream State Integration

**Problem:** Loops don't read from or write to Dream State documents.

**Impact:**
- No master checklist of "what done looks like"
- Progress not tracked at System/Module level
- No rollup from Module → System → Organization

---

## Patterns Identified

### Pattern 1: Universal Retrospective

All 10 loops end with `retrospective` skill in COMPLETE phase. This is the natural hook for:
- Archival logic
- Dream State updates
- Cross-loop linking

### Pattern 2: Consistent State Schema

All loops use:
```json
{
  "loop": "name",
  "version": "X.Y.Z",
  "phase": "CURRENT",
  "status": "active",
  "gates": {},
  "phases": {},
  "started_at": "ISO",
  "last_updated": "ISO"
}
```

Adding `context` field is non-breaking.

### Pattern 3: Gate Type Standardization

Three gate types across all loops:
- `human` — User must say "approved"
- `auto` — Programmatic pass/fail
- `conditional` — Auto-pass if condition not met

These can be extended with hierarchy-aware approvals.

### Pattern 4: Skills Library Integration

All loops reference skills via MCP:
```
mcp__skills-library__get_skill(name: "skill-name", includeReferences: true)
```

Skills can be enhanced with hierarchy context.

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing loop state files | Medium | High | Add `context` as optional field, migrate on resume |
| Large update scope (10 loops) | Certain | Medium | Create shared template, update incrementally |
| Archival directory permissions | Low | Medium | Check/create `~/.claude/runs/` on first archival |
| Cross-loop query performance | Low | Low | Index by system/loop/date for fast queries |

---

## Recommended Approach

### Approach: Shared Template + Incremental Update

1. **Create Shared Architecture Section**
   - Write once, include in all loops
   - Defines hierarchy context loading
   - Defines completion/archival protocol

2. **Update Engineering-Loop First**
   - Most complex, validates the pattern
   - Already has system-queue to integrate

3. **Roll Out to Other Loops**
   - Bugfix-loop (frequently used, high value)
   - Learning-loop (meta-improvement, validates learning)
   - Remaining loops in priority order

4. **Create query_runs Tool**
   - MCP tool to search archived runs
   - Enables cross-loop traceability

---

## Success Criteria

1. **All loops load Organization/System/Module context on init**
2. **All loops archive runs on completion and prune state**
3. **Dream State documents created/updated automatically**
4. **query_runs tool operational for searching history**
5. **Learning-loop can analyze runs by System**

---

## Appendix: Loop Details

### Engineering-Loop (Most Complex)
- 10 phases: INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP → COMPLETE
- 6 gates: spec (H), architecture (H), verification (A), validation (H), review (H), deploy (C)
- 14 skills
- Has: `dreamState`, `systemQueue` — closest to hierarchy model

### Bugfix-Loop
- 7 phases: INIT → DIAGNOSE → PLAN → IMPLEMENT → TEST → VERIFY → COMPLETE
- 4 gates: diagnosis (H), plan (H), verification (A), regression (H)
- Good candidate for Module-scoped execution

### Learning-Loop
- 5 phases: INIT → ANALYZE → IMPROVE → VALIDATE → COMPLETE
- 2 gates: analysis (H), improvement (H)
- Meta-loop that should consume archived runs

### Other Loops
- proposal-loop: 6 phases, 5 gates — evidence-based proposals
- meta-loop: 4 phases, 2 gates — creates new loops
- infra-loop: 5 phases, 2 gates — infrastructure provisioning
- distribution-loop: 4 phases, 2 auto gates — deployment
- audit-loop: 5 phases, 3 gates — read-only evaluation
- deck-loop: 6 phases, 5 gates — presentation generation
- transpose-loop: 4 phases, 3 gates — architecture extraction

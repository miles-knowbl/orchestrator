# Next Highest Leverage Move Protocol

> Always be thinking: "What's the next highest leverage move?"

## Purpose

This protocol ensures Claude Code continuously evaluates available actions against a value framework, selecting work that maximally benefits downstream progress toward the dream state. The goal is to sequence loops so that each completed loop creates leverage for subsequent loops, reaching "done" in the fewest loops possible while maintaining quality.

## Dual-Mode Operation

### Internal Mode (Every Response)

After every substantive response, Claude mentally evaluates:

```
┌─────────────────────────────────────────────────────────────┐
│ LEVERAGE CHECK (internal, not surfaced)                     │
├─────────────────────────────────────────────────────────────┤
│ 1. What actions are available right now?                    │
│ 2. Which moves the dream state needle most?                 │
│ 3. What does completing this unlock downstream?             │
│ 4. Am I on the highest-leverage path?                       │
└─────────────────────────────────────────────────────────────┘
```

This informs behavior but is NOT surfaced to the user mid-loop. It keeps Claude oriented toward leverage without interrupting flow.

### External Mode (Loop Boundaries)

At loop completion (COMPLETE phase), Claude MUST surface a proposal:

```
══════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /engineering-loop → auth-service module

  Reasoning:
    • Dream State: Unblocks 3 dependent modules (API, dashboard, mobile)
    • Likelihood: High — patterns established in user-service
    • Time: ~2 loops (auth + integration)
    • Effort: Medium — OAuth complexity, but well-documented

  Value Score: 8.2/10

  Alternatives considered:
    2. /bugfix-loop → fix flaky tests (V: 5.1 — tactical, no unlock)
    3. /learning-loop → review recent runs (V: 4.8 — useful but not urgent)

  Say 'go' to start, or specify a different loop.
══════════════════════════════════════════════════════════════
```

---

## Value Equation

```
         (Dream State Alignment × 0.40) + (Downstream Unlock × 0.25)
         + (Likelihood × 0.15)
Value = ───────────────────────────────────────────────────────────────
         (Time Required × 0.10) + (Effort Required × 0.10)
```

### Dimension Definitions

| Dimension | Weight | Scale | Definition |
|-----------|--------|-------|------------|
| **Dream State Alignment** | 40% | 1-10 | How directly does this move the checklist toward "done"? |
| **Downstream Unlock** | 25% | 1-10 | How many subsequent moves does this make easier/possible? |
| **Likelihood of Achievement** | 15% | 1-10 | Can we actually complete this given current context? |
| **Time Required** | 10% | 1-10 | Inverse: 10 = very fast, 1 = very slow |
| **Effort Required** | 10% | 1-10 | Inverse: 10 = low friction, 1 = high friction |

### Scoring Heuristics

**Dream State Alignment:**
- 10: Directly completes a module marked incomplete in dream state
- 7-9: Significant progress on an incomplete module
- 4-6: Indirect contribution (enables other modules)
- 1-3: Tangential or maintenance work

**Downstream Unlock:**
- 10: Unblocks 3+ other modules/loops
- 7-9: Unblocks 1-2 other modules/loops
- 4-6: Creates reusable patterns/infrastructure
- 1-3: Isolated improvement, minimal unlock

**Likelihood of Achievement:**
- 10: Clear path, patterns exist, dependencies met
- 7-9: Some unknowns but manageable
- 4-6: Significant unknowns or missing dependencies
- 1-3: Blocked or highly uncertain

**Time Required (inverse):**
- 10: Single loop, <1 hour
- 7-9: 1-2 loops, few hours
- 4-6: 3-5 loops, day+
- 1-3: Many loops, multi-day

**Effort Required (inverse):**
- 10: Well-trodden path, low cognitive load
- 7-9: Some complexity, manageable
- 4-6: Significant complexity or coordination
- 1-3: High complexity, many moving parts

---

## Action Menu

The menu of available actions is evaluated at each boundary:

### Static Catalog (Always Available)

| Loop | Typical Use Case |
|------|------------------|
| `/engineering-loop` | Build new modules, features, capabilities |
| `/bugfix-loop` | Fix specific bugs or issues |
| `/learning-loop` | Review runs, extract patterns, improve skills |
| `/meta-loop` | Create new loops, improve existing loops |
| `/proposal-loop` | Design and propose new capabilities |
| `/distribution-loop` | Ship changes to all targets |
| `/audit-loop` | Security, compliance, quality audits |
| `/infra-loop` | Infrastructure and deployment work |
| `/deck-loop` | Create presentations and documentation |
| `/transpose-loop` | Port patterns across systems |
| `/dream-loop` | Define or refine dream states |

### Wildcard Option (Dynamic)

When no existing loop fits the highest-leverage opportunity:

```
Recommended: /meta-loop → create "onboarding-loop"

Reasoning:
  • No existing loop handles user onboarding flows
  • Onboarding is blocking 2 modules in dream state
  • Creating this loop first enables 3 subsequent runs
  • After creation: /onboarding-loop becomes available

Value Score: 7.8/10 (includes creation overhead)
```

The wildcard follows the pattern:
1. Identify gap in loop catalog
2. Propose `/meta-loop` to create the missing loop
3. Factor creation overhead into value score
4. Note the subsequent loop as the "real" target

---

## Integration Points

### With Observe Skill

The `observe` skill performs **opportunity mapping** during INIT phase:
- Scans for bundling opportunities (multi-solve)
- Detects reframing candidates
- Surfaces paradigm shift possibilities

**Relationship to Leverage Protocol:**
- Observe identifies *opportunities* (what could be done)
- Leverage Protocol evaluates *priority* (what should be done next)
- They inform each other but operate at different moments:
  - Observe: Start of loop (what's possible?)
  - Leverage: End of loop (what's next?)

### With Dream State

The dream state provides:
- The checklist of modules/functions to complete
- Progress percentages for prioritization
- Dependencies between modules

**Leverage Protocol uses dream state to:**
- Score "Dream State Alignment" dimension
- Identify downstream unlocks via dependency graph
- Detect when "done" is achieved (no more loops needed)

### With Calibration Service

Historical data improves estimates:
- Actual time vs. estimated time for similar loops
- Success rates by loop type and context
- Effort patterns from rubric scores in learning service

**Leverage Protocol uses calibration to:**
- Ground "Time Required" and "Effort Required" scores
- Adjust "Likelihood" based on historical success
- Learn from past sequencing decisions

---

## State Tracking

At loop completion, record the leverage decision:

```json
{
  "leverage_decision": {
    "timestamp": "2026-01-30T18:00:00Z",
    "candidates": [
      {
        "loop": "engineering-loop",
        "target": "auth-service",
        "scores": {
          "dream_state_alignment": 9,
          "downstream_unlock": 8,
          "likelihood": 8,
          "time_required": 6,
          "effort_required": 5
        },
        "value_score": 8.2,
        "selected": true
      },
      {
        "loop": "bugfix-loop",
        "target": "flaky-tests",
        "value_score": 5.1,
        "selected": false
      }
    ],
    "reasoning": "Auth-service unblocks API, dashboard, and mobile modules"
  }
}
```

This feeds into the learning service for calibration.

---

## Anti-Patterns

### Don't Optimize Locally

❌ "Tests are failing, let's run bugfix-loop"
✅ "Tests are failing, but auth-service would unblock 3 modules. Fix tests as part of engineering-loop."

### Don't Ignore Compound Effects

❌ Picking high-alignment but low-unlock moves repeatedly
✅ Sometimes a lower-alignment move with high unlock is better

### Don't Skip the Evaluation

❌ "User asked for X, let's do X"
✅ "User asked for X. Is X the highest leverage? If not, propose alternative."

### Don't Over-Engineer the Loop Catalog

❌ Creating a new loop for every minor variation
✅ Use existing loops with scoped targets; create new loops only for genuinely novel workflows

---

## Example Evaluation

**Context:** Orchestrator system, 10/10 modules complete, just finished distribution-loop.

**Dream State Check:** All modules marked complete. But learning-service has new rubric features not yet validated in production.

**Menu Evaluation:**

| Loop | Target | DSA | DU | L | T | E | Value |
|------|--------|-----|----|----|---|---|-------|
| learning-loop | validate rubric system | 6 | 7 | 9 | 8 | 8 | 7.1 |
| engineering-loop | dashboard improvements | 5 | 4 | 8 | 7 | 7 | 5.4 |
| meta-loop | create validation-loop | 4 | 6 | 7 | 5 | 5 | 5.0 |
| audit-loop | security review | 3 | 2 | 9 | 8 | 9 | 4.2 |

**Recommendation:** `/learning-loop` → validate rubric system in production

**Reasoning:** Although dream state shows 100%, the newly shipped rubric features need validation. High likelihood (system is running), good downstream unlock (validated learning enables better skill improvement), reasonable time/effort.

---

## Protocol Versioning

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-30 | Initial protocol definition |
| 1.0.1 | 2026-01-30 | Added complete_run_tracking step to completion-protocol |

---

## References

- `~/.claude/CLAUDE.md` — Global instructions (add Leverage Protocol section)
- `commands/_shared/clarification-protocol.md` — Companion protocol for context gathering
- `skills/observe/SKILL.md` — Opportunity mapping skill
- `commands/_shared/completion-protocol.md` — Loop completion procedures

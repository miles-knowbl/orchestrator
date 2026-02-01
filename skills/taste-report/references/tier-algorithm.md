# Tier Algorithm

How to order checklist items by taste impact.

## The Three Tiers

```
                    TASTE IMPACT
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    TIER 1          TIER 2          TIER 3
  Critical Gap    Significant Gap   No Trace
   (floor≥3)       (floor<3)       (technical)
         │               │               │
    FIX FIRST     FIX BEFORE      FIX IF TIME
                    POLISH
```

## Tier Classification

### Tier 1: Taste-Critical

**Criteria:**
- Failure mode traced to a gap where `floor >= 3.0`
- These are "must-have" quality dimensions

**Why first:**
- Critical gaps block ship entirely
- Users will immediately notice these issues
- High impact on perceived quality

### Tier 2: Taste-Significant

**Criteria:**
- Failure mode traced to a gap where `floor < 3.0`
- These are "nice-to-have" quality dimensions

**Why second:**
- Significant gaps allow polish-then-ship
- Users may notice but not critical
- Medium impact on perceived quality

### Tier 3: Technical-Only

**Criteria:**
- Failure mode has no taste trace
- OR explicitly marked "no taste impact"

**Why last:**
- Users don't directly experience these
- Technical debt, not quality debt
- Low/no impact on perceived quality

## Assignment Algorithm

```python
def assign_tier(failure_mode, traces):
    # Check if traced to any gap
    for gap in traces:
        if failure_mode.id in gap.traced_failure_modes:
            if gap.floor >= 3.0:
                return TIER_1
            else:
                return TIER_2

    return TIER_3
```

## Ordering Within Tiers

### Tier 1/2 Ordering

```
1. Gap severity (score delta from floor)
   - Larger negative delta = higher priority
   - TG-001 (2.4, floor 2.5, delta -0.1) before TG-003 (2.9, floor 3.0, delta -0.1)

2. Relationship type
   - Direct causes before contributing
   - Contributing before correlated

3. Trace confidence
   - High confidence before medium
   - Medium before low

4. Effort (tiebreaker)
   - Small before medium before large
```

### Tier 3 Ordering

```
1. Severity code
   - S1 (Silent) — highest priority, most dangerous
   - S2 (Partial)
   - S3 (Visible)
   - S4 (Blocking) — lowest priority, usually already handled

2. Location code (tiebreaker)
   - L4 (Integration) before L1-L3
   - Cross-pipeline issues are higher risk

3. Effort (tiebreaker)
   - Small before medium before large
```

## Edge Cases

### Failure Mode in Multiple Traces

If a failure mode is traced to multiple gaps:
- Assign to highest tier (Tier 1 wins over Tier 2)
- List all gaps in the checklist entry

### Gap with No Traced Failure Modes

If a gap has no technical cause:
- Document in report as "non-technical gap"
- Resolution is content/design/process, not code

### Failure Mode with No Gap Impact

If a failure mode is traced but relationship is "correlated":
- Assign to Tier 3 (no direct taste impact)
- Note the correlation in documentation

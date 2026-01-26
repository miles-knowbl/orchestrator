# Variance Analysis

How to analyze the difference between estimated and actual effort to improve future estimates.

---

## Purpose

Variance analysis identifies systematic patterns in estimation errors. By understanding why estimates deviate from actuals, you can calibrate future estimates and improve process efficiency.

**When to Use This Guide:**
- After completing a system or significant capability
- During retrospectives to understand estimation patterns
- When calibration multipliers need adjustment
- When investigating chronic over- or under-estimation

---

## Basic Variance Formula

```
Variance = (Actual - Estimated) / Estimated * 100%

Alternative (ratio form):
Ratio = Actual / Estimated
```

### Interpretation

| Variance | Ratio | Interpretation |
|----------|-------|----------------|
| +50% | 1.5 | Took 50% longer (underestimate) |
| +20% | 1.2 | Took 20% longer (slight underestimate) |
| 0% | 1.0 | Perfect estimate |
| -20% | 0.8 | Took 20% less (slight overestimate) |
| -50% | 0.5 | Took 50% less (significant overestimate) |
| -80% | 0.2 | Took 80% less (major overestimate) |

### Example Calculation

```
System: metric-store
Estimated: 26 hours
Actual: 4.5 hours

Variance = (4.5 - 26) / 26 * 100% = -82.7%
Ratio = 4.5 / 26 = 0.17

Interpretation: Significantly overestimated (took only 17% of estimate)
```

---

## Variance Categories

### Acceptable Variance

| Range | Category | Action Required |
|-------|----------|-----------------|
| -20% to +20% | Acceptable | None - estimates are calibrated |

### Overestimation (Completed Faster)

| Range | Category | Action |
|-------|----------|--------|
| -20% to -35% | Moderate overestimate | Monitor pattern |
| -35% to -50% | Significant overestimate | Reduce estimates by 25% |
| -50% to -75% | Severe overestimate | Investigate root cause |
| < -75% | Extreme overestimate | Full estimate process review |

### Underestimation (Took Longer)

| Range | Category | Action |
|-------|----------|--------|
| +20% to +35% | Moderate underestimate | Increase estimates by 25% |
| +35% to +50% | Significant underestimate | Investigate scope creep |
| +50% to +100% | Severe underestimate | Review estimation process |
| > +100% | Critical | Post-mortem required |

---

## Systematic Variance Patterns

### By Complexity

Track variance by estimated complexity:

```json
{
  "byComplexity": {
    "S": {
      "samples": 12,
      "avgVariance": -15,
      "pattern": "slight_overestimate",
      "action": "S estimates are ~15% high, can reduce"
    },
    "M": {
      "samples": 18,
      "avgVariance": +5,
      "pattern": "accurate",
      "action": "M estimates are well calibrated"
    },
    "L": {
      "samples": 8,
      "avgVariance": +35,
      "pattern": "underestimate",
      "action": "L estimates should be increased 30%"
    },
    "XL": {
      "samples": 4,
      "avgVariance": +80,
      "pattern": "severe_underestimate",
      "action": "Break XL items into smaller pieces"
    }
  }
}
```

**Common Patterns:**
- Small tasks often overestimated (padding/overhead)
- Large tasks often underestimated (integration complexity)
- Medium tasks most accurate (sweet spot for estimation)

### By Phase

Track variance by SDLC phase:

```json
{
  "byPhase": {
    "SPEC": {
      "avgVariance": -25,
      "action": "Reduce spec time estimates"
    },
    "SCAFFOLD": {
      "avgVariance": -40,
      "action": "Scaffolding faster than expected with templates"
    },
    "IMPLEMENT": {
      "avgVariance": +30,
      "action": "Increase implementation estimates by 25%"
    },
    "TEST": {
      "avgVariance": +60,
      "action": "Double test time estimates"
    },
    "VERIFY": {
      "avgVariance": +20,
      "action": "Slightly increase verification time"
    }
  }
}
```

**Common Patterns:**
- Early phases (spec, scaffold) often overestimated
- Testing consistently underestimated
- Verification time depends on initial code quality

### By Skill

Track variance by skill applied:

```json
{
  "bySkill": {
    "architect": {
      "avgVariance": +10,
      "status": "acceptable"
    },
    "implement": {
      "avgVariance": +35,
      "status": "needs_adjustment",
      "adjustment": "Increase by 30%"
    },
    "test-generation": {
      "avgVariance": +65,
      "status": "critical",
      "adjustment": "Include test time in capability estimates"
    },
    "security-audit": {
      "avgVariance": +15,
      "status": "acceptable"
    }
  }
}
```

### By Execution Mode

Track variance by how work was executed:

```json
{
  "byExecutionMode": {
    "human-interrupted": {
      "avgVariance": +50,
      "note": "Context switching adds significant overhead"
    },
    "human-focused": {
      "avgVariance": +10,
      "note": "Baseline estimation target"
    },
    "agentic-supervised": {
      "avgVariance": -40,
      "note": "Faster but with gate waits"
    },
    "agentic-autonomous": {
      "avgVariance": -80,
      "note": "Continuous execution dramatically faster"
    }
  }
}
```

---

## Root Cause Categories

When variance exceeds acceptable ranges, categorize the cause:

### Scope Variance

Actual scope differed from estimated scope:

| Pattern | Likely Cause | Solution |
|---------|--------------|----------|
| Hidden requirements | Incomplete spec | Better clarifying questions |
| Scope creep | Changes during implementation | Change control process |
| Over-scoping | Estimated features not needed | Validate requirements first |
| Integration complexity | Dependencies not accounted | Map dependencies in spec |

### Execution Variance

Execution speed differed from expected:

| Pattern | Likely Cause | Solution |
|---------|--------------|----------|
| Faster than expected | Existing code/patterns reused | Reduce estimates for similar work |
| Slower than expected | Technical debt encountered | Add buffer for legacy code |
| Environment issues | Setup/tooling problems | Include setup time in estimates |
| Learning curve | New technology | Add learning time explicitly |

### External Variance

Factors outside the work itself:

| Pattern | Likely Cause | Solution |
|---------|--------------|----------|
| Waiting time | Gate approvals, reviews | Track active vs waiting time |
| Interruptions | Context switching | Use focused time blocks |
| Blockers | Dependencies, external teams | Add blocker buffer |
| Infrastructure | CI/CD, deployment issues | Separate infra estimates |

---

## Variance Breakdown Template

For each completed system:

```markdown
## Variance Analysis: [System Name]

### Summary

| Metric | Estimated | Actual | Variance |
|--------|-----------|--------|----------|
| Total | 26h | 4.5h | -82.7% |
| SPEC | 4h | 1h | -75% |
| SCAFFOLD | 2h | 0.25h | -87.5% |
| IMPLEMENT | 12h | 2h | -83.3% |
| TEST | 4h | 0.5h | -87.5% |
| VERIFY | 2h | 0.5h | -75% |
| DEPLOY | 2h | 0.25h | -87.5% |

### Breakdown by Source

| Source | Impact | Notes |
|--------|--------|-------|
| Scope | 0h | No scope changes |
| Execution | -21.5h | Agentic execution much faster |
| External | 0h | No blockers |

### Factors

- **Execution Mode:** agentic-autonomous
- **Familiarity:** Similar to previous work (templates available)
- **Complexity:** M (Medium)
- **Clear Spec:** Yes (detailed FEATURESPEC)

### Root Cause

Estimates were based on human-focused execution timing.
Agentic autonomous execution dramatically reduced all phases.

### Calibration Update

- Global multiplier adjustment: 0.17 (from 1.0)
- Confidence: Very Low (first agentic data point)
- Recommendation: Collect more agentic samples before trusting
```

---

## Calculating Calibration Adjustments

### From Variance to Multiplier

```typescript
function varianceToMultiplier(variancePercent: number): number {
  // Variance of +30% means 1.3x multiplier
  // Variance of -50% means 0.5x multiplier
  return 1 + (variancePercent / 100);
}

function ratioToMultiplier(ratio: number): number {
  // Ratio IS the multiplier
  return ratio;
}
```

### Averaging Multiple Samples

```typescript
function calculateAdjustment(samples: VarianceSample[]): number {
  if (samples.length < 3) {
    console.warn('Insufficient samples for reliable adjustment');
    return 1.0;  // No adjustment
  }

  const avgVariance = samples.reduce((sum, s) =>
    sum + (s.actual - s.estimated) / s.estimated, 0) / samples.length;

  return 1 + avgVariance;
}
```

### Weighted by Recency

```typescript
function recencyWeightedAdjustment(
  samples: VarianceSample[],
  halfLifeDays: number = 30
): number {
  const now = Date.now();
  let weightedSum = 0;
  let totalWeight = 0;

  for (const sample of samples) {
    const ageInDays = (now - sample.date) / (1000 * 60 * 60 * 24);
    const weight = Math.pow(0.5, ageInDays / halfLifeDays);

    const variance = (sample.actual - sample.estimated) / sample.estimated;
    weightedSum += variance * weight;
    totalWeight += weight;
  }

  return 1 + (weightedSum / totalWeight);
}
```

---

## Confidence by Sample Size

The reliability of variance analysis depends on sample size:

| Samples | Confidence | Recommendation |
|---------|------------|----------------|
| 1-2 | Very Low | Note pattern, don't adjust yet |
| 3-5 | Low | Apply 25% weight to adjustment |
| 6-10 | Medium | Apply 50% weight |
| 11-20 | High | Apply 75% weight |
| 21+ | Very High | Apply full adjustment |

### Confidence Calculation

```typescript
function calculateConfidence(sampleCount: number): {
  level: string;
  weight: number;
  margin: number;
} {
  if (sampleCount <= 2) {
    return { level: 'very_low', weight: 0, margin: 0.5 };
  } else if (sampleCount <= 5) {
    return { level: 'low', weight: 0.25, margin: 0.3 };
  } else if (sampleCount <= 10) {
    return { level: 'medium', weight: 0.5, margin: 0.2 };
  } else if (sampleCount <= 20) {
    return { level: 'high', weight: 0.75, margin: 0.1 };
  } else {
    return { level: 'very_high', weight: 1.0, margin: 0.05 };
  }
}
```

---

## Example Analysis

### Full Example

```markdown
## Variance Analysis Report

### System: metric-store
**Domain:** skills-library-mcp
**Date:** 2025-01-17
**Analyst:** agent-001

### Time Summary

| Phase | Est (h) | Act (h) | Var % | Notes |
|-------|---------|---------|-------|-------|
| SPEC | 4 | 1 | -75% | Detailed template helped |
| SCAFFOLD | 2 | 0.25 | -88% | Standard MCP structure |
| IMPLEMENT | 12 | 2 | -83% | Clear spec, reused patterns |
| TEST | 4 | 0.5 | -88% | Generated from spec |
| VERIFY | 2 | 0.5 | -75% | All tests passed |
| DEPLOY | 2 | 0.25 | -88% | Standard npm publish |
| **TOTAL** | **26** | **4.5** | **-83%** | |

### Variance Breakdown

**By Source:**
- Scope: 0% (no scope change)
- Execution: -83% (agentic autonomous)
- External: 0% (no blockers)

**Contributing Factors:**
1. Agentic autonomous execution (primary - ~70% of variance)
2. Clear detailed spec (secondary - ~15% of variance)
3. Reusable patterns available (tertiary - ~15% of variance)

### Root Cause Analysis

**Why 83% faster than estimated?**

1. **Why was it faster?**
   → Agentic execution without context switching

2. **Why did agentic execution help so much?**
   → No meetings, no interruptions, continuous focus

3. **Why were estimates so high?**
   → Based on historical human-paced development

4. **Why hadn't this been calibrated before?**
   → First agentic execution for this domain

**Root Cause:** Estimates calibrated for human execution, agentic execution fundamentally different.

### Calibration Impact

**Before:**
```json
{
  "global": { "multiplier": 1.0, "confidence": "none" }
}
```

**After:**
```json
{
  "global": { "multiplier": 0.17, "confidence": "very_low" },
  "byExecutionMode": {
    "agentic-autonomous": { "multiplier": 0.17, "samples": 1 }
  }
}
```

### Recommendations

1. **Collect more samples** before trusting 0.17x multiplier
2. **Track execution mode** separately from global calibration
3. **Create agentic-specific** estimation guidelines
4. **Preserve human estimates** for comparison/rollback

### Next Steps

- [ ] Apply to next 2 systems and observe
- [ ] If pattern holds, formalize agentic calibration
- [ ] Update estimation skill with execution mode factor
```

---

## Tracking Template

### Per-System Tracking

```json
{
  "systemId": "sys-001",
  "name": "metric-store",
  "date": "2025-01-17",
  "estimate": {
    "total": 26,
    "breakdown": {
      "SPEC": 4,
      "SCAFFOLD": 2,
      "IMPLEMENT": 12,
      "TEST": 4,
      "VERIFY": 2,
      "DEPLOY": 2
    },
    "complexity": "M",
    "assumptions": [
      "Human-paced development",
      "Some context switching expected"
    ]
  },
  "actual": {
    "total": 4.5,
    "breakdown": {
      "SPEC": 1,
      "SCAFFOLD": 0.25,
      "IMPLEMENT": 2,
      "TEST": 0.5,
      "VERIFY": 0.5,
      "DEPLOY": 0.25
    }
  },
  "variance": {
    "total": -82.7,
    "breakdown": {
      "SPEC": -75,
      "SCAFFOLD": -87.5,
      "IMPLEMENT": -83.3,
      "TEST": -87.5,
      "VERIFY": -75,
      "DEPLOY": -87.5
    }
  },
  "factors": {
    "executionMode": "agentic-autonomous",
    "scopeChange": "none",
    "blockers": [],
    "reuse": "high"
  },
  "rootCause": "Estimates based on human execution, agentic dramatically faster"
}
```

---

## Anti-Patterns

### What to Avoid

1. **Adjusting after single sample**
   - Wait for 3+ samples before adjusting
   - Single outliers can mislead

2. **Ignoring context**
   - Don't apply agentic multiplier to human work
   - Track factors separately

3. **Over-correcting**
   - Apply adjustments gradually
   - Use weighted averages

4. **Hiding variance**
   - Don't pad estimates to hide uncertainty
   - Track and communicate uncertainty explicitly

5. **Averaging unlike samples**
   - Don't mix execution modes in same average
   - Segment by relevant factors

---

## See Also

- [calibration-formulas.md](./calibration-formulas.md) - Statistical methods
- [confidence-levels.md](./confidence-levels.md) - Sample size guidance
- [retrospective-templates.md](../../../retrospective/references/retrospective-templates.md) - Full analysis templates

---

*Use variance analysis consistently to continuously improve estimation accuracy.*

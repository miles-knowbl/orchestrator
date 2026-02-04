# Calibration Factors

How calibration data is calculated and applied.

## Personal Multiplier

### Calculation

```
personal_multiplier = average(actual_duration / estimated_duration)
```

Over the last N completed executions (default N=20).

### Interpretation

| Multiplier | Meaning |
|------------|---------|
| < 0.9 | Consistently faster than estimates |
| 0.9-1.1 | Well calibrated |
| 1.1-1.5 | Consistently slower than estimates |
| > 1.5 | Significantly underestimating effort |

### Application

```typescript
calibrated_estimate = base_estimate * personal_multiplier
```

## Loop-Specific Adjustments

Different loops have different baseline durations:

| Loop | Base Duration | Typical Range |
|------|---------------|---------------|
| engineering-loop | 3 hours | 1-8 hours |
| bugfix-loop | 1 hour | 30 min - 3 hours |
| distribution-loop | 30 min | 15 min - 1 hour |
| learning-loop | 45 min | 30 min - 2 hours |

## Accuracy Metrics

### Overall Accuracy

```
accuracy = 1 - average(abs(actual - estimated) / actual)
```

### Per-Loop Accuracy

Same formula, filtered by loop type.

### Confidence Level

Based on sample size:

| Sample Size | Confidence |
|-------------|------------|
| < 5 | Low |
| 5-15 | Medium |
| > 15 | High |

## Drift Detection

### Warning Triggers

1. Accuracy drops below 70%
2. Last 5 estimates all in same direction (over or under)
3. Personal multiplier changes >20% from previous period

### Remediation

1. Review recent executions for anomalies
2. Adjust base estimates if systematic
3. Consider loop complexity changes
4. Flag for manual calibration review

## Context for Async

During async operation:
- Use calibrated estimates for queue planning
- Factor in time-of-day adjustments (evening work slower)
- Account for mobile context (interruptions likely)

### Mobile Adjustment

```typescript
const mobileMultiplier = 1.3; // 30% longer when mobile
const asyncEstimate = calibrated_estimate * mobileMultiplier;
```

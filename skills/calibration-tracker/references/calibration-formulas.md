# Calibration Formulas

Statistical methods for improving estimate accuracy.

---

## Core Concept

Calibration adjusts future estimates based on historical accuracy:

```
Adjusted Estimate = Base Estimate × Calibration Multiplier
```

---

## Basic Ratio Calculation

For each completed system:

```
Ratio = Actual Hours / Estimated Hours
```

Examples:
- Estimated 26h, Actual 4.5h → Ratio = 0.17
- Estimated 10h, Actual 15h → Ratio = 1.5
- Estimated 20h, Actual 20h → Ratio = 1.0

### Interpretation

| Ratio | Meaning |
|-------|---------|
| < 0.5 | Significantly overestimated |
| 0.5-0.8 | Moderately overestimated |
| 0.8-1.2 | Accurate |
| 1.2-1.5 | Moderately underestimated |
| > 1.5 | Significantly underestimated |

---

## Calibration Multiplier

### Simple Average

For small sample sizes (< 10):

```
Multiplier = Sum(Ratios) / Count(Ratios)
```

### Weighted Average

Weight recent data more heavily:

```
Multiplier = Σ(Weight_i × Ratio_i) / Σ(Weight_i)

Where Weight_i = 1 / (age_in_days + 1)
```

### Exponential Moving Average

For continuous adjustment:

```
New_Multiplier = α × Latest_Ratio + (1 - α) × Previous_Multiplier

Where α = 0.3 (typical smoothing factor)
```

---

## Confidence Levels

How much to trust the multiplier:

| Samples | Confidence | Recommended Action |
|---------|------------|-------------------|
| 0 | None | Use 1.0x (no adjustment) |
| 1-2 | Very Low | Apply with wide range (±50%) |
| 3-5 | Low | Apply cautiously (±30%) |
| 6-10 | Medium | Apply normally (±20%) |
| 10-20 | Good | Apply confidently (±10%) |
| 20+ | High | Apply with tight range (±5%) |

### Confidence Formula

```
Confidence Score = min(samples / 20, 1.0)

Range = Base × (1 - Confidence Score × 0.45)
```

---

## Factor-Based Adjustments

Different contexts need different multipliers.

### By Execution Mode

| Mode | Typical Multiplier | Notes |
|------|-------------------|-------|
| Human, interrupted | 1.5-2.0x | Meetings, context switching |
| Human, focused | 1.0x | Baseline |
| Agentic, supervised | 0.5-0.8x | Faster but with gates |
| Agentic, autonomous | 0.2-0.4x | Continuous execution |

### By Complexity

| Complexity | Adjustment |
|------------|------------|
| S (Small) | 0.8x (often faster than estimated) |
| M (Medium) | 1.0x (baseline) |
| L (Large) | 1.2x (integration overhead) |
| XL (Extra Large) | 1.5x (unknowns accumulate) |

### By Familiarity

| Familiarity | Adjustment |
|-------------|------------|
| Novel domain | 1.5x |
| Similar to past work | 0.8x |
| Repeat of past work | 0.5x |

---

## Combined Adjustment

Apply multiple factors:

```
Final Multiplier = Global × Execution × Complexity × Familiarity × Confidence
```

Example:
- Global: 0.8 (historically overestimate by 20%)
- Execution: 0.3 (agentic autonomous)
- Complexity: 1.0 (medium)
- Familiarity: 0.8 (similar to past)
- Confidence: 0.6 (6 samples)

```
Final = 0.8 × 0.3 × 1.0 × 0.8 × 0.6 = 0.115
```

For 26h estimate: 26 × 0.115 ≈ 3 hours

---

## Variance Analysis

Understanding why estimates were off.

### Variance Breakdown

```
Total Variance = Scope Variance + Execution Variance + External Variance
```

Where:
- **Scope Variance**: Requirements changed, discovered complexity
- **Execution Variance**: Faster/slower than expected execution
- **External Variance**: Blockers, dependencies, interruptions

### Tracking Template

```json
{
  "record": {
    "estimated": 26,
    "actual": 4.5,
    "ratio": 0.17,
    "variance": {
      "scope": 0,
      "execution": -21.5,
      "external": 0
    },
    "factors": {
      "agenticExecution": true,
      "clearSpec": true,
      "existingPatterns": true
    }
  }
}
```

---

## Data Structure

### calibration.json

```json
{
  "domain": "skills-library-mcp",
  "records": [
    {
      "system": "Skills Library MCP",
      "date": "2025-01-17",
      "estimated": {
        "complexity": "M",
        "effortHours": 26
      },
      "actual": {
        "effortHours": 4.5
      },
      "ratio": 0.17,
      "factors": {
        "executionMode": "agentic-autonomous",
        "familiarity": "similar",
        "scopeChange": "none"
      },
      "notes": "First calibration point for agentic execution"
    }
  ],
  "adjustments": {
    "global": {
      "multiplier": 0.17,
      "confidence": "very-low",
      "basedOn": 1
    },
    "byExecutionMode": {
      "agentic-autonomous": {
        "multiplier": 0.17,
        "samples": 1
      }
    },
    "byComplexity": {
      "M": {
        "multiplier": 0.17,
        "samples": 1
      }
    }
  },
  "lastUpdated": "2025-01-17T12:00:00Z"
}
```

---

## Application Protocol

### Before Estimating

1. Load calibration data for domain
2. Identify relevant factors (execution mode, complexity, familiarity)
3. Look up multipliers for each factor
4. Calculate combined adjustment
5. Apply to base estimate
6. Document adjustments made

### After Completing

1. Record actual effort
2. Calculate ratio
3. Update relevant multipliers
4. Recalculate confidence
5. Document any unusual factors

---

## Gotchas

### Small Sample Bias

With few samples, individual outliers have huge impact. Use wide ranges until you have 10+ samples.

### Context Drift

Multipliers from one context may not apply to another. Track factors and use factor-specific multipliers when possible.

### Changing Conditions

As skills improve, multipliers should trend toward 1.0 for human execution, or stabilize for agentic execution. If they don't, investigate why.

### Self-Fulfilling Prophecy

If you know the multiplier, you might subconsciously adjust effort to match. Record actuals honestly.

---

*Use these formulas to continuously improve estimate accuracy.*

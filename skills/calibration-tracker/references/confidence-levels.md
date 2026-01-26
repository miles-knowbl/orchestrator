# Confidence Levels

How to assess and communicate the reliability of calibration data.

---

## Purpose

Confidence levels indicate how much to trust calibration multipliers and estimates. With few data points, multipliers are unstable and should be applied cautiously. As samples accumulate, confidence increases and multipliers become more reliable.

**When to Use This Guide:**
- Deciding how much to adjust estimates based on calibration
- Communicating uncertainty in estimates to stakeholders
- Determining when calibration data is mature enough to trust
- Setting appropriate ranges around point estimates

---

## Confidence Scale

| Level | Samples | Score Range | Meaning | Trust Weight |
|-------|---------|-------------|---------|--------------|
| **None** | 0 | 0% | No data, use defaults | 0% |
| **Very Low** | 1-2 | 1-20% | Guess, minimal data | 10% |
| **Low** | 3-5 | 21-40% | Limited data, high uncertainty | 25% |
| **Medium** | 6-10 | 41-60% | Some data, moderate uncertainty | 50% |
| **High** | 11-20 | 61-80% | Good data, low uncertainty | 75% |
| **Very High** | 21+ | 81-100% | Extensive data, very predictable | 100% |

### Visual Representation

```
Samples:     0      1-2     3-5     6-10    11-20    21+
             │       │       │        │        │       │
Confidence:  ├───────┼───────┼────────┼────────┼───────┤
             None   VeryLow  Low    Medium   High   VeryHigh
             │       │       │        │        │       │
Trust:       0%     10%     25%     50%      75%    100%
             │       │       │        │        │       │
Range:       N/A    ±50%    ±30%    ±20%     ±10%    ±5%
```

---

## Factors Affecting Confidence

### Sample Size (Primary Factor)

```
samples = 0     → confidence = 0%
samples = 1-2   → confidence -= 40%
samples = 3-5   → confidence -= 20%
samples = 6-10  → confidence += 0%
samples = 11-20 → confidence += 10%
samples = 21+   → confidence += 20%
```

### Variance Consistency

How consistent are the samples?

```
stdDev < 10%  → confidence += 20% (very consistent)
stdDev 10-25% → confidence += 0%  (normal)
stdDev 25-50% → confidence -= 20% (inconsistent)
stdDev > 50%  → confidence -= 40% (highly variable)
```

**Example:**
- 10 samples with stdDev of 8%: Base 60% + 20% = 80% (High)
- 10 samples with stdDev of 35%: Base 60% - 20% = 40% (Low)

### Recency

How old is the data?

```
data < 1 week old   → confidence += 10%
data 1-4 weeks old  → confidence += 0%
data 1-3 months old → confidence -= 10%
data > 3 months old → confidence -= 20%
```

### Domain Similarity

Does the calibration data match the current work?

```
same domain/stack     → confidence += 10%
similar domain/stack  → confidence += 0%
different domain/stack → confidence -= 20%
```

---

## Calculating Confidence

### Basic Algorithm

```typescript
interface ConfidenceInput {
  samples: number;
  variances: number[];
  lastUpdated: Date;
  domainMatch: 'same' | 'similar' | 'different';
}

interface ConfidenceResult {
  level: string;
  score: number;
  trustWeight: number;
  range: number;
  recommendation: string;
}

function calculateConfidence(data: ConfidenceInput): ConfidenceResult {
  let confidence = 50; // Base starting point

  // Sample size adjustment
  if (data.samples === 0) {
    return {
      level: 'none',
      score: 0,
      trustWeight: 0,
      range: 0,
      recommendation: 'No calibration data - use 1.0x multiplier'
    };
  } else if (data.samples < 3) {
    confidence -= 40;
  } else if (data.samples < 6) {
    confidence -= 20;
  } else if (data.samples > 20) {
    confidence += 20;
  } else if (data.samples > 10) {
    confidence += 10;
  }

  // Variance consistency adjustment
  const stdDev = calculateStdDev(data.variances);
  if (stdDev < 0.1) {
    confidence += 20;
  } else if (stdDev > 0.5) {
    confidence -= 40;
  } else if (stdDev > 0.25) {
    confidence -= 20;
  }

  // Recency adjustment
  const ageWeeks = (Date.now() - data.lastUpdated.getTime()) /
                   (7 * 24 * 60 * 60 * 1000);
  if (ageWeeks < 1) {
    confidence += 10;
  } else if (ageWeeks > 12) {
    confidence -= 20;
  } else if (ageWeeks > 4) {
    confidence -= 10;
  }

  // Domain similarity adjustment
  if (data.domainMatch === 'same') {
    confidence += 10;
  } else if (data.domainMatch === 'different') {
    confidence -= 20;
  }

  // Clamp to valid range
  confidence = Math.max(0, Math.min(100, confidence));

  return scoreToResult(confidence);
}

function scoreToResult(score: number): ConfidenceResult {
  if (score <= 0) {
    return { level: 'none', score, trustWeight: 0, range: 0,
             recommendation: 'No data - use defaults' };
  } else if (score <= 20) {
    return { level: 'very_low', score, trustWeight: 0.1, range: 0.5,
             recommendation: 'Note pattern, don\'t adjust yet' };
  } else if (score <= 40) {
    return { level: 'low', score, trustWeight: 0.25, range: 0.3,
             recommendation: 'Apply 25% weight to adjustment' };
  } else if (score <= 60) {
    return { level: 'medium', score, trustWeight: 0.5, range: 0.2,
             recommendation: 'Apply 50% weight to adjustment' };
  } else if (score <= 80) {
    return { level: 'high', score, trustWeight: 0.75, range: 0.1,
             recommendation: 'Apply 75% weight, reliable data' };
  } else {
    return { level: 'very_high', score, trustWeight: 1.0, range: 0.05,
             recommendation: 'Full trust in calibration' };
  }
}

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) =>
    sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}
```

### Continuous Confidence Score

For smoother progression:

```typescript
function continuousConfidenceScore(sampleCount: number): number {
  // Asymptotic curve approaching 1.0
  // At 5 samples: ~0.4
  // At 10 samples: ~0.6
  // At 20 samples: ~0.8
  // At 30 samples: ~0.9
  return 1 - Math.exp(-sampleCount / 15);
}
```

---

## Applying Confidence to Estimates

### Weighted Multiplier Application

Don't apply the full calibration multiplier at low confidence:

```typescript
function applyCalibration(
  baseEstimate: number,
  multiplier: number,
  confidence: ConfidenceResult
): CalibratedEstimate {
  // Blend between 1.0 (no adjustment) and calibrated multiplier
  const effectiveMultiplier = 1 + (multiplier - 1) * confidence.trustWeight;

  const pointEstimate = baseEstimate * effectiveMultiplier;
  const range = pointEstimate * confidence.range;

  return {
    point: Math.round(pointEstimate * 10) / 10,
    low: Math.round((pointEstimate - range) * 10) / 10,
    high: Math.round((pointEstimate + range) * 10) / 10,
    confidence: confidence.level,
    score: confidence.score
  };
}
```

**Example:**
```
Base estimate: 10h
Calibration multiplier: 0.5 (historically 50% faster)
Confidence: Low (trustWeight: 0.25)

Effective multiplier: 1 + (0.5 - 1) * 0.25 = 0.875
Point estimate: 10 * 0.875 = 8.75h
Range (30%): 8.75 * 0.3 = 2.6h

Result: 8.75h (6.1h - 11.4h), Low confidence
```

### Estimate Ranges by Confidence

| Confidence | Point | Low | High | Display |
|------------|-------|-----|------|---------|
| None | 10h | - | - | "~10h (no calibration)" |
| Very Low | 9.5h | 4.8h | 14.3h | "10h (5-14h range)" |
| Low | 8.8h | 6.1h | 11.4h | "9h (6-11h)" |
| Medium | 8h | 6.4h | 9.6h | "8h (6-10h)" |
| High | 7.5h | 6.8h | 8.3h | "7.5h +/- 45min" |
| Very High | 7h | 6.7h | 7.4h | "7h +/- 20min" |

---

## Displaying Confidence

### In Estimates

```markdown
## Estimate: metric-store

| Phase | Hours | Confidence | Range |
|-------|-------|------------|-------|
| SPEC | 1h | High (72%) | 0.9-1.1h |
| IMPLEMENT | 6h | Medium (48%) | 4.8-7.2h |
| TEST | 2h | Low (35%) | 1.4-2.6h |
| **Total** | **9h** | **Medium (52%)** | **7.1-10.9h** |

**Note:** Implementation estimate has higher uncertainty due to limited
samples for this complexity level. Test estimates are based on similar
but not identical projects.
```

### In Calibration Data

```json
{
  "calibration": {
    "global": {
      "multiplier": 1.3,
      "confidence": {
        "level": "high",
        "score": 65,
        "trustWeight": 0.75
      },
      "samples": 12,
      "lastUpdated": "2025-01-17"
    },
    "byComplexity": {
      "S": {
        "multiplier": 0.8,
        "confidence": { "level": "high", "score": 70, "trustWeight": 0.75 },
        "samples": 15
      },
      "M": {
        "multiplier": 1.0,
        "confidence": { "level": "medium", "score": 55, "trustWeight": 0.5 },
        "samples": 8
      },
      "L": {
        "multiplier": 1.5,
        "confidence": { "level": "low", "score": 30, "trustWeight": 0.25 },
        "samples": 4
      },
      "XL": {
        "multiplier": 2.0,
        "confidence": { "level": "very_low", "score": 15, "trustWeight": 0.1 },
        "samples": 2
      }
    }
  }
}
```

### Visual Confidence Indicators

```
Very High: █████████████████████ (81-100%)
High:      ████████████████░░░░░ (61-80%)
Medium:    ███████████░░░░░░░░░░ (41-60%)
Low:       █████░░░░░░░░░░░░░░░░ (21-40%)
Very Low:  ██░░░░░░░░░░░░░░░░░░░ (1-20%)
None:      ░░░░░░░░░░░░░░░░░░░░░ (0%)
```

### Dashboard Display

```markdown
## Calibration Dashboard

### Global Calibration
**Multiplier:** 0.8x (tasks complete 20% faster)
**Confidence:** ████████████████░░░░░ High (65%)
**Based on:** 12 samples
**Range:** 0.72x - 0.88x

### By Execution Mode
| Mode | Multiplier | Confidence | Samples |
|------|------------|------------|---------|
| Agentic Autonomous | 0.20x | ██░░░░░░░░ Very Low | 2 |
| Agentic Supervised | 0.45x | █████░░░░░ Low | 4 |
| Human Focused | 1.00x | ████████████████░░░░░ High | 12 |

### By Complexity
| Size | Multiplier | Confidence | Samples |
|------|------------|------------|---------|
| S | 0.80x | ████████████████░░░░░ High | 15 |
| M | 1.00x | ███████████░░░░░░░░░░ Medium | 8 |
| L | 1.50x | █████░░░░░░░░░░░░░░░░ Low | 4 |
| XL | 2.00x | ██░░░░░░░░░░░░░░░░░░░ Very Low | 2 |

### Recommendations
- **Small tasks:** Well calibrated, trust estimates
- **Medium tasks:** Moderate confidence, expect some variance
- **Large tasks:** Add 30% buffer, need more samples
- **XL tasks:** Consider breaking down, estimates unreliable
```

---

## Using Confidence in Decisions

| Confidence | Estimate Behavior | Commitment Level |
|------------|-------------------|------------------|
| None | Use 1.0x, add 50% buffer | Cannot commit |
| Very Low | Note pattern, add 50% buffer, flag for review | Cannot commit |
| Low | Apply 25% weight, add 30% buffer | Soft commitment |
| Medium | Apply 50% weight, use as-is | Normal commitment |
| High | Apply 75% weight, can commit | Firm commitment |
| Very High | Apply 100%, tight deadlines OK | Hard commitment |

### Decision Examples

**Low Confidence (35%):**
```
Base estimate: 10h
Calibration suggests: 7h (0.7x multiplier)
Effective estimate: 10 * (1 + (0.7-1)*0.25) = 9.25h
With 30% buffer: 12h
Commitment: "Likely 1.5 days, could be 2"
```

**High Confidence (75%):**
```
Base estimate: 10h
Calibration suggests: 7h (0.7x multiplier)
Effective estimate: 10 * (1 + (0.7-1)*0.75) = 7.75h
With 10% buffer: 8.5h
Commitment: "8 hours, half-day buffer"
```

---

## Improving Confidence

### Strategies

1. **Complete more systems** - More samples = higher confidence
   - Target: 6+ samples for medium confidence
   - Target: 20+ samples for very high confidence

2. **Track consistently** - Use journey-tracer for every skill
   - Record all timing data
   - Include factors (complexity, execution mode)

3. **Segment appropriately** - Group similar work together
   - By complexity (S/M/L/XL)
   - By execution mode (agentic vs human)
   - By domain/technology

4. **Review regularly** - Update calibration data weekly
   - Check for data staleness
   - Remove or flag outliers

5. **Handle outliers carefully** - Don't let anomalies skew data
   - Investigate unusual samples
   - Keep but flag outliers

### Confidence Building Timeline

```markdown
## Confidence Maturation

### Week 1-2: Bootstrap (Target: Very Low → Low)
- Complete 3-5 small systems
- Track all timing meticulously
- Note execution factors
- Expected: Low confidence (3-5 samples)

### Week 3-4: Validation (Target: Low → Medium)
- Complete 3-5 more systems
- Validate initial patterns
- Identify consistent factors
- Expected: Medium confidence (6-10 samples)

### Week 5-8: Stabilization (Target: Medium → High)
- Normal work pace
- Continue tracking
- Start segmenting by factors
- Expected: High confidence (11-20 samples)

### Week 9+: Maturity (Target: High → Very High)
- Maintain data collection
- Monitor for drift
- Periodic recalibration review
- Expected: Very High confidence (21+ samples)
```

---

## Edge Cases

### Mixed Confidence Factors

When different factors have different confidence:

```typescript
function combinedConfidence(factors: ConfidenceResult[]): ConfidenceResult {
  // Use minimum confidence (most conservative)
  const minScore = Math.min(...factors.map(f => f.score));
  return scoreToResult(minScore);
}

// Example:
// Global: High (65%)
// Execution Mode: Low (30%)
// Complexity: Medium (50%)
// Combined: Low (30%) - use lowest
```

### Confidence Decay

Old data becomes less reliable:

```typescript
function applyDecay(
  baseConfidence: number,
  lastUpdated: Date,
  halfLifeDays: number = 90
): number {
  const ageInDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.pow(0.5, ageInDays / halfLifeDays);
  return baseConfidence * decayFactor;
}
```

### Outlier Impact

One outlier in small samples:

```
3 samples: [0.8, 0.9, 2.5]
With outlier: avg=1.4, stdDev=0.76 → confidence penalty
Without: avg=0.85, stdDev=0.05 → no penalty

Recommendation: Flag but don't remove outliers until investigated
```

---

## Anti-Patterns

1. **Ignoring confidence** - Using calibration multipliers without considering confidence
2. **Over-trusting early data** - Fully applying multipliers with 2-3 samples
3. **Hiding uncertainty** - Giving point estimates without ranges
4. **Not segmenting** - Mixing agentic and human data
5. **Stale calibration** - Using data from 6+ months ago without decay

---

## See Also

- [calibration-formulas.md](./calibration-formulas.md) - Statistical methods
- [variance-analysis.md](./variance-analysis.md) - Understanding deviations
- [estimation references](../../estimation/references/) - Estimation skill guidance

---

*Confidence levels ensure calibration is applied appropriately to the data quality available.*

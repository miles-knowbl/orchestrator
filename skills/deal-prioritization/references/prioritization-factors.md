# Prioritization Factors Reference

What drives deal priority.

## The Four Factors

### Factor 1: Value (30%)

**Purpose:** Bigger deals deserve more attention.

**Calculation:**
1. Rank all deals by value
2. Calculate percentile
3. Convert to score

| Percentile | Score Range |
|------------|-------------|
| 90-100% | 95-100 |
| 75-89% | 80-94 |
| 50-74% | 60-79 |
| 25-49% | 40-59 |
| 0-24% | 20-39 |

**Adjustments:**
- Strategic account: +10
- Expansion opportunity: +5
- Reference potential: +5

**Example:**
```
Deal: $250K
Pipeline: $50K, $100K, $150K, $200K, $250K, $300K, $400K
Percentile: 71st
Base Score: 71
Strategic: No
Final Value Factor: 71
```

### Factor 2: Health (25%)

**Purpose:** Focus on winnable deals.

**Calculation:** Direct from Deal Health score.

| Health Score | Factor Score |
|--------------|--------------|
| 80-100 | 80-100 |
| 60-79 | 60-79 |
| 40-59 | 40-59 |
| 20-39 | 20-39 |
| 0-19 | 0-19 |

**Why 1:1 mapping:**
- Health already incorporates multiple factors
- Simple and transparent
- Easy to understand impact

**Note:** Very low health (<30) may indicate deal should be deprioritized regardless of value.

### Factor 3: Urgency (25%)

**Purpose:** Time-sensitive deals need immediate attention.

**Components:**
1. **Decision timeline** (when they'll decide)
2. **Deadline pressure** (external forcing function)
3. **Competitive pressure** (competitor activity)

**Decision Timeline Score:**

| Timeline | Score |
|----------|-------|
| This week | 100 |
| Next 2 weeks | 85 |
| This month | 70 |
| Next 2 months | 55 |
| This quarter | 40 |
| Next quarter | 25 |
| No timeline | 30 |
| 6+ months | 15 |

**Adjustments:**
- Hard deadline: +15
- Active competitor: +10
- Quarter/year end: +10
- Budget expiring: +15

**Example:**
```
Decision: This month (70)
Hard deadline: Yes (+15)
Competitor: No
Final Urgency Factor: 85
```

### Factor 4: Movability (20%)

**Purpose:** Prioritize deals that will actually move with effort.

**Definition:** Likelihood that investing time will advance the deal.

**Scoring:**

| Situation | Score |
|-----------|-------|
| Clear next step, champion pushing | 95-100 |
| Next step agreed, good momentum | 80-94 |
| Path forward, some uncertainty | 65-79 |
| Possible path, obstacles exist | 50-64 |
| Unclear, needs exploration | 35-49 |
| Blocked, no clear path | 20-34 |
| Stuck, unlikely to move | 0-19 |

**High Movability Indicators:**
- Champion actively engaged
- Next meeting scheduled
- Specific action will advance
- No blockers identified
- Momentum visible

**Low Movability Indicators:**
- Champion gone cold
- No clear next step
- Blocked by external factor
- Waiting on them
- Multiple failed attempts

---

## Combined Formula

```
Priority Score = (Value × 0.30) + (Health × 0.25) +
                 (Urgency × 0.25) + (Movability × 0.20)
```

### Example Calculation

**Deal: ShopCo**
- Value: $250K (71st percentile) → Value Factor: 71
- Health: 72 → Health Factor: 72
- Timeline: This month, hard deadline → Urgency Factor: 85
- Movability: Clear next step, champion engaged → Movability Factor: 88

```
Priority = (71 × 0.30) + (72 × 0.25) + (85 × 0.25) + (88 × 0.20)
         = 21.3 + 18.0 + 21.25 + 17.6
         = 78.15
```

**Result:** Priority Score 78 → Focus Tier

---

## Factor Weight Rationale

| Factor | Weight | Why |
|--------|--------|-----|
| Value | 30% | Revenue impact |
| Health | 25% | Win probability |
| Urgency | 25% | Time sensitivity |
| Movability | 20% | Effort efficiency |

### Alternative Weightings

**Value-Heavy (revenue focus):**
- Value: 40%, Health: 25%, Urgency: 20%, Movability: 15%

**Velocity-Heavy (close fast):**
- Value: 25%, Health: 20%, Urgency: 35%, Movability: 20%

**Quality-Heavy (win rate focus):**
- Value: 20%, Health: 35%, Urgency: 20%, Movability: 25%

---

## Override Conditions

Sometimes override calculated priority:

| Condition | Override |
|-----------|----------|
| Executive request | Move to Focus |
| Strategic account | Move up one tier |
| At risk of loss | Move to Focus for intervention |
| Blocked externally | Move to Monitor |
| Waiting on customer | Move down one tier |

---

## Validation Questions

Before finalizing priority:

1. **Does this feel right?** (Sanity check)
2. **Am I over-prioritizing small deals?**
3. **Am I ignoring at-risk big deals?**
4. **Can I actually act on Focus tier?**
5. **Is anything urgent being missed?**

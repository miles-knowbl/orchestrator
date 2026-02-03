# NBA Formula Reference

How the Next Best Action score is calculated.

## The Formula

```
NBA Score = (Likelihood × 0.40) + (Effort Factor × 0.30) + (Champion Value × 0.30)
```

Where:
- **Likelihood**: 0-100 (probability of success)
- **Effort Factor**: 100 - Effort (lower effort = higher score)
- **Champion Value**: 0-100 (how much this helps champion)

## Component Definitions

### Likelihood (40% weight)

**Definition:** Probability that this action will achieve its intended outcome.

**Factors that increase likelihood:**
- Champion has offered to help
- Stakeholder is receptive
- Previous positive interactions
- Action matches their expressed needs
- Low organizational barriers

**Factors that decrease likelihood:**
- Stakeholder is skeptical
- Requires multiple approvals
- Champion doesn't have access
- Bad timing (vacation, reorg)
- Conflicting priorities

**Scoring Guide:**

| Likelihood Level | Score | Indicators |
|------------------|-------|------------|
| Very High | 90-100 | They asked for this, champion committed |
| High | 75-89 | Clear signal of receptivity |
| Medium | 50-74 | Reasonable chance, some uncertainty |
| Low | 25-49 | Possible but obstacles exist |
| Very Low | 0-24 | Significant barriers |

### Effort (30% weight)

**Definition:** Work required to execute this action.

**Note:** Lower effort = higher NBA score. We use **Effort Factor = 100 - Effort**.

**Effort includes:**
- Your time
- Internal resources
- External resources
- Coordination complexity
- Content creation

**Scoring Guide:**

| Effort Level | Score | Effort Factor | Example |
|--------------|-------|---------------|---------|
| Very Low | 10-20 | 80-90 | Send an email |
| Low | 21-40 | 60-79 | Schedule a meeting |
| Medium | 41-60 | 40-59 | Create a presentation |
| High | 61-80 | 20-39 | Build custom demo |
| Very High | 81-100 | 0-19 | Full technical POC |

### Champion Value (30% weight)

**Definition:** How much this action helps your champion succeed.

**High Champion Value actions:**
- Give champion ammunition for internal selling
- Make champion look good
- Address champion's concerns
- Help champion achieve their goals
- Reduce champion's risk

**Low Champion Value actions:**
- Don't involve champion
- Make champion's job harder
- Go around champion
- Add work for champion

**Scoring Guide:**

| Champion Value Level | Score | Description |
|---------------------|-------|-------------|
| Very High | 90-100 | Action directly enables champion to win |
| High | 70-89 | Significantly helps champion |
| Medium | 50-69 | Indirectly helps champion |
| Low | 25-49 | Neutral for champion |
| Very Low | 0-24 | Doesn't involve/help champion |

---

## Example Calculations

### Example 1: Build ROI Model for CFO

```
Likelihood: 85 (CFO is open to data, champion requested)
Effort: 30 (Medium work, but we have template)
Effort Factor: 100 - 30 = 70
Champion Value: 90 (Directly enables Sarah to convince CFO)

NBA Score = (85 × 0.40) + (70 × 0.30) + (90 × 0.30)
         = 34 + 21 + 27
         = 82
```

### Example 2: Cold outreach to CEO

```
Likelihood: 20 (No relationship, no intro)
Effort: 20 (Just an email)
Effort Factor: 100 - 20 = 80
Champion Value: 10 (Going around champion)

NBA Score = (20 × 0.40) + (80 × 0.30) + (10 × 0.30)
         = 8 + 24 + 3
         = 35
```

### Example 3: Request intro to CTO

```
Likelihood: 90 (Champion offered)
Effort: 10 (Ask via email)
Effort Factor: 100 - 10 = 90
Champion Value: 60 (Uses champion's network)

NBA Score = (90 × 0.40) + (90 × 0.30) + (60 × 0.30)
         = 36 + 27 + 18
         = 81
```

---

## Score Interpretation

| NBA Score | Recommendation |
|-----------|----------------|
| 80+ | Strong recommendation — do this |
| 60-79 | Good action — consider doing |
| 40-59 | Moderate — may be worth it |
| 20-39 | Weak — probably not worth it |
| <20 | Not recommended — avoid |

---

## Adjustments

### Stage-Based Adjustments

Some actions score higher/lower depending on deal stage:

| Stage | Boost | Penalize |
|-------|-------|----------|
| Lead | Research, outreach | Proposals, contracts |
| Discovery | Discovery meetings, demos | Close activities |
| Contracting | Negotiations, legal | Early-stage activities |

### Risk-Based Adjustments

Actions that address high risks get a boost:

```
If action addresses Critical risk: +10 to NBA Score
If action addresses High risk: +5 to NBA Score
```

### Urgency Adjustments

Time-sensitive actions get a boost:

```
If deadline within 7 days: +10 to NBA Score
If deadline within 30 days: +5 to NBA Score
```

---

## Formula Variations

### Aggressive Mode

When you need to move fast:

```
NBA Score = (Likelihood × 0.30) + (Effort Factor × 0.10) + (Champion Value × 0.20) + (Impact × 0.40)
```

Adds **Impact** factor and reduces Effort weight.

### Conservative Mode

When deal is fragile:

```
NBA Score = (Likelihood × 0.50) + (Effort Factor × 0.20) + (Champion Value × 0.30)
```

Increases Likelihood weight — only do high-probability actions.

---

## Comparison Framework

When comparing two actions:

1. Calculate NBA scores
2. If within 5 points, consider:
   - Which addresses more critical risk?
   - Which has shorter timeline?
   - Which requires fewer dependencies?
3. Choose higher score unless strong reason to override

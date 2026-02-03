# Pipeline Metrics Reference

Key metrics for pipeline analysis.

## Value Metrics

### Total Pipeline Value

**Definition:** Sum of all deal values in pipeline.

**Calculation:**
```
Total Value = Σ (Deal Value for all active deals)
```

**Use:** Raw pipeline size, capacity planning.

### Weighted Pipeline Value

**Definition:** Value adjusted by probability of closing.

**Calculation:**
```
Weighted Value = Σ (Deal Value × Stage Probability)
```

**Stage Probabilities:**

| Stage | Typical Probability |
|-------|---------------------|
| Lead | 10% |
| Target | 20% |
| Discovery | 35% |
| Contracting | 70% |
| Production | 90% |
| Closed-Won | 100% |

**Use:** Forecast accuracy, realistic pipeline.

### Pipeline Coverage

**Definition:** Ratio of pipeline to target/quota.

**Calculation:**
```
Coverage = Weighted Pipeline / Target × 100%
```

**Benchmarks:**
- <2x: Insufficient pipeline
- 2-3x: Healthy
- >4x: May be overestimating

---

## Volume Metrics

### Deal Count by Stage

**Definition:** Number of deals at each stage.

**Use:** Identify bottlenecks, stage health.

**Healthy distribution:**
- Lead: Many (wide top of funnel)
- Discovery: Moderate
- Contracting: Few (qualified)
- Production: Very few (high quality)

### Stage Conversion Rate

**Definition:** % of deals moving to next stage.

**Calculation:**
```
Conversion = Deals moved to Stage N+1 / Deals in Stage N
```

**Benchmarks (B2B SaaS):**
| Transition | Typical Rate |
|------------|--------------|
| Lead → Target | 30-50% |
| Target → Discovery | 40-60% |
| Discovery → Contracting | 30-50% |
| Contracting → Production | 70-80% |
| Production → Closed-Won | 80-90% |

### Win Rate

**Definition:** % of deals that close won.

**Calculation:**
```
Win Rate = Closed-Won / (Closed-Won + Closed-Lost) × 100%
```

**Benchmarks:**
- <20%: Poor qualification
- 20-30%: Average
- 30-40%: Good
- >40%: Excellent (or qualifying too tightly)

---

## Velocity Metrics

### Sales Cycle Length

**Definition:** Average days from Lead to Closed-Won.

**Calculation:**
```
Cycle Length = Average(Close Date - Create Date) for won deals
```

**Benchmarks:**
| Deal Size | Typical Cycle |
|-----------|---------------|
| <$25K | 30-60 days |
| $25K-$100K | 60-90 days |
| $100K-$250K | 90-120 days |
| >$250K | 120-180+ days |

### Stage Duration

**Definition:** Average days in each stage.

**Use:** Identify where deals stall.

**Warning signs:**
- Significantly above average
- Increasing over time
- Specific deals much longer

### Deal Velocity

**Definition:** How fast deals move through pipeline.

**Calculation:**
```
Velocity = # Deals × Avg Value × Win Rate / Cycle Length
```

---

## Health Metrics

### Average Deal Health

**Definition:** Mean health score across pipeline.

**Use:** Overall pipeline quality.

**Benchmarks:**
- <50: Weak pipeline
- 50-65: Moderate
- 65-75: Healthy
- >75: Strong

### Health Distribution

**Definition:** Count of deals by health tier.

| Tier | Score Range | Meaning |
|------|-------------|---------|
| Excellent | 80-100 | High confidence |
| Good | 60-79 | Solid deals |
| Moderate | 40-59 | Need work |
| Weak | <40 | At risk |

**Healthy distribution:**
- Majority in Good or Excellent
- Few in Weak
- Moderate deals have clear paths to improve

### At-Risk Deals

**Definition:** Deals with concerning indicators.

**Criteria:**
- Health score <40
- No contact in 14+ days
- Stalled in stage 30+ days
- Critical risk unaddressed
- Champion sentiment declining

---

## Trend Metrics

### Pipeline Growth

**Definition:** Change in pipeline value over time.

**Calculation:**
```
Growth = (Current Value - Previous Value) / Previous Value × 100%
```

**Track:**
- Week over week
- Month over month
- Quarter over quarter

### Stage Movement

**Definition:** Deals advancing or regressing.

**Track:**
- Deals moved forward
- Deals moved backward
- Deals stalled
- Deals closed (won/lost)

### Health Trend

**Definition:** Change in average health over time.

**Warning signs:**
- Declining average health
- More deals dropping to Weak
- Fewer deals in Excellent

---

## Reporting Periods

### Daily

Quick metrics:
- New leads
- Deals closed
- Urgent alerts

### Weekly

Standard review:
- Full snapshot
- Stage movement
- Health changes
- Actions needed

### Monthly

Deeper analysis:
- Win/loss analysis
- Conversion rates
- Cycle length trends
- Pipeline coverage

### Quarterly

Strategic review:
- Pipeline growth
- Forecast accuracy
- Win rate trends
- Segment analysis

---

## Metric Calculation Examples

### Example Pipeline

| Deal | Value | Stage | Health |
|------|-------|-------|--------|
| A | $100K | Discovery | 75 |
| B | $200K | Contracting | 85 |
| C | $50K | Lead | 40 |
| D | $150K | Discovery | 65 |

**Calculations:**

Total Value: $100K + $200K + $50K + $150K = **$500K**

Weighted Value:
- A: $100K × 35% = $35K
- B: $200K × 70% = $140K
- C: $50K × 10% = $5K
- D: $150K × 35% = $52.5K
- **Total: $232.5K**

Average Health: (75 + 85 + 40 + 65) / 4 = **66.25**

Health Distribution:
- Excellent (80+): 1 (Deal B)
- Good (60-79): 2 (Deal A, D)
- Weak (<40): 1 (Deal C)

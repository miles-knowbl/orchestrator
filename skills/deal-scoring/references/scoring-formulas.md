# Scoring Formulas Reference

Detailed formulas for each score component.

## AI Readiness Score (0-100)

**Purpose:** Measures prospect's readiness to successfully implement AI.

### Formula

```
AI Readiness = (Experience × 0.20) + (Capability × 0.25) +
               (Strategy × 0.25) + (Use Case × 0.30)
```

### Component Scoring

**Experience (0-100):**

| AI Maturity Level | Score |
|-------------------|-------|
| Mature (multiple AI systems) | 100 |
| Deployed (AI in production) | 80 |
| Attempted (tried, may have failed) | 50 |
| Exploring (researching) | 30 |
| No Experience | 10 |

**Capability (0-100):**

| Factor | Points |
|--------|--------|
| Dedicated AI/ML team | +30 |
| Data science resources | +20 |
| Modern data infrastructure | +20 |
| Clean, accessible data | +15 |
| API-ready systems | +15 |

**Strategy (0-100):**

| Factor | Points |
|--------|--------|
| Executive sponsor (C-level) | +40 |
| Formal AI strategy | +25 |
| Budget allocated | +20 |
| Change management plan | +15 |

**Use Case (0-100):**

| Factor | Points |
|--------|--------|
| Specific use case defined | +40 |
| Success criteria clear | +25 |
| Scope bounded | +20 |
| Timeline realistic | +15 |

---

## Deal Confidence Score (0-100)

**Purpose:** Measures likelihood of deal closing.

### Formula

```
Deal Confidence = (Budget × 0.25) + (Timeline × 0.20) +
                  (Champion × 0.25) + (Decision-Maker × 0.20) +
                  (Competition × 0.10)
```

### Component Scoring

**Budget (0-100):**

| Status | Score |
|--------|-------|
| Budget approved, amount confirmed | 100 |
| Budget approved, amount unclear | 80 |
| Budget expected, needs approval | 60 |
| Budget uncertain | 40 |
| Budget not discussed | 20 |
| No budget | 0 |

**Timeline (0-100):**

| Status | Score |
|--------|-------|
| Hard deadline confirmed | 100 |
| Soft target, high urgency | 80 |
| General timeframe (this quarter) | 60 |
| Vague timeline (this year) | 40 |
| No timeline | 20 |
| "Someday/eventually" | 10 |

**Champion (0-100):**

| Status | Score |
|--------|-------|
| Executive sponsor actively advocating | 100 |
| Strong champion with authority | 80 |
| Engaged champion, moderate authority | 60 |
| Interested contact, weak advocacy | 40 |
| Contact but not champion | 20 |
| No champion identified | 0 |

**Decision-Maker (0-100):**

| Status | Score |
|--------|-------|
| DM engaged and supportive | 100 |
| DM engaged, neutral | 70 |
| DM engaged, skeptical | 50 |
| DM identified, not engaged | 30 |
| DM unknown | 10 |

**Competition (0-100):**

| Status | Score |
|--------|-------|
| No competition identified | 90 |
| Competition eliminated | 85 |
| Competition negative (past bad experience) | 80 |
| Competition neutral | 60 |
| Active competitive evaluation | 50 |
| Competitor preferred | 20 |
| Strong competitor lead | 10 |

---

## Champion Strength Score (0-100)

**Purpose:** Measures quality of internal advocacy.

### Formula

```
Champion Strength = (Seniority × 0.25) + (Engagement × 0.30) +
                    (Authority × 0.25) + (Advocacy × 0.20)
```

### Component Scoring

**Seniority (0-100):**

| Level | Score |
|-------|-------|
| C-level | 100 |
| VP | 85 |
| Director | 70 |
| Manager | 50 |
| Individual Contributor | 30 |

**Engagement (0-100):**

| Behavior | Points |
|----------|--------|
| Proactively reaches out | +30 |
| Responds within 24 hours | +20 |
| Shares internal information | +20 |
| Makes introductions | +15 |
| Attends all meetings | +15 |

**Authority (0-100):**

| Factor | Points |
|--------|--------|
| Budget authority | +40 |
| Technical authority | +30 |
| Executive access | +30 |

**Advocacy (0-100):**

| Behavior | Points |
|----------|--------|
| Explicitly advocates internally | +40 |
| Uses "we" when discussing solution | +20 |
| Asks "how can we make this happen" | +20 |
| Provides competitive intelligence | +10 |
| Coaches on internal navigation | +10 |

---

## Use Case Clarity Score (0-100)

**Purpose:** Measures how well-defined the use case is.

### Formula

```
Use Case Clarity = (Specificity × 0.40) + (Scope × 0.30) +
                   (Success Criteria × 0.30)
```

### Component Scoring

**Specificity (0-100):**

| Level | Score | Description |
|-------|-------|-------------|
| Scoped | 100 | Detailed requirements, ready for implementation |
| Defined | 75 | Clear automation target, some details TBD |
| Exploring | 40 | General interest in AI, no specific use case |
| Vague | 20 | "We need AI" with no specifics |

**Scope (0-100):**

| Factor | Points |
|--------|--------|
| Bounded scope (not boiling ocean) | +40 |
| Clear in/out of scope | +30 |
| Phased approach defined | +20 |
| Dependencies identified | +10 |

**Success Criteria (0-100):**

| Factor | Points |
|--------|--------|
| Quantitative metrics defined | +40 |
| Baseline measured | +25 |
| Timeline for measurement | +20 |
| Stakeholder agreement on criteria | +15 |

---

## Deal Health (Composite)

**Purpose:** Overall deal quality score.

### Formula

```
Deal Health = (AI Readiness × 0.25) + (Deal Confidence × 0.35) +
              (Champion Strength × 0.20) + (Use Case Clarity × 0.20)
```

### Weight Rationale

| Component | Weight | Why |
|-----------|--------|-----|
| Deal Confidence | 35% | Most predictive of close |
| AI Readiness | 25% | Predicts success post-sale |
| Champion Strength | 20% | Internal advocacy critical |
| Use Case Clarity | 20% | Clarity speeds deal |

---

## Score Adjustments

### Positive Adjustments

| Factor | Adjustment |
|--------|------------|
| Inbound lead | +5 to Deal Confidence |
| Reference customer in same industry | +5 to Deal Confidence |
| Executive sponsor above champion | +10 to Champion Strength |
| Competitor failure | +10 to Competition factor |

### Negative Adjustments

| Factor | Adjustment |
|--------|------------|
| Past failed AI project | -10 to AI Readiness |
| Reorg in progress | -15 to Deal Confidence |
| Champion recently promoted | -10 to Champion Strength |
| Scope creep observed | -15 to Use Case Clarity |

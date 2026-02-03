# Impact Metrics Reference

How to measure action impact.

## Score-Based Metrics

### Deal Health Change

**What it measures:** Overall deal quality movement

**Calculation:**
```
Deal Health Impact = Deal Health (after) - Deal Health (before)
```

**Interpretation:**
| Change | Meaning |
|--------|---------|
| +10 or more | Major positive impact |
| +5 to +9 | Significant positive impact |
| +1 to +4 | Modest positive impact |
| 0 | No measurable impact |
| -1 to -4 | Modest negative impact |
| -5 or more | Significant negative impact |

### Component Score Changes

Track changes to individual components:

| Score | What It Reveals |
|-------|-----------------|
| AI Readiness | Did action improve implementation readiness? |
| Deal Confidence | Did action increase close likelihood? |
| Champion Strength | Did action help champion? |
| Use Case Clarity | Did action clarify scope? |

---

## Stakeholder-Based Metrics

### Sentiment Shifts

**What it measures:** How stakeholder feelings changed

**Positive shifts:**
- Skeptical → Neutral
- Neutral → Supportive
- Skeptical → Supportive (rare, valuable)

**Negative shifts:**
- Supportive → Neutral
- Neutral → Skeptical
- Supportive → Skeptical (red flag)

### Engagement Changes

| Metric | Positive | Negative |
|--------|----------|----------|
| Response time | Decreased | Increased |
| Response depth | More detailed | Shorter |
| Proactivity | More proactive | Less proactive |
| Meeting attendance | More reliable | Missing meetings |

### New Stakeholder Engagement

**What it measures:** Did action expand relationships?

Track:
- New stakeholders engaged
- Introduction success rate
- Meeting acceptance rate
- Stakeholder engagement depth

---

## Risk-Based Metrics

### Risk Level Changes

**What it measures:** Did action reduce risk?

**Positive:**
- Critical → High
- High → Medium
- Medium → Low
- Risk eliminated

**Negative:**
- New risk emerged
- Risk severity increased
- More risks than before

### Risk Mitigation Success Rate

```
Success Rate = Risks Mitigated / Risks Addressed
```

Track:
- Risks targeted by action
- Risks successfully reduced
- Risks unchanged
- New risks created

---

## Stage-Based Metrics

### Stage Progression

**What it measures:** Did action advance deal stage?

**Positive:**
- Moved to next stage
- Closer to stage exit criteria
- Unblocked stage progression

**Negative:**
- Stalled at current stage
- Regressed to earlier stage
- New stage blockers emerged

### Stage Exit Criteria Progress

Track progress on stage-specific requirements:

| Stage | Exit Criteria | Impact |
|-------|---------------|--------|
| Lead | Interest confirmed | Did action confirm interest? |
| Discovery | Needs understood | Did action clarify needs? |
| Contracting | Terms agreed | Did action advance terms? |

---

## Timeline-Based Metrics

### Deal Velocity

**What it measures:** Did action accelerate the deal?

Track:
- Days in current stage before/after
- Time to next milestone
- Overall expected close date

### Responsiveness

```
Responsiveness Impact = Response Time (after) - Response Time (before)
```

Track:
- Champion response time
- Stakeholder response time
- Meeting scheduling speed

---

## Outcome-Based Metrics

### Intended vs. Actual Outcome

For each action, compare:

| Intended | Actual | Rating |
|----------|--------|--------|
| CFO has ROI data | CFO reviewed, asked questions | Exceeded |
| Meeting scheduled | Meeting scheduled | Met |
| Objection addressed | Objection partially addressed | Partial |
| Intro made | Intro declined | Not met |

### Outcome Quality Score

```
Outcome Quality = Actual Value / Intended Value × 100
```

| Score | Meaning |
|-------|---------|
| 120%+ | Exceeded expectations |
| 100-119% | Met expectations |
| 70-99% | Partial success |
| 50-69% | Limited success |
| <50% | Failed |

---

## Attribution Guidelines

### Direct Attribution

When to attribute impact directly to an action:

- Clear cause and effect
- Timing aligns (change shortly after action)
- Stakeholder confirms connection
- No other explanations

### Partial Attribution

When multiple factors contributed:

- Divide impact among contributing actions
- Note uncertainty
- Track patterns across deals

### No Attribution

When change can't be linked to action:

- External factors (news, competition)
- Random variation
- Unknown causes

---

## Measurement Timing

### Immediate (24-48 hours)

Measure:
- Direct response to action
- Immediate sentiment signals
- Short-term engagement

### Short-term (1 week)

Measure:
- Score changes
- Follow-on actions
- Stakeholder behavior changes

### Medium-term (2-4 weeks)

Measure:
- Stage progression
- Risk evolution
- Deal velocity

---

## Data Collection

### What to Record

For each completed action:

```json
{
  "action": "Action description",
  "completedAt": "timestamp",
  "scoresBefore": {...},
  "scoresAfter": {...},
  "stakeholdersBefore": {...},
  "stakeholdersAfter": {...},
  "risksBefore": [...],
  "risksAfter": [...],
  "intendedOutcome": "description",
  "actualOutcome": "description",
  "notes": "observations"
}
```

### Comparison Period

- Capture state immediately before action
- Wait appropriate time for impact
- Capture state after impact period
- Control for other changes

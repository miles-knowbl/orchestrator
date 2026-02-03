# Success Criteria Reference

How to define and measure pilot success.

## Criteria Categories

### Must Achieve (Required)

**Definition:** Pilot fails without these.

**Characteristics:**
- Non-negotiable
- Clear pass/fail
- Measurable
- 3-5 criteria max

**Examples:**
- Automation rate >30%
- Accuracy >90%
- No critical security issues
- Customer satisfaction maintained

### Should Achieve (Important)

**Definition:** Strongly desired, some flexibility.

**Characteristics:**
- Important but not blocking
- Range acceptable
- 3-5 criteria

**Examples:**
- Response time <30 seconds
- Resolution rate >80%
- User satisfaction positive
- No major escalations

### Nice to Have (Bonus)

**Definition:** Would be great, not expected.

**Characteristics:**
- Bonus if achieved
- Not factored into success
- 2-3 criteria

**Examples:**
- CSAT improvement
- Cost savings demonstrated
- Additional use cases validated

---

## Common Metrics

### Volume Metrics

| Metric | Definition | Typical Target |
|--------|------------|----------------|
| Automation rate | % handled by AI | 30-50% |
| Deflection rate | % not reaching human | 25-40% |
| Escalation rate | % requiring human | <20% |

### Quality Metrics

| Metric | Definition | Typical Target |
|--------|------------|----------------|
| Accuracy | % correct responses | >90% |
| Hallucination rate | % incorrect facts | <2% |
| Error rate | % system errors | <1% |

### Experience Metrics

| Metric | Definition | Typical Target |
|--------|------------|----------------|
| CSAT | Customer satisfaction | No decrease |
| Response time | Time to first response | <30 seconds |
| Resolution time | Time to resolve | <5 minutes |
| NPS | Net Promoter Score | No decrease |

### Operational Metrics

| Metric | Definition | Typical Target |
|--------|------------|----------------|
| Uptime | System availability | >99.5% |
| Latency | Response generation | <2 seconds |
| Agent satisfaction | Internal feedback | Positive |

---

## Setting Targets

### Start with Baseline

Before pilot:
1. Measure current state
2. Document baseline metrics
3. Set targets relative to baseline

**Example:**
```
Current CSAT: 4.2/5
Target: ≥4.2/5 (no decrease)
Stretch: ≥4.3/5 (improvement)
```

### Conservative vs. Aggressive

| Approach | When to Use | Risk |
|----------|-------------|------|
| Conservative | First pilot, skeptical customer | May not impress |
| Standard | Typical scenario | Balanced |
| Aggressive | Confident, need to impress | May fail |

### Target Setting Framework

```
Conservative = Industry average
Standard = 10-20% above conservative
Aggressive = 30-50% above conservative
```

---

## Measurement Methods

### Automated Tracking

**Best for:** Volume, performance, uptime

**Implementation:**
- Dashboard with real-time metrics
- Automated daily/weekly reports
- Alert on threshold breach

### Sampling/Spot-Checks

**Best for:** Quality, accuracy

**Implementation:**
- Random sample of conversations
- Human review against rubric
- Weekly quality report

### Surveys

**Best for:** Satisfaction, experience

**Implementation:**
- Post-conversation survey
- Comparison to baseline period
- Statistical significance check

### Feedback Collection

**Best for:** Qualitative insights

**Implementation:**
- Agent feedback forms
- Customer verbatims
- Stakeholder interviews

---

## Success Evaluation

### Pass Criteria

```
PASS = All "Must Achieve" met
       + Majority of "Should Achieve" met
       + No critical issues
```

### Partial Pass

```
PARTIAL = Most "Must Achieve" met
          + Issues are addressable
          + Stakeholders see path forward
```

### Fail Criteria

```
FAIL = Any "Must Achieve" missed significantly
       OR Critical issues unresolved
       OR Stakeholder confidence lost
```

---

## Reporting Template

### Weekly Report

```markdown
# Pilot Week [X] Report

## Summary
- Overall status: On Track / At Risk / Off Track
- Traffic: [X]% of target
- Key metric: [Primary metric] at [value]

## Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Automation rate | >30% | 35% | ✓ |
| Accuracy | >90% | 88% | ⚠️ |
| CSAT | ≥4.2 | 4.3 | ✓ |

## Issues
- [Issue 1]: [Status]
- [Issue 2]: [Status]

## Next Week
- [Priority 1]
- [Priority 2]
```

### Final Report

```markdown
# Pilot Final Report

## Executive Summary
[1 paragraph: did it work, what did we learn, recommendation]

## Success Criteria Results

### Must Achieve
| Criterion | Target | Result | Status |
|-----------|--------|--------|--------|
| ... | ... | ... | ✓/✗ |

### Should Achieve
| Criterion | Target | Result | Status |
|-----------|--------|--------|--------|
| ... | ... | ... | ✓/✗ |

## Key Learnings
1. [Learning 1]
2. [Learning 2]
3. [Learning 3]

## Recommendation
[ ] Proceed to full rollout
[ ] Extend pilot
[ ] Do not proceed

## Next Steps
[If proceeding: rollout plan summary]
[If extending: what needs to change]
[If not proceeding: why and what would change decision]
```

---

## Common Pitfalls

### Pitfall: Unclear Criteria

**Problem:** "Improve customer experience"
**Solution:** "CSAT score ≥4.2/5"

### Pitfall: Too Many Criteria

**Problem:** 15 success criteria
**Solution:** 3-5 Must Achieve, prioritize

### Pitfall: No Baseline

**Problem:** "30% improvement" from unknown baseline
**Solution:** Measure baseline before pilot

### Pitfall: Moving Targets

**Problem:** Changing criteria mid-pilot
**Solution:** Lock criteria before start

### Pitfall: Cherry-Picking

**Problem:** Only reporting good metrics
**Solution:** Report all pre-agreed metrics

### Pitfall: Small Sample

**Problem:** Drawing conclusions from small sample
**Solution:** Adequate traffic and duration

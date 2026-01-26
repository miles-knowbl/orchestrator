# Calibration Guide

## Purpose

This reference provides comprehensive guidance for improving estimation accuracy over time through systematic calibration. Calibration is the process of comparing estimates to actuals, identifying patterns in variance, and adjusting estimation practices to reduce error.

**Use this guide when:**
- Completing a project/system to record calibration data
- Reviewing estimation accuracy trends over time
- Adjusting estimation baselines for future work
- Training new team members on estimation practices
- Conducting retrospectives on estimation performance

## Core Concept

Calibration treats estimation as a learnable skill that improves with deliberate practice and feedback loops.

```
                    CALIBRATION FEEDBACK LOOP

    ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
    │   Estimate  │──────▶│   Execute   │──────▶│   Measure   │
    │    Work     │       │    Work     │       │   Actuals   │
    └─────────────┘       └─────────────┘       └─────────────┘
           ▲                                           │
           │                                           │
           │              ┌─────────────┐              │
           └──────────────│   Analyze   │◀─────────────┘
                          │   Variance  │
                          └─────────────┘
                                │
                                ▼
                          ┌─────────────┐
                          │   Adjust    │
                          │  Practices  │
                          └─────────────┘
```

## Calibration Metrics

### Primary Metrics

| Metric | Formula | Interpretation | Target |
|--------|---------|----------------|--------|
| **Accuracy Ratio** | Actual / Estimated | How close to reality | 0.9 - 1.1 |
| **Bias** | Mean(Actual - Estimated) | Systematic over/under | +/- 10% |
| **Precision** | StdDev(Accuracy Ratio) | Consistency | < 0.25 |
| **MAPE** | Mean(Abs(Actual-Est)/Actual) | % error magnitude | < 25% |

### Calculating Accuracy Ratio

```
Accuracy Ratio = Actual Hours / Estimated Hours

Example:
  Estimated: 40 hours
  Actual: 48 hours
  Accuracy Ratio: 48/40 = 1.20 (20% underestimate)

Interpretation:
  < 1.0 = Overestimate (finished faster than expected)
  = 1.0 = Perfect estimate
  > 1.0 = Underestimate (took longer than expected)
```

### Calculating Bias

```
Bias = Average of (Actual - Estimated) across all estimates

Example over 5 projects:
  Project A: 48 - 40 = +8
  Project B: 22 - 20 = +2
  Project C: 35 - 30 = +5
  Project D: 18 - 24 = -6
  Project E: 52 - 40 = +12

  Bias = (8 + 2 + 5 + (-6) + 12) / 5 = +4.2 hours

Interpretation:
  Positive bias = Systematic underestimation
  Negative bias = Systematic overestimation
  Near zero = Well-calibrated (no systematic error)
```

### Calculating Precision (Consistency)

```
Precision = Standard Deviation of Accuracy Ratios

Example:
  Ratios: [1.20, 1.10, 1.17, 0.75, 1.30]
  Mean: 1.10
  Variance: [(1.20-1.10)^2 + (1.10-1.10)^2 + ...] / 5 = 0.0356
  StdDev: sqrt(0.0356) = 0.19

Interpretation:
  Low StdDev (< 0.15) = Very consistent
  Medium StdDev (0.15-0.25) = Reasonably consistent
  High StdDev (> 0.25) = Inconsistent, needs improvement
```

### Mean Absolute Percentage Error (MAPE)

```
MAPE = Average of |Actual - Estimated| / Actual * 100%

Example:
  Project A: |48-40|/48 = 16.7%
  Project B: |22-20|/22 = 9.1%
  Project C: |35-30|/35 = 14.3%
  Project D: |18-24|/18 = 33.3%
  Project E: |52-40|/52 = 23.1%

  MAPE = (16.7 + 9.1 + 14.3 + 33.3 + 23.1) / 5 = 19.3%

Interpretation:
  < 10% = Excellent
  10-20% = Good
  20-30% = Acceptable
  > 30% = Needs significant improvement
```

## Data Collection

### What to Track

For each estimation unit (system, feature, capability):

```markdown
## Calibration Data Point

| Field | Value |
|-------|-------|
| ID | EST-2024-001 |
| Description | Work Order Service |
| Estimated | 73 hours |
| Actual | 92 hours |
| Accuracy Ratio | 1.26 |
| Start Date | 2024-01-15 |
| End Date | 2024-01-28 |
| Estimator | Agent-1 |
| Complexity | L |
| Mode | Greenfield |

### Breakdown Comparison

| Component | Est | Act | Ratio | Notes |
|-----------|-----|-----|-------|-------|
| CRUD | 20 | 18 | 0.90 | Smooth |
| Assignment | 13 | 24 | 1.85 | Complex logic |
| Status | 10 | 14 | 1.40 | Edge cases |
| Completion | 12 | 15 | 1.25 | Signatures |
| Other | 18 | 21 | 1.17 | Normal |

### Contributing Factors

- [x] Scope change during implementation
- [ ] External dependency delay
- [x] Underestimated complexity
- [ ] Overestimated complexity
- [ ] Technical issues / bugs
- [ ] Requirements unclear
- [x] New technology learning

### Notes

Assignment logic required implementing availability calculations
that were more complex than anticipated. Recommend 1.5x multiplier
for scheduling/assignment features in future.
```

### Per-Skill Tracking

Track estimates by skill phase for fine-grained calibration:

```markdown
## Skill-Level Calibration: Work Order Service

| Skill | Est | Act | Ratio | Notes |
|-------|-----|-----|-------|-------|
| spec | 0.5h | 0.75h | 1.5 | More discussion needed |
| estimation | 0.25h | 0.25h | 1.0 | On target |
| architect | 1h | 1.5h | 1.5 | Multiple iterations |
| scaffold | 0.5h | 0.5h | 1.0 | On target |
| implement | 6h | 8h | 1.33 | Assignment complexity |
| test-generation | 2h | 2.5h | 1.25 | Edge case tests |
| code-verification | 0.5h | 0.5h | 1.0 | On target |
| code-validation | 0.5h | 0.75h | 1.5 | Integration issues |
| document | 0.5h | 0.5h | 1.0 | On target |
| code-review | 0.5h | 0.75h | 1.5 | Revision needed |
| deploy | 0.25h | 0.25h | 1.0 | On target |

### Skill-Level Insights

- spec: Often underestimated; stakeholder alignment takes time
- architect: Iteration cycles not accounted for
- implement: Varies significantly by feature complexity
- test-generation: Edge cases emerge during implementation
- code-validation: Integration surprises common
```

### Calibration Log Format

Maintain a rolling log of calibration data:

```markdown
# Calibration Log

## Summary Statistics

| Period | Count | Avg Accuracy | Bias | MAPE | Precision |
|--------|-------|--------------|------|------|-----------|
| Q1 2024 | 12 | 1.24 | +18% | 22% | 0.28 |
| Q2 2024 | 15 | 1.18 | +14% | 19% | 0.24 |
| Q3 2024 | 18 | 1.12 | +10% | 16% | 0.21 |
| Q4 2024 | 16 | 1.08 | +6% | 14% | 0.18 |

## Trend Analysis

Accuracy improving: Bias reduced from +18% to +6% over 4 quarters.
Precision improving: StdDev reduced from 0.28 to 0.18.
Focus area: Continue reducing variance in implementation estimates.

## Individual Records

[Individual data points as shown above]
```

## Analyzing Variance

### Variance Categories

When actual differs significantly from estimated, categorize the cause:

| Category | Description | Example | Adjustment |
|----------|-------------|---------|------------|
| **Scope Change** | Requirements changed | New feature added | Re-estimate; don't count against accuracy |
| **Complexity Surprise** | Harder than expected | Algorithm edge cases | Increase complexity factors |
| **External Dependency** | Blocked by others | API delay | Add buffer for external deps |
| **Technical Issues** | Bugs, environment | Flaky tests | Track separately; improve tooling |
| **Learning Curve** | New tech/domain | First Kafka project | Add learning multiplier |
| **Process Overhead** | Reviews, meetings | Multiple review cycles | Include in base estimate |
| **Estimation Error** | Simply wrong | Misjudged effort | Adjust base estimates |

### Root Cause Analysis

For significant variances (> 30%), conduct root cause analysis:

```markdown
## Variance Analysis: Project X

**Estimated:** 40 hours
**Actual:** 64 hours
**Variance:** +60%

### Timeline

| Date | Event | Impact |
|------|-------|--------|
| Day 1 | Started implementation | On track |
| Day 2 | Discovered auth complexity | +8h |
| Day 3 | External API changed | +4h (rework) |
| Day 5 | Code review feedback | +6h (revisions) |
| Day 7 | Integration test issues | +6h |

### Root Causes

1. **Auth Complexity (8h)**: Did not account for OAuth2
   PKCE flow requirements. Add auth integration to
   complexity factors (+30% for auth).

2. **External API Change (4h)**: Third-party changed
   endpoint during development. Add buffer for external
   dependencies (+15% per external API).

3. **Review Cycles (6h)**: Underestimated review effort.
   Standard review buffer should be 20%, not 10%.

4. **Integration Issues (6h)**: Environment configuration
   not documented. DevOps issue, track separately.

### Adjustments

- Auth integration: Increase from +20% to +30%
- External APIs: Add +15% per integration
- Code review: Increase from 10% to 20% buffer
- Track environment issues separately (not estimation error)
```

### Pattern Recognition

Look for recurring patterns across multiple estimates:

```markdown
## Pattern Analysis: Q4 2024

### Identified Patterns

1. **Assignment/Scheduling Features**: Consistently 1.5-2x
   - Count: 4 features
   - Average ratio: 1.72
   - Action: Apply 1.7x multiplier

2. **First-time Technology**: Learning curve underestimated
   - Count: 3 projects
   - Average ratio: 1.45
   - Action: Add +50% for first use of new tech

3. **Integration Endpoints**: More reliable estimates
   - Count: 8 endpoints
   - Average ratio: 1.08
   - Action: Current estimation method working well

4. **UI Polish**: Highly variable
   - Count: 5 features
   - Ratios: 0.8, 1.2, 1.6, 1.1, 2.0
   - StdDev: 0.43
   - Action: Needs better breakdown; decompose further
```

## Adjustment Strategies

### Multiplicative Adjustment

When you consistently under/over-estimate by a factor:

```
New Estimate = Base Estimate * Calibration Factor

Example:
  Historical accuracy: 1.25 (25% underestimate)
  Calibration factor: 1.25

  For new estimate:
    Base estimate: 40 hours
    Calibrated estimate: 40 * 1.25 = 50 hours
```

### Additive Adjustment

When there's a consistent fixed overhead:

```
New Estimate = Base Estimate + Fixed Overhead

Example:
  Historical pattern: Always +8 hours for deployment setup

  For new estimate:
    Base estimate: 40 hours
    Calibrated estimate: 40 + 8 = 48 hours
```

### Category-Specific Adjustment

Apply different adjustments to different work types:

```markdown
## Calibration Factors by Category

| Category | Factor | Basis |
|----------|--------|-------|
| CRUD operations | 0.95 | Slightly overestimate |
| Business logic | 1.20 | Often underestimate |
| Integrations | 1.30 | External unknowns |
| Data migration | 1.50 | Always surprises |
| UI/UX polish | 1.40 | Subjective, iterative |
| Performance opt | 1.25 | Profiling takes time |
| Security features | 1.35 | Compliance overhead |

## Applying Factors

Base estimate: 40 hours
  - CRUD (10h): 10 * 0.95 = 9.5h
  - Business logic (15h): 15 * 1.20 = 18h
  - Integration (10h): 10 * 1.30 = 13h
  - Other (5h): 5 * 1.0 = 5h

Calibrated total: 45.5 hours
```

### Skill-Phase Adjustment

Adjust estimates by development phase:

```markdown
## Phase Calibration Factors

Based on 50+ skill-phase observations:

| Phase | Avg Ratio | Factor | Notes |
|-------|-----------|--------|-------|
| spec | 1.15 | 1.15 | Stakeholder time |
| estimation | 1.0 | 1.0 | Quick, consistent |
| architect | 1.25 | 1.25 | Iteration cycles |
| scaffold | 1.0 | 1.0 | Automated, quick |
| implement | 1.20 | 1.20 | Core work varies |
| test-generation | 1.15 | 1.15 | Edge cases |
| code-verification | 1.0 | 1.0 | Automated |
| code-validation | 1.30 | 1.30 | Integration surprises |
| document | 1.0 | 1.0 | Consistent |
| code-review | 1.20 | 1.20 | Revision cycles |
| deploy | 1.0 | 1.0 | Procedural |
```

## Confidence Calibration

### Calibrating Confidence Levels

Your stated confidence should match actual accuracy:

```markdown
## Confidence Calibration Check

| Stated Confidence | Expected Accuracy | Actual Accuracy | Calibrated? |
|-------------------|-------------------|-----------------|-------------|
| High | Within 10% | Within 8% | Yes |
| Medium | Within 25% | Within 32% | No (overconfident) |
| Low | Within 50% | Within 45% | Yes |

### Adjustment

When stating "Medium" confidence:
- Previously: Expected within 25%
- Actual: Within 32%
- Action: Either improve estimates for Medium confidence,
  or relabel current Medium estimates as Low confidence
```

### Confidence Intervals

Build empirical confidence intervals from historical data:

```markdown
## Historical Confidence Intervals

Based on 100 estimates with Actual/Estimated ratios:

| Percentile | Ratio | Meaning |
|------------|-------|---------|
| 5th | 0.75 | 5% chance of finishing 25% early |
| 25th | 0.90 | 25% chance of finishing 10% early |
| 50th | 1.05 | Median is 5% over |
| 75th | 1.25 | 25% chance of running 25% over |
| 95th | 1.60 | 5% chance of running 60% over |

## Using Intervals for Ranges

Base estimate: 40 hours

- Optimistic (25th): 40 * 0.90 = 36 hours
- Expected (50th): 40 * 1.05 = 42 hours
- Conservative (75th): 40 * 1.25 = 50 hours
- Worst-case (95th): 40 * 1.60 = 64 hours

Communicate as: "40-50 hours, possibly up to 64 if issues arise"
```

## Calibration by Mode

### Greenfield Calibration

Track calibration metrics separately for greenfield projects:

```markdown
## Greenfield Calibration Data

| Metric | Value | Notes |
|--------|-------|-------|
| Count | 12 systems | Last 12 months |
| Avg Accuracy | 1.35 | 35% underestimate typical |
| Bias | +28% | Systematic underestimate |
| MAPE | 32% | Higher variance expected |
| Precision | 0.32 | More variable |

### Greenfield-Specific Factors

| Factor | Current | Calibrated |
|--------|---------|------------|
| Architecture decisions | +30% | +40% |
| New tech learning | +50% | +70% |
| Scaffolding | +10% | +15% |
| Testing setup | +20% | +30% |

### Greenfield Multiplier

Historical base: 1.35
Add 0.15 for safety: 1.50

Apply 1.5x multiplier to all greenfield estimates.
```

### Brownfield-Polish Calibration

```markdown
## Polish Mode Calibration Data

| Metric | Value | Notes |
|--------|-------|-------|
| Count | 25 features | Last 12 months |
| Avg Accuracy | 1.18 | 18% underestimate |
| Bias | +15% | Moderate underestimate |
| MAPE | 22% | Reasonable variance |
| Precision | 0.24 | Fairly consistent |

### Polish-Specific Factors

| Factor | Current | Calibrated |
|--------|---------|------------|
| Code understanding | +20% | +25% |
| Compatibility | +15% | +20% |
| Existing test patterns | +10% | +10% |

### Polish Multiplier

Historical base: 1.18
Add 0.07 for safety: 1.25

Apply 1.25x multiplier to polish estimates.
```

### Brownfield-Enterprise Calibration

```markdown
## Enterprise Mode Calibration Data

| Metric | Value | Notes |
|--------|-------|-------|
| Count | 40 changes | Last 12 months |
| Avg Accuracy | 1.08 | 8% underestimate |
| Bias | +6% | Small bias |
| MAPE | 15% | Good accuracy |
| Precision | 0.18 | Very consistent |

### Enterprise-Specific Factors

Process overhead well-captured in estimates:
- Code review: 4h (accurate)
- Security review: 2h (accurate)
- Deployment window: 1h (accurate)

### Enterprise Multiplier

Historical base: 1.08
Add 0.07 for safety: 1.15

Apply 1.15x multiplier to enterprise estimates.
```

## Calibration Reviews

### Weekly Review (Quick Check)

```markdown
## Weekly Calibration Check

Week: 2024-W03

| Item | Estimated | Actual | Ratio |
|------|-----------|--------|-------|
| Feature A | 8h | 10h | 1.25 |
| Bug fix B | 2h | 1.5h | 0.75 |
| Integration C | 12h | 14h | 1.17 |

**Week accuracy:** 1.06 (on target)
**Notes:** Integration slightly underestimated; watch pattern.
```

### Monthly Review (Trend Analysis)

```markdown
## Monthly Calibration Review

Month: January 2024

### Summary Statistics

| Metric | This Month | 3-Month Avg | Trend |
|--------|------------|-------------|-------|
| Count | 15 | 14 | Stable |
| Avg Accuracy | 1.12 | 1.18 | Improving |
| Bias | +10% | +14% | Improving |
| MAPE | 18% | 21% | Improving |
| Precision | 0.22 | 0.25 | Improving |

### Top Variance Items

1. Project X: 1.45 (integration complexity)
2. Feature Y: 0.70 (overestimated)
3. Change Z: 1.38 (scope creep)

### Pattern Observations

- Integration estimates improving (was 1.35, now 1.20)
- Still underestimating auth features
- Overestimating simple CRUD operations

### Actions

1. Reduce CRUD estimates by 10%
2. Increase auth feature estimates by 20%
3. Continue monitoring integration accuracy
```

### Quarterly Review (Strategic)

```markdown
## Quarterly Calibration Review

Quarter: Q4 2024

### Executive Summary

Overall accuracy improved from 1.24 (Q3) to 1.12 (Q4).
MAPE reduced from 24% to 18%.
On track to reach <15% MAPE target by Q2 2025.

### Accuracy by Category

| Category | Q3 | Q4 | Change |
|----------|-----|-----|--------|
| Greenfield | 1.38 | 1.28 | -7% |
| Polish | 1.22 | 1.15 | -6% |
| Enterprise | 1.12 | 1.05 | -6% |

### Accuracy by Skill Phase

[Chart showing skill-by-skill accuracy trends]

### Key Improvements Made

1. Added complexity factors for auth (+30%)
2. Increased integration buffers (+25%)
3. Added review cycle overhead (20%)

### Focus Areas for Next Quarter

1. Reduce greenfield variance (MAPE still 28%)
2. Better capture UI polish effort
3. Improve scheduling feature estimates
```

## Best Practices

### Do's

1. **Record immediately**: Capture actual effort when fresh
2. **Be honest**: Accurate data is more valuable than looking good
3. **Track granularly**: Component-level data reveals patterns
4. **Review regularly**: Weekly quick checks, monthly deep dives
5. **Share learnings**: Team calibration improves everyone
6. **Update multipliers**: Apply insights to future estimates
7. **Track by category**: Different work types need different calibration

### Don'ts

1. **Don't cherry-pick**: Include all estimates, not just accurate ones
2. **Don't blame**: Variance is learning opportunity, not failure
3. **Don't over-adjust**: Small sample sizes can mislead
4. **Don't ignore outliers**: They often reveal important patterns
5. **Don't forget context**: Note why variance occurred
6. **Don't set and forget**: Calibration needs continuous attention

### Sample Size Considerations

| Sample Size | Confidence | Action |
|-------------|------------|--------|
| < 5 | Very Low | Gather more data before adjusting |
| 5-10 | Low | Note patterns, tentative adjustments |
| 10-20 | Medium | Make moderate adjustments |
| 20-50 | Good | Reliable calibration factors |
| > 50 | High | Fine-tune adjustments |

## Calibration Templates

### Per-Project Template

```markdown
# Calibration Record: [Project Name]

## Summary

| Field | Value |
|-------|-------|
| Project | [Name] |
| Mode | [Greenfield/Polish/Enterprise] |
| Estimated | [X hours] |
| Actual | [Y hours] |
| Accuracy | [Y/X] |
| Start Date | [Date] |
| End Date | [Date] |

## Component Breakdown

| Component | Est | Act | Ratio | Notes |
|-----------|-----|-----|-------|-------|
| | | | | |

## Skill Phase Breakdown

| Skill | Est | Act | Ratio |
|-------|-----|-----|-------|
| | | | |

## Variance Analysis

### Primary Causes
- [ ] Scope change
- [ ] Complexity surprise
- [ ] External dependency
- [ ] Technical issues
- [ ] Learning curve
- [ ] Process overhead
- [ ] Estimation error

### Details
[Explain significant variances]

## Lessons Learned
[What will you do differently?]

## Recommended Adjustments
[Specific factors to update]
```

### Calibration Dashboard Template

```markdown
# Estimation Calibration Dashboard

Last Updated: [Date]

## Current Performance

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Accuracy | [X] | 0.9-1.1 | [On/Off track] |
| Bias | [X%] | +/- 10% | [On/Off track] |
| MAPE | [X%] | < 25% | [On/Off track] |
| Precision | [X] | < 0.25 | [On/Off track] |

## Trends

[Sparkline or trend indicators]

## Active Calibration Factors

| Factor | Value | Basis | Last Updated |
|--------|-------|-------|--------------|
| Greenfield multiplier | 1.5x | 12 samples | 2024-01 |
| Polish multiplier | 1.25x | 25 samples | 2024-01 |
| Enterprise multiplier | 1.15x | 40 samples | 2024-01 |
| Auth features | +30% | 8 samples | 2024-01 |
| Integrations | +25% | 15 samples | 2024-01 |

## Recent Observations

[List recent calibration insights]

## Action Items

[List pending calibration adjustments]
```

## Common Calibration Issues

### Issue: Inconsistent Data Collection

**Symptom:** Gaps in calibration data, inconsistent detail level

**Solution:**
- Build tracking into workflow (skill hooks)
- Automate where possible (skillsLog integration)
- Review data quality in weekly checks
- Use templates for consistency

### Issue: Adjustment Overreaction

**Symptom:** Swinging between over and under-estimating

**Solution:**
- Require minimum sample size (5+) before adjusting
- Make incremental adjustments (max 20% change)
- Watch for regression after adjustments
- Consider separate factors for different conditions

### Issue: Ignoring Context

**Symptom:** Same multiplier for all situations

**Solution:**
- Track metadata (mode, complexity, technology)
- Segment calibration data by context
- Build category-specific factors
- Review outliers for context patterns

### Issue: Gaming the Metrics

**Symptom:** Estimates match actuals but work quality suffers

**Solution:**
- Track quality metrics alongside accuracy
- Include scope completion in calibration
- Review actual vs estimated scope
- Focus on value delivered, not just hours

## See Also

- `estimation-methods.md` - Estimation approaches to calibrate
- `complexity-factors.md` - Factors that affect estimates
- `estimate-template.md` - Standard estimate format
- SKILL.md Calibration section - Integration with skillsLog

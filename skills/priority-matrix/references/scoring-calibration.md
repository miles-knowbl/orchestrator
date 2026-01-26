# Scoring Calibration Reference

Techniques for producing consistent, meaningful scores across options and dimensions. Uncalibrated scoring is the single most common failure mode in prioritization.

## Why Calibration Matters

Without calibration, "7 out of 10" means different things to different scorers, scores cluster at 6-8 (destroying discriminating power), and the first option scored anchors all others. With calibration, scores are comparable across scorers, the full 1-10 range is used deliberately, and results are reproducible.

## Calibration Techniques

### 1. Anchor Setting

The most important calibration technique. Always use it when scoring 5+ options.

**Process:**
1. Choose 2-3 options the team understands well (ideally past completed work)
2. Score anchors first on every dimension before scoring anything else
3. Document anchor scores and rationale explicitly
4. Reference anchors when scoring each subsequent option

**Selecting good anchors:**
- One should be clearly high on most dimensions (the "strong option")
- One should be clearly low on most dimensions (the "weak option")
- Optionally, one should be mid-range (the "typical option")
- Anchors should be familiar to all scorers

**Anchor documentation template:**

```
ANCHOR: [Option Name]
  Impact: 8 -- Delivered measurable revenue lift in Q2
  Effort: 3 -- Required 4 engineers for 3 months
  Urgency: 6 -- Important but no hard deadline
  Alignment: 9 -- Directly supports company OKR #1
```

### 2. End-Point Definition

Define concrete, real-world examples for score values 1, 5, and 10 on each dimension before anyone scores.

| Score | Impact Example | Effort Example | Urgency Example |
|-------|---------------|----------------|-----------------|
| **1** | No measurable business change | Trivial -- one person, one day | Can wait 12+ months |
| **5** | Moderate improvement to one metric | Standard -- 2 people, 4-6 weeks | Should happen this quarter |
| **10** | Transformative to core business | Massive -- full team, 6+ months | Must happen this week or we lose the opportunity |

Intermediate values (2-4, 6-9) are interpolated between these anchor points.

### 3. Reference Class Forecasting

Instead of estimating from scratch, compare each option to a "reference class" of similar past work.

**Process:**
1. For each option, identify 2-3 past projects with similar characteristics
2. Look up actual outcomes (effort, impact, timeline) of those past projects
3. Use the reference class distribution to inform scores

**Example:**
- Scoring effort for "Build OAuth integration"
- Reference class: Previous integrations (Stripe: 3 weeks, Slack: 5 weeks, Salesforce: 8 weeks)
- Reference class average: ~5 weeks --> Effort score: 5-6

### 4. Delphi Method (Multi-Scorer Calibration)

Use when multiple people are scoring and you need to reduce individual bias.

**Process:**
1. Each scorer scores independently (no discussion)
2. Collect all scores and display them anonymously
3. Identify dimensions where scores diverge by 3+ points
4. Discuss divergent scores -- share reasoning, not just numbers
5. Each scorer re-scores independently after discussion
6. Take the median of round-2 scores as final

**Key rules:**
- Never average round-1 scores directly (that rewards extreme outliers)
- Discussion focuses on evidence and reasoning, not persuasion
- Scorers can change their scores but are not required to

### 5. Relative Ranking Before Absolute Scoring

When absolute scores feel arbitrary, rank first, then assign numbers. Sort all options per dimension from highest to lowest, assign the top a score (e.g., 9) and the bottom a score (e.g., 3), then fill in middle options with proportional spacing.

## Score Distribution Health Checks

After scoring, run these diagnostics:

| Check | What to Look For | Fix |
|-------|-----------------|-----|
| **Range usage** | Min-max range < 4 points per dimension | Redefine end-points, rescore using relative ranking |
| **Clustering** | >50% of scores on a dimension are identical | Dimension is not differentiating; recalibrate |
| **Cross-correlation** | Two dimensions produce nearly identical rankings | Merge or drop the less important one |
| **Scorer agreement** | Standard deviation > 2.5 on any option-dimension pair | Discuss the disagreement, share reasoning |
| **Anchor consistency** | Anchor options no longer feel correctly placed | Recalibrate all scores against anchors |

## Common Calibration Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| **Central tendency** | All scores between 5-7 | Redefine end-points, force at least one 2 and one 9 |
| **Inflation** | All scores above 7 | Remind scorers that 5 is "average", not "bad" |
| **First-option anchoring** | First option scored is always mid-range; others cluster around it | Score anchors first, not the first option on the list |
| **Dimension leakage** | Impact score considers effort ("it's impactful but hard") | Score one dimension at a time across all options |
| **Round-number bias** | Scores are disproportionately 5, 7, or 10 | Use forced ranking to identify true relative positions |
| **Confidence conflation** | Low-confidence options get low scores instead of flagged mid-range | Separate confidence from the dimension score |

## Calibration Session Facilitation Guide

**Duration:** 15-30 minutes (before scoring begins)

**Agenda:**
1. **(5 min)** Review dimensions and weight allocations
2. **(5 min)** Walk through end-point definitions for each dimension
3. **(10 min)** Score 2-3 anchor options together, discussing and aligning
4. **(5 min)** Confirm scoring ground rules:
   - Score one dimension at a time across all options
   - Write rationale before moving to the next score
   - Flag low-confidence scores with `(?)`
   - Reference anchors when uncertain

**Post-scoring review (10 min):**
1. Run health checks (range, clustering, correlation)
2. Identify and discuss any outlier scores
3. Confirm anchors still feel correctly placed
4. Lock scores and move to aggregation

## Recalibration Triggers

Rescore the matrix when any of these occur:
- New information materially changes an option's expected impact or effort
- A new option is added that would rank in the top 3
- More than 30 days have passed since last scoring
- A scored option has been completed and actual results diverge significantly from predicted
- Team composition changes (new scorer brings different baseline)

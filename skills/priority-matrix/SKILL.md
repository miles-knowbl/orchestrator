---
name: priority-matrix
description: "Rank opportunities and work threads across multiple prioritization dimensions. Produces actionable priority matrices with calibrated scores, bias-checked rationale, and stakeholder-aligned rankings. Creates the prioritized backlog that feeds into proposal building."
phase: IMPLEMENT
category: strategy
version: "2.0.0"
depends_on: ["context-cultivation"]
tags: [planning, prioritization, analysis, decision-making, frameworks]
---

# Priority Matrix

Rank opportunities and work threads across multiple prioritization dimensions.

## When to Use

- **Multiple competing opportunities** -- Several options identified, need systematic ranking
- **Resource allocation decisions** -- Limited capacity, must choose what to pursue first
- **Stakeholder alignment** -- Different stakeholders advocate for different priorities
- **Post-cultivation synthesis** -- Context cultivation surfaced many threads, need to converge
- **Strategic planning** -- Quarterly or initiative-level prioritization across a portfolio
- When you say: "prioritize these", "what should we focus on", "rank the options", "which one first?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `prioritization-frameworks.md` | Catalog of frameworks (RICE, MoSCoW, ICE, Eisenhower) to select from |
| `scoring-calibration.md` | Techniques for consistent, unbiased scoring across options |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `bias-mitigation.md` | When scoring involves subjective judgment or political dynamics |
| `stakeholder-alignment.md` | When multiple stakeholders must agree on priorities |
| `effort-estimation.md` | When effort dimension requires detailed estimation |

**Verification:** Ensure at least one scored matrix is produced with documented rationale for every score.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `PRIORITIES.md` | Project root | Always -- ranked list with rationale |
| `MATRIX.md` | Project root | Always -- full scoring matrix with dimension breakdowns |
| `CALIBRATION-LOG.md` | Project root | When 5+ options are scored -- documents calibration decisions |

## Core Concept

Priority Matrix answers: **"What should we do first, and why?"**

Prioritization decisions are:
- **Systematic** -- Use structured frameworks, not gut feeling
- **Transparent** -- Every score has documented rationale
- **Calibrated** -- Scores are consistent across options and dimensions
- **Stakeholder-aligned** -- Methodology agreed upon before scoring begins
- **Actionable** -- Results in a clear, ordered backlog with next steps

Prioritization is NOT:
- Voting or popularity contests (that is opinion gathering)
- One-time decisions set in stone (priorities evolve; re-score periodically)
- A substitute for strategy (strategy defines goals; prioritization orders the path)
- Detailed project planning (that is `spec` and `scaffold`)

## The Priority Matrix Process

```
+---------------------------------------------------------------+
|                    PRIORITY MATRIX PROCESS                     |
|                                                                |
|  1. OPTION ENUMERATION                                         |
|     +-> Collect and define all candidate work threads          |
|                                                                |
|  2. FRAMEWORK SELECTION                                        |
|     +-> Choose the right prioritization framework              |
|                                                                |
|  3. DIMENSION DEFINITION                                       |
|     +-> Define and weight scoring dimensions                   |
|                                                                |
|  4. CALIBRATION                                                |
|     +-> Establish scoring anchors and reference points         |
|                                                                |
|  5. SCORING                                                    |
|     +-> Score each option on each dimension with rationale     |
|                                                                |
|  6. AGGREGATION                                                |
|     +-> Calculate weighted scores and produce rankings         |
|                                                                |
|  7. BIAS CHECK                                                 |
|     +-> Review for cognitive biases and political distortion   |
|                                                                |
|  8. VALIDATION                                                 |
|     +-> Sanity check results against intuition and strategy    |
+---------------------------------------------------------------+
```

## Step 1: Option Enumeration

Before scoring anything, build the complete list of candidates.

| Aspect | Questions |
|--------|-----------|
| **Completeness** | Have we captured every thread from context cultivation? |
| **Granularity** | Are options at a comparable level of scope? |
| **Independence** | Can each option be pursued independently? |
| **Clarity** | Is each option defined well enough to score? |
| **Duplicates** | Have we merged overlapping or redundant options? |

### Option Definition Template

For each candidate, capture enough context to score it:

```markdown
### Option: [Name]

**Description:** [One-paragraph summary of what this work thread entails]

**Origin:** [Where this option came from -- cultivation theme, stakeholder request, gap analysis]

**Scope estimate:** [T-shirt size: XS / S / M / L / XL]

**Dependencies:** [Other options or external factors this depends on]

**Stakeholder champion:** [Who is advocating for this option, if anyone]
```

### Enumeration Checklist

```markdown
- [ ] All context cultivation themes represented
- [ ] All stakeholder requests captured
- [ ] All gap analysis items included
- [ ] Options are at comparable granularity
- [ ] Duplicates and overlaps merged
- [ ] Each option has a clear one-line description
- [ ] Total option count is manageable (3-15 is ideal)
```

**If you have more than 15 options:** Group them into categories first, prioritize categories, then prioritize within the top 2-3 categories. Avoid scoring 20+ items in a single matrix -- cognitive load degrades scoring quality.

## Step 2: Framework Selection

Choose the prioritization framework that fits your context. No single framework is universally best.

### Framework Comparison

| Framework | Best For | Dimensions | Complexity |
|-----------|----------|------------|------------|
| **Weighted Scoring** | General-purpose, customizable | Custom (3-6) | Medium |
| **RICE** | Product features, growth teams | Reach, Impact, Confidence, Effort | Medium |
| **ICE** | Quick scoring, startups | Impact, Confidence, Ease | Low |
| **MoSCoW** | Scope negotiation, fixed timelines | Must/Should/Could/Won't | Low |
| **Eisenhower** | Personal or team task triage | Urgency, Importance | Low |
| **Cost of Delay** | Economic optimization | Value, Time criticality, Risk reduction | High |

### Framework Selection Guide

**Use Weighted Scoring when:**
- You need full customization of dimensions
- Stakeholders need to see transparent methodology
- Options span diverse categories (technical, business, operational)

**Use RICE when:**
- Prioritizing product features or growth initiatives
- You have data on reach (users affected) and can estimate confidence
- The team is familiar with product management practices

**Use ICE when:**
- Speed matters more than precision
- Early-stage exploration with high uncertainty
- You need a quick first pass before deeper analysis

**Use MoSCoW when:**
- Working with a fixed deadline or scope boundary
- Stakeholders think in terms of "must have" vs "nice to have"
- Negotiating scope for an MVP or release

**Use Eisenhower when:**
- Triaging a mix of urgent and important work
- Team is overwhelmed and needs to cut non-essential work
- Distinguishing between reactive and proactive priorities

**Use Cost of Delay when:**
- Options have different time sensitivities
- Delay has measurable economic impact
- You want to optimize sequencing, not just ranking

### Framework Decision Record

```markdown
### Framework Choice: [Name]

**Selected:** [Framework name]
**Reason:** [Why this framework fits]
**Alternatives considered:** [What else was considered and why rejected]
**Adaptations:** [Any modifications to the standard framework]
```

## Step 3: Dimension Definition

Define the scoring dimensions and their weights. Dimensions should be:

- **Independent** -- Avoid double-counting the same factor
- **Measurable** -- Each dimension must be scorable (even if subjective)
- **Relevant** -- Every dimension should matter for this specific decision
- **Balanced** -- No single dimension should dominate unless intentional

### Default Weighted Scoring Dimensions

| Dimension | Weight | Description | Score Guide |
|-----------|--------|-------------|-------------|
| **Impact** | 30% | Business value delivered if completed | 1=negligible, 5=moderate, 10=transformative |
| **Effort** | 25% | Resources required (inverse: high effort = low score) | 1=massive, 5=moderate, 10=trivial |
| **Urgency** | 25% | Time sensitivity and cost of delay | 1=can wait indefinitely, 5=this quarter, 10=this week |
| **Alignment** | 20% | Fit with strategy, goals, and capabilities | 1=off-strategy, 5=partially aligned, 10=core to strategy |

### RICE Dimensions

| Dimension | Description | Scale |
|-----------|-------------|-------|
| **Reach** | How many users/customers affected per quarter | Absolute number (e.g., 500, 5000) |
| **Impact** | How much each person is affected | 0.25=minimal, 0.5=low, 1=medium, 2=high, 3=massive |
| **Confidence** | How sure are we about the estimates | 50%=low, 80%=medium, 100%=high |
| **Effort** | Person-months of work required | Absolute number (lower = better) |

RICE score = (Reach x Impact x Confidence) / Effort

### ICE Dimensions

| Dimension | Description | Scale |
|-----------|-------------|-------|
| **Impact** | How much will this move the needle | 1-10 |
| **Confidence** | How sure are we this will work | 1-10 |
| **Ease** | How easy is this to implement | 1-10 |

ICE score = Impact x Confidence x Ease

### Custom Dimension Template

```markdown
### Dimension: [Name]

**Weight:** [Percentage]
**Description:** [What this dimension measures]

**Scoring guide:**
- 1-2: [Low anchor description]
- 3-4: [Below average description]
- 5-6: [Average description]
- 7-8: [Above average description]
- 9-10: [High anchor description]

**Example scores:**
- [Concrete example] = [Score] because [rationale]
- [Concrete example] = [Score] because [rationale]
```

### Weight Allocation Checklist

```markdown
- [ ] Weights sum to 100%
- [ ] No single dimension exceeds 40% (unless deliberately chosen)
- [ ] Stakeholders agree on dimension definitions
- [ ] Stakeholders agree on weight distribution
- [ ] Score guides are documented before scoring begins
```

## Step 4: Calibration

Calibration ensures scores are consistent and meaningful. This is the most overlooked step and the most important for producing trustworthy results.

### Calibration Techniques

| Technique | Description | When to Use |
|-----------|-------------|-------------|
| **Anchor setting** | Score 2-3 reference options first as benchmarks | Always (5+ options) |
| **End-point definition** | Define concrete examples for 1, 5, and 10 | Always |
| **Independent scoring** | Multiple people score independently, then compare | When reducing individual bias |
| **Relative ranking first** | Rank options within each dimension before assigning numbers | When absolute scoring feels arbitrary |
| **Score normalization** | Adjust scores to use the full range (avoid clustering at 7-8) | When scores bunch together |

### Anchor Setting Process

1. Choose 2-3 well-understood options as anchors
2. Score anchors first on all dimensions
3. Use anchors as reference points when scoring remaining options
4. If a new score feels wrong relative to an anchor, adjust

```markdown
### Calibration Anchors

| Anchor Option | Dimension | Score | Rationale |
|---------------|-----------|-------|-----------|
| [Well-known option A] | Impact | 8 | [Why this is an 8] |
| [Well-known option B] | Impact | 3 | [Why this is a 3] |
| [Well-known option A] | Effort | 5 | [Why this is a 5] |
| [Well-known option B] | Effort | 9 | [Why this is a 9] |
```

### Score Distribution Health Check

After scoring, verify the distribution looks reasonable:

```markdown
- [ ] Scores use at least 60% of the 1-10 range (not all clustered at 6-8)
- [ ] At least one option scores below 5 on some dimension
- [ ] At least one option scores above 8 on some dimension
- [ ] No dimension has all identical scores (that dimension is useless)
- [ ] Anchor options still feel correctly placed relative to others
```

## Step 5: Scoring

Score every option on every dimension. Document rationale for every score.

### Scoring Template

```markdown
## Scores: [Option Name]

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Impact | [1-10] | [Why this score -- specific evidence or reasoning] |
| Effort | [1-10] | [Why this score -- reference comparable past work] |
| Urgency | [1-10] | [Why this score -- what happens if we delay] |
| Alignment | [1-10] | [Why this score -- which strategic goals does it serve] |
```

### Scoring Discipline Rules

1. **Score one dimension at a time across all options** -- Not one option at a time. This improves consistency.
2. **Write rationale before moving to the next score** -- Forces deliberate thinking.
3. **Reference anchors frequently** -- "Is this more or less impactful than Anchor A?"
4. **Flag low-confidence scores** -- Mark scores where you are guessing with a `(?)` suffix.
5. **Separate fact from opinion** -- Note when a score is data-driven vs. judgment-based.

### Handling Uncertainty

| Confidence Level | Approach |
|-----------------|----------|
| **High** (data available) | Score directly, cite the data |
| **Medium** (informed judgment) | Score with rationale, flag as estimate |
| **Low** (guessing) | Use range (e.g., 4-7), take midpoint, flag for validation |
| **Unknown** | Assign neutral score (5), heavily flag, seek more information |

## Step 6: Aggregation

Calculate weighted scores and produce the final ranking.

### Weighted Score Calculation

For each option: `Final Score = SUM(dimension_score x dimension_weight)`

### Full Matrix Template

```markdown
# Priority Matrix

**Framework:** [Framework name]
**Date:** [Date scored]
**Scored by:** [Who participated]

## Dimension Weights

| Dimension | Weight |
|-----------|--------|
| Impact | 30% |
| Effort | 25% |
| Urgency | 25% |
| Alignment | 20% |

## Scoring Matrix

| # | Option | Impact | Effort | Urgency | Alignment | Weighted Score | Rank |
|---|--------|--------|--------|---------|-----------|----------------|------|
| 1 | Option Alpha | 9 | 7 | 8 | 9 | **8.25** | 1 |
| 2 | Option Beta | 8 | 6 | 9 | 7 | **7.65** | 2 |
| 3 | Option Gamma | 7 | 9 | 5 | 8 | **7.10** | 3 |
| 4 | Option Delta | 6 | 8 | 4 | 6 | **5.90** | 4 |

## Score Breakdown

[Include rationale tables from Step 5 for each option]
```

### RICE Score Calculation

```markdown
| Option | Reach | Impact | Confidence | Effort | RICE Score | Rank |
|--------|-------|--------|------------|--------|------------|------|
| Alpha | 5000 | 2 | 80% | 3 | 2667 | 1 |
| Beta | 2000 | 3 | 100% | 2 | 3000 | -- |
```

Note: RICE produces absolute scores, not 1-10 normalized scores. Rankings compare relative positions.

### Tie-Breaking Rules

When two options have the same or very close scores (within 5%):

1. **Impact wins** -- Higher impact option ranks higher
2. **Effort wins** -- If impact is equal, lower effort option ranks higher
3. **Confidence wins** -- If still tied, higher confidence option ranks higher
4. **Stakeholder tiebreak** -- Escalate to the decision maker

## Step 7: Bias Check

After scoring and ranking, explicitly check for common cognitive biases that distort prioritization.

### Bias Checklist

| Bias | Description | Check Question |
|------|-------------|----------------|
| **Anchoring** | Over-weighting the first information received | Did the order we scored options affect results? |
| **Recency** | Favoring recently discussed options | Are older but valid options ranked too low? |
| **Sunk cost** | Favoring options with prior investment | Are we scoring future value, not past spend? |
| **Champion bias** | Favoring options pushed by senior stakeholders | Would the ranking change if options were anonymous? |
| **Availability** | Overweighting vivid or memorable options | Are less flashy options getting fair scores? |
| **Groupthink** | Conforming to perceived team consensus | Did anyone score independently before group discussion? |
| **Optimism** | Underestimating effort, overestimating impact | Are effort scores realistic? Compare to past projects. |
| **Status quo** | Favoring options that preserve current state | Are transformative options getting fair impact scores? |

### Bias Mitigation Techniques

```markdown
- [ ] Score independently before group discussion
- [ ] Randomize the order options are presented
- [ ] Assign a "devil's advocate" for top-ranked options
- [ ] Compare effort estimates to actual past effort on similar work
- [ ] Ask: "Would we still rank this #1 if [champion] were not advocating?"
- [ ] Ask: "What would need to be true for the bottom option to be #1?"
- [ ] Re-score any flagged low-confidence scores after bias review
```

> See `references/bias-mitigation.md`

## Step 8: Validation

The matrix produces a ranking. Validation ensures the ranking makes sense.

### Validation Questions

```markdown
- [ ] Does the #1 option feel right? If not, what is the matrix missing?
- [ ] Would a reasonable stakeholder object to the top 3? Why?
- [ ] Do the bottom 3 genuinely deserve to be deprioritized?
- [ ] Does the ranking align with stated strategy and goals?
- [ ] Are there dependencies that make the ranking impractical?
- [ ] Is there an obvious "do first" option the matrix ranked low?
- [ ] Has the methodology been explained and accepted by stakeholders?
```

### The Gut Check Test

If the matrix ranking contradicts strong intuition, do not simply override it. Instead:

1. **Identify the gap** -- Which dimension is causing the surprising result?
2. **Check scoring** -- Was that dimension scored correctly for the surprising option?
3. **Check weighting** -- Should that dimension's weight be adjusted?
4. **Resolve explicitly** -- Either fix the model or document why intuition is wrong

```markdown
### Gut Check: [Surprising Result]

**Expected rank:** [What you expected]
**Actual rank:** [What the matrix produced]
**Root cause:** [Which dimension/weight caused the surprise]
**Resolution:** [Adjusted score/weight OR accepted the matrix result because...]
```

### Dependency Validation

Even if Option A outranks Option B, if A depends on B, then B must come first. After ranking:

```markdown
- [ ] Check for dependency cycles (A needs B, B needs A)
- [ ] Adjust execution order for hard dependencies
- [ ] Note where parallel execution is possible
- [ ] Document any re-ordering and rationale
```

## Output Formats

### Quick Priority List (3-5 Options)

```markdown
# Priorities: [Context]

**Date:** [Date]
**Framework:** ICE (quick scoring)

## Priority Stack

1. **[Option Name]** (Score: 8.5)
   - Why first: [One-line rationale]
   - Next action: [Concrete next step]

2. **[Option Name]** (Score: 7.2)
   - Why second: [One-line rationale]
   - Next action: [Concrete next step]

3. **[Option Name]** (Score: 6.8)
   - Why third: [One-line rationale]
   - Next action: [Concrete next step]

## Deprioritized

- **[Option Name]** (Score: 4.1) -- [Why not now]
- **[Option Name]** (Score: 3.5) -- [Why not now]

## Methodology

[Brief description of framework and dimensions used]
```

### Full Priority Matrix (6+ Options)

```markdown
# Priority Matrix: [Context]

**Date:** [Date]
**Framework:** [Framework name]
**Scored by:** [Participants]
**Confidence:** [Overall confidence level]

## Executive Summary

[Top 3 priorities in one paragraph. Key trade-offs and rationale.]

## Priority Stack

### Tier 1: Do Now
| Rank | Option | Score | Key Rationale |
|------|--------|-------|---------------|
| 1 | [Name] | [Score] | [Why] |
| 2 | [Name] | [Score] | [Why] |

### Tier 2: Do Next
| Rank | Option | Score | Key Rationale |
|------|--------|-------|---------------|
| 3 | [Name] | [Score] | [Why] |
| 4 | [Name] | [Score] | [Why] |

### Tier 3: Do Later
| Rank | Option | Score | Key Rationale |
|------|--------|-------|---------------|
| 5 | [Name] | [Score] | [Why] |
| 6 | [Name] | [Score] | [Why] |

### Not Now
| Option | Score | Why Deprioritized |
|--------|-------|-------------------|
| [Name] | [Score] | [Reason] |

## Full Scoring Matrix

[Include the complete matrix table from Step 6]

## Dimension Definitions and Weights

[Include the dimension table from Step 3]

## Calibration Notes

[Include anchors and calibration decisions from Step 4]

## Score Rationale

[Include per-option rationale tables from Step 5]

## Bias Review

[Include completed bias checklist from Step 7]

## Validation Notes

[Include completed validation checklist from Step 8]

## Execution Dependencies

[Dependency map and any re-ordering from validation]

## Next Steps

1. [Concrete action for priority #1]
2. [Concrete action for priority #2]
3. [When to re-score -- trigger conditions]
```

## Common Patterns

### The Portfolio Prioritization

Score strategic initiatives across business dimensions: revenue impact, customer satisfaction, operational efficiency, competitive positioning.

**Use when:** Annual or quarterly planning, allocating a fixed budget across initiatives.

### The Feature Backlog Triage

Apply RICE scoring to a product feature backlog. Emphasize reach and confidence to avoid building low-impact, high-uncertainty features.

**Use when:** Sprint planning, product roadmap creation, feature grooming sessions.

### The Technical Debt Matrix

Score technical debt items on: blast radius (what breaks if ignored), fix effort, frequency of pain, and dependency blocking. Weight blast radius and dependency blocking heavily.

**Use when:** Deciding which tech debt to address during a maintenance sprint or platform stabilization.

### The Opportunity Assessment

Combine market analysis with feasibility scoring. Dimensions include: market size, competitive intensity, capability fit, time to value.

**Use when:** Evaluating new business opportunities, partnership proposals, or market entry decisions.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-cultivation` | Cultivation outputs become the option list for prioritization |
| `context-ingestion` | Raw context feeds cultivation which feeds prioritization |
| `proposal-builder` | Priorities feed directly into proposal scope and sequencing |
| `architect` | Top-priority options may need architectural analysis |
| `spec` | After prioritization, top items move into specification |
| `implement` | Execution order follows the priority stack |
| `code-review` | Review effort can be prioritized using a lightweight matrix |

## Key Principles

**Methodology before scoring.** Agree on framework, dimensions, and weights before anyone scores a single option. Changing methodology mid-scoring invalidates prior scores.

**Rationale is the product.** The ranked list is useful; the documented rationale is invaluable. Future prioritization decisions build on today's reasoning, not just today's numbers.

**Calibrate relentlessly.** Uncalibrated scores are meaningless. Two people giving "7 out of 10" may mean completely different things. Anchors and examples make scores comparable.

**Separate scoring from advocacy.** The person who proposed an option should not be the only person scoring it. Separation reduces champion bias and increases trust in results.

**Prioritization is perishable.** A priority matrix has a shelf life. Re-score when new information emerges, when market conditions change, or at regular intervals (monthly or quarterly).

**Explicit is better than implicit.** A mediocre framework applied transparently beats a brilliant decision made in someone's head. The matrix makes reasoning visible, challengeable, and improvable.

## References

- `references/prioritization-frameworks.md`: Detailed framework implementations (RICE, MoSCoW, ICE, Eisenhower, Cost of Delay)
- `references/scoring-calibration.md`: Calibration techniques, anchor setting, score normalization
- `references/bias-mitigation.md`: Cognitive biases in prioritization and countermeasures
- `references/stakeholder-alignment.md`: Techniques for building consensus on methodology and results
- `references/effort-estimation.md`: Effort estimation approaches for the effort/ease dimension

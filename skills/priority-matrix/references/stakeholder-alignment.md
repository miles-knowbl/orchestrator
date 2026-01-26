# Stakeholder Alignment Reference

Prioritization is only useful if stakeholders trust and adopt the results. This reference covers techniques for building consensus on methodology, resolving disagreements, communicating decisions, and escalating when alignment fails.

## Alignment Sequence

Alignment must happen in this order. Skipping earlier steps undermines later ones.

| Step | What to Align On | When | Why First |
|------|-----------------|------|-----------|
| 1. Goal | What we are optimizing for | Before framework selection | Disagreement on goals makes all scoring contentious |
| 2. Framework | Which prioritization framework to use | Before dimension definition | The framework determines how decisions are made |
| 3. Dimensions | What dimensions and weights to use | Before scoring | Weights encode values; agree on values first |
| 4. Scores | Individual option scores | During scoring | Scoring disagreements are healthy and expected |
| 5. Results | The final ranking and action plan | After aggregation | Easier to accept when methodology was agreed upon |

## Building Consensus on Methodology

### Technique 1: Framework Proposal with Options

Present 2-3 framework candidates with pros/cons rather than dictating one.

**Template:**
```
PRIORITIZATION METHODOLOGY PROPOSAL
Context: We have [N] options to prioritize for [goal/timeline].

Option A: Weighted Scoring -- Pro: customizable, transparent / Con: slower
Option B: RICE -- Pro: standard, quantitative / Con: requires reach data
Option C: ICE -- Pro: fast, simple / Con: less precise

Recommendation: [Your pick and why]
```

### Technique 2: Weight Allocation Workshop

When stakeholders disagree on dimension weights, use a structured allocation exercise.

**Process:**
1. Give each stakeholder 100 points to distribute across dimensions
2. Collect allocations independently (no discussion during allocation)
3. Display all allocations side by side
4. Discuss dimensions where allocations diverge by more than 10 points
5. Converge on final weights through discussion, not averaging

**Example output:**

| Dimension | Stakeholder A | Stakeholder B | Stakeholder C | Avg | Final (negotiated) |
|-----------|--------------|--------------|--------------|-----|-------------------|
| Impact | 40 | 25 | 30 | 32 | 30 |
| Effort | 20 | 30 | 25 | 25 | 25 |
| Urgency | 15 | 30 | 25 | 23 | 25 |
| Alignment | 25 | 15 | 20 | 20 | 20 |

**Key rule:** Final weights should reflect discussion outcomes, not raw averages. Averaging silences important reasoning behind outlier allocations.

### Technique 3: Decision Rights Clarity

Before any prioritization session, establish who has which role.

| Role | Responsibility | Typical Person |
|------|---------------|----------------|
| **Decision maker** | Final authority on ranking; breaks ties | Product lead, VP, or sponsor |
| **Methodology owner** | Proposes and facilitates the framework | PM, analyst, or facilitator |
| **Scorer** | Provides scores with rationale | Subject matter experts |
| **Reviewer** | Validates results and checks for bias | Peer or external reviewer |
| **Informed** | Receives the results but does not score | Wider team, leadership |

## Handling Disagreements

### On Dimension Weights

Ask each stakeholder what outcome they are optimizing for. Often the disagreement is about goals, not weights. If goals differ, run two matrices and compare. If goals align, use the weight allocation workshop.

### On Individual Scores

When scorers disagree by 3+ points: share rationale (not just numbers), identify if the disagreement is factual or value-based. Factual: find data. Value-based: take the median and document dissent. Never pressure a scorer without new evidence.

### On the Final Ranking

If a stakeholder rejects the ranking despite agreeing to methodology: ask which specific rank position is wrong and which score would need to change. If they can identify a scoring error, re-examine. If not, the disagreement is with weights -- revisit or escalate to the decision maker.

## Communication Templates

### Priority Decision Announcement

```
PRIORITY DECISION: [Context]

We scored [N] options using [Framework] with dimensions:
[Dimension 1] ([Weight]%), [Dimension 2] ([Weight]%), ...

Top 3 priorities (in order):
1. [Option] -- Score: [X] -- Rationale: [one sentence]
2. [Option] -- Score: [X] -- Rationale: [one sentence]
3. [Option] -- Score: [X] -- Rationale: [one sentence]

Deferred:
- [Option] -- Reason: [why not now]

Methodology and full scoring matrix: [link to MATRIX.md]

Next steps: [what happens now for the top priorities]
Questions or concerns: [who to contact and by when]
```

### Disagreement Acknowledgment

When a stakeholder's preferred option was deprioritized, proactively acknowledge it:

```
Regarding [Option Name]:
This scored [X] overall, ranking #[N] of [Total].
Factors keeping it from top tier: [Dimension] scored [X] because [rationale].
What would move it up: If [condition], it would likely move to tier [Z].
Re-evaluation: [trigger or date for next review]
```

### Requesting Re-Prioritization

```
RE-PRIORITIZATION REQUEST
Trigger: [What changed]  |  Affected options: [Which ones]
Expected impact: [Which scores change, which direction]
Proposed action: [Re-score all / Re-score affected only / Adjust weights]
```

## Escalation Paths

When alignment fails despite good-faith methodology, follow this escalation ladder:

| Level | Situation | Action |
|-------|-----------|--------|
| **1. Scoring dispute** | Scorers disagree on a specific score | Share rationale, resolve with evidence, take median if unresolved |
| **2. Weight dispute** | Stakeholders disagree on dimension weights | Run weight allocation workshop, decision maker resolves |
| **3. Framework dispute** | Stakeholders disagree on the framework itself | Run two frameworks in parallel, compare results, decision maker chooses |
| **4. Goal dispute** | Stakeholders disagree on what to optimize for | Escalate to leadership for goal alignment before any prioritization |
| **5. Trust failure** | A stakeholder rejects the process entirely | One-on-one conversation to understand concerns, offer to redesign methodology together |

**Escalation principle:** Always escalate the smallest possible disagreement. A scoring dispute should not escalate to a goal dispute unless there is genuine evidence that goals are misaligned.

## Maintaining Alignment Over Time

- **Regular cadence:** Re-score monthly or quarterly, even if nothing seems to have changed
- **Trigger-based:** When new information invalidates a key assumption, re-score immediately
- **Visible backlog:** Keep the matrix accessible, not buried in documents
- **Retrospectives:** Compare actual outcomes to predicted scores after completing top items
- **Re-entry:** Score new options against the existing matrix rather than creating a new one

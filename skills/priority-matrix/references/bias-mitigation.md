# Bias Mitigation Reference

Cognitive biases systematically distort prioritization. This reference catalogs the most common biases, detection techniques, and mitigation strategies.

## Bias Catalog

### 1. Anchoring Bias

The first information received disproportionately influences all subsequent judgments.

**Detect:** First option scored lands at 5-7; later options cluster around it. Randomizing order changes the ranking.
**Mitigate:** Score dedicated anchors first. Randomize option order. Score one dimension across all options before moving to the next.

### 2. Recency Bias

Favoring options recently discussed, requested, or that recently caused pain.

**Detect:** Last week's hot topic ranks disproportionately high. Older strategic options rank lower than expected.
**Mitigate:** Ask "Would this rank the same if it came up 3 months ago?" Review option origins for temporal skew.

### 3. Sunk Cost Bias

Favoring options with prior investment, regardless of future value.

**Detect:** Rationale includes "we already invested X." Abandoning partial work feels disproportionately painful.
**Mitigate:** Score only future value. Ask "If starting fresh, would we still choose this?" Separate continue/abandon from prioritize.

### 4. Champion Bias

Options from senior or vocal individuals receive inflated scores.

**Detect:** Leadership-proposed options rank consistently higher. Anonymous scoring produces a different ranking.
**Mitigate:** Use independent scoring before group discussion. Present options without attribution. Ask "Would this rank #1 without [champion]?"

### 5. Availability Bias

Overweighting vivid or memorable options; underweighting abstract ones.

**Detect:** Flashy features outrank foundational work. Infrastructure and security score low despite known importance.
**Mitigate:** Include "risk reduction" dimension. Force concrete examples for abstract options. Review bottom-ranked items for this bias.

### 6. Groupthink

Team converges without genuine critical evaluation due to social pressure.

**Detect:** Scores converge after one person shares. No scores below 5. Dissenters self-censor.
**Mitigate:** Always score independently first. Invite dissent explicitly. Rotate a devil's advocate role. Use anonymous scoring.

### 7. Optimism Bias

Systematically overestimating benefits and underestimating effort and risk.

**Detect:** Impact averages above 7. Effort averages above 6. Past estimates were 40-100% too low.
**Mitigate:** Use reference class forecasting. Apply 0.7x optimism discount to effort. Require at least one `(?)` flag.

### 8. Status Quo Bias

Favoring options that preserve the current state; undervaluing change.

**Detect:** Incremental improvements outrank transformative options. Risk of change is weighed but risk of inaction is not.
**Mitigate:** Score "cost of inaction" explicitly. Ask "What happens if we do nothing for 12 months?"

## Pre-Mortem Technique

Run a pre-mortem on the top 1-2 ranked options before finalizing.

**Process:**
1. Assume the top-ranked option has been completed but **failed to deliver expected value**
2. Each participant writes 2-3 reasons why it might have failed
3. Assess whether any failure reasons reveal scoring errors (inflated impact, underestimated effort)
4. Adjust scores if the pre-mortem surfaces genuine concerns

**Template:**
```
PRE-MORTEM: [Top Ranked Option]
Scenario: It is 6 months from now. We shipped this. It failed.
Failure reasons:
- [Reason 1] --> Does this change Impact score? Confidence?
- [Reason 2] --> Does this change Effort score?
Adjustment: [None / Revised scores / Flagged for monitoring]
```

## Red Team Technique

Assign 1-2 people to argue against the top-ranked option and for the lowest-ranked option.

**Prompts:** "Make the strongest case that #1 should be #5." / "What evidence would change the ranking?" / "Which score is most likely wrong, and in which direction?"

**Rules:** Red team arguments must reference specific dimension scores. They need to stress-test the ranking, not win. If compelling, re-score the affected dimension.

## Bias Review Checklist

Run this checklist after scoring is complete and before finalizing the ranking.

```
- [ ] Anchoring: Were anchors set before real scoring began?
- [ ] Recency: Are recently-discussed options disproportionately high?
- [ ] Sunk cost: Are any scores influenced by past investment rather than future value?
- [ ] Champion: Would the ranking change if options were anonymous?
- [ ] Availability: Are "boring" but important options (infra, security) fairly scored?
- [ ] Groupthink: Did anyone score independently before group discussion?
- [ ] Optimism: Are effort estimates realistic compared to past actuals?
- [ ] Status quo: Are transformative options getting fair impact scores?
- [ ] Pre-mortem: Has the top option been stress-tested for failure scenarios?
- [ ] Red team: Has anyone argued against the consensus ranking?
```

## When to Escalate Bias Concerns

If a bias check reveals significant distortion (3+ point swing on any dimension), do not silently adjust. Instead:

1. Name the specific bias detected and the evidence
2. Propose specific score adjustments with rationale
3. Re-run aggregation and compare old vs. new ranking
4. Present both rankings to the decision maker with the bias analysis
5. Let the decision maker choose, with full transparency about what changed and why

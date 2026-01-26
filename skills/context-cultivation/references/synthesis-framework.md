# Synthesis Framework

Techniques for combining analytical findings into coherent, actionable insights during context cultivation.

## Triangulation Techniques

Triangulation validates findings by confirming them through multiple independent lines of evidence.

### Types of Triangulation

| Type | Method | Strength |
|------|--------|----------|
| **Source triangulation** | Same finding confirmed by 3+ different sources | Strongest; independent corroboration eliminates source bias |
| **Method triangulation** | Same finding confirmed by different analytical approaches | Strong; reduces methodological blind spots |
| **Perspective triangulation** | Same finding confirmed from different stakeholder viewpoints | Moderate-strong; demonstrates broad relevance |
| **Temporal triangulation** | Same finding confirmed across different time periods | Moderate; demonstrates persistence and durability |

### Applying Triangulation

**Step 1:** Select a candidate finding (theme, pattern, or preliminary insight).
**Step 2:** Identify all evidence supporting it and tag each evidence item by source, method, perspective, and time.
**Step 3:** Assess triangulation strength:

| Triangulation Level | Criteria | Confidence Boost |
|---------------------|----------|------------------|
| **Full** | 3+ sources, 2+ perspectives, consistent over time | High confidence finding |
| **Partial** | 2 sources or 2 perspectives, no contradictions | Moderate confidence finding |
| **Single-point** | One source, one perspective, one time point | Low confidence; flag for validation |
| **Contradicted** | Evidence exists both for and against | Do not synthesize; route to contradiction resolution |

**Step 4:** Only promote fully or partially triangulated findings to insight synthesis. Single-point findings remain as emerging observations.

### Triangulation Documentation

Record each evidence item with its source, type (primary/secondary), perspective, and time period. State the triangulation level achieved (Full/Partial/Single-point/Contradicted).

## Abstraction Laddering

Abstraction laddering moves between concrete observations and abstract principles to find the level where insights are most actionable.

### The Three Levels

- **Abstract** ("Why does this matter?") --- Principles, strategic implications, transferable truths
- **Middle** ("What does this mean?") --- Patterns, interpretations, contextual understanding
- **Concrete** ("What did we observe?") --- Specific data points, quotes, measurements

### Laddering Process

**Step 1: Anchor in concrete.** Start with specific observations from your coded data.
**Step 2: Climb to meaning.** Ask "Why?" and "So what?" to move up the ladder.
**Step 3: Test at abstract.** Formulate a general principle or strategic implication.
**Step 4: Descend to action.** Ask "What would we do differently?" to make the abstract actionable.

### Example

```
CONCRETE:  "3 of 5 sources mention users creating spreadsheet workarounds
            for the reporting feature."

CLIMB:     Why? --> The reporting feature does not meet actual user needs.
           So what? --> Users will invest effort to get what they need
           regardless of what the product provides.

ABSTRACT:  "User workarounds are the strongest signal of unmet product needs.
            The effort users invest in workarounds quantifies the value of
            the missing capability."

DESCEND:   Action: Map all documented workarounds as a proxy for feature
           prioritization. The most elaborate workarounds indicate the
           highest-value gaps.
```

### Laddering Pitfalls

| Pitfall | Description | Fix |
|---------|-------------|-----|
| **Staying too concrete** | Restating observations without interpreting them | Force yourself to ask "So what?" at least twice |
| **Flying too abstract** | Producing platitudes disconnected from evidence | Every abstract statement must trace to specific data |
| **Skipping levels** | Jumping from data to grand theory | Walk the ladder step by step; document each rung |
| **One-way travel** | Abstracting without returning to action | Always complete the round trip: concrete to abstract to actionable |

## Narrative Threading

Narrative threading connects disparate insights into a coherent story that stakeholders can follow and act on.

### Thread Construction Process

1. **Identify the spine.** Select the single most important insight as the narrative backbone.
2. **Attach supporting threads.** Connect secondary insights that reinforce, qualify, or extend the spine.
3. **Weave in contradictions.** Show where the story is complicated; this builds credibility.
4. **Surface the gaps.** Acknowledge what the narrative cannot yet explain.
5. **End with implications.** State what the story means for decisions.

### Thread Types

| Thread Type | Role in Narrative | Connector Language |
|-------------|-------------------|--------------------|
| **Reinforcing** | Strengthens the main insight | "Furthermore...", "This is consistent with..." |
| **Qualifying** | Adds nuance or conditions | "However, this applies primarily when...", "With the caveat that..." |
| **Extending** | Explores implications | "This suggests that...", "If this holds, then..." |
| **Contrasting** | Presents counter-evidence | "On the other hand...", "This is complicated by..." |
| **Bridging** | Connects otherwise unrelated findings | "Unexpectedly, this connects to...", "The link between X and Y..." |

### Example Narrative Structure

```markdown
**Spine:** Onboarding is the primary conversion barrier.
**Reinforcing:** Support tickets confirm onboarding generates 60% of first-week contacts.
**Qualifying:** Applies to self-service users; enterprise clients with dedicated onboarding see 2x activation.
**Extending:** Feature investment without onboarding improvement will not move conversion metrics.
**Contrasting:** One source suggests pricing drives churn, but their data covers post-onboarding users only.
**Bridging:** Workaround patterns in feature analysis also appear in onboarding --- same "unmet guidance need."
**Implication:** Prioritize onboarding experience over new features for the next quarter.
```

## Insight Quality Tests

Every synthesized insight must pass five quality tests before inclusion in the cultivation output.

| Test | Question | Pass Criteria | Fail Indicator |
|------|----------|---------------|----------------|
| **Specific** | Is it concrete enough to act on? | Someone could design a response to this insight | Vague or could apply to any situation |
| **Evidenced** | Can you trace it to source data? | At least 2 coded data points support it | "I think..." or "It seems..." without citations |
| **Actionable** | Does it suggest what to do? | Implies a decision or direction | Purely descriptive with no forward motion |
| **Novel** | Does it say something the sources do not say individually? | Combines findings into new understanding | Restates a single source's conclusion |
| **Relevant** | Does it matter for the problem at hand? | Connects to the analysis objectives | Interesting but tangential finding |

### Applying the SEANR Test

Score each insight. All five must pass before inclusion:

```
Insight: "[Statement]"
  [x] Specific   [x] Evidenced   [ ] Actionable   [x] Novel   [x] Relevant
  Result: 4/5 -- Revise for actionability before including
```

**Revision for failing tests:** Not specific --- add who, what, when, how much. Not evidenced --- find data or downgrade. Not actionable --- append "This means we should..." Not novel --- discard or combine with other findings. Not relevant --- connect to objectives or move to appendix.

## Synthesis Checklist

```
- [ ] All strong themes triangulated
- [ ] Key findings abstraction-laddered (concrete to abstract to actionable)
- [ ] Narrative thread connects the top 3-5 insights
- [ ] Every insight passes SEANR (5/5)
- [ ] Contradictions woven into narrative, not hidden
- [ ] Gaps acknowledged with confidence impact
- [ ] The synthesis says something new beyond any single source
```

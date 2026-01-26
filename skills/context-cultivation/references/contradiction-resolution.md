# Contradiction Resolution

Strategies for identifying, classifying, and resolving conflicting information across sources.

## Types of Contradictions

| Type | Definition | Example |
|------|-----------|---------|
| **Factual** | Sources disagree on verifiable facts or data | Source A says 30% churn; Source B says 12% churn |
| **Interpretive** | Sources agree on facts but draw different conclusions | Both see declining usage; A says product-market fit issue, B says seasonal |
| **Temporal** | Information was accurate at different points in time | 2023 report says market growing; 2025 report says market contracting |
| **Perspectival** | Different stakeholders experience the same reality differently | Engineering says system is stable; Support says tickets are spiking |
| **Methodological** | Different measurement approaches produce different results | Survey says 80% satisfaction; behavioral data shows 40% retention |

## Resolution Strategies by Type

### Factual Contradictions

**Goal:** Determine which fact is correct.

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Source hierarchy** | One source is clearly more authoritative | Prefer primary over secondary, recent over dated |
| **Cross-reference** | A third source can break the tie | Find independent corroboration |
| **Scope check** | Sources may measure different things | Verify definitions, populations, timeframes align |
| **Recency rule** | Data may have changed over time | Use most recent unless there is reason not to |

### Interpretive Contradictions

**Goal:** Understand why interpretations differ and determine which is better supported.

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Evidence weighing** | One interpretation has stronger backing | Count and quality-assess supporting data points |
| **Both-and framing** | Interpretations are complementary, not exclusive | Reframe as "this AND that" rather than "this OR that" |
| **Assumption surfacing** | Hidden assumptions drive different conclusions | Identify what each interpreter assumes to be true |
| **Context binding** | Interpretations hold in different contexts | State when each interpretation applies |

### Temporal Contradictions

**Goal:** Establish the current state and understand the trajectory.

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Timeline construction** | Multiple data points across time exist | Plot chronologically to reveal trend |
| **Recency weighting** | Older data conflicts with newer data | Default to recent unless trend analysis suggests otherwise |
| **Change documentation** | Something clearly changed between data points | Document what changed and when |

### Perspectival Contradictions

**Goal:** Preserve all valid perspectives while noting the differences.

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Stakeholder mapping** | Different roles see different realities | Document each perspective with its context |
| **Vantage point labeling** | Perspectives are valid within their scope | Tag each finding with its perspective origin |
| **Synthesis** | Perspectives combine into a richer picture | Describe the whole that the parts represent |

### Methodological Contradictions

**Goal:** Understand why methods diverge and which is more appropriate.

| Strategy | When to Use | How |
|----------|-------------|-----|
| **Method assessment** | One method is better suited to the question | Evaluate fitness-for-purpose of each method |
| **Triangulation** | Multiple methods strengthen the finding | Use agreement across methods as validation |
| **Caveat documentation** | No clear winner between methods | Report both results with methodological notes |

## Decision Framework: Flag vs. Resolve

Not every contradiction needs resolution. Use this decision tree:

```
Does the contradiction affect a core theme or key decision?
  YES --> Does sufficient evidence exist to resolve it?
            YES --> RESOLVE: Apply the appropriate strategy above
            NO  --> FLAG as critical: Document clearly, recommend investigation
  NO  --> Is it likely to affect downstream work?
            YES --> FLAG as significant: Document with both positions
            NO  --> DOCUMENT as minor: Note and move on
```

## Severity Classification

| Severity | Criteria | Required Action |
|----------|----------|-----------------|
| **Critical** | Affects core assumptions; blocks confident insight synthesis | Must resolve or escalate before completing cultivation |
| **Significant** | Weakens a theme or pattern; introduces uncertainty | Flag prominently; attempt resolution; proceed with caveats |
| **Minor** | Peripheral inconsistency; does not change main findings | Document for completeness; no action required |

## Documentation Template for Unresolved Contradictions

Use this template when a contradiction cannot be resolved during cultivation:

```markdown
### UNRESOLVED: [Brief descriptive title]

**Type:** [Factual / Interpretive / Temporal / Perspectival / Methodological]
**Severity:** [Critical / Significant / Minor]
**Discovery Phase:** [Which cultivation step surfaced this]

**Position A:**
- Source: [Source name and reference]
- Claim: "[Exact statement or data point]"
- Supporting evidence: [Any corroboration]

**Position B:**
- Source: [Source name and reference]
- Claim: "[Exact statement or data point]"
- Supporting evidence: [Any corroboration]

**Resolution Attempted:**
- [Strategy tried]: [Why it did not resolve the contradiction]
- [Strategy tried]: [Why it did not resolve the contradiction]

**Impact Assessment:**
- Themes affected: [List themes whose confidence is reduced]
- Patterns affected: [List patterns that depend on the disputed information]
- Downstream risk: [What could go wrong if the wrong position is assumed]

**Recommended Next Steps:**
1. [Specific action to resolve, e.g., "Interview the engineering lead"]
2. [Fallback action if primary fails]
3. [Conservative assumption to use if unresolvable]
```

## Common Pitfalls

| Pitfall | Description | Prevention |
|---------|-------------|------------|
| **False resolution** | Picking a side without sufficient evidence | Always document why one position was chosen |
| **Premature dismissal** | Ignoring contradictions that seem minor | Minor contradictions can compound; document all |
| **Authority bias** | Always deferring to the most senior source | Evaluate evidence quality, not source prestige |
| **Recency bias** | Always choosing the newest information | Newer is not always more accurate; consider context |
| **Harmonizing** | Smoothing over real disagreements to create false coherence | Preserve the tension when it genuinely exists |

## Integration with Cultivation Steps

| Cultivation Step | Contradiction Role |
|------------------|--------------------|
| Source inventory | Note preliminary conflicts between sources |
| Thematic coding | Flag codes that contradict codes from other sources |
| Pattern recognition | Contradictions may themselves form a Divergence pattern |
| Gap analysis | Unresolved contradictions create knowledge gaps |
| Opportunity mapping | Tensions between positions may reveal opportunity spaces |
| Insight synthesis | Resolved contradictions strengthen insights; unresolved ones add caveats |

# Opportunity Mapping

Techniques for identifying, classifying, and prioritizing opportunities that emerge from context cultivation analysis.

## Identifying Opportunities from Analytical Findings

Opportunities are not invented; they are discovered at the intersections of themes, patterns, gaps, and contradictions.

### Where Opportunities Emerge

| Analytical Finding | Opportunity Signal | Example |
|--------------------|--------------------|---------|
| **Strong theme** | A validated need with no current solution | Theme: "Users need real-time collaboration" but no tool supports it |
| **Recurring pattern** | A systematic behavior that can be leveraged | Pattern: Users build workarounds for the same limitation |
| **Knowledge gap** | An unoccupied space that could be filled | Gap: No competitor addresses enterprise compliance needs |
| **Contradiction** | A tension that a new approach could resolve | Engineering wants speed; compliance wants thoroughness --- automation bridges both |
| **Convergence** | Multiple themes pointing to the same space | Three independent themes all suggest mobile-first is underserved |
| **Absence pattern** | Something expected that nobody is doing | No source mentions accessibility; the first to address it gains advantage |

### Opportunity Extraction Process

1. **Review all themes** --- For each strong or moderate theme, ask: "What could be built, changed, or improved to address this?"
2. **Review all patterns** --- For each pattern, ask: "What leverage does this pattern create?"
3. **Review all gaps** --- For each gap, ask: "Is this gap also a market or product gap that could be filled?"
4. **Review all contradictions** --- For each tension, ask: "Could a novel approach dissolve this contradiction?"
5. **Cross-reference** --- The strongest opportunities sit at the intersection of multiple findings

## Opportunity Types

| Type | Definition | Characteristics | Time Horizon |
|------|-----------|-----------------|--------------|
| **Quick Win** | Low effort, clear value, immediate impact | Well-understood problem; known solution; minimal risk | Days to weeks |
| **Strategic** | Significant effort, substantial long-term value | Aligns with multiple themes; requires investment; competitive advantage | Weeks to months |
| **Innovative** | Novel approach, uncertain but high potential | Emerges from contradictions or absence patterns; no proven model; could be transformative | Months to quarters |
| **Defensive** | Prevents loss rather than creating gain | Addresses risks or gaps that could cause harm if ignored | Varies |
| **Foundational** | Enables other opportunities without direct value | Infrastructure, platform, or capability that unlocks future options | Weeks to months |

### Type Identification Guide

Ask these questions to classify an opportunity:

```
Is the solution known and the effort small?
  YES --> Quick Win

Does it align with 2+ strong themes and require sustained effort?
  YES --> Strategic

Does it require a novel approach with no proven precedent?
  YES --> Innovative

Does it primarily prevent a negative outcome?
  YES --> Defensive

Does it enable other opportunities rather than delivering value directly?
  YES --> Foundational
```

## Mapping Opportunities to Evidence

Every opportunity must be grounded in analytical findings. Use this evidence mapping structure:

```markdown
### Opportunity: [Title]

**Type:** [Quick Win / Strategic / Innovative / Defensive / Foundational]

**Evidence Map:**

| Finding Type | Reference | Connection |
|-------------|-----------|------------|
| Theme | [Theme name] | [How this theme supports the opportunity] |
| Pattern | [Pattern name] | [How this pattern creates leverage] |
| Gap | [Gap name] | [How this gap creates the opening] |
| Contradiction | [Contradiction name] | [How resolving this tension creates value] |

**Evidence strength:** [Strong: 3+ findings / Moderate: 2 findings / Emerging: 1 finding]
```

### Evidence Strength Rules

| Strength | Criteria | Confidence Level |
|----------|----------|-----------------|
| **Strong** | Supported by 3+ independent analytical findings across different types | High --- pursue with confidence |
| **Moderate** | Supported by 2 findings or multiple findings of the same type | Medium --- pursue with validation plan |
| **Emerging** | Supported by a single finding, however compelling | Low --- investigate further before committing |

## Prioritization Criteria

Score each opportunity on five dimensions. Use a 1-3 scale (1=Low, 2=Medium, 3=High).

| Criterion | Score 1 (Low) | Score 2 (Medium) | Score 3 (High) |
|-----------|---------------|-------------------|-----------------|
| **Impact** | Affects few users or minor improvement | Moderate user impact or meaningful improvement | Transformative for many users or the business |
| **Evidence** | Single finding, emerging confidence | Two findings, moderate confidence | Three or more findings, strong confidence |
| **Feasibility** | Requires major unknowns to be resolved | Some unknowns but generally understood | Clear path to execution |
| **Urgency** | No time pressure; can wait | Moderate time sensitivity | Window of opportunity closing or risk increasing |
| **Alignment** | Tangential to stated goals | Related to stated goals | Directly addresses primary objectives |

### Priority Tiers

| Tier | Total Score | Action |
|------|-------------|--------|
| **Tier 1: Pursue** | 12-15 | Include in recommendations; high confidence |
| **Tier 2: Consider** | 8-11 | Include with caveats; needs further validation |
| **Tier 3: Monitor** | 5-7 | Note for future; insufficient evidence or feasibility |
| **Tier 4: Park** | Under 5 | Document but do not recommend action |

## Opportunity Documentation Template

```markdown
### Opportunity: [Descriptive title]

**Type:** [Quick Win / Strategic / Innovative / Defensive / Foundational]
**Priority Tier:** [1-4] | **Evidence Strength:** [Strong / Moderate / Emerging]

**Description:** [What the opportunity is, stated as a possibility not a prescription]

**Evidence Map:**
- Theme: [Name] --- [Connection]
- Pattern: [Name] --- [Connection]
- Gap: [Name] --- [Connection]

**Scoring:** Impact [1-3] | Evidence [1-3] | Feasibility [1-3] | Urgency [1-3] | Alignment [1-3] | Total [/15]

**Assumptions:** [What must be true] | **Risks:** [What could prevent realization]
**Next Step:** [Single most important action to advance this opportunity]
```

## Common Anti-Patterns

| Anti-Pattern | Description | Prevention |
|--------------|-------------|------------|
| **Solutioneering** | Jumping to a specific solution before understanding the opportunity space | State opportunities as needs or spaces, not implementations |
| **Evidence-free optimism** | Proposing opportunities with no analytical grounding | Require every opportunity to map to at least one finding |
| **Novelty bias** | Favoring innovative opportunities over higher-value quick wins | Score all opportunities equally using the prioritization criteria |
| **Kitchen sink** | Listing every possible opportunity without prioritization | Limit recommendations to Tier 1 and Tier 2 only |
| **Isolation** | Mapping opportunities from single findings without cross-referencing | Always check whether other findings support or contradict the opportunity |

## Integration with Downstream Skills

| Downstream Skill | What It Receives from Opportunity Mapping |
|------------------|-------------------------------------------|
| `priority-matrix` | Tier 1 and Tier 2 opportunities with scores and evidence |
| `proposal-builder` | Opportunity descriptions, evidence maps, and assumptions |
| `architect` | Foundational opportunities that affect technical approach |
| `spec` | Quick wins and strategic opportunities with feasibility notes |

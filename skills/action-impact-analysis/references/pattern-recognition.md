# Pattern Recognition Reference

Identifying effective action patterns.

## What is a Pattern?

A pattern is a repeatable action approach that:
- Works consistently across situations
- Has predictable impact
- Can be applied to similar contexts

## Pattern Categories

### By Action Type

**Engagement Patterns:**
- How to get stakeholder meetings
- How to expand relationships
- How to reactivate cold contacts

**Enablement Patterns:**
- What materials work for champions
- How to arm for internal selling
- What content converts

**Technical Patterns:**
- What demos convert
- How to pass technical evaluation
- Integration proof approaches

**Close Patterns:**
- Proposal approaches that work
- Negotiation tactics
- How to get signature

### By Stakeholder Type

**Champion Patterns:**
- How to identify champions
- How to enable champions
- How to maintain champion engagement

**Decision-Maker Patterns:**
- How to get DM meetings
- What resonates with DMs
- How to get DM approval

**Blocker Patterns:**
- How to convert blockers
- How to neutralize blockers
- When to work around

### By Deal Context

**Industry Patterns:**
- What works in e-commerce
- What works in healthcare
- Industry-specific approaches

**Size Patterns:**
- Enterprise vs. mid-market
- Different stakeholder structures
- Buying process variations

**Stage Patterns:**
- Discovery best practices
- Demo winning approaches
- Close acceleration tactics

---

## Pattern Detection

### Signal Identification

Look for:
- Same action working multiple times
- Consistent outcome from approach
- High effectiveness ratings
- Similar contexts, similar results

### Minimum Evidence

Before establishing pattern:
- At least 3 occurrences
- Consistent effectiveness (>70%)
- Clear context match
- Explainable mechanism

### Pattern Strength

| Occurrences | Consistency | Strength |
|-------------|-------------|----------|
| 3-5 | >70% | Emerging |
| 6-10 | >80% | Established |
| 10+ | >90% | Strong |

---

## Pattern Documentation

### Pattern Template

```json
{
  "id": "PATTERN-001",
  "name": "Champion-enabled stakeholder intro",
  "category": "engagement",
  "context": {
    "when": "Need to engage new stakeholder",
    "prerequisites": ["Active champion", "Champion has relationship"],
    "stakeholderTypes": ["Decision-maker", "Influencer", "Technical"]
  },
  "action": {
    "description": "Ask champion to make introduction",
    "steps": [
      "Identify target stakeholder",
      "Confirm champion has relationship",
      "Ask champion for introduction",
      "Follow up within 24 hours"
    ]
  },
  "expectedOutcome": {
    "primary": "Meeting scheduled with stakeholder",
    "secondary": ["Champion relationship strengthened", "Insight into stakeholder"]
  },
  "metrics": {
    "successRate": 0.92,
    "avgEffectiveness": "high",
    "occurrences": 12,
    "avgEffort": 15
  },
  "antiPatterns": [
    "Cold outreach when champion available",
    "Going around champion"
  ],
  "examples": [
    {"deal": "shopco", "result": "CTO meeting within 24 hours"},
    {"deal": "techcorp", "result": "CFO meeting scheduled"}
  ]
}
```

---

## Anti-Patterns

### What is an Anti-Pattern?

Action approaches that:
- Consistently don't work
- Have predictable negative effects
- Should be avoided

### Common Anti-Patterns

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| Cold CEO outreach | No relationship, low response |
| Going around champion | Damages trust |
| Proposal before discovery | Misses needs |
| Technical depth with exec | Wrong level |
| Generic content | Doesn't resonate |
| Multiple follow-ups (>3) | Appears desperate |
| Discounting first | Sets wrong anchor |

### Anti-Pattern Documentation

```json
{
  "id": "ANTI-001",
  "name": "Cold executive outreach",
  "category": "engagement",
  "description": "Reaching out to C-level without introduction",
  "whyItFails": [
    "Low response rate (<5%)",
    "May damage relationship if discovered",
    "Wastes time and credibility"
  ],
  "alternative": "Champion-enabled intro or peer referral",
  "occurrences": 8,
  "failureRate": 0.94
}
```

---

## Pattern Application

### Matching Context

Before applying pattern, verify:
- Similar situation
- Prerequisites met
- No contradicting factors
- Reasonable expectation of success

### Adaptation

Patterns may need adjustment for:
- Industry differences
- Company size
- Stakeholder personality
- Deal stage

### Tracking

When applying pattern:
- Note that pattern was used
- Track outcome
- Update pattern metrics
- Note any variations

---

## Learning Loop

### Pattern Evolution

```
Action → Outcome → Analysis → Pattern Update → Better Action
```

### Updating Patterns

After each occurrence:
1. Record outcome
2. Update success rate
3. Note any variations
4. Refine pattern if needed

### Retiring Patterns

Patterns should be retired if:
- Success rate drops below 50%
- Context has changed (market, product)
- Better alternative discovered
- Too few recent occurrences

---

## Pattern Sharing

### Cross-Deal Learning

Patterns learned from one deal should inform others:
- Similar industry
- Similar size
- Similar stage
- Similar stakeholder types

### Pattern Library

Maintain central library:
- Engagement patterns
- Enablement patterns
- Technical patterns
- Close patterns
- Anti-patterns

### Pattern Review

Regularly:
- Review pattern performance
- Identify emerging patterns
- Retire stale patterns
- Share insights

---
name: priority-matrix
description: "Rank opportunities and work threads across multiple prioritization dimensions. Create actionable priority matrices."
phase: IMPLEMENT
category: specialized
---

# Priority Matrix

Rank and prioritize opportunities systematically.

## When to Use

- After context cultivation
- When facing multiple possible directions
- To justify prioritization decisions
- When you say: "prioritize these", "what should we focus on", "rank the options"

## Required Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| PRIORITIES.md | Root | Ranked list of priorities with rationale |
| MATRIX.md | Root | Visual matrix showing dimension scores |

## Process

```
┌─────────────────────────────────────────────────────────────┐
│                  PRIORITY MATRIX                            │
│                                                             │
│  1. OPTION ENUMERATION                                      │
│     └─→ List all possible work threads                      │
│                                                             │
│  2. DIMENSION DEFINITION                                    │
│     └─→ Define scoring dimensions                           │
│                                                             │
│  3. SCORING                                                 │
│     └─→ Score each option on each dimension                 │
│                                                             │
│  4. WEIGHTING                                               │
│     └─→ Apply dimension weights                             │
│                                                             │
│  5. RANKING                                                 │
│     └─→ Calculate final scores, rank                        │
│                                                             │
│  6. VALIDATION                                              │
│     └─→ Sanity check the results                            │
└─────────────────────────────────────────────────────────────┘
```

## Default Dimensions

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Impact | 30% | Business value delivered |
| Effort | 25% | Resources required (inverse) |
| Urgency | 25% | Time sensitivity |
| Alignment | 20% | Strategic fit |

## Matrix Format

```
| Option | Impact | Effort | Urgency | Alignment | Score |
|--------|--------|--------|---------|-----------|-------|
| Opt A  | 9      | 7      | 8       | 9         | 8.25  |
| Opt B  | 7      | 9      | 6       | 8         | 7.45  |
```

## Success Criteria

- All options scored consistently
- Rationale documented for each score
- Top 3 priorities clearly identified
- Stakeholder alignment on methodology

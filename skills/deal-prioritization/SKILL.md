---
name: deal-prioritization
description: "Prioritize deals for time allocation using value, health, and urgency factors. Generates ranked list of where to focus effort for maximum pipeline impact."
phase: ACT
category: sales
version: "1.0.0"
depends_on: ["deal-scoring", "pipeline-snapshot"]
tags: [sales, pipeline, prioritization, knopilot]
---

# Deal Prioritization

Prioritize deals for optimal time allocation.

## When to Use

- **Weekly planning** — Where should I focus?
- **Daily prioritization** — What's most important today?
- **Resource allocation** — Which deals deserve most attention?
- When you say: "prioritize my deals", "where should I focus", "rank my pipeline"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `prioritization-factors.md` | What drives priority |
| `time-allocation.md` | How to allocate effort |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Priority ranking | `pipeline/priorities-{date}.json` | Always |
| Focus recommendations | `pipeline/priorities-{date}.json` | Always |

## Core Concept

Deal Prioritization answers: **"Where should I spend my limited time?"**

Good prioritization:
- **Value-weighted** — Big deals get more attention
- **Health-aware** — Focus on winnable deals
- **Urgency-driven** — Time-sensitive deals prioritized
- **Action-oriented** — Clear what to do

## The Prioritization Formula

```
Priority Score = (Value Factor × 0.30) + (Health Factor × 0.25) +
                 (Urgency Factor × 0.25) + (Movability Factor × 0.20)
```

## The Prioritization Process

```
┌─────────────────────────────────────────────────────────┐
│          DEAL PRIORITIZATION PROCESS                    │
│                                                         │
│  1. GATHER DEAL DATA                                    │
│     └─→ Value, health, timeline, stage                  │
│                                                         │
│  2. CALCULATE FACTORS                                   │
│     └─→ Value, health, urgency, movability              │
│                                                         │
│  3. COMPUTE PRIORITY SCORES                             │
│     └─→ Weighted formula                                │
│                                                         │
│  4. RANK DEALS                                          │
│     └─→ Sort by priority score                          │
│                                                         │
│  5. SEGMENT INTO TIERS                                  │
│     └─→ Focus, Maintain, Monitor, Backburner            │
│                                                         │
│  6. RECOMMEND ACTIONS                                   │
│     └─→ What to do for top priorities                   │
└─────────────────────────────────────────────────────────┘
```

## priorities-{date}.json Format

```json
{
  "generatedAt": "2026-02-03T15:00:00Z",
  "period": "week",
  "rankedDeals": [
    {
      "rank": 1,
      "dealId": "bigtech",
      "company": "BigTech Inc",
      "value": 350000,
      "stage": "contracting",
      "health": 85,
      "priorityScore": 92,
      "factors": {
        "value": 95,
        "health": 85,
        "urgency": 95,
        "movability": 90
      },
      "tier": "focus",
      "rationale": "High value, near close, signature expected this week",
      "recommendedAction": "Follow up on contract status daily",
      "estimatedEffort": "2 hrs/week"
    },
    {
      "rank": 2,
      "dealId": "shopco",
      "company": "ShopCo",
      "value": 250000,
      "stage": "discovery",
      "health": 72,
      "priorityScore": 78,
      "factors": {
        "value": 75,
        "health": 72,
        "urgency": 80,
        "movability": 85
      },
      "tier": "focus",
      "rationale": "Strong deal, technical deep-dive will advance",
      "recommendedAction": "Schedule and conduct CTO meeting",
      "estimatedEffort": "4 hrs/week"
    }
  ],
  "tiers": {
    "focus": {
      "description": "Primary attention, daily/weekly effort",
      "deals": ["bigtech", "shopco", "enterprise"],
      "totalValue": 750000,
      "recommendedEffort": "60% of time"
    },
    "maintain": {
      "description": "Regular attention, keep momentum",
      "deals": ["retailplus", "serveco"],
      "totalValue": 350000,
      "recommendedEffort": "25% of time"
    },
    "monitor": {
      "description": "Watch for changes, minimal effort",
      "deals": ["cloudco", "fastgrow"],
      "totalValue": 300000,
      "recommendedEffort": "10% of time"
    },
    "backburner": {
      "description": "Low priority, revisit later",
      "deals": ["techstart", "globalco"],
      "totalValue": 200000,
      "recommendedEffort": "5% of time"
    }
  },
  "weeklyFocus": {
    "topPriority": "Close BigTech contract",
    "secondPriority": "Advance ShopCo to proposal",
    "alerts": [
      "TechStart at risk — decide to recover or qualify out"
    ]
  }
}
```

## Factor Definitions

### Value Factor (30%)

Based on deal value relative to pipeline:

| Value Percentile | Score |
|------------------|-------|
| Top 20% | 90-100 |
| 20-40% | 70-89 |
| 40-60% | 50-69 |
| 60-80% | 30-49 |
| Bottom 20% | 0-29 |

### Health Factor (25%)

Direct from Deal Health score:

| Health Score | Factor Score |
|--------------|--------------|
| 80-100 | 80-100 |
| 60-79 | 60-79 |
| 40-59 | 40-59 |
| <40 | 0-39 |

### Urgency Factor (25%)

Based on timeline and deadlines:

| Situation | Score |
|-----------|-------|
| Decision this week | 100 |
| Decision this month | 80 |
| Decision this quarter | 60 |
| No clear timeline | 40 |
| Long-term (6+ months) | 20 |

### Movability Factor (20%)

How likely is this deal to move forward with effort:

| Situation | Score |
|-----------|-------|
| Clear next step, high likelihood | 90-100 |
| Next step identified, good chance | 70-89 |
| Some path forward | 50-69 |
| Unclear or blocked | 30-49 |
| Stuck, no path visible | 0-29 |

## Priority Tiers

| Tier | Score Range | % of Time | Cadence |
|------|-------------|-----------|---------|
| Focus | 75+ | 60% | Daily attention |
| Maintain | 55-74 | 25% | Weekly attention |
| Monitor | 35-54 | 10% | Bi-weekly check |
| Backburner | <35 | 5% | Monthly review |

## Output Format

```
✓ Deal Prioritization: {date}

  PRIORITY RANKING:

  ═══════════════════════════════════════════════════════════
  FOCUS TIER (60% of time)
  ═══════════════════════════════════════════════════════════

  #1 BigTech Inc                                Score: 92
     $350K | Contracting | Health: 85
     → Follow up on contract status daily
     Effort: 2 hrs/week

  #2 ShopCo                                     Score: 78
     $250K | Discovery | Health: 72
     → Schedule and conduct CTO meeting
     Effort: 4 hrs/week

  #3 Enterprise Co                              Score: 76
     $150K | Contracting | Health: 80
     → Address legal redlines
     Effort: 3 hrs/week

  ───────────────────────────────────────────────────────────
  MAINTAIN TIER (25% of time)
  ───────────────────────────────────────────────────────────

  #4 RetailPlus                                 Score: 65
     $200K | Discovery | Health: 68
     → Continue discovery, prep proposal

  #5 ServeCo                                    Score: 58
     $150K | Discovery | Health: 65
     → Technical validation call

  ───────────────────────────────────────────────────────────
  MONITOR TIER (10% of time)
  ───────────────────────────────────────────────────────────

  #6 CloudCo                                    Score: 48
     $200K | Target | Health: 55
     → Check for engagement signals

  ───────────────────────────────────────────────────────────
  BACKBURNER (5% of time)
  ───────────────────────────────────────────────────────────

  #7 TechStart                                  Score: 32
     $100K | Lead | Health: 35
     ⚠️ At risk — decide to recover or qualify out

  WEEKLY FOCUS:
    ★ Top Priority: Close BigTech contract
    → Second: Advance ShopCo to proposal

  FILES CREATED:
    • pipeline/priorities-2026-02-03.json
```

## Quality Checklist

- [ ] All deals evaluated
- [ ] Factors calculated correctly
- [ ] Priority scores computed
- [ ] Deals ranked and tiered
- [ ] Actions recommended
- [ ] Effort estimates provided
- [ ] Weekly focus identified

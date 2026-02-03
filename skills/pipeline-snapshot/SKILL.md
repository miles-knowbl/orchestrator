---
name: pipeline-snapshot
description: "Generate a snapshot view of the entire sales pipeline. Summarizes all deals by stage, identifies at-risk deals, calculates pipeline value, and provides health metrics."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["deal-scoring"]
tags: [sales, pipeline, reporting, knopilot]
---

# Pipeline Snapshot

Generate a comprehensive view of your sales pipeline.

## When to Use

- **Weekly review** — Understand pipeline state
- **Reporting** — Share pipeline status
- **Planning** — See where to focus
- When you say: "show me the pipeline", "pipeline status", "deal overview"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `pipeline-metrics.md` | Key metrics to track |
| `stage-analysis.md` | How to analyze by stage |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Pipeline snapshot | `pipeline/snapshot-{date}.json` | Always |
| Summary report | `pipeline/snapshot-{date}.md` | Always |

## Core Concept

Pipeline Snapshot answers: **"What does my pipeline look like right now?"**

Good pipeline snapshots:
- **Comprehensive** — All deals represented
- **Actionable** — Highlights what needs attention
- **Comparable** — Track changes over time
- **Clear** — Easy to understand at a glance

## The Snapshot Process

```
┌─────────────────────────────────────────────────────────┐
│           PIPELINE SNAPSHOT PROCESS                     │
│                                                         │
│  1. GATHER ALL DEALS                                    │
│     └─→ Read all deal.json files                        │
│                                                         │
│  2. AGGREGATE BY STAGE                                  │
│     └─→ Count, value, health by stage                   │
│                                                         │
│  3. CALCULATE METRICS                                   │
│     └─→ Total value, weighted, coverage                 │
│                                                         │
│  4. IDENTIFY ALERTS                                     │
│     └─→ At-risk, stalled, action needed                 │
│                                                         │
│  5. COMPARE TO PREVIOUS                                 │
│     └─→ What changed since last snapshot                │
│                                                         │
│  6. GENERATE REPORT                                     │
│     └─→ JSON + markdown summary                         │
└─────────────────────────────────────────────────────────┘
```

## snapshot-{date}.json Format

```json
{
  "generatedAt": "2026-02-03T15:00:00Z",
  "period": "2026-02-03",
  "summary": {
    "totalDeals": 12,
    "totalValue": 2400000,
    "weightedValue": 1120000,
    "averageHealth": 68,
    "dealsByHealth": {
      "excellent": 2,
      "good": 5,
      "moderate": 3,
      "weak": 2
    }
  },
  "byStage": {
    "lead": {
      "count": 3,
      "value": 450000,
      "weightedValue": 45000,
      "averageHealth": 45,
      "deals": ["acme-corp", "techstart", "globalco"]
    },
    "target": {
      "count": 2,
      "value": 300000,
      "weightedValue": 60000,
      "averageHealth": 55,
      "deals": ["megacorp", "fastgrow"]
    },
    "discovery": {
      "count": 4,
      "value": 800000,
      "weightedValue": 280000,
      "averageHealth": 72,
      "deals": ["shopco", "retailplus", "serveco", "cloudco"]
    },
    "contracting": {
      "count": 2,
      "value": 500000,
      "weightedValue": 350000,
      "averageHealth": 82,
      "deals": ["bigtech", "enterprise"]
    },
    "production": {
      "count": 1,
      "value": 350000,
      "weightedValue": 315000,
      "averageHealth": 88,
      "deals": ["pilotco"]
    }
  },
  "alerts": {
    "atRisk": [
      {
        "dealId": "techstart",
        "reason": "Champion went cold, no contact in 14 days",
        "health": 35,
        "action": "Direct outreach to champion"
      }
    ],
    "stalled": [
      {
        "dealId": "globalco",
        "reason": "No stage movement in 30 days",
        "daysInStage": 35,
        "action": "Qualify or disqualify"
      }
    ],
    "actionNeeded": [
      {
        "dealId": "shopco",
        "reason": "Technical deep-dive overdue",
        "action": "Schedule meeting this week"
      }
    ]
  },
  "comparison": {
    "previousSnapshot": "2026-01-27",
    "changes": {
      "newDeals": ["cloudco"],
      "closedWon": [],
      "closedLost": ["lostdeal"],
      "stageChanges": [
        {"deal": "shopco", "from": "target", "to": "discovery"}
      ],
      "valueChange": "+150000",
      "healthChange": "+3"
    }
  },
  "topDeals": [
    {
      "dealId": "bigtech",
      "company": "BigTech Inc",
      "value": 350000,
      "stage": "contracting",
      "health": 85,
      "expectedClose": "2026-02-28"
    },
    {
      "dealId": "enterprise",
      "company": "Enterprise Co",
      "value": 150000,
      "stage": "contracting",
      "health": 80,
      "expectedClose": "2026-03-15"
    }
  ]
}
```

## Output Format (Markdown)

```markdown
# Pipeline Snapshot: February 3, 2026

## Summary

| Metric | Value |
|--------|-------|
| Total Deals | 12 |
| Total Pipeline Value | $2,400,000 |
| Weighted Pipeline | $1,120,000 |
| Average Health | 68/100 |

## Health Distribution

| Health Level | Count |
|--------------|-------|
| Excellent (80+) | 2 |
| Good (60-79) | 5 |
| Moderate (40-59) | 3 |
| Weak (<40) | 2 |

## By Stage

| Stage | Deals | Value | Weighted | Avg Health |
|-------|-------|-------|----------|------------|
| Lead | 3 | $450K | $45K | 45 |
| Target | 2 | $300K | $60K | 55 |
| Discovery | 4 | $800K | $280K | 72 |
| Contracting | 2 | $500K | $350K | 82 |
| Production | 1 | $350K | $315K | 88 |

## ⚠️ Alerts

### At Risk (2)
- **TechStart** (Health: 35) — Champion went cold, no contact 14 days
  → Direct outreach to champion

### Stalled (1)
- **GlobalCo** — No movement in 35 days
  → Qualify or disqualify

### Action Needed (1)
- **ShopCo** — Technical deep-dive overdue
  → Schedule meeting this week

## Top Deals

| Company | Value | Stage | Health | Expected Close |
|---------|-------|-------|--------|----------------|
| BigTech Inc | $350K | Contracting | 85 | Feb 28 |
| Enterprise Co | $150K | Contracting | 80 | Mar 15 |
| ShopCo | $250K | Discovery | 72 | Mar 30 |

## Changes Since Jan 27

- **New:** CloudCo ($200K)
- **Lost:** LostDeal
- **Stage Changes:** ShopCo (Target → Discovery)
- **Value Change:** +$150K
- **Health Change:** +3

---
Generated: 2026-02-03 15:00:00
```

## Output Format (Console)

```
✓ Pipeline Snapshot: {date}

  SUMMARY:
    Total Deals: 12
    Pipeline Value: $2,400,000
    Weighted Value: $1,120,000
    Average Health: 68/100

  BY STAGE:
    Lead:        3 deals | $450K  | Health: 45
    Target:      2 deals | $300K  | Health: 55
    Discovery:   4 deals | $800K  | Health: 72 ★
    Contracting: 2 deals | $500K  | Health: 82 ★★
    Production:  1 deal  | $350K  | Health: 88 ★★

  ALERTS:

    ⚠️ AT RISK:
       TechStart (Health: 35)
       → Champion went cold, no contact 14 days

    ⏸️ STALLED:
       GlobalCo (35 days in Lead)
       → Qualify or disqualify

    📋 ACTION NEEDED:
       ShopCo — Technical deep-dive overdue
       → Schedule meeting this week

  TOP DEALS:
    1. BigTech Inc    $350K  Contracting  Health: 85
    2. Enterprise Co  $150K  Contracting  Health: 80
    3. ShopCo         $250K  Discovery    Health: 72

  CHANGES (since Jan 27):
    + CloudCo (new, $200K)
    - LostDeal (closed-lost)
    ↗ ShopCo moved to Discovery
    Δ Value: +$150K | Δ Health: +3

  Files Created:
    • pipeline/snapshot-2026-02-03.json
    • pipeline/snapshot-2026-02-03.md
```

## Quality Checklist

- [ ] All deals captured
- [ ] Stage aggregations correct
- [ ] Weighted values calculated
- [ ] At-risk deals identified
- [ ] Stalled deals flagged
- [ ] Action items noted
- [ ] Comparison to previous
- [ ] Top deals highlighted

---
name: deal-scoring
description: "Calculate comprehensive deal scores including AI Readiness, Deal Confidence, Champion Strength, and Use Case Clarity. Produces composite health score to prioritize pipeline."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse", "pain-point-extraction", "budget-timeline-extraction", "stakeholder-sentiment", "ai-maturity-assessment"]
tags: [sales, scoring, deal-health, knopilot]
---

# Deal Scoring

Calculate comprehensive deal health scores.

## When to Use

- **After intelligence extraction** — Update scores with new data
- **Deal review** — Assess overall deal health
- **Pipeline prioritization** — Rank deals by quality
- When you say: "score this deal", "deal health", "how strong is this deal"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `scoring-formulas.md` | How each score is calculated |
| `score-interpretation.md` | What scores mean |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated deal.json | `deals/{slug}/deal.json` | Always |
| Score history | `deals/{slug}/intelligence/score-history.json` | Always |

## Core Concept

Deal Scoring answers: **"How likely is this deal to close and succeed?"**

Good scoring:
- **Based on evidence** — Not gut feel, but data
- **Multi-dimensional** — Multiple score components
- **Trackable** — Shows trends over time
- **Actionable** — Points to what needs improvement

## Score Components

| Score | Range | What It Measures |
|-------|-------|------------------|
| AI Readiness | 0-100 | Prospect readiness to implement AI |
| Deal Confidence | 0-100 | Likelihood of closing |
| Champion Strength | 0-100 | Quality of internal advocacy |
| Use Case Clarity | 0-100 | How defined is the use case |
| **Deal Health** | 0-100 | **Composite of all scores** |

## The Scoring Process

```
┌─────────────────────────────────────────────────────────┐
│              DEAL SCORING PROCESS                       │
│                                                         │
│  1. GATHER INPUTS                                       │
│     └─→ Pain, Budget, Timeline, Stakeholders, AI Mat.   │
│                                                         │
│  2. CALCULATE COMPONENT SCORES                          │
│     └─→ AI Readiness, Champion, Use Case                │
│                                                         │
│  3. CALCULATE DEAL CONFIDENCE                           │
│     └─→ Based on all factors                            │
│                                                         │
│  4. COMPUTE DEAL HEALTH                                 │
│     └─→ Weighted composite                              │
│                                                         │
│  5. COMPARE TO PREVIOUS                                 │
│     └─→ Track changes                                   │
│                                                         │
│  6. UPDATE FILES                                        │
│     └─→ deal.json + score-history.json                  │
└─────────────────────────────────────────────────────────┘
```

## deal.json Scores Section

```json
{
  "scores": {
    "updatedAt": "2026-02-03T15:00:00Z",
    "dealHealth": 72,
    "components": {
      "aiReadiness": {
        "score": 65,
        "factors": {
          "experience": 30,
          "capability": 50,
          "strategy": 80,
          "useCase": 90
        },
        "reason": "Strong use case and strategy, limited AI experience"
      },
      "dealConfidence": {
        "score": 75,
        "factors": {
          "budget": 90,
          "timeline": 85,
          "champion": 80,
          "decisionMaker": 60,
          "competition": 70
        },
        "reason": "Budget confirmed, timeline clear, DM not fully engaged"
      },
      "championStrength": {
        "score": 80,
        "factors": {
          "seniority": 80,
          "engagement": 90,
          "authority": 70,
          "advocacy": 80
        },
        "reason": "Strong champion with budget authority, actively advocating"
      },
      "useCaseClarity": {
        "score": 85,
        "level": "defined",
        "factors": {
          "specificity": 90,
          "scope": 80,
          "successCriteria": 85
        },
        "reason": "Clear use case with defined success metrics"
      }
    },
    "trend": "improving",
    "riskFactors": [
      "Decision-maker (CTO) not yet engaged",
      "CFO skeptical on ROI"
    ],
    "strengthFactors": [
      "Budget confirmed ($200-400K)",
      "Clear timeline (Q2 2026)",
      "Strong champion engagement"
    ]
  }
}
```

## Deal Health Calculation

```
Deal Health = (AI Readiness × 0.25) + (Deal Confidence × 0.35) +
              (Champion Strength × 0.20) + (Use Case Clarity × 0.20)
```

| Component | Weight | Rationale |
|-----------|--------|-----------|
| Deal Confidence | 35% | Most predictive of close |
| AI Readiness | 25% | Predicts implementation success |
| Champion Strength | 20% | Internal advocacy critical |
| Use Case Clarity | 20% | Clear scope = faster deal |

## Score Thresholds

| Score Range | Health Level | Action |
|-------------|--------------|--------|
| 80-100 | Excellent | Fast-track to close |
| 60-79 | Good | Continue, address gaps |
| 40-59 | Moderate | Investigate blockers |
| 20-39 | Weak | May not be qualified |
| 0-19 | Poor | Likely disqualify |

## score-history.json Format

```json
{
  "dealId": "shopco",
  "history": [
    {
      "date": "2026-02-01",
      "dealHealth": 45,
      "aiReadiness": 40,
      "dealConfidence": 35,
      "championStrength": 60,
      "useCaseClarity": 50,
      "trigger": "Initial deal creation"
    },
    {
      "date": "2026-02-03",
      "dealHealth": 72,
      "aiReadiness": 65,
      "dealConfidence": 75,
      "championStrength": 80,
      "useCaseClarity": 85,
      "trigger": "Discovery meeting parsed",
      "changes": [
        {"score": "dealConfidence", "delta": "+40", "reason": "Budget and timeline confirmed"},
        {"score": "useCaseClarity", "delta": "+35", "reason": "Use case defined in discovery"}
      ]
    }
  ]
}
```

## Output Format

After scoring:

```
✓ Deal Scored: {company}

  DEAL HEALTH: 72/100 (Good) ↑ +27 from last

  COMPONENT SCORES:

    AI Readiness: 65/100
      Experience: 30  |  Capability: 50
      Strategy: 80    |  Use Case: 90
      → Strong use case offsets limited AI experience

    Deal Confidence: 75/100
      Budget: 90      |  Timeline: 85
      Champion: 80    |  Decision-Maker: 60
      Competition: 70
      → Budget confirmed, need DM engagement

    Champion Strength: 80/100
      Seniority: 80   |  Engagement: 90
      Authority: 70   |  Advocacy: 80
      → Strong champion actively advocating

    Use Case Clarity: 85/100
      Level: Defined
      Specificity: 90 |  Scope: 80
      Success Criteria: 85
      → Clear use case with metrics

  TREND: Improving (+27 from Feb 1)

  STRENGTHS:
    ✓ Budget confirmed ($200-400K)
    ✓ Clear timeline (Q2 2026)
    ✓ Strong champion engagement

  RISKS:
    ⚠️ Decision-maker (CTO) not yet engaged
    ⚠️ CFO skeptical on ROI

  Files Updated:
    • deal.json (scores section)
    • intelligence/score-history.json

  → Engage CTO to improve Deal Confidence
  → Build ROI case for CFO
```

## Quality Checklist

- [ ] All component scores calculated
- [ ] Factors documented for each score
- [ ] Trend compared to previous
- [ ] Risk factors identified
- [ ] Strength factors identified
- [ ] Score history updated
- [ ] Actionable recommendations provided

---
name: risk-assessment
description: "Identify and assess deal risks across multiple dimensions. Evaluates champion, competition, budget, timeline, technical, and organizational risks to inform deal strategy."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["deal-scoring", "champion-scoring", "competitive-intel"]
tags: [sales, scoring, risk, knopilot]
---

# Risk Assessment

Identify and assess risks to the deal.

## When to Use

- **After scoring** — Comprehensive risk analysis
- **Deal review** — Identify what could derail deal
- **Strategy planning** — Prioritize risk mitigation
- When you say: "what are the risks", "risk analysis", "what could go wrong"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `risk-categories.md` | Types of deal risks |
| `risk-mitigation.md` | Strategies to address risks |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Risk assessment | `deals/{slug}/intelligence/risk-assessment.json` | Always |
| Risk summary in DEAL.md | `deals/{slug}/DEAL.md` | If high risks exist |

## Core Concept

Risk Assessment answers: **"What could cause this deal to fail?"**

Good risk assessment:
- **Comprehensive** — Covers all risk dimensions
- **Prioritized** — Ranks risks by impact and likelihood
- **Actionable** — Includes mitigation strategies
- **Tracked** — Monitors risk evolution

## Risk Categories

| Category | What Could Go Wrong |
|----------|---------------------|
| Champion | Champion leaves, loses influence, goes cold |
| Competition | Competitor wins, build vs. buy |
| Budget | Budget cut, reallocation, not approved |
| Timeline | Timeline slips, urgency drops |
| Technical | Integration fails, requirements change |
| Organizational | Reorg, priority shift, key person change |
| Fit | Solution doesn't match needs |

## The Assessment Process

```
┌─────────────────────────────────────────────────────────┐
│              RISK ASSESSMENT PROCESS                    │
│                                                         │
│  1. GATHER RISK SIGNALS                                 │
│     └─→ From all intelligence sources                   │
│                                                         │
│  2. IDENTIFY RISKS BY CATEGORY                          │
│     └─→ Champion, Competition, Budget, etc.             │
│                                                         │
│  3. ASSESS EACH RISK                                    │
│     └─→ Likelihood × Impact = Severity                  │
│                                                         │
│  4. PRIORITIZE                                          │
│     └─→ Rank by overall risk score                      │
│                                                         │
│  5. DEVELOP MITIGATIONS                                 │
│     └─→ Action plan for each high risk                  │
│                                                         │
│  6. UPDATE DEAL FILES                                   │
│     └─→ Risk assessment + DEAL.md                       │
└─────────────────────────────────────────────────────────┘
```

## risk-assessment.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "overallRiskLevel": "medium",
  "riskScore": 45,
  "risks": [
    {
      "id": "RISK-001",
      "category": "champion",
      "risk": "Single champion with no backup",
      "likelihood": "medium",
      "impact": "high",
      "severity": "high",
      "indicators": [
        "Only one active advocate",
        "No other strong relationships"
      ],
      "mitigation": {
        "strategy": "Build multiple relationships",
        "actions": [
          "Request intro to CTO from Sarah",
          "Build direct relationship with CFO"
        ],
        "owner": null,
        "status": "not-started"
      },
      "trend": "stable"
    },
    {
      "id": "RISK-002",
      "category": "organizational",
      "risk": "CFO skeptical on ROI",
      "likelihood": "high",
      "impact": "high",
      "severity": "critical",
      "indicators": [
        "CFO questioned ROI in discovery",
        "Past failed investments mentioned"
      ],
      "mitigation": {
        "strategy": "Build compelling ROI case",
        "actions": [
          "Create detailed ROI model",
          "Provide reference with CFO",
          "Offer pilot with defined success criteria"
        ],
        "owner": null,
        "status": "in-progress"
      },
      "trend": "worsening"
    }
  ],
  "riskMatrix": {
    "critical": 1,
    "high": 1,
    "medium": 2,
    "low": 1
  },
  "topRisks": [
    "CFO skeptical on ROI",
    "Single champion with no backup"
  ],
  "watchList": [
    "Timeline may slip if CTO review delayed"
  ]
}
```

## Risk Scoring

### Likelihood

| Level | Score | Description |
|-------|-------|-------------|
| High | 3 | Very likely to occur (>70%) |
| Medium | 2 | Possible (30-70%) |
| Low | 1 | Unlikely (<30%) |

### Impact

| Level | Score | Description |
|-------|-------|-------------|
| High | 3 | Would kill or seriously damage deal |
| Medium | 2 | Would delay or complicate deal |
| Low | 1 | Minor impact |

### Severity

```
Severity = Likelihood × Impact

Score 6-9: Critical (immediate action)
Score 4-5: High (plan mitigation)
Score 2-3: Medium (monitor)
Score 1: Low (acknowledge)
```

### Severity Matrix

|                | Impact Low (1) | Impact Med (2) | Impact High (3) |
|----------------|---------------|----------------|-----------------|
| Likelihood High (3) | Medium (3) | High (6) | Critical (9) |
| Likelihood Med (2) | Low (2) | Medium (4) | High (6) |
| Likelihood Low (1) | Low (1) | Low (2) | Medium (3) |

## Overall Risk Level

| Total Risk Score | Level |
|------------------|-------|
| 0-20 | Low |
| 21-40 | Medium |
| 41-60 | High |
| 61+ | Critical |

## Output Format

After assessment:

```
✓ Risk Assessment: {company}

  OVERALL RISK: Medium (Score: 45/100)

  RISK SUMMARY:
    Critical: 1  |  High: 1  |  Medium: 2  |  Low: 1

  TOP RISKS:

    1. CFO skeptical on ROI [CRITICAL]
       Likelihood: High | Impact: High
       Indicators:
         • CFO questioned ROI in discovery
         • Past failed investments mentioned
       Trend: Worsening ↓
       Mitigation:
         → Create detailed ROI model
         → Provide reference with CFO
         → Offer pilot with defined success criteria
       Status: In Progress

    2. Single champion with no backup [HIGH]
       Likelihood: Medium | Impact: High
       Indicators:
         • Only one active advocate
         • No other strong relationships
       Trend: Stable →
       Mitigation:
         → Request intro to CTO from Sarah
         → Build direct relationship with CFO
       Status: Not Started

  WATCH LIST:
    • Timeline may slip if CTO review delayed
    • Q2 budget reallocation possible

  RISK TREND: Stable (1 worsening, 2 stable, 2 improving)

  FILES UPDATED:
    • intelligence/risk-assessment.json
    • DEAL.md (risk section)

  IMMEDIATE ACTIONS:
    → Address CFO ROI concerns this week
    → Get intro to CTO before next meeting
```

## Quality Checklist

- [ ] All risk categories considered
- [ ] Each risk has likelihood and impact
- [ ] Severity calculated correctly
- [ ] Risks prioritized by severity
- [ ] Mitigation strategies defined for high risks
- [ ] Risk trends tracked
- [ ] Watch list maintained
- [ ] Immediate actions identified

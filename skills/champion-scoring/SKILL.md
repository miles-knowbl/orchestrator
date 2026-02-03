---
name: champion-scoring
description: "Assess champion effectiveness and strength. Evaluates seniority, engagement level, authority, and advocacy behaviors to determine champion quality."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["stakeholder-add", "stakeholder-sentiment"]
tags: [sales, scoring, champion, knopilot]
---

# Champion Scoring

Assess the quality and effectiveness of your champion.

## When to Use

- **After stakeholder updates** — Re-evaluate champion strength
- **Deal review** — Assess internal advocacy quality
- **Champion identification** — Compare potential champions
- When you say: "how strong is my champion", "evaluate champion", "champion assessment"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `champion-criteria.md` | What makes a strong champion |
| `champion-behaviors.md` | Observable champion behaviors |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Champion assessment | `deals/{slug}/intelligence/champion-assessment.json` | Always |
| Updated scores in deal.json | `deals/{slug}/deal.json` | Always |

## Core Concept

Champion Scoring answers: **"How effective is my internal advocate?"**

A strong champion:
- **Has seniority** — Position to influence
- **Engages actively** — Responsive, proactive
- **Wields authority** — Budget, technical, or executive power
- **Advocates visibly** — Sells for you internally

## Champion Strength Components

| Component | Weight | What It Measures |
|-----------|--------|------------------|
| Seniority | 25% | Organizational level |
| Engagement | 30% | Responsiveness and proactivity |
| Authority | 25% | Decision power |
| Advocacy | 20% | Internal selling behavior |

## The Scoring Process

```
┌─────────────────────────────────────────────────────────┐
│              CHAMPION SCORING PROCESS                   │
│                                                         │
│  1. IDENTIFY CHAMPION                                   │
│     └─→ Who is acting as champion?                      │
│                                                         │
│  2. ASSESS SENIORITY                                    │
│     └─→ Title, level, span of control                   │
│                                                         │
│  3. MEASURE ENGAGEMENT                                  │
│     └─→ Response time, proactivity, meeting attendance  │
│                                                         │
│  4. EVALUATE AUTHORITY                                  │
│     └─→ Budget, technical, executive access             │
│                                                         │
│  5. OBSERVE ADVOCACY                                    │
│     └─→ Internal selling behaviors                      │
│                                                         │
│  6. CALCULATE SCORE                                     │
│     └─→ Weighted composite                              │
└─────────────────────────────────────────────────────────┘
```

## champion-assessment.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "champion": {
    "stakeholderId": "SH-001",
    "name": "Sarah Chen",
    "title": "VP Customer Experience",
    "isConfirmedChampion": true,
    "championSince": "2026-02-01"
  },
  "score": {
    "overall": 80,
    "components": {
      "seniority": {
        "score": 85,
        "level": "VP",
        "factors": ["VP title", "Reports to CEO", "Manages 50+ people"]
      },
      "engagement": {
        "score": 90,
        "factors": ["Responds within hours", "Proactively shares info", "Attends all meetings"]
      },
      "authority": {
        "score": 70,
        "factors": ["Has budget authority for CX", "No technical authority", "Direct CEO access"]
      },
      "advocacy": {
        "score": 75,
        "factors": ["Offered introductions", "Uses 'we' language", "Expressed urgency"]
      }
    }
  },
  "championLevel": "strong",
  "strengths": [
    "High seniority with CEO access",
    "Very responsive and engaged",
    "Budget authority for this purchase"
  ],
  "gaps": [
    "No technical authority — need CTO support",
    "CFO (peer) is skeptical — limited influence there"
  ],
  "risks": [
    "If Sarah leaves, no backup champion identified"
  ],
  "recommendations": [
    "Enable Sarah with ROI materials for CFO conversation",
    "Identify potential technical champion for CTO alignment"
  ],
  "backupChampion": null
}
```

## Champion Levels

| Level | Score Range | Description |
|-------|-------------|-------------|
| Executive Sponsor | 90-100 | C-level backing, can override objections |
| Strong | 70-89 | Senior with authority, actively advocating |
| Moderate | 50-69 | Mid-level, engaged but limited power |
| Weak | 30-49 | Interested but can't influence |
| None | 0-29 | Contact only, not a champion |

## Scoring Guidelines

### Seniority (25%)

| Level | Score |
|-------|-------|
| C-level (CEO, CFO, CTO, CMO) | 100 |
| SVP/EVP | 90 |
| VP | 85 |
| Senior Director | 75 |
| Director | 70 |
| Senior Manager | 50 |
| Manager | 40 |
| Individual Contributor | 20 |

### Engagement (30%)

| Behavior | Points |
|----------|--------|
| Responds within 24 hours | +25 |
| Proactively reaches out | +25 |
| Shares internal information | +20 |
| Attends all meetings prepared | +15 |
| Follows up without prompting | +15 |

### Authority (25%)

| Authority Type | Points |
|----------------|--------|
| Budget authority for this purchase | +40 |
| Technical decision authority | +30 |
| Executive access/influence | +30 |

### Advocacy (20%)

| Behavior | Points |
|----------|--------|
| Explicitly advocates internally | +35 |
| Offers to make introductions | +25 |
| Uses "we" language for solution | +20 |
| Coaches on internal navigation | +10 |
| Shares competitive intelligence | +10 |

## Output Format

After scoring:

```
✓ Champion Assessment: {company}

  CHAMPION: Sarah Chen (VP Customer Experience)
  OVERALL SCORE: 80/100 (Strong)

  COMPONENT SCORES:

    Seniority: 85/100
      • VP title
      • Reports to CEO
      • Manages 50+ people

    Engagement: 90/100
      • Responds within hours ✓
      • Proactively shares info ✓
      • Attends all meetings ✓

    Authority: 70/100
      • Budget authority for CX ✓
      • No technical authority ✗
      • Direct CEO access ✓

    Advocacy: 75/100
      • Offered introductions ✓
      • Uses "we" language ✓
      • Expressed urgency ✓

  CHAMPION LEVEL: Strong

  STRENGTHS:
    ✓ High seniority with CEO access
    ✓ Very responsive and engaged
    ✓ Budget authority for this purchase

  GAPS:
    ⚠️ No technical authority — need CTO support
    ⚠️ CFO (peer) is skeptical — limited influence

  RISKS:
    ⚠️ No backup champion identified

  RECOMMENDATIONS:
    → Enable Sarah with ROI materials for CFO
    → Identify potential technical champion
    → Build relationship with CTO directly

  Files Updated:
    • intelligence/champion-assessment.json
    • deal.json (champion score updated)
```

## Quality Checklist

- [ ] Champion correctly identified
- [ ] All four components scored
- [ ] Evidence provided for each score
- [ ] Champion level assigned
- [ ] Strengths documented
- [ ] Gaps identified
- [ ] Risks noted
- [ ] Actionable recommendations provided
- [ ] Backup champion considered

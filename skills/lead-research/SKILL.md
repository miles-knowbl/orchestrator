---
name: lead-research
description: "Research leads before outreach. Gathers company background, identifies likely pain points, finds stakeholders, and determines AI fit to prioritize and personalize engagement."
phase: INIT
category: sales
version: "1.0.0"
depends_on: []
tags: [sales, stage-specific, lead, research, knopilot]
---

# Lead Research

Research leads to prioritize and personalize outreach.

## When to Use

- **New lead** — Before first outreach
- **Lead prioritization** — Rank leads by potential
- **Outreach prep** — Personalize first contact
- When you say: "research this lead", "should I reach out", "what do I know"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `research-sources.md` | Where to find information |
| `fit-criteria.md` | How to assess AI fit |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Lead research file | `leads/{company-slug}/research.json` | Always |
| Fit assessment | `leads/{company-slug}/research.json` | Always |

## Core Concept

Lead Research answers: **"Is this worth pursuing and how should I approach them?"**

Good lead research:
- **Assesses fit** — Are they a good prospect for AI?
- **Identifies pain** — What might they be struggling with?
- **Finds contacts** — Who should I reach out to?
- **Personalizes** — What angle will resonate?

## The Research Process

```
┌─────────────────────────────────────────────────────────┐
│              LEAD RESEARCH PROCESS                      │
│                                                         │
│  1. COMPANY BACKGROUND                                  │
│     └─→ What do they do, how big, what industry         │
│                                                         │
│  2. LIKELY PAIN POINTS                                  │
│     └─→ Based on size, industry, news                   │
│                                                         │
│  3. AI FIT ASSESSMENT                                   │
│     └─→ Score potential fit for AI solutions            │
│                                                         │
│  4. STAKEHOLDER IDENTIFICATION                          │
│     └─→ Who would own this problem?                     │
│                                                         │
│  5. PERSONALIZATION ANGLES                              │
│     └─→ What would resonate in outreach?                │
│                                                         │
│  6. PRIORITIZATION                                      │
│     └─→ High/Medium/Low priority                        │
└─────────────────────────────────────────────────────────┘
```

## research.json Format

```json
{
  "researchedAt": "2026-02-03T10:00:00Z",
  "company": {
    "name": "ShopCo",
    "website": "shopco.com",
    "industry": "E-commerce",
    "subIndustry": "Fashion retail",
    "size": "500-1000 employees",
    "revenue": "$50-100M",
    "funding": "Series C",
    "headquarters": "San Francisco, CA",
    "description": "Online fashion retailer with focus on sustainable clothing"
  },
  "likelyPainPoints": [
    {
      "pain": "High customer support volume",
      "likelihood": "high",
      "reasoning": "E-commerce with returns/exchanges + growth = support burden",
      "signals": ["Recently hired 3 support roles on LinkedIn"]
    },
    {
      "pain": "Seasonal spikes",
      "likelihood": "medium",
      "reasoning": "Fashion retail has holiday and seasonal peaks",
      "signals": []
    }
  ],
  "aiFit": {
    "score": 75,
    "level": "good",
    "factors": {
      "industryFit": 85,
      "sizeFit": 80,
      "likelyNeed": 75,
      "technicalReadiness": 60
    },
    "reasoning": "E-commerce is excellent fit, size is right, likely has support pain"
  },
  "stakeholders": [
    {
      "name": "Sarah Chen",
      "title": "VP Customer Experience",
      "linkedIn": "linkedin.com/in/sarahchen",
      "likelyOwner": true,
      "notes": "Most likely to own support/CX problems"
    },
    {
      "name": "Michael Torres",
      "title": "CTO",
      "linkedIn": "linkedin.com/in/michaeltorres",
      "likelyOwner": false,
      "notes": "Technical decision maker for AI/automation"
    }
  ],
  "personalization": {
    "angles": [
      "Sustainable fashion → sustainability angle in support efficiency",
      "Recent growth → scaling support without proportional headcount",
      "E-commerce → returns/exchanges automation"
    ],
    "recentNews": [
      {
        "headline": "ShopCo raises $30M Series C",
        "date": "2026-01-15",
        "relevance": "Growth = support scaling challenges"
      }
    ],
    "connectionPoints": ["Same investor as our customer X"]
  },
  "priority": {
    "level": "high",
    "score": 82,
    "reasoning": "Strong industry fit, right size, clear pain signal, accessible stakeholders"
  },
  "recommendedApproach": {
    "target": "Sarah Chen (VP CX)",
    "angle": "Scaling support with growth",
    "timing": "Post Series C growth pressure",
    "channel": "LinkedIn + email"
  }
}
```

## AI Fit Scoring

| Factor | Weight | What to Assess |
|--------|--------|----------------|
| Industry Fit | 30% | Is their industry good for AI support? |
| Size Fit | 25% | Are they the right size (not too small/large)? |
| Likely Need | 30% | Do they probably have the pain we solve? |
| Technical Readiness | 15% | Can they implement AI? |

### Score Interpretation

| Score | Level | Action |
|-------|-------|--------|
| 80+ | Excellent | High priority, personalized outreach |
| 60-79 | Good | Standard priority, worth pursuing |
| 40-59 | Moderate | Lower priority, opportunistic |
| <40 | Poor | Skip or nurture |

## Output Format

After research:

```
✓ Lead Research: ShopCo

  COMPANY PROFILE:
    Industry: E-commerce (Fashion retail)
    Size: 500-1000 employees
    Revenue: $50-100M (Series C)
    Location: San Francisco, CA

  AI FIT: 75/100 (Good)
    Industry Fit: 85 — E-commerce is excellent target
    Size Fit: 80 — Right size for our solution
    Likely Need: 75 — High probability of support pain
    Tech Readiness: 60 — Likely modern stack

  LIKELY PAIN POINTS:
    1. High customer support volume [HIGH]
       → E-commerce + growth = support burden
       Signal: Recently hired 3 support roles

    2. Seasonal spikes [MEDIUM]
       → Fashion retail has peaks

  KEY STAKEHOLDERS:
    → Sarah Chen (VP Customer Experience)
      Most likely owner, LinkedIn found
    → Michael Torres (CTO)
      Technical decision maker

  PERSONALIZATION ANGLES:
    • Recent $30M Series C → scaling pressure
    • Sustainable fashion → efficiency resonates
    • E-commerce → returns/exchanges automation

  PRIORITY: HIGH (82/100)
    Strong fit, clear pain signal, accessible stakeholders

  RECOMMENDED APPROACH:
    Target: Sarah Chen (VP CX)
    Angle: Scaling support with growth
    Channel: LinkedIn + email
    Timing: Now (post-Series C pressure)

  Files Created:
    • leads/shopco/research.json
```

## Quality Checklist

- [ ] Company background complete
- [ ] Industry and size identified
- [ ] Pain points hypothesized with reasoning
- [ ] AI fit scored
- [ ] Key stakeholders found
- [ ] Personalization angles identified
- [ ] Priority assigned
- [ ] Approach recommended

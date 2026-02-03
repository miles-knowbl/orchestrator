---
name: ai-maturity-assessment
description: "Assess prospect's AI maturity level from communications. Evaluates prior AI experience, internal capabilities, strategic alignment, and readiness for AI implementation."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse"]
tags: [sales, intelligence-extraction, ai-maturity, knopilot]
---

# AI Maturity Assessment

Assess prospect's AI readiness and maturity.

## When to Use

- **After parsing communications** — Extract AI maturity signals
- **Deal qualification** — Assess implementation readiness
- **Solution design** — Tailor approach to maturity level
- When you say: "what's their AI experience", "how mature are they", "AI readiness"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `maturity-levels.md` | Standard maturity framework |
| `maturity-signals.md` | Signals for each level |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated ai-maturity.json | `deals/{slug}/intelligence/ai-maturity.json` | Always |
| AI Readiness score update | `deals/{slug}/deal.json` | Always |

## Core Concept

AI Maturity Assessment answers: **"How ready is this organization to implement AI?"**

Good assessment:
- **Identifies experience level** — From no-experience to mature
- **Evaluates internal capability** — Team, tools, processes
- **Assesses strategic alignment** — Executive buy-in, AI strategy
- **Predicts implementation success** — Risk factors and enablers

## Maturity Levels

| Level | Description | Implementation Implication |
|-------|-------------|---------------------------|
| no-experience | First time considering AI | Need more education, longer sales cycle |
| exploring | Researching, learning | Ready for discovery, need to build vision |
| attempted | Tried AI, may have failed | Learn from past, address concerns |
| deployed | Using AI in production | Faster evaluation, higher expectations |
| mature | AI-first organization | Sophisticated buyer, technical depth |

## The Assessment Process

```
┌─────────────────────────────────────────────────────────┐
│            AI MATURITY ASSESSMENT PROCESS               │
│                                                         │
│  1. GATHER AI-RELATED SIGNALS                           │
│     └─→ From parsed communications                      │
│                                                         │
│  2. ASSESS EXPERIENCE LEVEL                             │
│     └─→ No experience → Mature scale                    │
│                                                         │
│  3. EVALUATE INTERNAL CAPABILITY                        │
│     └─→ Team, tools, infrastructure                     │
│                                                         │
│  4. CHECK STRATEGIC ALIGNMENT                           │
│     └─→ Executive support, AI strategy                  │
│                                                         │
│  5. IDENTIFY RISK FACTORS                               │
│     └─→ What could cause failure?                       │
│                                                         │
│  6. CALCULATE AI READINESS SCORE                        │
│     └─→ 0-100 composite score                           │
└─────────────────────────────────────────────────────────┘
```

## ai-maturity.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "assessment": {
    "level": "exploring",
    "levelConfidence": "high",
    "levelReason": "Board interested in AI, no prior implementations"
  },
  "experience": {
    "priorAIAttempts": [],
    "currentAIUsage": [],
    "aiVendors": []
  },
  "internalCapability": {
    "dedicatedAITeam": false,
    "dataScience": false,
    "mlInfrastructure": false,
    "dataQuality": "unknown",
    "technicalReadiness": "medium"
  },
  "strategicAlignment": {
    "executiveSupport": "strong",
    "aiStrategy": "informal",
    "budgetPriority": "high",
    "changeManagement": "unknown"
  },
  "riskFactors": [
    {
      "factor": "No internal AI expertise",
      "severity": "medium",
      "mitigation": "Managed service approach"
    }
  ],
  "enablers": [
    {
      "factor": "Strong executive support",
      "impact": "high"
    },
    {
      "factor": "Clear use case",
      "impact": "high"
    }
  ],
  "aiReadinessScore": {
    "overall": 65,
    "components": {
      "experience": 30,
      "capability": 50,
      "strategy": 80,
      "useCase": 90
    },
    "scoreReason": "Strong executive support and clear use case offset limited experience"
  },
  "sources": ["2026-02-03-meeting-discovery.md"]
}
```

## AI Readiness Score Components

| Component | Weight | Factors |
|-----------|--------|---------|
| Experience | 20% | Prior AI projects, successes, failures |
| Capability | 25% | Team, tools, data readiness |
| Strategy | 25% | Executive support, AI strategy, budget |
| Use Case | 30% | Clarity, scope, success criteria |

### Score Calculation

```
AI Readiness = (Experience × 0.20) + (Capability × 0.25) +
               (Strategy × 0.25) + (Use Case × 0.30)
```

### Score Interpretation

| Score | Level | Implication |
|-------|-------|-------------|
| 80-100 | Highly Ready | Fast implementation, low risk |
| 60-79 | Ready | Standard implementation |
| 40-59 | Needs Work | Longer ramp, more support |
| 20-39 | Not Ready | Significant risk, may pass |
| 0-19 | Premature | Likely to fail, educate first |

## Output Format

After assessment:

```
✓ AI Maturity Assessment for {company}

  MATURITY LEVEL: Exploring
    Board interested, no prior implementations
    Confidence: High

  EXPERIENCE:
    Prior AI: None
    Current AI Usage: None
    AI Vendors: None evaluated yet

  INTERNAL CAPABILITY:
    AI Team: No
    Data Science: No
    ML Infrastructure: No
    Technical Readiness: Medium

  STRATEGIC ALIGNMENT:
    Executive Support: Strong ✓
    AI Strategy: Informal
    Budget Priority: High ✓
    Change Management: Unknown

  RISK FACTORS:
    ⚠️ No internal AI expertise
       Mitigation: Managed service approach

  ENABLERS:
    ✓ Strong executive support
    ✓ Clear use case

  AI READINESS SCORE: 65/100
    Experience:  30 (No prior AI)
    Capability:  50 (No team, medium tech)
    Strategy:    80 (Strong exec support)
    Use Case:    90 (Clear and scoped)

  RECOMMENDATION:
    Organization is ready for AI with managed approach.
    Emphasize turnkey solution, minimize internal effort.

  Files Updated:
    • intelligence/ai-maturity.json
    • deal.json (aiReadiness score)
```

## Quality Checklist

- [ ] All AI signals extracted
- [ ] Maturity level assigned with reason
- [ ] Experience history captured
- [ ] Internal capability assessed
- [ ] Strategic alignment evaluated
- [ ] Risk factors identified with mitigations
- [ ] Enablers documented
- [ ] AI Readiness score calculated
- [ ] Recommendation provided

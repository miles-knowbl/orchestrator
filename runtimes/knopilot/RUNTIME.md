# KnoPilot Runtime Context

> The first runtime context implementation. A reference for what runtime contexts look like.

**Category**: sales
**Skills**: 24
**Loops**: 7
**Version**: 1.0.0

---

## What is a Runtime Context?

A runtime context is a **constructed environment** that shapes how the orchestrator operates within a specific domain. It's more than a bundle of skills and loops — it's an **ontology** that defines:

| Aspect | What It Provides |
|--------|------------------|
| **Vocabulary** | Domain-specific language (deals, champions, pain points — not generic "tasks") |
| **Entities** | First-class things that exist (`deals/{slug}/`) |
| **Operations** | Skills scoped to the domain |
| **Workflows** | Loops that compose skills coherently |
| **Gravity** | Shared concepts that pull everything together |

When you enter a runtime context, you're not just using tools — you're **thinking in terms of that domain**. The runtime shapes cognition.

### Runtime vs Framework

| Concept | Definition |
|---------|------------|
| **Runtime Context** | Domain bundle — what you operate on (KnoPilot/sales) |
| **Framework** | Methodology layer — how you operate (e.g., OODA), applied on top of a runtime |

A framework can modify how you move through a runtime, but the runtime provides the world.

---

## KnoPilot Overview

KnoPilot is an AI-powered sales intelligence system built on the "Give to Grow" philosophy. It constructs an environment for relationship-driven sales where every interaction is an opportunity to provide value.

### Core Philosophy

- **Give to Grow**: Lead with value, trust follows
- **Intelligence-Driven**: Extract signals from every communication
- **Champion-Centric**: Enable internal advocates to sell for you
- **Action-Oriented**: Always know the next best move

### Pipeline Stages

```
Lead → Target → Discovery → Contracting → Production → Closed
```

Each stage has entry/exit criteria, typical skills, and progression indicators.

---

## Skills (24)

### Layer 1: Data Foundation
| Skill | Purpose |
|-------|---------|
| `deal-create` | Initialize deal with directory structure |
| `communication-capture` | Capture emails, meetings, calls |
| `stakeholder-add` | Add contacts with roles and sentiment |
| `communication-parse` | Extract signals from raw communications |

### Layer 2: Intelligence Extraction
| Skill | Purpose |
|-------|---------|
| `pain-point-extraction` | Categorize and score pain points |
| `budget-timeline-extraction` | Extract budget and timeline signals |
| `stakeholder-sentiment` | Track sentiment over time |
| `ai-maturity-assessment` | Score AI readiness (5 levels) |
| `competitive-intel` | Track competitive landscape |

### Layer 3: Scoring
| Skill | Purpose |
|-------|---------|
| `deal-scoring` | Comprehensive deal health (0-100) |
| `champion-scoring` | Champion strength assessment |
| `use-case-clarity` | Use case definition level |
| `risk-assessment` | Risk identification (7 categories) |

### Layer 4: Action Generation
| Skill | Purpose |
|-------|---------|
| `next-best-action` | NBA engine with priority scoring |
| `action-impact-analysis` | Measure action effectiveness |
| `champion-enablement-asset` | Create ROI models, one-pagers |

### Layer 5: Stage-Specific
| Skill | Purpose |
|-------|---------|
| `lead-research` | Research leads with AI fit scoring |
| `discovery-prep` | Meeting preparation |
| `discovery-debrief` | Post-meeting intelligence capture |
| `prototype-scoping` | Pilot scope with success criteria |
| `contract-support` | Contract tracking and negotiation |

### Layer 6: Pipeline
| Skill | Purpose |
|-------|---------|
| `pipeline-snapshot` | Full pipeline view with metrics |
| `deal-prioritization` | Priority scoring and tiering |
| `weekly-focus` | Weekly execution planning |

---

## Loops (7)

| Loop | Phases | Purpose |
|------|--------|---------|
| `deal-intake-loop` | 4 | New deal pipeline entry |
| `intelligence-loop` | 4 | Communication processing |
| `discovery-loop` | 5 | Full meeting workflow |
| `deal-review-loop` | 4 | Single deal health check |
| `champion-loop` | 4 | Champion enablement |
| `pipeline-loop` | 4 | Weekly pipeline review |
| `close-prep-loop` | 4 | Pilot and contract support |

---

## Data Schema

When the KnoPilot runtime is active, this data structure exists:

```
deals/
└── {slug}/
    ├── DEAL.md                      # Human-readable summary
    ├── deal.json                    # Scores, stage, metadata
    │
    ├── communications/              # Captured communications
    │   ├── {date}-{type}-{subject}.md
    │   └── ...
    │
    ├── intelligence/                # Extracted signals
    │   ├── pain-points.json
    │   ├── budget-timeline.json
    │   ├── stakeholders.json
    │   ├── competitive.json
    │   └── ai-maturity.json
    │
    ├── actions/                     # NBA outputs
    │   └── nba-{date}.json
    │
    ├── reviews/                     # Deal review snapshots
    │   └── review-{date}.json
    │
    └── assets/                      # Enablement materials
        ├── roi-model.md
        ├── exec-summary.md
        └── ...
```

### deal.json Schema

```json
{
  "id": "shopco",
  "name": "ShopCo",
  "stage": "discovery",
  "createdAt": "2026-02-01",
  "updatedAt": "2026-02-03",

  "scores": {
    "dealHealth": 72,
    "aiReadiness": 65,
    "championStrength": 80,
    "useCaseClarity": 75,
    "dealConfidence": 68
  },

  "budget": {
    "range": "$200K-$400K",
    "confirmed": true
  },

  "timeline": {
    "decision": "2026-03-15",
    "implementation": "2026-06-30"
  },

  "champion": {
    "name": "Sarah Chen",
    "title": "VP Customer Experience",
    "strength": 80
  },

  "risks": [
    { "category": "champion", "severity": "low", "description": "..." },
    { "category": "technical", "severity": "medium", "description": "..." }
  ]
}
```

---

## Core Concepts

### Deal Intelligence Schema

| Score | Range | Components |
|-------|-------|------------|
| Deal Health | 0-100 | Weighted composite of all scores |
| AI Readiness | 0-100 | Technical capability + organizational readiness |
| Champion Strength | 0-100 | Seniority + Engagement + Authority + Advocacy |
| Use Case Clarity | 0-100 | Vague → Exploring → Defined → Scoped |
| Deal Confidence | 0-100 | Likelihood to close based on all signals |

### Deal Health Formula

```
Deal Health = (AI Readiness × 0.25)
            + (Deal Confidence × 0.35)
            + (Champion Strength × 0.20)
            + (Use Case Clarity × 0.20)
```

### NBA (Next Best Action) Formula

```
NBA Score = (Likelihood × 0.40)
          + (Effort Factor × 0.30)
          + (Champion Value × 0.30)

Where:
- Likelihood: 0-100 (probability of success)
- Effort Factor: 100 - Effort (lower effort = higher score)
- Champion Value: 0-100 (how much this helps champion)
```

### Risk Categories

1. **Champion Risk** — Champion weak, absent, or leaving
2. **Competition Risk** — Active competitive threat
3. **Budget Risk** — Budget uncertain or at risk
4. **Timeline Risk** — Timeline slipping or unrealistic
5. **Technical Risk** — Technical blockers or concerns
6. **Organizational Risk** — Reorg, leadership change, priorities
7. **Fit Risk** — Solution may not match needs

---

## Entering the Runtime

When you invoke a KnoPilot loop (e.g., `/deal-review-loop`), you enter the KnoPilot runtime context. This means:

1. **Vocabulary activates** — You speak in deals, champions, pain points
2. **Data schema exists** — `deals/{slug}/` is where state lives
3. **Skills are scoped** — The 24 sales skills are available
4. **Concepts are shared** — Scoring formulas, risk categories understood
5. **Workflows make sense** — Loops compose skills coherently

The runtime is the world you operate in until you exit.

---

## Related

- **Dashboard**: [orchestrator-xi.vercel.app/skills/sales](https://orchestrator-xi.vercel.app/skills/sales)
- **Skills**: `skills/` with `category: sales`
- **Loops**: `loops/` with `category: sales`

---

## Future Considerations

This is the first runtime context. Patterns to watch for:

- How do runtimes compose? (Can KnoPilot skills be used in a broader "business" runtime?)
- How do frameworks modify runtimes? (OODA applied to sales lifecycle)
- How do runtimes share concepts? (NBA formula useful beyond sales?)
- Should runtimes have explicit entry/exit? (Like activating a virtual environment)

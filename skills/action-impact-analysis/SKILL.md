---
name: action-impact-analysis
description: "Analyze the impact of completed actions on deal progress. Tracks which actions moved scores, identifies effective patterns, and calibrates future action recommendations."
phase: ACT
category: sales
version: "1.0.0"
depends_on: ["next-best-action", "deal-scoring"]
tags: [sales, action-analysis, learning, knopilot]
---

# Action Impact Analysis

Analyze the impact of actions on deal progress.

## When to Use

- **After action completed** — Did it work?
- **Deal review** — What's been effective?
- **Pattern learning** — What actions work best?
- When you say: "what worked", "action impact", "did that help"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `impact-metrics.md` | How to measure action impact |
| `pattern-recognition.md` | Identifying effective patterns |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Impact analysis | `deals/{slug}/actions/impact-analysis.json` | Always |
| Pattern updates | `memory/action-patterns.json` | If pattern identified |

## Core Concept

Action Impact Analysis answers: **"Did our actions move the deal forward?"**

Good impact analysis:
- **Measures outcomes** — What changed after the action?
- **Attributes impact** — Which action caused which change?
- **Identifies patterns** — What works consistently?
- **Improves future** — Calibrates NBA recommendations

## The Analysis Process

```
┌─────────────────────────────────────────────────────────┐
│            ACTION IMPACT ANALYSIS PROCESS               │
│                                                         │
│  1. IDENTIFY COMPLETED ACTIONS                          │
│     └─→ Actions taken since last analysis               │
│                                                         │
│  2. MEASURE SCORE CHANGES                               │
│     └─→ Before vs. after scores                         │
│                                                         │
│  3. ATTRIBUTE CHANGES                                   │
│     └─→ Which action caused which change                │
│                                                         │
│  4. ASSESS EFFECTIVENESS                                │
│     └─→ Did action achieve intended outcome?            │
│                                                         │
│  5. IDENTIFY PATTERNS                                   │
│     └─→ What's working, what's not                      │
│                                                         │
│  6. UPDATE LEARNING                                     │
│     └─→ Improve future recommendations                  │
└─────────────────────────────────────────────────────────┘
```

## impact-analysis.json Format

```json
{
  "generatedAt": "2026-02-05T15:00:00Z",
  "dealId": "shopco",
  "analysisPeriod": {
    "from": "2026-02-03",
    "to": "2026-02-05"
  },
  "actionsAnalyzed": [
    {
      "action": "Build ROI model for CFO",
      "type": "champion-enablement",
      "completedAt": "2026-02-04",
      "nbaScoreAtTime": 87,
      "intendedOutcome": "CFO has ROI data to evaluate",
      "actualOutcome": "CFO reviewed and asked follow-up questions",
      "effectiveness": "high",
      "impact": {
        "scoreChanges": [
          {"score": "dealConfidence", "before": 75, "after": 82, "delta": "+7"},
          {"score": "dealHealth", "before": 72, "after": 76, "delta": "+4"}
        ],
        "sentimentChanges": [
          {"stakeholder": "Lisa Park (CFO)", "before": "skeptical", "after": "neutral"}
        ],
        "riskChanges": [
          {"risk": "CFO skeptical on ROI", "before": "critical", "after": "medium"}
        ]
      },
      "insights": [
        "CFO responded well to specific numbers",
        "Comparison to hiring costs was compelling",
        "Follow-up questions indicate engagement"
      ]
    },
    {
      "action": "Request CTO introduction from Sarah",
      "type": "stakeholder-engagement",
      "completedAt": "2026-02-04",
      "nbaScoreAtTime": 78,
      "intendedOutcome": "Technical evaluation path opened",
      "actualOutcome": "Meeting scheduled with CTO for Feb 7",
      "effectiveness": "very-high",
      "impact": {
        "scoreChanges": [
          {"score": "dealConfidence", "before": 75, "after": 82, "delta": "+7"}
        ],
        "stakeholderChanges": [
          {"type": "new-engagement", "stakeholder": "Michael Torres (CTO)"}
        ],
        "riskChanges": [
          {"risk": "CTO not engaged", "before": "high", "after": "low"}
        ]
      },
      "insights": [
        "Sarah was enthusiastic about making intro",
        "CTO agreed to meeting within 24 hours",
        "Low effort, high impact action"
      ]
    }
  ],
  "overallImpact": {
    "dealHealthChange": "+4 (72 → 76)",
    "actionsCompleted": 2,
    "highEffectiveness": 2,
    "mediumEffectiveness": 0,
    "lowEffectiveness": 0
  },
  "patternsIdentified": [
    {
      "pattern": "Champion-enabled stakeholder outreach",
      "observation": "Using champion for intros has 95% success rate",
      "recommendation": "Always prefer champion-mediated introductions"
    },
    {
      "pattern": "CFO responds to quantified ROI",
      "observation": "Skeptical CFO moved to neutral with specific numbers",
      "recommendation": "Lead with quantified impact for finance stakeholders"
    }
  ],
  "learnings": {
    "whatWorked": [
      "ROI model with specific numbers",
      "Champion-facilitated introduction",
      "Quick turnaround on requested materials"
    ],
    "whatDidntWork": [],
    "surprises": [
      "CFO responded faster than expected"
    ]
  }
}
```

## Effectiveness Levels

| Level | Definition | Indicators |
|-------|------------|------------|
| very-high | Exceeded expectations | Better outcome than planned, multiple positive effects |
| high | Achieved outcome | Intended result achieved |
| medium | Partial success | Some progress but not full outcome |
| low | Minimal impact | Little or no measurable change |
| negative | Backfired | Made things worse |

## Output Format

After analysis:

```
✓ Action Impact Analysis: {company}

  Period: Feb 3 - Feb 5, 2026
  Actions Analyzed: 2

  OVERALL IMPACT:
    Deal Health: 72 → 76 (+4)
    Actions with High Effectiveness: 2 of 2

  ═══════════════════════════════════════════════════════════
  ACTION 1: Build ROI model for CFO
  ═══════════════════════════════════════════════════════════
  Effectiveness: HIGH ✓

  Score Impact:
    Deal Confidence: 75 → 82 (+7)
    Deal Health: 72 → 76 (+4)

  Sentiment Shift:
    Lisa Park (CFO): Skeptical → Neutral ↑

  Risk Reduction:
    "CFO skeptical on ROI": Critical → Medium ↓

  Insights:
    • CFO responded well to specific numbers
    • Comparison to hiring costs was compelling
    • Follow-up questions indicate engagement

  ───────────────────────────────────────────────────────────
  ACTION 2: Request CTO introduction
  ───────────────────────────────────────────────────────────
  Effectiveness: VERY HIGH ✓

  Score Impact:
    Deal Confidence: +7 (contributed)

  Stakeholder Impact:
    • NEW: Michael Torres (CTO) now engaged
    • Meeting scheduled for Feb 7

  Risk Reduction:
    "CTO not engaged": High → Low ↓

  Insights:
    • Sarah was enthusiastic about making intro
    • CTO agreed within 24 hours
    • Low effort, high impact action

  PATTERNS IDENTIFIED:
    1. Champion-enabled outreach: 95% success rate
       → Always prefer champion-mediated introductions
    2. CFO responds to quantified ROI
       → Lead with numbers for finance stakeholders

  LEARNINGS:
    ✓ ROI model with specific numbers worked
    ✓ Champion-facilitated intro worked
    ✓ Quick turnaround impressed them

  Files Updated:
    • actions/impact-analysis.json
    • memory/action-patterns.json (patterns updated)
```

## Quality Checklist

- [ ] All completed actions identified
- [ ] Score changes measured before/after
- [ ] Changes attributed to specific actions
- [ ] Effectiveness assessed for each action
- [ ] Patterns identified
- [ ] Learnings documented
- [ ] Pattern file updated

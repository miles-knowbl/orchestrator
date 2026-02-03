---
name: stakeholder-sentiment
description: "Track and analyze stakeholder sentiment changes over time. Identifies sentiment shifts, red flags, and provides relationship health scoring for the buying committee."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["stakeholder-add", "communication-parse"]
tags: [sales, intelligence-extraction, stakeholders, sentiment, knopilot]
---

# Stakeholder Sentiment

Track and analyze stakeholder sentiment over time.

## When to Use

- **After communications parsed** — Update sentiment based on new interactions
- **Deal review** — Assess relationship health across buying committee
- **Risk identification** — Spot sentiment shifts early
- When you say: "how do they feel", "sentiment check", "relationship health"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `sentiment-indicators.md` | Verbal and behavioral signals |
| `sentiment-shifts.md` | How to detect and respond to changes |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated stakeholders.json | `deals/{slug}/stakeholders.json` | Always |
| Sentiment report | `deals/{slug}/intelligence/sentiment-report.json` | If significant shifts |

## Core Concept

Stakeholder Sentiment answers: **"How does each person feel about this deal?"**

Good sentiment tracking:
- **Captures evidence** — Based on actual signals, not assumptions
- **Tracks changes** — Detects shifts over time
- **Identifies risks** — Flags concerning patterns
- **Informs actions** — Guides who needs attention

## Sentiment Levels

| Level | Definition | Indicators |
|-------|------------|------------|
| supportive | Actively wants deal to happen | Advocates, shares info, drives process |
| neutral | Neither for nor against | Evaluating, asking questions, waiting |
| skeptical | Has doubts or concerns | Challenges claims, slow to respond |
| unknown | Not enough data | New contact, limited interaction |

## The Analysis Process

```
┌─────────────────────────────────────────────────────────┐
│           SENTIMENT ANALYSIS PROCESS                    │
│                                                         │
│  1. GATHER INTERACTION DATA                             │
│     └─→ All communications involving stakeholder        │
│                                                         │
│  2. IDENTIFY SIGNALS                                    │
│     └─→ Verbal, behavioral, written indicators          │
│                                                         │
│  3. ASSESS CURRENT SENTIMENT                            │
│     └─→ Supportive, neutral, skeptical, unknown         │
│                                                         │
│  4. COMPARE TO PREVIOUS                                 │
│     └─→ Detect shifts                                   │
│                                                         │
│  5. FLAG RISKS                                          │
│     └─→ Negative shifts, red flags                      │
│                                                         │
│  6. UPDATE STAKEHOLDER FILE                             │
│     └─→ Sentiment + reason + history                    │
└─────────────────────────────────────────────────────────┘
```

## Sentiment Signals

### Supportive Signals

**Verbal:**
- "This is exactly what we need"
- "How soon can we get started?"
- "I'll advocate for this internally"
- Uses "we" when discussing implementation

**Behavioral:**
- Responds quickly
- Proactively shares information
- Makes introductions
- Follows up without prompting

### Neutral Signals

**Verbal:**
- "Let me think about that"
- "I'd need to see more"
- "What are the pros and cons?"
- Asks clarifying questions

**Behavioral:**
- Responds at normal pace
- Provides information when asked
- Attends meetings but doesn't drive

### Skeptical Signals

**Verbal:**
- "I'm not sure this will work"
- "We tried something like this before"
- "That seems risky"
- References past failures

**Behavioral:**
- Slow to respond
- Asks challenging questions
- Brings up edge cases, risks
- Multitasking in meetings

## stakeholders.json Sentiment Update

```json
{
  "id": "SH-001",
  "name": "Sarah Chen",
  "sentiment": "supportive",
  "sentimentHistory": [
    {
      "sentiment": "neutral",
      "date": "2026-02-01",
      "reason": "Initial contact, asking questions",
      "source": "2026-02-01-email-initial.md"
    },
    {
      "sentiment": "supportive",
      "date": "2026-02-03",
      "reason": "After discovery call, expressed urgency and offered to make introductions",
      "source": "2026-02-03-meeting-discovery.md"
    }
  ],
  "sentimentConfidence": "high",
  "lastSentimentUpdate": "2026-02-03"
}
```

## sentiment-report.json Format

```json
{
  "generatedAt": "2026-02-03T15:00:00Z",
  "dealId": "shopco",
  "summary": {
    "totalStakeholders": 4,
    "supportive": 2,
    "neutral": 1,
    "skeptical": 1,
    "unknown": 0,
    "overallHealth": "good"
  },
  "stakeholderSentiments": [
    {
      "name": "Sarah Chen",
      "role": "champion",
      "sentiment": "supportive",
      "confidence": "high",
      "trend": "improving",
      "lastInteraction": "2026-02-03",
      "keySignals": ["Offered to make introductions", "Expressed urgency"]
    },
    {
      "name": "Lisa Park",
      "role": "decision-maker",
      "sentiment": "skeptical",
      "confidence": "medium",
      "trend": "stable",
      "lastInteraction": "2026-02-03",
      "keySignals": ["Questioned ROI", "Asked about risks"],
      "riskFlag": true,
      "recommendedAction": "Build ROI case, address risk concerns"
    }
  ],
  "shifts": [
    {
      "stakeholder": "Sarah Chen",
      "from": "neutral",
      "to": "supportive",
      "date": "2026-02-03",
      "cause": "Discovery call addressed her concerns"
    }
  ],
  "redFlags": [
    {
      "type": "skeptical-dm",
      "stakeholder": "Lisa Park",
      "description": "CFO is skeptical on ROI",
      "severity": "medium",
      "recommendation": "Schedule executive business review"
    }
  ]
}
```

## Output Format

After analysis:

```
✓ Sentiment Analysis for {company}

  Overall Health: Good (2 supportive, 1 neutral, 1 skeptical)

  STAKEHOLDER SENTIMENTS:

    Sarah Chen (Champion)
      Sentiment: Supportive ↑ (was Neutral)
      Signals: Offered introductions, expressed urgency
      Confidence: High

    Michael Torres (Decision-Maker)
      Sentiment: Neutral →
      Signals: Asking technical questions, engaged but careful
      Confidence: Medium

    Lisa Park (Decision-Maker)
      Sentiment: Skeptical →
      Signals: Questioned ROI, asked about risks
      Confidence: Medium
      ⚠️ Risk: Skeptical CFO may block deal

    James Wright (Evaluator)
      Sentiment: Supportive →
      Signals: Positive on technical evaluation
      Confidence: High

  SENTIMENT SHIFTS:
    • Sarah Chen: Neutral → Supportive (Feb 3)
      Cause: Discovery call addressed her concerns

  RED FLAGS:
    ⚠️ CFO (Lisa Park) skeptical on ROI
       → Schedule executive business review
       → Build ROI case with champion

  FILES UPDATED:
    • stakeholders.json (sentiment updates)
    • intelligence/sentiment-report.json

  → Address CFO concerns before next stage
```

## Quality Checklist

- [ ] All stakeholders assessed
- [ ] Sentiment based on evidence (not assumption)
- [ ] Sentiment history tracked
- [ ] Shifts detected and documented
- [ ] Red flags identified
- [ ] Recommended actions provided
- [ ] Confidence levels assigned

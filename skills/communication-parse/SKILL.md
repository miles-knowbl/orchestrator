---
name: communication-parse
description: "Extract structured intelligence from captured communications using Claude-powered analysis. Identifies pain points, budget signals, timeline indicators, stakeholder sentiment, and technical requirements."
phase: IMPLEMENT
category: sales
version: "1.0.0"
depends_on: ["communication-capture"]
tags: [sales, intelligence-extraction, parsing, knopilot]
---

# Communication Parse

Extract structured intelligence from raw communications.

## When to Use

- **After capturing communications** — Parse to extract signals
- **Batch processing** — Process multiple comms at once
- **Intelligence refresh** — Re-parse with updated context
- When you say: "extract insights", "parse this communication", "what signals are here"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `signal-taxonomy.md` | What signals to extract and how to categorize |
| `extraction-prompts.md` | Effective prompts for Claude extraction |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated intelligence files | `deals/{slug}/intelligence/` | Always |
| Updated deal.json | `deals/{slug}/deal.json` | If scores change |

## Core Concept

Communication Parse answers: **"What intelligence is hidden in this communication?"**

Good parsing:
- **Extracts all signals** — Pain points, budget, timeline, stakeholders, technical
- **Attributes sources** — Links insights to specific communications
- **Maintains confidence** — Distinguishes explicit vs. inferred
- **Updates scores** — Feeds into deal scoring

## Signal Categories

| Category | What to Extract |
|----------|-----------------|
| Pain Points | Problems, challenges, frustrations |
| Budget/Timeline | Money signals, deadlines, fiscal cycles |
| AI Maturity | Experience with AI, internal capabilities |
| Stakeholder | New contacts, sentiments, power dynamics |
| Technical | Requirements, integrations, constraints |
| Competitive | Other vendors, build vs buy |
| Use Case | What they want to automate |

## The Parsing Process

```
┌─────────────────────────────────────────────────────────┐
│              COMMUNICATION PARSE PROCESS                │
│                                                         │
│  1. READ THE COMMUNICATION                              │
│     └─→ Full context, not just highlights               │
│                                                         │
│  2. EXTRACT SIGNALS BY CATEGORY                         │
│     └─→ Pain, Budget, Timeline, Tech, etc.              │
│                                                         │
│  3. ATTRIBUTE TO SOURCE                                 │
│     └─→ Link each signal to the communication           │
│                                                         │
│  4. ASSESS CONFIDENCE                                   │
│     └─→ Explicit (stated) vs. Inferred                  │
│                                                         │
│  5. UPDATE INTELLIGENCE FILES                           │
│     └─→ Merge with existing intelligence                │
│                                                         │
│  6. FLAG SCORE UPDATES                                  │
│     └─→ Note if deal scores should change               │
└─────────────────────────────────────────────────────────┘
```

## Extraction Output Format

For each communication, produce:

```json
{
  "communicationId": "2026-02-03-meeting-discovery.md",
  "parsedAt": "2026-02-03T15:00:00Z",
  "signals": {
    "painPoints": [
      {
        "category": "volume",
        "description": "300% increase in support tickets overwhelming team",
        "severity": "high",
        "quote": "We're drowning in tickets",
        "speaker": "Sarah Chen",
        "confidence": "explicit"
      }
    ],
    "budgetTimeline": {
      "budgetSignals": [
        {
          "type": "range",
          "value": "$200-400K",
          "quote": "Budget approved for $200-400K",
          "confidence": "explicit"
        }
      ],
      "timelineSignals": [
        {
          "type": "deadline",
          "value": "Q2 2026",
          "quote": "Need this by June",
          "confidence": "explicit"
        }
      ]
    },
    "stakeholders": [
      {
        "name": "Michael Torres",
        "title": "CTO",
        "mentioned": true,
        "sentiment": "unknown",
        "note": "Sarah will loop him in for technical discussion"
      }
    ],
    "technical": [
      {
        "category": "integration",
        "requirement": "Shopify Plus integration",
        "confidence": "explicit"
      },
      {
        "category": "authentication",
        "requirement": "Okta SSO",
        "confidence": "explicit"
      }
    ],
    "competitive": [],
    "useCase": {
      "primary": "Tier 1 chat automation for returns/exchanges",
      "clarity": "defined",
      "confidence": "explicit"
    },
    "aiMaturity": {
      "signals": ["No prior AI attempts", "No internal AI team"],
      "assessment": "early-stage"
    }
  },
  "keyQuotes": [
    {
      "quote": "We need this live by June or we'll drown in tickets",
      "speaker": "Sarah Chen",
      "significance": "Timeline urgency + pain severity"
    }
  ],
  "scoreImpacts": {
    "aiReadiness": "+10 (clear use case, budget confirmed)",
    "dealConfidence": "+15 (champion engaged, timeline confirmed)",
    "useCaseClarity": "→ defined (was exploring)"
  }
}
```

## Merging Intelligence

When parsing new communications, merge with existing intelligence:

### Pain Points (intelligence/pain-points.json)

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "painPoints": [
    {
      "id": "PP-001",
      "category": "volume",
      "description": "300% increase in support tickets",
      "severity": "high",
      "firstMentioned": "2026-02-01",
      "lastMentioned": "2026-02-03",
      "mentionCount": 3,
      "sources": [
        "2026-02-01-email-initial.md",
        "2026-02-03-meeting-discovery.md"
      ],
      "quotes": [
        {
          "quote": "We're drowning in tickets",
          "source": "2026-02-03-meeting-discovery.md"
        }
      ]
    }
  ]
}
```

### Budget/Timeline (intelligence/budget-timeline.json)

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "budget": {
    "confirmed": true,
    "range": "$200K-$400K",
    "confidence": "explicit",
    "sources": ["2026-02-03-meeting-discovery.md"],
    "fiscalContext": "FY2026 budget already allocated"
  },
  "timeline": {
    "decisionDeadline": null,
    "implementationDeadline": "2026-06-30",
    "confidence": "explicit",
    "sources": ["2026-02-03-meeting-discovery.md"],
    "urgencyLevel": "high",
    "urgencyQuote": "Need this by June"
  }
}
```

## Batch Parsing

When parsing multiple communications:

```
Parsing 3 communications for ShopCo...

  1. 2026-02-01-email-initial.md
     → 2 pain points, 1 use case signal

  2. 2026-02-03-meeting-discovery.md
     → 1 pain point (reinforced), budget confirmed, timeline confirmed
     → 2 technical requirements, 1 new stakeholder

  3. 2026-02-05-email-tech-questions.md
     → 3 technical requirements added

Summary:
  Pain Points: 2 (1 high severity)
  Budget: $200-400K (explicit)
  Timeline: Q2 2026 (explicit)
  Technical: 5 requirements identified
  Stakeholders: 1 new (CTO Michael, not yet engaged)

Score Impacts:
  AI Readiness: 55 → 72 (+17)
  Deal Confidence: 40 → 68 (+28)
  Use Case Clarity: exploring → defined

→ Run deal-scoring to update scores
→ Run next-best-action to get recommendations
```

## Confidence Levels

| Level | Meaning | Example |
|-------|---------|---------|
| explicit | Directly stated | "Budget is $200-400K" |
| strong-inference | Clearly implied | "Finance approved the project" |
| inference | Reasonable conclusion | Company size suggests budget range |
| weak | Speculation | Might have budget based on industry |

## Output Format

After parsing:

```
✓ Parsed: {communication-file}

  Signals Extracted:
    Pain Points: {N} ({severity breakdown})
    Budget: {status}
    Timeline: {status}
    Technical: {N} requirements
    Stakeholders: {N} mentioned
    Competitive: {status}

  Key Intelligence:
    • {Most important finding}
    • {Second most important}

  Score Impacts:
    {Score}: {change}

  Files Updated:
    • intelligence/pain-points.json
    • intelligence/budget-timeline.json
    • ...

  → {Recommended next action}
```

## Quality Checklist

- [ ] All signal categories checked
- [ ] Signals attributed to source
- [ ] Confidence levels assigned
- [ ] Intelligence files updated
- [ ] Duplicates merged (not created)
- [ ] Score impacts noted
- [ ] Key quotes captured

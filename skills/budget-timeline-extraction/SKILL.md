---
name: budget-timeline-extraction
description: "Extract budget signals and timeline indicators from parsed communications. Identifies explicit amounts, approval status, fiscal constraints, deadlines, and urgency levels."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse"]
tags: [sales, intelligence-extraction, budget, timeline, knopilot]
---

# Budget Timeline Extraction

Extract budget and timeline intelligence from communications.

## When to Use

- **After parsing communications** — Consolidate budget/timeline signals
- **Deal qualification** — Assess BANT readiness
- **Forecasting** — Understand when deal might close
- When you say: "what's their budget", "when do they need this", "extract timeline"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `budget-signals.md` | Types of budget indicators |
| `timeline-signals.md` | Types of timeline indicators |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated budget-timeline.json | `deals/{slug}/intelligence/budget-timeline.json` | Always |
| Updated DEAL.md | `deals/{slug}/DEAL.md` | If budget/timeline confirmed |

## Core Concept

Budget Timeline Extraction answers: **"Can they afford this and when do they need it?"**

Good extraction:
- **Distinguishes explicit vs. inferred** — "$200K budget" vs. "probably six figures"
- **Tracks approval status** — Approved, needs approval, unknown
- **Identifies drivers** — Why this timeline? What's the forcing function?
- **Notes flexibility** — Hard deadline vs. soft target

## The Extraction Process

```
┌─────────────────────────────────────────────────────────┐
│         BUDGET TIMELINE EXTRACTION PROCESS              │
│                                                         │
│  1. GATHER PARSED SIGNALS                               │
│     └─→ Read budgetTimeline from parsed comms           │
│                                                         │
│  2. CATEGORIZE BUDGET SIGNALS                           │
│     └─→ Explicit amount, range, indicator, constraint   │
│                                                         │
│  3. CATEGORIZE TIMELINE SIGNALS                         │
│     └─→ Hard deadline, soft target, dependency, urgency │
│                                                         │
│  4. ASSESS CONFIDENCE                                   │
│     └─→ Explicit, strong inference, inference, weak     │
│                                                         │
│  5. IDENTIFY DRIVERS                                    │
│     └─→ Why this budget? Why this timeline?             │
│                                                         │
│  6. UPDATE INTELLIGENCE FILE                            │
│     └─→ Merge into budget-timeline.json                 │
└─────────────────────────────────────────────────────────┘
```

## budget-timeline.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "budget": {
    "status": "confirmed",
    "type": "explicit-range",
    "value": "$200K-$400K",
    "currency": "USD",
    "period": "one-time",
    "confidence": "explicit",
    "approvalStatus": "approved",
    "approver": "CFO",
    "fiscalContext": "FY2026 budget already allocated",
    "sources": ["2026-02-03-meeting-discovery.md"],
    "quotes": [
      {
        "quote": "Budget approved for $200-400K",
        "speaker": "Sarah Chen",
        "source": "2026-02-03-meeting-discovery.md"
      }
    ],
    "constraints": [],
    "lastUpdated": "2026-02-03"
  },
  "timeline": {
    "status": "confirmed",
    "decisionDeadline": null,
    "implementationDeadline": "2026-06-30",
    "type": "hard-deadline",
    "driver": "Peak season preparation — must be live before summer rush",
    "flexibility": "low",
    "confidence": "explicit",
    "urgencyLevel": "high",
    "sources": ["2026-02-03-meeting-discovery.md"],
    "quotes": [
      {
        "quote": "Need this live by June or we'll drown in tickets",
        "speaker": "Sarah Chen",
        "source": "2026-02-03-meeting-discovery.md"
      }
    ],
    "dependencies": [],
    "lastUpdated": "2026-02-03"
  },
  "combined": {
    "dealTimeline": "Q2 2026",
    "decisionConfidence": "high",
    "budgetFit": "within-range",
    "riskFactors": []
  }
}
```

## Budget Signal Types

| Type | Examples | Confidence |
|------|----------|------------|
| explicit-amount | "$200K", "half a million" | High |
| explicit-range | "$200K-$400K", "between 100 and 200" | High |
| range-indicator | "six figures", "significant investment" | Medium |
| approval-status | "budget approved", "need to get budget" | Medium |
| constraint | "limited budget", "need to justify" | Low |
| comparison | "costs less than hiring" | Low |

## Timeline Signal Types

| Type | Examples | Urgency |
|------|----------|---------|
| hard-deadline | "Must be live by June 30" | High |
| soft-target | "Hoping for Q2" | Medium |
| fiscal-constraint | "Before fiscal year end" | Medium |
| event-driven | "Before our busy season" | High |
| dependency | "After the migration completes" | Variable |
| urgency | "ASAP", "urgent", "critical" | High |

## Output Format

After extraction:

```
✓ Budget/Timeline extracted for {company}

  BUDGET:
    Status: Confirmed
    Amount: $200K-$400K
    Approval: Approved by CFO
    Confidence: Explicit (direct quote)
    "Budget approved for $200-400K" — Sarah Chen

  TIMELINE:
    Status: Confirmed
    Deadline: June 30, 2026 (Implementation)
    Type: Hard deadline
    Driver: Peak season preparation
    Flexibility: Low
    Confidence: Explicit (direct quote)
    "Need this live by June" — Sarah Chen

  COMBINED ASSESSMENT:
    Decision Timeline: Q2 2026
    Budget Fit: Within our range
    Risk Factors: None identified

  Files Updated:
    • intelligence/budget-timeline.json
    • DEAL.md (budget/timeline section)

  → Budget and timeline confirmed — deal is qualified
```

## Inference Rules

When signals aren't explicit:

| Signal | Inference |
|--------|-----------|
| "Need to get approval" | Budget not yet secured |
| "Already in our plan" | Budget likely available |
| "Need to build business case" | Budget uncertain |
| "Board approved AI initiative" | Strong budget signal |
| "This quarter's budget is tight" | May need to wait |
| "Looking at this week" | Immediate decision |
| "Next budget cycle" | Next quarter at earliest |
| "Someday", "Eventually" | Long-term, low priority |

## Quality Checklist

- [ ] All budget signals captured
- [ ] All timeline signals captured
- [ ] Explicit vs. inferred clearly marked
- [ ] Confidence levels assigned
- [ ] Quotes attributed to speakers
- [ ] Sources linked to communications
- [ ] Drivers identified (why this timeline?)
- [ ] Flexibility assessed (hard vs. soft)
- [ ] Combined assessment provided

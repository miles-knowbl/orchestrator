---
name: pain-point-extraction
description: "Extract and categorize pain points from parsed communications. Identifies volume, cost, quality, speed, compliance, security, experience, talent, legacy, and integration issues with severity assessment."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse"]
tags: [sales, intelligence-extraction, pain-points, knopilot]
---

# Pain Point Extraction

Extract structured pain points from communications.

## When to Use

- **After parsing communications** — Consolidate pain point signals
- **Deal review** — Understand prospect's problems
- **Champion enablement** — Build materials around their pain
- When you say: "what are their pain points", "what problems do they have", "extract pain"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `pain-categories.md` | Standard pain point taxonomy |
| `severity-scoring.md` | How to assess pain severity |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated pain-points.json | `deals/{slug}/intelligence/pain-points.json` | Always |
| Pain summary in DEAL.md | `deals/{slug}/DEAL.md` | If significant pain identified |

## Core Concept

Pain Point Extraction answers: **"What problems is this prospect trying to solve?"**

Good pain extraction:
- **Categorizes accurately** — Maps to standard taxonomy
- **Assesses severity** — High/medium/low with evidence
- **Attributes sources** — Links to specific communications
- **Quantifies impact** — Captures metrics when available
- **Tracks evolution** — Pain mentioned multiple times = higher priority

## Pain Categories

| Category | Description | Keywords |
|----------|-------------|----------|
| volume | Capacity/scale issues | "drowning", "overwhelmed", "too many" |
| cost | Cost pressure | "expensive", "budget", "ROI" |
| quality | Quality problems | "errors", "mistakes", "complaints" |
| speed | Time/efficiency issues | "slow", "takes too long", "delays" |
| compliance | Regulatory needs | "audit", "compliance", "SOC 2" |
| security | Security concerns | "breach", "vulnerability", "protect" |
| experience | Customer/user experience | "frustrated", "satisfaction", "NPS" |
| talent | People/hiring issues | "can't hire", "training", "turnover" |
| legacy | Old system problems | "outdated", "technical debt" |
| integration | Connection issues | "doesn't talk to", "silos", "manual" |

## The Extraction Process

```
┌─────────────────────────────────────────────────────────┐
│           PAIN POINT EXTRACTION PROCESS                 │
│                                                         │
│  1. GATHER PARSED SIGNALS                               │
│     └─→ Read all painPoint signals from parsed comms    │
│                                                         │
│  2. CATEGORIZE EACH PAIN                                │
│     └─→ Map to standard category                        │
│                                                         │
│  3. ASSESS SEVERITY                                     │
│     └─→ High, Medium, Low based on indicators           │
│                                                         │
│  4. CONSOLIDATE DUPLICATES                              │
│     └─→ Same pain mentioned multiple times = one entry  │
│                                                         │
│  5. QUANTIFY IMPACT                                     │
│     └─→ Extract any metrics or numbers                  │
│                                                         │
│  6. UPDATE INTELLIGENCE FILE                            │
│     └─→ Merge into pain-points.json                     │
└─────────────────────────────────────────────────────────┘
```

## pain-points.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "summary": {
    "totalPainPoints": 3,
    "highSeverity": 1,
    "mediumSeverity": 1,
    "lowSeverity": 1,
    "topCategory": "volume"
  },
  "painPoints": [
    {
      "id": "PP-001",
      "category": "volume",
      "description": "Support ticket volume increased 300%, team overwhelmed",
      "severity": "high",
      "severityReason": "Executive-level concern, quantified impact, urgent language",
      "impact": {
        "quantified": "300% increase in tickets",
        "qualitative": "Response times degraded, team burnout"
      },
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
          "speaker": "Sarah Chen",
          "source": "2026-02-03-meeting-discovery.md"
        }
      ],
      "addressable": true,
      "addressableNote": "Core use case for AI support automation"
    }
  ]
}
```

## Severity Assessment

| Severity | Indicators |
|----------|------------|
| high | Executive-level concern, quantified impact, urgent language, mentioned multiple times |
| medium | Department-level issue, acknowledged problem, some urgency |
| low | Nice-to-have, mentioned in passing, no urgency |

### Severity Scoring Inputs

- **Who mentioned it?** Executive = higher severity
- **Is it quantified?** Numbers = higher severity
- **How often mentioned?** Repeated = higher severity
- **What language used?** "Urgent", "critical", "drowning" = higher severity
- **Is there a deadline?** Time pressure = higher severity

## Output Format

After extraction:

```
✓ Pain Points extracted for {company}

  Summary:
    Total: 3 pain points
    High Severity: 1
    Medium Severity: 1
    Low Severity: 1

  High Severity:
    • [volume] Support ticket volume +300%
      "We're drowning in tickets" — Sarah Chen
      Mentioned: 3 times across 2 communications

  Medium Severity:
    • [experience] Customer satisfaction declining
      NPS dropped from 45 to 32
      Mentioned: 2 times

  Low Severity:
    • [integration] Manual data entry between systems
      Mentioned: 1 time

  Addressable by our solution: 2 of 3

  Files Updated:
    • intelligence/pain-points.json

  → Run deal-scoring to update AI Readiness score
```

## Quality Checklist

- [ ] All parsed pain signals processed
- [ ] Each pain categorized correctly
- [ ] Severity assessed with reasoning
- [ ] Duplicates consolidated (not repeated)
- [ ] Quotes attributed to speakers
- [ ] Sources linked to communications
- [ ] Impact quantified where available
- [ ] Addressability noted

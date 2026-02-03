---
name: competitive-intel
description: "Extract and track competitive intelligence from communications. Identifies active evaluations, past experiences, preferences, and competitive positioning."
phase: ANALYZE
category: sales
version: "1.0.0"
depends_on: ["communication-parse"]
tags: [sales, intelligence-extraction, competitive, knopilot]
---

# Competitive Intelligence

Extract competitive signals from communications.

## When to Use

- **After parsing communications** — Extract competitor mentions
- **Deal strategy** — Understand competitive landscape
- **Win/loss analysis** — Track what competitors are doing
- When you say: "who else are they talking to", "competitive intel", "who are we up against"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `competitive-signals.md` | Types of competitive indicators |
| `competitive-response.md` | How to respond to competition |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated competitive-intel.json | `deals/{slug}/intelligence/competitive-intel.json` | Always |
| Competitive notes in DEAL.md | `deals/{slug}/DEAL.md` | If significant competition |

## Core Concept

Competitive Intelligence answers: **"Who else is in this deal and what's their position?"**

Good competitive intel:
- **Identifies all players** — Known and suspected competitors
- **Tracks status** — Active evaluation, past user, eliminated
- **Captures sentiment** — How they feel about competitors
- **Informs positioning** — What to emphasize, what to address

## The Extraction Process

```
┌─────────────────────────────────────────────────────────┐
│          COMPETITIVE INTEL EXTRACTION PROCESS           │
│                                                         │
│  1. GATHER COMPETITOR MENTIONS                          │
│     └─→ From parsed communications                      │
│                                                         │
│  2. IDENTIFY COMPETITORS                                │
│     └─→ Named vendors, categories, build option         │
│                                                         │
│  3. ASSESS STATUS                                       │
│     └─→ Active, past-user, eliminated, rumored          │
│                                                         │
│  4. CAPTURE SENTIMENT                                   │
│     └─→ How they feel about each competitor             │
│                                                         │
│  5. NOTE DIFFERENTIATORS                                │
│     └─→ What they like/dislike about each               │
│                                                         │
│  6. UPDATE INTELLIGENCE FILE                            │
│     └─→ Merge into competitive-intel.json               │
└─────────────────────────────────────────────────────────┘
```

## competitive-intel.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "summary": {
    "totalCompetitors": 2,
    "activeEvaluations": 1,
    "competitiveRisk": "medium",
    "primaryThreat": "Intercom"
  },
  "competitors": [
    {
      "id": "COMP-001",
      "name": "Intercom",
      "type": "direct",
      "status": "past-user",
      "sentiment": "negative",
      "strengths": ["Brand recognition", "Feature breadth"],
      "weaknesses": ["Too expensive", "Poor customization", "Slow support"],
      "quotes": [
        {
          "quote": "We used Intercom for 2 years but it got too expensive",
          "speaker": "Sarah Chen",
          "source": "2026-02-03-meeting-discovery.md"
        }
      ],
      "differentiators": ["Price", "Customization", "Support"],
      "sources": ["2026-02-03-meeting-discovery.md"]
    },
    {
      "id": "COMP-002",
      "name": "In-house build",
      "type": "internal",
      "status": "considered",
      "sentiment": "neutral",
      "strengths": ["Full control", "No vendor lock-in"],
      "weaknesses": ["Resource intensive", "Maintenance burden"],
      "quotes": [],
      "differentiators": ["Time to value", "Expertise"],
      "sources": ["2026-02-03-meeting-discovery.md"]
    }
  ],
  "buildVsBuy": {
    "considered": true,
    "preference": "buy",
    "reason": "Don't want to build and maintain AI",
    "quote": "We'd rather buy than build this"
  },
  "incumbents": {
    "currentSolution": "Email support only",
    "satisfaction": "low",
    "switchingCost": "low"
  }
}
```

## Competitor Types

| Type | Description | Examples |
|------|-------------|----------|
| direct | Same category, direct competition | Named AI vendors |
| adjacent | Related but different category | CRM with AI features |
| internal | Build it themselves | In-house development |
| status-quo | Do nothing | Keep current process |

## Competitor Status

| Status | Meaning |
|--------|---------|
| active-evaluation | Currently talking to them |
| past-user | Used them before |
| eliminated | Ruled out |
| preferred | They prefer this competitor |
| rumored | Heard they might be evaluating |
| unknown | Mentioned but status unclear |

## Output Format

After extraction:

```
✓ Competitive Intel for {company}

  COMPETITIVE LANDSCAPE:

    Intercom (Direct Competitor)
      Status: Past User
      Sentiment: Negative ✓
      Why they left: "Too expensive, poor customization"
      Our differentiators: Price, Customization, Support

    In-house Build (Internal Option)
      Status: Considered
      Sentiment: Neutral
      Concern: "Don't want to build and maintain AI"
      Our differentiator: Time to value, Expertise

  BUILD VS. BUY:
    Preference: Buy
    Reason: "Would rather buy than build"

  CURRENT SOLUTION:
    Using: Email support only
    Satisfaction: Low
    Switching Cost: Low

  COMPETITIVE RISK: Medium
    ✓ Past competitor experience (negative) works in our favor
    ⚠️ Build option still on table — emphasize time to value

  RECOMMENDED POSITIONING:
    • Lead with: Price advantage over Intercom
    • Emphasize: Customization flexibility
    • Address: Build vs. buy with TCO comparison

  Files Updated:
    • intelligence/competitive-intel.json
    • DEAL.md (competitive section)
```

## Competitive Response Framework

| Situation | Response |
|-----------|----------|
| Active evaluation | Differentiate, speed up timeline |
| Past user (negative) | Leverage their pain |
| Past user (positive) | Why did they leave? |
| Preferred competitor | Understand why, counter |
| Build option | TCO, time to value, expertise |
| Status quo | Cost of inaction |

## Quality Checklist

- [ ] All competitor mentions captured
- [ ] Status accurately assessed
- [ ] Sentiment documented with evidence
- [ ] Strengths and weaknesses noted
- [ ] Quotes attributed to speakers
- [ ] Differentiators identified
- [ ] Build vs. buy preference captured
- [ ] Competitive risk assessed
- [ ] Positioning recommendations provided

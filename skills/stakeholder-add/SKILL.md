---
name: stakeholder-add
description: "Add a stakeholder to a deal's stakeholder map with role, sentiment, authority level, and relationship notes. Essential for understanding the buying committee."
phase: INIT
category: sales
version: "1.0.0"
depends_on: ["deal-create"]
tags: [sales, data-capture, stakeholders, knopilot]
---

# Stakeholder Add

Add a stakeholder to the deal's buying committee map.

## When to Use

- **New contact identified** — Someone new enters the conversation
- **Role clarified** — Understand someone's role in the decision
- **After meeting** — Map attendees and their influence
- When you say: "add this stakeholder", "map the buying committee", "who's involved"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `stakeholder-roles.md` | Standard role definitions |
| `sentiment-assessment.md` | How to gauge support/skepticism |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated stakeholders.json | `deals/{slug}/stakeholders.json` | Always |
| Updated DEAL.md | `deals/{slug}/DEAL.md` | Stakeholder table |

## Core Concept

Stakeholder Add answers: **"Who matters in this deal and what's their stance?"**

Good stakeholder mapping:
- **Identifies roles** — Who decides, who influences, who blocks
- **Gauges sentiment** — Supportive, neutral, or skeptical
- **Tracks authority** — Budget, technical, executive power
- **Captures intelligence** — Key quotes, concerns, motivations

## Stakeholder Properties

### Required Fields

| Field | Description | Values |
|-------|-------------|--------|
| Name | Full name | String |
| Title | Job title | String |
| Email | Contact email | String |
| Role | Role in deal | champion, decision-maker, influencer, blocker, evaluator |
| Sentiment | Current stance | supportive, neutral, skeptical, unknown |

### Optional Fields

| Field | Description |
|-------|-------------|
| Authority | What power they have: budget, technical, executive, none |
| Last Interaction | When you last engaged them |
| Key Quotes | Notable things they've said |
| Concerns | What worries them |
| Motivations | What drives them |
| Notes | Free-form observations |

## Role Definitions

### Champion

Your internal advocate who actively sells on your behalf.

**Indicators:**
- Proactively shares information
- Makes introductions
- Expresses urgency
- Asks "how can we make this happen?"

**Your job:** Enable them with ammunition

### Decision-Maker

Has authority to approve budget or sign contract.

**Indicators:**
- Title includes VP, Director, C-level
- Others defer to their opinion
- Controls budget discussions

**Your job:** Build credibility, address their specific concerns

### Influencer

Affects the decision but doesn't make it.

**Indicators:**
- Technical evaluator
- Team member who'll use the solution
- Trusted advisor to decision-maker

**Your job:** Win their support, make them advocates

### Blocker

Actively or passively resisting the deal.

**Indicators:**
- Raises objections
- Delays process
- Advocates for alternatives
- Skeptical in meetings

**Your job:** Understand concerns, address or work around

### Evaluator

Assessing solution against requirements.

**Indicators:**
- Runs technical evaluation
- Compares vendors
- Creates scorecards

**Your job:** Ensure they have what they need, address criteria

## The Add Process

```
┌─────────────────────────────────────────────────────────┐
│            STAKEHOLDER ADD PROCESS                      │
│                                                         │
│  1. IDENTIFY THE PERSON                                 │
│     └─→ Name, title, email                              │
│                                                         │
│  2. DETERMINE ROLE                                      │
│     └─→ Champion, DM, Influencer, Blocker, Evaluator    │
│                                                         │
│  3. ASSESS SENTIMENT                                    │
│     └─→ Supportive, Neutral, Skeptical, Unknown         │
│                                                         │
│  4. IDENTIFY AUTHORITY                                  │
│     └─→ Budget, Technical, Executive, None              │
│                                                         │
│  5. CAPTURE INTELLIGENCE                                │
│     └─→ Quotes, concerns, motivations                   │
│                                                         │
│  6. UPDATE FILES                                        │
│     └─→ stakeholders.json + DEAL.md                     │
└─────────────────────────────────────────────────────────┘
```

## stakeholders.json Format

```json
{
  "updatedAt": "2026-02-03T10:00:00Z",
  "stakeholders": [
    {
      "id": "uuid",
      "name": "Sarah Chen",
      "title": "VP Customer Experience",
      "email": "sarah@company.com",
      "role": "champion",
      "sentiment": "supportive",
      "authority": "budget",
      "addedAt": "2026-02-01T10:00:00Z",
      "lastInteraction": "2026-02-03T10:00:00Z",
      "keyQuotes": [
        {
          "quote": "We need this live by June or we'll drown in tickets",
          "source": "2026-02-01-meeting-discovery.md",
          "date": "2026-02-01"
        }
      ],
      "concerns": [],
      "motivations": ["Reduce support ticket volume", "Improve customer satisfaction"],
      "notes": "Very engaged, asks good questions, has CEO's ear"
    },
    {
      "id": "uuid",
      "name": "Michael Torres",
      "title": "CTO",
      "email": "michael@company.com",
      "role": "decision-maker",
      "sentiment": "neutral",
      "authority": "technical",
      "addedAt": "2026-02-03T10:00:00Z",
      "lastInteraction": null,
      "keyQuotes": [],
      "concerns": ["Integration complexity with existing auth system"],
      "motivations": [],
      "notes": "Not yet engaged directly - Sarah will loop him in"
    }
  ]
}
```

## DEAL.md Stakeholder Table

Update the stakeholder table in DEAL.md:

```markdown
## Stakeholder Map

| Name | Title | Role | Sentiment | Last Contact |
|------|-------|------|-----------|--------------|
| Sarah Chen | VP Customer Experience | Champion | Supportive | Feb 3 |
| Michael Torres | CTO | Decision-Maker | Neutral | Not yet |
| Lisa Park | CFO | Decision-Maker | Skeptical | Jan 28 |
```

## Output Format

After adding a stakeholder:

```
✓ Stakeholder added: {Name}

  Deal: {company-name}
  Role: {role}
  Sentiment: {sentiment}
  Authority: {authority}

  Stakeholder map now has {N} contacts:
    • {Name} ({role}, {sentiment})
    • {Name} ({role}, {sentiment})
    ...

  Recommendations:
  → {Next action for this stakeholder}
```

## Multiple Stakeholders

After a meeting, add all attendees:

```
✓ Added 3 stakeholders to {company}:

  1. Sarah Chen — Champion (Supportive)
     VP Customer Experience, budget authority
     Quote: "We need this by June"

  2. Michael Torres — Decision-Maker (Neutral)
     CTO, technical authority
     Note: Not yet engaged, concerns about integration

  3. Lisa Park — Decision-Maker (Skeptical)
     CFO, budget authority
     Concern: ROI vs. hiring more agents

  Buying Committee Summary:
    Champions: 1
    Decision-Makers: 2 (1 neutral, 1 skeptical)
    Key Risk: CFO skeptical on ROI

  → Create executive one-pager for CFO
```

## Quality Checklist

- [ ] Name and title accurate
- [ ] Role correctly identified
- [ ] Sentiment based on evidence (not assumption)
- [ ] Authority level identified
- [ ] Key quotes captured (if any)
- [ ] Concerns documented
- [ ] stakeholders.json updated
- [ ] DEAL.md table updated

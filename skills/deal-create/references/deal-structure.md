# Deal Structure Reference

Standard directory and file structure for deals in KnoPilot.

## Directory Layout

```
deals/
  {company-slug}/
    DEAL.md                 # Human-readable deal summary
    deal.json               # Structured deal data
    stakeholders.json       # Stakeholder map

    communications/         # Captured communications
      {date}-{type}-{description}.md
      # Examples:
      # 2026-02-03-email-initial-inquiry.md
      # 2026-02-05-meeting-discovery-call.md
      # 2026-02-10-email-pricing-discussion.md

    intelligence/           # Extracted insights
      pain-points.json
      budget-timeline.json
      ai-maturity.json
      competitive-landscape.json
      technical-requirements.json

    assets/                 # Champion enablement materials
      executive-one-pager.md
      roi-calculator.md
      competitive-comparison.md
      case-study-selection.md

    actions/                # NBA history
      {date}-nbas.json
      action-log.json
```

## File Naming Conventions

### Communications

Format: `{YYYY-MM-DD}-{type}-{brief-description}.md`

Types:
- `email` — Email thread or forwarded email
- `meeting` — Meeting notes or transcript
- `call` — Phone/video call notes
- `slack` — Slack conversation
- `linkedin` — LinkedIn messages

Examples:
- `2026-02-03-email-initial-inquiry.md`
- `2026-02-05-meeting-discovery-call.md`
- `2026-02-07-email-sarah-tech-questions.md`

### Intelligence Files

Fixed names for consistency:
- `pain-points.json` — Extracted pain points
- `budget-timeline.json` — Budget and timeline signals
- `ai-maturity.json` — AI readiness assessment
- `competitive-landscape.json` — Competitive intelligence
- `technical-requirements.json` — Technical needs

### Assets

Descriptive names:
- `executive-one-pager.md` — C-level summary
- `roi-calculator.md` — ROI analysis
- `competitive-comparison.md` — vs. alternatives
- `{industry}-case-study.md` — Relevant case study

## Company Slug Rules

1. **Lowercase** — Always lowercase
2. **Hyphens** — Use hyphens for spaces
3. **No special chars** — Remove punctuation
4. **Keep it short** — Use common name, not legal name
5. **Unique** — Must be unique across all deals

Examples:
| Company Name | Slug |
|--------------|------|
| ShopCo Inc. | `shopco` |
| Big Bank Corporation | `big-bank` |
| Retail Mart, LLC | `retail-mart` |
| Johnson & Johnson | `johnson-johnson` |
| 3M Company | `3m` |

## deal.json Schema

```json
{
  "id": "string (uuid)",
  "companySlug": "string",
  "companyName": "string",
  "stage": "lead | target | discovery | contracting | production | closed-won | closed-lost",
  "source": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date",

  "contacts": [
    {
      "name": "string",
      "title": "string",
      "email": "string",
      "phone": "string (optional)",
      "role": "primary | secondary",
      "addedAt": "ISO 8601 date"
    }
  ],

  "properties": {
    "industry": "string | null",
    "companySize": "string | null",
    "website": "string | null",
    "initialInterest": "string",
    "referrer": "string | null",
    "estimatedValue": "number | null"
  },

  "scores": {
    "dealConfidence": "number 0-100 | null",
    "aiReadiness": "number 0-100 | null",
    "championStrength": "weak | moderate | strong | executive-sponsor | null",
    "useCaseClarity": "exploring | defined | scoped | null",
    "technicalComplexity": "low | medium | high | null",
    "competitiveThreat": "none | low | medium | high | null"
  },

  "timeline": {
    "decisionTimeline": "immediate | this-quarter | next-quarter | long-term | unknown | null",
    "budgetRange": "<100k | 100k-500k | 500k-1m | 1m+ | unknown | null",
    "targetCloseDate": "ISO 8601 date | null"
  },

  "painPoints": [
    {
      "category": "string",
      "description": "string",
      "severity": "low | medium | high",
      "extractedFrom": "string (communication ref)"
    }
  ],

  "stageHistory": [
    {
      "stage": "string",
      "enteredAt": "ISO 8601 date",
      "exitedAt": "ISO 8601 date | null",
      "exitReason": "string | null"
    }
  ],

  "lastMeaningfulInteraction": "ISO 8601 date | null",
  "daysInCurrentStage": "number"
}
```

## stakeholders.json Schema

```json
{
  "updatedAt": "ISO 8601 date",
  "stakeholders": [
    {
      "id": "string (uuid)",
      "name": "string",
      "title": "string",
      "email": "string",
      "role": "champion | decision-maker | influencer | blocker | evaluator",
      "sentiment": "supportive | neutral | skeptical | unknown",
      "authority": "budget | technical | executive | none",
      "lastInteraction": "ISO 8601 date | null",
      "keyQuotes": [
        {
          "quote": "string",
          "source": "string (communication ref)",
          "date": "ISO 8601 date"
        }
      ],
      "concerns": ["string"],
      "notes": "string"
    }
  ]
}
```

## DEAL.md Template

```markdown
# {Company Name}

> {One-line opportunity description}

## Quick Facts

| Field | Value |
|-------|-------|
| Stage | {stage} |
| Deal Confidence | {score}% |
| Primary Contact | {name}, {title} |
| Source | {source} |
| Created | {date} |
| Last Interaction | {date} |
| Days in Stage | {days} |

## Scores

| Metric | Value |
|--------|-------|
| AI Readiness | {score}/100 |
| Champion Strength | {level} |
| Use Case Clarity | {level} |
| Technical Complexity | {level} |
| Competitive Threat | {level} |

## Pain Points

{Bulleted list of identified pain points}

## Stakeholder Map

| Name | Title | Role | Sentiment |
|------|-------|------|-----------|
| {name} | {title} | {role} | {sentiment} |

## Timeline

- **Decision Timeline:** {timeline}
- **Budget Range:** {range}
- **Target Close:** {date}

## Current Risks

{List of identified risks}

## Next Best Actions

1. {Action 1} — {reason}
2. {Action 2} — {reason}
3. {Action 3} — {reason}

## Communication Log

| Date | Type | Summary |
|------|------|---------|
| {date} | {type} | {summary} |

---

*Last updated: {date}*
```

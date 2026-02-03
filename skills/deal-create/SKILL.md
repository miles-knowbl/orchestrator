---
name: deal-create
description: "Initialize a new deal with basic information. Creates the deal directory structure, captures initial contact info, company details, and source. Sets initial stage to Lead."
phase: INIT
category: sales
version: "1.0.0"
depends_on: []
tags: [sales, deal-management, data-capture, knopilot]
---

# Deal Create

Initialize a new deal and create the tracking structure.

## When to Use

- **New lead identified** — Contact came through inbound, outbound, or referral
- **Starting pipeline tracking** — Need to formalize a prospect
- **After initial interest signal** — Form fill, referral, event meeting
- When you say: "create a deal for", "add this prospect", "track this lead"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `deal-structure.md` | Standard deal directory and file structure |
| `stage-definitions.md` | Pipeline stage entry/exit criteria |

**Verification:** Ensure deal follows standard structure from references.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| DEAL.md | `deals/{company-slug}/DEAL.md` | Always |
| deal.json | `deals/{company-slug}/deal.json` | Always |

## Core Concept

Deal Create answers: **"How do I start tracking this prospect?"**

A good deal initialization:
- **Captures essentials** — Company, contact, source, initial interest
- **Sets correct stage** — Lead (default) with entry criteria met
- **Creates structure** — Directory ready for communications, intelligence, assets
- **Is actionable** — Ready for next skill (lead-research)

## The Deal Creation Process

```
┌─────────────────────────────────────────────────────────┐
│              DEAL CREATION PROCESS                      │
│                                                         │
│  1. GATHER BASIC INFO                                   │
│     └─→ Company name, contact, source                   │
│                                                         │
│  2. CREATE DEAL DIRECTORY                               │
│     └─→ deals/{company-slug}/                           │
│                                                         │
│  3. WRITE DEAL.md                                       │
│     └─→ Human-readable summary                          │
│                                                         │
│  4. WRITE deal.json                                     │
│     └─→ Structured data for scoring/tracking            │
│                                                         │
│  5. CREATE SUBDIRECTORIES                               │
│     └─→ communications/, intelligence/, assets/         │
│                                                         │
│  6. SET INITIAL STAGE                                   │
│     └─→ Lead (unless qualification already done)        │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Gather Basic Info

Collect the minimum information needed to create a deal:

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| Company Name | Legal or common name | "ShopCo Inc." |
| Primary Contact | Name and title | "Sarah Chen, VP Customer Experience" |
| Contact Email | Primary email | "sarah@shopco.com" |
| Source | How the lead came in | "Inbound - Website form" |
| Initial Interest | What they're interested in | "AI chat for customer support" |

### Optional Fields (capture if available)

| Field | Description |
|-------|-------------|
| Company Size | Employee count or revenue range |
| Industry | Vertical/sector |
| Website | Company URL |
| Referrer | Who referred them (if referral) |
| Initial Notes | Any context from first contact |

## Step 2: Create Deal Directory

```
deals/
  {company-slug}/           # e.g., shopco
    DEAL.md                 # Human-readable summary
    deal.json               # Structured deal data
    stakeholders.json       # Stakeholder map (initially empty)
    communications/         # For captured emails, notes
    intelligence/           # For extracted insights
    assets/                 # For champion enablement materials
    actions/                # For NBA history
```

### Company Slug Convention

- Lowercase
- Hyphens for spaces
- No special characters
- Examples: `shopco`, `big-bank`, `retail-mart-inc`

## Step 3: Write DEAL.md

Human-readable deal summary:

```markdown
# {Company Name}

> {One-line description of the opportunity}

## Quick Facts

| Field | Value |
|-------|-------|
| Stage | Lead |
| Primary Contact | {Name}, {Title} |
| Source | {Source} |
| Created | {Date} |
| Deal Confidence | -- (not yet scored) |

## Initial Interest

{What they're interested in, why they reached out}

## Company Context

{Any initial research or context about the company}

## Next Actions

- [ ] Run `lead-research` to gather company intelligence
- [ ] Identify potential champion
- [ ] Craft personalized outreach

---

*Last updated: {Date}*
```

## Step 4: Write deal.json

Structured deal data for scoring and automation:

```json
{
  "id": "{uuid}",
  "companySlug": "{company-slug}",
  "companyName": "{Company Name}",
  "stage": "lead",
  "source": "{source}",
  "createdAt": "{ISO date}",
  "updatedAt": "{ISO date}",

  "contacts": [
    {
      "name": "{Name}",
      "title": "{Title}",
      "email": "{email}",
      "role": "primary",
      "addedAt": "{ISO date}"
    }
  ],

  "properties": {
    "industry": null,
    "companySize": null,
    "website": null,
    "initialInterest": "{description}",
    "referrer": null
  },

  "scores": {
    "dealConfidence": null,
    "aiReadiness": null,
    "championStrength": null,
    "useCaseClarity": null
  },

  "timeline": {
    "decisionTimeline": null,
    "budgetRange": null
  },

  "stageHistory": [
    {
      "stage": "lead",
      "enteredAt": "{ISO date}",
      "exitedAt": null,
      "exitReason": null
    }
  ]
}
```

## Step 5: Create Subdirectories

Create empty directories for future content:

- `communications/` — Will hold captured emails, meeting notes
- `intelligence/` — Will hold extracted insights (pain points, etc.)
- `assets/` — Will hold champion enablement materials
- `actions/` — Will hold NBA history and action logs

## Step 6: Set Initial Stage

Default stage is **Lead** with these entry criteria met:
- Contact information captured
- Initial interest signal present

If prospect is already further along (e.g., meeting scheduled), you may start at **Target** stage instead.

## Output Format

After creating the deal, output:

```
✓ Deal created: {company-name}

  Location: deals/{company-slug}/
  Stage: Lead
  Contact: {name} ({email})
  Source: {source}

  Next recommended action:
  → Run lead-research to gather company intelligence
```

## Quality Checklist

Before completing deal creation:

- [ ] Company slug is clean and consistent
- [ ] DEAL.md is human-readable and complete
- [ ] deal.json has valid structure
- [ ] All required directories exist
- [ ] Stage is appropriate for current state
- [ ] Next action is clear

## Common Patterns

### Inbound Lead

```
Source: "Inbound - Website form"
Initial Interest: From form submission
Stage: Lead
Next: lead-research → personalized outreach
```

### Referral

```
Source: "Referral - {Referrer Name}"
Initial Interest: From referrer context
Stage: Lead or Target (if meeting already scheduled)
Next: lead-research → warm outreach mentioning referrer
```

### Event/Conference

```
Source: "Event - {Event Name}"
Initial Interest: From conversation notes
Stage: Lead
Next: lead-research → follow-up referencing event
```

## Anti-Patterns

- **Creating without contact info** — Need at least one contact to be actionable
- **Skipping deal.json** — Structured data needed for scoring
- **Wrong stage** — Don't start at Discovery if no discovery call happened
- **Duplicate deals** — Check if company already exists first

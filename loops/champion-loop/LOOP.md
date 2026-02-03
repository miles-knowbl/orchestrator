# Champion Loop

Focus on champion assessment and enablement.

## When to Use

- Champion needs to sell internally
- Preparing for internal reviews
- Champion seems weak or going cold
- Deal stalled — need champion action
- Before critical stakeholder meetings

## What It Does

Focuses entirely on champion:
1. Assesses champion strength
2. Identifies gaps in advocacy
3. Determines what champion needs
4. Creates enablement materials
5. Plans champion engagement

## Phases

### ASSESS: Assess Champion
Evaluate current champion strength.
- Seniority score
- Engagement level
- Authority assessment
- Advocacy behaviors
- Sentiment and trend

**Gate:** Champion Strength Gate
- Champion identified
- Strength > 30 or remediation plan

### IDENTIFY: Identify Needs
What does champion need to succeed?
- Internal objections to address
- Materials needed for internal selling
- Access or introductions needed
- Risk factors to mitigate

### ENABLE: Enable Champion
Create tailored enablement materials.
- ROI model (for finance stakeholders)
- Executive one-pager (for executives)
- Objection responses (for skeptics)
- Business case (for committee)

### COMPLETE: Complete
Plan engagement with champion.
- Delivery plan for materials
- Follow-up cadence
- Success metrics

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Deal ID | Yes | Which deal |
| Champion | Yes | Who is the champion |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Champion assessment | intelligence/champion-assessment.json | Strength analysis |
| Enablement assets | assets/ | Materials created |
| Engagement plan | actions/ | How to engage |

## Example

```
/champion-loop

Deal: shopco
Champion: Sarah Chen (VP Customer Experience)

═══════════════════════════════════════════
  ASSESS PHASE
═══════════════════════════════════════════

→ Assessing champion strength...

  CHAMPION: Sarah Chen
  OVERALL SCORE: 80/100 (Strong)

  Components:
  ┌─────────────────────────────────┐
  │ Seniority      │ 85  │ █████ │
  │ Engagement     │ 90  │ █████ │
  │ Authority      │ 70  │ ████░ │
  │ Advocacy       │ 75  │ ████░ │
  └─────────────────────────────────┘

  STRENGTHS:
  ✓ VP level with CEO access
  ✓ Very responsive (hours not days)
  ✓ Budget authority for CX

  GAPS:
  ⚠️ No technical authority (needs CTO)
  ⚠️ CFO peer skeptical

[Champion Strength Gate]
  ✓ Champion identified: Sarah Chen
  ✓ Strength 80 > 30
  → PASSED

═══════════════════════════════════════════
  IDENTIFY PHASE
═══════════════════════════════════════════

→ Identifying champion needs...

  INTERNAL BLOCKERS:
  1. CFO (Lisa) skeptical on ROI
  2. CTO (Michael) not engaged

  WHAT SARAH NEEDS:
  1. ROI model to address CFO concerns
  2. Introduction strategy to engage CTO
  3. Talking points for executive team

═══════════════════════════════════════════
  ENABLE PHASE
═══════════════════════════════════════════

→ Creating enablement materials...

  Created: ROI Model for CFO
  ├─ Their numbers: 15K tickets, $12/ticket
  ├─ Projected savings: $648K/year
  ├─ ROI: 162%
  └─ Saved: assets/shopco-roi-model.md

  Created: Executive One-Pager
  ├─ Pain: 300% ticket increase
  ├─ Solution: AI support automation
  └─ Saved: assets/shopco-exec-summary.md

═══════════════════════════════════════════
  COMPLETE PHASE
═══════════════════════════════════════════

→ Planning champion engagement...

  DELIVERY PLAN:
  1. Send ROI model to Sarah tomorrow
  2. Offer to walk through if helpful
  3. Ask Sarah to share with Lisa (CFO)
  4. Request CTO introduction

  FOLLOW-UP:
  - Check in after CFO review (3 days)
  - Track if materials were shared
  - Monitor Sarah's sentiment

✓ Champion loop complete

  Champion: Sarah Chen (Strong, 80/100)
  Created: 2 enablement assets
  Next: Deliver ROI model, request CTO intro
```

## Related Loops

- **deal-review-loop** — Full deal assessment
- **intelligence-loop** — Update intelligence after champion feedback
- **discovery-loop** — Prep for meetings with new stakeholders

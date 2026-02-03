# Deal Review Loop

Comprehensive review of a single deal with strategic recommendations.

## When to Use

- Weekly deal review
- Before major meetings
- When deal seems stuck
- Before proposal/contract
- When asked "how's this deal going?"

## What It Does

Provides complete deal assessment:
1. Reviews all intelligence
2. Calculates fresh scores
3. Assesses champion strength
4. Evaluates use case clarity
5. Identifies and assesses risks
6. Generates strategic recommendations

## Phases

### GATHER: Gather Context
Review everything about the deal.
- All communications
- Current intelligence
- Stakeholder map
- Recent activity

### SCORE: Score Deal
Calculate comprehensive scores.
- AI Readiness score
- Deal Confidence score
- Champion Strength score
- Use Case Clarity score
- Overall Deal Health

**Gate:** Deal Health Gate
- Health > 40 to continue actively
- Critical risks flagged
- Qualification check

### ASSESS: Assess Risks
Identify what could go wrong.
- Champion risks
- Competition risks
- Budget risks
- Timeline risks
- Technical risks
- Organizational risks

### COMPLETE: Complete
Generate strategic recommendations.
- Prioritized next actions
- Risk mitigation strategies
- Key insights summary

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Deal ID | Yes | Which deal to review |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Score summary | deal.json | All updated scores |
| Risk assessment | intelligence/risk-assessment.json | Identified risks |
| Review summary | reviews/review-{date}.md | Full review |
| Next actions | actions/ | Recommended actions |

## Example

```
/deal-review-loop

Deal: shopco

═══════════════════════════════════════════
  GATHER PHASE
═══════════════════════════════════════════

→ Gathering deal context...
  Communications: 5 captured
  Stakeholders: 3 mapped
  Last activity: 2 days ago
  Days in stage: 12 (Discovery)

═══════════════════════════════════════════
  SCORE PHASE
═══════════════════════════════════════════

→ Calculating scores...

  DEAL HEALTH: 78/100 (Good)

  Component Scores:
  ┌─────────────────────────────────┐
  │ AI Readiness      │ 65  │ ████░ │
  │ Deal Confidence   │ 82  │ █████ │
  │ Champion Strength │ 85  │ █████ │
  │ Use Case Clarity  │ 78  │ ████░ │
  └─────────────────────────────────┘

  Trend: Improving (+6 from last week)

[Deal Health Gate]
  ✓ Health 78 > 40
  ⚠️ 2 risks identified
  → PASSED (continue actively)

═══════════════════════════════════════════
  ASSESS PHASE
═══════════════════════════════════════════

→ Assessing risks...

  CRITICAL: CFO skeptical on ROI
    Likelihood: High | Impact: High
    Mitigation: Build ROI model with champion

  HIGH: Single champion (no backup)
    Likelihood: Medium | Impact: High
    Mitigation: Build relationships with CTO team

  MEDIUM: CTO technical concerns
    Likelihood: Medium | Impact: Medium
    Mitigation: Send integration documentation

═══════════════════════════════════════════
  COMPLETE PHASE
═══════════════════════════════════════════

→ Generating recommendations...

  STRATEGIC ASSESSMENT:
  ShopCo is a strong deal (78 health) with good
  momentum. Key risk is CFO skepticism on ROI.
  Champion is strong but sole advocate.

  TOP ACTIONS:
  1. Build ROI model for CFO presentation (87)
  2. Request CTO introduction (78)
  3. Send integration docs to Michael (72)

  KEY INSIGHT:
  Budget and timeline are solid. Win this by
  proving ROI to CFO and getting CTO aligned.

✓ Deal review complete
```

## Related Loops

- **intelligence-loop** — Update intelligence first
- **champion-loop** — Deep dive on champion
- **pipeline-loop** — Review across all deals

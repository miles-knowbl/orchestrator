# Deal Intake Loop

Standardized process for bringing new deals into the pipeline.

## When to Use

- New lead identified
- Inbound inquiry received
- Referral introduction
- Conference lead
- Any new potential deal

## What It Does

Takes a new lead and:
1. Creates proper deal structure
2. Researches the company and fit
3. Captures any existing communications
4. Adds known stakeholders
5. Recommends first actions

## Phases

### INIT: Initialize
Set up deal with proper file structure.
- Creates deal directory
- Generates deal.json with initial data
- Creates DEAL.md summary

### RESEARCH: Research
Research the lead and assess AI fit.
- Company background
- Likely pain points
- AI fit scoring
- Stakeholder identification
- Personalization angles

**Gate:** Qualification Gate
- AI fit score > 40
- Champion potential identified
- No disqualifying factors

### CAPTURE: Capture Intelligence
Capture any existing communications.
- Import email threads
- Add meeting notes
- Document stakeholders

### COMPLETE: Complete
Finalize and recommend next actions.
- Generate next best actions
- Set up for pipeline tracking

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Company name | Yes | The company/lead name |
| Website | Yes | Company website |
| Source | Yes | How we found this lead |
| Initial contact | No | First person contacted |
| Communications | No | Any existing emails/notes |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Deal structure | deals/{slug}/ | Full deal directory |
| deal.json | deals/{slug}/deal.json | Deal data |
| DEAL.md | deals/{slug}/DEAL.md | Human-readable summary |
| research.json | deals/{slug}/research.json | Research findings |
| stakeholders.json | deals/{slug}/stakeholders.json | Initial stakeholders |
| NBA | deals/{slug}/actions/ | Next best actions |

## Example

```
/deal-intake-loop

Company: ShopCo
Website: shopco.com
Source: Inbound demo request
Contact: Sarah Chen, VP Customer Experience

→ Creating deal structure...
→ Researching ShopCo...
  AI Fit: 75/100 (Good)
  Industry: E-commerce (excellent fit)
  Size: 500 employees (ideal)
  Likely pain: Support volume

[Qualification Gate]
  ✓ AI fit > 40: 75
  ✓ Champion potential: Sarah Chen
  ✓ No disqualifying factors
  → PASSED

→ Capturing communications...
→ Adding stakeholder: Sarah Chen

→ Generating next best actions...
  #1: Schedule discovery call (Score: 92)

✓ Deal intake complete
  Deal: shopco
  Stage: Lead
  Fit: 75/100
  Next: Schedule discovery call with Sarah Chen
```

## Related Loops

- **intelligence-loop** — Run after new communications
- **discovery-loop** — Run before/after discovery meetings
- **pipeline-loop** — Weekly pipeline review including this deal

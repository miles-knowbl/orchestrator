# Intelligence Loop

Process communications to extract structured deal intelligence.

## When to Use

- After any significant communication
- New meeting notes to process
- Email thread to parse
- Batch processing multiple communications
- When intelligence needs refresh

## What It Does

Takes communications and:
1. Captures and parses for signals
2. Extracts pain points, budget, timeline
3. Updates stakeholder sentiment
4. Identifies competitive intelligence
5. Assesses AI maturity
6. Recalculates all deal scores
7. Recommends next actions

## Phases

### CAPTURE: Capture
Capture and parse new communications.
- Import communication files
- Parse for signals by category
- Extract raw intelligence

### EXTRACT: Extract Intelligence
Structure the extracted signals.
- Pain points with severity
- Budget and timeline signals
- Stakeholder sentiment updates
- Competitive intelligence
- AI maturity indicators

### SCORE: Update Scores
Recalculate deal health scores.
- Deal scoring (all components)
- Champion strength assessment
- Use case clarity assessment
- Risk assessment

### COMPLETE: Complete
Generate recommendations.
- Next best actions prioritized
- Score impact summary
- Key findings highlighted

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Deal ID | Yes | Which deal to process |
| Communications | Yes | Files to process |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Parsed signals | intelligence/ | Raw extracted signals |
| pain-points.json | intelligence/ | Structured pain points |
| budget-timeline.json | intelligence/ | Budget and timeline |
| stakeholders.json | deals/{slug}/ | Updated sentiments |
| competitive-intel.json | intelligence/ | Competitive data |
| ai-maturity.json | intelligence/ | AI readiness |
| deal.json | deals/{slug}/ | Updated scores |
| NBA | actions/ | Next best actions |

## Example

```
/intelligence-loop

Deal: shopco
Communications:
  - 2026-02-03-meeting-discovery.md
  - 2026-02-04-email-followup.md

→ Capturing communications...
→ Parsing for signals...
  Found: 3 pain points, 2 budget signals, 1 timeline signal

→ Extracting intelligence...
  Pain Points:
    [HIGH] Volume: 300% ticket increase
    [MEDIUM] Response time: 6 hours average
  Budget: $200-400K (explicit, approved)
  Timeline: June 30 (hard deadline)

→ Updating stakeholder sentiment...
  Sarah Chen: Neutral → Supportive ↑
  Michael Torres: Unknown → Neutral

→ Assessing AI maturity...
  Level: Exploring (no prior AI)
  Readiness: 65/100

→ Updating scores...
  Deal Health: 72 → 78 (+6)
  Deal Confidence: 68 → 82 (+14)
  Champion Strength: 75 → 85 (+10)

→ Generating next best actions...
  #1: Build ROI model for CFO (87)
  #2: Request CTO introduction (78)

✓ Intelligence extraction complete
  Key Finding: Budget and timeline confirmed
  Score Impact: +6 Deal Health
  Top Risk: CFO skeptical on ROI
```

## Related Loops

- **discovery-loop** — Run before/after discovery meetings
- **deal-review-loop** — Full deal review with this intelligence
- **champion-loop** — Focus on champion enablement

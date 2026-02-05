# Discovery Loop

Complete discovery meeting workflow from prep to debrief.

## When to Use

- Before any discovery meeting
- After discovery meetings (debrief)
- Technical deep-dives
- Stakeholder introductions
- Any significant customer meeting

## What It Does

Before meeting:
1. Reviews all deal context
2. Identifies gaps to fill
3. Sets meeting objectives
4. Prepares questions
5. Creates agenda

After meeting:
6. Captures meeting notes
7. Debriefs immediately
8. Extracts intelligence
9. Updates deal scores
10. Generates follow-up actions

## Phases

### PREP: Prepare
Prepare thoroughly for the meeting.
- Review all deal intelligence
- Identify what we don't know
- Set MUST/SHOULD/NICE objectives
- Prepare prioritized questions
- Research attendees
- Create agenda

**Gate:** Meeting Readiness
- Objectives defined
- Questions prepared
- Attendee research complete

### MEETING: Meeting
Capture during/after meeting.
- Take structured notes
- Capture key quotes
- Note attendee reactions
- Document commitments

### DEBRIEF: Debrief
Process immediately after meeting.
- Capture while fresh
- Assess objective achievement
- Extract key insights
- Evaluate deal progression

### UPDATE: Update
Update deal intelligence.
- Extract pain points
- Update budget/timeline
- Update stakeholder sentiments
- Recalculate scores

### COMPLETE: Complete
Generate follow-up.
- Next best actions
- Follow-up email draft
- Action items with owners

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Deal ID | Yes | Which deal |
| Meeting date/time | Yes | When is the meeting |
| Attendees | Yes | Who will be there |
| Meeting purpose | Yes | Discovery, technical, etc. |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Prep document | meetings/prep-{date}.md | Meeting preparation |
| Meeting notes | communications/ | Captured notes |
| Debrief | meetings/debrief-{date}.md | Post-meeting analysis |
| Updated intelligence | intelligence/ | Extracted signals |
| Updated scores | deal.json | New scores |
| Follow-up actions | actions/ | Next steps |

## Example

```
/discovery-loop

Deal: shopco
Meeting: Feb 5, 2026 at 2:00 PM
Attendees: Sarah Chen (VP CX), Michael Torres (CTO)
Purpose: Technical discovery

═══════════════════════════════════════════
  PREP PHASE
═══════════════════════════════════════════

→ Reviewing deal context...
→ Identifying gaps...
  Missing: Technical stack, CTO concerns, success metrics

→ Setting objectives...
  MUST: Technical environment, CTO concerns
  SHOULD: Success metrics, decision process
  NICE: Competitive landscape

→ Preparing questions...
  [12 questions prioritized]

→ Creating agenda...

[Meeting Readiness Gate]
  ✓ Objectives: 5 defined
  ✓ Questions: 12 prepared
  ✓ Attendees: 2 researched
  → PASSED

═══════════════════════════════════════════
  MEETING PHASE
═══════════════════════════════════════════

[Meeting happens]

→ Capture meeting notes when ready...

═══════════════════════════════════════════
  DEBRIEF PHASE
═══════════════════════════════════════════

→ Processing debrief...
  Objectives: 5/5 achieved ✓
  Key insight: CTO engaged but cautious
  Progression: Significant advancement

→ Updating intelligence...
  New pain: Response time degraded
  Budget confirmed: $200-400K
  Timeline confirmed: June 30

→ Updating scores...
  Deal Health: 72 → 78

→ Generating actions...
  #1: Send integration docs to Michael
  #2: Schedule follow-up meeting
  #3: Draft follow-up email

✓ Discovery loop complete
```

## Related Loops

- **intelligence-loop** — For processing communications
- **deal-review-loop** — Full deal review
- **champion-loop** — Champion enablement after discovery

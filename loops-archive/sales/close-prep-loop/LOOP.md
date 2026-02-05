# Close Prep Loop

Prepare deals for close through pilot and contract.

## When to Use

- Deal ready for proposal
- Moving to pilot/production stage
- Contract negotiations
- Final push to signature
- "How do I close this deal?"

## What It Does

Guides deal to close:
1. Assesses close readiness
2. Identifies remaining blockers
3. Scopes pilot if needed
4. Tracks contract progress
5. Generates close actions

## Phases

### ASSESS: Close Readiness
Verify deal is ready for close.
- Deal health score
- Risk assessment
- Champion confirmation
- Stakeholder alignment
- Technical validation status

**Gate:** Close Readiness Gate
- Deal Health > 70
- No critical unresolved risks
- Champion confirmed

### SCOPE: Scope Pilot
Define pilot parameters (if applicable).
- Objectives
- Scope boundaries
- Success criteria
- Timeline and phases
- Resource commitments

### CONTRACT: Contract Support
Track contracting progress.
- Proposal/contract status
- Open issues
- Redline management
- Approval tracking
- Timeline to signature

### COMPLETE: Complete
Generate close actions.
- Final blockers to address
- Actions to accelerate
- Signature timeline

## Inputs

| Input | Required | Description |
|-------|----------|-------------|
| Deal ID | Yes | Which deal |
| Stage | Yes | Production or Contracting |

## Outputs

| Output | Location | Description |
|--------|----------|-------------|
| Readiness assessment | reviews/ | Close readiness |
| Pilot scope | pilot/pilot-scope.md | Pilot parameters |
| Contract tracker | contracting/contract-tracker.json | Contract status |
| Close plan | actions/ | Actions to close |

## Example

```
/close-prep-loop

Deal: shopco
Stage: Moving to Production (pilot)

═══════════════════════════════════════════
  ASSESS PHASE
═══════════════════════════════════════════

→ Assessing close readiness...

  DEAL HEALTH: 78/100 (Good)

  CLOSE CHECKLIST:
  ✓ Champion confirmed (Sarah Chen)
  ✓ Budget approved ($200-400K)
  ✓ Timeline confirmed (June 30)
  ✓ Use case defined
  ⚠️ CTO alignment (Michael is neutral)
  ⚠️ CFO ROI concerns

  RISKS:
  • CFO still skeptical — ROI model sent, awaiting feedback
  • CTO not fully committed — follow-up needed

[Close Readiness Gate]
  ✓ Deal Health 78 > 70
  ⚠️ 2 medium risks (non-critical)
  ✓ Champion confirmed
  → PASSED (with conditions)

═══════════════════════════════════════════
  SCOPE PHASE
═══════════════════════════════════════════

→ Scoping pilot...

  PILOT OVERVIEW:
  Duration: 4 weeks (Feb 15 - Mar 15)
  Traffic: 20% of chat volume
  Use cases: Returns, exchanges, order status

  SUCCESS CRITERIA:
  MUST ACHIEVE:
  □ Automation rate >30%
  □ Accuracy >90%
  □ CSAT no decrease
  □ Escalation <20%

  TIMELINE:
  Week 1: Setup
  Week 2: Soft launch (10%)
  Week 3-4: Expanded (20%)
  Decision: March 22

═══════════════════════════════════════════
  CONTRACT PHASE
═══════════════════════════════════════════

→ Contract status...

  STATUS: Proposal Sent
  Sent: February 10, 2026
  Target Sign: February 28, 2026

  OPEN ITEMS:
  • Awaiting legal review
  • No redlines yet

  APPROVALS:
  ✓ Sarah Chen (Business)
  ○ Legal (Pending)
  ○ Lisa Park/CFO (Pending)

═══════════════════════════════════════════
  COMPLETE PHASE
═══════════════════════════════════════════

→ Generating close plan...

  CLOSE ACTIONS:

  IMMEDIATE:
  1. Follow up with Sarah on legal timeline
  2. Check if CFO reviewed ROI model
  3. Confirm pilot kickoff resources

  THIS WEEK:
  4. Address any redlines quickly
  5. Get CTO final confirmation
  6. Finalize pilot team

  TIMELINE TO CLOSE:
  Legal review: ~5 days
  Redlines: ~3 days
  Signature: Feb 28 (target)
  Pilot start: Feb 15

✓ Close prep complete

  Readiness: 78/100 (Good, with conditions)
  Pilot: Scoped (4 weeks, 20% traffic)
  Contract: In legal review
  Target close: February 28
```

## Related Loops

- **deal-review-loop** — Full deal assessment
- **champion-loop** — Ensure champion is enabled
- **intelligence-loop** — Update with any new info

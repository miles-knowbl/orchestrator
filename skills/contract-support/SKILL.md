---
name: contract-support
description: "Support contracting phase by tracking negotiations, managing redlines, preparing for legal review, and ensuring smooth progression from agreement to signature."
phase: IMPLEMENT
category: sales
version: "1.0.0"
depends_on: ["deal-scoring", "risk-assessment"]
tags: [sales, stage-specific, contracting, negotiations, knopilot]
---

# Contract Support

Support the contracting phase from proposal to signature.

## When to Use

- **Proposal sent** — Track proposal status
- **Negotiations active** — Manage redlines and terms
- **Legal review** — Prepare and track
- When you say: "contract status", "where are we on the deal", "tracking negotiations"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `negotiation-tracking.md` | How to track negotiations |
| `common-objections.md` | Standard contract objections |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Contract tracker | `deals/{slug}/contracting/contract-tracker.json` | Always |
| Updated DEAL.md | `deals/{slug}/DEAL.md` | Contracting status |

## Core Concept

Contract Support answers: **"Where are we in contracting and what's blocking signature?"**

Good contract support:
- **Tracks status** — Where is the contract?
- **Manages issues** — What terms need resolution?
- **Anticipates blockers** — What might stall signature?
- **Maintains momentum** — Keeps process moving

## The Support Process

```
┌─────────────────────────────────────────────────────────┐
│            CONTRACT SUPPORT PROCESS                     │
│                                                         │
│  1. TRACK CONTRACT STATUS                               │
│     └─→ Where is it in their process?                   │
│                                                         │
│  2. IDENTIFY OPEN ISSUES                                │
│     └─→ What terms need resolution?                     │
│                                                         │
│  3. MANAGE REDLINES                                     │
│     └─→ Track back-and-forth on terms                   │
│                                                         │
│  4. ANTICIPATE BLOCKERS                                 │
│     └─→ Legal, procurement, executive                   │
│                                                         │
│  5. DRIVE TO CLOSE                                      │
│     └─→ Actions to accelerate signature                 │
└─────────────────────────────────────────────────────────┘
```

## contract-tracker.json Format

```json
{
  "updatedAt": "2026-02-03T15:00:00Z",
  "dealId": "shopco",
  "contractStatus": {
    "status": "in-review",
    "substatus": "legal-review",
    "proposalSentDate": "2026-02-01",
    "targetSignDate": "2026-02-15",
    "currentHolder": "ShopCo Legal",
    "daysSinceProposal": 12
  },
  "timeline": [
    {
      "date": "2026-02-01",
      "event": "Proposal sent",
      "notes": "Full proposal with pricing sent to Sarah"
    },
    {
      "date": "2026-02-03",
      "event": "Verbal acceptance",
      "notes": "Sarah confirmed acceptance, sending to legal"
    },
    {
      "date": "2026-02-05",
      "event": "Legal review started",
      "notes": "Contract with ShopCo legal team"
    },
    {
      "date": "2026-02-08",
      "event": "Redlines received",
      "notes": "3 redlines from legal"
    }
  ],
  "openIssues": [
    {
      "id": "ISSUE-001",
      "type": "legal",
      "issue": "Liability cap",
      "theirPosition": "Cap at contract value",
      "ourPosition": "Standard 2x contract value",
      "status": "negotiating",
      "priority": "high",
      "owner": "Our legal",
      "notes": "Common negotiation, likely to meet in middle"
    },
    {
      "id": "ISSUE-002",
      "type": "legal",
      "issue": "Indemnification scope",
      "theirPosition": "Broader indemnification",
      "ourPosition": "Standard indemnification",
      "status": "proposed-resolution",
      "priority": "medium",
      "owner": "Our legal",
      "notes": "Proposed compromise language"
    },
    {
      "id": "ISSUE-003",
      "type": "business",
      "issue": "Payment terms",
      "theirPosition": "Net 60",
      "ourPosition": "Net 30",
      "status": "agreed",
      "priority": "low",
      "owner": null,
      "notes": "Agreed to Net 45"
    }
  ],
  "approvals": {
    "theirSide": [
      {
        "approver": "Sarah Chen",
        "role": "Business",
        "status": "approved",
        "date": "2026-02-03"
      },
      {
        "approver": "Legal team",
        "role": "Legal",
        "status": "in-review",
        "date": null
      },
      {
        "approver": "Lisa Park",
        "role": "Finance/CFO",
        "status": "pending",
        "date": null
      }
    ],
    "ourSide": [
      {
        "approver": "Sales leadership",
        "role": "Deal approval",
        "status": "approved",
        "date": "2026-02-01"
      },
      {
        "approver": "Legal",
        "role": "Contract terms",
        "status": "in-review",
        "date": null
      }
    ]
  },
  "blockers": [
    {
      "blocker": "Legal review taking longer than expected",
      "impact": "May miss Feb 15 target",
      "mitigation": "Escalate to Sarah to push legal",
      "status": "monitoring"
    }
  ],
  "nextActions": [
    {
      "action": "Respond to liability cap redline",
      "owner": "Our legal",
      "due": "2026-02-10",
      "status": "in-progress"
    },
    {
      "action": "Follow up with Sarah on legal ETA",
      "owner": "Sales",
      "due": "2026-02-10",
      "status": "pending"
    }
  ]
}
```

## Contract Statuses

| Status | Description |
|--------|-------------|
| proposal-sent | Proposal delivered, awaiting response |
| verbal-accept | Business acceptance, contracting starts |
| in-review | Contract being reviewed |
| redlines | Received redlines, negotiating |
| final-draft | Terms agreed, final version |
| signature | Awaiting signature |
| signed | Contract executed |

## Output Format

After update:

```
✓ Contract Status: {company}

  STATUS: In Review (Legal Review)
  PROPOSAL SENT: Feb 1 (12 days ago)
  TARGET SIGN: Feb 15 (3 days)
  CURRENT HOLDER: ShopCo Legal

  TIMELINE:
    Feb 1:  Proposal sent
    Feb 3:  Verbal acceptance ✓
    Feb 5:  Legal review started
    Feb 8:  Redlines received

  OPEN ISSUES: 2 remaining

    [HIGH] Liability Cap
      Them: Cap at contract value
      Us: Standard 2x contract value
      Status: Negotiating
      → Our legal responding

    [MEDIUM] Indemnification Scope
      Them: Broader indemnification
      Us: Standard indemnification
      Status: Proposed resolution sent

    [RESOLVED] Payment Terms
      Agreed: Net 45 (compromise)

  APPROVALS:
    ShopCo:
      ✓ Sarah Chen (Business)
      ○ Legal team (In Review)
      ○ Lisa Park/CFO (Pending)

    Us:
      ✓ Sales leadership
      ○ Legal (In Review)

  BLOCKERS:
    ⚠️ Legal review taking longer than expected
       Impact: May miss Feb 15 target
       Mitigation: Escalate to Sarah

  NEXT ACTIONS:
    [Feb 10] Respond to liability cap redline (Our legal)
    [Feb 10] Follow up with Sarah on legal ETA (Sales)

  Files Updated:
    • contracting/contract-tracker.json
    • DEAL.md (contracting section)
```

## Quality Checklist

- [ ] Status accurately reflects current state
- [ ] Timeline captures key events
- [ ] All open issues documented
- [ ] Positions clear for each issue
- [ ] Approvals tracked both sides
- [ ] Blockers identified with mitigations
- [ ] Next actions assigned with dates
- [ ] DEAL.md updated

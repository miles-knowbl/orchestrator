---
name: weekly-focus
description: "Generate weekly focus plan with top priorities, scheduled actions, and success criteria. Creates actionable weekly agenda for sales execution."
phase: ACT
category: sales
version: "1.0.0"
depends_on: ["deal-prioritization", "next-best-action"]
tags: [sales, pipeline, planning, weekly, knopilot]
---

# Weekly Focus

Generate a focused weekly plan for sales execution.

## When to Use

- **Monday morning** — Plan the week
- **Weekly review** — Assess what to focus on
- **Time allocation** — Know where to spend effort
- When you say: "plan my week", "weekly focus", "what should I do this week"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `weekly-structure.md` | How to structure the week |
| `weekly-review.md` | How to conduct weekly review |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Weekly plan | `pipeline/weekly-focus-{date}.md` | Always |
| Action list | `pipeline/weekly-focus-{date}.md` | Always |

## Core Concept

Weekly Focus answers: **"What are the 3-5 things that will make this week successful?"**

Good weekly focus:
- **Prioritized** — Most important first
- **Specific** — Clear actions, not vague goals
- **Achievable** — Realistic for the week
- **Measurable** — Know if you succeeded

## The Planning Process

```
┌─────────────────────────────────────────────────────────┐
│            WEEKLY FOCUS PROCESS                         │
│                                                         │
│  1. REVIEW PIPELINE STATE                               │
│     └─→ Snapshot, priorities, alerts                    │
│                                                         │
│  2. IDENTIFY TOP PRIORITIES                             │
│     └─→ 3-5 most important outcomes                     │
│                                                         │
│  3. MAP TO ACTIONS                                      │
│     └─→ Specific tasks for each priority                │
│                                                         │
│  4. SCHEDULE THE WEEK                                   │
│     └─→ When will each action happen                    │
│                                                         │
│  5. DEFINE SUCCESS                                      │
│     └─→ How will I know if the week was good            │
│                                                         │
│  6. ANTICIPATE BLOCKERS                                 │
│     └─→ What might get in the way                       │
└─────────────────────────────────────────────────────────┘
```

## weekly-focus-{date}.md Format

```markdown
# Weekly Focus: Week of February 3, 2026

## This Week's Priorities

### Priority #1: Close BigTech Contract
**Deal:** BigTech Inc ($350K)
**Objective:** Signed contract
**Actions:**
- [ ] Monday: Follow up on legal redlines
- [ ] Tuesday: Call with their legal if needed
- [ ] Wednesday: Final contract version
- [ ] Friday: Target signature date
**Success:** Contract signed by Friday

### Priority #2: Advance ShopCo to Proposal Stage
**Deal:** ShopCo ($250K)
**Objective:** Technical validation complete, ready for proposal
**Actions:**
- [ ] Monday: Prep for CTO meeting
- [ ] Tuesday: CTO technical deep-dive
- [ ] Wednesday: Debrief and address concerns
- [ ] Thursday: Draft proposal
**Success:** CTO aligned, proposal drafted

### Priority #3: Recover TechStart or Qualify Out
**Deal:** TechStart ($100K)
**Objective:** Decision: recover or disqualify
**Actions:**
- [ ] Monday: Direct call to champion
- [ ] Tuesday: Escalate to executive if no response
- [ ] Wednesday: Decision point
**Success:** Clear path forward or deal closed-lost

## Daily Schedule

### Monday
| Time | Activity | Deal |
|------|----------|------|
| 9:00 | Week planning | All |
| 10:00 | Legal follow-up call | BigTech |
| 11:00 | CTO meeting prep | ShopCo |
| 2:00 | Champion call attempt | TechStart |
| 4:00 | RetailPlus check-in | RetailPlus |

### Tuesday
| Time | Activity | Deal |
|------|----------|------|
| 10:00 | CTO Technical Deep-Dive | ShopCo |
| 2:00 | Legal call (if needed) | BigTech |
| 4:00 | TechStart escalation | TechStart |

### Wednesday
| Time | Activity | Deal |
|------|----------|------|
| 9:00 | ShopCo debrief | ShopCo |
| 11:00 | Final contract review | BigTech |
| 2:00 | TechStart decision | TechStart |
| 4:00 | CloudCo outreach | CloudCo |

### Thursday
| Time | Activity | Deal |
|------|----------|------|
| 10:00 | ShopCo proposal draft | ShopCo |
| 2:00 | ServeCo discovery | ServeCo |
| 4:00 | Lead qualification | Various |

### Friday
| Time | Activity | Deal |
|------|----------|------|
| 10:00 | BigTech signature push | BigTech |
| 2:00 | Weekly review | All |
| 4:00 | Next week planning | All |

## Success Criteria

### Must Achieve
- [ ] BigTech contract signed
- [ ] ShopCo CTO meeting completed
- [ ] TechStart decision made

### Should Achieve
- [ ] ShopCo proposal drafted
- [ ] RetailPlus momentum maintained
- [ ] 2 new leads qualified

### Nice to Have
- [ ] ServeCo discovery complete
- [ ] CloudCo meeting scheduled
- [ ] Pipeline snapshot updated

## Potential Blockers

| Blocker | Mitigation |
|---------|------------|
| BigTech legal delayed | Escalate to Sarah on Tuesday |
| ShopCo CTO cancels | Backup date Wednesday |
| TechStart no response | Qualify out if no contact by Wed |

## Time Allocation

| Tier | Deals | Target Hours |
|------|-------|--------------|
| Focus | BigTech, ShopCo, TechStart | 24 hrs |
| Maintain | RetailPlus, ServeCo | 10 hrs |
| Monitor | CloudCo, FastGrow | 4 hrs |
| Admin/Other | — | 2 hrs |

## Notes
- BigTech: CFO back from travel Monday
- ShopCo: Sarah mentioned CTO is skeptical — prepare extra
- TechStart: Last attempt before qualify out

---
Plan created: Monday, February 3, 2026 at 8:00 AM
```

## Output Format

```
✓ Weekly Focus: Week of {date}

  TOP PRIORITIES:

  ★ #1: CLOSE BIGTECH CONTRACT
     Deal: $350K | Contracting
     Target: Contract signed by Friday
     Actions:
       Mon: Legal follow-up
       Tue: Legal call if needed
       Wed: Final contract version
       Fri: Target signature

  → #2: ADVANCE SHOPCO TO PROPOSAL
     Deal: $250K | Discovery
     Target: CTO aligned, proposal drafted
     Actions:
       Mon: CTO meeting prep
       Tue: CTO technical deep-dive
       Wed: Debrief, address concerns
       Thu: Draft proposal

  ⚠️ #3: RECOVER TECHSTART OR QUALIFY OUT
     Deal: $100K | Lead (at risk)
     Target: Clear decision
     Actions:
       Mon: Champion call
       Tue: Escalate if no response
       Wed: Decision point

  SUCCESS CRITERIA:
    MUST: BigTech signed, ShopCo CTO met, TechStart decided
    SHOULD: ShopCo proposal drafted, RetailPlus maintained

  TIME ALLOCATION:
    Focus (3 deals): 24 hours (60%)
    Maintain (2 deals): 10 hours (25%)
    Monitor (2 deals): 4 hours (10%)
    Admin: 2 hours (5%)

  BLOCKERS TO WATCH:
    • BigTech legal delay → Escalate Tuesday
    • ShopCo CTO cancel → Backup Wednesday

  Files Created:
    • pipeline/weekly-focus-2026-02-03.md
```

## Quality Checklist

- [ ] 3-5 clear priorities
- [ ] Actions specific and scheduled
- [ ] Success criteria defined
- [ ] Daily schedule mapped
- [ ] Time allocation balanced
- [ ] Blockers anticipated
- [ ] Realistic for the week

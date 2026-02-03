---
name: discovery-prep
description: "Prepare for discovery meetings by reviewing all deal intelligence, identifying key questions, setting objectives, and creating meeting agendas tailored to stakeholders."
phase: IMPLEMENT
category: sales
version: "1.0.0"
depends_on: ["deal-create", "stakeholder-add"]
tags: [sales, stage-specific, discovery, preparation, knopilot]
---

# Discovery Prep

Prepare for discovery meetings to maximize value.

## When to Use

- **Before discovery meeting** — Prepare thoroughly
- **Meeting scheduled** — Set objectives and agenda
- **Multiple stakeholders** — Plan for each attendee
- When you say: "prep for meeting", "discovery prep", "what should I ask"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `discovery-questions.md` | Question frameworks |
| `meeting-objectives.md` | How to set meeting goals |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Meeting prep | `deals/{slug}/meetings/prep-{date}.md` | Always |
| Questions list | `deals/{slug}/meetings/prep-{date}.md` | Always |

## Core Concept

Discovery Prep answers: **"What do I need to learn and how will I learn it?"**

Good prep:
- **Reviews context** — All known intelligence
- **Sets objectives** — What must we learn?
- **Plans questions** — How will we get answers?
- **Prepares for stakeholders** — Tailor to each attendee

## The Prep Process

```
┌─────────────────────────────────────────────────────────┐
│              DISCOVERY PREP PROCESS                     │
│                                                         │
│  1. REVIEW DEAL CONTEXT                                 │
│     └─→ All intelligence, communications, stakeholders  │
│                                                         │
│  2. IDENTIFY GAPS                                       │
│     └─→ What don't we know? What's unclear?             │
│                                                         │
│  3. SET MEETING OBJECTIVES                              │
│     └─→ What must we accomplish?                        │
│                                                         │
│  4. PLAN QUESTIONS                                      │
│     └─→ Questions to fill gaps, in priority order       │
│                                                         │
│  5. PREPARE FOR ATTENDEES                               │
│     └─→ What does each stakeholder care about?          │
│                                                         │
│  6. CREATE AGENDA                                       │
│     └─→ Structure the conversation                      │
└─────────────────────────────────────────────────────────┘
```

## prep-{date}.md Format

```markdown
# Discovery Prep: [Company] - [Date]

## Meeting Details
- **Date:** February 5, 2026 at 2:00 PM
- **Duration:** 45 minutes
- **Type:** Discovery Call
- **Attendees:** Sarah Chen (VP CX), Michael Torres (CTO)

## Context Summary

### What We Know
- Company: E-commerce fashion retailer, 500 employees
- Pain: Support ticket volume up 300%, team overwhelmed
- Budget: $200-400K approved
- Timeline: Need live by June (peak season)
- Champion: Sarah Chen (VP CX)

### What We Don't Know
- [ ] Technical stack details (CRM, support tools)
- [ ] Specific use cases beyond returns/exchanges
- [ ] CTO's technical concerns
- [ ] Success metrics they'll use
- [ ] Decision process and other stakeholders

## Meeting Objectives

### Must Accomplish (Required)
1. Confirm use case scope (what interactions to automate)
2. Understand technical environment (integrations needed)
3. Establish success criteria (how they'll measure)

### Should Accomplish (Important)
4. Assess CTO sentiment and concerns
5. Understand decision process
6. Identify any blockers

### Nice to Have
7. Competitive landscape
8. Internal AI experience/capability
9. Timeline for next steps

## Questions by Priority

### High Priority (Must Ask)

**Use Case:**
1. "Can you walk me through a typical support interaction you'd want automated?"
2. "What percentage of your tickets are returns/exchanges vs. other issues?"
3. "What channels do customers use? (chat, email, phone)"

**Technical:**
4. "What support platform are you using today?"
5. "How does your current system integrate with your e-commerce platform?"
6. "Any authentication requirements (SSO)?"

**Success:**
7. "How will you measure if this is successful?"
8. "What's your current ticket volume and resolution time?"

### Medium Priority (Should Ask)

**Decision Process:**
9. "Besides yourselves, who else needs to be involved in this decision?"
10. "What's your evaluation process from here?"

**CTO-Specific:**
11. "Michael, what technical concerns should we address?"
12. "What's your experience with AI implementations?"

### Lower Priority (If Time)

13. "Are you evaluating other solutions?"
14. "Have you tried AI support before?"
15. "What would make this a home run vs. just acceptable?"

## Attendee Preparation

### Sarah Chen (VP Customer Experience) - Champion
**Role:** Champion, budget authority
**Sentiment:** Supportive
**Cares about:** Ticket reduction, team capacity, customer satisfaction
**Watch for:** Her reaction when CTO asks questions

### Michael Torres (CTO) - Decision Maker
**Role:** Technical decision maker
**Sentiment:** Unknown (first meeting)
**Cares about:** Integration, security, scalability, maintenance
**Watch for:** Technical objections, body language, engagement level

## Agenda

| Time | Topic | Lead |
|------|-------|------|
| 0-5 min | Intros, agenda confirm | Us |
| 5-15 min | Their situation deep-dive | Them (we ask) |
| 15-25 min | Technical environment | Michael |
| 25-35 min | Solution overview + Q&A | Us |
| 35-45 min | Next steps, timeline | Both |

## Anticipated Objections

| Objection | Response |
|-----------|----------|
| "Integration seems complex" | "We have Shopify Plus integration ready, typical setup is X weeks" |
| "What about edge cases?" | "AI handles X%, escalates rest to human agents seamlessly" |
| "How do we know it works?" | "Propose pilot with defined metrics before full rollout" |

## Materials to Have Ready
- [ ] Demo environment
- [ ] Integration documentation
- [ ] Similar customer case study
- [ ] Pricing overview (if asked)

## Post-Meeting Action Items
- Capture notes immediately after
- Run discovery-debrief skill
- Send follow-up email within 24 hours
```

## Output Format

After prep:

```
✓ Discovery Prep: {company} - {date}

  MEETING: Feb 5 at 2:00 PM (45 min)
  ATTENDEES:
    • Sarah Chen (VP CX) — Champion, supportive
    • Michael Torres (CTO) — Decision maker, unknown sentiment

  CONTEXT SUMMARY:
    Know: 300% ticket increase, $200-400K budget, June deadline
    Gaps: Technical stack, CTO concerns, success metrics

  OBJECTIVES:
    ★ MUST: Use case scope, technical environment, success criteria
    → SHOULD: CTO sentiment, decision process, blockers
    ○ NICE: Competitive landscape, AI experience

  KEY QUESTIONS:

    Use Case:
    1. "Walk me through a typical support interaction to automate"
    2. "What % are returns/exchanges vs other?"
    3. "What channels do customers use?"

    Technical:
    4. "What support platform today?"
    5. "How does it integrate with e-commerce?"
    6. "Authentication requirements?"

    Success:
    7. "How will you measure success?"
    8. "Current volume and resolution time?"

  ATTENDEE PREP:
    Sarah (Champion): Cares about ticket reduction, team capacity
    Michael (CTO): Cares about integration, security, maintenance

  AGENDA:
    0-5: Intros → 5-15: Situation → 15-25: Technical
    25-35: Solution → 35-45: Next steps

  Files Created:
    • meetings/prep-2026-02-05.md

  Ready for discovery!
```

## Quality Checklist

- [ ] Context reviewed (all intelligence)
- [ ] Gaps identified
- [ ] Clear meeting objectives set
- [ ] Questions prioritized
- [ ] Each attendee prepared for
- [ ] Agenda structured
- [ ] Objections anticipated
- [ ] Materials ready

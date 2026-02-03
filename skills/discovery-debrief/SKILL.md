---
name: discovery-debrief
description: "Debrief after discovery meetings to capture insights, update deal intelligence, identify action items, and assess deal progression. Ensures no intelligence is lost."
phase: IMPLEMENT
category: sales
version: "1.0.0"
depends_on: ["discovery-prep", "communication-capture"]
tags: [sales, stage-specific, discovery, debrief, knopilot]
---

# Discovery Debrief

Capture and process insights immediately after discovery meetings.

## When to Use

- **After any meeting** — Debrief while fresh
- **Same day** — Don't wait, insights decay
- **Before next action** — Process before moving on
- When you say: "debrief the meeting", "capture notes", "what did we learn"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `debrief-template.md` | What to capture |
| `deal-progression.md` | How to assess advancement |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Meeting debrief | `deals/{slug}/meetings/debrief-{date}.md` | Always |
| Updated intelligence | Various intelligence files | If new intel |
| Action items | `deals/{slug}/actions/` | Always |

## Core Concept

Discovery Debrief answers: **"What did we learn and what do we do next?"**

Good debriefs:
- **Capture immediately** — Before memory fades
- **Extract intelligence** — Pain, budget, timeline, stakeholders
- **Assess progress** — Did we advance the deal?
- **Define actions** — What's next?

## The Debrief Process

```
┌─────────────────────────────────────────────────────────┐
│              DISCOVERY DEBRIEF PROCESS                  │
│                                                         │
│  1. CAPTURE RAW NOTES                                   │
│     └─→ While still fresh (within 1 hour)               │
│                                                         │
│  2. EXTRACT KEY INTELLIGENCE                            │
│     └─→ Pain, budget, timeline, stakeholders            │
│                                                         │
│  3. ASSESS OBJECTIVES                                   │
│     └─→ Did we achieve what we set out to?              │
│                                                         │
│  4. EVALUATE DEAL PROGRESSION                           │
│     └─→ Did the deal advance? How?                      │
│                                                         │
│  5. IDENTIFY ACTION ITEMS                               │
│     └─→ What must happen next?                          │
│                                                         │
│  6. UPDATE DEAL FILES                                   │
│     └─→ Intelligence files, scores, DEAL.md            │
└─────────────────────────────────────────────────────────┘
```

## debrief-{date}.md Format

```markdown
# Discovery Debrief: [Company] - [Date]

## Meeting Summary
- **Date:** February 5, 2026
- **Duration:** 45 minutes
- **Attendees:** Sarah Chen (VP CX), Michael Torres (CTO)
- **Our Team:** [Your name]

## Key Takeaways

### Top 3 Insights
1. **Volume is worse than expected** — 20,000 tickets/month, up from 15,000 last month
2. **CTO is engaged but cautious** — Wants to see integration details before committing
3. **June deadline is hard** — Peak season starts July, must be live before

## Objective Achievement

| Objective | Status | Notes |
|-----------|--------|-------|
| Confirm use case scope | ✓ Achieved | Returns, exchanges, order status on chat |
| Technical environment | ✓ Achieved | Shopify Plus + Zendesk + Okta SSO |
| Success criteria | ✓ Achieved | 30% ticket reduction, measure after 30 days |
| CTO sentiment | ✓ Achieved | Neutral to positive, wants integration clarity |
| Decision process | ✓ Achieved | Sarah + Michael jointly, CFO final budget sign |

## Intelligence Extracted

### Pain Points (New/Updated)
- **Volume even higher:** 20,000 tickets/month (was told 15,000)
- **Team burnout:** Sarah mentioned 2 support leads have quit
- **Response time suffering:** Average response now 6 hours (was 2)

### Budget/Timeline
- **Budget confirmed:** $200-400K as stated, CFO pre-approved range
- **Timeline confirmed:** Must be live by June 15 (hard deadline)
- **Fiscal context:** Budget allocated for FY26, use or lose

### Stakeholders
- **Sarah Chen:** Confirmed champion, very engaged, owns decision with Michael
- **Michael Torres:** Neutral sentiment, wants integration clarity, technically capable
- **Lisa Park (CFO):** Final budget approval, not involved in evaluation

### Technical
- **Stack:** Shopify Plus, Zendesk, Okta SSO
- **Integration needs:** Full Zendesk integration required
- **Data:** 2 years of ticket history available for training

### Competitive
- No active competitor mentioned
- Previously used Intercom, left due to cost

### Use Case
- **Primary:** Returns, exchanges, order status
- **Scope:** Chat only (no email/phone for now)
- **Success metric:** 30% ticket reduction in 30 days

## Stakeholder Assessment

### Sarah Chen (VP CX)
- **Sentiment:** Supportive (upgraded from general positive)
- **Engagement:** Very high — answered all questions, proactive
- **Key quote:** "If we don't solve this before July, I'm in trouble"
- **Watch for:** She's under pressure, don't let her down

### Michael Torres (CTO)
- **Sentiment:** Neutral to positive
- **Engagement:** Good — asked smart technical questions
- **Key quote:** "I need to see the integration in detail before I'm comfortable"
- **Watch for:** Technical concerns could slow things down
- **Next step:** Send integration documentation

## Deal Progression Assessment

### Did the deal advance?
**Yes — significantly**

### Evidence of advancement:
- Use case moved from "exploring" to "defined"
- Both key decision makers engaged
- Timeline and budget confirmed
- Next meeting agreed (technical deep-dive)

### Stage assessment:
- **Current stage:** Discovery
- **Ready for next stage?** Not yet — need technical validation
- **Blocker:** CTO wants integration clarity

## Action Items

### Immediate (Within 24 hours)
1. Send follow-up email with meeting summary
2. Send integration documentation to Michael
3. Schedule technical deep-dive (aim for next week)

### This Week
4. Create ROI model for CFO (if Lisa needs convincing)
5. Update deal scoring with new intelligence
6. Run next-best-action for priorities

### Questions to Answer
- What's the exact Zendesk version?
- Do they have API access configured?
- Who from their team joins technical deep-dive?

## Follow-Up Email Draft

Subject: Thanks for today — next steps for ShopCo + [Your Company]

Sarah, Michael,

Thank you for the productive conversation today. I'm excited about the
fit between [Your Company] and ShopCo's support automation goals.

Key takeaways:
- Focus: Automating returns, exchanges, and order status on chat
- Goal: 30% ticket reduction within 30 days
- Timeline: Live by June 15

Next steps:
1. I'll send Michael the integration documentation today
2. Let's schedule a technical deep-dive for [propose date]
3. [Any other specific follow-up]

Looking forward to continuing the conversation.

[Your name]

## Updated Scores (Estimated)

| Score | Before | After | Change |
|-------|--------|-------|--------|
| Deal Health | 72 | 78 | +6 |
| Deal Confidence | 75 | 82 | +7 |
| Use Case Clarity | 78 | 90 | +12 |
| Champion Strength | 80 | 85 | +5 |
```

## Output Format

After debrief:

```
✓ Discovery Debrief: {company} - {date}

  TOP 3 INSIGHTS:
    1. Volume higher than expected (20K/month vs 15K)
    2. CTO engaged but wants integration clarity
    3. June 15 deadline is hard

  OBJECTIVES: 5/5 achieved ✓

  DEAL PROGRESSION: Significant advancement
    • Use case: Exploring → Defined
    • Both decision makers engaged
    • Timeline/budget confirmed
    • Next meeting agreed

  NEW INTELLIGENCE:
    Pain: Volume worse, team burnout, response time suffering
    Technical: Shopify Plus + Zendesk + Okta SSO
    Stakeholders: CTO neutral-positive, CFO is final approver

  ACTION ITEMS:
    [IMMEDIATE]
    → Send follow-up email
    → Send integration docs to Michael
    → Schedule technical deep-dive

    [THIS WEEK]
    → ROI model for CFO
    → Update deal scores

  ESTIMATED SCORE IMPACT:
    Deal Health: 72 → 78 (+6)
    Deal Confidence: 75 → 82 (+7)
    Use Case Clarity: 78 → 90 (+12)

  Files Created:
    • meetings/debrief-2026-02-05.md
    • Updated intelligence files
```

## Quality Checklist

- [ ] Captured within 1 hour of meeting
- [ ] Key takeaways identified
- [ ] Objectives evaluated
- [ ] Intelligence extracted to proper categories
- [ ] Stakeholder assessments updated
- [ ] Deal progression assessed
- [ ] Action items defined with owners/timelines
- [ ] Follow-up email drafted
- [ ] Scores estimated

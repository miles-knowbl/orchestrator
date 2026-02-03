---
name: communication-capture
description: "Ingest emails, meeting notes, and other communications into a deal's context. Captures raw content with metadata for later parsing and intelligence extraction."
phase: INIT
category: sales
version: "1.0.0"
depends_on: ["deal-create"]
tags: [sales, data-capture, communications, knopilot]
---

# Communication Capture

Ingest communications into deal context for intelligence extraction.

## When to Use

- **After a meeting** — Capture meeting notes or transcript
- **Important email received** — Forward/capture significant emails
- **Call notes** — Document phone/video call takeaways
- When you say: "capture this email", "log this meeting", "add these notes"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `communication-formats.md` | Standard formats for different comm types |
| `capture-guidelines.md` | What to capture vs. filter out |

**Verification:** Ensure communication is properly formatted and filed.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Communication file | `deals/{slug}/communications/{date}-{type}-{desc}.md` | Always |

## Core Concept

Communication Capture answers: **"How do I get this information into the deal context?"**

Good communication capture:
- **Preserves context** — Full content with metadata
- **Is findable** — Consistent naming, proper dating
- **Enables parsing** — Structured for intelligence extraction
- **Filters noise** — Focus on high-value communications

## What to Capture

### High-Value (Always Capture)

| Type | Examples |
|------|----------|
| Meeting transcripts/notes | Discovery calls, demos, workshops |
| Decision emails | Scoping, pricing, timeline discussions |
| Stakeholder intros | New contacts, org chart reveals |
| Budget/timeline confirmations | Any concrete commitments |
| Technical discussions | Requirements, integration needs |
| Objections/concerns | Blockers, hesitations |

### Low-Value (Skip or Summarize)

| Type | Action |
|------|--------|
| Scheduling logistics | Skip unless contains useful context |
| Generic acknowledgments | Skip ("Thanks!", "Got it") |
| Friendly banter | Skip unless reveals relationship signals |
| Marketing materials sent | Note what was sent, don't duplicate |

## The Capture Process

```
┌─────────────────────────────────────────────────────────┐
│            COMMUNICATION CAPTURE PROCESS                │
│                                                         │
│  1. IDENTIFY COMMUNICATION TYPE                         │
│     └─→ Email, meeting, call, message                   │
│                                                         │
│  2. EXTRACT METADATA                                    │
│     └─→ Date, participants, subject                     │
│                                                         │
│  3. CAPTURE CONTENT                                     │
│     └─→ Full text or structured notes                   │
│                                                         │
│  4. NAME FILE CORRECTLY                                 │
│     └─→ {date}-{type}-{description}.md                  │
│                                                         │
│  5. FILE IN CORRECT DEAL                                │
│     └─→ deals/{slug}/communications/                    │
│                                                         │
│  6. FLAG FOR PARSING                                    │
│     └─→ Mark as needing intelligence extraction         │
└─────────────────────────────────────────────────────────┘
```

## Communication File Format

### Email Format

```markdown
# Email: {Subject}

**Date:** {YYYY-MM-DD HH:MM}
**From:** {Name} <{email}>
**To:** {Name} <{email}>
**CC:** {if any}

---

## Content

{Full email body}

---

## Thread Context

{If reply, summarize what this is responding to}

---

**Captured:** {timestamp}
**Status:** pending-parse
```

### Meeting Notes Format

```markdown
# Meeting: {Title}

**Date:** {YYYY-MM-DD}
**Duration:** {X minutes}
**Type:** {Discovery / Demo / Technical / Workshop / Check-in}

## Attendees

| Name | Title | Company |
|------|-------|---------|
| {name} | {title} | {company} |

---

## Agenda

1. {Topic 1}
2. {Topic 2}

---

## Notes

### {Topic 1}

{Notes from discussion}

### {Topic 2}

{Notes from discussion}

---

## Key Takeaways

- {Takeaway 1}
- {Takeaway 2}

## Action Items

- [ ] {Action} — {Owner}
- [ ] {Action} — {Owner}

## Quotes Worth Noting

> "{Quote}" — {Speaker}

---

**Captured:** {timestamp}
**Status:** pending-parse
```

### Call Notes Format

```markdown
# Call: {Brief Description}

**Date:** {YYYY-MM-DD HH:MM}
**Duration:** {X minutes}
**With:** {Name}, {Title}

---

## Purpose

{Why this call happened}

---

## Discussion

{Summary of what was discussed}

---

## Key Points

- {Point 1}
- {Point 2}

## Next Steps

- {Next step}

---

**Captured:** {timestamp}
**Status:** pending-parse
```

## File Naming Convention

Format: `{YYYY-MM-DD}-{type}-{brief-description}.md`

| Type Code | Used For |
|-----------|----------|
| `email` | Email threads |
| `meeting` | Meeting notes/transcripts |
| `call` | Phone/video calls |
| `slack` | Slack messages |
| `linkedin` | LinkedIn messages |
| `text` | SMS/text messages |

Examples:
- `2026-02-03-meeting-discovery-call.md`
- `2026-02-05-email-pricing-discussion.md`
- `2026-02-07-call-quick-checkin.md`

## Batch Capture

When capturing multiple communications at once:

1. Create all files with correct naming
2. List what was captured
3. Recommend running `communication-parse` on the batch

```
✓ Captured 3 communications for ShopCo:

  1. 2026-02-03-meeting-discovery-call.md
  2. 2026-02-05-email-sarah-followup.md
  3. 2026-02-07-email-tech-questions.md

  → Run communication-parse to extract intelligence
```

## Output Format

After capturing:

```
✓ Communication captured: {type}

  Deal: {company-name}
  File: communications/{filename}
  Date: {date}
  Participants: {list}

  Status: pending-parse

  → Run communication-parse to extract intelligence
```

## Quality Checklist

- [ ] Correct deal directory
- [ ] File named correctly
- [ ] Date is accurate
- [ ] All participants listed
- [ ] Content is complete
- [ ] Status marked as pending-parse
- [ ] No sensitive info that shouldn't be stored

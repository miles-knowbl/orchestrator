# Communication Formats Reference

Standard formats for capturing different types of communications.

## Email Capture Format

```markdown
# Email: {Subject Line}

**Date:** {YYYY-MM-DD HH:MM timezone}
**From:** {Full Name} <{email@domain.com}>
**To:** {Full Name} <{email@domain.com}>
**CC:** {Names and emails, if any}
**Reply-To:** {If different from sender}

---

## Content

{Preserve the full email body exactly as written}

{Include signature blocks - they often contain useful info}

---

## Attachments

{List any attachments with brief descriptions}
- {filename.pdf} — {what it contains}

---

## Thread Context

{If this is part of a thread, provide context}

Previous message summary:
- {Date}: {Who said what in brief}

---

**Captured:** {ISO timestamp when you captured this}
**Source:** {forwarded / bcc / manual entry}
**Status:** pending-parse
```

## Meeting Notes Format

### Discovery Call

```markdown
# Meeting: Discovery Call with {Company}

**Date:** {YYYY-MM-DD}
**Time:** {HH:MM} - {HH:MM} ({timezone})
**Duration:** {X} minutes
**Type:** Discovery
**Meeting Link:** {if virtual}

## Attendees

### {Company Name}
| Name | Title | Role |
|------|-------|------|
| {Name} | {Title} | {Champion/DM/Evaluator} |

### Our Team
| Name | Title |
|------|-------|
| {Name} | {Title} |

---

## Pre-Meeting Context

{What we knew going in}
{Any prep that was done}

---

## Discussion

### Company Background
{What they shared about the company}

### Current State
{Their current situation, systems, processes}

### Pain Points Discussed
{What problems they're trying to solve}

### Use Case Exploration
{What they want to automate/improve}

### Technical Environment
{Systems, integrations, tech stack mentioned}

### Timeline & Budget
{Any signals about timing or budget}

### Decision Process
{Who decides, how decisions are made}

### Competition
{Other solutions being considered}

---

## Key Quotes

> "{Exact quote}" — {Speaker Name}

> "{Exact quote}" — {Speaker Name}

---

## Stakeholder Observations

| Person | Engagement | Notes |
|--------|------------|-------|
| {Name} | {High/Med/Low} | {observations} |

---

## Questions They Asked

1. {Question}
2. {Question}

## Questions We Asked

1. {Question} → {Their answer summary}
2. {Question} → {Their answer summary}

---

## Action Items

### Theirs
- [ ] {Action} — {Owner} — {Due date if mentioned}

### Ours
- [ ] {Action} — {Owner} — {Due date}

---

## Next Steps

{What was agreed for next steps}

---

## My Assessment

{Your subjective read on the meeting}
- Champion strength:
- Deal likelihood:
- Concerns:
- Opportunities:

---

**Captured:** {timestamp}
**Recorder:** {who took these notes}
**Status:** pending-parse
```

### Demo Meeting

```markdown
# Meeting: Demo for {Company}

**Date:** {YYYY-MM-DD}
**Duration:** {X} minutes
**Type:** Demo
**Demo Focus:** {What was demonstrated}

## Attendees

{Same format as discovery}

---

## Demo Agenda

1. {Demo section 1}
2. {Demo section 2}
3. {Q&A}

---

## Reactions & Feedback

### {Demo Section 1}
- Reaction: {positive/neutral/concerned}
- Comments: {what they said}
- Questions: {what they asked}

### {Demo Section 2}
{Same structure}

---

## Concerns Raised

| Concern | Who Raised | How Addressed |
|---------|-----------|---------------|
| {concern} | {name} | {response} |

---

## Feature Requests

{Features they asked about that don't exist}

---

## Competitive Mentions

{Any competitors mentioned during demo}

---

## Next Steps

{What was agreed}

---

**Status:** pending-parse
```

### Technical Review

```markdown
# Meeting: Technical Review with {Company}

**Date:** {YYYY-MM-DD}
**Duration:** {X} minutes
**Type:** Technical Deep-Dive

## Attendees

{Include technical titles}

---

## Technical Topics Covered

### Architecture Discussion
{Their architecture, our architecture}

### Integration Requirements
{What needs to connect to what}

### Security & Compliance
{Security questions, compliance needs}

### Data & Privacy
{Data handling, PII, retention}

### Performance Requirements
{Scale, latency, availability needs}

---

## Technical Decisions

| Decision | Outcome | Notes |
|----------|---------|-------|
| {topic} | {decided} | {context} |

---

## Open Technical Questions

- [ ] {Question needing follow-up}

---

## Technical Risks Identified

| Risk | Severity | Mitigation |
|------|----------|------------|
| {risk} | {H/M/L} | {approach} |

---

**Status:** pending-parse
```

## Call Notes Format

```markdown
# Call: {Brief Description}

**Date:** {YYYY-MM-DD HH:MM}
**Duration:** {X} minutes
**With:** {Name}, {Title} at {Company}
**Initiated By:** {them/us}

---

## Purpose

{Why this call happened}

---

## Key Discussion Points

### {Topic 1}
{What was discussed}

### {Topic 2}
{What was discussed}

---

## Decisions Made

- {Decision 1}
- {Decision 2}

## Commitments

### They Committed To:
- {commitment}

### We Committed To:
- {commitment}

---

## Notable Quotes

> "{quote}" — {speaker}

---

## Tone/Sentiment

{How did the call feel? Positive? Tense? Rushed?}

---

## Follow-Up Needed

- [ ] {action}

---

**Status:** pending-parse
```

## Slack/Message Format

```markdown
# Slack: {Channel or DM} - {Topic}

**Date Range:** {start} to {end}
**Participants:** {list}
**Channel:** {#channel-name or DM}

---

## Thread

**{Name}** ({timestamp}):
{message}

**{Name}** ({timestamp}):
{message}

{Continue chronologically}

---

## Key Points

- {summary point}

---

**Status:** pending-parse
```

## Transcript Format

For full meeting transcripts (from Otter, Fireflies, etc.):

```markdown
# Transcript: {Meeting Title}

**Date:** {YYYY-MM-DD}
**Duration:** {X} minutes
**Source:** {Otter.ai / Fireflies / etc.}
**Confidence:** {transcript accuracy if available}

---

## Participants Identified

| Speaker Label | Identified As |
|---------------|---------------|
| Speaker 1 | {Name, Title} |
| Speaker 2 | {Name, Title} |

---

## Full Transcript

**[00:00]** {Speaker}: {text}

**[00:45]** {Speaker}: {text}

{Continue with timestamps}

---

## Auto-Generated Summary

{If the tool provided a summary, include it}

---

**Status:** pending-parse
```

# Clarifying Questions

Asking the right questions to resolve ambiguity.

## Why This Matters

The quality of your spec depends on the quality of your questions. Good questions reveal hidden requirements, surface assumptions, and prevent costly misunderstandings.

## Question Categories

### Scope Questions

| Question Pattern | Example |
|------------------|---------|
| "Which [things] specifically?" | "Which user types can access this?" |
| "Does this include [edge case]?" | "Does this include archived records?" |
| "What about [related thing]?" | "What about mobile users?" |
| "Is [capability] in scope?" | "Is bulk export in scope?" |

### Behavior Questions

| Question Pattern | Example |
|------------------|---------|
| "What happens when [condition]?" | "What happens when the user has no orders?" |
| "How should [thing] behave?" | "How should errors be displayed?" |
| "What triggers [action]?" | "What triggers the notification?" |
| "What's the default [value]?" | "What's the default date range?" |

### Constraint Questions

| Question Pattern | Example |
|------------------|---------|
| "What's the maximum [limit]?" | "What's the maximum file size?" |
| "What's the expected [volume]?" | "What's the expected number of orders?" |
| "What's the required [performance]?" | "What's the required response time?" |
| "What [standards] apply?" | "What accessibility standards apply?" |

### Priority Questions

| Question Pattern | Example |
|------------------|---------|
| "If we can only do one, which?" | "If we can only do CSV or Excel, which?" |
| "Is [feature] a blocker?" | "Is date filtering a blocker for launch?" |
| "What's the MVP?" | "What's the minimum viable version?" |
| "What can wait for V2?" | "Can column selection wait for V2?" |

### User Questions

| Question Pattern | Example |
|------------------|---------|
| "Who does this?" | "Who initiates the export?" |
| "Who sees the result?" | "Who receives the notification?" |
| "What's their goal?" | "What do they do with the exported data?" |
| "How often?" | "How often do they export?" |

### Error Questions

| Question Pattern | Example |
|------------------|---------|
| "What if [thing] fails?" | "What if the export fails midway?" |
| "What if [thing] is invalid?" | "What if the date range is invalid?" |
| "What if [thing] doesn't exist?" | "What if the user has no orders?" |
| "What if [thing] times out?" | "What if the API times out?" |

## Question Techniques

### The "What Would Happen If" Technique

For each requirement, ask what would happen in various scenarios:

```markdown
Requirement: "Users can export orders"

What would happen if...
- User has no orders?
- User has 1 million orders?
- User exports twice simultaneously?
- Network disconnects during export?
- User doesn't have permission?
- Orders are being modified during export?
```

### The "Two Implementations" Technique

If two developers could interpret the requirement differently, you need clarity:

```markdown
Requirement: "Notify user when export is complete"

Implementation A: Browser notification
Implementation B: Email notification
Implementation C: In-app notification

Question: "Which notification method should we use?"
```

### The "Show Me an Example" Technique

Ask for concrete examples:

```markdown
"Can you show me an example of the export format you expect?"

"Can you show me what the notification should look like?"

"Can you show me what 'success' looks like for this feature?"
```

### The "Walk Me Through" Technique

Have stakeholders walk through the entire flow:

```markdown
"Walk me through exactly what happens when a user exports their orders, step by step."

"Walk me through what you do today without this feature."

"Walk me through what would happen if something went wrong."
```

## Batching Questions

Don't ask questions one at a time. Batch them by topic:

```markdown
## Questions about Order Export Feature

### Format & Content
1. What file format(s) should be supported? (CSV, Excel, both?)
2. What columns should be included?
3. Should column headers be included?
4. What date format for export? (ISO 8601, US format, user preference?)

### Scope
5. All orders or just the user's orders?
6. Include archived/deleted orders?
7. Any date range limits on export?

### Limits & Performance
8. Maximum number of orders per export?
9. Maximum file size?
10. Required response time?

### Access & Permissions
11. Which user roles can export?
12. Any rate limiting needed?

### Delivery
13. Direct download or email for large exports?
14. File naming convention?
```

## Avoiding Bad Questions

### Leading Questions

"Don't you think we should use CSV?"
"What file format would work best for your use case?"

### Vague Questions

"What do you need?"
"What specific data fields do you need in the export?"

### Assumptive Questions

"When should we send the email notification?"
"How should users be notified when the export is complete?"

### Yes/No Questions (when open-ended is better)

"Should errors be shown to users?"
"How should errors be communicated to users?"

### Multiple Questions in One

"Should we include all orders or just recent ones, and what format should they be in, and who should have access?"
Ask each question separately.

## Question Priority

Ask in this order:

1. **Scope questions first** — Understand boundaries before details
2. **Happy path questions** — What should happen when things work
3. **Error path questions** — What happens when things fail
4. **Edge case questions** — Unusual but possible scenarios
5. **Nice-to-have questions** — Lower priority features

## When You Don't Get Answers

| Situation | Strategy |
|-----------|----------|
| Stakeholder doesn't know | Document as open question, assign owner |
| Stakeholder can't decide | Offer options with tradeoffs |
| Stakeholder keeps changing answer | Get written confirmation |
| Different stakeholders disagree | Escalate for decision |
| Answer seems wrong | Probe deeper, give examples |

## Question Documentation Template

```markdown
## Open Questions

| # | Question | Asked To | Date | Status | Answer |
|---|----------|----------|------|--------|--------|
| 1 | [Question] | [Name] | [Date] | Open/Answered | [Answer] |
| 2 | [Question] | [Name] | [Date] | Open/Answered | [Answer] |

## Key Decisions Made

| Decision | Options Considered | Chosen | Rationale | Decided By | Date |
|----------|-------------------|--------|-----------|------------|------|
| [Decision] | [Options] | [Choice] | [Why] | [Name] | [Date] |
```

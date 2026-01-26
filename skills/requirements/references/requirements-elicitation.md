# Requirements Elicitation

Getting requirements from stakeholders effectively.

## Why This Matters

Users often don't know what they want, or can't articulate it clearly. They describe solutions ("add a button") instead of problems ("I need to export data"). Your job is to dig past the surface request to understand the real need.

## The Elicitation Process

### 1. Listen First

Let stakeholders describe what they want without interruption. Note:
- What they say explicitly
- What they assume implicitly
- Emotional emphasis (what seems most important)
- Current pain points

### 2. Ask "Why" Questions

| Surface Request | "Why" Questions |
|-----------------|-----------------|
| "Add an export button" | Why do you need to export? What do you do with the exported data? |
| "Make it faster" | What's slow specifically? How is slowness affecting you? |
| "Add user roles" | What actions need to be restricted? Who should have access to what? |

### 3. Understand the Workflow

Map the full workflow, not just the requested feature:

```
[What triggers the need?]
       ↓
[What do they do today?]
       ↓
[Requested feature]
       ↓
[What do they do next?]
       ↓
[What's the end goal?]
```

### 4. Identify Stakeholders

Different stakeholders have different needs:

| Stakeholder | Typical Concerns |
|-------------|------------------|
| End users | Ease of use, efficiency, reliability |
| Administrators | Management, configuration, reporting |
| Executives | Cost, timeline, business impact |
| Support | Troubleshooting, edge cases |
| Engineering | Feasibility, maintenance, integration |

## Elicitation Techniques

### The Five Whys

Keep asking "why" to get to root cause:

```
"I need an export feature"
Why? → "To analyze order data"
Why? → "To find trends in customer behavior"
Why? → "To improve our marketing targeting"
Why? → "We're losing customers and don't know why"
```

Real need: Customer retention insights, not just export.

### Scenario Walkthrough

Ask them to walk through a specific scenario:

> "Let's say you need to analyze last month's orders. Walk me through exactly what you'd do, step by step."

This reveals:
- Actual workflow
- Pain points
- Assumptions
- Missing steps

### Show Don't Tell

If possible, watch them do the task:

> "Can you show me how you do this today?"

Observation reveals things people forget to mention.

### Contrast Questions

Ask about differences:

> "What's different about orders you want to export vs. orders you don't?"
> "When is the current process sufficient? When is it not?"

### Extreme Scenarios

Test boundaries:

> "What if you had 1 million orders? Would you still export them all?"
> "What if you needed this every day instead of once a month?"

### Negative Requirements

Ask what they DON'T want:

> "What would make this feature useless to you?"
> "What's the worst way we could implement this?"

## Stakeholder Questions by Role

### For End Users

```markdown
- What are you trying to accomplish?
- What do you do today to accomplish this?
- What's frustrating about the current process?
- How often do you need to do this?
- What triggers you to need this?
- What do you do with the result?
- What would "perfect" look like?
```

### For Business Stakeholders

```markdown
- What business problem does this solve?
- How do you measure success?
- What's the cost of not having this?
- Who else is affected?
- What's the timeline requirement?
- How does this fit with other priorities?
- What constraints exist? (budget, resources, legal)
```

### For Technical Stakeholders

```markdown
- What systems does this interact with?
- What data is involved?
- Are there existing patterns to follow?
- What constraints exist? (performance, security, compliance)
- What dependencies are there?
- What could go wrong?
```

## Handling Common Challenges

### Stakeholder Describes Solution, Not Problem

**Symptom:** "Add a button that does X"

**Response:** "Help me understand what you're trying to accomplish. What would you do after clicking that button?"

### Stakeholder Can't Articulate Needs

**Symptom:** "I don't know, I just need it to be better"

**Response:** "Can you show me a specific example where the current process didn't work well?"

### Conflicting Requirements

**Symptom:** Person A wants X, Person B wants opposite of X

**Response:** Document both perspectives, understand the reasoning, escalate for prioritization decision.

### Scope Creep During Elicitation

**Symptom:** "Oh, and it should also do Y, and Z, and..."

**Response:** "Let me capture all of these. We'll prioritize together after we have the full list."

### Assumed Knowledge

**Symptom:** Stakeholder uses jargon or assumes you know context

**Response:** "I want to make sure I understand this correctly. When you say [term], what exactly does that include?"

## Documentation During Elicitation

### Capture Raw Notes

During conversation:
```markdown
## Elicitation Notes: [Date] [Stakeholder]

### Raw Notes
- [Direct quote or observation]
- [Direct quote or observation]

### Questions That Came Up
- [Question needing follow-up]

### Implied Requirements
- [Things assumed but not stated]

### Contradictions/Confusion
- [Anything unclear or conflicting]
```

### Post-Conversation Summary

```markdown
## Requirements Summary: [Feature]

### Stakeholder
[Who you talked to, their role]

### Problem Statement
[What problem they're trying to solve]

### Current Workflow
[How they do it today]

### Desired Outcome
[What they want to be able to do]

### Success Criteria
[How they'll know it's working]

### Constraints
[Any limitations mentioned]

### Open Questions
[What still needs clarification]
```

## When to Stop Eliciting

You have enough when:
- [ ] You can explain the problem to someone else
- [ ] You can describe the workflow end-to-end
- [ ] You understand success criteria
- [ ] Major ambiguities are resolved
- [ ] You know what's in and out of scope
- [ ] Edge cases are identified

You need more when:
- You couldn't write acceptance criteria
- You're making assumptions about user intent
- Key scenarios are unclear
- Stakeholders would disagree with your summary

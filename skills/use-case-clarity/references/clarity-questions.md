# Clarity Questions Reference

Questions to improve use case definition.

## Opening Questions

Start broad, then narrow:

1. "What problem are you trying to solve?"
2. "Why is this a priority right now?"
3. "What would success look like?"
4. "What have you tried so far?"
5. "What's driving the timeline?"

## Specificity Questions

### Automation Target

| Question | What It Reveals |
|----------|-----------------|
| "What specific task do you want to automate?" | Primary use case |
| "Walk me through a typical interaction" | User journey |
| "What's the most common request?" | Volume driver |
| "What takes the most time today?" | Pain point |
| "What's the most repetitive task?" | Automation candidate |

### Process Details

| Question | What It Reveals |
|----------|-----------------|
| "How does this process work today?" | Current state |
| "Who handles this currently?" | Impact/users |
| "What systems are involved?" | Integration needs |
| "What information is needed?" | Data requirements |
| "What are the steps?" | Workflow complexity |

### Edge Cases

| Question | What It Reveals |
|----------|-----------------|
| "What happens when X goes wrong?" | Exception handling |
| "What are the tricky cases?" | Complexity |
| "When do you need a human?" | Escalation triggers |
| "What can't be automated?" | Boundaries |
| "What's the 'long tail' of requests?" | Scope risk |

---

## Scope Questions

### Boundaries

| Question | What It Reveals |
|----------|-----------------|
| "What's in scope for phase 1?" | Initial scope |
| "What's explicitly out of scope?" | Boundaries |
| "What might be phase 2?" | Future expectations |
| "If we could only do one thing, what would it be?" | Priority |
| "What are you NOT trying to solve?" | Anti-requirements |

### Prioritization

| Question | What It Reveals |
|----------|-----------------|
| "Which use case is most valuable?" | Priority |
| "Which is easiest to implement?" | Quick win |
| "Which has the most volume?" | Impact |
| "What would have the biggest impact on [metric]?" | Alignment |
| "If budget forced you to cut scope, what goes?" | True priority |

### Dependencies

| Question | What It Reveals |
|----------|-----------------|
| "What needs to be in place first?" | Prerequisites |
| "What other projects depend on this?" | Downstream |
| "What systems does this touch?" | Integration scope |
| "Who else needs to be involved?" | Stakeholders |
| "What approvals are needed?" | Process |

---

## Success Criteria Questions

### Metrics

| Question | What It Reveals |
|----------|-----------------|
| "How will you measure success?" | KPIs |
| "What metric matters most?" | Primary goal |
| "What would make this a home run?" | Aspirational target |
| "What would be the minimum acceptable outcome?" | Floor |
| "How do you measure that today?" | Baseline ability |

### Targets

| Question | What It Reveals |
|----------|-----------------|
| "What's your target for [metric]?" | Specific goal |
| "What's it at today?" | Baseline |
| "What would be meaningful improvement?" | Threshold |
| "How did you arrive at that target?" | Rationale |
| "What happens if we hit/miss that?" | Stakes |

### Timeline

| Question | What It Reveals |
|----------|-----------------|
| "When do you need to see results?" | Measurement timeline |
| "How long to run a pilot?" | Evaluation period |
| "What's your reporting cadence?" | Check-in frequency |
| "When would you declare success?" | Decision point |

---

## Technical Questions

### Integration

| Question | What It Reveals |
|----------|-----------------|
| "What systems does this need to connect to?" | Integration scope |
| "Do those systems have APIs?" | Technical feasibility |
| "Who manages those systems?" | Stakeholders |
| "What authentication do you use?" | Security requirements |
| "What data would need to be accessed?" | Data scope |

### Data

| Question | What It Reveals |
|----------|-----------------|
| "Where does the relevant data live?" | Data sources |
| "How clean/organized is it?" | Data quality |
| "Do you have historical data?" | Training data |
| "What are data sensitivity concerns?" | Compliance |
| "Who owns the data?" | Governance |

---

## Stakeholder Questions

### Decision Making

| Question | What It Reveals |
|----------|-----------------|
| "Who needs to approve the scope?" | Decision makers |
| "Who has veto power?" | Blockers |
| "Who will use this day-to-day?" | End users |
| "Who will maintain this?" | Ops stakeholders |
| "Who hasn't been in these discussions yet?" | Missing voices |

### Alignment

| Question | What It Reveals |
|----------|-----------------|
| "Does everyone agree on the scope?" | Alignment |
| "Are there different opinions internally?" | Conflict |
| "Has [stakeholder] seen this?" | Coverage |
| "What concerns might [stakeholder] have?" | Objections |

---

## Red Flag Questions

When clarity isn't improving:

1. "Why haven't you done this before?"
   - Reveals: hidden blockers

2. "What's stopped this from happening already?"
   - Reveals: organizational issues

3. "If I said yes to everything, what would you build?"
   - Reveals: scope creep risk

4. "What happens if we don't do this?"
   - Reveals: urgency/priority

5. "Who would push back on this scope?"
   - Reveals: political dynamics

---

## Question Sequencing

### Discovery Meeting Flow

1. **Open (5 min):** Broad problem questions
2. **Narrow (15 min):** Specificity questions
3. **Bound (10 min):** Scope questions
4. **Measure (10 min):** Success criteria questions
5. **Technical (10 min):** Integration questions
6. **Align (5 min):** Stakeholder questions
7. **Confirm (5 min):** Summarize and validate

### Follow-Up Questions

When answer is vague:
- "Can you give me a specific example?"
- "What does that look like day-to-day?"
- "Can you walk me through a real scenario?"

When answer is too broad:
- "If you had to pick just one, which would it be?"
- "What's the highest priority subset?"
- "What's the minimum viable scope?"

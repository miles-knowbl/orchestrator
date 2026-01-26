# Clarifying Questions Framework

Systematic question framework for harvesting requirements from fuzzy input.

## The Question Funnel

Ask questions in this order, moving from broad to specific:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        QUESTION FUNNEL                                       │
│                                                                             │
│  BROAD    ┌─────────────────────────────────────────┐                       │
│           │ 1. USERS: Who is this for?              │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 2. GOALS: What do they want to do?      │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 3. CONTEXT: How do they do it now?      │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 4. PROBLEMS: What's broken or hard?     │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 5. CONSTRAINTS: What limits exist?      │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 6. INTEGRATION: What must it work with? │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│                          ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 7. SCALE: How big? How many?            │                       │
│           └─────────────────────────────────────────┘                       │
│                          │                                                   │
│  SPECIFIC                ▼                                                   │
│           ┌─────────────────────────────────────────┐                       │
│           │ 8. SUCCESS: How will we know it works?  │                       │
│           └─────────────────────────────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Category 1: Users

**Goal:** Understand who will use the system and their characteristics.

### Primary Questions
- Who are the primary users of this system?
- What are their roles and responsibilities?
- What is their technical skill level?
- How frequently will they use it?

### Follow-up Questions
- Are there secondary users or stakeholders?
- Who are the administrators?
- Are there external users (customers, partners)?
- What devices will they use (desktop, mobile, tablet)?

### Red Flags
- "Everyone" (too broad, need segmentation)
- No clear primary user (competing priorities)
- User needs significantly different from requester

## Category 2: Goals

**Goal:** Understand what users are trying to accomplish.

### Primary Questions
- What is the primary job-to-be-done?
- What outcome are users trying to achieve?
- Why do they want to do this?
- What value does completing this task provide?

### Follow-up Questions
- What are secondary goals?
- How does this fit into their larger workflow?
- What happens after they complete this task?
- What triggers them to start this task?

### Job Story Format
```
When [situation], I want to [motivation], so I can [expected outcome].
```

## Category 3: Current State

**Goal:** Understand how the problem is solved today.

### Primary Questions
- How do users accomplish this task today?
- What tools or systems do they currently use?
- What is the current process/workflow?
- Who is involved in the current process?

### Follow-up Questions
- How long has the current process been in place?
- What workarounds exist?
- Are there any tribal knowledge or undocumented steps?
- What data exists from the current process?

### Red Flags
- No current process (users may not actually need this)
- Heavy investment in current tools (migration challenges)
- Process involves many manual steps (scope risk)

## Category 4: Pain Points

**Goal:** Understand what's broken, slow, or frustrating.

### Primary Questions
- What's the biggest problem with the current approach?
- What takes too long?
- What causes errors or failures?
- What do users complain about most?

### Follow-up Questions
- How often does this problem occur?
- What is the impact when it happens?
- What have you tried before to solve this?
- Why didn't previous solutions work?

### Prioritization
| Frequency | Impact | Priority |
|-----------|--------|----------|
| Daily | High | P1 - Must solve |
| Daily | Low | P2 - Should solve |
| Weekly | High | P2 - Should solve |
| Rare | High | P3 - Nice to solve |
| Rare | Low | P4 - Deprioritize |

## Category 5: Constraints

**Goal:** Understand limitations and requirements.

### Primary Questions
- What is the timeline?
- What is the budget (if relevant)?
- What technology constraints exist?
- What regulatory or compliance requirements apply?

### Follow-up Questions
- Are there performance requirements?
- Are there security requirements?
- Are there availability requirements (uptime)?
- What team/resources are available?

### Constraint Types
| Type | Examples |
|------|----------|
| Technology | Must use Python, must run on AWS |
| Security | SOC2 compliance, data residency |
| Performance | <100ms response, 99.9% uptime |
| Business | Launch before Q2, budget < $50k |
| Team | 2 engineers, no mobile expertise |

## Category 6: Integration

**Goal:** Understand what the system must work with.

### Primary Questions
- What existing systems must this integrate with?
- What data needs to flow in/out?
- Are there authentication/SSO requirements?
- Are there third-party APIs involved?

### Follow-up Questions
- What format is existing data in?
- How frequently does data need to sync?
- Who owns the integrated systems?
- Are there API rate limits or restrictions?

### Integration Complexity
| Factor | Low | High |
|--------|-----|------|
| Number of integrations | 1-2 | 5+ |
| Data format | Standard (JSON, REST) | Proprietary |
| Ownership | Your team | External |
| Documentation | Good | Poor/None |
| Stability | Stable | Frequently changes |

## Category 7: Scale

**Goal:** Understand size and growth expectations.

### Primary Questions
- How many users initially?
- How many users at peak?
- How much data will be processed?
- What growth rate is expected?

### Follow-up Questions
- Are there seasonal variations?
- What is the data retention period?
- Are there geographic considerations?
- What happens if we exceed capacity?

### Scale Ranges
| Scale | Users | Data | Complexity |
|-------|-------|------|------------|
| Small | <100 | <1GB | Single server |
| Medium | 100-10k | 1-100GB | Scaling needed |
| Large | 10k-1M | 100GB-10TB | Distributed |
| Massive | >1M | >10TB | Specialized |

## Category 8: Success

**Goal:** Define measurable success criteria.

### Primary Questions
- How will we know this is successful?
- What metrics will we track?
- What is the minimum viable success?
- What would exceptional success look like?

### Follow-up Questions
- How will we measure these metrics?
- What is the baseline today?
- When do we measure (day 1, month 1, quarter 1)?
- Who decides if it's successful?

### SMART Criteria
- **S**pecific: Clearly defined metric
- **M**easurable: Quantifiable
- **A**chievable: Realistic target
- **R**elevant: Matters to the business
- **T**ime-bound: Deadline for achievement

### Example Success Metrics
| Category | Metric | Target |
|----------|--------|--------|
| Efficiency | Time to complete task | -50% |
| Quality | Error rate | <1% |
| Adoption | Daily active users | 80% of team |
| Satisfaction | NPS score | >50 |
| Business | Revenue impact | +$100k/month |

## When to Stop Clarifying

Proceed to specification when:

- [ ] **Users defined**: Primary and secondary users identified
- [ ] **Goals clear**: Job-to-be-done articulated
- [ ] **Scope bounded**: What's in and out of scope is clear
- [ ] **Constraints documented**: Technology, timeline, budget known
- [ ] **Integrations mapped**: External dependencies identified
- [ ] **Scale estimated**: Initial and growth numbers known
- [ ] **Success defined**: Measurable criteria established

## Question Anti-Patterns

### Don't Ask
- Leading questions ("Don't you think we should...")
- Multiple questions at once
- Jargon the requester may not understand
- Questions you can answer yourself

### Do Ask
- Open-ended questions
- One question at a time
- Clarifying follow-ups
- "Why?" to understand motivation

## Output

After clarification, you should have:

```markdown
## Requirements Summary

### Users
- Primary: [description]
- Secondary: [description]

### Goals
- Primary: [job-to-be-done]
- Secondary: [additional goals]

### Current State
- [How it's done today]

### Pain Points
1. [Problem 1] - [frequency/impact]
2. [Problem 2] - [frequency/impact]

### Constraints
- Technology: [constraints]
- Timeline: [deadline]
- Budget: [if applicable]
- Compliance: [requirements]

### Integrations
- [System 1]: [data flow]
- [System 2]: [data flow]

### Scale
- Initial: [users/data]
- Target: [users/data]
- Growth: [rate]

### Success Criteria
- [Metric 1]: [target]
- [Metric 2]: [target]
```

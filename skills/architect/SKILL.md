---
name: architect
description: "Design system and feature architecture from requirements. Produces high-level technical designs with component decomposition, data flow, integration patterns, and technology choices. Documents decisions via ADRs. Creates the architectural foundation that feeds into spec compilation."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [planning, design, architecture, decisions]
---

# Architect

Design system and feature architecture from requirements.

## When to Use

- **New feature with architectural decisions** — Multiple valid approaches, need to choose
- **System-level design** — New service, major refactor, platform decision
- **Integration design** — Connecting systems, API design, data flow
- **Technical evaluation** — Build vs buy, technology selection
- When you say: "design this system", "how should we architect this?", "what's the best approach?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `architecture-patterns.md` | Catalog of patterns to select from |
| `adr-template.md` | Format for documenting decisions |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `architectural-drivers.md` | When identifying what to optimize for |
| `architecture-diagrams.md` | When creating system diagrams |
| `option-exploration.md` | When comparing multiple approaches |

**Verification:** Ensure at least one ADR is created for the key architectural decision.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `ARCHITECTURE.md` | Project root | Always |
| `adr/ADR-NNN-*.md` | `docs/adr/` | One per major decision |

## Core Concept

Architect answers: **"How should we structure this at a high level?"**

Architecture decisions are:
- **Strategic** — Affect multiple components, hard to change later
- **Reasoned** — Trade-offs are documented, alternatives considered
- **Enabling** — Create a foundation for implementation
- **Communicable** — Teams can understand and follow

Architecture is NOT:
- Detailed implementation (that's `spec` and `implement`)
- Requirements gathering (that's `requirements`)
- Code review (that's `code-review`)

## The Architecture Process

```
┌─────────────────────────────────────────────────────────┐
│                 ARCHITECTURE PROCESS                    │
│                                                         │
│  1. UNDERSTAND REQUIREMENTS                             │
│     └─→ What are we building? What are the constraints? │
│                                                         │
│  2. IDENTIFY ARCHITECTURAL DRIVERS                      │
│     └─→ What forces shape the architecture?             │
│                                                         │
│  3. EXPLORE OPTIONS                                     │
│     └─→ What approaches could work?                     │
│                                                         │
│  4. EVALUATE TRADE-OFFS                                 │
│     └─→ What are the pros/cons of each?                 │
│                                                         │
│  5. MAKE DECISIONS                                      │
│     └─→ Which approach and why?                         │
│                                                         │
│  6. DOCUMENT ARCHITECTURE                               │
│     └─→ Diagrams, ADRs, component specs                 │
│                                                         │
│  7. VALIDATE                                            │
│     └─→ Does this meet the requirements?                │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Understand Requirements

Before architecting, ensure you understand:

| Aspect | Questions |
|--------|-----------|
| **Functionality** | What does it need to do? |
| **Users** | Who uses it? How many? How often? |
| **Data** | What data? How much? How fast does it change? |
| **Integration** | What does it connect to? |
| **Constraints** | Budget? Timeline? Team skills? Existing systems? |

### Requirements Checklist

```markdown
- [ ] Functional requirements clear
- [ ] Non-functional requirements quantified
- [ ] User personas and volumes understood
- [ ] Data volumes and patterns understood
- [ ] Integration points identified
- [ ] Constraints documented
```

## Step 2: Identify Architectural Drivers

Architectural drivers are the forces that shape decisions:

### Quality Attributes

| Attribute | Questions | Affects |
|-----------|-----------|---------|
| **Performance** | Response time? Throughput? | Caching, async, data structures |
| **Scalability** | Users? Data? Requests? | Statelessness, sharding, queuing |
| **Availability** | Uptime requirements? | Redundancy, failover, monitoring |
| **Security** | Threats? Compliance? | Auth, encryption, isolation |
| **Maintainability** | Team size? Churn? | Modularity, documentation, testing |
| **Extensibility** | Future features? | Plugin architecture, abstractions |

### Constraints

| Type | Examples |
|------|----------|
| **Technical** | Must use existing database, must integrate with legacy API |
| **Organizational** | Team knows Python, budget is $X/month |
| **Regulatory** | GDPR, HIPAA, SOC2 |
| **Timeline** | Must ship by Q2, MVP in 4 weeks |

### Prioritize Drivers

Not all drivers are equal. Rank them:

```markdown
### Architecture Drivers (Prioritized)

1. **Security** (P0) — Handles sensitive customer data
2. **Availability** (P0) — 99.9% uptime SLA
3. **Scalability** (P1) — Must handle 10x growth
4. **Performance** (P1) — <200ms response time
5. **Maintainability** (P2) — Small team, need simplicity
```

→ See `references/architectural-drivers.md`

## Step 3: Explore Options

Generate multiple approaches. Don't commit to the first idea.

### Option Generation Techniques

| Technique | Description |
|-----------|-------------|
| **Pattern matching** | What patterns fit this problem? |
| **Analogy** | How have similar systems been built? |
| **Decomposition** | Can we break this into smaller decisions? |
| **Extremes** | What's the simplest? Most scalable? Most flexible? |
| **Constraints** | What if we had no [X]? What would we do? |

### Document Options

For each option:

```markdown
### Option A: [Name]

**Description:** [How it works]

**Diagram:**
[ASCII or reference to diagram]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Fits Drivers:**
- ✅ Security — [Why]
- ⚠️ Scalability — [Partial fit]
- ❌ Simplicity — [Why not]

**Effort:** [T-shirt size]

**Risk:** [High/Medium/Low] — [Why]
```

→ See `references/option-exploration.md`

## Step 4: Evaluate Trade-offs

### Trade-off Matrix

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Security | 5 | 4 (20) | 5 (25) | 3 (15) |
| Scalability | 4 | 5 (20) | 3 (12) | 4 (16) |
| Simplicity | 3 | 2 (6) | 4 (12) | 5 (15) |
| Time to build | 3 | 2 (6) | 4 (12) | 5 (15) |
| **Total** | | **52** | **61** | **61** |

### Common Trade-offs

| Trade-off | Tension |
|-----------|---------|
| **Consistency vs Availability** | Strong consistency requires coordination |
| **Performance vs Simplicity** | Optimization adds complexity |
| **Flexibility vs Focus** | Generic solutions are harder to optimize |
| **Build vs Buy** | Control vs time-to-market |
| **Monolith vs Microservices** | Simplicity vs scalability |
| **SQL vs NoSQL** | ACID vs scale/flexibility |

→ See `references/trade-off-analysis.md`

## Step 5: Make Decisions

### Decision Criteria

| Factor | Consider |
|--------|----------|
| **Driver fit** | Does it address the top priorities? |
| **Risk** | What could go wrong? Can we mitigate? |
| **Reversibility** | How hard to change later? |
| **Team fit** | Does the team have the skills? |
| **Cost** | Build cost? Run cost? Opportunity cost? |

### Decision Record (ADR)

Document every significant decision:

```markdown
# ADR-001: [Decision Title]

## Status
Accepted | Proposed | Deprecated | Superseded

## Context
[What is the issue? What forces are at play?]

## Decision
[What is the decision? Be specific.]

## Consequences
### Positive
- [Good outcome]

### Negative
- [Trade-off accepted]

### Neutral
- [Side effect]

## Alternatives Considered
- [Option B]: Rejected because [reason]
- [Option C]: Rejected because [reason]
```

→ See `references/adr-template.md`

## Step 6: Document Architecture

### Architecture Document Structure

```markdown
# [System/Feature] Architecture

## Overview
[One paragraph summary]

## Context
[Business context, problem being solved]

## Architectural Drivers
[Prioritized list from Step 2]

## Architecture

### System Diagram
[High-level view]

### Component Diagram
[Detailed component breakdown]

### Data Flow
[How data moves through the system]

### Data Model
[Key entities and relationships]

## Key Decisions
[Summary of ADRs or link to them]

## Technology Choices
| Component | Technology | Rationale |
|-----------|------------|-----------|
| [Component] | [Tech] | [Why] |

## Integration Points
| System | Protocol | Purpose |
|--------|----------|---------|
| [System] | [Protocol] | [Purpose] |

## Security Architecture
[Authentication, authorization, data protection]

## Deployment Architecture
[Infrastructure, scaling, monitoring]

## Open Questions
[Unresolved decisions]
```

### Diagram Types

| Diagram | Purpose | When to Use |
|---------|---------|-------------|
| **Context** | System and its environment | Always |
| **Container** | High-level components | Multi-component systems |
| **Component** | Internal structure | Complex components |
| **Sequence** | Interaction flow | Complex workflows |
| **Data Flow** | Data movement | Data-intensive systems |
| **Deployment** | Infrastructure | Production systems |

→ See `references/architecture-diagrams.md`

## Step 7: Validate

### Validation Questions

```markdown
- [ ] Does this address all architectural drivers?
- [ ] Are the top priorities (P0) fully addressed?
- [ ] Can this scale to expected load?
- [ ] Is security adequate for the threat model?
- [ ] Can the team build and maintain this?
- [ ] Does it fit the budget and timeline?
- [ ] Are there any single points of failure?
- [ ] Is the failure mode acceptable?
- [ ] Can this evolve with future requirements?
```

### Architecture Review

Before finalizing, review with:
- **Stakeholders** — Does it meet their needs?
- **Implementers** — Can they build it?
- **Operators** — Can they run it?
- **Security** — Is it secure?

## Output Formats

### Quick Architecture (Small Features)

```markdown
## Architecture: [Feature Name]

### Approach
[One paragraph description]

### Diagram
```
[ASCII diagram]
```

### Key Decisions
1. [Decision 1]: [Rationale]
2. [Decision 2]: [Rationale]

### Components
| Component | Responsibility |
|-----------|---------------|
| [Component] | [What it does] |

### Data Flow
[Step-by-step flow]
```

### Full Architecture (Major Systems)

Use the full document structure from Step 6, with:
- All diagram types relevant to the system
- Complete ADRs for all significant decisions
- Technology rationale for all choices
- Security and deployment architecture

## Common Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
├─────────────────────────────────────┤
│         Application Layer           │
├─────────────────────────────────────┤
│          Domain Layer               │
├─────────────────────────────────────┤
│        Infrastructure Layer         │
└─────────────────────────────────────┘
```

**Use when:** Clear separation of concerns, traditional applications.

### Event-Driven Architecture

```
┌──────────┐     ┌─────────┐     ┌──────────┐
│ Producer │────▶│  Queue  │────▶│ Consumer │
└──────────┘     └─────────┘     └──────────┘
```

**Use when:** Async processing, decoupled systems, high scalability.

### Microservices

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│Service A│  │Service B│  │Service C│
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  │
           ┌──────┴──────┐
           │   Gateway   │
           └─────────────┘
```

**Use when:** Independent scaling, team autonomy, complex domains.

### CQRS

```
┌─────────────┐         ┌─────────────┐
│   Command   │         │    Query    │
│   Service   │         │   Service   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│Write Database│───────▶│Read Database│
└─────────────┘  sync   └─────────────┘
```

**Use when:** Read/write patterns differ significantly.

→ See `references/architecture-patterns.md`

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `requirements` | Requirements drive architecture decisions |
| `spec` | Architecture feeds into spec's Architecture Overview section |
| `architecture-review` | Reviews validate architectural decisions |
| `frontend-design` | (Frontend systems) ARCHITECTURE.md informs UI component hierarchy |
| `implement` | Implementation follows architectural decisions |
| `code-validation` | Validates implementation matches architecture |

## Key Principles

**Decisions, not diagrams.** Architecture is about making and documenting decisions, not drawing boxes.

**Trade-offs, not best practices.** Every decision has trade-offs. Document why you chose this trade-off.

**Drivers, not preferences.** Decisions should trace to architectural drivers, not personal preferences.

**Reversibility matters.** Prefer decisions that are easy to change. Be extra careful with irreversible ones.

**Simple until proven otherwise.** Start simple. Add complexity only when drivers demand it.

**Document for the future.** Future you (or someone else) needs to understand why.

## References

- `references/architectural-drivers.md`: Identifying and prioritizing drivers
- `references/option-exploration.md`: Generating and documenting options
- `references/trade-off-analysis.md`: Evaluating trade-offs systematically
- `references/adr-template.md`: Architecture Decision Record template
- `references/architecture-diagrams.md`: Diagram types and when to use them
- `references/architecture-patterns.md`: Common patterns and when to apply them

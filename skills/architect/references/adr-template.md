# Architecture Decision Records (ADRs)

Templates and guidance for documenting architectural decisions.

## What Is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision along with its context and consequences.

**Why ADRs?**
- Future developers understand *why*, not just *what*
- Decisions are explicit, not tribal knowledge
- Trade-offs are documented
- Changes can reference original reasoning

## When to Write an ADR

Write an ADR when the decision:
- Is hard to reverse
- Affects multiple components
- Has significant trade-offs
- Might be questioned later
- Deviates from conventions

**Examples requiring ADRs:**
- Choice of database technology
- Service boundary decisions
- Authentication approach
- API design patterns
- Deployment architecture
- Major library selections

**Examples NOT requiring ADRs:**
- Variable naming conventions
- Which linter to use
- Minor dependency updates
- Bug fixes

## ADR Template

```markdown
# ADR-[NUMBER]: [TITLE]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Date

[YYYY-MM-DD]

## Context

[What is the issue that we're seeing that is motivating this decision or change?
What forces are at play? What is the background?]

## Decision

[What is the change that we're proposing and/or doing?
State the decision clearly and specifically.]

## Consequences

### Positive

- [Good outcome 1]
- [Good outcome 2]

### Negative

- [Trade-off or downside 1]
- [Trade-off or downside 2]

### Neutral

- [Side effect that is neither clearly positive nor negative]

## Alternatives Considered

### [Alternative 1 Name]

[Brief description]

**Rejected because:** [Reason]

### [Alternative 2 Name]

[Brief description]

**Rejected because:** [Reason]

## Related Decisions

- [ADR-XXX: Related decision]
- [ADR-YYY: Decision this supersedes]

## References

- [Link to relevant documentation]
- [Link to discussion or RFC]
```

## Example ADRs

### ADR-001: Use PostgreSQL as Primary Database

**Status:** Accepted

**Date:** 2024-01-15

**Context:**

We need to select a primary database for the Order Management System. Key requirements:
- ACID transactions for financial data
- Support for complex queries (reporting)
- JSON support for flexible schemas
- Team familiarity
- Hosting flexibility (cloud-agnostic)

**Decision:**

We will use PostgreSQL as our primary database.

**Consequences:**

*Positive:*
- Strong ACID guarantees for order and payment data
- Excellent JSON/JSONB support for flexible fields
- Team has 5+ years PostgreSQL experience
- Can run anywhere (AWS RDS, GCP Cloud SQL, self-hosted)
- Mature ecosystem, excellent tooling

*Negative:*
- Horizontal scaling requires more effort than NoSQL alternatives
- Need to manage schema migrations carefully
- Connection pooling needed at scale

*Neutral:*
- Will need to add read replicas as load increases
- May add Redis for caching hot data

**Alternatives Considered:**

*DynamoDB:*
Better horizontal scaling, lower operational overhead.
**Rejected because:** Team lacks DynamoDB experience, and complex queries would require workarounds or separate analytics database.

*MongoDB:*
Flexible schema, good scaling story.
**Rejected because:** Weaker transaction guarantees not acceptable for financial data, and PostgreSQL's JSONB provides sufficient schema flexibility.

---

### ADR-002: Adopt Event-Driven Architecture for Order Processing

**Status:** Accepted

**Date:** 2024-01-20

**Context:**

Order processing involves multiple steps: inventory reservation, payment processing, fulfillment initiation, and notifications. Currently considering:
- Synchronous API calls between services
- Event-driven with message queue
- Hybrid approach

Reliability and auditability are critical (P0 drivers). Current volume is low (100 orders/day) but expected to grow 10x in 12 months.

**Decision:**

We will adopt an event-driven architecture using Amazon SQS for order processing. Each processing step will:
1. Consume events from its input queue
2. Process the work
3. Publish events to downstream queues
4. Use dead-letter queues for failed messages

**Consequences:**

*Positive:*
- Failure in one step doesn't fail entire order
- Natural audit trail via events
- Steps can scale independently
- Easy to add new consumers (analytics, notifications)
- Retries handled automatically

*Negative:*
- More complex than direct API calls
- Eventual consistency (order status not immediately final)
- Need to handle out-of-order messages
- Debugging requires tracing across services

*Neutral:*
- Will need to build order state machine to track status
- Idempotency required in all consumers

**Alternatives Considered:**

*Synchronous orchestration:*
Simpler implementation, immediate consistency.
**Rejected because:** Single failure fails entire order, harder to retry individual steps, doesn't scale as well.

*Saga pattern with orchestrator:*
Centralized control, easier to understand flow.
**Rejected because:** Adds single point of failure, and choreography is sufficient for our use case.

**Related Decisions:**
- ADR-001: PostgreSQL selection (events stored in PostgreSQL)
- ADR-003: Idempotency patterns (required by this decision)

---

### ADR-003: Use Idempotency Keys for All Mutations

**Status:** Accepted

**Date:** 2024-01-22

**Context:**

With event-driven architecture (ADR-002), messages may be delivered more than once. We need to ensure operations are idempotent to prevent:
- Duplicate orders
- Double charges
- Duplicate notifications

**Decision:**

All mutation operations will use idempotency keys:

1. **Client-generated keys:** Clients must include `Idempotency-Key` header
2. **Server-side storage:** Store key + response for 24 hours
3. **Duplicate detection:** Return cached response for duplicate keys
4. **Key format:** UUID v4, client-generated

Implementation:
```sql
CREATE TABLE idempotency_keys (
  key UUID PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,
  response_code INT NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_idempotency_expires ON idempotency_keys(expires_at);
```

**Consequences:**

*Positive:*
- Safe retries from clients
- Safe message redelivery from queues
- No duplicate side effects

*Negative:*
- Additional storage for idempotency records
- Slight latency for key lookup
- Clients must generate and track keys

*Neutral:*
- Need background job to clean expired keys
- 24-hour window is a policy decision (can adjust)

**Alternatives Considered:**

*Database constraints only:*
Use unique constraints to prevent duplicates.
**Rejected because:** Doesn't work for all operations, can't return original response.

*Server-generated keys:*
Server generates idempotency key from request hash.
**Rejected because:** Subtle bugs with timing (same request moments apart might be intentional).

## ADR Lifecycle

### Statuses

| Status | Meaning |
|--------|---------|
| **Proposed** | Under discussion, not yet decided |
| **Accepted** | Decision made, in effect |
| **Deprecated** | No longer applies, but not replaced |
| **Superseded** | Replaced by a newer decision |

### Superseding an ADR

When a decision changes:

```markdown
# ADR-007: Migrate from SQS to Kafka

## Status

Accepted (supersedes ADR-002)

## Context

ADR-002 chose SQS for event-driven architecture. After 18 months:
- Volume grew to 50,000 events/day
- Need for event replay and reprocessing
- Multiple consumers need same events
- SQS costs becoming significant

## Decision

Migrate from SQS to Apache Kafka...
```

Update the original ADR:

```markdown
# ADR-002: Adopt Event-Driven Architecture for Order Processing

## Status

Superseded by ADR-007

[Rest of original content preserved for history]
```

## ADR Organization

### File Structure

```
docs/
└── architecture/
    └── decisions/
        ├── README.md          # Index of all ADRs
        ├── 0001-postgresql.md
        ├── 0002-event-driven.md
        ├── 0003-idempotency.md
        └── ...
```

### README Index

```markdown
# Architecture Decision Records

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](0001-postgresql.md) | Use PostgreSQL | Accepted | 2024-01-15 |
| [002](0002-event-driven.md) | Event-driven architecture | Superseded | 2024-01-20 |
| [003](0003-idempotency.md) | Idempotency keys | Accepted | 2024-01-22 |
| [007](0007-kafka-migration.md) | Migrate to Kafka | Accepted | 2025-07-01 |
```

## ADR Writing Tips

### Do

- Be specific about the decision
- Quantify where possible ("100 orders/day", "5ms latency")
- Document alternatives seriously considered
- Explain *why* alternatives were rejected
- Link to related ADRs
- Keep context concise but complete

### Don't

- Write a novel (ADRs should be scannable)
- Skip the alternatives (even if obvious choice)
- Forget negative consequences
- Leave status as "Proposed" indefinitely
- Delete or overwrite old ADRs (supersede instead)

## ADR Checklist

```markdown
- [ ] Title is clear and specific
- [ ] Status is set correctly
- [ ] Context explains the problem and forces
- [ ] Decision is specific and actionable
- [ ] Positive consequences listed
- [ ] Negative consequences (trade-offs) listed
- [ ] At least 2 alternatives considered
- [ ] Rejection reasons are clear
- [ ] Related ADRs linked
- [ ] Added to index/README
```

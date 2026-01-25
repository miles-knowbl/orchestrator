# Architecture Patterns

Common patterns and when to apply them.

## Pattern Selection

Patterns are not good or bad — they fit or don't fit your context. Before applying a pattern, ask:

1. What problem does this pattern solve?
2. Do I have that problem?
3. What are the trade-offs?
4. Is my team equipped to implement it?

## Application Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────┐
│         Presentation Layer          │  ← UI, controllers
├─────────────────────────────────────┤
│         Application Layer           │  ← Use cases, orchestration
├─────────────────────────────────────┤
│           Domain Layer              │  ← Business logic, entities
├─────────────────────────────────────┤
│        Infrastructure Layer         │  ← Database, external services
└─────────────────────────────────────┘
```

**Solves:** Separation of concerns, testability

**Use when:**
- Traditional CRUD applications
- Clear separation between UI and business logic needed
- Team familiar with the pattern

**Trade-offs:**
- Can become "lasagna" with too many layers
- Changes often ripple through layers
- May be overkill for simple apps

---

### Hexagonal Architecture (Ports & Adapters)

```
                    ┌─────────────────┐
                    │   HTTP API      │
                    │   (Adapter)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    Port         │
┌───────────┐       │   (Interface)   │       ┌───────────┐
│  CLI      │──────▶├─────────────────┤◀──────│ Database  │
│ (Adapter) │       │                 │       │ (Adapter) │
└───────────┘       │   DOMAIN        │       └───────────┘
                    │   (Core Logic)  │
┌───────────┐       │                 │       ┌───────────┐
│  Queue    │──────▶├─────────────────┤◀──────│  Email    │
│ (Adapter) │       │    Port         │       │ (Adapter) │
└───────────┘       │   (Interface)   │       └───────────┘
                    └─────────────────┘
```

**Solves:** Dependency inversion, infrastructure independence

**Use when:**
- Domain logic is complex and valuable
- Need to swap infrastructure (database, APIs)
- Testing domain logic in isolation is important

**Trade-offs:**
- More interfaces and indirection
- Can be over-engineered for simple domains
- Learning curve for teams

---

### Clean Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frameworks & Drivers                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Interface Adapters                      │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                   Application                        │  │  │
│  │  │  ┌───────────────────────────────────────────────┐  │  │  │
│  │  │  │                  Entities                      │  │  │  │
│  │  │  │             (Enterprise Rules)                 │  │  │  │
│  │  │  └───────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Dependencies point INWARD only
```

**Solves:** Framework independence, testability, clean domain

**Use when:**
- Long-lived systems that will outlive frameworks
- Domain is the competitive advantage
- High test coverage requirements

**Trade-offs:**
- Significant boilerplate
- Can feel over-engineered
- Team needs discipline to maintain boundaries

## Service Architecture Patterns

### Monolith

```
┌─────────────────────────────────────────────────────────────┐
│                        MONOLITH                             │
│                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │  Orders  │  │ Payments │  │Inventory │  │  Users   │   │
│   │  Module  │  │  Module  │  │  Module  │  │  Module  │   │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│        │             │             │             │          │
│        └─────────────┴─────────────┴─────────────┘          │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │   Database  │                          │
│                    └─────────────┘                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Solves:** Simplicity, easy deployment, transactional consistency

**Use when:**
- Starting a new project (start here!)
- Small team (< 10 developers)
- Simple deployment requirements
- Strong consistency requirements

**Trade-offs:**
- Scaling is all-or-nothing
- Long build/deploy times at scale
- Team coupling (everyone in same codebase)

---

### Microservices

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Orders    │  │  Payments   │  │  Inventory  │
│   Service   │  │   Service   │  │   Service   │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Orders DB  │  │ Payments DB │  │Inventory DB │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Solves:** Independent scaling, team autonomy, technology flexibility

**Use when:**
- Large team (multiple teams)
- Different scaling requirements per domain
- Need to deploy parts independently
- Different technology needs per domain

**Trade-offs:**
- Distributed system complexity
- Network latency between services
- Data consistency is hard
- Operational overhead (monitoring, deployment)

**Prerequisites:**
- Mature DevOps practices
- Good observability
- Clear domain boundaries
- Experienced team

---

### Modular Monolith

```
┌─────────────────────────────────────────────────────────────┐
│                    MODULAR MONOLITH                         │
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │    Orders    │  │   Payments   │  │  Inventory   │     │
│   │    Module    │  │    Module    │  │    Module    │     │
│   │   ┌──────┐   │  │   ┌──────┐   │  │   ┌──────┐   │     │
│   │   │  DB  │   │  │   │  DB  │   │  │   │  DB  │   │     │
│   │   │Schema│   │  │   │Schema│   │  │   │Schema│   │     │
│   │   └──────┘   │  │   └──────┘   │  │   └──────┘   │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│          │                 │                 │              │
│          └─────────────────┼─────────────────┘              │
│                            │                                │
│                    ┌───────┴───────┐                        │
│                    │   Shared DB   │                        │
│                    │   (Schemas)   │                        │
│                    └───────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Solves:** Monolith simplicity with clear boundaries, path to microservices

**Use when:**
- Want benefits of modularity without distributed complexity
- Planning potential future split to microservices
- Need clear ownership boundaries

**Trade-offs:**
- Requires discipline to maintain boundaries
- Still single deployment unit
- Database schemas can drift if not careful

## Data Patterns

### CQRS (Command Query Responsibility Segregation)

```
        Commands                           Queries
           │                                  │
           ▼                                  ▼
    ┌─────────────┐                    ┌─────────────┐
    │   Command   │                    │    Query    │
    │   Handler   │                    │   Handler   │
    └──────┬──────┘                    └──────┬──────┘
           │                                  │
           ▼                                  ▼
    ┌─────────────┐    sync/async      ┌─────────────┐
    │   Write     │───────────────────▶│    Read     │
    │   Model     │                    │    Model    │
    └─────────────┘                    └─────────────┘
```

**Solves:** Read/write optimization, complex queries

**Use when:**
- Read and write patterns are very different
- High read-to-write ratio
- Complex read queries (reporting)

**Trade-offs:**
- Eventual consistency between models
- Duplication of data
- More complex than single model

---

### Event Sourcing

```
┌─────────────────────────────────────────────────────────────┐
│                      EVENT STORE                            │
│                                                             │
│   Event 1: OrderCreated { orderId, items, timestamp }       │
│   Event 2: PaymentReceived { orderId, amount, timestamp }   │
│   Event 3: OrderShipped { orderId, trackingId, timestamp }  │
│   Event 4: OrderDelivered { orderId, timestamp }            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ replay
                              ▼
                    ┌─────────────────┐
                    │  Current State  │
                    │  (Projection)   │
                    └─────────────────┘
```

**Solves:** Complete audit trail, temporal queries, event replay

**Use when:**
- Audit trail is critical (finance, healthcare)
- Need to replay/reprocess events
- Domain is naturally event-based

**Trade-offs:**
- Querying current state requires projections
- Schema evolution is complex
- Storage grows indefinitely
- Steep learning curve

---

### Saga Pattern

```
┌───────────────────────────────────────────────────────────────────────┐
│                        ORDER SAGA                                     │
│                                                                       │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐    │
│   │ Reserve  │────▶│  Charge  │────▶│   Ship   │────▶│ Complete │    │
│   │Inventory │     │ Payment  │     │  Order   │     │  Order   │    │
│   └────┬─────┘     └────┬─────┘     └────┬─────┘     └──────────┘    │
│        │                │                │                            │
│   On failure:      On failure:      On failure:                       │
│        │                │                │                            │
│        ▼                ▼                ▼                            │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐                     │
│   │ Release  │◀────│  Refund  │◀────│  Cancel  │                     │
│   │Inventory │     │ Payment  │     │ Shipment │                     │
│   └──────────┘     └──────────┘     └──────────┘                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Solves:** Distributed transactions across services

**Use when:**
- Need transactions across microservices
- Each service has its own database
- Eventual consistency is acceptable

**Trade-offs:**
- Complex compensating transactions
- Partial failure states
- Debugging is difficult

## Integration Patterns

### API Gateway

```
┌──────────┐     ┌─────────────────┐     ┌──────────────┐
│  Client  │────▶│   API Gateway   │────▶│   Service A  │
└──────────┘     │                 │     └──────────────┘
                 │  • Auth         │     ┌──────────────┐
                 │  • Rate limit   │────▶│   Service B  │
                 │  • Routing      │     └──────────────┘
                 │  • Aggregation  │     ┌──────────────┐
                 │                 │────▶│   Service C  │
                 └─────────────────┘     └──────────────┘
```

**Solves:** Single entry point, cross-cutting concerns

**Use when:**
- Multiple backend services
- Need centralized auth, rate limiting
- Want to hide service topology from clients

---

### Message Queue

```
┌──────────┐     ┌─────────────────┐     ┌──────────────┐
│ Producer │────▶│     Queue       │────▶│   Consumer   │
└──────────┘     │  (SQS, RabbitMQ)│     └──────────────┘
                 └─────────────────┘
```

**Solves:** Decoupling, async processing, load leveling

**Use when:**
- Producer and consumer have different throughput
- Processing can be async
- Need guaranteed delivery

---

### Event Bus (Pub/Sub)

```
┌──────────┐                              ┌──────────────┐
│Publisher │──┐                       ┌──▶│ Subscriber A │
└──────────┘  │    ┌─────────────┐    │   └──────────────┘
              ├───▶│  Event Bus  │────┤   ┌──────────────┐
┌──────────┐  │    │(Kafka, SNS) │    ├──▶│ Subscriber B │
│Publisher │──┘    └─────────────┘    │   └──────────────┘
└──────────┘                          │   ┌──────────────┐
                                      └──▶│ Subscriber C │
                                          └──────────────┘
```

**Solves:** Many-to-many communication, event-driven architecture

**Use when:**
- Multiple consumers need same events
- Loose coupling between services
- Event replay needed (Kafka)

## Resilience Patterns

### Circuit Breaker

```
        ┌─────────────────────────────────────────┐
        │                                         │
        ▼                                         │
   ┌─────────┐    failures     ┌─────────┐       │
   │ CLOSED  │────────────────▶│  OPEN   │       │
   │(normal) │                 │ (fail   │       │
   └─────────┘                 │  fast)  │       │
        ▲                      └────┬────┘       │
        │                           │            │
        │    success          timeout            │
        │                           │            │
        │                      ┌────▼────┐       │
        └──────────────────────│HALF-OPEN│───────┘
                               │ (test)  │  failure
                               └─────────┘
```

**Solves:** Cascading failures, fail fast

**Use when:**
- Calling external/unreliable services
- Want to avoid overloading failing service

---

### Retry with Backoff

```
Request failed ──▶ Wait 1s ──▶ Retry ──▶ Failed
                                           │
                              Wait 2s ◀────┘
                                 │
                              Retry ──▶ Failed
                                           │
                              Wait 4s ◀────┘
                                 │
                              Retry ──▶ Success!
```

**Solves:** Transient failures

**Use when:**
- Failures are likely temporary
- Operation is idempotent

---

### Bulkhead

```
┌──────────────────────────────────────────────────────────┐
│                      APPLICATION                          │
│                                                          │
│   ┌─────────────────┐    ┌─────────────────┐            │
│   │   Thread Pool   │    │   Thread Pool   │            │
│   │   (Service A)   │    │   (Service B)   │            │
│   │                 │    │                 │            │
│   │  ████████░░░░   │    │  ██░░░░░░░░░░   │            │
│   │  (80% used)     │    │  (20% used)     │            │
│   └─────────────────┘    └─────────────────┘            │
│                                                          │
│   Service A slowdown doesn't affect Service B            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Solves:** Isolation of failures

**Use when:**
- Different operations have different reliability
- Want to contain failures

## Pattern Selection Matrix

| Scenario | Recommended Pattern |
|----------|-------------------|
| Starting new project | Monolith (modular) |
| Complex domain logic | Hexagonal / Clean Architecture |
| High read load | CQRS |
| Audit requirements | Event Sourcing |
| Multiple teams, services | Microservices + API Gateway |
| Async processing | Message Queue |
| Calling unreliable services | Circuit Breaker + Retry |
| Distributed transactions | Saga |

## Anti-patterns to Avoid

| Anti-pattern | Problem | Instead |
|--------------|---------|---------|
| **Distributed Monolith** | Microservices that must deploy together | Define clear contracts, or stay monolith |
| **Golden Hammer** | Using one pattern everywhere | Choose pattern based on context |
| **Resume-Driven Architecture** | Picking tech for resume, not fit | Start simple, add complexity when needed |
| **Big Ball of Mud** | No clear structure | Establish and enforce module boundaries |
| **Premature Microservices** | Splitting too early | Start monolith, split when boundaries clear |

# Architecture Diagrams

Types of diagrams and when to use them.

## Diagram Principles

**Good diagrams:**
- Have a clear purpose (what question do they answer?)
- Show the right level of detail (not too much, not too little)
- Have a legend if symbols aren't obvious
- Are kept up to date (or marked as "point in time")

**Avoid:**
- Diagrams that try to show everything
- Mixing abstraction levels
- Unlabeled boxes and arrows
- Diagrams without context

## The C4 Model

C4 provides four levels of abstraction, each answering different questions:

### Level 1: System Context

**Question:** What is this system and who uses it?

**Shows:**
- The system as a single box
- Users/actors who interact with it
- External systems it connects to

**Audience:** Non-technical stakeholders, new team members

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM CONTEXT                                  │
│                                                                         │
│                         ┌─────────────┐                                 │
│    ┌──────────┐         │             │         ┌──────────────┐        │
│    │ Customer │────────▶│   Order     │────────▶│   Payment    │        │
│    │          │         │  Management │         │   Gateway    │        │
│    └──────────┘         │   System    │         │  [External]  │        │
│                         │             │         └──────────────┘        │
│    ┌──────────┐         │             │         ┌──────────────┐        │
│    │  Admin   │────────▶│             │────────▶│  Inventory   │        │
│    │          │         │             │         │   System     │        │
│    └──────────┘         └─────────────┘         │  [External]  │        │
│                                                 └──────────────┘        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Level 2: Container Diagram

**Question:** What are the high-level components and how do they communicate?

**Shows:**
- Applications, services, databases
- Communication protocols
- Technology choices

**Audience:** Technical stakeholders, architects, developers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CONTAINER DIAGRAM                                │
│                                                                         │
│    ┌─────────────────────────────────────────────────────────────┐     │
│    │                    Order Management System                   │     │
│    │                                                              │     │
│    │   ┌──────────────┐        ┌──────────────┐                  │     │
│    │   │   Web App    │        │  Mobile App  │                  │     │
│    │   │   [React]    │        │   [React     │                  │     │
│    │   │              │        │    Native]   │                  │     │
│    │   └──────┬───────┘        └──────┬───────┘                  │     │
│    │          │                       │                          │     │
│    │          │       HTTPS/JSON      │                          │     │
│    │          └───────────┬───────────┘                          │     │
│    │                      ▼                                      │     │
│    │              ┌──────────────┐                               │     │
│    │              │   API        │                               │     │
│    │              │   Gateway    │                               │     │
│    │              │   [Kong]     │                               │     │
│    │              └──────┬───────┘                               │     │
│    │                     │                                       │     │
│    │     ┌───────────────┼───────────────┐                       │     │
│    │     ▼               ▼               ▼                       │     │
│    │ ┌────────┐    ┌────────┐    ┌────────────┐                  │     │
│    │ │ Order  │    │Payment │    │Notification│                  │     │
│    │ │Service │    │Service │    │  Service   │                  │     │
│    │ │[Python]│    │[Python]│    │  [Python]  │                  │     │
│    │ └───┬────┘    └───┬────┘    └─────┬──────┘                  │     │
│    │     │             │               │                         │     │
│    │     └─────────────┼───────────────┘                         │     │
│    │                   ▼                                         │     │
│    │           ┌──────────────┐    ┌──────────────┐              │     │
│    │           │  PostgreSQL  │    │    Redis     │              │     │
│    │           │  [Database]  │    │   [Cache]    │              │     │
│    │           └──────────────┘    └──────────────┘              │     │
│    │                                                              │     │
│    └─────────────────────────────────────────────────────────────┘     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Level 3: Component Diagram

**Question:** What are the components inside a container?

**Shows:**
- Major classes/modules
- Their responsibilities
- Internal dependencies

**Audience:** Developers working on that container

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   ORDER SERVICE - COMPONENT DIAGRAM                     │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Order Service                             │   │
│   │                                                                  │   │
│   │   ┌────────────────┐     ┌────────────────┐                     │   │
│   │   │ OrderController│────▶│  OrderService  │                     │   │
│   │   │    (REST)      │     │   (Business    │                     │   │
│   │   │                │     │    Logic)      │                     │   │
│   │   └────────────────┘     └───────┬────────┘                     │   │
│   │                                  │                               │   │
│   │                    ┌─────────────┼─────────────┐                 │   │
│   │                    ▼             ▼             ▼                 │   │
│   │            ┌────────────┐ ┌────────────┐ ┌────────────┐         │   │
│   │            │  Order     │ │ Inventory  │ │  Payment   │         │   │
│   │            │ Repository │ │  Client    │ │  Client    │         │   │
│   │            │            │ │  (HTTP)    │ │  (HTTP)    │         │   │
│   │            └─────┬──────┘ └─────┬──────┘ └─────┬──────┘         │   │
│   │                  │              │              │                 │   │
│   └──────────────────│──────────────│──────────────│─────────────────┘   │
│                      │              │              │                     │
│                      ▼              ▼              ▼                     │
│               ┌──────────┐  ┌────────────┐  ┌───────────┐               │
│               │PostgreSQL│  │ Inventory  │  │  Payment  │               │
│               │          │  │  Service   │  │  Gateway  │               │
│               └──────────┘  └────────────┘  └───────────┘               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Level 4: Code Diagram

**Question:** How is a component implemented?

**Shows:**
- Classes, interfaces, modules
- Relationships (inheritance, composition)
- Method signatures

**Audience:** Developers implementing/modifying the code

Usually UML class diagrams. In practice, often unnecessary if code is well-organized.

## Other Diagram Types

### Sequence Diagram

**Question:** How do components interact over time?

**Use when:** Complex workflows, multi-step processes

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Client │     │  API   │     │ Order  │     │Payment │
│        │     │Gateway │     │Service │     │Service │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │
    │ POST /orders │              │              │
    │─────────────▶│              │              │
    │              │ createOrder  │              │
    │              │─────────────▶│              │
    │              │              │              │
    │              │              │ processPayment
    │              │              │─────────────▶│
    │              │              │              │
    │              │              │    result    │
    │              │              │◀─────────────│
    │              │              │              │
    │              │    order     │              │
    │              │◀─────────────│              │
    │              │              │              │
    │   201 Created│              │              │
    │◀─────────────│              │              │
    │              │              │              │
```

### Data Flow Diagram

**Question:** How does data move through the system?

**Use when:** Data-intensive systems, ETL pipelines

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                     │
│                                                                         │
│   ┌──────────┐    orders     ┌──────────┐    events    ┌──────────┐    │
│   │  Web     │──────────────▶│  Order   │─────────────▶│  Event   │    │
│   │  Client  │               │  API     │              │  Queue   │    │
│   └──────────┘               └────┬─────┘              └────┬─────┘    │
│                                   │                         │          │
│                              order data                  events        │
│                                   │                         │          │
│                                   ▼                         ▼          │
│                              ┌──────────┐              ┌──────────┐    │
│                              │  Orders  │              │Analytics │    │
│                              │   DB     │─────────────▶│ Warehouse│    │
│                              └──────────┘   nightly    └──────────┘    │
│                                             sync                       │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deployment Diagram

**Question:** How is the system deployed to infrastructure?

**Use when:** DevOps planning, infrastructure design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT DIAGRAM                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        AWS us-east-1                             │   │
│   │                                                                  │   │
│   │   ┌─────────────┐                                                │   │
│   │   │ CloudFront  │                                                │   │
│   │   │    (CDN)    │                                                │   │
│   │   └──────┬──────┘                                                │   │
│   │          │                                                       │   │
│   │          ▼                                                       │   │
│   │   ┌─────────────┐         ┌─────────────────────────────────┐   │   │
│   │   │     ALB     │         │          EKS Cluster            │   │   │
│   │   │             │────────▶│                                 │   │   │
│   │   └─────────────┘         │  ┌───────┐ ┌───────┐ ┌───────┐  │   │   │
│   │                           │  │Order  │ │Payment│ │Notify │  │   │   │
│   │                           │  │ x3    │ │  x2   │ │  x2   │  │   │   │
│   │                           │  └───────┘ └───────┘ └───────┘  │   │   │
│   │                           │                                 │   │   │
│   │                           └─────────────────────────────────┘   │   │
│   │                                          │                       │   │
│   │                    ┌─────────────────────┼───────────────────┐   │   │
│   │                    ▼                     ▼                   ▼   │   │
│   │             ┌──────────┐          ┌──────────┐        ┌────────┐ │   │
│   │             │   RDS    │          │  Elasti  │        │  SQS   │ │   │
│   │             │ Postgres │          │  Cache   │        │        │ │   │
│   │             │ (Multi-AZ)│         │ (Redis)  │        │        │ │   │
│   │             └──────────┘          └──────────┘        └────────┘ │   │
│   │                                                                  │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Diagram

**Question:** What states can an entity be in and how does it transition?

**Use when:** Complex state machines, workflow systems

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ORDER STATE MACHINE                                │
│                                                                         │
│                          ┌──────────┐                                   │
│                          │  DRAFT   │                                   │
│                          └────┬─────┘                                   │
│                               │ submit                                  │
│                               ▼                                         │
│                          ┌──────────┐                                   │
│               ┌─────────▶│ PENDING  │◀─────────┐                        │
│               │          │ PAYMENT  │          │                        │
│               │          └────┬─────┘          │                        │
│               │               │                │                        │
│               │    payment    │    payment     │                        │
│               │    failed     │    success     │ retry                  │
│               │               │                │                        │
│               │               ▼                │                        │
│          ┌────┴─────┐   ┌──────────┐    ┌─────┴────┐                    │
│          │ PAYMENT  │   │CONFIRMED │    │ PAYMENT  │                    │
│          │ FAILED   │   │          │    │ RETRY    │                    │
│          └──────────┘   └────┬─────┘    └──────────┘                    │
│                              │ fulfill                                  │
│                              ▼                                          │
│                         ┌──────────┐                                    │
│              ┌─────────▶│FULFILLED │                                    │
│              │          └────┬─────┘                                    │
│              │               │                                          │
│          ship│               │ deliver                                  │
│              │               ▼                                          │
│         ┌────┴─────┐   ┌──────────┐                                     │
│         │ SHIPPED  │───│DELIVERED │                                     │
│         └──────────┘   └──────────┘                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Diagram Selection Guide

| Question | Diagram Type |
|----------|--------------|
| What is this system? | System Context |
| What are the main components? | Container |
| What's inside this component? | Component |
| How do things interact over time? | Sequence |
| How does data flow through? | Data Flow |
| How is it deployed? | Deployment |
| What states can this be in? | State |
| How does the database look? | Entity Relationship |

## ASCII Diagram Tips

### Box Characters

```
Simple:     ┌───────┐
            │       │
            └───────┘

Rounded:    ╭───────╮
            │       │
            ╰───────╯

Double:     ╔═══════╗
            ║       ║
            ╚═══════╝
```

### Arrows

```
Right:      ────▶   ────→   --->
Left:       ◀────   ←────   <---
Both:       ◀───▶   ←───→   <-->
Down:         │       │
              ▼       ↓
Up:           ▲       ↑
              │       │
```

### Connectors

```
T-junction:  ───┬───    ───┴───    │        │
                │          │       ├───  ───┤
                                   │        │

Corners:     ┌───    ───┐    └───    ───┘

Cross:       ───┼───
                │
```

## Diagram Checklist

```markdown
- [ ] Clear title stating what diagram shows
- [ ] Appropriate level of detail for audience
- [ ] Legend if symbols aren't obvious
- [ ] Labels on all boxes
- [ ] Labels on arrows (what flows/happens)
- [ ] Technology choices shown where relevant
- [ ] External systems clearly marked
- [ ] Boundaries/groupings shown
- [ ] Date or version if diagram may change
```

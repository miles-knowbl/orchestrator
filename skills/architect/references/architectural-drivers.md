# Architectural Drivers

Identifying and prioritizing the forces that shape architecture.

## What Are Architectural Drivers?

Architectural drivers are the key requirements and constraints that significantly influence architectural decisions. They're the "why" behind architectural choices.

**Types of drivers:**
- Quality attributes (performance, security, scalability, etc.)
- Functional requirements (key features that drive structure)
- Constraints (technical, organizational, regulatory)
- Business goals (time-to-market, cost, growth)

## Quality Attributes

### Performance

| Aspect | Questions | Architectural Impact |
|--------|-----------|---------------------|
| **Latency** | What response time is acceptable? p50? p99? | Caching, async, CDN, database optimization |
| **Throughput** | How many requests per second? | Horizontal scaling, queuing, batching |
| **Resource usage** | CPU/memory constraints? | Algorithm choice, data structures, lazy loading |

**Quantify:**
- "API responses must complete in <200ms at p95"
- "System must handle 10,000 concurrent users"
- "Batch processing must complete in <1 hour for 1M records"

### Scalability

| Aspect | Questions | Architectural Impact |
|--------|-----------|---------------------|
| **User scale** | 100? 10,000? 1M users? | Statelessness, session management |
| **Data scale** | GB? TB? PB? | Sharding, partitioning, archival |
| **Request scale** | RPS? Bursty or steady? | Auto-scaling, queuing, rate limiting |
| **Team scale** | How many developers? | Service boundaries, API contracts |

**Quantify:**
- "Must support 10x growth without re-architecture"
- "Database will grow 100GB/month"
- "Black Friday traffic is 50x normal"

### Availability

| Aspect | Questions | Architectural Impact |
|--------|-----------|---------------------|
| **Uptime** | 99%? 99.9%? 99.99%? | Redundancy, failover, regions |
| **Recovery time** | RTO? | Backup strategy, failover automation |
| **Data durability** | RPO? | Replication, backup frequency |
| **Degradation** | What can fail gracefully? | Circuit breakers, fallbacks |

**Quantify:**
- "99.9% uptime = 8.7 hours downtime/year"
- "RTO: 15 minutes, RPO: 1 hour"
- "Core checkout must work even if recommendations fail"

### Security

| Aspect | Questions | Architectural Impact |
|--------|-----------|---------------------|
| **Authentication** | Who can access? How verified? | Identity provider, session management |
| **Authorization** | Who can do what? | RBAC, ABAC, policy enforcement |
| **Data protection** | What's sensitive? | Encryption, tokenization, masking |
| **Compliance** | GDPR? HIPAA? SOC2? | Audit logging, data residency, retention |
| **Threat model** | What attacks? | Input validation, rate limiting, WAF |

**Quantify:**
- "PII must be encrypted at rest and in transit"
- "All access must be logged for 7 years"
- "Must pass SOC2 Type 2 audit"

### Maintainability

| Aspect | Questions | Architectural Impact |
|--------|-----------|---------------------|
| **Understandability** | How complex? | Modularity, documentation, naming |
| **Changeability** | How often does it change? | Loose coupling, versioning |
| **Testability** | How to verify? | Dependency injection, interfaces |
| **Debuggability** | How to diagnose? | Observability, tracing, logging |

**Quantify:**
- "New developers productive in <2 weeks"
- "Feature changes should not require coordinated deploys"
- "Any incident debuggable from logs within 15 minutes"

### Other Quality Attributes

| Attribute | Description | Architectural Impact |
|-----------|-------------|---------------------|
| **Extensibility** | Adding new features | Plugin architecture, abstractions |
| **Portability** | Running in different environments | Containerization, abstraction layers |
| **Interoperability** | Working with other systems | Standard protocols, APIs |
| **Usability** | User experience | Client architecture, responsiveness |
| **Compliance** | Regulatory requirements | Audit trails, data handling |

## Constraints

### Technical Constraints

| Constraint | Examples |
|------------|----------|
| **Existing systems** | Must integrate with legacy ERP |
| **Technology mandates** | Must use company's standard database |
| **Infrastructure** | Must run on existing Kubernetes cluster |
| **Protocols** | Must expose REST API, not GraphQL |
| **Languages** | Must use approved language set |

### Organizational Constraints

| Constraint | Examples |
|------------|----------|
| **Team skills** | Team knows Python, not Go |
| **Team size** | Only 3 developers available |
| **Budget** | $5,000/month infrastructure limit |
| **Timeline** | Must ship MVP in 6 weeks |
| **Process** | Must pass security review |

### Regulatory Constraints

| Constraint | Examples |
|------------|----------|
| **Data residency** | EU data must stay in EU |
| **Retention** | Financial records kept 7 years |
| **Privacy** | GDPR right to deletion |
| **Industry** | HIPAA for healthcare data |
| **Audit** | All changes must be traceable |

## Prioritizing Drivers

Not all drivers are equal. Use priority levels:

| Priority | Meaning | Treatment |
|----------|---------|-----------|
| **P0** | Non-negotiable | Architecture MUST address |
| **P1** | Important | Architecture SHOULD address |
| **P2** | Nice to have | Address if possible |

### Prioritization Questions

1. **What happens if we don't meet this?**
   - Business fails? → P0
   - Users unhappy? → P1
   - Inconvenient? → P2

2. **How likely is the scenario?**
   - Happens daily? → Increase priority
   - Once a year? → Decrease priority

3. **Can we address it later?**
   - Requires re-architecture? → Address now
   - Incremental improvement? → Can defer

### Example Prioritization

```markdown
## Architectural Drivers: Order Management System

### P0 (Non-negotiable)
1. **Security** — Handles payment data, PCI compliance required
2. **Availability** — 99.9% uptime, orders are revenue
3. **Data integrity** — Cannot lose or corrupt orders

### P1 (Important)
4. **Performance** — Checkout <2s, affects conversion
5. **Scalability** — 10x growth expected in 2 years
6. **Auditability** — All changes must be traceable

### P2 (Nice to have)
7. **Extensibility** — May add new payment methods
8. **Portability** — May move clouds eventually

### Constraints
- Must integrate with existing inventory system (REST API)
- Team of 4 developers, Python/TypeScript skills
- $3,000/month infrastructure budget
- Ship MVP in 8 weeks
```

## Driver Documentation Template

```markdown
## Driver: [Name]

**Category:** Quality Attribute | Constraint | Business Goal

**Priority:** P0 | P1 | P2

**Description:**
[What is this driver? Why does it matter?]

**Quantified Requirement:**
[Specific, measurable target]

**Scenarios:**
1. [Scenario that exercises this driver]
2. [Another scenario]

**Architectural Impact:**
[How does this driver influence architecture decisions?]

**Trade-offs:**
[What might we sacrifice to address this driver?]
```

## Driver Analysis Checklist

```markdown
### Quality Attributes
- [ ] Performance requirements quantified
- [ ] Scalability targets defined
- [ ] Availability SLA specified
- [ ] Security requirements clear
- [ ] Maintainability needs understood

### Constraints
- [ ] Technical constraints documented
- [ ] Organizational constraints documented
- [ ] Regulatory constraints documented
- [ ] Budget constraints clear
- [ ] Timeline constraints clear

### Prioritization
- [ ] All drivers assigned priority
- [ ] P0 drivers are truly non-negotiable
- [ ] Trade-offs between drivers understood
- [ ] Stakeholders agree on priorities
```

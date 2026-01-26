# Evaluation Dimensions

How to assess architecture across different dimensions.

## Evaluation Framework

Architecture should be evaluated against:
1. **Quality Attributes** — Non-functional requirements
2. **Structural Soundness** — Design principles and patterns
3. **Operational Fitness** — Day-to-day operations
4. **Evolution Readiness** — Ability to change

For each dimension, assess:
- Current state (what exists)
- Target state (what's needed)
- Gap analysis (difference)
- Risk level (impact of gap)

## Quality Attributes

### Performance

| Aspect | Questions | Evidence Sources |
|--------|-----------|------------------|
| **Latency** | What are p50, p95, p99 response times? | APM, monitoring |
| **Throughput** | Requests per second? Transactions per hour? | Metrics, load tests |
| **Resource efficiency** | CPU, memory, I/O usage patterns? | Monitoring |
| **Bottlenecks** | Where do requests slow down? | Traces, profiling |

**Evaluation Criteria:**

```markdown
### Performance Assessment

**Current Metrics:**
- p50 latency: [Xms]
- p95 latency: [Xms]
- p99 latency: [Xms]
- Throughput: [X] req/sec
- Error rate: [X]%

**Target/SLA:**
- p95 latency: [Xms]
- Throughput: [X] req/sec
- Error rate: <[X]%

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor

**Evidence:**
[Links to dashboards, test results]

**Gaps:**
[Specific gaps between current and target]
```

### Scalability

| Aspect | Questions | Evidence Sources |
|--------|-----------|------------------|
| **Horizontal** | Can you add instances? Stateless? | Architecture, config |
| **Vertical** | Can you increase resources? | Resource limits |
| **Data** | Can database handle growth? Sharding? | DB metrics, schema |
| **Traffic** | Can it handle 10x traffic? | Load tests |

**Evaluation Criteria:**

```markdown
### Scalability Assessment

**Current Capacity:**
- Max concurrent users: [X]
- Max requests/sec: [X]
- Database size limit: [X]GB
- Known scaling limits: [Describe]

**Growth Projections:**
- Expected user growth: [X]% per year
- Expected data growth: [X]GB per month
- Peak traffic multiplier: [X]x normal

**Scaling Mechanisms:**
- [ ] Auto-scaling configured
- [ ] Stateless services
- [ ] Database read replicas
- [ ] Caching layer
- [ ] Queue-based load leveling

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor

**Gaps:**
[What can't scale? What's the first bottleneck?]
```

### Availability

| Aspect | Questions | Evidence Sources |
|--------|-----------|------------------|
| **Redundancy** | Single points of failure? | Architecture |
| **Failover** | Automatic failover? RTO? | Config, runbooks |
| **Recovery** | Backup strategy? RPO? | Backup config |
| **Degradation** | Graceful degradation? | Circuit breakers |

**Evaluation Criteria:**

```markdown
### Availability Assessment

**Current State:**
- Uptime (last 12 months): [X]%
- MTTR (mean time to recover): [X] minutes
- Number of outages: [X]
- Longest outage: [X] minutes

**SLA Requirements:**
- Target uptime: [X]%
- Maximum RTO: [X] minutes
- Maximum RPO: [X] minutes

**Redundancy Checklist:**
- [ ] Load balancer redundancy
- [ ] Application server redundancy
- [ ] Database redundancy (failover)
- [ ] Cache redundancy
- [ ] Multi-AZ/region deployment

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor

**Single Points of Failure:**
[List any SPOFs found]
```

### Security

| Aspect | Questions | Evidence Sources |
|--------|-----------|------------------|
| **Authentication** | How are users authenticated? | Code, config |
| **Authorization** | How are permissions enforced? | Code, policies |
| **Data protection** | Encryption at rest/transit? | Config, code |
| **Attack surface** | Exposed endpoints? Input validation? | Security scan |

**Evaluation Criteria:**

```markdown
### Security Assessment

**Authentication:**
- [ ] Strong authentication mechanism
- [ ] MFA available/enforced
- [ ] Session management secure
- [ ] Password policies adequate

**Authorization:**
- [ ] Principle of least privilege
- [ ] Role-based access control
- [ ] Authorization checked at every layer
- [ ] No privilege escalation paths

**Data Protection:**
- [ ] Encryption in transit (TLS)
- [ ] Encryption at rest
- [ ] Secrets management (no hardcoded)
- [ ] PII handling compliant

**Infrastructure:**
- [ ] Network segmentation
- [ ] Firewall rules appropriate
- [ ] Security patches current
- [ ] Logging and audit trails

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor

**Critical Findings:**
[Any immediate security concerns]
```

### Maintainability

| Aspect | Questions | Evidence Sources |
|--------|-----------|------------------|
| **Complexity** | Cyclomatic complexity? Module size? | Static analysis |
| **Documentation** | Up to date? Complete? | Docs review |
| **Testing** | Test coverage? Test quality? | Coverage reports |
| **Onboarding** | How long for new dev to contribute? | Interviews |

**Evaluation Criteria:**

```markdown
### Maintainability Assessment

**Code Quality:**
- Test coverage: [X]%
- Static analysis issues: [X] critical, [X] high
- Average module size: [X] lines
- Cyclomatic complexity: [X] average

**Documentation:**
- [ ] Architecture documented
- [ ] API documented
- [ ] Runbooks exist and current
- [ ] ADRs for major decisions

**Development Experience:**
- Time to set up local env: [X] hours
- Time for new dev to first PR: [X] days
- Build time: [X] minutes
- Test suite time: [X] minutes

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor

**Key Concerns:**
[What makes this hard to maintain?]
```

## Structural Soundness

### Modularity

| Principle | Questions | Signs of Problems |
|-----------|-----------|-------------------|
| **Separation of concerns** | Does each module have one job? | God classes, mixed responsibilities |
| **Information hiding** | Are internals encapsulated? | Reaching into other modules |
| **Clear interfaces** | Well-defined contracts? | Implicit dependencies |

**Evaluation:**

```markdown
### Modularity Assessment

**Module Structure:**
| Module | Responsibility | Dependencies | Size | Issues |
|--------|---------------|--------------|------|--------|
| [Name] | [Purpose] | [Count] | [LOC] | [Issues] |

**Modularity Issues:**
- [ ] God classes/services (>1000 LOC)
- [ ] Modules with >10 dependencies
- [ ] Circular dependencies
- [ ] Shared mutable state

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

### Coupling

| Type | Description | Impact |
|------|-------------|--------|
| **Content** | Accessing another module's internals | High (worst) |
| **Common** | Sharing global data | High |
| **Control** | Passing control flags | Medium |
| **Stamp** | Sharing complex data structures | Medium |
| **Data** | Passing only needed data | Low (best) |

**Evaluation:**

```markdown
### Coupling Assessment

**Service Dependencies:**
```
[Dependency graph or matrix]
```

**Coupling Issues Found:**
| From | To | Type | Severity | Notes |
|------|-----|------|----------|-------|
| [Service A] | [Service B] | [Type] | [H/M/L] | [Notes] |

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

### Cohesion

| Type | Description | Quality |
|------|-------------|---------|
| **Functional** | All parts contribute to single task | High (best) |
| **Sequential** | Output of one is input to next | Good |
| **Communicational** | Operate on same data | Good |
| **Procedural** | Related by execution order | Medium |
| **Temporal** | Happen at same time | Low |
| **Logical** | Grouped by category | Low |
| **Coincidental** | No meaningful relationship | Low (worst) |

**Evaluation:**

```markdown
### Cohesion Assessment

**Module Analysis:**
| Module | Cohesion Type | Issues |
|--------|--------------|--------|
| [Name] | [Type] | [Issues] |

**Low Cohesion Indicators:**
- [ ] Modules with "Utils" or "Helpers" names
- [ ] Modules with multiple unrelated functions
- [ ] Changes require touching many modules

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

## Operational Fitness

### Deployability

| Aspect | Questions | Evidence |
|--------|-----------|----------|
| **Automation** | How automated is deployment? | CI/CD config |
| **Frequency** | How often can you deploy? | Deployment logs |
| **Risk** | Downtime required? Rollback available? | Process docs |
| **Independence** | Can services deploy independently? | Dependencies |

**Evaluation:**

```markdown
### Deployability Assessment

**Deployment Process:**
- Deployment frequency: [X] per [week/day]
- Deployment automation: [Manual | Semi-auto | Fully automated]
- Average deployment time: [X] minutes
- Downtime required: [Yes/No]
- Rollback capability: [Yes/No/Partial]
- Rollback time: [X] minutes

**Deployment Checklist:**
- [ ] Automated CI/CD pipeline
- [ ] Automated testing before deploy
- [ ] Blue/green or canary deployment
- [ ] Automated rollback on failure
- [ ] Independent service deployment

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

### Observability

| Pillar | Questions | Evidence |
|--------|-----------|----------|
| **Metrics** | Key metrics tracked? Dashboards? | Monitoring tools |
| **Logs** | Structured? Searchable? Retained? | Log system |
| **Traces** | Distributed tracing? Request correlation? | APM tools |
| **Alerts** | Alert coverage? Actionable? | Alert config |

**Evaluation:**

```markdown
### Observability Assessment

**Metrics:**
- [ ] Application metrics (latency, errors, throughput)
- [ ] Infrastructure metrics (CPU, memory, disk)
- [ ] Business metrics (orders, users, revenue)
- [ ] Dashboards for each service
- [ ] SLI/SLO tracking

**Logging:**
- [ ] Structured logging (JSON)
- [ ] Log aggregation (centralized)
- [ ] Log retention policy
- [ ] Searchable logs
- [ ] Request ID correlation

**Tracing:**
- [ ] Distributed tracing implemented
- [ ] Request flow visualization
- [ ] Latency breakdown available
- [ ] Error traces captured

**Alerting:**
- [ ] Alerts for critical metrics
- [ ] Alert routing configured
- [ ] Runbooks linked to alerts
- [ ] Alert fatigue managed

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

## Evolution Readiness

### Extensibility

| Aspect | Questions | Evidence |
|--------|-----------|----------|
| **Plugin points** | Where can behavior be extended? | Code review |
| **Configuration** | What's configurable vs hardcoded? | Config review |
| **Abstraction** | Are extension points abstracted? | Code review |

### Modifiability

| Aspect | Questions | Evidence |
|--------|-----------|----------|
| **Change impact** | How much code for typical change? | Git history |
| **Test confidence** | Can you safely refactor? | Test coverage |
| **Technical debt** | Accumulated shortcuts? | Code review |

**Evaluation:**

```markdown
### Evolution Readiness Assessment

**Change Analysis (last 6 months):**
- Average files per feature: [X]
- Average services touched per feature: [X]
- Hotspot files (>10 changes): [List]
- Regression rate: [X]%

**Extension Points:**
| Area | Mechanism | Difficulty |
|------|-----------|------------|
| [Area] | [How extended] | [Easy/Medium/Hard] |

**Technical Debt Indicators:**
- [ ] TODO/FIXME comments: [X] count
- [ ] Known workarounds: [List]
- [ ] Deprecated dependencies: [X] count
- [ ] "Don't touch" areas: [List]

**Rating:** ✅ Good | ⚠️ Partial | ❌ Poor
```

## Evaluation Summary Template

```markdown
# Architecture Evaluation Summary

## Overall Assessment

| Dimension | Rating | Key Finding |
|-----------|--------|-------------|
| Performance | [Rating] | [One-line summary] |
| Scalability | [Rating] | [One-line summary] |
| Availability | [Rating] | [One-line summary] |
| Security | [Rating] | [One-line summary] |
| Maintainability | [Rating] | [One-line summary] |
| Modularity | [Rating] | [One-line summary] |
| Coupling | [Rating] | [One-line summary] |
| Deployability | [Rating] | [One-line summary] |
| Observability | [Rating] | [One-line summary] |
| Evolution | [Rating] | [One-line summary] |

## Rating Distribution

- ✅ Good: [X] dimensions
- ⚠️ Partial: [X] dimensions
- ❌ Poor: [X] dimensions

## Critical Gaps

1. [Most critical gap]
2. [Second critical gap]
3. [Third critical gap]
```

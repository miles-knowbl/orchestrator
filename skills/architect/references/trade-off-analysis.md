# Trade-off Analysis

Evaluating architectural trade-offs systematically.

## Why Trade-offs Matter

Every architectural decision involves trade-offs. There is no "best" architecture — only architectures that are better or worse for specific contexts and priorities.

**The goal:** Make trade-offs explicit, so stakeholders understand what they're getting and what they're giving up.

## Common Architectural Trade-offs

### Fundamental Trade-offs

| Trade-off | Tension |
|-----------|---------|
| **Consistency vs Availability** | Strong consistency requires coordination, which reduces availability |
| **Latency vs Throughput** | Batching improves throughput but increases latency |
| **Performance vs Simplicity** | Optimizations add complexity |
| **Flexibility vs Focus** | Generic solutions are harder to optimize |
| **Control vs Speed** | Building gives control; buying is faster |
| **Coupling vs Cohesion** | Loose coupling can reduce cohesion |

### Technology Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **SQL vs NoSQL** | ACID guarantees vs flexibility and scale |
| **Monolith vs Microservices** | Simplicity vs independent scaling |
| **Server vs Serverless** | Control vs operational simplicity |
| **REST vs GraphQL** | Simplicity vs flexibility |
| **Synchronous vs Asynchronous** | Simplicity vs resilience |

### Operational Trade-offs

| Decision | Trade-off |
|----------|-----------|
| **Multi-tenant vs Single-tenant** | Efficiency vs isolation |
| **Cloud vs On-prem** | Flexibility vs control |
| **Managed vs Self-hosted** | Cost vs control |
| **Active-active vs Active-passive** | Availability vs complexity |

## Trade-off Analysis Methods

### 1. Weighted Scoring Matrix

Assign weights to criteria based on priorities, score each option:

```markdown
### Scoring Matrix: Database Selection

**Criteria weights (total 10):**
- Performance: 3
- Scalability: 3
- Simplicity: 2
- Cost: 2

**Scoring (1-5):**

| Criterion | Weight | PostgreSQL | DynamoDB | MongoDB |
|-----------|--------|------------|----------|---------|
| Performance | 3 | 4 (12) | 5 (15) | 4 (12) |
| Scalability | 3 | 3 (9) | 5 (15) | 4 (12) |
| Simplicity | 2 | 5 (10) | 3 (6) | 4 (8) |
| Cost | 2 | 5 (10) | 2 (4) | 3 (6) |
| **Total** | | **41** | **40** | **38** |

**Result:** PostgreSQL wins slightly, mainly due to simplicity and cost.
```

### 2. SWOT Analysis

For each option, analyze:

```markdown
### SWOT: Microservices Architecture

**Strengths:**
- Independent deployment and scaling
- Technology flexibility per service
- Team autonomy

**Weaknesses:**
- Distributed system complexity
- Network latency between services
- Operational overhead

**Opportunities:**
- Can adopt new technologies incrementally
- Can scale team with clear boundaries

**Threats:**
- Team too small to manage effectively
- Debugging distributed issues is hard
- Could over-engineer for current scale
```

### 3. Risk-Based Analysis

Focus on what could go wrong:

```markdown
### Risk Analysis: Serverless Architecture

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cold start latency | High | Medium | Provisioned concurrency |
| Vendor lock-in | Medium | High | Abstract provider interfaces |
| Runaway costs | Medium | High | Budget alerts, throttling |
| Debugging difficulty | High | Medium | Structured logging, tracing |
| Execution time limits | Low | High | Break into smaller functions |

**Risk Score:** Medium-High

**Accept if:** Cost savings outweigh operational complexity,
team comfortable with observability tooling.
```

### 4. Cost-Benefit Analysis

Quantify costs and benefits where possible:

```markdown
### Cost-Benefit: Build vs Buy (Auth System)

**Build:**
- Development cost: ~$50,000 (2 engineers × 2 months)
- Maintenance cost: ~$2,000/month (ongoing)
- Time to production: 2 months
- Benefits: Full control, no per-user fees

**Buy (Auth0):**
- Development cost: ~$5,000 (integration)
- Subscription cost: ~$3,000/month (at expected scale)
- Time to production: 2 weeks
- Benefits: Faster, proven security, compliance features

**Break-even analysis:**
- Build saves $1,000/month after initial investment
- Break-even: ~50 months
- But: Time-to-market value of 6 weeks worth ~$30,000

**Decision:** Buy. Time-to-market value exceeds long-term savings.
```

### 5. Reversibility Analysis

How hard is it to change this decision later?

```markdown
### Reversibility Analysis

| Decision | Reversibility | Effort to Change |
|----------|---------------|------------------|
| Programming language | Low | Rewrite |
| Database type | Low | Data migration + rewrite |
| Cloud provider | Medium | Infrastructure rebuild |
| API design | Medium | Versioning + migration |
| Framework choice | Medium | Incremental rewrite |
| Service boundaries | Medium-High | Refactoring |
| Caching strategy | High | Configuration change |
| Feature flag system | High | Easy to change |

**Principle:** Be extra careful with low-reversibility decisions.
Prefer high-reversibility options when differences are small.
```

## Trade-off Documentation

### Trade-off Summary Template

```markdown
## Trade-off: [Decision]

### Options Considered
1. Option A: [Brief description]
2. Option B: [Brief description]
3. Option C: [Brief description]

### Key Trade-offs

| Aspect | Option A | Option B | Option C |
|--------|----------|----------|----------|
| [Aspect 1] | [Rating] | [Rating] | [Rating] |
| [Aspect 2] | [Rating] | [Rating] | [Rating] |

### What We Gain
- [Benefit 1 from chosen option]
- [Benefit 2 from chosen option]

### What We Give Up
- [Trade-off accepted 1]
- [Trade-off accepted 2]

### Why This Trade-off Is Acceptable
[Explanation of why the benefits outweigh the costs]

### Conditions That Would Change This Decision
- If [condition], we would reconsider because [reason]
- If [condition], Option B becomes better because [reason]
```

## Example: Complete Trade-off Analysis

### Synchronous vs Asynchronous Order Processing

**Context:** E-commerce system needs to process orders. Each order involves inventory check, payment processing, and notification.

---

**Option A: Synchronous (All in One Request)**

```
User → API → Check Inventory → Process Payment → Send Notification → Response
```

*Pros:*
- Simple to implement and debug
- Immediate feedback to user
- Transactional (all or nothing)

*Cons:*
- Slow response (sum of all operations)
- Single failure fails entire order
- Can't scale operations independently

---

**Option B: Asynchronous (Queue-Based)**

```
User → API → Queue → [Workers process independently] → Response via webhook/polling
```

*Pros:*
- Fast initial response
- Resilient to individual failures
- Operations scale independently

*Cons:*
- Complex error handling
- Eventual consistency
- User doesn't get immediate confirmation

---

**Option C: Hybrid (Sync Critical, Async Rest)**

```
User → API → Check Inventory → Process Payment → Response
                    ↓
              Queue → Send Notification (async)
```

*Pros:*
- Fast for critical path
- User gets payment confirmation
- Non-critical work is resilient

*Cons:*
- Moderate complexity
- Must decide what's critical
- Partial failure scenarios

---

**Trade-off Matrix:**

| Criterion | Weight | Sync | Async | Hybrid |
|-----------|--------|------|-------|--------|
| User experience | 4 | 3 (12) | 2 (8) | 4 (16) |
| Reliability | 3 | 2 (6) | 4 (12) | 3 (9) |
| Simplicity | 2 | 5 (10) | 2 (4) | 3 (6) |
| Scalability | 2 | 2 (4) | 5 (10) | 4 (8) |
| **Total** | | **32** | **34** | **39** |

**Decision:** Hybrid approach

**What we gain:**
- Fast checkout experience
- Guaranteed payment confirmation
- Resilient notification delivery

**What we give up:**
- Simplicity of pure sync
- Full async scalability

**Why acceptable:**
- User experience is top priority (P0)
- Notifications are not critical path
- Complexity is manageable for team

**Would reconsider if:**
- Order volume exceeds 10K/hour → Move to full async
- Payment provider has frequent timeouts → Add async payment with polling

## Trade-off Anti-patterns

### 1. Analysis Paralysis
**Problem:** Endless analysis without decision
**Solution:** Set a timebox. Decide with 70% confidence.

### 2. Hidden Trade-offs
**Problem:** Trade-offs not documented
**Solution:** Every decision needs explicit "what we give up"

### 3. False Dichotomies
**Problem:** Only considering two options
**Solution:** Always generate at least three options

### 4. Ignoring Reversibility
**Problem:** Treating all decisions as permanent
**Solution:** Explicitly assess reversibility, prefer reversible when close

### 5. Quantifying the Unquantifiable
**Problem:** Forcing numbers on qualitative trade-offs
**Solution:** Use qualitative comparison (✅ ⚠️ ❌) where appropriate

## Trade-off Analysis Checklist

```markdown
- [ ] Multiple options genuinely considered
- [ ] Criteria aligned with architectural drivers
- [ ] Weights reflect actual priorities
- [ ] Scores are justified, not arbitrary
- [ ] Trade-offs explicitly documented
- [ ] "What we give up" is clear
- [ ] Reversibility assessed
- [ ] Conditions for reconsidering documented
- [ ] Stakeholders understand trade-offs
```

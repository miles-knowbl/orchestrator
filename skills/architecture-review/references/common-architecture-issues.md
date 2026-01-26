# Common Architecture Issues

Catalog of typical architectural problems and how to identify them.

## Structural Issues

### 1. Circular Dependencies

**Description:** Service A depends on B, B depends on C, C depends on A.

**Symptoms:**
- Cannot deploy services independently
- Changes cascade unpredictably
- Build order is fragile or impossible
- Difficult to understand data flow

**How to Detect:**
```bash
# Visualize dependencies
# Look for cycles in dependency graph

# Code analysis - find imports
grep -r "import.*from" src/ | \
  awk -F: '{print $1 " -> " $2}' | \
  sort | uniq
```

**Root Causes:**
- Organic growth without design review
- Shared concepts not properly abstracted
- Convenience over architecture

**Resolution Patterns:**
- Extract shared dependency to new module
- Dependency inversion (depend on abstractions)
- Event-driven communication to break sync dependency

---

### 2. God Class/Service

**Description:** Single component that knows/does too much.

**Symptoms:**
- Class/service >1000 lines
- Multiple unrelated responsibilities
- Changes to unrelated features touch same file
- Many incoming dependencies

**How to Detect:**
```bash
# Find large files
find . -name "*.ts" -exec wc -l {} + | sort -rn | head -20

# Find files with many imports
grep -c "^import" src/**/*.ts | sort -t: -k2 -rn | head -20

# Find classes with many methods
grep -c "function\|def\|public\|private" src/**/*.ts | sort -t: -k2 -rn
```

**Root Causes:**
- "Just add it here" mentality
- Unclear module boundaries
- No time allocated for refactoring

**Resolution Patterns:**
- Extract class (single responsibility)
- Facade pattern (if interface must stay)
- Vertical slice refactoring

---

### 3. Distributed Monolith

**Description:** Microservices that must be deployed together.

**Symptoms:**
- Cross-service changes for simple features
- Coordinated deployments required
- Shared database schemas
- Sync calls in critical path

**How to Detect:**
- Map recent features to services touched
- Count coordinated deployments
- Identify shared tables across services
- Trace request paths through services

**Root Causes:**
- Split by layer instead of domain
- Shared database not separated
- No API versioning/contracts
- Sync over async by default

**Resolution Patterns:**
- Merge back to monolith (if appropriate)
- Domain-driven boundaries
- Database per service
- Async communication via events

---

### 4. Leaky Abstractions

**Description:** Implementation details exposed through interfaces.

**Symptoms:**
- Callers need to know internal details
- Changes to internals break callers
- Error messages expose internals
- Configuration leaked to callers

**How to Detect:**
- Review public interfaces for internal types
- Check error handling for internal errors
- Look for configuration passed through layers

**Root Causes:**
- Insufficient abstraction design
- Time pressure to ship
- Direct database access from UI

**Resolution Patterns:**
- Anti-corruption layer
- DTO/ViewModel separation
- Proper error transformation

---

### 5. Spaghetti Architecture

**Description:** No clear structure, everything can call everything.

**Symptoms:**
- No discernible layers or boundaries
- Random file organization
- Inconsistent patterns across codebase
- New developers can't understand system

**How to Detect:**
- Visualize all dependencies (usually a mess)
- Ask developers to draw architecture (inconsistent answers)
- Count patterns used (too many)

**Root Causes:**
- No architecture governance
- High developer turnover
- "Just make it work" culture

**Resolution Patterns:**
- Define and document architecture
- Establish module boundaries
- Incremental restructuring
- Architecture fitness functions

## Quality Attribute Issues

### 6. Single Point of Failure

**Description:** Component whose failure takes down the system.

**Symptoms:**
- Past incidents from single component failure
- No redundancy in architecture
- No failover mechanism
- All traffic through single instance

**How to Detect:**
```markdown
SPOF Checklist:
- [ ] Database: Single instance? No replica?
- [ ] Load balancer: Single? No health checks?
- [ ] Application: Single instance? No auto-restart?
- [ ] Cache: Single? No fallback?
- [ ] Queue: Single? No redundancy?
- [ ] External dependency: No fallback?
```

**Root Causes:**
- Cost optimization over reliability
- Prototype that became production
- "It hasn't failed yet" mentality

**Resolution Patterns:**
- Add redundancy at failure points
- Implement failover mechanisms
- Graceful degradation
- Circuit breakers for dependencies

---

### 7. N+1 Query Problem

**Description:** Database query per item in a list.

**Symptoms:**
- Response time grows with data size
- Database connection exhaustion
- High database CPU/I/O
- Slow list/collection endpoints

**How to Detect:**
```sql
-- PostgreSQL: Find slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 20;
```

```javascript
// Look for patterns like:
const users = await getUsers();
for (const user of users) {
  user.orders = await getOrdersForUser(user.id); // N+1!
}
```

**Root Causes:**
- ORM lazy loading defaults
- Convenience over performance
- Lack of database query monitoring

**Resolution Patterns:**
- Eager loading / JOIN queries
- Batch queries (WHERE IN)
- DataLoader pattern
- Query result caching

---

### 8. Unbounded Operations

**Description:** Operations with no limits that can exhaust resources.

**Symptoms:**
- Memory exhaustion on large data
- Timeout on large operations
- Database locks held too long
- API returns massive payloads

**How to Detect:**
- Search for queries without LIMIT
- Find APIs without pagination
- Look for loops without bounds
- Check for streaming vs loading all

**Root Causes:**
- "Works fine in dev" (small data)
- Pagination not required in spec
- No performance testing

**Resolution Patterns:**
- Add pagination to all list operations
- Set reasonable default limits
- Streaming for large datasets
- Background jobs for heavy operations

---

### 9. Missing Rate Limiting

**Description:** No protection against request floods.

**Symptoms:**
- System vulnerable to DoS
- Abusive users affect others
- External API quotas exhausted
- Unpredictable resource usage

**How to Detect:**
- Check for rate limiting middleware
- Test with high request volume
- Review API gateway configuration

**Root Causes:**
- "We trust our users"
- Internal-only system assumption
- Complexity deferred

**Resolution Patterns:**
- Rate limiting middleware
- API gateway rate limits
- Per-user/tenant limits
- Graceful degradation under load

## Operational Issues

### 10. No Observability

**Description:** Can't see what the system is doing.

**Symptoms:**
- "I don't know why it's slow"
- Debugging requires log diving
- Alerts are noisy or missing
- Incidents take hours to diagnose

**How to Detect:**
```markdown
Observability Gaps:
- [ ] No application metrics
- [ ] No request tracing
- [ ] Logs not structured
- [ ] No alerting
- [ ] No dashboards
- [ ] Can't correlate logs across services
```

**Root Causes:**
- "We'll add monitoring later"
- No observability standards
- Cost of observability tools

**Resolution Patterns:**
- Structured logging from day one
- OpenTelemetry instrumentation
- SLO-based alerting
- Runbook-linked alerts

---

### 11. Deployment Coupling

**Description:** Changes require coordinated deploys.

**Symptoms:**
- "Deploy A then B within 5 minutes"
- Deployment order matters
- Rollback requires multiple services
- Can't deploy during business hours

**How to Detect:**
- Review deployment procedures
- Check for deployment order dependencies
- Count coordinated deployments per month

**Root Causes:**
- Breaking API changes
- Shared database schemas
- No API versioning
- Tightly coupled services

**Resolution Patterns:**
- API versioning
- Expand-contract migrations
- Feature flags
- Database per service

---

### 12. Configuration Sprawl

**Description:** Configuration scattered and inconsistent.

**Symptoms:**
- Different config formats across services
- Secrets in multiple locations
- Environment differences cause bugs
- Config changes require redeploys

**How to Detect:**
- Count configuration sources
- Check for hardcoded values
- Verify secrets management
- Compare environments

**Root Causes:**
- Organic growth
- No configuration standard
- Each service does its own thing

**Resolution Patterns:**
- Centralized configuration service
- Environment variable standards
- Secrets management (Vault, etc.)
- Configuration-as-code

## Evolution Issues

### 13. Frozen Codebase

**Description:** Code too risky to change.

**Symptoms:**
- "Don't touch that file"
- No tests for critical code
- All changes are workarounds
- Only original author understands it

**How to Detect:**
- Ask about areas devs avoid
- Check test coverage of old code
- Review workarounds and TODOs
- Git blame for bus factor

**Root Causes:**
- Technical debt accumulation
- No time for refactoring
- Original developers left
- Fear of breaking production

**Resolution Patterns:**
- Characterization tests first
- Strangler fig pattern
- Incremental refactoring
- Mob programming on scary code

---

### 14. Dependency Hell

**Description:** Tangled, outdated, or conflicting dependencies.

**Symptoms:**
- Security vulnerabilities in deps
- Version conflicts
- Transitive dependency issues
- Major version upgrades blocked

**How to Detect:**
```bash
# Check for outdated packages
npm outdated
pip list --outdated

# Check for vulnerabilities
npm audit
safety check
```

**Root Causes:**
- No dependency update process
- Major version upgrade fear
- Pinned old versions
- Too many dependencies

**Resolution Patterns:**
- Regular dependency updates
- Automated security scanning
- Dependency update PRs (Dependabot)
- Evaluate dependency necessity

---

### 15. Bus Factor = 1

**Description:** Only one person understands critical systems.

**Symptoms:**
- "Ask Bob, he's the only one who knows"
- Documentation nonexistent or outdated
- Tribal knowledge for operations
- Vacation causes anxiety

**How to Detect:**
- Git blame analysis (single author)
- Knowledge survey of team
- Check who handles incidents
- Review documentation coverage

**Root Causes:**
- Specialized systems
- No knowledge sharing culture
- Documentation not valued
- High turnover

**Resolution Patterns:**
- Pair programming rotation
- Documentation requirements
- Cross-training sessions
- ADRs for decisions

## Issue Documentation Template

```markdown
### Issue: [Title]

**ID:** ARCH-[###]

**Category:** [Structural | Quality | Operational | Evolution]

**Severity:** [Critical | High | Medium | Low]

**Description:**
[What is the issue?]

**Evidence:**
- [Specific evidence 1]
- [Specific evidence 2]

**Impact:**
- [Impact on users]
- [Impact on development]
- [Impact on operations]

**Affected Areas:**
- [Component/Service 1]
- [Component/Service 2]

**Related Issues:**
- [Related issue IDs]

**Recommendation:**
[Brief recommendation]

**Effort Estimate:** [T-shirt size]

**Risk if Not Addressed:**
[What happens if we ignore this?]
```

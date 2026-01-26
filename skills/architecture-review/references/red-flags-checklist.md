# Red Flags Checklist

Warning signs that require immediate attention during architecture review.

## Critical Red Flags

These issues represent immediate risk and should be escalated:

### Security Critical

```markdown
## Security Red Flags 🚨

### Authentication/Authorization
- [ ] 🚩 No authentication on public endpoints
- [ ] 🚩 No authentication on internal service calls
- [ ] 🚩 Hard-coded credentials in source code
- [ ] 🚩 Passwords stored in plain text
- [ ] 🚩 No authorization checks (any user can access anything)
- [ ] 🚩 JWT secrets are weak or shared across environments

### Data Protection
- [ ] 🚩 PII transmitted without encryption
- [ ] 🚩 Database accessible from public internet
- [ ] 🚩 Secrets in environment variables visible in logs
- [ ] 🚩 API keys committed to version control
- [ ] 🚩 No encryption at rest for sensitive data
- [ ] 🚩 Backup data not encrypted

### Input Handling
- [ ] 🚩 Direct SQL query construction with user input
- [ ] 🚩 User input rendered without sanitization
- [ ] 🚩 File paths constructed from user input
- [ ] 🚩 Command execution with user input
- [ ] 🚩 Deserialization of untrusted data

**If any checked: STOP and report immediately**
```

### Availability Critical

```markdown
## Availability Red Flags 🚨

### Single Points of Failure
- [ ] 🚩 Single database instance, no replica
- [ ] 🚩 Single application server, no redundancy
- [ ] 🚩 No load balancer or single load balancer
- [ ] 🚩 Single region deployment for critical system
- [ ] 🚩 External dependency with no fallback

### Recovery
- [ ] 🚩 No backups exist
- [ ] 🚩 Backups never tested
- [ ] 🚩 No documented recovery procedure
- [ ] 🚩 Recovery would take days
- [ ] 🚩 Data loss would be unrecoverable

### Resilience
- [ ] 🚩 Cascading failure possible (no circuit breakers)
- [ ] 🚩 No timeouts on external calls
- [ ] 🚩 No retry logic for transient failures
- [ ] 🚩 Memory leaks that will eventually crash

**If any checked: Requires immediate remediation plan**
```

### Data Critical

```markdown
## Data Red Flags 🚨

### Integrity
- [ ] 🚩 No referential integrity (orphaned records possible)
- [ ] 🚩 No constraints on critical fields
- [ ] 🚩 Race conditions can corrupt data
- [ ] 🚩 No transaction boundaries for related operations
- [ ] 🚩 Data can be silently lost

### Compliance
- [ ] 🚩 PII retention without policy
- [ ] 🚩 No audit trail for sensitive operations
- [ ] 🚩 Cannot support right-to-deletion requests
- [ ] 🚩 Data residency requirements violated
- [ ] 🚩 Regulatory requirements not met (GDPR, HIPAA, etc.)

**If any checked: Legal/compliance review needed**
```

## High Priority Red Flags

These issues represent significant risk and should be addressed soon:

### Structural High

```markdown
## Structural Red Flags ⚠️

### Coupling
- [ ] ⚠️ Circular dependencies between services/modules
- [ ] ⚠️ God class/service (>2000 lines, 20+ methods)
- [ ] ⚠️ Shared database between services
- [ ] ⚠️ Every change requires multiple coordinated deploys
- [ ] ⚠️ Cannot deploy any service independently

### Complexity
- [ ] ⚠️ Cyclomatic complexity >20 in critical paths
- [ ] ⚠️ Deep inheritance hierarchies (>4 levels)
- [ ] ⚠️ Classes with >20 dependencies
- [ ] ⚠️ Files with >50 imports
- [ ] ⚠️ No discernible architecture pattern

### Maintainability
- [ ] ⚠️ No tests for critical business logic
- [ ] ⚠️ Test coverage <20% overall
- [ ] ⚠️ "Don't touch" areas in codebase
- [ ] ⚠️ Only one person understands critical code
- [ ] ⚠️ Documentation is completely wrong/outdated

**Impact: Development velocity and reliability**
```

### Performance High

```markdown
## Performance Red Flags ⚠️

### Current Issues
- [ ] ⚠️ Response times 10x over target
- [ ] ⚠️ N+1 queries in critical paths
- [ ] ⚠️ No caching for expensive operations
- [ ] ⚠️ Synchronous calls where async appropriate
- [ ] ⚠️ Loading entire datasets into memory

### Scalability
- [ ] ⚠️ Cannot add more instances (stateful)
- [ ] ⚠️ Database is bottleneck with no scaling plan
- [ ] ⚠️ No pagination on list endpoints
- [ ] ⚠️ Background jobs block user requests
- [ ] ⚠️ 10x traffic would cause outage

**Impact: User experience and capacity**
```

### Operational High

```markdown
## Operational Red Flags ⚠️

### Observability
- [ ] ⚠️ No application monitoring
- [ ] ⚠️ No alerting on critical metrics
- [ ] ⚠️ Cannot trace requests across services
- [ ] ⚠️ Logs not centralized or searchable
- [ ] ⚠️ No way to know system is degraded

### Deployment
- [ ] ⚠️ Deployments require downtime
- [ ] ⚠️ No rollback capability
- [ ] ⚠️ Manual deployment steps
- [ ] ⚠️ Cannot deploy during business hours
- [ ] ⚠️ Deployment takes >1 hour

### Incident Response
- [ ] ⚠️ No runbooks for common issues
- [ ] ⚠️ No on-call rotation
- [ ] ⚠️ Mean time to recovery >4 hours
- [ ] ⚠️ Same incidents repeat without fix

**Impact: Reliability and operational efficiency**
```

## Medium Priority Red Flags

These issues should be addressed but aren't urgent:

```markdown
## Medium Priority Red Flags 📋

### Technical Debt
- [ ] 📋 Many TODO/FIXME comments (>50)
- [ ] 📋 Deprecated dependencies in use
- [ ] 📋 Multiple ways to do the same thing
- [ ] 📋 Inconsistent coding patterns
- [ ] 📋 Copy-paste code across modules

### Documentation
- [ ] 📋 No architecture documentation
- [ ] 📋 No API documentation
- [ ] 📋 No onboarding documentation
- [ ] 📋 No ADRs for major decisions
- [ ] 📋 README is default template

### Development Experience
- [ ] 📋 Local setup takes >1 day
- [ ] 📋 Build takes >10 minutes
- [ ] 📋 Tests take >30 minutes
- [ ] 📋 Flaky tests ignored
- [ ] 📋 No development environment parity

### API Design
- [ ] 📋 Inconsistent API conventions
- [ ] 📋 No API versioning strategy
- [ ] 📋 Breaking changes without deprecation
- [ ] 📋 Poor error messages
- [ ] 📋 No rate limiting

**Impact: Developer productivity and future maintainability**
```

## Red Flag Response Guide

### Immediate Actions (Critical)

```markdown
## When You Find a Critical Red Flag

1. **Document it immediately**
   - What is the issue?
   - What is the potential impact?
   - What evidence do you have?

2. **Assess blast radius**
   - Who/what is affected?
   - Is it actively being exploited/failing?
   - What's the worst case?

3. **Escalate appropriately**
   - Security issues → Security team + leadership
   - Availability issues → Engineering leadership + on-call
   - Compliance issues → Legal + compliance team

4. **Propose immediate mitigation**
   - What can be done RIGHT NOW to reduce risk?
   - Not the full fix, just stop the bleeding

5. **Track to resolution**
   - Create high-priority ticket
   - Assign clear owner
   - Set deadline for resolution
```

### High Priority Response

```markdown
## When You Find a High Priority Red Flag

1. **Document thoroughly**
   - Root cause analysis
   - Impact assessment
   - Resolution options

2. **Prioritize in backlog**
   - Add to current sprint if critical path
   - Schedule for next sprint otherwise

3. **Create remediation plan**
   - Steps to fix
   - Effort estimate
   - Risk during fix

4. **Communicate**
   - Stakeholders aware of risk
   - Timeline for resolution
```

### Medium Priority Response

```markdown
## When You Find a Medium Priority Red Flag

1. **Add to technical debt register**
   - Document the issue
   - Estimate effort to fix
   - Note impact if not fixed

2. **Prioritize periodically**
   - Review in sprint planning
   - Address during related work
   - Schedule dedicated debt sprints
```

## Summary Template

```markdown
## Red Flags Summary

### Critical (Immediate Action Required)
| Flag | Category | Evidence | Owner | Status |
|------|----------|----------|-------|--------|
| [Flag] | [Security/Availability/Data] | [Evidence] | [Owner] | [Status] |

### High Priority (Address Soon)
| Flag | Category | Impact | Priority |
|------|----------|--------|----------|
| [Flag] | [Category] | [Impact] | [Sprint/Quarter] |

### Medium Priority (Backlog)
| Flag | Category | Effort | Timeframe |
|------|----------|--------|-----------|
| [Flag] | [Category] | [T-shirt] | [When to address] |

### Risk Assessment

**Overall Risk Level:** [Critical | High | Medium | Low]

**Highest Risk Areas:**
1. [Area 1]
2. [Area 2]
3. [Area 3]

**Recommended Immediate Actions:**
1. [Action 1]
2. [Action 2]
3. [Action 3]
```

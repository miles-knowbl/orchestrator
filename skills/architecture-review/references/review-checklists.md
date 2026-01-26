# Review Checklists

Dimension-specific checklists for systematic architecture review.

## How to Use These Checklists

1. **Select relevant checklists** based on review scope
2. **Work through each item** systematically
3. **Note findings** with evidence
4. **Rate each section** (✅ Good, ⚠️ Partial, ❌ Poor, ❓ Unknown)
5. **Prioritize issues** found

## Structural Review Checklist

### Module Boundaries

```markdown
## Module Boundaries Checklist

### Clear Separation
- [ ] Each module has a single, clear purpose
- [ ] Module names reflect their responsibility
- [ ] No "Utils" or "Helpers" modules with mixed concerns
- [ ] Public interfaces are explicitly defined

### Encapsulation
- [ ] Internal implementation details are hidden
- [ ] Modules expose only necessary APIs
- [ ] No direct access to other modules' internals
- [ ] Configuration is encapsulated

### Dependencies
- [ ] Dependencies flow in one direction (no cycles)
- [ ] High-level modules don't depend on low-level details
- [ ] External dependencies are abstracted
- [ ] Shared code is properly factored out

**Rating:** [ ]
**Findings:**
```

### Service Architecture

```markdown
## Service Architecture Checklist

### Service Design
- [ ] Services have clear, bounded contexts
- [ ] Service boundaries align with business domains
- [ ] Each service owns its data
- [ ] Services can be deployed independently

### Communication
- [ ] Sync vs async communication is intentional
- [ ] Service contracts are defined (OpenAPI, etc.)
- [ ] Backward compatibility is maintained
- [ ] Timeouts are configured for all calls

### Resilience
- [ ] Services handle downstream failures gracefully
- [ ] Circuit breakers are implemented
- [ ] Retry logic with backoff exists
- [ ] Fallback behaviors are defined

**Rating:** [ ]
**Findings:**
```

## Data Architecture Checklist

### Database Design

```markdown
## Database Design Checklist

### Schema
- [ ] Normalization appropriate for use case
- [ ] Indexes exist for frequent queries
- [ ] Foreign keys and constraints defined
- [ ] Naming conventions are consistent

### Data Integrity
- [ ] Constraints prevent invalid data
- [ ] Transactions used appropriately
- [ ] Referential integrity maintained
- [ ] Soft delete vs hard delete is intentional

### Performance
- [ ] Queries are optimized (no N+1)
- [ ] Indexes match query patterns
- [ ] Large tables have partitioning strategy
- [ ] Connection pooling is configured

### Operations
- [ ] Backup strategy exists and tested
- [ ] Recovery procedure documented
- [ ] Migration strategy defined
- [ ] Schema versioning in place

**Rating:** [ ]
**Findings:**
```

### Data Flow

```markdown
## Data Flow Checklist

### Data Movement
- [ ] Data flows are documented
- [ ] Data transformations are clear
- [ ] No unnecessary data duplication
- [ ] Eventual consistency is handled

### Data Consistency
- [ ] Consistency boundaries are defined
- [ ] Distributed transactions handled properly
- [ ] Saga/compensation patterns where needed
- [ ] Data reconciliation exists

### Data Privacy
- [ ] PII is identified and protected
- [ ] Data retention policies defined
- [ ] Right to deletion supported
- [ ] Data access is audited

**Rating:** [ ]
**Findings:**
```

## API Design Checklist

```markdown
## API Design Checklist

### Design Quality
- [ ] APIs follow consistent conventions
- [ ] Resource naming is intuitive
- [ ] HTTP methods used correctly
- [ ] Response formats are consistent

### Documentation
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Error codes documented
- [ ] Authentication documented

### Versioning
- [ ] Versioning strategy defined
- [ ] Breaking changes handled properly
- [ ] Deprecation process exists
- [ ] Old versions sunset gracefully

### Error Handling
- [ ] Error responses are consistent
- [ ] Error messages are helpful
- [ ] Internal errors not leaked
- [ ] Validation errors are clear

### Security
- [ ] Authentication required appropriately
- [ ] Authorization checked per endpoint
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented

**Rating:** [ ]
**Findings:**
```

## Security Checklist

```markdown
## Security Architecture Checklist

### Authentication
- [ ] Strong authentication mechanism
- [ ] Password policies enforced
- [ ] Session management secure
- [ ] Token handling secure (JWT, etc.)
- [ ] MFA available for sensitive operations

### Authorization
- [ ] Principle of least privilege applied
- [ ] Role-based access control implemented
- [ ] Authorization checked at every layer
- [ ] No horizontal privilege escalation
- [ ] No vertical privilege escalation

### Data Protection
- [ ] Data encrypted in transit (TLS)
- [ ] Data encrypted at rest
- [ ] Secrets not in code or config
- [ ] Secrets management solution used
- [ ] PII properly protected

### Input Validation
- [ ] All inputs validated
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] CSRF protection in place
- [ ] File upload validation

### Infrastructure
- [ ] Network segmentation appropriate
- [ ] Firewall rules restrictive
- [ ] Security patches current
- [ ] Vulnerability scanning active
- [ ] Penetration testing done

### Audit & Compliance
- [ ] Security events logged
- [ ] Audit trail for sensitive operations
- [ ] Log integrity protected
- [ ] Compliance requirements met

**Rating:** [ ]
**Findings:**
```

## Performance Checklist

```markdown
## Performance Architecture Checklist

### Response Time
- [ ] Latency targets defined
- [ ] Latency measured at percentiles
- [ ] Slow operations identified
- [ ] Optimization opportunities known

### Throughput
- [ ] Throughput capacity known
- [ ] Bottlenecks identified
- [ ] Scaling approach defined
- [ ] Load testing performed

### Resource Usage
- [ ] CPU usage monitored
- [ ] Memory usage monitored
- [ ] I/O patterns understood
- [ ] Resource limits configured

### Caching
- [ ] Caching strategy defined
- [ ] Cache invalidation works correctly
- [ ] Cache hit rates monitored
- [ ] Cache sizes appropriate

### Database Performance
- [ ] Queries are optimized
- [ ] Connection pooling configured
- [ ] Slow query logging enabled
- [ ] Index usage monitored

### Network
- [ ] Network calls minimized
- [ ] Payload sizes reasonable
- [ ] Compression used appropriately
- [ ] CDN used for static content

**Rating:** [ ]
**Findings:**
```

## Scalability Checklist

```markdown
## Scalability Architecture Checklist

### Horizontal Scaling
- [ ] Services are stateless
- [ ] Session state externalized
- [ ] No local file dependencies
- [ ] Load balancing configured

### Database Scaling
- [ ] Read replicas for read-heavy loads
- [ ] Sharding strategy if needed
- [ ] Connection limits appropriate
- [ ] Database can handle projected growth

### Async Processing
- [ ] Long operations are async
- [ ] Queue-based load leveling
- [ ] Background job infrastructure
- [ ] Retry and dead-letter handling

### Resource Management
- [ ] Auto-scaling configured
- [ ] Resource limits set
- [ ] Graceful degradation under load
- [ ] Capacity planning exists

**Rating:** [ ]
**Findings:**
```

## Operational Checklist

### Deployment

```markdown
## Deployment Checklist

### Automation
- [ ] CI/CD pipeline exists
- [ ] Automated testing before deploy
- [ ] Deployment is one-click/command
- [ ] No manual steps required

### Safety
- [ ] Blue/green or canary deployment
- [ ] Rollback procedure tested
- [ ] Database migrations are safe
- [ ] Feature flags for risky changes

### Configuration
- [ ] Environment-specific config handled
- [ ] Secrets not in deployable artifacts
- [ ] Config changes don't require rebuild
- [ ] Config drift detected

**Rating:** [ ]
**Findings:**
```

### Observability

```markdown
## Observability Checklist

### Metrics
- [ ] Application metrics collected
- [ ] Infrastructure metrics collected
- [ ] Business metrics tracked
- [ ] Dashboards exist per service
- [ ] SLIs/SLOs defined

### Logging
- [ ] Structured logging used
- [ ] Logs centrally aggregated
- [ ] Log levels appropriate
- [ ] Request correlation works
- [ ] Log retention policy defined

### Tracing
- [ ] Distributed tracing implemented
- [ ] Traces cover critical paths
- [ ] Trace sampling appropriate
- [ ] Trace visualization available

### Alerting
- [ ] Alerts exist for critical conditions
- [ ] Alert routing configured
- [ ] Alerts are actionable
- [ ] Runbooks linked to alerts
- [ ] On-call rotation exists

**Rating:** [ ]
**Findings:**
```

### Disaster Recovery

```markdown
## Disaster Recovery Checklist

### Backup
- [ ] Backup strategy defined
- [ ] Backups are automated
- [ ] Backup restoration tested
- [ ] Backup integrity verified
- [ ] Offsite/multi-region backups

### Recovery
- [ ] RTO defined and achievable
- [ ] RPO defined and achievable
- [ ] Recovery procedure documented
- [ ] Recovery procedure tested
- [ ] Failover is automated or quick

### Business Continuity
- [ ] Critical paths identified
- [ ] Degraded operation modes defined
- [ ] Communication plan exists
- [ ] Regular DR drills conducted

**Rating:** [ ]
**Findings:**
```

## Summary Template

```markdown
## Review Summary

### Checklist Completion

| Checklist | Items | Passed | Rating |
|-----------|-------|--------|--------|
| Module Boundaries | [X] | [Y] | [Rating] |
| Service Architecture | [X] | [Y] | [Rating] |
| Database Design | [X] | [Y] | [Rating] |
| Data Flow | [X] | [Y] | [Rating] |
| API Design | [X] | [Y] | [Rating] |
| Security | [X] | [Y] | [Rating] |
| Performance | [X] | [Y] | [Rating] |
| Scalability | [X] | [Y] | [Rating] |
| Deployment | [X] | [Y] | [Rating] |
| Observability | [X] | [Y] | [Rating] |
| Disaster Recovery | [X] | [Y] | [Rating] |

### Areas of Concern

1. [Area with lowest rating]
2. [Area with second lowest rating]
3. [Area with third lowest rating]

### Key Findings

[Summarize most important findings from checklists]
```

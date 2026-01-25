# Runbook Templates

Templates for operational documentation and incident response.

## Runbook Principles

1. **Actionable**: Clear steps that can be followed under pressure
2. **Tested**: Procedures have been verified to work
3. **Current**: Updated after every incident
4. **Accessible**: Easy to find when needed

## Standard Runbook Template

```markdown
# Runbook: [Issue Title]

**Last Updated:** YYYY-MM-DD
**Owner:** [Team/Person]
**Related Services:** [Service names]

## Overview

[One paragraph describing the issue and its impact on users/business]

## Detection

### Symptoms

- [What users/operators will see]
- [Error messages]
- [Abnormal metrics]

### Alerts

| Alert Name | Severity | Threshold |
|------------|----------|-----------|
| [Alert 1] | P1 | [Condition] |
| [Alert 2] | P2 | [Condition] |

### Dashboards

- [Link to primary dashboard]
- [Link to related dashboards]

## Impact Assessment

**User Impact:**
- [How users are affected]

**Business Impact:**
- [Revenue, reputation, etc.]

**Severity Guide:**
- P1: Full outage, all users affected
- P2: Partial outage, significant users affected
- P3: Degraded performance, some users affected
- P4: Minor issue, few users affected

## Quick Diagnosis

### Step 1: Verify the issue

```bash
# Check service health
curl -s https://api.example.com/health | jq .

# Check error rate
curl -s "https://prometheus/api/v1/query?query=rate(http_errors_total[5m])"
```

Expected healthy response:
```json
{"status": "healthy", "version": "1.2.3"}
```

### Step 2: Check recent changes

```bash
# Recent deployments
kubectl rollout history deployment/api-service

# Recent config changes
git log --oneline -10 config/
```

### Step 3: Check dependencies

```bash
# Database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Redis connectivity  
redis-cli -u $REDIS_URL ping

# External API health
curl -s https://api.stripe.com/health
```

## Resolution Steps

### Scenario A: [Most common cause]

**Diagnosis:** [How to confirm this is the issue]

```bash
# Commands to diagnose
```

**Resolution:**

1. [First action]
   ```bash
   [Command]
   ```
   Expected output: [What you should see]

2. [Second action]
   ```bash
   [Command]
   ```

3. Verify fix:
   ```bash
   curl -s https://api.example.com/health
   ```

### Scenario B: [Second most common cause]

**Diagnosis:** [How to confirm]

**Resolution:**
1. [Steps...]

### Scenario C: [Third cause]

[Continue pattern...]

## Escalation

If the above steps don't resolve within [X minutes]:

1. **First escalation:** [Team/Person]
   - Slack: #[channel]
   - PagerDuty: [service]

2. **Second escalation:** [Team/Person]
   - Phone: [number]

3. **Executive escalation:** [For P1 lasting >1 hour]
   - [Contact info]

## Rollback Procedures

### Application Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/api-service

# Verify rollback
kubectl rollout status deployment/api-service
```

### Database Rollback

```bash
# Restore from backup (CAUTION: data loss)
./scripts/restore-db.sh --backup-id [ID]
```

### Feature Flag Disable

```bash
# Disable problematic feature
curl -X POST https://features.internal/api/flags/new-checkout/disable
```

## Post-Incident

- [ ] Create incident ticket: [Link to template]
- [ ] Update this runbook if procedures changed
- [ ] Schedule post-mortem if P1/P2
- [ ] Notify stakeholders of resolution

## Related Documentation

- [Architecture Overview](../architecture/overview.md)
- [Service Dependencies](../architecture/dependencies.md)
- [Related Runbook](./related-issue.md)

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-01-15 | @alice | Initial version |
| 2024-02-01 | @bob | Added Scenario C |
```

## Service-Specific Runbooks

### Database Issues

```markdown
# Runbook: Database Connection Exhaustion

## Overview

PostgreSQL connection pool is exhausted, causing requests to fail with connection timeout errors.

## Symptoms

- API returns 500 errors with "connection timeout"
- Logs show: `FATAL: too many connections for role "app"`
- Metric `pg_connections_active` approaching `pg_connections_max`

## Quick Diagnosis

```bash
# Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Check connection sources
psql -c "SELECT application_name, count(*) 
         FROM pg_stat_activity 
         GROUP BY application_name 
         ORDER BY count DESC;"

# Check for long-running queries
psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query
         FROM pg_stat_activity
         WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes';"
```

## Resolution

### Immediate: Kill idle connections

```bash
# Kill idle connections older than 10 minutes
psql -c "SELECT pg_terminate_backend(pid) 
         FROM pg_stat_activity 
         WHERE state = 'idle' 
         AND query_start < now() - interval '10 minutes';"
```

### Immediate: Restart problematic service

```bash
# Identify service with most connections
# Then restart it
kubectl rollout restart deployment/[service-name]
```

### Long-term: Increase connection limit

```bash
# Update RDS parameter group
aws rds modify-db-parameter-group \
  --db-parameter-group-name production \
  --parameters "ParameterName=max_connections,ParameterValue=500"
```

## Prevention

- Ensure all services use connection pooling
- Set appropriate pool sizes (connections = cores * 2 + disk spindles)
- Monitor connection metrics, alert at 80% capacity
```

### High Memory Usage

```markdown
# Runbook: Service High Memory Usage

## Overview

Service memory usage is approaching limits, risking OOM kills.

## Symptoms

- Kubernetes events show OOMKilled
- Memory metric approaching container limit
- Response times increasing (GC pressure)

## Quick Diagnosis

```bash
# Check memory usage
kubectl top pods -l app=api-service

# Check for OOM events
kubectl get events --field-selector reason=OOMKilled

# Check memory profile (if enabled)
curl -s http://localhost:6060/debug/pprof/heap > heap.prof
go tool pprof heap.prof
```

## Resolution

### Immediate: Restart pod

```bash
kubectl delete pod [pod-name]
```

### Immediate: Scale horizontally

```bash
kubectl scale deployment/api-service --replicas=5
```

### Investigation: Memory leak

```bash
# Enable memory profiling
kubectl set env deployment/api-service ENABLE_PPROF=true

# Wait for memory to grow, then capture
kubectl exec [pod] -- curl -s http://localhost:6060/debug/pprof/heap > heap.prof

# Analyze
go tool pprof -http=:8080 heap.prof
```

### Long-term: Increase limits

Update deployment:
```yaml
resources:
  limits:
    memory: "2Gi"  # Was 1Gi
```
```

## Incident Response Checklist

```markdown
# Incident Response Checklist

## Initial Response (First 5 minutes)

- [ ] Acknowledge alert in PagerDuty
- [ ] Join incident Slack channel: #incident-[date]
- [ ] Announce: "I'm investigating [alert name]"
- [ ] Open relevant dashboards

## Assessment (5-15 minutes)

- [ ] Determine severity (P1/P2/P3/P4)
- [ ] Identify affected services
- [ ] Estimate user impact
- [ ] Update Slack with initial assessment

## Communication

### Internal (via Slack #incidents)

Template:
```
🚨 [P1/P2] [Brief description]
Impact: [User-facing impact]
Status: [Investigating/Identified/Monitoring/Resolved]
ETA: [If known]
Updates: Every [15/30] minutes
```

### External (via status page)

- [ ] Update status page if user-facing
- [ ] Notify support team
- [ ] Prepare customer communication if needed

## Resolution

- [ ] Implement fix
- [ ] Verify fix in production
- [ ] Monitor for recurrence (30 min)
- [ ] Update status page: Resolved

## Post-Incident

- [ ] Write incident summary
- [ ] Schedule post-mortem (P1/P2)
- [ ] Update runbooks
- [ ] Create follow-up tickets
- [ ] Close incident channel
```

## Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** HH:MM
**Severity:** P1/P2
**Author:** [Name]

## Summary

[2-3 sentence summary of what happened]

## Impact

- **Duration:** X hours Y minutes
- **Users affected:** N users / N% of traffic
- **Revenue impact:** $X (if applicable)
- **Data loss:** None / Describe

## Timeline

All times in UTC.

| Time | Event |
|------|-------|
| 14:00 | Deployment of version 1.2.3 |
| 14:05 | Error rate starts increasing |
| 14:10 | Alert fires, on-call paged |
| 14:15 | On-call acknowledges, begins investigation |
| 14:25 | Root cause identified |
| 14:30 | Rollback initiated |
| 14:35 | Rollback complete, error rate normal |
| 15:00 | Monitoring confirms resolution |

## Root Cause

[Detailed explanation of what caused the incident]

## Detection

**How was the incident detected?**
- [Alert / Customer report / Internal discovery]

**Detection time:** X minutes from start to detection

**Could we have detected it faster?**
- [Yes/No, and how]

## Resolution

**What fixed the issue?**
- [Specific actions taken]

**Resolution time:** X minutes from detection to resolution

## Lessons Learned

### What went well

- [Thing 1]
- [Thing 2]

### What went poorly

- [Thing 1]
- [Thing 2]

### Where we got lucky

- [Thing 1]

## Action Items

| Priority | Action | Owner | Due Date | Status |
|----------|--------|-------|----------|--------|
| P0 | [Immediate fix] | @alice | YYYY-MM-DD | Done |
| P1 | [Prevent recurrence] | @bob | YYYY-MM-DD | In Progress |
| P2 | [Improve detection] | @carol | YYYY-MM-DD | Todo |

## References

- [Incident Slack channel](link)
- [Related PRs](link)
- [Monitoring dashboards](link)
```

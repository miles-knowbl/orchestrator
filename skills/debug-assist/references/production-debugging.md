# Production Debugging

Debugging live systems safely and effectively.

## Why This Is Different

Production debugging has constraints that local debugging doesn't:
- **Real users affected** — Every minute matters
- **Limited access** — Can't attach debugger, add arbitrary logging
- **Risk of making it worse** — Bad changes compound the problem
- **Incomplete information** — Limited to what's already logged
- **Pressure** — People are watching, waiting

## The Production Debugging Mindset

### Rule 1: Mitigate First, Debug Later

```
┌─────────────────────────────────────────────────────────┐
│                    INCIDENT FLOW                        │
│                                                         │
│   Alert fires                                           │
│       ↓                                                 │
│   MITIGATE (restore service)                            │
│       ↓                                                 │
│   Gather data (while it's fresh)                        │
│       ↓                                                 │
│   Diagnose (find root cause)                            │
│       ↓                                                 │
│   Fix properly                                          │
│       ↓                                                 │
│   Post-mortem (prevent recurrence)                      │
└─────────────────────────────────────────────────────────┘
```

**Mitigation options (fastest first):**
- Rollback deployment
- Restart service
- Scale up resources
- Enable feature flag fallback
- Redirect traffic
- Fail to cached/static content

**Don't diagnose while users are down.** Restore service first, understand why later.

### Rule 2: Don't Make It Worse

Before any action in production:
- What could go wrong?
- Is this reversible?
- What's the blast radius?
- Do I have approval?

**Safe actions:**
- Reading logs
- Reading metrics
- Non-mutating queries

**Risky actions (require approval):**
- Config changes
- Restarts
- Code changes
- Data modifications

### Rule 3: Document Everything

During an incident, capture:
- Timeline of events
- Actions taken
- Who did what
- What worked, what didn't
- Decisions and rationale

You won't remember later, and others need to follow along.

## Production Information Sources

### Logs

**What to look for:**
- Error messages around incident time
- Stack traces
- Request IDs (to trace specific requests)
- Patterns (same error repeated, specific users)

**Log analysis:**
```bash
# Find errors in time range
grep "ERROR" app.log | grep "2024-01-15 14:"

# Count error types
grep "ERROR" app.log | cut -d':' -f4 | sort | uniq -c | sort -rn

# Follow specific request
grep "req-abc123" app.log
```

### Metrics

**Key metrics during incident:**
| Metric | What It Tells You |
|--------|-------------------|
| Error rate | How bad is it? |
| Latency p99 | Is it slow or broken? |
| Request rate | Traffic spike? |
| CPU/Memory | Resource exhaustion? |
| Connection count | Pool exhaustion? |
| Queue depth | Backlog building? |

**Compare to baseline:** Is this metric abnormal compared to same time yesterday/last week?

### Traces

**Distributed traces show:**
- Which service is slow/failing
- Where time is spent
- Request flow through system

**Look for:**
- Long spans (bottleneck)
- Error spans (failure point)
- Missing spans (service didn't respond)

### External Status

**Check before assuming it's you:**
- Cloud provider status page
- Third-party API status
- DNS status
- CDN status

## Production-Safe Investigation

### Safe Queries

```sql
-- Check active queries (non-mutating)
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active';

-- Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;

-- Check for locks (don't kill without approval)
SELECT * FROM pg_locks WHERE NOT granted;
```

### Safe Commands

```bash
# Check process status
ps aux | grep myapp

# Check open connections
netstat -an | grep ESTABLISHED | wc -l

# Check disk space
df -h

# Check memory
free -m

# Check recent deployments (read-only)
git log --oneline -20
```

### Risky Commands (Require Approval)

```bash
# Restarting services
systemctl restart myapp

# Killing processes
kill -9 <pid>

# Changing config
vi /etc/myapp/config.yaml

# Running migrations
./manage.py migrate

# Data modifications
UPDATE users SET ...
```

## Common Production Scenarios

### Scenario: Error Rate Spike

**Immediate actions:**
1. Check if recent deploy (rollback candidate)
2. Check error messages for pattern
3. Check if specific endpoint or all
4. Check external dependency status

**Common causes:**
- Bad deploy
- External API failure
- Database issue
- Resource exhaustion
- Traffic spike

### Scenario: Latency Spike

**Immediate actions:**
1. Check if specific endpoint or system-wide
2. Check database query times
3. Check external API response times
4. Check resource metrics (CPU, memory)

**Common causes:**
- Slow query (missing index, data growth)
- Resource contention
- External dependency slow
- GC pressure
- Connection pool exhaustion

### Scenario: Service Unresponsive

**Immediate actions:**
1. Check if process is running
2. Check if it's accepting connections
3. Check resource usage (memory, CPU, disk)
4. Check logs for fatal errors

**Common causes:**
- OOM killed
- Deadlock
- Infinite loop
- Disk full
- Network partition

### Scenario: Data Inconsistency

**Immediate actions:**
1. Stop writes if possible (prevent more damage)
2. Identify scope (how much data affected)
3. Find source of bad data
4. Check if backups are clean

**Common causes:**
- Race condition
- Migration bug
- Application bug
- Manual mistake
- Partial failure

## Incident Communication

### Status Updates

Communicate regularly (every 15-30 min) even if no progress:

```markdown
## [Time] Incident Update

**Status:** Investigating / Identified / Mitigating / Resolved

**Impact:** [Who/what is affected]

**Current understanding:** [What we know]

**Actions:** [What we're doing]

**Next update:** [Time]
```

### Escalation

**Escalate when:**
- Impact is high and you're stuck
- You need access/approval you don't have
- Multiple domains involved
- Customer-facing with executive visibility
- You've been stuck for > 30 minutes

**How to escalate:**
- Brief summary of issue
- What you've tried
- What you need
- How urgent

## Post-Incident

### Preserve Evidence

Before things get cleaned up:
- Save relevant logs
- Screenshot dashboards
- Export metrics
- Note timeline

### Post-Mortem Template

```markdown
## Incident Post-Mortem: [Title]

**Date:** [Date]
**Duration:** [Start] to [End] ([X] minutes)
**Severity:** [P1/P2/P3]

### Summary
[One paragraph description]

### Impact
- [Number] users affected
- [Service] unavailable for [duration]
- [Any data impact]

### Timeline
- HH:MM - [Event]
- HH:MM - [Event]
- ...

### Root Cause
[What actually caused the incident]

### Contributing Factors
- [What made it worse or delayed detection]

### What Went Well
- [What worked]

### What Could Be Improved
- [What was difficult]

### Action Items
| Action | Owner | Due Date |
|--------|-------|----------|
| [Preventive measure] | [Name] | [Date] |

### Lessons Learned
- [Key takeaways]
```

## Quick Reference

**During incident:**
1. Mitigate (restore service)
2. Communicate (status update)
3. Gather data (logs, metrics, traces)
4. Diagnose (find root cause)
5. Fix (with approval)
6. Verify (confirm fix worked)
7. Document (capture for post-mortem)

**Don't:**
- Debug while service is down
- Make changes without understanding impact
- Forget to communicate
- Skip documentation
- Blame individuals

**Do:**
- Restore service first
- Get help when stuck
- Document everything
- Preserve evidence
- Conduct blameless post-mortem

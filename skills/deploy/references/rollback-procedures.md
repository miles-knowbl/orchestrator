# Rollback Procedures

Emergency procedures for reverting deployments.

## Decision Framework

### When to Rollback Immediately

| Condition | Action |
|-----------|--------|
| Service completely down | Rollback now |
| Error rate > 5% | Rollback now |
| Data corruption detected | Rollback now + freeze writes |
| Security vulnerability active | Rollback now |

### When to Investigate First

| Condition | Action |
|-----------|--------|
| Error rate 1-5% | Investigate 5 min, then decide |
| Latency spike | Investigate 5 min, then decide |
| Single endpoint failing | Investigate, may not need full rollback |
| Intermittent errors | Investigate, may be transient |

### When NOT to Rollback

| Condition | Alternative |
|-----------|-------------|
| Database migration applied | Fix forward (rollback could cause data loss) |
| Minor bug, workaround exists | Hotfix |
| External service issue | Wait for external fix |

## Rollback Procedures by Platform

### Kubernetes

```bash
# 1. Check current state
kubectl get deployment $SERVICE -o wide
kubectl rollout history deployment/$SERVICE

# 2. Rollback to previous version
kubectl rollout undo deployment/$SERVICE

# 3. Watch rollback progress
kubectl rollout status deployment/$SERVICE

# 4. Verify pods are healthy
kubectl get pods -l app=$SERVICE
kubectl logs -l app=$SERVICE --tail=50

# 5. Verify service responding
curl -s https://api.example.com/health
```

#### Rollback to Specific Version

```bash
# List history with versions
kubectl rollout history deployment/$SERVICE

# Rollback to specific revision
kubectl rollout undo deployment/$SERVICE --to-revision=5
```

### Docker Compose

```bash
# 1. Update docker-compose.yml to previous version
# Edit image: registry.example.com/service:1.2.2 (was 1.2.3)

# 2. Pull previous image
docker-compose pull $SERVICE

# 3. Deploy previous version
docker-compose up -d $SERVICE

# 4. Verify
docker-compose ps
docker-compose logs $SERVICE --tail=50
```

#### Quick Rollback (Keep Previous Running)

```bash
# If you haven't removed old containers
docker-compose up -d --scale $SERVICE=0
docker start ${SERVICE}_previous_container
```

### AWS ECS

```bash
# 1. Get previous task definition
aws ecs describe-services --cluster $CLUSTER --services $SERVICE \
  --query 'services[0].taskDefinition'

# 2. List task definition revisions
aws ecs list-task-definitions --family-prefix $SERVICE

# 3. Update service to previous task definition
aws ecs update-service \
  --cluster $CLUSTER \
  --service $SERVICE \
  --task-definition $SERVICE:$PREVIOUS_REVISION

# 4. Wait for stability
aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE
```

### Blue-Green

```bash
# 1. Identify current active environment
kubectl get service $SERVICE -o jsonpath='{.spec.selector.version}'

# 2. Switch to other environment
kubectl patch service $SERVICE -p '{"spec":{"selector":{"version":"blue"}}}'
# or
kubectl patch service $SERVICE -p '{"spec":{"selector":{"version":"green"}}}'

# 3. Verify traffic switched
kubectl get endpoints $SERVICE
```

### Canary

```bash
# 1. Set canary weight to 0
kubectl patch virtualservice $SERVICE --type merge -p '
spec:
  http:
  - route:
    - destination:
        host: $SERVICE
        subset: stable
      weight: 100
    - destination:
        host: $SERVICE
        subset: canary
      weight: 0
'

# 2. Scale down canary
kubectl scale deployment $SERVICE-canary --replicas=0
```

## Database Rollback Considerations

### When Migration is Reversible

```bash
# 1. Rollback application first
kubectl rollout undo deployment/$SERVICE

# 2. Then rollback migration
npm run db:migrate:rollback

# 3. Verify data integrity
npm run db:verify
```

### When Migration is NOT Reversible

If migration cannot be rolled back (dropped column, data transformation):

```bash
# DO NOT rollback migration

# Option 1: Fix forward
# - Deploy hotfix that works with new schema
# - Fast-track through pipeline

# Option 2: Feature flag
# - Disable feature using new schema
# - Users see old behavior
# - Fix and re-enable

# Option 3: Partial rollback
# - Rollback app to version that works with new schema
# - Not the version before migration
```

### Data Corruption Response

```bash
# 1. IMMEDIATELY stop writes
kubectl scale deployment/$SERVICE --replicas=0

# 2. Assess damage
psql $DATABASE -c "SELECT COUNT(*) FROM affected_table WHERE corrupted_flag"

# 3. Restore from backup if needed
pg_restore -d $DATABASE backup_before_deploy.dump

# 4. Or run data fix script
psql $DATABASE -f fix_corrupted_data.sql

# 5. Verify fix
npm run db:verify

# 6. Resume service
kubectl scale deployment/$SERVICE --replicas=3
```

## Communication During Rollback

### Internal Communication

```markdown
## 🚨 Rollback in Progress

**Service:** order-service
**Version:** 1.2.3 → 1.2.2
**Reason:** Error rate spiked to 8%
**Started:** 2024-01-17 14:45 UTC
**ETA:** 5 minutes

**Impact:**
- Order creation may fail intermittently
- No data loss expected

**Actions:**
- Rollback initiated by @engineer
- Monitoring metrics
- Will update when complete
```

### Completion Notification

```markdown
## ✅ Rollback Complete

**Service:** order-service  
**Rolled back to:** 1.2.2
**Duration:** 4 minutes
**Status:** Service healthy

**Metrics:**
- Error rate: 0.1% (was 8%)
- Latency p95: 250ms (was 2000ms)

**Next Steps:**
- Incident ticket: INC-2024-0117
- RCA scheduled for tomorrow
- Do not re-deploy 1.2.3 without fix
```

## Post-Rollback Checklist

```markdown
## Post-Rollback Checklist

### Immediate (< 5 minutes)
- [ ] Service health verified
- [ ] Error rate dropping
- [ ] Metrics stabilizing
- [ ] Team notified

### Short-term (< 1 hour)
- [ ] Incident ticket created
- [ ] Stakeholders notified
- [ ] Logs preserved for investigation
- [ ] Deployment record updated

### Investigation (< 24 hours)
- [ ] Root cause identified
- [ ] Fix developed
- [ ] Fix tested in staging
- [ ] Deployment plan for fix

### Long-term
- [ ] RCA completed
- [ ] Preventive measures identified
- [ ] Monitoring improved (if needed)
- [ ] Runbook updated
```

## Rollback Automation

### Automated Rollback Script

```bash
#!/bin/bash
# rollback.sh

SERVICE=$1
REASON=$2

echo "Starting rollback for $SERVICE"
echo "Reason: $REASON"

# 1. Notify
slack-notify "#incidents" "🚨 Rolling back $SERVICE: $REASON"

# 2. Rollback
kubectl rollout undo deployment/$SERVICE

# 3. Wait
kubectl rollout status deployment/$SERVICE --timeout=5m

# 4. Verify
HEALTH=$(curl -s https://api.example.com/health | jq -r .status)
if [ "$HEALTH" != "healthy" ]; then
  echo "WARNING: Service not healthy after rollback"
  slack-notify "#incidents" "⚠️ Rollback complete but service unhealthy"
  exit 1
fi

# 5. Confirm
slack-notify "#incidents" "✅ Rollback of $SERVICE complete. Service healthy."
echo "Rollback complete"
```

### Automated Rollback Trigger

```yaml
# Prometheus alert that triggers rollback
- alert: AutoRollbackTrigger
  expr: rate(http_requests_total{status=~"5.."}[2m]) > 0.1
  for: 2m
  labels:
    severity: critical
    auto_rollback: "true"
  annotations:
    summary: "Auto-rollback triggered for {{ $labels.service }}"
    runbook: "https://runbook.example.com/auto-rollback"
```

## Emergency Contacts

```markdown
## Rollback Escalation

### Level 1: On-call Engineer
- Triggered by: Alert
- Can do: Standard rollback

### Level 2: Team Lead
- Escalate when: Rollback fails or data issue
- Can do: Approve non-standard actions

### Level 3: SRE/Platform Team
- Escalate when: Infrastructure issue
- Can do: Platform-level recovery

### Level 4: Management
- Escalate when: Customer-impacting > 30 min
- Can do: Approve emergency measures
```

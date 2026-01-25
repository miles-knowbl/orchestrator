---
name: deploy
description: "Guides deployment of systems to production environments. Covers deployment strategies, production validation, rollback procedures, and monitoring setup. Completes the engineering loop by bridging the gap between merged code and running production systems."
---

# Deploy

Ship code to production safely.

## When to Use

- **After PR merge** — Deploy new system or feature
- **Hotfix** — Emergency production fix
- **Rollback** — Revert problematic deployment
- **Environment promotion** — Move from staging to production
- **Infrastructure changes** — Deploy configuration or infrastructure

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `rollback-procedures.md` | How to safely rollback if needed |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| Stack-specific deployment guides | For specific deployment targets |

**Verification:** Ensure DEPLOY.md is produced with rollback procedure documented.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `DEPLOY.md` | Project root | Always |

## Core Concept

Deployment answers: **"How do we safely get this code running in production?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT PIPELINE                                    │
│                                                                             │
│  Code Merged    Build &       Deploy to      Validate      Monitor &       │
│  to Main    →   Package   →   Production  →  Production →  Observe         │
│                                                                             │
│  ┌─────────┐    ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │  PR     │    │ Docker  │   │  K8s/   │   │  Smoke  │   │ Metrics │     │
│  │ Merged  │───▶│  Build  │──▶│  ECS    │──▶│  Tests  │──▶│ Alerts  │     │
│  └─────────┘    └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
│                                    │              │                         │
│                                    │    FAIL      │                         │
│                                    ▼              │                         │
│                              ┌─────────┐         │                         │
│                              │Rollback │◀────────┘                         │
│                              └─────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Deployment Strategies

### Strategy Comparison

| Strategy | Risk | Rollback Speed | Resource Overhead | Best For |
|----------|------|----------------|-------------------|----------|
| **Rolling** | Low | Medium | Low | Standard deploys |
| **Blue-Green** | Very Low | Fast | High (2x) | Critical services |
| **Canary** | Very Low | Fast | Medium | High-traffic services |
| **Recreate** | High | Slow | None | Dev/test environments |
| **Feature Flag** | Very Low | Instant | None | Gradual rollouts |

### Rolling Deployment

Deploy to instances one at a time:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROLLING DEPLOYMENT                                        │
│                                                                             │
│  Time 0:     [v1] [v1] [v1] [v1]                                           │
│                                                                             │
│  Time 1:     [v2] [v1] [v1] [v1]   ← First instance updated                │
│                                                                             │
│  Time 2:     [v2] [v2] [v1] [v1]   ← Second instance updated               │
│                                                                             │
│  Time 3:     [v2] [v2] [v2] [v1]   ← Third instance updated                │
│                                                                             │
│  Time 4:     [v2] [v2] [v2] [v2]   ← All instances updated                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Blue-Green Deployment

Run two identical environments, switch traffic:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BLUE-GREEN DEPLOYMENT                                     │
│                                                                             │
│  Before:                                                                    │
│                                                                             │
│           ┌──────────────┐                                                  │
│  Traffic ─┤  Blue (v1)   │ ← Active                                        │
│           └──────────────┘                                                  │
│           ┌──────────────┐                                                  │
│           │ Green (idle) │ ← Idle                                          │
│           └──────────────┘                                                  │
│                                                                             │
│  After:                                                                     │
│                                                                             │
│           ┌──────────────┐                                                  │
│           │  Blue (v1)   │ ← Idle (rollback target)                        │
│           └──────────────┘                                                  │
│           ┌──────────────┐                                                  │
│  Traffic ─┤ Green (v2)   │ ← Active                                        │
│           └──────────────┘                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Canary Deployment

Gradually shift traffic to new version:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CANARY DEPLOYMENT                                         │
│                                                                             │
│  Stage 1:   5% traffic to v2                                                │
│                                                                             │
│           ┌──────────────┐                                                  │
│  95% ─────┤  v1 (stable) │                                                  │
│           └──────────────┘                                                  │
│           ┌──────────────┐                                                  │
│  5%  ─────┤ v2 (canary)  │                                                  │
│           └──────────────┘                                                  │
│                                                                             │
│  Stage 2:  25% traffic to v2 (if metrics OK)                                │
│  Stage 3:  50% traffic to v2 (if metrics OK)                                │
│  Stage 4: 100% traffic to v2 (if metrics OK)                                │
│                                                                             │
│  At any stage: Rollback if errors spike                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

→ See `references/deployment-strategies.md`

## The Deployment Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PROCESS                                        │
│                                                                             │
│  1. PRE-DEPLOYMENT                                                          │
│     ├─→ Verify build artifacts exist                                        │
│     ├─→ Run pre-deployment checks                                           │
│     ├─→ Notify stakeholders                                                 │
│     └─→ Create deployment record                                            │
│                                                                             │
│  2. DEPLOYMENT                                                              │
│     ├─→ Apply infrastructure changes (if any)                               │
│     ├─→ Deploy application                                                  │
│     ├─→ Run database migrations (if any)                                    │
│     └─→ Update service configuration                                        │
│                                                                             │
│  3. VALIDATION                                                              │
│     ├─→ Health checks pass                                                  │
│     ├─→ Smoke tests pass                                                    │
│     ├─→ Metrics within thresholds                                           │
│     └─→ No error spikes                                                     │
│                                                                             │
│  4. POST-DEPLOYMENT                                                         │
│     ├─→ Update deployment record                                            │
│     ├─→ Notify stakeholders                                                 │
│     ├─→ Monitor for issues                                                  │
│     └─→ Document any issues                                                 │
│                                                                             │
│  5. ROLLBACK (if needed)                                                    │
│     ├─→ Trigger rollback                                                    │
│     ├─→ Verify rollback successful                                          │
│     ├─→ Investigate failure                                                 │
│     └─→ Document incident                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Pre-Deployment Checklist

### Required Checks

```markdown
## Pre-Deployment Checklist

### Build Verification
- [ ] Build artifacts exist
- [ ] Docker image tagged and pushed
- [ ] Version number correct
- [ ] All tests passed in CI

### Database
- [ ] Migrations tested in staging
- [ ] Migrations are reversible
- [ ] No destructive changes (or approved)
- [ ] Backup taken (if significant migration)

### Dependencies
- [ ] All dependent services available
- [ ] External API changes coordinated
- [ ] Feature flags configured

### Notifications
- [ ] Team notified of deployment
- [ ] Stakeholders aware (if significant)
- [ ] On-call engineer aware

### Documentation
- [ ] Changelog updated
- [ ] Runbook updated (if applicable)
- [ ] Known issues documented
```

### Pre-Deployment Commands

```bash
# Verify build
docker pull $REGISTRY/$IMAGE:$VERSION
docker inspect $REGISTRY/$IMAGE:$VERSION

# Check staging
curl -s https://staging.example.com/health | jq .status

# Notify
slack-notify "#deployments" "Starting deployment of $SERVICE v$VERSION"

# Create deployment record
gh api repos/$REPO/deployments -f ref=$SHA -f environment=production
```

## Deployment Execution

### Kubernetes Deployment

```bash
# Update deployment
kubectl set image deployment/$SERVICE $SERVICE=$IMAGE:$VERSION

# Watch rollout
kubectl rollout status deployment/$SERVICE --timeout=5m

# Check pods
kubectl get pods -l app=$SERVICE
```

### Kubernetes Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
        version: v1.2.3
    spec:
      containers:
      - name: order-service
        image: registry.example.com/order-service:v1.2.3
        ports:
        - containerPort: 3000
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### AWS ECS Deployment

```bash
# Update service
aws ecs update-service \
  --cluster production \
  --service order-service \
  --task-definition order-service:$VERSION \
  --desired-count 3

# Wait for stability
aws ecs wait services-stable \
  --cluster production \
  --services order-service
```

### Docker Compose (Simple)

```bash
# Pull new images
docker-compose pull

# Deploy with zero downtime
docker-compose up -d --no-deps --scale service=2 service
sleep 30
docker-compose up -d --no-deps --scale service=1 service
```

→ See `references/deployment-commands.md`

## Database Migrations

### Migration Safety Rules

1. **Backward compatible first** — New code must work with old schema
2. **Forward migration only** — During deploy, not rollback
3. **Test in staging** — Always run migrations in staging first
4. **Small batches** — Don't lock tables for long
5. **Backup first** — For destructive changes

### Safe Migration Patterns

| Change | Safe Approach |
|--------|---------------|
| Add column | Add with default or nullable, backfill later |
| Remove column | Stop using, then remove in later deploy |
| Rename column | Add new, migrate data, remove old |
| Add index | CREATE INDEX CONCURRENTLY |
| Change type | Add new column, migrate, drop old |

### Migration Commands

```bash
# Check pending migrations
npm run db:migrate:status

# Run migrations
npm run db:migrate

# Rollback (if needed)
npm run db:migrate:rollback
```

→ See `references/migration-safety.md`

## Production Validation

### Health Checks

```bash
# Basic health
curl -s https://api.example.com/health | jq

# Expected response
{
  "status": "healthy",
  "version": "1.2.3",
  "uptime": 123,
  "dependencies": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Smoke Tests

```bash
# Run smoke tests against production
npm run test:smoke -- --env=production

# Or specific checks
curl -s -o /dev/null -w "%{http_code}" https://api.example.com/orders
# Should return 401 (unauthorized, but service is up)

curl -s https://api.example.com/orders -H "Authorization: Bearer $TOKEN" | jq '.data | length'
# Should return order count
```

### Metric Validation

Check key metrics are within thresholds:

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Error rate | >1% | >5% | Rollback |
| Latency p95 | >500ms | >2000ms | Investigate |
| CPU | >70% | >90% | Scale up |
| Memory | >80% | >95% | Investigate |

```bash
# Query Prometheus
curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~'5..'}[5m])"

# Check error rate
ERROR_RATE=$(curl -s ... | jq '.data.result[0].value[1]')
if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
  echo "ERROR: Error rate $ERROR_RATE exceeds 5%"
  exit 1
fi
```

### Validation Checklist

```markdown
## Post-Deployment Validation

### Immediate (< 5 minutes)
- [ ] Health endpoint returns healthy
- [ ] All pods/instances running
- [ ] No crash loops
- [ ] Smoke tests pass

### Short-term (5-30 minutes)
- [ ] Error rate stable
- [ ] Latency within SLA
- [ ] No memory leaks
- [ ] Logs look normal

### Medium-term (30 min - 2 hours)
- [ ] User reports (if any)
- [ ] Downstream systems healthy
- [ ] Background jobs running
- [ ] Metrics trending normally
```

→ See `references/validation-checklist.md`

## Rollback Procedures

### When to Rollback

| Signal | Severity | Action |
|--------|----------|--------|
| Error rate > 5% | Critical | Immediate rollback |
| Service unavailable | Critical | Immediate rollback |
| Data corruption | Critical | Immediate rollback + investigation |
| Error rate > 1% | Warning | Investigate, consider rollback |
| Latency > 2x normal | Warning | Investigate, consider rollback |
| User reports | Varies | Investigate |

### Rollback Commands

#### Kubernetes

```bash
# Rollback to previous revision
kubectl rollout undo deployment/$SERVICE

# Rollback to specific revision
kubectl rollout undo deployment/$SERVICE --to-revision=3

# Check rollout history
kubectl rollout history deployment/$SERVICE
```

#### Docker Compose

```bash
# Pull previous version
docker-compose pull
# (after updating docker-compose.yml to previous tag)

# Or directly specify image
docker-compose up -d --no-deps service
```

#### Blue-Green

```bash
# Switch traffic back to blue
kubectl patch service $SERVICE -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Rollback Checklist

```markdown
## Rollback Checklist

### Before Rollback
- [ ] Confirm rollback decision with team lead
- [ ] Note current state and symptoms
- [ ] Alert stakeholders

### Execute Rollback
- [ ] Trigger rollback command
- [ ] Verify rollback in progress
- [ ] Wait for completion

### After Rollback
- [ ] Verify service healthy
- [ ] Verify error rate dropping
- [ ] Notify stakeholders
- [ ] Create incident ticket
- [ ] Begin investigation
```

→ See `references/rollback-procedures.md`

## Monitoring Setup

### Essential Metrics

| Category | Metrics |
|----------|---------|
| **RED** | Rate, Errors, Duration |
| **USE** | Utilization, Saturation, Errors |
| **Business** | Orders/min, Revenue, Active users |

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
  - name: service-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          
      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.service }}"
```

### Dashboard Essentials

```markdown
## Deployment Dashboard

### Top Row - Health
- Service status (up/down)
- Error rate (current)
- Request rate (current)

### Second Row - Trends
- Error rate (24h)
- Latency p50/p95/p99 (24h)
- Request rate (24h)

### Third Row - Resources
- CPU usage
- Memory usage
- Pod/instance count

### Bottom Row - Deployments
- Deployment annotations
- Version distribution
- Recent deployments
```

→ See `references/monitoring-setup.md`

## Deployment Record

Track deployments for audit and debugging:

```json
{
  "id": "deploy-2024-01-17-001",
  "service": "order-service",
  "version": "1.2.3",
  "environment": "production",
  "deployedAt": "2024-01-17T14:30:00Z",
  "deployedBy": "agent-001",
  "status": "success",
  "duration": 180,
  "previousVersion": "1.2.2",
  "changes": {
    "commits": ["abc1234", "def5678"],
    "prNumber": 123,
    "releaseNotes": "Added work order completion flow"
  },
  "validation": {
    "healthCheck": "pass",
    "smokeTests": "pass",
    "errorRate": 0.001,
    "latencyP95": 245
  },
  "rollback": null
}
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `distribute` | Sets up CI/CD pipeline; deploy focuses on production strategies |
| `loop-controller` | Deploy is final stage before COMPLETE |
| `code-review` | Creates PR that triggers deploy |
| `git-workflow` | Manages merge that triggers deploy |
| `integration-test` | Validates before deploy |
| `security-audit` | Approves security-sensitive deploys |

**Note:** Use `distribute` to set up the CI/CD pipeline (GitHub Actions, Vercel, tarball releases). Use `deploy` for production deployment strategies (blue-green, canary, rollback procedures, monitoring).

## Documentation Site Deployment (Non-Web Apps)

For CLI tools, MCP servers, and other non-web applications, the SHIP phase should still deploy a **documentation site** to Vercel (or similar). Users need a browsable reference even when the core product isn't a web application.

### What to Deploy

| Content | Source | Purpose |
|---------|--------|---------|
| Installation guide | README.md | How to install |
| Usage examples | Examples/ or README | How to use |
| API reference | Generated from source | Complete reference |
| Changelog | CHANGELOG.md | What changed |

### Documentation Site Structure

```
docs/
├── index.md          # Overview + quick start
├── installation.md   # Installation methods
├── usage.md          # Usage guide with examples
├── api/              # Generated API reference
├── examples/         # Runnable examples
└── changelog.md      # Version history
```

### Vercel Deployment

```bash
# Install docs framework (e.g., VitePress, Nextra, Docusaurus)
npm create vitepress@latest docs

# Configure vercel.json
{
  "buildCommand": "npm run docs:build",
  "outputDirectory": "docs/.vitepress/dist"
}

# Deploy
vercel --prod
```

### When to Skip

Skip documentation site deployment only if:
- Project is internal-only with no external users
- Documentation exists elsewhere (company wiki)
- User explicitly opts out

**Default behavior:** Always deploy a docs site unless explicitly skipped.

## Key Principles

**Deploy frequently.** Small, frequent deploys are safer than big-bang releases.

**Automate everything.** Manual steps cause errors.

**Validate thoroughly.** Trust but verify.

**Roll back fast.** When in doubt, roll back.

**Monitor continuously.** Watch metrics after deploy.

**Document decisions.** Record what was deployed and why.

**Ship docs too.** Every project deserves a browsable documentation site.

## Mode-Specific Behavior

Deployment strategy and validation differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full deployment pipeline setup |
| **Approach** | Comprehensive deployment strategy design |
| **Patterns** | Free choice of deployment strategy |
| **Deliverables** | Full DEPLOY.md + monitoring setup |
| **Validation** | Standard smoke test suite |
| **Constraints** | Minimal - standard deployment risk |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific deployment additions |
| **Approach** | Extend existing deployment patterns |
| **Patterns** | Should match existing CI/CD patterns |
| **Deliverables** | Delta deployment changes |
| **Validation** | Existing tests + gap-specific validation |
| **Constraints** | Don't break existing deployment process |

**Polish considerations:**
- [ ] Deploy process matches existing CI/CD
- [ ] New features behind feature flags if needed
- [ ] Existing functionality smoke tested
- [ ] Gap functionality validated
- [ ] No breaking changes to existing APIs

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific deployment only |
| **Approach** | Surgical deployment with canary rollout |
| **Patterns** | Must conform exactly to existing procedures |
| **Deliverables** | Change record with rollback documentation |
| **Validation** | Full regression + change-specific testing |
| **Constraints** | Requires approval - change window scheduled |

**Enterprise deployment requirements:**
- Change approval required before deploy
- Deployment window must be scheduled
- On-call engineer must be available
- Rollback tested in staging first
- Post-deploy monitoring period required

**Enterprise deployment record:**
```json
{
  "changeId": "CHG-12345",
  "approvedBy": "change-board",
  "deployWindow": "2024-01-17T02:00:00Z",
  "rollbackTested": true,
  "monitoringPeriod": "4h",
  "escalationPath": ["on-call", "team-lead", "director"]
}
```

---

## References

- `references/deployment-strategies.md`: Detailed strategy comparison
- `references/deployment-commands.md`: Platform-specific commands
- `references/migration-safety.md`: Safe database migration patterns
- `references/validation-checklist.md`: Comprehensive validation steps
- `references/rollback-procedures.md`: Emergency rollback guide
- `references/monitoring-setup.md`: Monitoring configuration

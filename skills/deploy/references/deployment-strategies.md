# Deployment Strategies Reference

Selecting the right deployment strategy depends on risk tolerance, infrastructure maturity, and the nature of the change being released.

## Strategy Comparison

| Strategy | Downtime | Risk Level | Rollback Speed | Infrastructure Cost | Best For |
|----------|----------|------------|----------------|---------------------|----------|
| Blue-Green | Zero | Low | Instant (<1min) | 2x during deploy | Critical services, major releases |
| Canary | Zero | Very Low | Fast (1-5min) | +10-20% during deploy | High-traffic services, risky changes |
| Rolling | Zero | Medium | Moderate (5-15min) | Same | Stateless services, routine deploys |
| Feature Flags | Zero | Low | Instant | Same | Gradual rollouts, A/B testing |
| Recreate | Brief | High | Slow (10-30min) | Same | Dev/staging, breaking changes |

## Blue-Green Deployments

Run two identical environments. Route traffic from blue (current) to green (new) once verified.

### Process
1. Deploy new version to the idle environment (green)
2. Run smoke tests against green (internal URL)
3. Switch load balancer / DNS to point to green
4. Monitor for 15-30 minutes
5. Decommission old blue environment or keep as rollback target

### Rollback
```
# Instant: switch traffic back to blue
# Vercel: revert to previous deployment
vercel rollback

# Railway: redeploy previous image
railway up --service <service> --image <previous-image>

# AWS ALB: change target group
aws elbv2 modify-listener --listener-arn <arn> \
  --default-actions Type=forward,TargetGroupArn=<blue-tg-arn>
```

### When to Use
- Database schema is backward-compatible
- You need instant rollback capability
- The release is high-stakes (payments, auth)

## Canary Releases

Route a small percentage of traffic to the new version. Increase gradually if metrics are healthy.

### Typical Ramp Schedule

| Stage | Traffic % | Duration | Gate Criteria |
|-------|-----------|----------|---------------|
| 1 | 1% | 15 min | Error rate < 0.1%, p99 < 500ms |
| 2 | 5% | 30 min | Error rate < 0.5%, p99 < 800ms |
| 3 | 25% | 1 hour | Error rate < 1%, no alerts |
| 4 | 50% | 2 hours | All metrics nominal |
| 5 | 100% | -- | Full rollout |

### Rollback
- Set canary weight back to 0%
- All traffic returns to stable version
- No user-facing impact beyond the canary percentage

### When to Use
- High-traffic services where even brief full-outage is unacceptable
- Changes to critical paths (checkout, authentication)
- Performance-sensitive changes needing real-world validation

## Rolling Updates

Replace instances one at a time. Each new instance must pass health checks before the next is updated.

### Configuration Example (Kubernetes)
```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  minReadySeconds: 30
```

### Rollback
```bash
# Kubernetes
kubectl rollout undo deployment/<name>
kubectl rollout status deployment/<name>

# Docker Swarm
docker service update --rollback <service>
```

### When to Use
- Stateless services with multiple replicas
- Routine deployments with low risk
- When infrastructure cost must stay constant

## Feature Flags

Deploy code to production but control activation separately from deployment.

### Implementation Pattern
```typescript
// Simple feature flag check
if (featureFlags.isEnabled('new-checkout-flow', { userId })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

### Rollout Stages

| Stage | Audience | Purpose |
|-------|----------|---------|
| Internal | Team only | Smoke testing in production |
| Beta | Opted-in users | Early feedback |
| Percentage | 10% -> 50% -> 100% | Gradual rollout |
| GA | Everyone | Flag removed, code cleaned up |

### Rollback
- Toggle flag off -- instant, no deployment needed
- All users revert to previous behavior immediately

### When to Use
- Long-running feature development merged to main
- Features needing business-side control of activation
- A/B testing or gradual user exposure

## Decision Flowchart

```
Is the change backward-compatible with current DB schema?
  NO  --> Use Blue-Green with migration window
  YES --> Is the service high-traffic (>1k rps)?
            YES --> Use Canary
            NO  --> Is instant rollback critical?
                      YES --> Use Blue-Green or Feature Flags
                      NO  --> Use Rolling Update
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| No health checks configured | Bad instances receive traffic | Always define readiness + liveness probes |
| Session affinity ignored | Users lose state mid-deploy | Use external session store or sticky sessions |
| DB migration not backward-compatible | Blue-green rollback fails | Always make migrations additive first |
| Feature flag debt | Code complexity grows | Schedule flag cleanup within 2 sprints |
| Skipping staging validation | Production surprises | Gate production deploy on staging success |

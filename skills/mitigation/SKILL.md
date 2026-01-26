---
name: mitigation
description: "Execute immediate mitigation for production incidents. Decide between rollback, hotfix, feature flag, or traffic management. Prioritizes restoring service over finding root cause."
phase: IMPLEMENT
category: core
version: "1.0.0"
depends_on: [incident-triage]
tags: [incident, mitigation, hotfix, rollback]
---

# Mitigation

Execute immediate mitigation to restore production service. This skill is about speed and correctness of response, not about understanding why the problem happened. Restore service first, investigate later. Choose the simplest, safest action that stops the bleeding.

## When to Use

- After incident triage has classified severity and identified blast radius
- When production service is degraded or down and users are impacted
- When a deployment has been identified as the likely cause
- When a feature needs to be disabled quickly to stop errors

## Decision Framework

Select the mitigation strategy based on the situation:

| Situation | Strategy | When to Use |
|-----------|----------|-------------|
| Recent deploy caused the issue | **Rollback** | Deploy is <24h old, previous version was stable |
| A specific feature is broken | **Feature Flag** | Feature flag exists, issue is isolated to one feature |
| Targeted code fix is obvious and small | **Hotfix** | Fix is <20 lines, root cause is clear, can ship in <30 min |
| Traffic or capacity issue | **Traffic Management** | Scale up, rate limit, shed load, redirect traffic |
| External dependency is down | **Circuit Breaker** | Add fallback behavior, graceful degradation |

**Rule of thumb**: If you can rollback, rollback. It is almost always faster and safer than a hotfix.

## Process

1. **Review triage findings** - Read the INCIDENT-TRIAGE.md. Understand severity, blast radius, likely cause, and the recommended response strategy.
2. **Select mitigation strategy** - Using the decision framework above, confirm or adjust the strategy recommended during triage. Document why you chose this approach.
3. **Implement the minimum viable fix** - Execute the selected strategy. Do the least amount of work needed to restore service. Resist the urge to fix adjacent issues or refactor during an incident.
4. **Verify mitigation works** - Confirm that the mitigation resolved the immediate problem: error rates dropping, latency returning to normal, users able to complete workflows. Check both metrics and manual verification.
5. **Monitor for stability** - Watch the system for at least 15 minutes after mitigation. Confirm that the fix holds and no new issues emerge. Set up alerts for any regression.
6. **Document what was done** - Record the exact actions taken, timestamps, and results. This feeds into the postmortem.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| Mitigation actions applied | Code/Config changes | Restore service |
| Incident timeline update | Appended to INCIDENT-TRIAGE.md | Record of actions taken |

### Incident Timeline Entry

For each mitigation action, record:
- **Timestamp**: When the action was taken
- **Action**: What was done (rollback to v1.2.3, disabled feature flag X, scaled pods to 10)
- **Result**: What changed (error rate dropped from 15% to 0.1%, latency p99 returned to 200ms)
- **Verified by**: How success was confirmed (dashboard link, manual test, health check)

## Quality Criteria

- Service is restored: the user-facing impact is resolved
- Mitigation is minimal: no over-fixing, no scope creep during the incident
- Monitoring confirms stability for at least 15 minutes post-mitigation
- Every action is timestamped and documented in the incident timeline
- Mitigation does not introduce new risks or break other features
- If rollback was available and not used, document the reason why

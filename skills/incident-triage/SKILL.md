---
name: incident-triage
description: "Rapidly classify production incidents by severity, identify blast radius, assign ownership, and determine immediate response strategy. Time-critical first response."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [incident, triage, production, severity]
---

# Incident Triage

Rapidly classify and prioritize production incidents. This is the first response: assess severity, determine who and what is affected, and decide the immediate course of action. Speed matters -- the goal is to make correct decisions quickly, not to find the root cause.

## When to Use

- A production alert fires (monitoring, error tracking, uptime check)
- Users report an outage, errors, or degraded experience
- A monitoring threshold is breached (error rate, latency, CPU, memory)
- A service becomes unresponsive or returns unexpected results
- A deployment is suspected of causing problems

## Severity Levels

| Level | Name | Definition | Response Time |
|-------|------|------------|---------------|
| P0 | Critical | Full outage, all users affected, data loss risk | Immediate (drop everything) |
| P1 | Major | Major feature broken, significant user impact | Within 15 minutes |
| P2 | Degraded | Service degraded but functional, partial impact | Within 1 hour |
| P3 | Minor | Minor issue, cosmetic, low user impact | Within 1 business day |

## Process

1. **Acknowledge the incident** - Confirm the alert or report is valid (not a false positive). Record the timestamp of first detection. Open a communication channel (Slack channel, incident call).
2. **Classify severity** - Using the severity table above, assign an initial severity level. This can be adjusted as more information becomes available. When in doubt, round up (treat as more severe).
3. **Identify blast radius** - Determine: How many users are affected? Which services are impacted? Which regions or environments? Is the impact growing or stable?
4. **Check recent deployments** - Review the last 24 hours of deployments, config changes, and feature flag flips. Correlate timestamps with the start of the incident. Recent changes are the most likely cause.
5. **Identify likely cause category** - Without deep investigation, categorize the probable cause: deployment regression, infrastructure failure, dependency outage, traffic spike, data issue, or security incident.
6. **Determine response strategy** - Based on severity and likely cause, select the immediate response: rollback the deployment, disable a feature flag, scale infrastructure, engage a vendor, or apply a hotfix.
7. **Assign ownership** - Designate an incident commander (coordinates response) and a technical lead (executes the fix). Ensure coverage for the duration of the incident.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| INCIDENT-TRIAGE.md | Markdown | Triage assessment and response plan |

### INCIDENT-TRIAGE.md Contents

- **Incident ID**: Unique identifier
- **Severity**: P0-P3 with justification
- **Blast Radius**: Users affected, services impacted, regions involved
- **Timeline**: Detection time, acknowledgment time, key observations
- **Recent Changes**: Deployments, config changes, or flag flips in the last 24 hours
- **Likely Cause**: Category and brief reasoning
- **Response Strategy**: Immediate action to take (rollback, hotfix, feature flag, scale)
- **Assigned Owner**: Incident commander and technical lead
- **Communication Plan**: Who to notify and where updates will be posted

## Quality Criteria

- Severity is classified within 5 minutes of acknowledgment
- Blast radius is quantified with specific numbers (not "some users")
- Recent changes are checked (not assumed irrelevant)
- Response strategy is actionable (specific steps, not "investigate further")
- Ownership is assigned to named individuals, not teams
- When in doubt, severity rounds up (over-triage is safer than under-triage)

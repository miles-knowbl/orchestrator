---
name: postmortem
description: "Write blameless postmortems after incidents. Document timeline, root cause, impact, mitigation taken, and prevention measures. Focus on systemic improvements, not individual blame."
phase: DOCUMENT
category: engineering
version: "1.0.0"
depends_on: [incident-triage, mitigation]
tags: [incident, postmortem, learning, prevention]
---

# Postmortem

Write a blameless postmortem after an incident is resolved. The purpose is organizational learning: understand what happened, why it happened, and how to prevent it from happening again. The postmortem focuses on systemic causes and process improvements, never on individual blame.

## When to Use

- After any P0 or P1 incident is fully resolved
- After P2 incidents with significant user impact or novel failure modes
- Within 48 hours of incident resolution (while memory is fresh)
- When an incident reveals a gap in monitoring, process, or architecture

## Process

1. **Construct the timeline** - Build a minute-by-minute timeline from detection through resolution. Include: when the issue started (if known), when it was detected, when triage began, each mitigation action, when service was restored, and when the incident was formally closed. Use timestamps from logs, alerts, and chat history.
2. **Identify root cause and contributing factors** - Determine the root cause (the single change or condition that triggered the incident) and the contributing factors (the conditions that allowed it to become an incident: missing tests, no monitoring, insufficient review).
3. **Quantify impact** - Measure the incident's effect: duration of impact, number of users affected, requests failed, revenue lost (if applicable), SLA budget consumed, and any data loss or corruption.
4. **Document what worked and what did not** - Capture what went well (fast detection, effective runbook, good communication) and what went poorly (slow escalation, missing monitoring, confusing rollback procedure). Be specific.
5. **Propose prevention measures** - For each contributing factor, propose a concrete improvement that would prevent this class of incident. Distinguish between short-term fixes and long-term systemic improvements.
6. **Assign action items with owners** - Every prevention measure becomes an action item with a named owner and a deadline. Action items without owners do not get done.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| POSTMORTEM.md | Markdown | Complete postmortem document |

### POSTMORTEM.md Contents

- **Incident Summary**: One paragraph describing what happened and the impact
- **Severity**: P0-P3 classification
- **Timeline**: Minute-by-minute from start to resolution
- **Root Cause**: Clear statement of what caused the incident
- **Contributing Factors**: Conditions that allowed the root cause to become an incident
- **Impact Metrics**: Duration, users affected, requests failed, revenue impact, SLA impact
- **What Went Well**: Specific things that worked during the response
- **What Went Poorly**: Specific things that hindered the response
- **Action Items**: Table with columns: Action, Owner, Deadline, Priority
- **Prevention Measures**: Systemic improvements to prevent recurrence
- **Lessons Learned**: Key takeaways for the team

## Quality Criteria

- Blameless tone throughout: no finger-pointing, no "person X should have..."
- Timeline is accurate to the minute, sourced from logs and chat records
- Root cause explains the incident completely (not a surface-level description)
- Impact is quantified with real numbers, not estimates or vague language
- Every action item has a named owner (individual, not team) and a deadline
- Prevention measures address the root cause and contributing factors, not just symptoms
- The postmortem is shared with the team and discussed (not just filed away)
- Action items are tracked to completion in a follow-up review

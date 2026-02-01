# Gap Identification

How to identify and classify taste gaps.

## What is a Gap?

A **gap** exists when a dimension's score falls below its floor:

```
gap = score < floor
```

## Gap Classification

### Critical Gap
- **Condition:** `score < floor` AND `floor >= 3.0`
- **Meaning:** Quality is below minimum acceptable for a "must-have" dimension
- **Priority:** P1 - Must address before ship
- **ID Format:** TG-NNN

### Significant Gap
- **Condition:** `score < floor` AND `floor < 3.0`
- **Meaning:** Quality is below minimum for a "nice-to-have" dimension
- **Priority:** P2 - Should address, can ship with plan
- **ID Format:** TG-NNN

## Gap Severity Matrix

| Score | Floor 2.0 | Floor 2.5 | Floor 3.0 | Floor 3.5 |
|-------|-----------|-----------|-----------|-----------|
| 4.0 | OK | OK | OK | OK |
| 3.5 | OK | OK | OK | GAP (sig) |
| 3.0 | OK | OK | OK | GAP (crit) |
| 2.5 | OK | OK | GAP (sig) | GAP (crit) |
| 2.0 | OK | GAP (sig) | GAP (sig) | GAP (crit) |
| 1.5 | GAP (sig) | GAP (sig) | GAP (crit) | GAP (crit) |

## Gap Documentation

Each gap must include:

```yaml
id: TG-001
category: content | ux | brand | custom
dimension: dimension_name
score: 2.4
floor: 2.5
delta: -0.1
status: critical | significant
pipeline: P1 | P2 | U1 | U2 | null  # Likely associated pipeline
evidence:
  - "Specific observation 1"
  - "Specific observation 2"
traced_failure_modes: []  # Populated later by taste-trace
```

## Gap-to-Pipeline Mapping

Gaps often correlate with specific pipelines:

| Gap Category | Likely Pipeline |
|--------------|-----------------|
| content.voice_fidelity | P2 (Content Generation) |
| content.engagement | P2 (Content Generation) |
| ux.responsiveness | U1, U2 (UI flows) |
| ux.feedback_clarity | U1, U2 (UI flows) |
| ux.error_recovery | P*, U* (varies) |

This is a heuristic - actual mapping done in taste-trace skill.

## No Gaps Scenario

If no gaps are found:

```markdown
# Taste Gaps

**Project:** [name]
**Gaps Found:** 0

All dimensions meet or exceed their floor thresholds.

Lowest margin: voice_fidelity (3.2, floor 2.5, margin +0.7)
```

## Gap Aggregation

When multiple gaps exist:

1. **Count by severity:**
   - Critical: N
   - Significant: M

2. **Count by category:**
   - Content: N gaps
   - UX: M gaps

3. **Identify patterns:**
   - Multiple gaps in same category = systemic issue
   - Gaps across categories = distributed issues

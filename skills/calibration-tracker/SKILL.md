---
name: calibration-tracker
description: "Tracks estimate accuracy over time and adjusts future estimates based on historical data. Compares estimated vs actual effort, identifies systematic biases, and generates calibration adjustments. Enables increasingly accurate estimates as more data accumulates."
phase: COMPLETE
category: meta
version: "1.0.0"
depends_on: []
tags: [meta, calibration, estimation, metrics]
---

# Calibration Tracker

Improve estimates through feedback.

## When to Use

- **After journey completion** — Record actual vs estimated
- **Before estimating** — Load calibration adjustments
- **Periodically** — Analyze patterns across domains
- **When estimates consistently off** — Diagnose and adjust

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `calibration-formulas.md` | Statistical methods for adjustment |
| `variance-analysis.md` | Root cause patterns for estimate variance |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `confidence-levels.md` | When interpreting sample size confidence |

**Verification:** Ensure calibration.json is updated with new data point.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `calibration.json` | `domain-memory/{domain}/learning/` | Always (create or update) |

## Core Concept

Calibration Tracker answers: **"How can we estimate more accurately next time?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CALIBRATION FEEDBACK LOOP                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ESTIMATE ──────────────────────────────────────────▶ ACTUAL                │
│     │                                                    │                  │
│     │                                                    │                  │
│     │          ┌─────────────────────────┐               │                  │
│     │          │   Calibration Tracker   │               │                  │
│     │          │                         │               │                  │
│     └─────────▶│   Compare & Analyze     │◀──────────────┘                  │
│                │   Generate Adjustments  │                                  │
│                │   Store History         │                                  │
│                └────────────┬────────────┘                                  │
│                             │                                               │
│                             ▼                                               │
│                    FUTURE ESTIMATES                                         │
│                    (with adjustments)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Calibration Data Model

### Historical Record

```json
{
  "domain": "skills-library-mcp",
  "records": [
    {
      "id": "rec-001",
      "system": "Skills Library MCP",
      "date": "2025-01-17",
      "estimated": {
        "complexity": "M",
        "effortHours": 26,
        "durationDays": 2,
        "riskMultiplier": 1.2,
        "confidence": "high",
        "breakdown": {
          "foundation": 4,
          "state": 7.25,
          "memory": 3.5,
          "github": 3.5,
          "polish": 5.5
        }
      },
      "actual": {
        "effortHours": 4.5,
        "durationDays": 0.5,
        "breakdown": {
          "foundation": 0.5,
          "state": 1.5,
          "memory": 0.75,
          "github": 0.5,
          "polish": 1.25
        }
      },
      "ratio": 0.17,
      "factors": {
        "agenticExecution": true,
        "existingPatterns": true,
        "clearRequirements": true,
        "noBlockers": true
      },
      "notes": "Agentic continuous execution far faster than estimated human sprints"
    }
  ]
}
```

### Adjustment Model

```json
{
  "domain": "skills-library-mcp",
  "lastUpdated": "2025-01-17",
  "sampleSize": 1,
  "adjustments": {
    "global": {
      "agenticMultiplier": 0.3,
      "confidence": "low",
      "basedOn": 1
    },
    "byComplexity": {
      "S": { "multiplier": 1.0, "samples": 0 },
      "M": { "multiplier": 0.3, "samples": 1 },
      "L": { "multiplier": 1.0, "samples": 0 },
      "XL": { "multiplier": 1.0, "samples": 0 }
    },
    "byCategory": {
      "mcp": { "multiplier": 0.8, "samples": 1 },
      "typescript": { "multiplier": 0.9, "samples": 1 },
      "fileOperations": { "multiplier": 0.7, "samples": 1 }
    },
    "byPhase": {
      "INIT": { "multiplier": 0.5, "samples": 1 },
      "SCAFFOLD": { "multiplier": 0.3, "samples": 1 },
      "IMPLEMENT": { "multiplier": 0.3, "samples": 1 },
      "TEST": { "multiplier": 0.4, "samples": 1 },
      "VERIFY": { "multiplier": 0.3, "samples": 1 },
      "VALIDATE": { "multiplier": 0.3, "samples": 1 },
      "DOCUMENT": { "multiplier": 0.4, "samples": 1 },
      "REVIEW": { "multiplier": 0.3, "samples": 1 },
      "SHIP": { "multiplier": 0.3, "samples": 1 }
    }
  }
}
```

## The Calibration Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CALIBRATION PROCESS                                     │
│                                                                             │
│  RECORD PHASE (After journey)                                               │
│  ────────────────────────────                                               │
│                                                                             │
│  1. CAPTURE ACTUALS                                                         │
│     └─→ Total hours from journey tracer                                     │
│     └─→ Hours by phase                                                      │
│     └─→ Hours by skill                                                      │
│                                                                             │
│  2. COMPARE TO ESTIMATE                                                     │
│     └─→ Overall ratio (actual / estimated)                                  │
│     └─→ Phase-level ratios                                                  │
│     └─→ Identify largest variances                                          │
│                                                                             │
│  3. ANALYZE FACTORS                                                         │
│     └─→ What contributed to variance?                                       │
│     └─→ Agentic vs human execution?                                         │
│     └─→ Clear requirements vs ambiguity?                                    │
│     └─→ Existing patterns vs novel?                                         │
│                                                                             │
│  4. UPDATE ADJUSTMENTS                                                      │
│     └─→ Weighted average with history                                       │
│     └─→ Update confidence based on sample size                              │
│     └─→ Flag anomalies for review                                           │
│                                                                             │
│  APPLY PHASE (Before estimating)                                            │
│  ───────────────────────────────                                            │
│                                                                             │
│  5. LOAD ADJUSTMENTS                                                        │
│     └─→ Read domain calibration data                                        │
│     └─→ Check sample sizes for confidence                                   │
│                                                                             │
│  6. APPLY TO ESTIMATE                                                       │
│     └─→ Start with base estimate                                            │
│     └─→ Apply relevant multipliers                                          │
│     └─→ Document adjustments made                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Recording Actuals

### Source of Truth: skillsLog

The actual durations come from `loop-state.json`'s `skillsLog` field. Each skill invocation records:

```json
{
  "skill": "implement",
  "reason": "Implement C1: Record metric events",
  "startedAt": "2025-01-17T22:30:00Z",
  "completedAt": "2025-01-17T23:15:00Z",
  "durationMs": 2700000,
  "status": "complete"
}
```

**Extracting actuals:**

```javascript
// Sum all skill durations for total actual time
const totalMs = skillsLog.reduce((sum, entry) => {
  const entryMs = entry.durationMs || 0;
  const childMs = (entry.children || []).reduce((s, c) => s + (c.durationMs || 0), 0);
  return sum + entryMs + childMs;
}, 0);
const totalHours = totalMs / 3600000;

// Group by skill for per-skill calibration
const bySkill = {};
skillsLog.forEach(entry => {
  bySkill[entry.skill] = (bySkill[entry.skill] || 0) + entry.durationMs;
});

// Group by capability (from reason field) for per-capability calibration
const byCapability = {};
skillsLog.filter(e => e.reason.includes('C1:') || e.reason.includes('C2:')).forEach(...);
```

**What counts:**
- Skill execution time only (durationMs)
- Nested child skills are counted separately, not double-counted in parent
- Gate wait time is NOT included
- Human review time is NOT included

### After Journey Completion

```markdown
## Calibration Record: [System Name]

**Date:** [Date]
**Domain:** [Domain]

### Estimate (from ESTIMATE.md)

| Dimension | Value |
|-----------|-------|
| Complexity | [S/M/L/XL] |
| Effort | [X hours] |
| Duration | [Y days] |
| Risk Multiplier | [Z]x |
| Confidence | [High/Medium/Low] |

### Actual (from skillsLog)

| Dimension | Value |
|-----------|-------|
| Effort | [X hours] |
| Duration | [Y days] |
| Rework Cycles | [N] |

### Comparison

| Metric | Estimated | Actual | Ratio |
|--------|-----------|--------|-------|
| Total Hours | 26 | 4.5 | 0.17 |
| INIT Phase | 6 | 1.5 | 0.25 |
| SCAFFOLD Phase | 4 | 1 | 0.25 |
| IMPLEMENT Phase | 8 | 1.5 | 0.19 |
| TEST Phase | 2 | 0.5 | 0.25 |
| VERIFY Phase | 2 | 0.25 | 0.125 |
| VALIDATE Phase | 1 | 0.25 | 0.25 |
| DOCUMENT Phase | 1 | 0.5 | 0.5 |
| REVIEW Phase | 1 | 0.25 | 0.25 |
| SHIP Phase | 1 | 0.25 | 0.25 |

### Per-Skill Comparison

| Skill | Estimated | Actual | Ratio |
|-------|-----------|--------|-------|
| spec | 30m | 3m | 0.10 |
| estimation | 15m | 1m | 0.07 |
| architect | 60m | ? | ? |
| scaffold | 30m | ? | ? |
| implement | 300m | ? | ? |
| test-generation | 120m | ? | ? |
| code-verification | 30m | ? | ? |

### Contributing Factors

- [x] Agentic execution (continuous, no context switching)
- [x] Clear requirements (single system, well-defined)
- [x] Existing patterns (MCP SDK, TypeScript)
- [x] No blockers (no external dependencies)
- [ ] Novel domain (had prior knowledge)
- [ ] Complex integrations (simple file-based)

### Anomalies

- Estimate was for human developer with sprints
- Actual was agentic continuous execution
- Need separate calibration tracks for human vs agentic

### Adjustment Recommendation

| Factor | Current | Recommended | Confidence |
|--------|---------|-------------|------------|
| Agentic Global | N/A | 0.3x | Low (n=1) |
| Medium Complexity | 1.0x | 0.3x | Low (n=1) |
| MCP Category | N/A | 0.8x | Low (n=1) |
```

## Applying Calibration

### Before Estimating

```markdown
## Calibration Check: [New System]

**Domain:** [Domain]
**Date:** [Date]

### Available Calibration Data

| Factor | Samples | Adjustment | Confidence |
|--------|---------|------------|------------|
| Global (Agentic) | 1 | 0.3x | Low |
| Complexity (M) | 1 | 0.3x | Low |
| Category (MCP) | 1 | 0.8x | Low |

### Raw Estimate

[From estimation skill]
- Base effort: 40 hours
- Risk multiplier: 1.2x
- **Raw total: 48 hours**

### Calibrated Estimate

[Apply adjustments]
- Raw: 48 hours
- Agentic adjustment: × 0.3 = 14.4 hours
- MCP adjustment: × 0.8 = 11.5 hours
- **Calibrated total: 12-15 hours**

### Confidence Note

Sample size is low (n=1). Calibrated estimate has high uncertainty.
Recommend tracking actuals closely to improve calibration.
```

## Confidence Levels

| Sample Size | Confidence | Action |
|-------------|------------|--------|
| 0 | None | Use default multiplier (1.0x) |
| 1-2 | Low | Use with caution, wide range |
| 3-5 | Medium | Apply but verify |
| 6-10 | Good | Reliable for similar contexts |
| 10+ | High | Stable estimate |

## Variance Analysis

When ratio is significantly off:

### Underestimate (Actual > Estimated)

| Cause | Indicator | Fix |
|-------|-----------|-----|
| Hidden complexity | Many unknowns discovered | Add discovery phase |
| Scope creep | Requirements changed | Better requirements |
| Integration issues | External dependencies | Add integration buffer |
| Rework | Multiple iterations | Improve first-pass quality |

### Overestimate (Actual < Estimated)

| Cause | Indicator | Fix |
|-------|-----------|-----|
| Agentic efficiency | Continuous execution | Agentic multiplier |
| Familiar patterns | Reused previous work | Pattern multiplier |
| Clear requirements | No ambiguity | Reduce uncertainty buffer |
| Good tooling | MCP, IDE support | Tool productivity factor |

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Calibration data | `domain-memory/{domain}/learning/calibration.json` | Historical records |
| Record template | `domain-memory/{domain}/learning/calibration-records/` | Individual records |

## Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CALIBRATION INTEGRATION                                 │
│                                                                             │
│  estimation skill                                                           │
│       │                                                                     │
│       ├──▶ Reads calibration.json                                           │
│       │    └─→ Applies relevant adjustments                                 │
│       │    └─→ Documents adjustments in ESTIMATE.md                         │
│       │                                                                     │
│  journey-tracer                                                             │
│       │                                                                     │
│       └──▶ Provides actual hours                                            │
│            └─→ Total and by-phase breakdown                                 │
│                                                                             │
│  retrospective skill                                                        │
│       │                                                                     │
│       └──▶ Triggers calibration update                                      │
│            └─→ Calls calibration-tracker with journey data                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Calibration Tracker Verification Checklist

```markdown
## calibration-tracker Verification

### Record Phase
- [ ] Actual hours captured from journey
- [ ] Comparison to estimate documented
- [ ] Contributing factors identified
- [ ] Anomalies flagged
- [ ] Adjustment recommendations made

### Update Phase
- [ ] calibration.json updated
- [ ] Sample sizes incremented
- [ ] Confidence levels updated
- [ ] Anomalies documented for review

### Apply Phase
- [ ] Calibration data loaded before estimate
- [ ] Relevant adjustments applied
- [ ] Adjustments documented in estimate
- [ ] Confidence level noted
```

## Mode-Specific Behavior

Calibration tracking behavior differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system builds from scratch |
| **Approach** | Track all phases comprehensively |
| **Patterns** | Establish baseline calibration data |
| **Deliverables** | Phase timing, capability estimates |
| **Validation** | Compare estimated vs actual per system |
| **Constraints** | Minimal—building initial dataset |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap closure iterations, polish cycles |
| **Approach** | Track per-gap-type timing patterns |
| **Patterns** | Should match existing gap categories |
| **Deliverables** | Gap type baselines, rework frequency |
| **Validation** | Compare estimated vs actual per gap |
| **Constraints** | Must track by gap category |

**Polish considerations:**
- Track dark mode and responsive design time
- Measure deployment configuration overhead
- Account for test coverage improvement time
- Record rework frequency per gap type

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Surgical changes, pattern conformance |
| **Approach** | Track change size vs time ratios |
| **Patterns** | Must include enterprise overhead factors |
| **Deliverables** | Enterprise multiplier, review cycle time |
| **Validation** | Compare change estimate vs actual |
| **Constraints** | Include approval wait time in estimates |

**Enterprise constraints:**
- Account for codebase analysis overhead
- Track pattern conformance verification time
- Measure multi-team coordination delays
- Include compliance/security review cycles

### Mode-Specific Calibration Data

Store separate calibration tracks per mode:

```json
{
  "domain": "example-domain",
  "byMode": {
    "greenfield": {
      "samples": 3,
      "avgRatio": 0.35,
      "confidence": "medium"
    },
    "brownfield-polish": {
      "samples": 5,
      "avgRatio": 0.45,
      "confidence": "medium"
    },
    "brownfield-enterprise": {
      "samples": 2,
      "avgRatio": 0.60,
      "confidence": "low"
    }
  }
}
```

---

→ See `references/calibration-formulas.md` for statistical methods
→ See `references/variance-analysis.md` for root cause patterns

## References

| Reference | Description |
|-----------|-------------|
| [`calibration-formulas.md`](references/calibration-formulas.md) | Statistical methods for calculating calibration adjustments |
| [`confidence-levels.md`](references/confidence-levels.md) | Interpreting sample size and confidence levels |
| [`variance-analysis.md`](references/variance-analysis.md) | Root cause patterns for estimate variance |

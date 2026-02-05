---
name: calibration-sync
description: "Syncs calibration data for async operation. Loads effort estimates, accuracy history, and adjustment factors to improve planning accuracy."
phase: GATHER
category: operations
version: "1.0.0"
depends_on: [state-loader]
tags: [async, calibration, estimation, planning]
---

# Calibration Sync

Loads calibration data to inform accurate effort estimation during async operation.

## When to Use

- During async-loop GATHER phase
- To provide estimation context for queue planning
- To surface any calibration drift warnings

## What It Syncs

### Calibration Data

| Data | Source | Purpose |
|------|--------|---------|
| Base estimates | CalibrationService | Default effort per skill/loop |
| Multipliers | Calibration history | Personal adjustment factors |
| Accuracy metrics | Historical results | How accurate past estimates were |
| Drift warnings | Trend analysis | When calibration needs attention |

### Key Metrics

```json
{
  "calibration": {
    "overall_accuracy": 0.78,
    "by_loop": {
      "engineering-loop": { "accuracy": 0.82, "sample_size": 15 },
      "bugfix-loop": { "accuracy": 0.75, "sample_size": 8 }
    },
    "personal_multiplier": 1.15,
    "recent_trend": "improving"
  }
}
```

## Workflow

### Step 1: Load Calibration Service Data

```typescript
const calibration = await calibrationService.getCalibrationReport();
```

### Step 2: Extract Key Metrics

- Overall accuracy percentage
- Per-loop accuracy breakdown
- Personal multiplier (systematic over/under estimation)
- Sample sizes (confidence indicator)

### Step 3: Detect Drift

```typescript
const drift = {
  detected: calibration.accuracy < 0.7,
  direction: calibration.recentTrend,
  recommendation: calibration.accuracy < 0.7
    ? "Consider re-calibrating estimates"
    : null
};
```

### Step 4: Build Context

```json
{
  "calibration": {
    "synced_at": "ISO-timestamp",
    "accuracy": 0.78,
    "multiplier": 1.15,
    "confidence": "high",  // based on sample size
    "drift_warning": null,
    "by_loop": { ... },
    "recommendations": []
  }
}
```

## Output

Updates `memory/async-context.json`:

```json
{
  "calibration": {
    "synced_at": "ISO-timestamp",
    "overall_accuracy": 0.78,
    "personal_multiplier": 1.15,
    "confidence_level": "high",
    "loop_estimates": {
      "engineering-loop": { "base_hours": 3, "calibrated_hours": 3.45 },
      "bugfix-loop": { "base_hours": 1, "calibrated_hours": 1.15 }
    },
    "drift_warning": null
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Updated async context | `memory/async-context.json` | Always |

## Calibration Application

When planning async queue:

```typescript
const estimatedDuration = baseEstimate * calibration.personal_multiplier;
```

## References

- [calibration-factors.md](references/calibration-factors.md) — How calibration factors are calculated

# Analytics Module Dream State

> OBSERVE layer: Collect, aggregate, and surface insights from all orchestrator activity.

## Vision

A unified observation layer that answers: "What's happening? What patterns are emerging? What needs attention?" — providing the data foundation that the Learning module acts upon.

---

## Role in Self-Improvement Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELF-IMPROVEMENT LOOP                        │
│                                                                 │
│   ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│   │  EXECUTE    │ ───► │  ANALYTICS  │ ───► │  LEARNING   │    │
│   │             │      │  (observe)  │      │  (improve)  │    │
│   │  Loops run  │      │  Collect    │      │  Generate   │    │
│   │  Skills exe │      │  Aggregate  │      │  proposals  │    │
│   │  Gates pass │      │  Surface    │      │  Apply      │    │
│   └─────────────┘      └─────────────┘      └─────────────┘    │
│         ▲                                          │            │
│         └──────────────────────────────────────────┘            │
│                     (improved skills)                           │
└─────────────────────────────────────────────────────────────────┘
```

**Analytics is read-only.** It observes and reports. Learning acts on those observations.

---

## Data Sources

| Source | Service/Location | What We Extract |
|--------|------------------|-----------------|
| Run archives | `~/.claude/runs/` | Execution history, durations, outcomes |
| Rubric scores | `LearningService` | Skill effectiveness by dimension |
| Calibration data | `CalibrationService` | Estimate accuracy, adjustment factors |
| Gate metrics | Run archives | Pass/fail/revision rates |
| Patterns | `MemoryService` | Pattern usage, confidence levels |
| Proposals | `LearningService` | Pending/approved upgrade proposals |
| Skill versions | `SkillRegistry` | Version history, changelog |

---

## Functions

| Function | Status | Description |
|----------|--------|-------------|
| `collectRunMetrics()` | complete | Parse run archives → execution data |
| `collectRubricMetrics()` | complete | Aggregate rubric scores from LearningService |
| `collectCalibrationMetrics()` | complete | Pull estimate vs. actual from CalibrationService |
| `collectGateMetrics()` | complete | Extract gate pass/fail/revision from runs |
| `collectPatternMetrics()` | complete | Pattern usage and confidence from MemoryService |
| `collectProposalMetrics()` | complete | Pending/approved proposals from LearningService |
| `computeAggregates()` | complete | Calculate rates, averages, trends |
| `getAnalyticsSummary()` | complete | Dashboard-ready summary object |
| `getSkillHealth()` | complete | Skill rankings by rubric dimension |
| `getLoopPerformance()` | complete | Loop duration/success metrics |
| `getCalibrationAccuracy()` | complete | Estimate accuracy trends |
| `getTrends()` | complete | Time-series data for charts |

**Progress: 12/12 functions (100%)**

---

## Key Metrics

### Execution Metrics
- **Runs completed** — total, by loop type, by system
- **Success rate** — completed vs. failed/aborted
- **Avg duration** — per loop type, trend over time
- **Phase bottlenecks** — which phases take longest

### Skill Metrics (from LearningService)
- **Rubric scores** — completeness, quality, friction, relevance
- **Skill health** — aggregate score, trend
- **Improvement velocity** — proposals generated/approved over time

### Calibration Metrics (from CalibrationService)
- **Estimate accuracy** — predicted vs. actual duration
- **Adjustment factors** — current multipliers by loop/skill
- **Calibration trend** — are estimates improving?

### Gate Metrics
- **First-pass rate** — gates passed without revision
- **Revision rate** — how often gates require changes
- **Blocking patterns** — which gates block most often

### Pattern Metrics (from MemoryService)
- **Pattern count** — total patterns recorded
- **Pattern usage** — which patterns are referenced
- **Confidence levels** — pattern confidence distribution

---

## API Endpoints

| Endpoint | Method | Status | Returns |
|----------|--------|--------|---------|
| `/api/analytics/summary` | GET | complete | Dashboard summary object |
| `/api/analytics/aggregates` | GET | complete | All aggregated metrics |
| `/api/analytics/runs` | GET | complete | Run metrics with filters |
| `/api/analytics/skills` | GET | complete | Skill health rankings |
| `/api/analytics/loops` | GET | complete | Loop performance metrics |
| `/api/analytics/calibration` | GET | complete | Calibration accuracy |
| `/api/analytics/gates` | GET | complete | Gate performance |
| `/api/analytics/patterns` | GET | complete | Pattern metrics |
| `/api/analytics/proposals` | GET | complete | Proposal metrics |
| `/api/analytics/trends` | GET | complete | Time-series data |
| `/api/analytics/invalidate` | POST | complete | Invalidate cache |

**Progress: 11/11 endpoints (100%)**

---

## Dashboard View

**Location:** `apps/dashboard/app/analytics/page.tsx`

**Status:** complete

**Sections:**
1. **Summary cards** — runs, success rate, skills tracked, calibration, patterns, proposals
2. **Loop performance** — sortable by duration, success, frequency
3. **Skill health list** — health scores with trend indicators
4. **30-day trends** — visual bar chart of daily runs
5. **Calibration status** — accuracy, multiplier, trend

---

## Integration with Existing Services

```typescript
// Analytics reads from these services (read-only)
import { LearningService } from './LearningService';
import { CalibrationService } from './CalibrationService';
import { MemoryService } from './MemoryService';
import { SkillRegistry } from './SkillRegistry';
import { RunArchivalService } from './RunArchivalService';

// Analytics does NOT write to these services
// Writing is the Learning module's responsibility
```

---

## Completion Criteria

This module is **done** when:

- [x] All 12 functions implemented and tested
- [x] API endpoints exposed and documented
- [x] Dashboard view renders all metrics
- [ ] Integration tests with existing services
- [x] Documentation complete

**Completion algebra:**
```
(collectRunMetrics ∧ collectRubricMetrics ∧ collectCalibrationMetrics ∧
 collectGateMetrics ∧ collectPatternMetrics ∧ collectProposalMetrics ∧
 computeAggregates ∧ getAnalyticsSummary ∧ getSkillHealth ∧
 getLoopPerformance ∧ getCalibrationAccuracy ∧ getTrends) ∧
dashboardView ∧ apiEndpoints
```

**Status: 95% complete** — integration tests pending

---

## Anti-Goals

- **Not writing data** — Analytics observes only; Learning writes
- **Not real-time streaming** — page refresh is sufficient
- **Not predictive** — descriptive analytics only (for now)
- **Not replacing services** — wraps existing services, doesn't duplicate

---

## Dependencies

- `LearningService` — rubric scores, proposals
- `CalibrationService` — estimate accuracy
- `MemoryService` — patterns, decisions
- `SkillRegistry` — skill versions
- `RunArchivalService` — run archive access

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
| `collectRunMetrics()` | pending | Parse run archives → execution data |
| `collectRubricMetrics()` | pending | Aggregate rubric scores from LearningService |
| `collectCalibrationMetrics()` | pending | Pull estimate vs. actual from CalibrationService |
| `collectGateMetrics()` | pending | Extract gate pass/fail/revision from runs |
| `collectPatternMetrics()` | pending | Pattern usage and confidence from MemoryService |
| `collectProposalMetrics()` | pending | Pending/approved proposals from LearningService |
| `computeAggregates()` | pending | Calculate rates, averages, trends |
| `getAnalyticsSummary()` | pending | Dashboard-ready summary object |
| `getSkillHealth()` | pending | Skill rankings by rubric dimension |
| `getLoopPerformance()` | pending | Loop duration/success metrics |
| `getCalibrationAccuracy()` | pending | Estimate accuracy trends |
| `getTrends()` | pending | Time-series data for charts |

**Progress: 0/12 functions (0%)**

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

| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/analytics/summary` | GET | Dashboard summary object |
| `/api/analytics/runs` | GET | Run metrics with filters |
| `/api/analytics/skills` | GET | Skill health rankings |
| `/api/analytics/calibration` | GET | Calibration accuracy |
| `/api/analytics/gates` | GET | Gate performance |
| `/api/analytics/trends` | GET | Time-series data |

---

## Dashboard View

**Location:** `apps/dashboard/app/analytics/page.tsx`

**Sections:**
1. **Summary cards** — runs, success rate, avg duration, skill health
2. **Loop performance table** — sortable by duration, success, frequency
3. **Skill health matrix** — rubric dimensions × skills heatmap
4. **Calibration accuracy** — estimate vs. actual scatter plot
5. **Gate analysis** — pass/fail/revision breakdown
6. **Trend charts** — runs over time, improvement velocity

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

- [ ] All 12 functions implemented and tested
- [ ] API endpoints exposed and documented
- [ ] Dashboard view renders all metrics
- [ ] Integration tests with existing services
- [ ] Documentation complete

**Completion algebra:**
```
(collectRunMetrics ∧ collectRubricMetrics ∧ collectCalibrationMetrics ∧
 collectGateMetrics ∧ collectPatternMetrics ∧ collectProposalMetrics ∧
 computeAggregates ∧ getAnalyticsSummary ∧ getSkillHealth ∧
 getLoopPerformance ∧ getCalibrationAccuracy ∧ getTrends) ∧
dashboardView ∧ apiEndpoints
```

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

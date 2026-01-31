# Learning Module Dream State

> ACT layer: Process signals from Analytics, generate improvements, and apply upgrades across the system.

## Vision

A unified improvement layer that answers: "What should we improve? How? When?" — turning observations into actions that make skills, loops, and calibration better over time.

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

**Learning writes.** It processes Analytics insights and updates skills, calibration, and patterns.

---

## Existing Services (to be unified)

This module formalizes and orchestrates existing services:

| Service | Current Location | Responsibility |
|---------|------------------|----------------|
| `LearningService` | `src/services/LearningService.ts` | Rubric scoring, improvement proposals |
| `CalibrationService` | `src/services/CalibrationService.ts` | Estimate accuracy, adjustment factors |
| `MemoryService` | `src/services/MemoryService.ts` | Patterns, decisions, context |
| `SkillRegistry` | `src/services/SkillRegistry.ts` | Skill versioning, Git tags |

**The Learning module provides a unified interface** to these services via the `ImprovementOrchestrator`, adding:
- Analytics-driven proposal generation
- Automated improvement pipelines
- Cross-service coordination

---

## Existing Patterns (to be enforced)

| Pattern | ID | Learning Module Role |
|---------|----|-----------------------|
| learning-feedback-loop | PAT-007 | Core pattern: rubric → proposals → upgrades |
| version-alignment | PAT-008 | Ensure skill versions stay aligned |
| explicit-rules-enforcement | PAT-009 | Add Critical Rules to improved skills |
| completion-archival | PAT-002 | Archive learning outcomes |

---

## Functions

### Signal Processing (from Analytics)

| Function | Status | Description |
|----------|--------|-------------|
| `processAnalyticsSignals()` | complete | Consume Analytics summary, identify improvement targets |
| `identifyLowHealthSkills()` | complete | Find skills with rubric scores below threshold |
| `identifyCalibrationDrift()` | complete | Find loops/skills with poor estimate accuracy |
| `identifyPatternCandidates()` | complete | Find repeated behaviors that should become patterns |

### Proposal Generation

| Function | Status | Description |
|----------|--------|-------------|
| `generateSkillProposal()` | exists | Create upgrade proposal for a skill (LearningService) |
| `generateCalibrationAdjustment()` | complete | Propose calibration factor change (ImprovementOrchestrator) |
| `generatePatternProposal()` | complete | Propose new pattern based on observed behavior |
| `prioritizeProposals()` | complete | Rank proposals by impact (leverage protocol style) |

### Proposal Application

| Function | Status | Description |
|----------|--------|-------------|
| `applySkillUpgrade()` | exists | Apply approved skill upgrade (LearningService) |
| `applyCalibrationAdjustment()` | complete | Apply calibration factor (ImprovementOrchestrator) |
| `applyPatternRecording()` | exists | Record new pattern (MemoryService) |
| `bumpSkillVersion()` | exists | Semantic version bump + Git tag (SkillRegistry) |

### Coordination

| Function | Status | Description |
|----------|--------|-------------|
| `runImprovementCycle()` | complete | Full cycle: analyze → propose → review → apply |
| `getImprovementQueue()` | complete | List pending proposals with priorities |
| `getImprovementHistory()` | complete | Past improvements with outcomes |

**Progress: 15/15 functions (100%)**

---

## Integration with ADRs

| ADR | How Learning Module Implements |
|-----|--------------------------------|
| ADR-002: Learning System v2 | Extends rubric scoring with Analytics-driven triggers |
| ADR-004: Version Alignment | Uses SkillRegistry for version bumps |
| ADR-005: Critical Rules | Adds Critical Rules section when upgrading skills |

---

## API Endpoints

| Endpoint | Method | Status | Description |
|----------|--------|--------|-------------|
| `/api/learning/queue` | GET | complete | Get prioritized proposals |
| `/api/learning/targets` | GET | complete | Get improvement targets |
| `/api/learning/history` | GET | complete | Get improvement history |
| `/api/learning/cycle` | POST | complete | Trigger improvement cycle |
| `/api/learning/patterns` | GET | complete | List pattern proposals |
| `/api/learning/patterns/:id` | GET | complete | Get pattern proposal details |
| `/api/learning/patterns/:id/approve` | POST | complete | Approve and apply pattern |
| `/api/learning/patterns/:id/reject` | POST | complete | Reject pattern proposal |
| `/api/learning/calibration` | GET | complete | List calibration adjustments |
| `/api/learning/calibration/:id/apply` | POST | complete | Apply calibration adjustment |

**Progress: 10/10 endpoints (100%)**

---

## Dashboard Integration

**Location:** `apps/dashboard/app/improvements/page.tsx` (exists)

**Enhancements available via new endpoints:**
1. Show Analytics-derived insights alongside proposals via `/api/learning/targets`
2. Priority ranking based on leverage protocol via `/api/learning/queue`
3. One-click approval workflow via `/api/learning/patterns/:id/approve`
4. Improvement velocity tracking via `/api/learning/history`

---

## Improvement Cycle Flow

```
┌──────────────────────────────────────────────────────────────┐
│  1. ANALYZE                                                  │
│     Analytics.getSkillHealth() → low health skills           │
│     Analytics.getCalibrationAccuracy() → drifting estimates  │
│     Analytics.getTrends() → repeated behaviors               │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  2. PROPOSE                                                  │
│     For each target:                                         │
│       generateSkillProposal() | generateCalibrationAdjustment│
│       generatePatternProposal()                              │
│     prioritizeProposals() → ranked queue                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  3. REVIEW (human-in-the-loop)                               │
│     Dashboard shows proposals                                │
│     User approves/rejects                                    │
│     Optional: auto-approve low-risk changes                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  4. APPLY                                                    │
│     applySkillUpgrade() → update SKILL.md, CHANGELOG.md      │
│     bumpSkillVersion() → Git tag                             │
│     applyCalibrationAdjustment() → update factors            │
│     applyPatternRecording() → add to memory                  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│  5. VERIFY                                                   │
│     Next execution cycle:                                    │
│       Analytics observes improvement                         │
│       Feedback loop closes                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Completion Criteria

This module is **done** when:

- [x] All pending functions implemented (ImprovementOrchestrator)
- [x] Unified interface wrapping existing services
- [x] Analytics-driven proposal generation working
- [x] API endpoints exposed (10 endpoints)
- [ ] Dashboard enhancements complete
- [ ] Integration tests passing
- [x] Documentation complete

**Completion algebra:**
```
(processAnalyticsSignals ∧ identifyLowHealthSkills ∧
 identifyCalibrationDrift ∧ identifyPatternCandidates ∧
 generatePatternProposal ∧ prioritizeProposals ∧
 runImprovementCycle ∧ getImprovementQueue ∧ getImprovementHistory) ∧
apiEndpoints ∧ dashboardEnhancements
```

**Status: 90% complete** — dashboard enhancements and integration tests pending

---

## Anti-Goals

- **Not replacing existing services** — wraps and coordinates them
- **Not fully automated** — human-in-the-loop for approvals
- **Not changing skill semantics** — only improves content, not purpose
- **Not real-time** — batch improvement cycles

---

## Dependencies

- `AnalyticsService` — provides signals for improvement targeting
- `LearningService` — existing proposal generation
- `CalibrationService` — existing calibration adjustments
- `MemoryService` — pattern storage
- `SkillRegistry` — version management

---

## Notes

- Learning module is the "write" side; Analytics is the "read" side
- Human approval required for skill changes (Critical Rules pattern)
- Calibration adjustments can be auto-applied (lower risk)
- Pattern recording always requires human confirmation
- ImprovementOrchestrator created at `src/services/learning/ImprovementOrchestrator.ts`

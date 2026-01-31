# System Dream State: orchestrator

> This document defines "done" for the orchestrator system. All modules roll up here.

**Organization:** superorganism
**Domain:** _{to be defined}_
**Location:** ~/workspaces/orchestrator

## Vision

A self-improving meta-system where skills are the atomic primitive. Orchestrator manages skills, composes them into loops, executes loops with quality gates, learns from every execution, and maintains context across sessions. The system should enable "show up, say go" workflows where complex engineering tasks are decomposed and executed with rigor.

---

## Modules

| Module | Path | Status | Functions | Progress |
|--------|------|--------|-----------|----------|
| skill-registry | src/services/SkillRegistry.ts | complete | 6/6 | 100% |
| loop-composer | src/services/LoopComposer.ts | complete | 5/5 | 100% |
| execution-engine | src/services/ExecutionEngine.ts | complete | 12/12 | 100% |
| memory-service | src/services/MemoryService.ts | complete | 6/6 | 100% |
| learning-service | src/services/LearningService.ts | complete | 12/12 | 100% |
| calibration-service | src/services/CalibrationService.ts | complete | 4/4 | 100% |
| inbox-processor | src/services/InboxProcessor.ts | complete | 5/5 | 100% |
| run-archival | src/services/RunArchivalService.ts | complete | 5/5 | 100% |
| guarantee-service | src/services/GuaranteeService.ts | complete | 8/8 | 100% |
| loop-guarantee-aggregator | src/services/LoopGuaranteeAggregator.ts | complete | 4/4 | 100% |
| deliverable-manager | src/services/DeliverableManager.ts | complete | 5/5 | 100% |
| version-utility | src/version.ts | complete | 1/1 | 100% |
| http-server | src/server/httpServer.ts | complete | 5/5 | 100% |
| loop-commands | commands/*.md | complete | 11/11 | 100% |
| analytics | src/services/analytics/ | pending | 0/12 | 0% |
| learning | src/services/learning/ | pending | 7/15 | 47% |

---

## Module Checklists

### skill-registry (complete)
- [x] list_skills operational
- [x] get_skill operational
- [x] create_skill operational
- [x] update_skill operational
- [x] search_skills operational
- [x] capture_improvement operational

### loop-composer (complete)
- [x] list_loops operational
- [x] get_loop operational
- [x] create_loop operational
- [x] validate_loop operational
- [x] compose from skills operational

### execution-engine (complete)
- [x] start_execution operational
- [x] get_execution operational
- [x] advance_phase operational
- [x] complete_phase operational
- [x] complete_skill operational
- [x] skip_skill operational
- [x] approve_gate operational
- [x] reject_gate operational
- [x] pause_execution operational
- [x] resume_execution operational

### memory-service (complete)
- [x] get_memory operational
- [x] update_summary operational
- [x] record_decision operational
- [x] record_pattern operational
- [x] create_handoff operational
- [x] load_context operational

### learning-service (complete)
- [x] capture_skill_improvement operational
- [x] list_proposals operational
- [x] apply_proposal operational
- [x] approve_proposal operational
- [x] reject_proposal operational
- [x] get_skill_metrics operational
- [x] get_learning_status operational
- [x] identify_underutilized_skills operational

### calibration-service (complete)
- [x] get_calibrated_estimate operational
- [x] record_estimate_result operational
- [x] get_calibration_report operational
- [x] get_calibration_recommendations operational

### inbox-processor (complete)
- [x] add_to_inbox operational
- [x] add_url_to_inbox operational
- [x] list_inbox operational
- [x] process_inbox_item operational
- [x] approve_extraction operational

### run-archival (complete)
- [x] query_runs operational
- [x] archive_run operational
- [x] get_recent_context operational
- [x] createRunSummary operational
- [x] pruneStateFile operational

### guarantee-service (complete)
- [x] registerSkillGuarantee operational
- [x] getSkillGuarantees operational
- [x] validateGuarantees operational
- [x] enforceGuarantees operational
- [x] getLoopGuaranteeMap operational
- [x] aggregateLoopGuarantees operational
- [x] setAggregator operational
- [x] getRegistryVersion operational

### loop-guarantee-aggregator (complete)
- [x] aggregateForLoop operational
- [x] aggregateAll operational
- [x] getSummary operational
- [x] getLoopGuarantees operational

### deliverable-manager (complete)
- [x] initialize operational
- [x] storeDeliverable operational
- [x] getDeliverable operational
- [x] listDeliverables operational
- [x] getDeliverablePath operational

### version-utility (complete)
- [x] getVersion — reads from package.json at runtime

### loop-commands (complete)
- [x] engineering-loop — v5.0.0 with hierarchy + completion + leverage
- [x] learning-loop — v2.0.0 with hierarchy + completion + leverage
- [x] bugfix-loop — v2.0.0 with hierarchy + completion + leverage
- [x] proposal-loop — v3.0.0 with hierarchy + completion + leverage
- [x] meta-loop — v2.0.0 with hierarchy + completion + leverage
- [x] infra-loop — v2.0.0 with hierarchy + completion + leverage
- [x] distribution-loop — v2.0.0 with version bump + leverage
- [x] audit-loop — v2.0.0 with hierarchy + completion + leverage
- [x] deck-loop — v2.0.0 with hierarchy + completion + leverage
- [x] transpose-loop — v2.0.0 with hierarchy + completion + leverage
- [x] dream-loop — v1.0.0 with tier detection + leverage

### analytics (pending)
- [ ] collectRunMetrics — parse run archives
- [ ] collectRubricMetrics — aggregate from LearningService
- [ ] collectCalibrationMetrics — pull from CalibrationService
- [ ] collectGateMetrics — extract from run archives
- [ ] collectPatternMetrics — pull from MemoryService
- [ ] collectProposalMetrics — pull from LearningService
- [ ] computeAggregates — rates, averages, trends
- [ ] getAnalyticsSummary — dashboard-ready summary
- [ ] getSkillHealth — rankings by rubric dimension
- [ ] getLoopPerformance — duration/success metrics
- [ ] getCalibrationAccuracy — estimate accuracy trends
- [ ] getTrends — time-series data
- [ ] API endpoints — /api/analytics/*
- [ ] Dashboard view — apps/dashboard/app/analytics/page.tsx

### learning (pending)
- [ ] processAnalyticsSignals — consume analytics, identify targets
- [ ] identifyLowHealthSkills — find skills below threshold
- [ ] identifyCalibrationDrift — find poor estimate accuracy
- [ ] identifyPatternCandidates — find repeated behaviors
- [x] generateSkillProposal — exists in LearningService
- [x] generateCalibrationAdjustment — exists in CalibrationService
- [ ] generatePatternProposal — propose new patterns
- [ ] prioritizeProposals — rank by impact
- [x] applySkillUpgrade — exists in LearningService
- [x] applyCalibrationAdjustment — exists in CalibrationService
- [x] applyPatternRecording — exists in MemoryService
- [x] bumpSkillVersion — exists in SkillRegistry
- [ ] runImprovementCycle — full analyze→propose→apply cycle
- [ ] getImprovementQueue — list pending proposals
- [ ] getImprovementHistory — past improvements
- [ ] API endpoints — /api/learning/*
- [ ] Dashboard enhancements — improvements page updates

---

## Completion Algebra

```
System.done = ALL(Module.done)
            = skill-registry.done AND loop-composer.done AND execution-engine.done
              AND memory-service.done AND learning-service.done AND calibration-service.done
              AND inbox-processor.done AND run-archival.done AND guarantee-service.done
              AND loop-guarantee-aggregator.done AND deliverable-manager.done
              AND version-utility.done AND http-server.done AND loop-commands.done
              AND analytics.done AND learning.done

Current: 14/16 modules complete (87%)
Pending: analytics (0%), learning (47%)
Status: Core operational, self-improvement modules in progress
Version: 0.8.0
```

---

## Active Loops

| Loop | Phase | Scope | Started | Last Update |
|------|-------|-------|---------|-------------|
| (none) | | | | |

---

## Recent Completions

> Last 5 completed loop runs for this system.

| Date | Loop | Scope | Outcome | Key Deliverables |
|------|------|-------|---------|------------------|
| 2026-01-30 | distribution-loop | v0.7.0 | success | Version alignment shipped |
| 2026-01-30 | learning-loop | validation | success | ADR-004, PAT-008 recorded |
| 2026-01-30 | distribution-loop | v0.7.0 | success | Learning System v2 + Leverage Protocol |
| 2026-01-30 | engineering-loop | leverage-protocol | success | Protocol + loop integration |
| 2026-01-30 | engineering-loop | learning-v2 | success | Rubric scoring + proposals |

---

## Dependencies

**Depends on:** None (root system)

**Depended on by:** dashboard, all other projects using orchestrator

---

## Notes

- Architecture v1.0.0 established 2025-01-29
- 54+ MCP tools operational
- 11 loop definitions with unified architecture (Organization → System → Module)
- Run archival system operational
- Deep Context Protocol active across all loops (v1.0.0 - 2025-01-29)
  - Global instructions in ~/.claude/CLAUDE.md
  - Shared protocol in commands/_shared/clarification-protocol.md
  - Per-loop Clarification Protocol sections
  - Terrain Check: uphill/downhill forcing function after every response
- Docs Alignment skill (v1.0.0 - 2025-01-29)
  - MECE documentation taxonomy
  - Automatic alignment after every loop COMPLETE phase
  - Dream State updates, cross-reference validation, indexing
  - See `skills/docs-alignment/SKILL.md`
- Learning System v2 (v2.0.0 - 2026-01-30)
  - Rubric scoring: completeness, quality, friction, relevance
  - Section recommendations for skill improvement
  - Threshold-based upgrade proposal generation
  - complete_run_tracking for learning persistence
  - See ADR-002 in memory/orchestrator.json
- Leverage Protocol (v1.0.0 - 2026-01-30)
  - Value equation: (DSA×0.40 + Unlock×0.25 + Likelihood×0.15) / (Time×0.10 + Effort×0.10)
  - Internal mode after every response (not surfaced)
  - External mode at loop boundaries (always propose next loop)
  - See commands/_shared/leverage-protocol.md
- Version Alignment (v1.0.0 - 2026-01-30)
  - Single source of truth in package.json
  - src/version.ts reads at runtime
  - distribution-loop bumps version during INIT phase
  - See ADR-004 in memory/orchestrator.json
- Guarantee System (v1.0.0 - 2026-01-30)
  - Belt-and-suspenders guarantee enforcement
  - Skill guarantees aggregate to loop guarantees
  - Autonomous mode validation
- Deliverable Organization (v1.0.0 - 2026-01-30)
  - Structured deliverable storage per execution
  - Consistent paths: deliverables/{executionId}/{phase}/{filename}
- Self-Improvement Architecture (v1.0.0 - 2026-01-31)
  - Two-module design: Analytics (observe) + Learning (improve)
  - Analytics reads from all services, surfaces insights
  - Learning processes signals, generates proposals, applies upgrades
  - Feedback loop: Execute → Analytics → Learning → improved skills → Execute
  - See src/services/analytics/DREAM-STATE.md and src/services/learning/DREAM-STATE.md

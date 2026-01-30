# Release Scope: v0.6.0 — Learning System v2

## Summary

This release adds **rubric-based skill improvement** to the orchestrator. Skills can now be scored on four dimensions (completeness, quality, friction, relevance), and the system automatically generates upgrade proposals when patterns emerge across runs.

## Changes

### Core Feature: Learning System v2

**LearningService.ts** (+680 lines)
- Run signal tracking: captures phase signals, gate outcomes per execution
- Rubric scoring: 1-5 scale on completeness, quality, friction, relevance
- Section recommendations: add/remove/update suggestions from executions
- Upgrade proposals: auto-generated when thresholds are met
- Evidence aggregation: links proposals to specific runs and signals

**executionTools.ts** (+323 lines)
- `complete_skill` enhanced with rubric and sectionRecommendations params
- `complete_run_tracking` — finalize run signal collection
- `list_upgrade_proposals` — view pending skill improvements
- `approve_upgrade_proposal` — approve for application
- `reject_upgrade_proposal` — reject with reason

**apiRoutes.ts** (+133 lines)
- `GET /api/improvements/summary` — learning overview
- `GET /api/improvements` — list upgrade proposals
- `POST /api/improvements/:id/approve` — approve proposal
- `POST /api/improvements/:id/reject` — reject proposal

**types.ts** (+113 lines)
- SkillRubric, SectionRecommendation, SkillSignal
- RunSignal, PhaseSignal, GateOutcome
- SkillUpgradeProposal, SkillChange, ProposalEvidence
- LearningConfig with configurable thresholds

### Supporting Files

**New directories:**
- `.claude/` — project-level Claude configuration
- `memory/improvements/` — improvement proposal storage
- `memory/learning/` — run signals and learning data
- `apps/dashboard/app/improvements/` — improvements dashboard UI

**Documentation:**
- `ANALYSIS-FINDINGS.md` — analysis notes
- `ARCHITECTURE-SPEC.md` — architecture specification
- `RETROSPECTIVE-unified-architecture.md` — retrospective notes

### Minor Changes

- `apps/dashboard/app/layout.tsx` — layout tweak
- `src/index.ts` — learning service initialization
- `src/server/httpServer.ts` — route registration

## Version

- Current: 0.6.0 (no bump needed, matches last commit)

## Distribution Targets

- [x] GitHub (origin/main)
- [x] GitHub Actions (distribute.yml triggers)
- [x] Railway (via CI)
- [x] Vercel (via CI)
- [x] GitHub Release (rolling latest)

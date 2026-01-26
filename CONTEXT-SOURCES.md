# Context Sources

## Summary

| Metric | Value |
|--------|-------|
| **Total Sources** | 14 |
| **Source Types** | Documentation, Source Code, Config, Application |
| **Categories** | Architecture, Core Services, Workflows, Skills, Interface, UI, Identity |
| **Key Facts Extracted** | 42 |
| **Gaps Identified** | 3 |

## Source Registry

### Architecture & Design (2)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-01 | `CLAUDE.md` | Documentation | Project overview, 54+ tool inventory, workflow patterns, API endpoints, conventions |
| SRC-03 | `src/types.ts` | Source Code | All type definitions: Skill, Loop, Execution, Memory, Inbox (552 LOC) |

### Core Services (4)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-04 | `src/services/ExecutionEngine.ts` | Source Code | State machine for running loops, phase tracking, gate enforcement |
| SRC-05 | `src/services/MemoryService.ts` | Source Code | 3-tier memory hierarchy (orchestrator/loop/skill), patterns, decisions, handoffs |
| SRC-06 | `src/services/LearningService.ts` | Source Code | Post-execution analysis, improvement proposals, skill metric updates |
| SRC-07 | `src/services/SkillRegistry.ts` | Source Code | Skill indexing, versioning, hot-reload, search |

### Workflow Definitions (2)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-08 | `loops/engineering-loop/loop.json` | Config | 10-phase engineering loop, 6 quality gates, 13 skills, v3.0.0 |
| SRC-09 | `loops/proposal-loop/loop.json` | Config | 6-phase proposal loop, 5 human gates, 7 skills, v2.0.0 |

### Skill Library (2)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-10 | `skills/` (38 directories) | Skill Definitions | Full library across 5 categories (core, infra, meta, specialized, custom) |
| SRC-11 | `skills/implement/SKILL.md` | Skill Definition | Representative skill: structured process, references, quality standards |

### Interface & Identity (3)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-02 | `package.json` | Config | @superorganism/orchestrator v0.1.0, dependencies, scripts |
| SRC-13 | `src/server/httpServer.ts` | Source Code | REST endpoints, SSE streaming, CORS, MCP transport |
| SRC-14 | `src/tools/skillTools.ts` | Source Code | MCP tool definitions and handlers for skill operations |

### User-Facing (1)

| ID | Source | Type | Key Content |
|----|--------|------|-------------|
| SRC-12 | `apps/dashboard/` | Application | Next.js 15 + React 19 real-time monitoring dashboard |

## Coverage Assessment

| Category | Status | Notes |
|----------|--------|-------|
| Architecture | Complete | Types, services, storage model fully documented |
| Workflows | Complete | Engineering loop and proposal loop fully extracted |
| Skills | Complete | 38 skills cataloged across 5 categories |
| Interface | Complete | 105+ MCP tools, REST API, SSE streaming |
| UI | Partial | Dashboard exists but no screenshots available |
| Adoption story | Inferred | No real-world adoption data; constructed from architecture |

## Gaps

| Gap | Impact on Deck | Mitigation |
|-----|---------------|------------|
| No production deployment metrics | Can't cite real numbers | Frame honestly as alpha (v0.1.0), focus on architecture potential |
| No competitor comparison | Audience may ask "why not X?" | Position vs. ad-hoc scripts, Makefiles, CI-only pipelines |
| No screenshots/video | Dashboard walkthrough weaker without visuals | Describe features, suggest live demo as follow-up |

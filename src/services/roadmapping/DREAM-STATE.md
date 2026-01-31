# Module Dream State: roadmapping

> This document defines "done" for the roadmapping module within the Orchestrator system.

**System**: Orchestrator
**Module**: roadmapping
**Location**: src/services/roadmapping/

## Vision

System-level visibility into module progress, dependencies, and completion status. The spine that makes everything else trackable. Integrates with engineering-loop for module tracking and leverage protocol for optimal sequencing.

---

## Functions

| Function | Status | Description |
|----------|--------|-------------|
| load | complete | Load roadmap from ROADMAP.md or state file |
| save | complete | Persist state to roadmap-state.json |
| getRoadmap | complete | Get current roadmap data |
| getModule | complete | Get specific module by ID |
| getModulesByLayer | complete | Get all modules in a layer |
| updateModuleStatus | complete | Update module status with timestamps |
| setCurrentModule | complete | Set active working module |
| getProgress | complete | Calculate overall and per-layer progress |
| getNextAvailableModules | complete | Get modules ready to start |
| calculateCriticalPath | complete | Find highest-impact modules |
| calculateLeverageScores | complete | Score modules by leverage protocol |
| getNextHighestLeverageModule | complete | Get best next module |
| generateTerminalView | complete | Generate terminal visualization |
| parseRoadmapMd | complete | Parse ROADMAP.md format |

---

## Checklist

### Service (src/services/roadmapping/)
- [x] RoadmapService.ts — Core service implementation
- [x] index.ts — Exports
- [x] DREAM-STATE.md — This file

### Skill (skills/roadmapping/)
- [x] SKILL.md — Skill definition with process and examples

### API Endpoints
- [x] GET /api/roadmap — Full roadmap with progress
- [x] GET /api/roadmap/progress — Progress summary
- [x] GET /api/roadmap/modules — List all modules
- [x] GET /api/roadmap/modules/:id — Get specific module
- [x] PUT /api/roadmap/modules/:id/status — Update module status
- [x] GET /api/roadmap/next — Get next highest leverage module
- [x] GET /api/roadmap/leverage — Get all leverage scores
- [x] GET /api/roadmap/terminal — Get terminal visualization
- [x] PUT /api/roadmap/current — Set current module

### MCP Tools
- [x] get_roadmap — Get full roadmap
- [x] get_roadmap_progress — Get progress summary
- [x] get_roadmap_module — Get specific module
- [x] get_modules_by_layer — Get modules by layer
- [x] update_module_status — Update status
- [x] set_current_module — Set current module
- [x] get_next_module — Get next highest leverage
- [x] get_leverage_scores — Get all scores
- [x] render_roadmap_terminal — Terminal view

---

## Completion Algebra

```
Module.done = Service.done AND Skill.done AND API.done AND Tools.done
            = RoadmapService.operational AND SKILL.md.exists
              AND 9/9 endpoints.operational AND 9/9 tools.operational

Current: 14/14 functions complete (100%)
Status: Complete
```

---

## Integration Points

### Engineering Loop
- On module completion → update roadmap status
- At COMPLETE phase → suggest next module via leverage protocol

### Leverage Protocol
- calculateLeverageScores() uses the leverage equation
- getNextHighestLeverageModule() returns top-scored module

### Dashboard
- API endpoints power roadmap visualization
- Terminal view for CLI usage

---

## Notes

- Layers are numbered 0-6 (7 total layers)
- Layers represent contextual waves, not fixed categories
- Dependencies can reference existing capabilities via "(exists)" suffix
- Updates to existing modules tracked separately
- Brainstorm section holds unscoped ideas

# Orchestrator - Claude Code Instructions

## Project Overview

Orchestrator is a self-improving meta-system where **skills are the atomic primitive**. It manages skills, composes them into loops, learns at all levels, and generates UI apps from loop definitions.

## Directory Structure

- `src/` - TypeScript source code
  - `core/` - Domain entities (Skill, Loop, Memory, Execution)
  - `services/` - Business logic (SkillRegistry, LoopComposer, ExecutionEngine)
  - `tools/` - MCP tool handlers
  - `storage/` - Persistence layer (GitStorage, FileStorage)
- `skills/` - Skill definitions (each skill is a directory with SKILL.md)
- `loops/` - Loop definitions (loop.json + LOOP.md)
- `memory/` - Persistent learning state
- `generator/` - Loop App generation

## Key Patterns

### Skill Versioning
Skills use semantic versioning with Git tags:
```bash
skill/{name}@{version}
# Example: skill/implement@2.1.0
```

### Memory Hierarchy
```
Orchestrator Memory (global patterns)
    └── Loop Memory (loop-specific learning)
            └── Skill Memory (skill-specific calibration)
```

### MCP Tools
All functionality is exposed via MCP tools:
- Skill tools: list_skills, get_skill, create_skill, update_skill
- Loop tools: list_loops, get_loop, create_loop, validate_loop
- Execution tools: start_execution, advance_phase, execute_skill
- Memory tools: get_memory, update_memory, record_decision

## Development

```bash
npm run dev    # Hot reload development
npm run build  # Compile TypeScript
npm test       # Run tests
```

## Conventions

- All skills have SKILL.md + CHANGELOG.md + optional ui.json
- Loops have LOOP.md (human) + loop.json (machine)
- Memory files are JSON in memory/
- Use Zod for runtime validation

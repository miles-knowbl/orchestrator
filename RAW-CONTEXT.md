# Raw Context

Extracted content from all sources for deck composition.

---

## 1. Identity & Positioning

- **Name:** Orchestrator (package: @superorganism/orchestrator)
- **Version:** 0.1.0 (early alpha)
- **License:** MIT
- **Tagline:** "Self-improving meta-system for composing AI-driven workflows"
- **Core thesis:** Skills are the atomic primitive. Everything else composes from skills.
- **Author:** Superorganism
- **Tech stack:** TypeScript 5.6, Node 18+, Express, MCP SDK 1.0, Zod, simple-git, gray-matter

## 2. The Problem (for a DevEx team at ~200 engineers)

**Pain points this audience recognizes:**
- Engineering practices vary wildly across teams — one team does thorough code review, another rubber-stamps
- Deployment processes are tribal knowledge locked in senior engineers' heads
- When someone leaves, their process knowledge walks out the door
- Quality gates exist in theory (CI checks) but not in practice — skipped, ignored, overridden
- No systematic way to learn from past mistakes — the same bugs recur across projects
- "Best practices" docs exist but nobody reads them; they rot in Confluence

**What Orchestrator changes:**
- Skills are versioned, executable instruction units — not passive docs
- Loops enforce sequence and quality gates — not optional, not skippable
- Memory captures what worked and what didn't — learning compounds automatically
- Everything is composable — build new workflows from existing skills in minutes

## 3. Architecture Overview

### System layers
```
┌────────────────────────────────────────────────┐
│           MCP Interface (105+ tools)           │
├────────────────────────────────────────────────┤
│  SkillRegistry │ LoopComposer │ ExecutionEngine│
│  MemoryService │ LearningService │ Inbox       │
├────────────────────────────────────────────────┤
│  Skills (38)  │  Loops (3)  │  Memory (3-tier)│
├────────────────────────────────────────────────┤
│         Git + JSON File Storage                │
└────────────────────────────────────────────────┘
```

### Key architectural decisions
- **MCP-native:** All functionality exposed as Model Context Protocol tools — Claude (or any MCP client) can drive the entire system
- **File-based storage:** Skills are Markdown + YAML frontmatter in Git. No database required. Version control is free.
- **Hierarchical memory:** Three tiers — orchestrator (global), loop (workflow-specific), skill (per-skill calibration)
- **Hot-reload:** File watcher re-indexes skills on change. Edit a SKILL.md, system picks it up instantly.

## 4. Skills — The Atomic Primitive

### What is a skill?
A versioned directory containing:
- `SKILL.md` — Markdown with YAML frontmatter (name, description, phase, category, dependencies, tags)
- `CHANGELOG.md` — Version history
- `references/` — Supporting documentation (patterns, templates, examples)
- `ui.json` — Optional UI metadata for dashboard rendering

### Skill library: 38 skills across 5 categories

| Category | Count | Examples |
|----------|-------|---------|
| Core | 22 | implement, architect, code-review, deploy, test-generation, security-audit |
| Meta | 6 | retrospective, calibration-tracker, content-analysis, loop-controller |
| Specialized | 6 | context-cultivation, frontend-design, proposal-builder, priority-matrix |
| Infrastructure | 2 | loop-to-slash-command, memory-manager |
| Custom | 2 | orchestrator, skill-design |

### Skills vs. documentation

| Static Docs | Orchestrator Skills |
|-------------|-------------------|
| Written once, decay over time | Versioned, improved through use |
| Read passively (or not at all) | Executed in sequence with gates |
| No feedback loop | Track execution count, success rate |
| Isolated silos | Composable into loops, declare dependencies |
| No enforcement | Gates block progress until quality criteria met |

## 5. Loops — Composable Workflows

### Engineering Loop (v3.0.0)
10 phases, 13 skills, 6 quality gates:
```
INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP → COMPLETE
  │        │                            │          │                     │
 spec   architecture                 verify    validation            review
 gate     gate                       gate       gate                  gate
(human)  (human)                    (auto)    (human)               (human)
```

**Gate types:**
- **Human:** Requires explicit approval (spec, architecture, validation, review)
- **Auto:** Passes if automated checks pass (verification — build, tests, lint)
- **Conditional:** Auto-passes if no target configured (deploy)

### Proposal Loop (v2.0.0)
6 phases, 7 skills, 5 human gates — for generating structured proposals.

### Composition principle
Skills are reused across loops. The proposal loop shares 4 skills with the engineering loop. New workflows are composed from the existing library — no rewriting.

## 6. Execution Engine

### State machine
`pending → active → paused/blocked → completed/failed`

### What it tracks per execution
- Current phase and per-skill status
- Gate status (pending → approved/rejected)
- Detailed logs: timestamps, categories (phase/skill/gate/system), metrics
- Duration and token usage per skill
- Outcome scoring for learning (success boolean + 0–1 score)

### Execution modes
| Mode | Use case |
|------|----------|
| greenfield | New project from scratch |
| brownfield-polish | Improving existing code |
| brownfield-enterprise | Large-scale integration |

### Autonomy levels
| Level | Behavior |
|-------|----------|
| full | Skills execute without human intervention |
| supervised | Human approves at gates (default) |
| manual | Human drives every skill |

## 7. Memory System — Learning That Compounds

### Three-tier hierarchy
```
Orchestrator Memory (global patterns, decisions)
    └── Loop Memory (workflow-specific learnings)
            └── Skill Memory (per-skill calibration)
```

### What gets remembered
- **Decisions:** ADR-style records with context, decision, consequences
- **Patterns:** Named patterns with confidence levels and usage counts
- **Calibration:** Estimate vs. actual tracking with multipliers per skill/phase/mode
- **Handoffs:** Session continuity (completed, in-progress, blocked, next steps)

### Learning loop
1. Execute a skill → score the outcome
2. LearningService analyzes logs for improvement signals
3. Generates improvement proposals (IMP-001, IMP-002, ...)
4. Applied improvements bump skill version
5. Calibration multipliers adjust future estimates

## 8. Interface Layer

### MCP Tools (105+)
| Category | Count | Examples |
|----------|-------|---------|
| Skill | 30 | list, get, create, update, search, capture_improvement |
| Loop | 17 | list, get, create, validate |
| Execution | 12 | start, advance, complete, approve/reject gate |
| Memory | 23 | get, update, record decision/pattern, handoff, calibrate |
| Inbox | 23 | add, list, process, approve/reject extraction |

### REST API
`/api/dashboard`, `/api/executions`, `/api/executions/:id/stream` (SSE), `/api/skills`, `/api/loops`

### Dashboard (Next.js 15 + React 19)
- Execution timeline view
- Skill browser with search
- Gate approval UI
- Live metrics panel via SSE
- Deliverable viewer

## 9. Key Numbers

| Metric | Value |
|--------|-------|
| Skills | 38 |
| Skill categories | 5 |
| Defined loops | 3 |
| MCP tools | 105+ |
| Engineering loop phases | 10 |
| Quality gates (eng loop) | 6 |
| TypeScript source LOC | ~10,000 |
| Source files | 25 |
| Storage | Git + JSON (no database) |
| Version | 0.1.0 (alpha) |

## 10. Audience-Specific Talking Points

### "Why should our DevEx team care?"

1. **Process as code.** Engineering practices become versioned, composable units — not wiki pages that rot.
2. **Quality gates that actually gate.** The execution engine won't advance past a gate until it's approved. No more "we'll fix it later."
3. **Institutional memory.** When someone discovers a pattern that works, it gets recorded. New team members inherit accumulated knowledge.
4. **Calibrated estimates.** Estimate vs. actual tracking across every skill and phase. Estimates improve automatically over time.
5. **Self-improving.** Every execution feeds the learning service. Skills version up. Patterns get recorded. The system gets better the more you use it.
6. **Composable.** Need a new workflow? Compose it from existing skills. The proposal loop reuses skills from the engineering loop.

### "What's the catch?"

- **Alpha software (v0.1.0).** Rough edges expected.
- **Requires Claude / MCP client.** Designed to be driven by an AI assistant via MCP — not a standalone GUI.
- **Runs locally.** No multi-team cloud sync out of the box yet.
- **Investment to customize.** The 38 skills are a starting point. You'll adapt them to your patterns.

### "What would adoption look like?"

1. Install, explore skill library, run engineering loop on a small feature
2. Customize skills to match team patterns and deployment targets
3. Supervised mode — human approves every gate — builds trust
4. Move to full autonomy for trusted workflows
5. `improve:` feedback accumulates. Skills evolve. Memory compounds.

## 11. Demo-Ready Scenarios

| Scenario | What it shows |
|----------|--------------|
| Walk through the engineering loop | Full lifecycle: requirements → ship, with gate approvals |
| Skill improvement in action | Execute, note problem, `improve:`, version bump + CHANGELOG |
| Dashboard tour | Execution timeline, skill browser, gate approval UI |
| Composition demo | How proposal loop reuses engineering loop skills |

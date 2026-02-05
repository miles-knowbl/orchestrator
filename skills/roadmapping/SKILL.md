---
name: roadmapping
description: "System-level visibility into module progress, dependencies, and completion status. Creates and maintains ROADMAP.md as the spine that makes everything else trackable. Integrates with engineering-loop and leverage protocol for optimal sequencing."
phase: INIT
category: strategy
version: "1.0.0"
depends_on: []
tags: [planning, tracking, progress, visualization]
---

# Roadmapping

System-level visibility into module progress and completion.

## When to Use

- **New system** — Need to define modules and their relationships
- **Progress check** — Want to see where you are and what's next
- **Planning session** — Brainstorming modules from a coded list
- **Engineering loop start** — Need to identify highest leverage module
- When you say: "show roadmap", "what's next", "progress", "create roadmap"

## Core Concept

Roadmapping answers: **"What modules exist, what's their status, and what should I work on next?"**

A roadmap organizes work into **7 layers** (0-6), where each layer represents a logical wave of modules that builds on the previous. Like layers of paint in graffiti:
- Layer 0: backdrop/outline (foundation)
- Layer 1-5: increasingly detailed motifs
- Layer 6: final details and polish

Layers are not themed categories—they're context-specific groupings that make sense for the current system.

## The Seven Layers

```
Layer 6  ───────────────────────────────────────────────────────────────────────
         [final polish, sovereignty, ownership]

Layer 5  ───────────────────────────────────────────────────────────────────────
         [meta capabilities, self-improvement]

Layer 4  ───────────────────────────────────────────────────────────────────────
         [domain-specific work]

Layer 3  ───────────────────────────────────────────────────────────────────────
         [interfaces, integration points]

Layer 2  ───────────────────────────────────────────────────────────────────────
         [intelligence, pattern recognition]

Layer 1  ───────────────────────────────────────────────────────────────────────
         [visualization, automation]

Layer 0  ───────────────────────────────────────────────────────────────────────
         [foundation, core infrastructure]
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| ROADMAP.md | project root | Always |
| roadmap-state.json | project root | Always (machine-readable state) |

## Process

### Creating a Roadmap

1. **Gather module brainstorm** — Get user's coded list of modules
2. **Explore codebase** — Understand what already exists
3. **Ask clarifying questions** — Batch by category:
   - Acronyms/jargon
   - Scope clarification
   - Differentiation between similar items
   - Dependencies
   - Updates vs new modules
4. **Identify dependencies** — What unlocks what?
5. **Organize into layers** — Group by logical waves
6. **Output both formats** — ROADMAP.md + terminal visualization

### Tracking Progress

```
┌─────────────────────────────────────────────────────────────┐
│ Module Statuses                                             │
│                                                             │
│ pending     ○  Ready to start (dependencies met)            │
│ in-progress ◉  Currently being worked on                    │
│ complete    ✓  Done                                         │
│ blocked     ⊘  Dependencies not yet met                     │
└─────────────────────────────────────────────────────────────┘
```

### Finding Next Module (Leverage Protocol Integration)

The roadmapping skill integrates with the leverage protocol to identify the highest-leverage next module:

```
Value = (DSA×0.40 + Unlock×0.25 + Likelihood×0.15) / (Time×0.10 + Effort×0.10)

Where:
- DSA = Dream State Alignment (how directly does this advance completion?)
- Unlock = How many downstream modules does this enable?
- Likelihood = Can we complete this given current context?
- Time = Estimated time (inverse, faster is better)
- Effort = Estimated effort (inverse, lower is better)
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/roadmap` | GET | Get full roadmap with progress |
| `/api/roadmap/progress` | GET | Get progress summary |
| `/api/roadmap/modules` | GET | List all modules |
| `/api/roadmap/modules/:id` | GET | Get specific module |
| `/api/roadmap/modules/:id/status` | PUT | Update module status |
| `/api/roadmap/next` | GET | Get next highest leverage module |
| `/api/roadmap/terminal` | GET | Get terminal visualization |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `get_roadmap` | Get full roadmap |
| `get_roadmap_progress` | Get progress summary |
| `update_module_status` | Update a module's status |
| `get_next_module` | Get next highest leverage module |
| `render_roadmap_terminal` | Get terminal visualization |

## Terminal Visualization

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                           SYSTEM ROADMAP                                         ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  System: Orchestrator                                                            ║
║  Progress: 1/32 modules ████░░░░░░░░░░░░░░░░ 3%                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                  ║
║  Layer 6  ░░░░░░░░░░░░░░░ 0/1                                                   ║
║    ○ local-first                                                                 ║
║                                                                                  ║
║  Layer 5  ░░░░░░░░░░░░░░░ 0/6                                                   ║
║    ○ game-design                                                                 ║
║    ○ co-op-skill-acquisition                                                     ║
║    ...                                                                           ║
║                                                                                  ║
║  Layer 0  █████░░░░░░░░░░ 1/3                                                   ║
║    ✓ roadmapping                                                                 ║
║    ○ 2-layer-orchestration                                                       ║
║    ○ knowledge-graph-ontology                                                    ║
║                                                                                  ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  NEXT AVAILABLE                                                                  ║
║    → knowledge-graph-ontology (leverage: 8.2)                                    ║
║    → 2-layer-orchestration (leverage: 7.9)                                       ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

## Integration with Engineering Loop

When the engineering loop completes a module:

1. **On module completion:**
   - Update `roadmap-state.json` with `status: 'complete'`
   - Record `completedAt` timestamp
   - Update blocked modules (may now be unblocked)

2. **At COMPLETE phase:**
   - Query roadmap for next highest leverage module
   - Present in leverage protocol output

3. **On loop start:**
   - Load roadmap to identify current module
   - Show progress in terminal

## Key Concepts

### Dependencies

Modules can depend on:
- Other modules in the roadmap
- Existing capabilities marked as `(exists)`
- Nothing (independent modules)

```markdown
| **voice** | Voice I/O for piloting | local-first |
```

### Updates vs New Modules

Track separately:
- **New modules** — Full implementations in the roadmap
- **Updates** — Improvements to existing modules (tracked in "Updates" section)
- **Brainstorm** — Ideas not yet scoped

### Roadmap-Process Pattern (PAT-011)

When creating a roadmap from a user's coded brainstorm:

1. Receive coded list
2. Explore codebase for existing modules
3. Ask clarifying questions (batch by category)
4. Identify dependencies
5. Separate updates from new modules
6. Organize into 7 layers
7. Create ROADMAP.md + terminal view

## Example Usage

```typescript
import { RoadmapService } from './services/roadmapping';

const roadmap = new RoadmapService();
await roadmap.load();

// Get progress
const progress = roadmap.getProgress();
console.log(`${progress.completeModules}/${progress.totalModules} complete`);

// Get next module
const next = roadmap.getNextHighestLeverageModule();
console.log(`Next: ${next.moduleName} (score: ${next.score})`);

// Update status
await roadmap.updateModuleStatus('roadmapping', 'complete');

// Terminal view
console.log(roadmap.generateTerminalView());
```

## ROADMAP.md Format

```markdown
# {System} Roadmap

> Modules that ladder up to system completion.

## Overview

**System**: {name}
**Dream State**: {vision}
**Modules**: {count} modules across 7 layers

## The Seven Layers

[ASCII diagram showing layers and modules]

## Layer 0

| Module | Description | Unlocks |
|--------|-------------|---------|
| **name** | description | downstream modules |

## Layer 1-6

| Module | Description | Depends On |
|--------|-------------|------------|
| **name** | description | upstream modules |

## Updates to Existing Modules

| Target | Update | Priority |
|--------|--------|----------|

## Brainstorm

| Idea | Notes |
|------|-------|

## Next Action

**Current Module**: {name}
**Status**: {status}
**Next**: {next highest leverage}
```

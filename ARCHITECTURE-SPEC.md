# Unified Loop Architecture Specification

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-01-29

## Overview

This specification defines a three-tier context hierarchy that all loops share. It establishes a common vocabulary, context loading protocol, run archival system, and Dream State structure that enables loops to "speak the same language."

---

## 1. The Three-Tier Hierarchy

### Terminology

| Tier | Name | Scope | Example |
|------|------|-------|---------|
| Macro | **Organization** | All systems across the org | Acme Corp, personal workspace |
| Meso | **System** | A single repository/application | `orchestrator`, `dashboard` |
| Micro | **Module** | Self-contained concern within a system | `skill-registry`, `auth`, `execution-engine` |

### Completion Algebra

```
Organization.done = ALL(System.done for system in Organization.systems)
System.done       = ALL(Module.done for module in System.modules)
Module.done       = ALL(Function.operational for function in Module.functions)
```

Each level has a verifiable definition of "done" that rolls up naturally.

### Relationships

```
ORGANIZATION
├── System: orchestrator
│   ├── Module: skill-registry
│   │   ├── [x] list_skills operational
│   │   ├── [x] get_skill operational
│   │   └── [x] search_skills operational
│   ├── Module: execution-engine
│   │   ├── [x] start_execution operational
│   │   ├── [ ] pause_execution operational
│   │   └── [x] advance_phase operational
│   └── Module: memory-service
│       └── ...
└── System: dashboard
    ├── Module: execution-view
    └── Module: skill-browser
```

---

## 2. Directory Structure

### Organization Level (`~/.claude/`)

```
~/.claude/
├── CLAUDE.md                    # Global instructions
├── DREAM-STATE.md               # Organization Dream State
├── memory/
│   ├── patterns.json            # Org-wide learned patterns
│   ├── calibration.json         # Org-wide calibration data
│   └── decisions/               # Org-level ADRs
├── commands/                    # Loop definitions
│   ├── engineering-loop.md
│   ├── learning-loop.md
│   └── ...
├── skills/                      # Skill library (versioned)
└── runs/                        # Archived loop runs (ALL runs)
    └── {year-month}/
        └── {system}-{loop}-{timestamp}.json
```

### System Level (`{repo}/.claude/`)

```
{repo}/.claude/
├── CLAUDE.md                    # System-specific instructions
├── DREAM-STATE.md               # System Dream State
├── memory/
│   ├── patterns.json            # System-specific patterns
│   └── decisions/               # System-level ADRs
├── modules.json                 # Module registry (optional)
└── docs/                        # Loop-produced documentation
    ├── audits/
    ├── specs/
    └── reviews/
```

### Module Level (`{repo}/{path}/.claude/` or inline)

```
{repo}/src/services/auth/.claude/
├── DREAM-STATE.md               # Module Dream State
└── memory/
    └── patterns.json            # Module-specific patterns
```

**Note:** Modules can also be defined inline within the System's `DREAM-STATE.md` for simpler systems.

---

## 3. Dream State Document Structure

### Organization Dream State (`~/.claude/DREAM-STATE.md`)

```markdown
# Organization Dream State

## Vision
{High-level organizational goals and direction}

## Active Systems
| System | Status | Progress |
|--------|--------|----------|
| orchestrator | active | 75% |
| dashboard | active | 60% |

## Master Checklist
{Aggregated from all system checklists}

### orchestrator
- [x] Core MCP tools operational
- [ ] Learning loop complete
- [ ] Run archival implemented

### dashboard
- [x] Basic UI operational
- [ ] Real-time updates working

## Recent Completions
{Last N completed loop runs with summaries}
```

### System Dream State (`{repo}/.claude/DREAM-STATE.md`)

```markdown
# System Dream State: {name}

## Vision
{What "done" looks like for this system}

## Modules
| Module | Status | Functions |
|--------|--------|-----------|
| skill-registry | complete | 6/6 |
| execution-engine | in-progress | 4/7 |
| memory-service | pending | 0/5 |

## Module Checklists

### skill-registry (complete)
- [x] list_skills operational
- [x] get_skill operational
- [x] create_skill operational
- [x] update_skill operational
- [x] search_skills operational
- [x] capture_improvement operational

### execution-engine (in-progress)
- [x] start_execution operational
- [x] get_execution operational
- [x] advance_phase operational
- [x] complete_phase operational
- [ ] pause_execution operational
- [ ] resume_execution operational
- [ ] skip_skill operational

## Active Loops
| Loop | Phase | Started |
|------|-------|---------|
| learning-loop | ANALYZE | 2025-01-29 |

## Recent Completions
{Last N completed loop runs for this system}
```

### Module Dream State (inline or separate file)

```markdown
# Module Dream State: {name}

## Purpose
{What this module does}

## Required Functions
- [ ] function_a — {description}
- [ ] function_b — {description}
- [x] function_c — {description}

## Dependencies
- Depends on: {other modules}
- Depended on by: {other modules}

## Completion Criteria
{What must be true for this module to be "done"}
```

---

## 4. Run Archival System

### On Loop Completion

When any loop reaches its final phase and completes:

1. **Generate Summary**
   ```json
   {
     "summary": {
       "loop": "engineering-loop",
       "system": "orchestrator",
       "module": null,
       "started_at": "2025-01-29T10:00:00Z",
       "completed_at": "2025-01-29T14:30:00Z",
       "duration_minutes": 270,
       "phases_completed": 10,
       "gates_passed": 6,
       "deliverables": ["REQUIREMENTS.md", "FEATURESPEC.md", "..."],
       "outcome": "success",
       "checklist_items_completed": 5
     }
   }
   ```

2. **Archive Run**
   - Location: `~/.claude/runs/{year-month}/{system}-{loop}-{timestamp}.json`
   - Example: `~/.claude/runs/2025-01/orchestrator-engineering-loop-29T14-30-00.json`
   - Contains: Full state + summary

3. **Update Dream State**
   - Append to "Recent Completions" section
   - Update module/system checklist progress
   - Promote patterns if applicable

4. **Prune Active State**
   - Delete `{loop}-state.json` from working directory
   - Next invocation starts fresh

### Run File Format

```json
{
  "meta": {
    "archived_at": "2025-01-29T14:30:00Z",
    "archive_version": "1.0.0"
  },
  "summary": {
    "loop": "engineering-loop",
    "system": "orchestrator",
    "module": null,
    "started_at": "2025-01-29T10:00:00Z",
    "completed_at": "2025-01-29T14:30:00Z",
    "duration_minutes": 270,
    "outcome": "success",
    "phases": {
      "completed": ["INIT", "SCAFFOLD", "IMPLEMENT", "TEST", "VERIFY", "VALIDATE", "DOCUMENT", "REVIEW", "SHIP", "COMPLETE"],
      "skipped": []
    },
    "gates": {
      "passed": ["spec-gate", "architecture-gate", "verification-gate", "validation-gate", "review-gate", "deploy-gate"],
      "failed": [],
      "skipped": []
    },
    "deliverables": [
      "REQUIREMENTS.md",
      "FEATURESPEC.md",
      "ARCHITECTURE.md",
      "VERIFICATION.md",
      "VALIDATION.md",
      "SECURITY-AUDIT.md",
      "CODE-REVIEW.md",
      "RETROSPECTIVE.md"
    ],
    "checklist": {
      "items_completed": 5,
      "items_total": 8,
      "items": [
        { "item": "skill-registry operational", "completed": true },
        { "item": "execution-engine operational", "completed": false }
      ]
    }
  },
  "state": {
    // Full loop-state.json content at completion
  }
}
```

---

## 5. Context Loading Protocol

### On Loop Initialization

Every loop loads context in this order:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Always loaded, provides org-wide context

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── Loaded if in a git repository
   └── Provides system modules and progress

3. Module Dream State (if module-scoped)
   └── Loaded if loop is scoped to specific module
   └── Provides function checklist

4. Recent Runs (via query_runs)
   └── Auto-inject last 3-5 relevant runs
   └── Filtered by system, loop type, recency

5. Memory (patterns, calibration)
   └── Load from all applicable tiers
```

### Context Injection Format

```markdown
## Loaded Context

### Organization
Vision: {org vision summary}
Active Systems: orchestrator (75%), dashboard (60%)

### System: orchestrator
Vision: {system vision summary}
Modules: skill-registry (complete), execution-engine (4/7), memory-service (pending)

### Recent Runs
1. engineering-loop (2025-01-28) — Completed skill-registry module
2. audit-loop (2025-01-27) — Security audit, 3 medium findings
3. learning-loop (2025-01-25) — Calibration update for IMPLEMENT phase
```

---

## 6. The `query_runs` MCP Tool

### Signature

```typescript
query_runs({
  loop?: string,           // Filter by loop type
  system?: string,         // Filter by system name
  module?: string,         // Filter by module name
  since?: string,          // ISO date, runs after this date
  until?: string,          // ISO date, runs before this date
  outcome?: "success" | "failed" | "abandoned",
  limit?: number,          // Max results (default: 10)
  include_state?: boolean  // Include full state (default: false)
}): RunSummary[]
```

### Example Queries

```typescript
// Last 5 engineering loops for orchestrator
query_runs({ loop: "engineering-loop", system: "orchestrator", limit: 5 })

// All failed runs in January
query_runs({ outcome: "failed", since: "2025-01-01", until: "2025-01-31" })

// Recent learning loops with full state
query_runs({ loop: "learning-loop", limit: 3, include_state: true })
```

---

## 7. Loop Command Updates

### Required Changes to All Loops

Every loop command definition must be updated to include:

#### 1. Hierarchy Awareness Section

```markdown
## Context Hierarchy

This loop operates within the Organization → System → Module hierarchy:

- **Organization**: Loaded from `~/.claude/DREAM-STATE.md`
- **System**: Loaded from `{repo}/.claude/DREAM-STATE.md`
- **Module**: Scoped if specified, otherwise system-wide

### Context Loading
On initialization, this loop automatically loads:
1. Organization Dream State
2. System Dream State (if in repo)
3. Recent relevant runs (last 5)
4. Memory patterns from all tiers
```

#### 2. Completion Hook Section

```markdown
## On Completion

When this loop completes:

1. **Archive Run**: Full state + summary saved to `~/.claude/runs/{year-month}/`
2. **Update Dream State**: Progress updated at appropriate tier
3. **Prune State**: Active `{loop}-state.json` deleted
4. **Notify**: "Run archived. Next invocation starts fresh."
```

#### 3. State Schema Update

Add to state JSON schema:

```json
{
  "context": {
    "tier": "system",           // "organization" | "system" | "module"
    "organization": "personal", // org name
    "system": "orchestrator",   // repo/system name
    "module": null              // module name if scoped
  }
}
```

---

## 8. Implementation Checklist

### Phase 1: Core Infrastructure
- [x] Create `~/.claude/runs/` directory structure
- [x] Implement run archival function
- [x] Implement state pruning on completion
- [x] Create `query_runs` MCP tool

### Phase 2: Dream State
- [x] Create Organization Dream State template
- [x] Create System Dream State template
- [x] Create Module Dream State template
- [x] Implement Dream State auto-update on completion (via docs-alignment skill)

### Phase 3: Loop Updates
- [x] Update engineering-loop.md with hierarchy awareness
- [x] Update learning-loop.md with hierarchy awareness
- [x] Update audit-loop.md with hierarchy awareness
- [x] Update proposal-loop.md with hierarchy awareness
- [x] Update bugfix-loop.md with hierarchy awareness
- [x] Update meta-loop.md with hierarchy awareness
- [x] Update infra-loop.md with hierarchy awareness
- [x] Update deck-loop.md with hierarchy awareness
- [x] Update transpose-loop.md with hierarchy awareness
- [x] Update distribution-loop.md with hierarchy awareness

### Phase 4: Context Loading
- [x] Implement context loading protocol
- [x] Auto-inject Dream States on loop init
- [x] Auto-inject recent runs on loop init
- [ ] Test cross-loop context sharing

### Phase 5: Documentation Alignment (NEW)
- [x] Create docs-alignment skill with MECE taxonomy
- [x] Add docs-alignment to COMPLETE phase of all loops (10/10)
- [x] Document lifecycle states (draft, active, stale, archived, pruned)
- [x] Create cross-reference protocol
- [x] Create index generation protocol
- [x] Create pruning rules
- [ ] Implement automatic index generation
- [ ] Implement stale document detection

---

## 9. Migration Path

### For Existing Projects

1. Create `{repo}/.claude/DREAM-STATE.md` with current system state
2. Identify and document modules within the system
3. Run `/learning-loop` to calibrate and validate

### For New Projects

1. `/engineering-loop` creates Dream State during entry-portal
2. Systems and modules defined as part of dream state discovery
3. Completion updates Dream State automatically

---

## 10. Deep Context Protocol

All loops and interactions follow the **Deep Context Protocol** — a maximalist approach to context gathering.

### Core Principles

1. **Upfront Gathering**: Before any non-trivial task, ask 5-10+ clarifying questions
2. **Terrain Check**: After every response, assess uphill vs downhill
3. **No Assumptions**: When uncertain, ask — don't push through

### Question Dimensions

| Dimension | Example Questions |
|-----------|-------------------|
| **Problem Space** | What problem? Why now? What if we don't solve it? |
| **Constraints** | Hard constraints? Soft preferences? Existing patterns? |
| **Success Criteria** | How will we know? What's exceptional vs acceptable? |
| **Risks** | What could go wrong? Security/compliance? Scale? |
| **Stakeholders** | Who else needs to know? Who maintains this? |

### Terrain Check

After each substantive response:

- **Uphill**: Uncertain, assuming, multiple paths → **surface questions**
- **Downhill**: Clear, verified, just executing → **proceed efficiently**

Watch for terrain transitions during execution.

### Implementation

| Location | Content |
|----------|---------|
| `~/.claude/CLAUDE.md` | Global protocol + terrain check |
| `commands/_shared/clarification-protocol.md` | Detailed loop guidance |
| Each loop's Clarification Protocol section | Loop-specific reminders |

---

## Appendix: Vocabulary Reference

| Term | Definition |
|------|------------|
| **Organization** | Top-level context, spans all systems |
| **System** | A repository or application |
| **Module** | Self-contained concern with defined functions |
| **Dream State** | Document defining "done" at each tier |
| **Run** | A single loop execution from start to completion |
| **Function** | Atomic capability within a module |
| **Completion Algebra** | `Org.done = ALL(System.done) = ALL(Module.done)` |
| **Deep Context Protocol** | Maximalist context gathering before and during execution |
| **Terrain Check** | Uphill/downhill assessment after each response |
| **Uphill** | Uncertain terrain requiring clarification |
| **Downhill** | Clear path, proceed without friction |

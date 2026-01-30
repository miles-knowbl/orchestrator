---
name: docs-alignment
description: "Scans, updates, and maintains all documentation across the Organization → System → Module hierarchy. Ensures MECE (Mutually Exclusive, Collectively Exhaustive) categories stay aligned after every loop execution. Handles document lifecycle: create, update, move, prune, summarize, index, and cross-reference."
phase: COMPLETE
category: meta
version: "1.0.0"
depends_on: ["retrospective"]
tags: [meta, documentation, alignment, mece, hierarchy, completion-protocol]
---

# Docs Alignment

Maintain documentation alignment across the three-tier hierarchy.

## When to Use

- **End of every loop** — Automatically triggered after COMPLETE phase
- **Dream State updates** — When vision or progress changes
- **Cross-system changes** — When one system affects another's documentation
- **Periodic maintenance** — Manual invocation to clean up documentation drift
- **New system added** — Ensure proper documentation scaffolding
- When you say: "align docs", "update documentation", "sync docs"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `mece-categories.md` | Understanding the MECE documentation taxonomy |
| `document-lifecycle.md` | How documents flow through states |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `cross-reference-protocol.md` | When linking documents across tiers |
| `index-generation.md` | When creating or updating indexes |
| `pruning-rules.md` | When removing stale documentation |

**Verification:** All MECE categories have current documentation with valid cross-references.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Alignment report | `{system}/.claude/docs/ALIGNMENT-REPORT.md` | Always |
| Updated indexes | `{tier}/INDEX.md` or inline | If changes detected |
| Updated Dream States | `{tier}/DREAM-STATE.md` | If progress changed |

## Hook Integration

This skill is triggered automatically via the completion protocol:

| Hook | Trigger | What it does |
|------|---------|--------------|
| `docs-alignment-hook` | PostPhase (COMPLETE) | Invokes this skill after every loop completion |
| `dream-state-sync` | PostToolUse (DREAM-STATE.md) | Validates hierarchy consistency |

**Note:** Hooks handle automatic invocation. This skill performs the actual alignment work.

## Core Concept

Documentation exists at three tiers, and each tier has specific MECE categories. After every loop execution, documents may need updates, moves, or cross-reference adjustments. This skill ensures the documentation hierarchy remains consistent, discoverable, and accurate.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENTATION HIERARCHY                               │
│                                                                             │
│  ORGANIZATION (~/.claude/)                                                  │
│  ├── CLAUDE.md                 Global instructions                          │
│  ├── DREAM-STATE.md            Organization vision & progress               │
│  ├── memory/patterns.json      Cross-system patterns                        │
│  ├── commands/*.md             Loop definitions                             │
│  └── runs/{year-month}/*.json  Archived loop runs                          │
│                                                                             │
│  SYSTEM ({repo}/.claude/)                                                   │
│  ├── CLAUDE.md                 System instructions                          │
│  ├── DREAM-STATE.md            System vision & module checklists            │
│  ├── memory/patterns.json      System-specific patterns                     │
│  ├── docs/                     Loop-produced documentation                  │
│  │   ├── specs/                Specifications                               │
│  │   ├── audits/               Security & code audits                       │
│  │   └── reviews/              Code reviews                                 │
│  └── modules.json              Module registry (optional)                   │
│                                                                             │
│  MODULE ({repo}/{path}/.claude/ or inline)                                  │
│  ├── DREAM-STATE.md            Module function checklists                   │
│  └── memory/patterns.json      Module-specific patterns                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## MECE Document Categories

### Category Taxonomy

Documents are organized into mutually exclusive categories:

| Category | Scope | Purpose | Update Frequency |
|----------|-------|---------|------------------|
| **Instructions** | All tiers | Claude behavior rules | Rare (manual) |
| **Dream States** | All tiers | Vision and progress | Every loop completion |
| **Memory** | All tiers | Patterns, decisions, calibration | Every loop completion |
| **Loop Definitions** | Organization | Workflow definitions | When loops change |
| **Specs & Requirements** | System | Feature specifications | Per feature |
| **Architecture** | System | Design decisions | Per major change |
| **Audits & Reviews** | System | Quality artifacts | Per loop |
| **Run Archives** | Organization | Historical execution data | Every loop completion |

### Category Boundaries (Mutually Exclusive)

```
Instructions ≠ Dream States ≠ Memory ≠ Specs ≠ Architecture ≠ Audits

Rules:
- Instructions: HOW Claude should behave
- Dream States: WHAT "done" looks like + progress tracking
- Memory: WHAT was learned (patterns, decisions, calibration)
- Specs: WHAT to build (requirements, features)
- Architecture: HOW to build it (design, structure)
- Audits: HOW WELL it was built (quality, security)
```

### Collectively Exhaustive Check

Every document must belong to exactly one category:

```
document → categorize → one of:
  - instructions
  - dream-state
  - memory
  - spec
  - architecture
  - audit
  - run-archive
  - other (requires categorization)
```

## The Alignment Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DOCS ALIGNMENT PROCESS                               │
│                                                                             │
│  1. SCAN                                                                    │
│     ├─→ Glob all documentation files across tiers                          │
│     ├─→ Classify each file into MECE category                              │
│     └─→ Build current state map                                            │
│                                                                             │
│  2. ANALYZE                                                                 │
│     ├─→ Compare against expected state (from loop execution)               │
│     ├─→ Identify stale documents (outdated references)                     │
│     ├─→ Identify missing documents (gaps)                                  │
│     └─→ Identify misplaced documents (wrong tier/category)                 │
│                                                                             │
│  3. PLAN                                                                    │
│     ├─→ Generate update actions (content changes)                          │
│     ├─→ Generate move actions (reorganization)                             │
│     ├─→ Generate prune actions (removal)                                   │
│     └─→ Generate create actions (new docs)                                 │
│                                                                             │
│  4. EXECUTE                                                                 │
│     ├─→ Update Dream States with progress                                  │
│     ├─→ Update cross-references                                            │
│     ├─→ Move misplaced documents                                           │
│     ├─→ Prune stale documents                                              │
│     └─→ Create missing documents                                           │
│                                                                             │
│  5. INDEX                                                                   │
│     ├─→ Update/create INDEX.md at each tier                                │
│     ├─→ Ensure all documents are discoverable                              │
│     └─→ Validate all cross-references                                      │
│                                                                             │
│  6. REPORT                                                                  │
│     └─→ Generate ALIGNMENT-REPORT.md                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step 1: Scan

### File Discovery Patterns

```bash
# Organization tier
~/.claude/CLAUDE.md
~/.claude/DREAM-STATE.md
~/.claude/memory/*.json
~/.claude/commands/*.md
~/.claude/runs/**/*.json

# System tier
{repo}/.claude/CLAUDE.md
{repo}/.claude/DREAM-STATE.md
{repo}/.claude/memory/*.json
{repo}/.claude/docs/**/*.md
{repo}/ARCHITECTURE*.md
{repo}/CLAUDE.md

# Module tier (if separate)
{repo}/{module-path}/.claude/DREAM-STATE.md
{repo}/{module-path}/.claude/memory/*.json
```

### Classification Rules

| Pattern | Category |
|---------|----------|
| `CLAUDE.md` | instructions |
| `DREAM-STATE.md` | dream-state |
| `memory/*.json`, `patterns.json` | memory |
| `commands/*.md`, `*-loop.md` | loop-definition |
| `REQUIREMENTS.md`, `FEATURESPEC.md`, `SPEC*.md` | spec |
| `ARCHITECTURE*.md`, `ADR-*.md` | architecture |
| `*-AUDIT.md`, `CODE-REVIEW.md`, `VALIDATION.md` | audit |
| `runs/**/*.json` | run-archive |

## Step 2: Analyze

### Staleness Detection

A document is stale if:
- References a completed loop that has been archived
- Contains version numbers older than current
- Has `last_updated` > 30 days with no recent loop touching it
- Contains broken cross-references

### Gap Detection

A gap exists if:
- Module exists in Dream State but has no function checklist
- System has active loops but no DREAM-STATE.md
- Loop completed but Dream State not updated
- Run archived but Dream State "Recent Completions" not updated

### Misplacement Detection

A document is misplaced if:
- Organization-scoped content in system directory
- Module-specific content at system level
- Audit files outside `docs/audits/`

## Step 3: Plan

### Action Types

```json
{
  "actions": [
    {
      "type": "update",
      "target": "{repo}/.claude/DREAM-STATE.md",
      "reason": "Loop completion — update progress",
      "changes": ["Update module checklist", "Add to Recent Completions"]
    },
    {
      "type": "move",
      "source": "{repo}/SECURITY-AUDIT.md",
      "target": "{repo}/.claude/docs/audits/SECURITY-AUDIT.md",
      "reason": "Audit file in wrong location"
    },
    {
      "type": "prune",
      "target": "{repo}/.claude/docs/old-spec.md",
      "reason": "Spec for completed feature, archived in run"
    },
    {
      "type": "create",
      "target": "{repo}/{module}/.claude/DREAM-STATE.md",
      "reason": "New module needs Dream State"
    },
    {
      "type": "index",
      "target": "{repo}/.claude/INDEX.md",
      "reason": "New documents added, index outdated"
    }
  ]
}
```

## Step 4: Execute

### Update Dream States

After each loop completion, update Dream States at all affected tiers:

**Organization DREAM-STATE.md:**
```markdown
## Recent Completions
| Date | System | Loop | Outcome | Summary |
|------|--------|------|---------|---------|
| 2025-01-29 | orchestrator | engineering-loop | success | Added docs-alignment skill |
```

**System DREAM-STATE.md:**
```markdown
### {module-name} (complete → in-progress)
- [x] function_a operational
- [x] function_b operational
- [ ] function_c operational  ← NEW
```

### Update Cross-References

When a document moves or is renamed:
1. Find all files referencing old path
2. Update references to new path
3. Log changes in alignment report

### Prune Rules

| Condition | Action |
|-----------|--------|
| Spec for completed & shipped feature | Archive to run, remove from active |
| Audit older than 90 days | Keep summary, archive details |
| Duplicate documentation | Merge and remove duplicate |
| Empty or placeholder docs | Remove if no content after 14 days |

**Never prune:**
- Dream States (update, don't delete)
- ADRs (historical record)
- CLAUDE.md files (instructions)
- Memory patterns (learned knowledge)

## Step 5: Index

### Index Structure

Each tier can have an INDEX.md:

```markdown
# Documentation Index: {tier-name}

## Instructions
- [CLAUDE.md](./CLAUDE.md) — Global behavior rules

## Dream State
- [DREAM-STATE.md](./DREAM-STATE.md) — Vision and progress

## Memory
- [patterns.json](./memory/patterns.json) — Learned patterns
- [calibration.json](./memory/calibration.json) — Estimation calibration

## Loop Definitions
- [engineering-loop.md](./commands/engineering-loop.md) — Full engineering workflow
- [learning-loop.md](./commands/learning-loop.md) — Pattern extraction loop

## Quick Links
- Current system: orchestrator (100% complete)
- Active loops: learning-loop (VALIDATE phase)
- Last completion: 2025-01-29 engineering-loop

## Search Tags
#orchestrator #mcp #skills #loops #engineering
```

### Search Optimization

Add front matter tags for discoverability:

```markdown
---
tags: [orchestrator, mcp, skills, engineering-loop]
last_updated: 2025-01-29
tier: system
category: dream-state
---
```

## Step 6: Report

### Alignment Report Format

```markdown
# Documentation Alignment Report

**Generated:** 2025-01-29T14:30:00Z
**Triggered by:** engineering-loop completion
**System:** orchestrator

## Summary

| Metric | Value |
|--------|-------|
| Documents scanned | 47 |
| Updates applied | 8 |
| Moves performed | 2 |
| Documents pruned | 1 |
| Documents created | 0 |
| Cross-references fixed | 3 |

## Actions Taken

### Updates
1. `~/.claude/DREAM-STATE.md` — Added loop completion to Recent Completions
2. `{repo}/.claude/DREAM-STATE.md` — Updated module progress (docs-alignment 100%)
3. ...

### Moves
1. `SECURITY-AUDIT.md` → `.claude/docs/audits/SECURITY-AUDIT.md`
2. ...

### Pruned
1. `.claude/docs/old-draft-spec.md` — Superseded by FEATURESPEC.md

### Cross-Reference Fixes
1. `ARCHITECTURE.md` line 45: Updated link to moved audit file
2. ...

## Validation

- [x] All MECE categories have documentation
- [x] All cross-references valid
- [x] All Dream States current
- [x] All indexes updated
- [x] No orphaned documents

## Notes

- Consider consolidating 3 similar spec files
- Module `inbox-processor` has no recent activity (30+ days)
```

## Automatic Trigger Protocol

### Hook Configuration

Add to `~/.claude/hooks.json`:

```json
{
  "hooks": [
    {
      "name": "docs-alignment-hook",
      "trigger": {
        "type": "PostPhase",
        "phase": "COMPLETE"
      },
      "action": {
        "type": "invoke-skill",
        "skill": "docs-alignment"
      },
      "enabled": true
    }
  ]
}
```

### Manual Invocation

```
docs-alignment [--tier=TIER] [--dry-run] [--verbose]
```

Options:
- `--tier`: Limit to specific tier (organization | system | module)
- `--dry-run`: Show planned actions without executing
- `--verbose`: Detailed output of all scanned files

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `retrospective` | Runs before docs-alignment; provides loop summary |
| `document` | Creates documentation; docs-alignment organizes it |
| `memory-manager` | Manages memory files; docs-alignment indexes them |
| `entry-portal` | Creates Dream States; docs-alignment maintains them |

## Key Principles

**MECE is sacred.** Every document has exactly one home.

**Dream States are living documents.** Update after every loop.

**Prune aggressively, archive thoughtfully.** Don't let docs rot.

**Cross-references must work.** Broken links are documentation bugs.

**Indexes enable discovery.** Agents should find docs without guessing.

**Automation over manual.** This skill runs automatically on completion.

## References

- `references/mece-categories.md`: Full MECE taxonomy with examples
- `references/document-lifecycle.md`: Document state machine
- `references/cross-reference-protocol.md`: How to link documents
- `references/index-generation.md`: Index creation guidelines
- `references/pruning-rules.md`: When and how to remove documents

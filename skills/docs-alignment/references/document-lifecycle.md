# Document Lifecycle

> How documents flow through states from creation to archival.

## State Machine

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT LIFECYCLE                                    │
│                                                                              │
│  ┌─────────┐       ┌─────────┐       ┌─────────┐       ┌─────────┐          │
│  │ DRAFT   │──────▶│ ACTIVE  │──────▶│ STALE   │──────▶│ ARCHIVED│          │
│  └─────────┘       └─────────┘       └─────────┘       └─────────┘          │
│       │                 │                 │                                  │
│       │                 │                 │                                  │
│       │                 ▼                 ▼                                  │
│       │           ┌─────────┐       ┌─────────┐                             │
│       └──────────▶│ UPDATED │       │ PRUNED  │                             │
│                   └─────────┘       └─────────┘                             │
│                         │                                                    │
│                         └───────────▶ (back to ACTIVE)                       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## State Definitions

### DRAFT

**Description:** Document is being created, not yet ready for use.
**Duration:** Typically within a single loop execution.
**Triggers:** Document creation started.

**Characteristics:**
- May be incomplete
- Not yet indexed
- Not cross-referenced
- May have placeholder content

**Exit conditions:**
- Loop phase completes → ACTIVE
- Abandoned → PRUNED

### ACTIVE

**Description:** Document is current and in use.
**Duration:** Until content becomes outdated or superseded.
**Triggers:** Loop completion, manual publish.

**Characteristics:**
- Complete and accurate
- Indexed at appropriate tier
- Cross-referenced where relevant
- Contains valid `last_updated` timestamp

**Exit conditions:**
- Content outdated → STALE
- New version created → ARCHIVED
- No longer relevant → PRUNED
- Content changed → UPDATED → ACTIVE

### UPDATED

**Description:** Transient state during modification.
**Duration:** During edit operation.
**Triggers:** docs-alignment skill, manual edit.

**Characteristics:**
- Being modified
- References may be temporarily broken
- Timestamps being updated

**Exit conditions:**
- Edit complete → ACTIVE

### STALE

**Description:** Document content is outdated but may still have value.
**Duration:** Until reviewed and either updated or archived.
**Triggers:** Time threshold exceeded, references broken, superseded.

**Characteristics:**
- `last_updated` > staleness threshold (varies by category)
- May contain outdated references
- May reference removed features
- Still accessible but flagged

**Exit conditions:**
- Refreshed → ACTIVE
- No longer relevant → ARCHIVED or PRUNED

### ARCHIVED

**Description:** Document preserved for historical reference.
**Duration:** Indefinite.
**Triggers:** Superseded, loop completed, feature shipped.

**Characteristics:**
- Moved to archive location
- Preserved in run archive
- Not actively maintained
- Not indexed in main index

**Exit conditions:**
- None (terminal state)
- Exception: Revived if needed → ACTIVE

### PRUNED

**Description:** Document removed from the system.
**Duration:** Permanent.
**Triggers:** Duplicate, never completed, obsolete.

**Characteristics:**
- Deleted or moved to trash
- Not recoverable (unless in git history)
- Not indexed

**Exit conditions:**
- None (terminal state)

## Staleness Thresholds by Category

| Category | Staleness Threshold | Action |
|----------|---------------------|--------|
| Instructions | 90 days | Review and confirm still valid |
| Dream States | 7 days (if active loop) | Must update after each loop |
| Memory (patterns) | Never stale | Patterns are historical |
| Memory (calibration) | 30 days | Review accuracy |
| Loop Definitions | 30 days | Review for improvements |
| Specs | 14 days (if in progress) | Review if still accurate |
| Architecture | 30 days | Review if still accurate |
| Audits | 7 days (if in progress) | Must complete in current loop |
| Run Archives | Never stale | Archives are historical |

## Lifecycle by Category

### Instructions (CLAUDE.md)

```
DRAFT (rare) ──▶ ACTIVE ──▶ UPDATED ──▶ ACTIVE
                                │
                                ▼ (very rare)
                            ARCHIVED
```

Instructions rarely go stale; they're updated in place or superseded.

### Dream States

```
DRAFT ──▶ ACTIVE ◀──▶ UPDATED
              │
              │ (never archived, always updated)
              ▼
           ACTIVE
```

Dream States are living documents, continuously updated.

### Memory (Patterns)

```
DRAFT ──▶ ACTIVE ◀──▶ UPDATED
              │
              │ (patterns may be deprecated)
              ▼
          ARCHIVED (deprecated pattern)
```

Patterns accumulate; old ones may be deprecated but preserved.

### Specs

```
DRAFT ──▶ ACTIVE ──▶ STALE ──▶ ARCHIVED
                         │
                         ▼
                      PRUNED (if never completed)
```

Specs have a clear lifecycle tied to feature delivery.

### Audits

```
DRAFT ──▶ ACTIVE ──▶ ARCHIVED
              │
              │ (typically one per loop)
              ▼
           PRUNED (if duplicate)
```

Audits are loop artifacts; archived when loop completes.

## Transition Triggers

### DRAFT → ACTIVE
- Loop phase completion
- Manual "publish" action
- All required sections filled

### ACTIVE → UPDATED
- docs-alignment skill runs
- Manual edit
- Cross-reference repair

### ACTIVE → STALE
- Time threshold exceeded
- Referenced entity removed
- Newer version available

### STALE → ACTIVE
- Content refreshed
- Confirmed still accurate
- References repaired

### STALE → ARCHIVED
- Superseded by new document
- Feature completed and shipped
- Loop completed

### STALE → PRUNED
- Duplicate content exists
- Never completed draft
- Truly obsolete

### ACTIVE → ARCHIVED
- New version created
- Feature shipped
- Loop completed with new run

## Lifecycle Hooks

### Pre-Transition Hooks

| Transition | Hook | Purpose |
|------------|------|---------|
| * → ACTIVE | `validate-content` | Ensure document is complete |
| * → ARCHIVED | `capture-summary` | Extract key info before archive |
| * → PRUNED | `confirm-removal` | Verify no dependencies |

### Post-Transition Hooks

| Transition | Hook | Purpose |
|------------|------|---------|
| * → ACTIVE | `update-index` | Add to appropriate index |
| * → ARCHIVED | `update-references` | Fix any pointing documents |
| * → PRUNED | `remove-references` | Clean up dead links |

## Document Metadata

Every document should track lifecycle state:

```yaml
---
category: dream-state
tier: system
state: active
created_at: 2025-01-15T10:00:00Z
last_updated: 2025-01-29T14:30:00Z
last_loop: engineering-loop
version: 1.2.0
supersedes: null
superseded_by: null
---
```

## Automation Points

### docs-alignment Skill Actions

| State | Automatic Action |
|-------|------------------|
| DRAFT for >7 days | Flag for review |
| ACTIVE with broken refs | Queue for update |
| STALE | Check if should archive or update |
| Multiple ACTIVE for same content | Flag duplicate |

### Run Completion Actions

| Event | Action |
|-------|--------|
| Loop completes | Archive loop deliverables to run |
| Phase produces artifact | Update artifact state to ACTIVE |
| Gate passed | Archive gate evidence |

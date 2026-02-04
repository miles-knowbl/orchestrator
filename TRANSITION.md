# Transition: Structured Document Architecture

> Bootstrap document for meta-change. Delete only after verification succeeds.

## Goal

Establish JSON as single source of truth for persistent documents (ROADMAP.md, DREAM-STATE.md), with markdown as generated views.

## Current State

- `data/roadmap-state.json` - Exists, used by RoadmapService
- `ROADMAP.md` - Manually maintained, can drift from JSON
- `.claude/DREAM-STATE.md` - Manually maintained
- `RoadmapService.ts` - Loads from JSON first, parses markdown as fallback

## Expected End State

- `.claude/roadmap.json` - Single source of truth (moved from data/)
- `.claude/dream-state.json` - New file, single source of truth
- `ROADMAP.md` - Generated from `.claude/roadmap.json`
- `.claude/DREAM-STATE.md` - Generated from `.claude/dream-state.json`
- `RoadmapService.ts` - Refactored with `renderMarkdown()` method
- No markdown parsing after initial bootstrap

## Implementation Steps

1. [ ] Move `data/roadmap-state.json` → `.claude/roadmap.json`
2. [ ] Add `renderMarkdown()` method to RoadmapService
3. [ ] Update RoadmapService to regenerate ROADMAP.md on save
4. [ ] Create `.claude/dream-state.json` from current DREAM-STATE.md
5. [ ] Create DreamStateService (or extend existing pattern)
6. [ ] Add `renderMarkdown()` for dream state
7. [ ] Verify both documents regenerate correctly
8. [ ] Update docs-alignment hook to use new architecture

## Rollback Instructions

If anything fails:

```bash
# Restore roadmap state
cp .claude/checkpoints/roadmap-state-backup-20260204.json data/roadmap-state.json

# Revert uncommitted changes
git checkout -- ARCHITECTURE.md FEATURESPEC.md REQUIREMENTS.md

# Remove this file
rm TRANSITION.md
```

## Checkpoint Location

`.claude/checkpoints/roadmap-state-backup-20260204.json`

## Status

- [x] Phase 1: CHECKPOINT (2026-02-04)
- [x] Phase 2: BOOTSTRAP (this file)
- [x] Phase 3: IMPLEMENT (2026-02-04)
- [x] Phase 4: VERIFY (2026-02-04)
- [x] Phase 5: CLEANUP (2026-02-04)

## Changes Made

1. Added 'deferred' status to ModuleStatusSchema (separate from 'blocked')
2. Updated RoadmapService to use `.claude/roadmap.json` as source of truth
3. Added `renderMarkdown()` method to regenerate ROADMAP.md on save
4. Updated `src/index.ts` to configure correct paths
5. Removed old `data/roadmap-state.json`
6. JSON now has deferred modules with `status: "deferred"`
7. ROADMAP.md shows `(deferred)` markers and `| *deferred*` in tables

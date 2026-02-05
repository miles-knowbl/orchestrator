# Release Plan: v1.9.2

## Summary

This release fixes a critical bug where loop commands were not being installed for users who installed orchestrator to non-default locations. It also archives two experimental loops and improves documentation.

## Version Bump

- **Previous:** 1.9.1
- **New:** 1.9.2
- **Type:** Patch (bug fix)
- **Reason:** Bug fix for command installation paths

## Changes Included

### Bug Fixes

#### Loop Command Installation Paths (Critical)
- **Problem:** The `orchestrator-start-loop.md` command had hardcoded `~/orchestrator` paths
- **Impact:** Users who installed to a different location (e.g., `/Users/friend/projects/orchestrator`) would not get the loop commands installed
- **Fix:** Updated all path references to use `$INSTALL_PATH` variable which reads from `~/.claude/orchestrator.json`
- **Files changed:**
  - `commands/orchestrator-start-loop.md` - Install Loop Commands section now uses variable
  - `commands/orchestrator-start-loop.md` - Fast Path section now reads config
  - `commands/orchestrator-start-loop.md` - Phase 4 START section uses variable

#### MessageFormatter Loop Display
- **Problem:** Server startup message truncated loops awkwardly with hardcoded 6-loop limit
- **Fix:** Now uses `categorizeLoops()` for organized display by category (Build/Plan)
- **File:** `src/services/proactive-messaging/MessageFormatter.ts`

### Archival

- **async-loop** - Moved to `loops-archive/experimental/`
- **cultivation-loop** - Moved to `loops-archive/experimental/`
- **Reason:** These loops are not production-ready and don't have CLI commands
- **Impact:** Loop count reduced from 13 to 11

### Documentation Updates

#### Dashboard Distribute Page
- Added new step 6: "Restart Claude Code" with clear instructions
- Updated step 5 to say "Open Claude Code in any project directory"
- Updated loop count from 13 to 11
- Removed async-loop and cultivation-loop from the grid

#### README.md
- Removed async-loop and cultivation-loop from Available Loops table

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `commands/orchestrator-start-loop.md` | Modified | Fixed hardcoded paths |
| `apps/dashboard/app/distribute/page.tsx` | Modified | Added restart step, updated count |
| `apps/dashboard/public/data/loops.json` | Modified | Removed archived loops |
| `apps/dashboard/public/data/loops/async-loop.json` | Deleted | Archived |
| `apps/dashboard/public/data/loops/cultivation-loop.json` | Deleted | Archived |
| `src/services/proactive-messaging/MessageFormatter.ts` | Modified | Categorized loop display |
| `README.md` | Modified | Removed archived loops |
| `loops/async-loop/` | Moved | To loops-archive/experimental/ |
| `loops/cultivation-loop/` | Moved | To loops-archive/experimental/ |

## Verification

- [x] Build passes: `npm run build` completes successfully
- [x] 11 loops in `loops/` directory
- [x] 11 loop JSON files in dashboard
- [x] README shows 11 loops
- [x] Dashboard shows 11 loops with restart instructions

```json
{
  "result": "PASS",
  "verification_pass_rate": 1.0
}
```

## Distribution Targets

- [x] Local build verified
- [ ] GitHub (push to main)
- [ ] Vercel (dashboard auto-deploy on push)
- [ ] GitHub Release (tarball via GitHub Actions)

## Rollback Plan

If issues arise:
1. Revert commit: `git revert HEAD`
2. Push revert: `git push origin main`
3. Dashboard and tarball will auto-update

## Post-Release Verification

After distribution:
1. Download fresh tarball and verify loop commands install correctly
2. Check dashboard at orchestrator-xi.vercel.app shows 11 loops
3. Verify restart instruction appears in Getting Started section

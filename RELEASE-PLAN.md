# Release Plan: v1.6.1

## Version

- **Previous:** 1.6.0
- **Proposed:** 1.6.1
- **Semver Justification:** PATCH - Bug fix only (MCP tool references causing loop freezes)

## Release Date

When criteria met (immediate distribution)

## Changes Included

### Bug Fixes
1. **Fix MCP tool references in loop commands**
   - Loop commands referenced non-existent `mcp__skills-library__` server
   - Changed to use registered `mcp__orchestrator__` server
   - Fixes loops freezing when invoked (/distribution-loop, /engineering-loop, etc.)
   - 27 occurrences fixed across 5 command files

### Files Changed
| File | Changes |
|------|---------|
| package.json | version 1.6.0 → 1.6.1 |
| commands/deck-loop.md | 1 MCP reference fixed |
| commands/distribution-loop.md | 6 MCP references fixed |
| commands/engineering-loop.md | 1 MCP reference fixed |
| commands/proposal-loop.md | 14 MCP references fixed |
| commands/transpose-loop.md | 5 MCP references fixed |

### Breaking Changes
None

## Release Criteria

- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Server starts and responds to /health
- [ ] Push to main successful
- [ ] CI pipeline triggered and passing

## Blockers

None identified.

## Cherry-Picks

None required - all changes are on main branch.

## Rollout Strategy

- **Type:** Full release (no canary/staged rollout)
- **Monitoring:** Check that loops execute without freezing
- **Success Criteria:** /distribution-loop completes successfully

## Rollback Plan

If issues arise post-release:
1. Revert the commit with `git revert`
2. Push to main
3. Re-sync ~/.claude/commands/ with previous versions

## Timeline

- **Code Freeze:** Now
- **Release:** Immediate after verification passes
- **Post-Release Monitoring:** Confirm loops work in next session

## Stakeholders

- **Approval:** Self (solo project)
- **Notification:** None required

## Distribution Targets

| Target | Action |
|--------|--------|
| Local | npm run build |
| GitHub | Push to main, release tarball |
| Vercel | Dashboard auto-deploy |

## Verification

```json
{
  "result": "PASS",
  "verified_at": "2026-02-03T13:10:00Z",
  "checks": {
    "version_bump": "PASS",
    "changes_documented": "PASS",
    "semver_correct": "PASS",
    "no_breaking_changes": "PASS"
  },
  "critical": 0
}
```

Overall: **PASS** - Release plan verified and ready for distribution.

# Release Plan: v1.8.1

## Version

- **Previous:** 1.8.0
- **Proposed:** 1.8.1
- **Semver Justification:** PATCH - Routine distribution with guarantee refinements and MCP tool wiring

## Release Date

When criteria met (immediate distribution)

## Changes Included

### Features (3)
1. **Wire up disconnected MCP tools** (`0f72d10`)
   - Connected orphaned MCP tool implementations to the server
2. **Add excludePatterns support for git_state guarantees** (`a3eefe3`)
   - Guarantees can now exclude specific file patterns from git state checks
3. **Expose transient state management via MCP tools** (`2676ae5`)
   - New tools for managing ephemeral execution state

### Bug Fixes (7)
1. **Remove retrospective skill guarantees** (`56cbe2d`)
2. **Add excludePatterns to distribution-gate guarantee** (`883063b`)
3. **Remove distribute skill guarantees** (`b64468c`) - no artifacts produced
4. **Correct git status parsing for excludePatterns** (`d9a9b84`)
5. **Remove git-workflow guarantees** (`1d707b9`) - too PR-specific
6. **Add guarantees for new deliverable-producing skills** (`f4fd614`)
7. **Resolve loop loading issues** (`2905346`)

### Memory Update
- `memory/orchestrator.json` - canonical orchestrator memory state

### Breaking Changes
None

## Release Criteria

- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Server starts and responds to /health
- [ ] Push to main successful
- [ ] CI pipeline triggered and passing

## Distribution Targets

| Target | Action |
|--------|--------|
| Local | npm run build |
| Vercel | Dashboard auto-deploy on push |
| GitHub Release | Rolling "latest" tarball |

## Risk Assessment

- **Low risk**: All changes are refinements to existing systems
- **No breaking changes**: Guarantee removals are additive (less strict)

# Release Plan: v1.5.0

## Version

- **Previous:** 1.4.1
- **Proposed:** 1.5.0
- **Semver Justification:** MINOR - New feature (async-loop for autonomous Slack operation)

## Release Date

When criteria met (immediate distribution)

## Changes Included

### Features
1. **`/async-loop` for autonomous Slack-based operation**
   - New loop that prepares system for mobile/async workflow
   - Gathers all 7 memory layers (dream state, roadmap, patterns, calibration, history, scores, improvements)
   - Builds prioritized work queue in `memory/async-queue.json`
   - Verifies Slack connectivity before handoff
   - Enables fully autonomous "Start Next" workflows from Slack

2. **Enhanced "Start Next" button behavior**
   - Now reads from pre-computed `async-queue.json`
   - Pops moves in order instead of recalculating leverage each time
   - Falls back to leverage protocol if no queue exists

### Documentation
1. **README updates**
   - Added `/async-loop` to available commands
   - Added `/learning-loop` to available commands
   - Added `/dream-loop` to available commands

### Breaking Changes
None

## Release Criteria

- [x] All TypeScript compiles without errors
- [x] All tests pass
- [x] Server starts and responds to /health
- [ ] Push to main successful
- [ ] CI pipeline triggered and passing

## Blockers

None identified.

## Distribution Targets

| Target | Action |
|--------|--------|
| Local | npm run build |
| GitHub | Push to main, release tarball |
| Vercel | Dashboard auto-deploy |

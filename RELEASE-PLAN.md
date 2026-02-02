# Release Plan: v1.4.0

## Summary

Minor release with 2 new features and 1 bug fix focused on autonomous loop execution and hands-free notifications.

## Version

- **Previous:** 1.3.2
- **Release:** 1.4.0
- **Bump Type:** Minor (new features)

## Changes

### Features

1. **Loop-level autonomy with auto-approve gates** (6e45c70)
   - Auto-approve gates when guarantees pass
   - Retry flow: 3 attempts with 10s delay before escalation
   - Spawn Claude Code to create missing deliverables after retries
   - Escalate to human with full Slack notification if Claude fails/times out
   - New `GateAutoApprovedEvent` type for brief notifications

2. **Voice output module for hands-free notifications** (fbcd0fe)
   - macOS `say` command integration via VoiceAdapter
   - Configurable voice, rate, and quiet hours
   - Event-specific voice announcements (gates, phases, completions)

### Fixes

1. **Slack button interactions now work for approve/reject/start-next** (7fcf8f8)
   - Fixed button action handling in SlackAdapter
   - Proper routing of approve/reject commands to ExecutionEngine

## Distribution Targets

| Target | Action |
|--------|--------|
| Local | npm run build |
| GitHub | Push to main, release tarball |
| Vercel | Dashboard auto-deploy |

## Verification Checklist

- [ ] Build passes
- [ ] Tests pass (116 tests)
- [ ] Server starts cleanly
- [ ] Voice adapter initializes
- [ ] Slack adapter connects

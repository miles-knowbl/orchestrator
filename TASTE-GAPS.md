# Taste Gaps: Orchestrator

## Identified Gaps

### 1. Mobile Experience Gap
- Voice output is Mac-only (`say` command)
- No native mobile app for loop control
- Slack is the only mobile interface

**Recommendation:** Consider web-based voice synthesis or push notification sounds

### 2. Onboarding Gap
- No guided first-run experience
- Dream State concept requires explanation
- Skill library can be overwhelming

**Recommendation:** Add `/onboarding-loop` or interactive tutorial

### 3. Visibility Gap
- Dashboard requires separate browser window
- No in-terminal progress visualization
- OODA clock is cool but underutilized

**Recommendation:** Terminal-based progress bars, inline status in Claude Code

### 4. Recovery Gap
- What happens when Claude Code crashes mid-loop?
- Execution state persists but resumption is manual
- No automatic recovery notification

**Recommendation:** Heartbeat + auto-resume with Slack notification

## Priority Order (by taste impact)

1. Mobile Experience Gap - affects daily usability
2. Recovery Gap - affects trust in autonomous mode
3. Visibility Gap - affects sense of progress
4. Onboarding Gap - affects new user adoption

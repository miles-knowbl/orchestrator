# Async Prerequisites Checklist

Complete checklist for async operation readiness with remediation steps.

## Slack Prerequisites

### Bot Token
- **Check:** `SLACK_BOT_TOKEN` environment variable or config file
- **How to get:** Slack App → OAuth & Permissions → Bot User OAuth Token
- **Format:** `xoxb-...`
- **Remediation:** Create Slack app, add bot scopes, install to workspace

### App Token (Socket Mode)
- **Check:** `SLACK_APP_TOKEN` environment variable or config file
- **How to get:** Slack App → Basic Information → App-Level Tokens
- **Format:** `xapp-...`
- **Scopes needed:** `connections:write`
- **Remediation:** Generate new app-level token with connections:write scope

### Channel ID
- **Check:** Config file `data/proactive-messaging/proactive-messaging-config.json`
- **How to get:** Right-click channel → View channel details → Copy ID
- **Format:** `C...` (public) or `G...` (private)
- **Remediation:** Add channel ID to config, ensure bot is invited to channel

### User ID (for @mentions)
- **Check:** Config file `slackUserId` field
- **How to get:** Click your name → Profile → More → Copy member ID
- **Format:** `U...`
- **Remediation:** Add user ID to config

### Connection Test
- **Check:** `POST /api/slack/test` or `mcp__orchestrator__test_messaging_channel`
- **Expected:** Message appears in channel
- **Remediation:** Check all tokens, ensure bot invited to channel

## Module Prerequisites

### Available Modules
- **Check:** `GET /api/roadmap/modules?status=available`
- **Expected:** At least 1 module with no blockers
- **Remediation:** Review roadmap, unblock dependencies, or defer work

### Roadmap Accessible
- **Check:** `ROADMAP.md` exists and parseable
- **Expected:** Valid markdown with module definitions
- **Remediation:** Fix roadmap syntax errors

### Dream State Accessible
- **Check:** `.claude/DREAM-STATE.md` exists
- **Expected:** Valid dream state document
- **Remediation:** Run `/dream-loop` to create/update

## System Health

### No Git Conflicts
- **Check:** `git status` shows no conflicts
- **Expected:** Clean or only uncommitted changes
- **Remediation:** Resolve conflicts manually: `git mergetool`

### Server Healthy
- **Check:** `GET /health` returns 200
- **Expected:** `{"status":"ok"}`
- **Remediation:** `npm start` or check error logs

### Memory Writable
- **Check:** Can write to `memory/` directory
- **Expected:** Write succeeds
- **Remediation:** Check permissions: `chmod 755 memory/`

## Configuration

### Autonomous Mode
```json
{
  "enabled": true,
  "tickInterval": 60000,
  "maxParallel": 1,
  "maxRetries": 3
}
```

### Recommended Settings for Mobile

| Setting | Value | Reason |
|---------|-------|--------|
| `tickInterval` | 60000 (1 min) | Balance between responsiveness and battery |
| `maxParallel` | 1 | Avoid conflicts when mobile |
| `maxRetries` | 3 | Auto-recover from transient failures |

## Quick Validation Command

```bash
# Run all prereq checks
curl -s http://localhost:3002/api/async/prereqs | jq .

# Expected output
{
  "valid": true,
  "slack": "connected",
  "modules": 3,
  "health": "ok"
}
```

## Common Issues

### "Slack connection failed"
1. Check bot token hasn't expired
2. Verify bot is still in workspace
3. Check network connectivity
4. Regenerate tokens if needed

### "No available modules"
1. All modules complete (good!)
2. All remaining modules blocked
3. Roadmap not parsed correctly
4. Check `GET /api/roadmap/modules` for details

### "System unhealthy"
1. Server not running
2. Port conflict (3002 in use)
3. Memory directory permissions
4. Disk full

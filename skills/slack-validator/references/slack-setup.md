# Slack Setup Guide

How to configure Slack for async orchestrator operation.

## Create Slack App

1. Go to https://api.slack.com/apps
2. Click "Create New App"
3. Choose "From scratch"
4. Name: "Orchestrator" (or your preference)
5. Select workspace

## Configure Bot Scopes

### Required OAuth Scopes

Navigate to: OAuth & Permissions → Scopes → Bot Token Scopes

| Scope | Purpose |
|-------|---------|
| `chat:write` | Send messages |
| `chat:write.public` | Send to public channels |
| `users:read` | Lookup user info |
| `channels:read` | Read channel info |
| `groups:read` | Read private channel info |

### Install to Workspace

1. Click "Install to Workspace"
2. Authorize the permissions
3. Copy the **Bot User OAuth Token** (`xoxb-...`)

## Enable Socket Mode

Navigate to: Socket Mode

1. Enable Socket Mode
2. Generate App-Level Token with `connections:write` scope
3. Copy the **App-Level Token** (`xapp-...`)

## Enable Interactive Components

Navigate to: Interactivity & Shortcuts

1. Turn on "Interactivity"
2. Request URL not needed for Socket Mode

## Configure Event Subscriptions

Navigate to: Event Subscriptions

1. Enable Events
2. Subscribe to bot events:
   - `message.channels`
   - `message.groups`
   - `app_mention`

## Get Channel ID

1. Right-click the channel name in Slack
2. Click "View channel details"
3. Scroll to bottom, copy Channel ID (`C...` or `G...`)

## Get User ID

1. Click your name in Slack
2. Click "Profile"
3. Click the "..." menu
4. Click "Copy member ID" (`U...`)

## Configure Orchestrator

Create/update `data/proactive-messaging/proactive-messaging-config.json`:

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-YOUR-TOKEN",
      "appToken": "xapp-YOUR-TOKEN",
      "channelId": "C0XXXXXXX",
      "socketMode": true,
      "slackUserId": "U0XXXXXXX"
    }
  }
}
```

Or use environment variables:
```bash
export SLACK_BOT_TOKEN=xoxb-...
export SLACK_APP_TOKEN=xapp-...
```

## Test Connection

```bash
# Check health
curl http://localhost:3002/api/slack/channels

# Send test message
curl -X POST http://localhost:3002/api/messaging/test \
  -H "Content-Type: application/json" \
  -d '{"channel": "slack", "message": "Test"}'
```

## Troubleshooting

### "not_in_channel"

The bot needs to be invited to the channel:
1. In Slack, go to the channel
2. Type `/invite @Orchestrator`

### "invalid_auth"

Token is invalid or expired:
1. Go to OAuth & Permissions
2. Reinstall app to workspace
3. Copy new token

### Socket Mode not connecting

1. Verify App-Level Token has `connections:write`
2. Check Socket Mode is enabled
3. Regenerate App-Level Token if needed

### Buttons not working

1. Verify Interactivity is enabled
2. Check Socket Mode (no URL needed)
3. Verify event subscriptions configured

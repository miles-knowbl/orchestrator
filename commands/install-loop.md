# /install-loop Command

**Bootstrap and update orchestrator.** One command to install, update, and connect.

## Purpose

This command handles the complete orchestrator lifecycle:
- **Fresh install**: Clone, build, register MCP, start server
- **Update**: Check for new version, download, rebuild, restart
- **Verify**: Ensure everything is connected and working

Run this once to get started, then periodically to stay up to date.

## Usage

```
/install-loop [--check] [--path=PATH]
```

**Options:**
- `--check`: Only check for updates, don't install
- `--path=PATH`: Install location (default: ~/orchestrator)

## Bootstrap (First Time)

If you don't have this command yet:

```bash
# One-liner to install the install-loop command
curl -sL https://raw.githubusercontent.com/superorganism/orchestrator/main/commands/install-loop.md \
  > ~/.claude/commands/install-loop.md
```

Then run `/install-loop` in Claude Code.

## Execution Flow

### Phase 1: DETECT

Assess current state:

```
1. Check if orchestrator directory exists at target path
2. If exists:
   - Read current version from package.json
   - Check if it's a git repo or tarball install
3. Query GitHub releases API for latest version
4. Compare versions
5. Check if MCP is already registered
   - claude mcp list | grep orchestrator
6. Check if server is running
   - curl -s http://localhost:3002/health
```

**Output state:**
- `installType`: 'fresh' | 'update' | 'current'
- `currentVersion`: string | null
- `latestVersion`: string
- `isGitRepo`: boolean
- `mcpRegistered`: boolean
- `serverRunning`: boolean

### Phase 2: INSTALL/UPDATE

Based on detected state:

**Fresh Install:**
```bash
# Clone the repository
git clone https://github.com/superorganism/orchestrator.git ~/orchestrator
cd ~/orchestrator

# Install dependencies
npm install

# Build
npm run build
```

**Update (git repo):**
```bash
cd ~/orchestrator

# Stash any local changes
git stash

# Pull latest
git fetch origin
git checkout main
git pull origin main

# Restore local changes
git stash pop || true

# Rebuild
npm install
npm run build
```

**Update (tarball install):**
```bash
cd ~/orchestrator

# Backup data and config
cp -r data data.backup
cp -r .claude .claude.backup 2>/dev/null || true

# Download latest release
curl -sL https://github.com/superorganism/orchestrator/releases/latest/download/orchestrator.tar.gz \
  | tar -xz --strip-components=1

# Restore data and config
cp -r data.backup/* data/ 2>/dev/null || true
cp -r .claude.backup/* .claude/ 2>/dev/null || true
rm -rf data.backup .claude.backup

# Rebuild
npm install
npm run build
```

**Already Current:**
```
Skip install/update phase.
```

**Write Config (after any install/update):**
```bash
# Write orchestrator config with install path and version
CONFIG_FILE="$HOME/.claude/orchestrator.json"
VERSION=$(node -p "require('./package.json').version")
INSTALL_PATH=$(pwd)

node -e "
  const fs = require('fs');
  fs.writeFileSync('$CONFIG_FILE', JSON.stringify({
    installPath: '$INSTALL_PATH',
    version: '$VERSION',
    installedAt: new Date().toISOString()
  }, null, 2));
"
echo "Installing to: $INSTALL_PATH"
echo "(This will be your active orchestrator installation)"
```

### Phase 3: REGISTER

Register MCP server and auto-start hook with Claude Code:

```bash
# Register MCP server (HTTP transport, explicit config)
MCP_FILE="$HOME/.claude/mcp.json"
mkdir -p ~/.claude

node -e "
  const fs = require('fs');
  const mcpFile = '$MCP_FILE';

  // Load existing config or create new
  let config = { mcpServers: {} };
  if (fs.existsSync(mcpFile)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
      config.mcpServers = config.mcpServers || {};
    } catch (e) {
      console.log('Warning: Could not parse existing mcp.json, creating new');
    }
  }

  // Set orchestrator to HTTP transport (explicit, not stdio)
  config.mcpServers.orchestrator = {
    type: 'http',
    url: 'http://localhost:3002/mcp'
  };

  fs.writeFileSync(mcpFile, JSON.stringify(config, null, 2));
  console.log('MCP server registered (HTTP transport)');
"

# Install auto-start hook (opens Terminal when MCP tools are called)
mkdir -p ~/.claude/hooks

# Create the ensure-orchestrator.sh script
cat > ~/.claude/hooks/ensure-orchestrator.sh << 'HOOK'
#!/bin/bash
# ensure-orchestrator.sh - Auto-start orchestrator server in a new terminal window
# Triggered by PreToolUse hook on mcp__orchestrator__* tools
#
# Custom terminal support:
#   Set ORCHESTRATOR_TERMINAL_CMD in your shell profile (~/.zshrc) to use a different terminal.
#   The command should open a new terminal window and run the server.
#   Available variables: $ORCHESTRATOR_DIR
#   Example: export ORCHESTRATOR_TERMINAL_CMD='warp -e "cd $ORCHESTRATOR_DIR && npm start"'

# Read install path from config, fallback to $HOME/orchestrator
CONFIG_FILE="$HOME/.claude/orchestrator.json"
if [ -f "$CONFIG_FILE" ]; then
    ORCHESTRATOR_DIR=$(node -p "require('$CONFIG_FILE').installPath" 2>/dev/null)
fi
ORCHESTRATOR_DIR="${ORCHESTRATOR_DIR:-$HOME/orchestrator}"

HEALTH_URL="http://localhost:3002/health"
MAX_WAIT=30

# Fast path: check if server is already running
if curl -s --max-time 1 "$HEALTH_URL" > /dev/null 2>&1; then
    exit 0
fi

# Server not running - open terminal and start it
if [ -n "$ORCHESTRATOR_TERMINAL_CMD" ]; then
    # User's custom terminal command
    eval "$ORCHESTRATOR_TERMINAL_CMD"
elif [ -d "/Applications/iTerm.app" ]; then
    # iTerm2
    osascript <<EOF
tell application "iTerm"
    activate
    set newWindow to (create window with default profile)
    tell current session of newWindow
        write text "cd \"$ORCHESTRATOR_DIR\" && echo '🚀 Starting Orchestrator...' && npm start"
    end tell
end tell
EOF
else
    # Terminal.app (fallback)
    osascript <<EOF
tell application "Terminal"
    activate
    set newTab to do script "cd \"$ORCHESTRATOR_DIR\" && echo '🚀 Starting Orchestrator...' && npm start"
    set custom title of front window to "Orchestrator Server"
end tell
EOF
fi

# Wait for server to be ready
echo "Waiting for orchestrator to start..."
waited=0
while [ $waited -lt $MAX_WAIT ]; do
    if curl -s --max-time 1 "$HEALTH_URL" > /dev/null 2>&1; then
        echo "Orchestrator is ready"
        exit 0
    fi
    sleep 1
    waited=$((waited + 1))
done

echo "Warning: Orchestrator did not start within ${MAX_WAIT}s"
exit 1
HOOK

chmod +x ~/.claude/hooks/ensure-orchestrator.sh

# Add PreToolUse hook to hooks.json (if not already)
HOOKS_FILE="$HOME/.claude/hooks.json"
if [ ! -f "$HOOKS_FILE" ]; then
  echo '{"hooks":{}}' > "$HOOKS_FILE"
fi

# Check if hook already exists
if ! grep -q "ensure-orchestrator" "$HOOKS_FILE" 2>/dev/null; then
  # Use node to safely merge the hooks into existing config
  node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$HOOKS_FILE', 'utf8'));
    config.hooks = config.hooks || {};

    // SessionStart hook - check server when Claude Code opens
    config.hooks.SessionStart = config.hooks.SessionStart || [];
    config.hooks.SessionStart.unshift({
      name: 'ensure-orchestrator-on-start',
      command: '~/.claude/hooks/ensure-orchestrator.sh'
    });

    // PreToolUse hook - check server before MCP tool calls
    config.hooks.PreToolUse = config.hooks.PreToolUse || [];
    config.hooks.PreToolUse.unshift({
      name: 'ensure-orchestrator',
      matcher: { toolNames: ['mcp__orchestrator__*'] },
      command: '~/.claude/hooks/ensure-orchestrator.sh'
    });

    fs.writeFileSync('$HOOKS_FILE', JSON.stringify(config, null, 2));
  "
  echo "Auto-start hooks installed (SessionStart + PreToolUse)"
else
  echo "Auto-start hooks already installed"
fi
```

### Phase 4: START

Start the orchestrator server in a visible Terminal window:

```bash
cd ~/orchestrator

# Kill existing process if running
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

# Open terminal and start the server (user can see logs)
# Check for custom terminal, then iTerm2, then Terminal.app
if [ -n "$ORCHESTRATOR_TERMINAL_CMD" ]; then
    # User's custom terminal command
    eval "$ORCHESTRATOR_TERMINAL_CMD"
elif [ -d "/Applications/iTerm.app" ]; then
    # iTerm2
    osascript <<EOF
tell application "iTerm"
    activate
    set newWindow to (create window with default profile)
    tell current session of newWindow
        write text "cd '$HOME/orchestrator' && echo '🚀 Starting Orchestrator...' && npm start"
    end tell
end tell
EOF
else
    # Terminal.app (fallback)
    osascript <<EOF
tell application "Terminal"
    activate
    set newTab to do script "cd '$HOME/orchestrator' && echo '🚀 Starting Orchestrator...' && npm start"
    set custom title of front window to "Orchestrator Server"
end tell
EOF
fi

# Wait for server to be ready
for i in {1..30}; do
  if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "Server started successfully"
    break
  fi
  sleep 1
done
```

### Phase 5: VERIFY

Verify everything is working:

```bash
# Check server health
curl -s http://localhost:3002/health | jq .
```

**Call MCP tool to verify connection and trigger daily welcome:**
```
mcp__orchestrator__check_daily_status()
```

This:
1. Records the interaction in install state
2. Checks if this is the first call of the day
3. Sends a contextual welcome message (to terminal + Slack)
4. Returns status including Dream State progress, pending proposals, version info

### Phase 6: COMPLETE

Show completion summary:

```
═══════════════════════════════════════════════════════════════
  INSTALL COMPLETE

  Version:   1.2.0
  Location:  ~/orchestrator
  Server:    http://localhost:3002 (running in Terminal)
  Dashboard: http://localhost:3002
  MCP:       Connected ✓
  Auto-start: Enabled (server will start automatically)

  You're ready to go!

  If this is your first time:
    Run /dream-loop to establish your vision and roadmap.

  Or start building:
    Run /engineering-loop → your-module
═══════════════════════════════════════════════════════════════
```

## State File

The install-loop tracks state in `~/orchestrator/data/install-state.json`:

```json
{
  "installedAt": "2026-01-15T10:30:00Z",
  "installedVersion": "1.2.0",
  "installType": "git",
  "lastUpdateCheck": "2026-02-01T08:00:00Z",
  "lastUpdateVersion": "1.2.0",
  "mcpRegisteredAt": "2026-01-15T10:31:00Z"
}
```

## Daily Welcome Messages

On first MCP tool call of each day, orchestrator shows a contextual welcome:

**Fresh install (no Dream State):**
```
┌─────────────────────────────────────────────────────────────┐
│ Welcome to Orchestrator!                                    │
│                                                             │
│ No Dream State found.                                       │
│                                                             │
│ Run /dream-loop to establish your vision and roadmap.       │
└─────────────────────────────────────────────────────────────┘
```

**Returning user:**
```
┌─────────────────────────────────────────────────────────────┐
│ Good morning!                                               │
│                                                             │
│ Dream State: my-project (12/20 modules)                     │
│ Proposals: 3 pending review                                 │
│ Version: 1.2.0 ✓                                            │
│                                                             │
│ Recommended: /engineering-loop → auth-service               │
└─────────────────────────────────────────────────────────────┘
```

**Update available:**
```
┌─────────────────────────────────────────────────────────────┐
│ Update Available                                            │
│                                                             │
│ Current: 1.2.0 → Latest: 1.3.0                              │
│                                                             │
│ Run /install-loop to update.                                │
│                                                             │
│ What's new in 1.3.0:                                        │
│   • Improved Slack integration                              │
│   • New /audit-loop command                                 │
│   • Performance improvements                                │
└─────────────────────────────────────────────────────────────┘
```

## Auto-Update Mode

For hands-off updates, configure auto-update in `~/orchestrator/data/install-state.json`:

```json
{
  "autoUpdate": {
    "enabled": true,
    "channel": "stable",
    "checkInterval": "daily",
    "lastCheck": "2026-02-01T08:00:00Z"
  }
}
```

When enabled:
- Server checks for updates on startup
- If update available, shows notification
- User confirms or it auto-applies based on settings

## Troubleshooting

**Port 3002 already in use:**
```bash
lsof -ti:3002 | xargs kill -9
```

**MCP not connecting:**
```bash
# Verify ~/.claude/mcp.json has the correct config:
cat ~/.claude/mcp.json
# Should contain:
# {
#   "mcpServers": {
#     "orchestrator": {
#       "type": "http",
#       "url": "http://localhost:3002/mcp"
#     }
#   }
# }

# If wrong, fix it manually or re-run /install-loop
```

**Server won't start:**
```bash
# The server runs in a visible Terminal window, so check that window for errors
# If the Terminal window closed, start manually:
cd ~/orchestrator && npm start
```

**Build failing:**
```bash
# Clean rebuild
cd ~/orchestrator
rm -rf node_modules dist
npm install
npm run build
```

## Example Session

```
User: /install-loop

Install Loop: Detecting current state...

  Orchestrator found at ~/orchestrator
  Current version: 1.1.0
  Latest version: 1.2.0
  Update available!

  MCP: not registered
  Server: not running

Install Loop: Updating...

  Pulling latest changes...
  ✓ Updated to 1.2.0

  Installing dependencies...
  ✓ npm install complete

  Building...
  ✓ Build complete

Install Loop: Registering MCP...

  ✓ MCP server registered

Install Loop: Starting server...

  Opening Terminal window...
  ✓ Server running at http://localhost:3002 (visible in Terminal)

Install Loop: Verifying connection...

  ✓ Health check passed
  ✓ MCP connection verified
  ✓ 86 skills loaded
  ✓ 11 loops available

═══════════════════════════════════════════════════════════════
  INSTALL COMPLETE

  Version:   1.2.0 (updated from 1.1.0)
  Location:  ~/orchestrator
  Server:    http://localhost:3002
  MCP:       Connected ✓

  You're ready to go!
  Run /dream-loop to establish your vision, or
  Run /engineering-loop → your-module to start building.
═══════════════════════════════════════════════════════════════
```

## Session Startup

After installation, each Claude Code session should start by calling:

```
mcp__orchestrator__check_daily_status()
```

This shows a contextual welcome message on first call of each day:
- Fresh install: Suggests running `/dream-loop`
- Update available: Shows version diff and suggests `/install-loop`
- Normal day: Shows Dream State progress, pending proposals, recommended loop

The daily message is sent to both terminal and Slack (if configured).

## References

- GitHub Releases API: `https://api.github.com/repos/superorganism/orchestrator/releases/latest`
- Claude MCP config: `~/.claude/mcp.json`
- Orchestrator docs: https://orchestrator.dev

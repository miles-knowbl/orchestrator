# /orchestrator-start-loop Command

**Bootstrap, update, and start orchestrator.** One command for everything.

## Purpose

This command handles the complete orchestrator lifecycle:
- **Fresh install**: Clone, build, register MCP, start server
- **Update**: Check for new version, download, rebuild, restart
- **Start session**: Ensure server running, show daily status (fast path)

Run this at the start of each session. It's smart about what needs to happen.

## Usage

```
/orchestrator-start-loop [--check] [--path=PATH]
```

**Options:**
- `--check`: Only check for updates, don't install
- `--path=PATH`: Install location (default: ~/orchestrator)

## Bootstrap (First Time)

If you don't have this command yet:

```bash
# One-liner to install the orchestrator-start-loop command
curl -sL https://raw.githubusercontent.com/miles-knowbl/orchestrator/main/commands/orchestrator-start-loop.md \
  > ~/.claude/commands/orchestrator-start-loop.md
```

Then run `/orchestrator-start-loop` in Claude Code.

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

---

## Fast Path: Already Current

**When `installType: 'current'` (already installed + up-to-date), skip to streamlined flow:**

```bash
# Read install path from config
CONFIG_FILE="$HOME/.claude/orchestrator.json"
if [ -f "$CONFIG_FILE" ]; then
    ORCHESTRATOR_DIR=$(node -p "require('$CONFIG_FILE').installPath" 2>/dev/null)
fi
ORCHESTRATOR_DIR="${ORCHESTRATOR_DIR:-$HOME/orchestrator}"

# Ensure commands are synced (fast - only copies if missing)
mkdir -p ~/.claude/commands/_shared
SYNCED=0
for cmd in "$ORCHESTRATOR_DIR"/commands/*-loop.md; do
  [ -f "$cmd" ] || continue
  basename_cmd=$(basename "$cmd")
  [ "$basename_cmd" = "orchestrator-start-loop.md" ] && continue
  if [ ! -f ~/.claude/commands/"$basename_cmd" ]; then
    cp "$cmd" ~/.claude/commands/
    SYNCED=$((SYNCED + 1))
  fi
done
for shared in "$ORCHESTRATOR_DIR"/commands/_shared/*.md; do
  [ -f "$shared" ] || continue
  basename_shared=$(basename "$shared")
  if [ ! -f ~/.claude/commands/_shared/"$basename_shared" ]; then
    cp "$shared" ~/.claude/commands/_shared/
  fi
done
[ $SYNCED -gt 0 ] && echo "Synced $SYNCED missing commands. Restart Claude Code to load them."

# Ensure MCP server is registered (checks ~/.claude.json via CLI)
if ! claude mcp list 2>&1 | grep -q "orchestrator"; then
  echo "MCP server not registered. Registering..."
  claude mcp add --transport http --scope user orchestrator http://localhost:3002/mcp
  echo "MCP server registered. Restart Claude Code to connect."
fi

# Check if server is running
HEALTH_URL="http://localhost:3002/health"

if curl -s --max-time 1 "$HEALTH_URL" > /dev/null 2>&1; then
    echo "Server running."
else
    # Start server
    if [ -n "$ORCHESTRATOR_TERMINAL_CMD" ]; then
        eval "$ORCHESTRATOR_TERMINAL_CMD"
    elif [ -d "/Applications/iTerm.app" ]; then
        osascript <<EOF
tell application "iTerm"
    activate
    set newWindow to (create window with default profile)
    tell current session of newWindow
        write text "cd \"$ORCHESTRATOR_DIR\" && npm start"
    end tell
end tell
EOF
    else
        osascript <<EOF
tell application "Terminal"
    activate
    do script "cd \"$ORCHESTRATOR_DIR\" && npm start"
end tell
EOF
    fi

    # Wait for server (max 15s)
    for i in {1..15}; do
        if curl -s --max-time 1 "$HEALTH_URL" > /dev/null 2>&1; then
            echo "Server started."
            break
        fi
        sleep 1
    done
fi
```

**Then show daily status:**
```
mcp__orchestrator__check_daily_status()
```

**Example output (fast path):**
```
Server running.

Good morning!

Dream State: my-project (12/20 modules - 60%)
Proposals: 2 pending review
Version: 1.3.1 ✓

Recommended: /engineering-loop → auth-service
```

---

## Full Flow: Fresh Install or Update

When `installType` is 'fresh' or 'update', run all phases:

### Phase 2: INSTALL/UPDATE

Based on detected state:

**Fresh Install:**
```bash
# Clone the repository
git clone https://github.com/miles-knowbl/orchestrator.git ~/orchestrator
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
curl -sL https://github.com/miles-knowbl/orchestrator/releases/latest/download/orchestrator.tar.gz \
  | tar -xz --strip-components=1

# Restore data and config
cp -r data.backup/* data/ 2>/dev/null || true
cp -r .claude.backup/* .claude/ 2>/dev/null || true
rm -rf data.backup .claude.backup

# Rebuild
npm install
npm run build
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

**Install Loop Commands (after any install/update):**
```bash
# Copy loop commands to Claude Code commands directory
# IMPORTANT: Uses $INSTALL_PATH from previous step (defaults to ~/orchestrator)
INSTALL_PATH="${INSTALL_PATH:-$HOME/orchestrator}"
mkdir -p ~/.claude/commands

echo "Installing loop commands from $INSTALL_PATH/commands/..."

# Copy all loop commands (excluding _shared directory and orchestrator-start-loop)
count=0
for cmd in "$INSTALL_PATH"/commands/*-loop.md; do
  if [ -f "$cmd" ]; then
    basename_cmd=$(basename "$cmd")
    # Skip orchestrator-start-loop.md (it's already installed)
    if [ "$basename_cmd" != "orchestrator-start-loop.md" ]; then
      cp "$cmd" ~/.claude/commands/
      echo "  Installed: $basename_cmd"
      count=$((count + 1))
    fi
  fi
done

# Copy shared protocols
mkdir -p ~/.claude/commands/_shared
cp -r "$INSTALL_PATH"/commands/_shared/* ~/.claude/commands/_shared/ 2>/dev/null || true

echo "✓ $count loop commands installed to ~/.claude/commands/"
```

### Phase 3: REGISTER

Register MCP server and auto-start hook with Claude Code:

```bash
# Register MCP server using the Claude Code CLI (writes to ~/.claude.json)
# Check if already registered first
if claude mcp list 2>&1 | grep -q "orchestrator"; then
  echo "MCP server already registered"
else
  claude mcp add --transport http --scope user orchestrator http://localhost:3002/mcp
  echo "MCP server registered (HTTP transport)"
fi

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
  # Use node to safely merge the hook into existing config
  node -e "
    const fs = require('fs');
    const config = JSON.parse(fs.readFileSync('$HOOKS_FILE', 'utf8'));
    config.hooks = config.hooks || {};
    config.hooks.PreToolUse = config.hooks.PreToolUse || [];
    config.hooks.PreToolUse.unshift({
      name: 'ensure-orchestrator',
      matcher: { toolNames: ['mcp__orchestrator__*'] },
      command: '~/.claude/hooks/ensure-orchestrator.sh'
    });
    fs.writeFileSync('$HOOKS_FILE', JSON.stringify(config, null, 2));
  "
  echo "Auto-start hook installed"
else
  echo "Auto-start hook already installed"
fi
```

### Phase 4: START

Start the orchestrator server in a visible Terminal window:

```bash
# Use $INSTALL_PATH from previous steps (defaults to ~/orchestrator)
INSTALL_PATH="${INSTALL_PATH:-$HOME/orchestrator}"
cd "$INSTALL_PATH"

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
        write text "cd '$INSTALL_PATH' && echo '🚀 Starting Orchestrator...' && npm start"
    end tell
end tell
EOF
else
    # Terminal.app (fallback)
    osascript <<EOF
tell application "Terminal"
    activate
    set newTab to do script "cd '$INSTALL_PATH' && echo '🚀 Starting Orchestrator...' && npm start"
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
  Loops:     11 installed to ~/.claude/commands/

  ⚠️  IMPORTANT: Restart Claude Code to load the new commands.

  After restart, if this is your first time:
    Run /dream-loop to establish your vision and roadmap.

  Or start building:
    Run /engineering-loop → your-module
═══════════════════════════════════════════════════════════════
```

## State File

The loop tracks state in `~/orchestrator/data/install-state.json`:

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
│ Run /orchestrator-start-loop to update.                     │
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

## Server Resilience (CRITICAL)

**If any MCP tool call fails with a connection error, DO NOT exit the loop.** Follow the retry protocol in `commands/_shared/server-resilience-protocol.md`:

1. Tell the user the server connection was lost
2. Wait 5 seconds, then retry the same call (the PreToolUse hook will restart the server)
3. If 3 retries fail, ask the user whether to wait, skip, or stop
4. Your executionId survives server restarts — do NOT create a new execution
5. Continue the loop from where you left off

---

## Troubleshooting

**Port 3002 already in use:**
```bash
lsof -ti:3002 | xargs kill -9
```

**MCP not connecting:**
```bash
# Check if orchestrator is registered with Claude Code:
claude mcp list

# If not listed, register it:
claude mcp add --transport http --scope user orchestrator http://localhost:3002/mcp

# If listed but not connecting, remove and re-add:
claude mcp remove orchestrator
claude mcp add --transport http --scope user orchestrator http://localhost:3002/mcp

# Then restart Claude Code to pick up the new config
```

**Server won't start / Opens in wrong directory:**
```bash
# Check your orchestrator config has the correct install path:
cat ~/.claude/orchestrator.json
# Should show: "installPath": "/path/to/your/orchestrator"

# If wrong, delete the config and re-run /orchestrator-start-loop:
rm ~/.claude/orchestrator.json

# Or manually start the server:
cd /path/to/orchestrator && npm start
```

**Roadmap shows 0% when modules are complete:**
```bash
# The roadmap state is cached. Delete the cache and restart:
rm /path/to/orchestrator/data/roadmap-state.json
# Then kill the server (it will auto-start on next MCP call)
lsof -ti:3002 | xargs kill -9
```

**Build failing:**
```bash
# Clean rebuild
cd ~/orchestrator
rm -rf node_modules dist
npm install
npm run build
```

## Example Sessions

### Fresh Install
```
User: /orchestrator-start-loop

Orchestrator Start Loop: Detecting current state...

  No orchestrator installation found.
  Latest version: 1.3.0

Orchestrator Start Loop: Installing...

  Cloning repository...
  ✓ Cloned to ~/orchestrator

  Installing dependencies...
  ✓ npm install complete

  Building...
  ✓ Build complete

Orchestrator Start Loop: Installing loop commands...

  Installed: engineering-loop.md
  Installed: bugfix-loop.md
  Installed: distribution-loop.md
  ... (11 total)
  ✓ Loop commands installed to ~/.claude/commands/

Orchestrator Start Loop: Registering MCP...

  ✓ MCP server registered
  ✓ Auto-start hook installed

Orchestrator Start Loop: Starting server...

  Opening Terminal window...
  ✓ Server running at http://localhost:3002

Orchestrator Start Loop: Verifying...

  ✓ Health check passed
  ✓ MCP connection verified

═══════════════════════════════════════════════════════════════
  INSTALL COMPLETE

  Version:   1.3.0
  Location:  ~/orchestrator
  Server:    http://localhost:3002
  MCP:       Connected ✓
  Loops:     11 installed

  ⚠️  IMPORTANT: Restart Claude Code to load the new commands.

  After restart, run /dream-loop to establish your vision.
═══════════════════════════════════════════════════════════════
```

### Daily Session Start (Already Current)
```
User: /orchestrator-start-loop

Server running.

Good morning!

Dream State: my-project (12/20 modules - 60%)
Proposals: 2 pending review
Version: 1.3.1 ✓

Recommended: /engineering-loop → auth-service
```

### Update Available
```
User: /orchestrator-start-loop

Orchestrator Start Loop: Detecting current state...

  Current version: 1.2.0
  Latest version: 1.3.0
  Update available!

Orchestrator Start Loop: Updating...

  Pulling latest changes...
  ✓ Updated to 1.3.0

  Rebuilding...
  ✓ Build complete

Orchestrator Start Loop: Starting server...

  ✓ Server running at http://localhost:3002

═══════════════════════════════════════════════════════════════
  UPDATE COMPLETE

  Version:   1.3.0 (updated from 1.2.0)
  Location:  ~/orchestrator
  Server:    http://localhost:3002
  MCP:       Connected ✓
═══════════════════════════════════════════════════════════════
```

## References

- GitHub Releases API: `https://api.github.com/repos/miles-knowbl/orchestrator/releases/latest`
- Claude MCP config: `~/.claude.json` (managed via `claude mcp add`)
- Dashboard: https://orchestrator-xi.vercel.app

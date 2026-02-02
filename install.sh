#!/usr/bin/env bash
set -e

echo ""
echo "Orchestrator Installer"
echo "======================"
echo ""

# --- Check prerequisites ---

check() {
  if ! command -v "$1" &>/dev/null; then
    echo "[FAIL] $1 is not installed. $2"
    exit 1
  fi
}

check node "Install Node.js 18+ from https://nodejs.org"
check npm  "npm should come with Node.js"
check git  "Install git from https://git-scm.com"

# Verify Node.js version >= 18
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "[FAIL] Node.js v$(node -v) found, but v18+ is required."
  exit 1
fi

echo "[OK] Node.js $(node -v)"
echo "[OK] npm $(npm -v)"
echo "[OK] git $(git --version | awk '{print $3}')"

# --- Guard against re-clone ---

if [ -d "orchestrator" ]; then
  echo ""
  echo "[WARN] orchestrator/ already exists in this directory."
  echo "       Remove it first or run from a different directory."
  exit 1
fi

# --- Clone ---

git clone https://github.com/superorganism/orchestrator.git
echo "[OK] Cloned orchestrator"

cd orchestrator

# --- Install ---

npm install --loglevel=error
echo "[OK] Dependencies installed"

# --- Build ---

npm run build --silent
echo "[OK] Build complete"

# --- Create .env ---

if [ -f .env.example ]; then
  cp .env.example .env
  echo "[OK] Created .env from template"
fi

# --- Install slash commands ---

mkdir -p ~/.claude/commands
INSTALLED=0
for cmd in commands/*.md; do
  [ -f "$cmd" ] || continue
  cp "$cmd" ~/.claude/commands/
  INSTALLED=$((INSTALLED + 1))
done
echo "[OK] Installed $INSTALLED slash commands to ~/.claude/commands/"

# --- Configure MCP (HTTP transport, explicit) ---

MCP_FILE="$HOME/.claude/mcp.json"
mkdir -p ~/.claude

node -e "
  const fs = require('fs');
  const mcpFile = '$MCP_FILE';

  let config = { mcpServers: {} };
  if (fs.existsSync(mcpFile)) {
    try {
      config = JSON.parse(fs.readFileSync(mcpFile, 'utf8'));
      config.mcpServers = config.mcpServers || {};
    } catch (e) {}
  }

  config.mcpServers.orchestrator = {
    type: 'http',
    url: 'http://localhost:3002/mcp'
  };

  fs.writeFileSync(mcpFile, JSON.stringify(config, null, 2));
"
echo "[OK] Configured MCP server (HTTP transport)"

# --- Install auto-start hook ---

ORCHESTRATOR_DIR="$(pwd)"
mkdir -p ~/.claude/hooks

cat > ~/.claude/hooks/ensure-orchestrator.sh << 'HOOK'
#!/bin/bash
# ensure-orchestrator.sh - Auto-start orchestrator server in a new terminal window
#
# Custom terminal support:
#   Set ORCHESTRATOR_TERMINAL_CMD in your shell profile (~/.zshrc) to use a different terminal.
#   The command should open a new terminal window and run the server.
#   Available variables: $ORCHESTRATOR_DIR
#   Example: export ORCHESTRATOR_TERMINAL_CMD='warp -e "cd $ORCHESTRATOR_DIR && npm start"'

ORCHESTRATOR_DIR="$HOME/orchestrator"
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
waited=0
while [ $waited -lt $MAX_WAIT ]; do
    if curl -s --max-time 1 "$HEALTH_URL" > /dev/null 2>&1; then
        exit 0
    fi
    sleep 1
    waited=$((waited + 1))
done

exit 1
HOOK

chmod +x ~/.claude/hooks/ensure-orchestrator.sh

# Add hook to hooks.json
HOOKS_FILE="$HOME/.claude/hooks.json"
if [ ! -f "$HOOKS_FILE" ]; then
  echo '{"hooks":{}}' > "$HOOKS_FILE"
fi

if ! grep -q "ensure-orchestrator" "$HOOKS_FILE" 2>/dev/null; then
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
fi
echo "[OK] Installed auto-start hook"

# --- Start server in terminal ---

echo ""
echo "Starting server..."

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
        write text "cd '$ORCHESTRATOR_DIR' && echo '🚀 Starting Orchestrator...' && npm start"
    end tell
end tell
EOF
else
    # Terminal.app (fallback)
    osascript <<EOF
tell application "Terminal"
    activate
    set newTab to do script "cd '$ORCHESTRATOR_DIR' && echo '🚀 Starting Orchestrator...' && npm start"
    set custom title of front window to "Orchestrator Server"
end tell
EOF
fi

# Wait for server
for i in {1..30}; do
  if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

# --- Done ---

echo ""
echo "========================================"
echo "  Installation complete!"
echo "========================================"
echo ""
echo "  Server: http://localhost:3002 (running in Terminal)"
echo "  MCP:    Configured (HTTP transport)"
echo "  Hooks:  Auto-start enabled"
echo ""
echo "  The server starts automatically when you use any"
echo "  orchestrator tool in Claude Code. Just run:"
echo ""
echo "    claude"
echo ""
echo "  Then try a slash command:"
echo ""
echo "    /engineering-loop    Full engineering loop (build anything)"
echo "    /bugfix-loop         Systematic bug fixing"
echo "    /distribution-loop   Distribute to all targets"
echo "    /proposal-loop       Create evidence-backed proposals"
echo "    /transpose-loop      Transpose architecture to new stack"
echo "    /infra-loop          Infrastructure provisioning"
echo "    /audit-loop          System audit (read-only)"
echo "    /deck-loop           Generate slide decks"
echo "    /meta-loop           Create new loops"
echo ""
echo "  To update later, run: /install-loop"
echo ""

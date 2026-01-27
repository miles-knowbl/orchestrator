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

git clone https://github.com/miles-knowbl/orchestrator.git
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

# --- Done ---

echo ""
echo "========================================"
echo "  Installation complete!"
echo "========================================"
echo ""
echo "  STEP 1: Start the server"
echo ""
echo "    cd orchestrator"
echo "    npm start"
echo ""
echo "  STEP 2: Verify it works (in a new terminal)"
echo ""
echo "    curl http://localhost:3002/health"
echo ""
echo "  STEP 3: Connect Claude Code"
echo ""
echo "    If you don't have Claude Code:"
echo "      npm install -g @anthropic-ai/claude-code"
echo ""
echo "    Register the orchestrator:"
echo "      claude mcp add --transport http orchestrator http://localhost:3002/mcp"
echo ""
echo "  STEP 4: Use it"
echo ""
echo "    Start a Claude Code session:"
echo "      claude"
echo ""
echo "    Then try a slash command:"
echo "      /engineering-harness Full engineering loop (build anything)"
echo "      /bugfix-harness     Systematic bug fixing"
echo "      /refactor-harness   Safe refactoring with tests"
echo "      /release-harness    Version, validate, and ship"
echo "      /proposal-harness   Create evidence-backed proposals"
echo "      /incident-harness   Incident response and postmortem"
echo "      /migration-harness  Technology migrations"
echo "      /infra-harness      Infrastructure provisioning"
echo "      /audit-harness      System audit (read-only)"
echo "      /deck-harness       Generate slide decks"
echo "      /meta-harness       Create new loops"
echo ""

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

# --- Done ---

echo ""
echo "Ready! To start:"
echo ""
echo "  cd orchestrator"
echo "  npm start"
echo ""
echo "Then open http://localhost:3002/health"
echo ""

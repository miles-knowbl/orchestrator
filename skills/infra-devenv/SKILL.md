---
name: infra-devenv
description: "Set up local development environment with scripts, devcontainers, and environment variable templates for consistent onboarding."
phase: SCAFFOLD
category: infra
version: "1.0.0"
depends_on: ["scaffold"]
tags: [infrastructure, development, devcontainer, scripts, environment]
---

# Infra Dev Environment

Set up local development environment for consistent onboarding.

## When to Use

- **New project** — Establishing the local dev setup from scratch
- **Onboarding** — Making it easy for new contributors to get started
- **Environment drift** — Standardizing tool versions across the team
- When you say: "set up dev environment", "create devcontainer", "dev setup script"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `dev.sh` or `.devcontainer/` | Project root | Always (one or both) |
| `.env.example` | Project root | When env vars exist |

## Core Concept

Dev environment setup answers: **"How does a new developer go from clone to running in one command?"**

```
Clone → dev.sh (or devcontainer) → All tools installed → App running locally
```

The goal is zero-friction onboarding. A developer should run one command and have everything working.

## Setup Approaches

| Approach | Best For | Tradeoffs |
|----------|----------|-----------|
| **Shell script (dev.sh)** | Simple projects, macOS/Linux | Fast, no Docker needed |
| **Devcontainer** | Complex deps, cross-platform teams | Requires Docker, slower startup |
| **Both** | Open source projects | Maximum compatibility |

## Shell Script Pattern (dev.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "Setting up development environment..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js required. Install via nvm."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required."; exit 1; }

# Install dependencies
npm ci

# Set up environment
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from template — edit with your values"
fi

# Build
npm run build

echo "Development environment ready. Run: npm run dev"
```

## Devcontainer Pattern

```json
{
  "name": "Project Dev",
  "image": "mcr.microsoft.com/devcontainers/typescript-node:20",
  "postCreateCommand": "npm ci && npm run build",
  "customizations": {
    "vscode": {
      "extensions": ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
    }
  },
  "forwardPorts": [3000],
  "features": {
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

## Environment Variables

Always provide a `.env.example` with:
- All required variables listed with placeholder values
- Comments explaining each variable
- Sensitive defaults clearly marked as needing replacement

```bash
# .env.example
DATABASE_URL=postgresql://localhost:5432/myapp_dev
API_KEY=your-api-key-here  # Get from dashboard.example.com
PORT=3000
NODE_ENV=development
```

## Checklist

- [ ] One command to set up from clean clone
- [ ] `.env.example` documents all environment variables
- [ ] Prerequisites checked with clear error messages
- [ ] Tool versions specified (Node, Python, etc.)
- [ ] Database initialization included (if applicable)
- [ ] Port configuration documented

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `scaffold` | Scaffold creates project structure; infra-devenv makes it runnable locally |
| `infra-database` | Database setup may depend on dev environment being configured |
| `infra-docker` | Devcontainers use Docker; coordinate container configurations |
| `document` | Dev setup should be documented in README |

## Key Principles

**One command setup.** `./dev.sh` or "Open in Container" — nothing more.

**Fail fast with clear messages.** Check prerequisites and report what's missing.

**Template secrets, never commit them.** `.env.example` with placeholders, `.env` in `.gitignore`.

**Pin tool versions.** Use `.nvmrc`, `python-version`, or similar for reproducibility.

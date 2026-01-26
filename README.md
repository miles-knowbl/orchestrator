# Orchestrator

A self-improving meta-system for composing AI-driven workflows. Skills are the atomic primitive — everything else (loops, phases, memory, learning) emerges from how skills are collected, composed, and evolved.

## Getting Started

### Prerequisites

1. [Node.js 18+](https://nodejs.org) (includes npm)
2. git — Mac: `xcode-select --install` / Others: [git-scm.com](https://git-scm.com)
3. [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — `npm install -g @anthropic-ai/claude-code`

### Install & Run

```bash
# One-command install
curl -fsSL https://raw.githubusercontent.com/miles-knowbl/orchestrator/main/install.sh | bash

# Start the server
cd orchestrator
npm start
```

The server starts on **http://localhost:3002**. Verify with `curl http://localhost:3002/health`.

### Connect Claude Code

In a new terminal:

```bash
# Register the orchestrator as an MCP server
claude mcp add orchestrator http://localhost:3002/mcp

# Start a session
claude
```

The installer sets up 11 slash commands. Try one:

| Command | What it does |
|---------|-------------|
| `/agentic-harness` | **Full engineering loop** — build anything from scratch or extend existing code |
| `/bugfix-harness` | Systematic bug fixing with reproduction and regression tests |
| `/refactor-harness` | Safe refactoring verified by tests at every step |
| `/release-harness` | Version, validate, document, and ship releases |
| `/proposal-harness` | Create evidence-backed proposals |
| `/incident-harness` | Incident response — triage, fix, deploy, postmortem |
| `/migration-harness` | Technology migrations with rollback safety |
| `/infra-harness` | Infrastructure provisioning (Docker, CI/CD, databases) |
| `/audit-harness` | Read-only system audit with prioritized findings |
| `/deck-harness` | Generate slide decks from context and brand assets |
| `/meta-harness` | Create new loops (the loop that makes loops) |

### Dashboard (optional)

```bash
cd apps/dashboard
cp .env.example .env.local
npm install && npm run dev
```

The dashboard starts on **http://localhost:3003**.

### Docker

```bash
docker pull ghcr.io/miles-knowbl/orchestrator:latest
docker run -p 3002:3002 ghcr.io/miles-knowbl/orchestrator:latest
```

## Architecture

```
orchestrator/
├── src/                    # TypeScript server
│   ├── services/           # SkillRegistry, ExecutionEngine, LoopComposer, MemoryService
│   ├── server/             # Express HTTP + REST API
│   └── tools/              # MCP tool handlers (54+ tools)
├── skills/                 # Skill definitions (SKILL.md per skill)
├── loops/                  # Loop definitions (loop.json + LOOP.md)
├── memory/                 # Persistent learning state
├── apps/
│   └── dashboard/          # Next.js monitoring UI
└── .github/workflows/      # CI/CD (Vercel + Railway + GHCR)
```

### How It Works

```
                    ┌─────────────┐
                    │  Dashboard  │  Next.js (port 3003)
                    │  /skills    │  Reads from REST API
                    │  /loops     │
                    │  /executions│
                    └──────┬──────┘
                           │ REST + SSE
                    ┌──────▼──────┐
                    │ Orchestrator│  Express (port 3002)
                    │  REST API   │  /api/* endpoints
                    │  MCP Server │  /mcp endpoint
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼───┐  ┌────▼───┐  ┌────▼────┐
         │ Skills │  │ Loops  │  │ Memory  │
         │ 60+    │  │ 11     │  │ learning│
         └────────┘  └────────┘  └─────────┘
```

## MCP Integration

Register the orchestrator as an MCP server in Claude Code:

```bash
claude mcp add orchestrator http://localhost:3002/mcp
```

This exposes 54+ tools for managing skills, loops, executions, memory, and inbox.

## Environment Variables

### Server (`.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | No | — | Anthropic API key (only needed for inbox processing) |
| `PORT` | No | `3002` | Server port |
| `HOST` | No | `0.0.0.0` | Server host |
| `API_KEY` | No | — | API key for `/api` and `/mcp` auth |
| `ALLOWED_ORIGINS` | No | `http://localhost:3003` | CORS allowed origins (comma-separated, or `*`) |
| `LOG_LEVEL` | No | `info` | Logging level (`debug`, `info`, `warn`, `error`) |

### Dashboard (`.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3002` | Orchestrator API URL |
| `NEXT_PUBLIC_API_KEY` | No | — | API key (must match server `API_KEY`) |

## Core Concepts

- **Skills**: Versioned instruction units that self-improve through execution feedback
- **Loops**: Sequences of phases composed of skills (e.g., engineering-loop, proposal-loop)
- **Memory**: Hierarchical learning at orchestrator, loop, and skill levels
- **Inbox**: Second brain for capturing and extracting skills from external content

## Development

```bash
npm run dev    # Hot reload (server)
npm run build  # Compile TypeScript
npm test       # Run tests
```

## Live Deployment

- **Dashboard**: [orchestrator-xi.vercel.app](https://orchestrator-xi.vercel.app)
- **API**: Railway (persistent MCP/SSE connections)
- **Docker**: `ghcr.io/miles-knowbl/orchestrator:latest`
- **Releases**: [GitHub Releases](https://github.com/miles-knowbl/orchestrator/releases)

## License

MIT

# Orchestrator

A self-improving meta-system for composing AI-driven workflows. Skills are the atomic primitive — everything else (loops, phases, memory, learning) emerges from how skills are collected, composed, and evolved.

## Getting Started

### Prerequisites

1. [Node.js 18+](https://nodejs.org) (includes npm)
2. git — Mac: `xcode-select --install` / Others: [git-scm.com](https://git-scm.com)
3. [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — `npm install -g @anthropic-ai/claude-code`

### Install

```bash
# Get the start command
curl -sL https://raw.githubusercontent.com/superorganism/orchestrator/main/commands/orchestrator-start-loop.md \
  > ~/.claude/commands/orchestrator-start-loop.md
```

Then in Claude Code:

```
/orchestrator-start-loop
```

That's it. The installer will:
- Clone and build the project
- Configure Claude Code to connect via HTTP
- Install auto-start hooks
- Open a Terminal window with the running server

### Usage

Just use Claude Code normally. When you call any orchestrator tool (or run a loop), the server **starts automatically** in a Terminal window if it's not already running.

**You don't need to:**
- Manually start the server
- Keep a terminal open
- Remember any commands

The Terminal window shows server logs and can be minimized but should stay open.

### Available Commands

| Command | What it does |
|---------|-------------|
| `/orchestrator-start-loop` | Start session, install, or update orchestrator |
| `/engineering-loop` | **Full engineering loop** — build anything from scratch or extend existing code |
| `/bugfix-loop` | Systematic bug fixing with reproduction and regression tests |
| `/distribution-loop` | Distribute to all targets (local, Vercel, GitHub Releases) |
| `/proposal-loop` | Create evidence-backed proposals |
| `/transpose-loop` | Transpose architecture to a new tech stack, produce a feature spec |
| `/infra-loop` | Infrastructure provisioning (CI/CD, databases) |
| `/audit-loop` | Read-only system audit with prioritized findings |
| `/deck-loop` | Generate slide decks from context and brand assets |
| `/meta-loop` | Create new loops (the loop that makes loops) |

### Updating

Run `/orchestrator-start-loop` again. It detects the existing install and updates to the latest version.

### Dashboard (optional)

```bash
cd apps/dashboard
cp .env.example .env.local
npm install && npm run dev
```

The dashboard starts on **http://localhost:3003**.

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
└── .github/workflows/      # CI/CD (Vercel + GitHub Releases)
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
         │ 60+    │  │ 10     │  │ learning│
         └────────┘  └────────┘  └─────────┘
```

### Deployment Topology

| Context | What runs | Purpose |
|---------|-----------|---------|
| **Local** (auto-started) | Orchestrator on port 3002 | Claude Code connects here for slash commands and loops |
| **Vercel** | Next.js dashboard | Read-only monitoring UI at orchestrator-xi.vercel.app |
| **GitHub Releases** | Tarball + SHA256 | Downloadable archive, updated on every push to main |

Local usage is the primary mode. The server starts automatically when you use orchestrator tools.

## MCP Integration

The `/orchestrator-start-loop` command configures MCP automatically by writing to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "orchestrator": {
      "type": "http",
      "url": "http://localhost:3002/mcp"
    }
  }
}
```

This exposes 54+ tools for managing skills, loops, executions, memory, and inbox.

**Auto-start hook:** A Claude Code hook (`~/.claude/hooks/ensure-orchestrator.sh`) automatically opens a terminal and starts the server when any orchestrator tool is called. By default it uses iTerm2 if installed, otherwise Terminal.app.

**Custom terminal:** Set `ORCHESTRATOR_TERMINAL_CMD` in your shell profile to use a different terminal:
```bash
# ~/.zshrc
export ORCHESTRATOR_TERMINAL_CMD='warp -e "cd $ORCHESTRATOR_DIR && npm start"'
```

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

The hosted deployment powers the public dashboard — it is **not** required for local usage.

- **Dashboard**: [orchestrator-xi.vercel.app](https://orchestrator-xi.vercel.app) — read-only monitoring UI (Vercel)
- **Releases**: [GitHub Releases](https://github.com/superorganism/orchestrator/releases) — tarball with SHA256 checksum

## License

MIT

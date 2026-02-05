# Orchestrator

Structured workflows for Claude Code. Instead of giving Claude open-ended instructions, you run **loops** — guided multi-phase processes that produce consistent, high-quality results.

> *A self-improving meta-system for composing AI-driven workflows. Skills are the atomic primitive — everything else emerges from how skills are collected, composed, and evolved.*

**What you can do:**
- `/engineering-loop` — Build a feature from requirements through code review
- `/bugfix-loop` — Diagnose, fix, and verify with regression tests
- `/proposal-loop` — Create evidence-backed proposals with research
- `/audit-loop` — Security and architecture review with prioritized findings

Each loop follows a defined sequence of phases with quality gates, so you get predictable outcomes instead of hoping Claude does the right thing.

## Quick Example

```
You: /engineering-loop

Claude: Starting engineering loop for this project.

        What are we building?

You: Add user authentication with email/password

Claude: [INIT phase]
        Analyzing codebase... Found Express backend, React frontend.

        Requirements:
        - Email/password signup and login
        - Session management
        - Password reset flow

        Ready for SCAFFOLD phase. Proceed?

You: go

Claude: [SCAFFOLD phase]
        Creating architecture...
        - POST /api/auth/signup
        - POST /api/auth/login
        - POST /api/auth/logout
        - POST /api/auth/reset-password

        [continues through IMPLEMENT → TEST → VERIFY → REVIEW → SHIP]
```

The loop ensures you don't skip steps. Each phase has specific goals, and gates prevent moving forward until quality criteria are met.

## Install

### Prerequisites

1. [Node.js 18+](https://nodejs.org)
2. git — Mac: `xcode-select --install` / Others: [git-scm.com](https://git-scm.com)
3. [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — `npm install -g @anthropic-ai/claude-code`

### One-Command Install

```bash
curl -sL https://raw.githubusercontent.com/miles-knowbl/orchestrator/main/commands/orchestrator-start-loop.md \
  > ~/.claude/commands/orchestrator-start-loop.md
```

Then in Claude Code:

```
/orchestrator-start-loop
```

This clones the repo, builds it, and configures Claude Code. A Terminal window opens with the running server.

### After Install

Just use Claude Code normally. The server **starts automatically** when you run any loop. The Terminal window can be minimized but should stay open.

## Available Loops

| Loop | What it does |
|------|-------------|
| `/engineering-loop` | Build features: requirements → architecture → implementation → testing → review |
| `/bugfix-loop` | Fix bugs: reproduce → diagnose → fix → verify → regression test |
| `/distribution-loop` | Ship code: verify → commit → push → deploy to all targets |
| `/proposal-loop` | Write proposals: research → structure → draft → evidence |
| `/audit-loop` | System audit: scan → analyze → prioritize findings (read-only) |
| `/dream-loop` | Define what "done" looks like at any tier of the hierarchy |
| `/learning-loop` | Improve skills: review past work → identify patterns → update skills |
| `/infra-loop` | Setup infrastructure: CI/CD, databases, environments |
| `/deck-loop` | Generate slide decks from context and brand assets |
| `/transpose-loop` | Port to new tech stack: analyze → map → generate spec |
| `/meta-loop` | Create new loops (for building your own workflows) |

## Key Concepts

**Loops** are multi-phase workflows. Each loop has a specific purpose (building, fixing, shipping) and guides you through a proven sequence of steps.

**Phases** are stages within a loop. The engineering loop has: INIT → SCAFFOLD → IMPLEMENT → TEST → VERIFY → VALIDATE → DOCUMENT → REVIEW → SHIP. You can't skip ahead.

**Gates** are checkpoints between phases. They verify that quality criteria are met before proceeding. Some gates are automatic (tests pass), others require approval.

**Skills** are the instructions that power each phase. When you run `/engineering-loop`, it executes skills like `architect`, `implement`, `test-generation`, and `code-review` in sequence. Skills improve over time based on feedback.

## Updating

Run `/orchestrator-start-loop` again. It detects the existing install and updates to the latest version.

## How It Works

The orchestrator runs as a local server (port 3002) that Claude Code connects to via MCP (Model Context Protocol). When you run a loop:

1. Claude Code sends the command to the orchestrator
2. The orchestrator loads the loop definition and starts tracking execution
3. Each phase runs its skills, producing outputs
4. Gates verify quality before phase transitions
5. Progress is logged and can be viewed in the dashboard

```
Claude Code  ←→  Orchestrator Server (localhost:3002)  ←→  Skills + Loops
                         ↓
                    Dashboard (optional, localhost:3003)
```

## Dashboard (optional)

A web UI for viewing skills, loops, and execution history:

```bash
cd apps/dashboard
npm install && npm run dev
```

Opens at **http://localhost:3003**. Also deployed at [orchestrator-xi.vercel.app](https://orchestrator-xi.vercel.app).

## Project Structure

```
orchestrator/
├── src/                    # TypeScript server
│   ├── services/           # SkillRegistry, ExecutionEngine, LoopComposer
│   ├── server/             # Express HTTP + REST API
│   └── tools/              # MCP tool handlers
├── skills/                 # 130+ skill definitions (SKILL.md files)
├── loops/                  # 20 loop definitions (loop.json + LOOP.md)
├── commands/               # Slash command definitions
└── apps/dashboard/         # Next.js monitoring UI
```

## Environment Variables

Most users don't need to set any environment variables. The defaults work for local development.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3002` | Server port |
| `ANTHROPIC_API_KEY` | — | Only needed for inbox processing (optional feature) |
| `API_KEY` | — | Optional auth for API endpoints |

## Troubleshooting

### Server won't start

```bash
# Check if something else is using port 3002
lsof -ti:3002 | xargs kill -9

# Verify the install path is correct
cat ~/.claude/orchestrator.json
```

### MCP not connecting

```bash
# Verify the config exists
cat ~/.claude/mcp.json
# Should show: "orchestrator": { "type": "http", "url": "http://localhost:3002/mcp" }

# Verify server is running
curl http://localhost:3002/health
```

### Need to reinstall

Delete the config and run the installer again:

```bash
rm ~/.claude/orchestrator.json
# Then run /orchestrator-start-loop in Claude Code
```

## Deep Dive: How the System Works

This section is for those who want to understand the internals, customize behavior, or contribute.

### Skills Are Files

Every skill is a markdown file (`SKILL.md`) in the `skills/` directory:

```
skills/
├── implement/
│   ├── SKILL.md           # The skill definition
│   ├── CHANGELOG.md       # Version history
│   └── references/        # Supporting docs the skill can reference
│       ├── api-layer-patterns.md
│       └── testing-patterns.md
├── architect/
│   └── SKILL.md
└── code-review/
    └── SKILL.md
```

A skill file contains:
- **Purpose**: What this skill accomplishes
- **Inputs**: What context it needs
- **Process**: Step-by-step instructions for Claude
- **Outputs**: What it produces (files, decisions, etc.)
- **Guarantees**: Quality criteria that must be met

When a phase executes a skill, Claude receives the skill's instructions as part of its prompt. The skill tells Claude exactly how to approach the task.

### Loops Are Compositions

A loop is defined by two files:
- `loop.json` — Machine-readable: phases, skills per phase, gates
- `LOOP.md` — Human-readable: documentation and examples

```json
// loops/engineering-loop/loop.json
{
  "id": "engineering-loop",
  "phases": [
    { "id": "INIT", "skills": ["requirements", "spec"] },
    { "id": "SCAFFOLD", "skills": ["architect", "scaffold"] },
    { "id": "IMPLEMENT", "skills": ["implement"] },
    { "id": "TEST", "skills": ["test-generation"] },
    { "id": "VERIFY", "skills": ["code-verification"] },
    { "id": "REVIEW", "skills": ["code-review"] },
    { "id": "SHIP", "skills": ["deploy", "distribute"] }
  ],
  "gates": [
    { "after": "TEST", "type": "auto", "criteria": "tests_pass" },
    { "after": "REVIEW", "type": "approval", "approver": "user" }
  ]
}
```

The orchestrator reads this definition and steps through it, loading each skill's instructions when its phase is active.

### Execution Tracking

When you run a loop, the ExecutionEngine creates an execution record:

```json
{
  "id": "exec_abc123",
  "loopId": "engineering-loop",
  "status": "active",
  "currentPhase": "IMPLEMENT",
  "completedPhases": ["INIT", "SCAFFOLD"],
  "gateResults": [
    { "gate": "scaffold-gate", "status": "passed", "timestamp": "..." }
  ],
  "log": [
    { "type": "phase_start", "phase": "INIT", "timestamp": "..." },
    { "type": "skill_complete", "skill": "requirements", "timestamp": "..." }
  ]
}
```

This is how the system knows where you are in a loop, enables resuming after interruption, and provides the data for the dashboard.

### The MCP Bridge

Claude Code communicates with the orchestrator via MCP (Model Context Protocol). The orchestrator exposes 50+ tools:

| Category | Tools |
|----------|-------|
| Execution | `start_execution`, `advance_phase`, `complete_skill`, `approve_gate` |
| Skills | `list_skills`, `get_skill`, `search_skills` |
| Loops | `list_loops`, `get_loop`, `validate_loop` |
| Memory | `get_memory`, `record_pattern`, `record_decision` |

When Claude runs `/engineering-loop`, it calls `start_execution`. As it works through phases, it calls `complete_skill` and `advance_phase`. The orchestrator tracks everything.

### Memory and Learning

The system maintains memory at three levels:

```
memory/
├── orchestrator.json    # Global patterns and decisions
├── loops/
│   └── engineering-loop.json   # Loop-specific learnings
└── skills/
    └── implement.json   # Skill-specific calibration
```

**Patterns** are reusable insights: "When working with React, always check for useEffect cleanup."

**Decisions** are architectural records (ADRs): "Chose PostgreSQL over MongoDB because..."

**Calibration** tracks estimation accuracy: "implement skill typically takes 1.5x estimated time for new codebases."

When you run `improve: [feedback]`, it creates an improvement proposal that can update skill instructions.

### Skill Evolution

Skills improve through feedback loops:

1. **Execution** — Skill runs, produces output
2. **Observation** — Quality metrics captured (did tests pass? was review approved?)
3. **Feedback** — User provides `improve:` comments
4. **Proposal** — System generates upgrade proposal
5. **Application** — Approved changes update the skill file
6. **Versioning** — Skill version increments, changelog updated

This is the "self-improving" aspect. Skills that consistently produce good results stay stable. Skills that get friction feedback evolve.

### Creating Custom Loops

Use `/meta-loop` to create new loops, or manually:

1. Create `loops/my-loop/loop.json` with phases and skills
2. Create `loops/my-loop/LOOP.md` with documentation
3. Create `commands/my-loop.md` as the slash command
4. The orchestrator picks it up automatically on restart

You can compose existing skills in new ways, or create new skills for domain-specific workflows.

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP Server (Express)                    │
│  /mcp — MCP protocol    /api/* — REST endpoints             │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      Core Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │SkillRegistry │  │ LoopComposer │  │ExecutionEngine│       │
│  │ loads skills │  │ loads loops  │  │ runs loops    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │MemoryService │  │LearningService│ │AnalyticsService│      │
│  │ patterns/ADRs│  │ improvements │  │ metrics      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                     File System                              │
│  skills/    loops/    memory/    data/                      │
└─────────────────────────────────────────────────────────────┘
```

All state lives in files. No database required. This makes it easy to version control your customizations and share configurations.

## Development

```bash
npm run dev       # Hot reload server
npm run build     # Compile TypeScript
npm test -- --run # Run tests
```

## License

MIT

# Orchestrator

A self-improving meta-system for composing AI-driven workflows. Skills are the atomic primitive - everything else (loops, phases, memory, learning) emerges from how skills are collected, composed, and evolved.

## Core Concepts

- **Skills**: Versioned instruction units that self-improve through execution feedback
- **Loops**: Sequences of phases composed of skills (e.g., engineering-loop, proposal-loop)
- **Memory**: Hierarchical learning at orchestrator, loop, and skill levels
- **Loop Apps**: Generated UI applications from loop definitions

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run MCP server
npm start

# Development mode with hot reload
npm run dev
```

## MCP Integration

Register with Claude Code:

```bash
claude mcp add orchestrator http://localhost:3000/mcp
```

## Architecture

```
orchestrator/
├── src/
│   ├── core/           # Domain entities (Skill, Loop, Memory)
│   ├── services/       # Business logic
│   ├── tools/          # MCP tool handlers
│   └── storage/        # Persistence (Git + JSON)
├── skills/             # Skill definitions (SKILL.md)
├── loops/              # Loop definitions (loop.json)
├── memory/             # Persistent learning
└── generator/          # Loop App generator
```

## Key Features

1. **Skill Versioning**: Semantic versions with Git storage
2. **Self-Improvement**: Skills learn from execution diffs and explicit feedback
3. **Loop Composition**: Build loops from skills via NL, DSL, or interactive composer
4. **App Generation**: Generate Next.js apps from loop definitions
5. **Hierarchical Memory**: Learning compounds at all levels

## License

MIT

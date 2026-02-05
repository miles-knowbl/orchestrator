---
name: infra-monorepo
description: "Configure monorepo tooling with workspace management, task orchestration, and build caching for multi-package projects."
phase: IMPLEMENT
category: engineering
version: "1.0.0"
depends_on: ["scaffold"]
tags: [infrastructure, monorepo, turbo, workspace, build-system]
---

# Infra Monorepo

Configure monorepo tooling for multi-package projects.

## When to Use

- **Multi-package project** — Shared code across multiple apps or libraries
- **Monorepo migration** — Moving from multi-repo to monorepo
- **Build optimization** — Adding caching and incremental builds
- When you say: "set up monorepo", "workspace config", "turborepo"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Workspace config | `package.json` or `pnpm-workspace.yaml` | Always |
| Task config | `turbo.json` | When using Turborepo |
| Package structure | `packages/` and/or `apps/` | Always |

## Core Concept

Monorepo setup answers: **"How do multiple packages share code, dependencies, and build infrastructure?"**

```
Root Config → Workspace Packages → Shared Dependencies → Cached Builds → Coordinated Publishing
```

## Tool Selection

| Tool | Best For | Package Manager |
|------|----------|-----------------|
| **Turborepo** | Task caching, incremental builds | npm/pnpm/yarn |
| **pnpm workspaces** | Dependency management, disk efficiency | pnpm |
| **npm workspaces** | Simple monorepos, no extra tools | npm |
| **Nx** | Enterprise, generators, plugins | npm/pnpm/yarn |

## Turborepo Setup

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Workspace Structure

```
monorepo/
├── package.json          # Root with workspaces
├── turbo.json            # Task configuration
├── apps/
│   ├── web/              # Next.js app
│   │   └── package.json
│   └── api/              # Express server
│       └── package.json
├── packages/
│   ├── shared/           # Shared utilities
│   │   └── package.json
│   └── config/           # Shared config (tsconfig, eslint)
│       └── package.json
└── pnpm-workspace.yaml   # If using pnpm
```

## pnpm Workspace Config

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Cross-Package Dependencies

```json
// apps/web/package.json
{
  "dependencies": {
    "@monorepo/shared": "workspace:*"
  }
}
```

## Checklist

- [ ] Workspace configuration in root package.json
- [ ] Task runner configured (turbo.json or scripts)
- [ ] Shared packages in packages/ directory
- [ ] Apps in apps/ directory
- [ ] Cross-package dependencies use workspace protocol
- [ ] Build caching enabled

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `scaffold` | Scaffold creates the directory structure; monorepo adds workspace tooling |
| `infra-docker` | Each app may have its own Dockerfile |
| `distribute` | CI/CD may need to build affected packages only |
| `test-generation` | Tests run per-package with shared configuration |

## Key Principles

**Share code, not coupling.** Packages should have clear boundaries and APIs.

**Cache everything.** Turborepo caching avoids rebuilding unchanged packages.

**Workspace protocol.** Use `workspace:*` for internal dependencies, never published versions.

**Incremental builds.** Only rebuild what changed; task graphs express dependencies.

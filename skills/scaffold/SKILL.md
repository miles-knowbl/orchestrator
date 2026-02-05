---
name: scaffold
description: "Generate project and feature scaffolding with proper structure, configuration, and boilerplate. Creates new projects from scratch or adds features to existing codebases. Applies stack-specific conventions, tooling setup, and best practices. Produces ready-to-develop foundations that follow team standards."
phase: SCAFFOLD
category: engineering
version: "1.0.0"
depends_on: ["spec"]
tags: [setup, structure, boilerplate]
---

# Scaffold

Generate project and feature scaffolding with proper structure.

## When to Use

- **New project** — Starting from scratch, need full setup
- **New feature** — Adding feature to existing codebase
- **New service** — Adding service to existing system
- **Migration** — Moving to new structure or stack
- When you say: "scaffold this", "set up a new project", "create the structure for"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `directory-structures.md` | Standard project layouts |
| `configuration-templates.md` | Config file templates |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `project-templates.md` | When creating new projects |
| `service-templates.md` | When adding services |
| `documentation-templates.md` | When setting up docs structure |

**Verification:** Ensure scaffold builds and runs before proceeding.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Project directory structure | Project root | Always |
| `package.json` or equivalent | Project root | Always |
| `tsconfig.json` / config files | Project root | As applicable |
| `README.md` | Project root | Always (initial) |

## Core Concept

Scaffold answers: **"What's the starting structure for this?"**

Good scaffolding is:
- **Consistent** — Follows established patterns and conventions
- **Complete** — Includes all necessary configuration
- **Minimal** — No unnecessary boilerplate
- **Ready** — Can start development immediately

Scaffolding is NOT:
- Implementation (that's `implement`)
- Architecture design (that's `architect`)
- Code generation for business logic

## Scaffolding Types

| Type | Scope | Output |
|------|-------|--------|
| **Project** | Entire new project | Full directory structure, config, tooling |
| **Feature** | New feature in existing project | Feature directory, components, tests |
| **Service** | New service in system | Service boilerplate, API, deployment |
| **Module** | New module/package | Module structure, exports, tests |
| **Component** | UI component | Component file(s), styles, tests |

## The Scaffolding Process

```
┌─────────────────────────────────────────────────────────┐
│                 SCAFFOLDING PROCESS                     │
│                                                         │
│  1. UNDERSTAND CONTEXT                                  │
│     └─→ What type? What stack? What conventions?        │
│                                                         │
│  2. IDENTIFY REQUIREMENTS                               │
│     └─→ What's needed? What integrations? What tools?   │
│                                                         │
│  3. SELECT TEMPLATE                                     │
│     └─→ Use existing template or create custom?         │
│                                                         │
│  4. CUSTOMIZE CONFIGURATION                             │
│     └─→ Adapt template to specific needs                │
│                                                         │
│  5. GENERATE STRUCTURE                                  │
│     └─→ Create directories, files, boilerplate          │
│                                                         │
│  6. VERIFY SETUP                                        │
│     └─→ Does it build? Does it run? Are tools working?  │
│                                                         │
│  7. DOCUMENT                                            │
│     └─→ README, setup instructions, conventions         │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Understand Context

Before scaffolding, gather:

| Aspect | Questions |
|--------|-----------|
| **Type** | Project, feature, service, module, component? |
| **Stack** | Languages, frameworks, tools? |
| **Conventions** | Existing patterns? Team standards? |
| **Environment** | Dev, staging, prod? Cloud provider? |
| **Team** | Experience level? Preferred tools? |

### Context Checklist

```markdown
- [ ] Scaffolding type identified
- [ ] Technology stack confirmed
- [ ] Existing conventions documented
- [ ] Target environment understood
- [ ] Team preferences known
```

## Step 2: Identify Requirements

### Project Requirements

```markdown
## Project Scaffolding Requirements

**Core:**
- [ ] Language/runtime version
- [ ] Framework and version
- [ ] Package manager
- [ ] Build tooling

**Development:**
- [ ] Linting configuration
- [ ] Formatting configuration
- [ ] Testing framework
- [ ] Development server

**Infrastructure:**
- [ ] Docker/containerization
- [ ] CI/CD pipeline
- [ ] Deployment configuration
- [ ] Environment management

**Integrations:**
- [ ] Database
- [ ] Authentication
- [ ] External APIs
- [ ] Monitoring/logging
```

### Feature Requirements

```markdown
## Feature Scaffolding Requirements

- [ ] Feature name and location
- [ ] Components needed (UI, API, data)
- [ ] Test files needed
- [ ] Shared dependencies
- [ ] Routing/navigation integration
```

## Step 3: Select Template

### Template Decision

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Existing project with conventions?                     │
│           │                                             │
│           ├── YES → Follow existing patterns            │
│           │                                             │
│           └── NO → Standard template exists?            │
│                        │                                │
│                        ├── YES → Use standard template  │
│                        │                                │
│                        └── NO → Create minimal custom   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Standard Templates

| Stack | Template Source | Notes |
|-------|-----------------|-------|
| React | Create React App, Vite, Next.js | Vite preferred for new projects |
| Vue | create-vue, Nuxt | |
| Node.js | Express generator, Fastify CLI | |
| Python | Poetry new, Cookiecutter | |
| Django | django-admin startproject | |
| Go | Standard layout, go mod init | |
| Rust | cargo new | |

→ See `references/project-templates.md`

## Brownfield Project Handling

**CRITICAL: Before scaffolding, detect existing project setup.**

### Detection Checklist

Run these checks before generating any files:

| Check | Files to Look For | If Found |
|-------|-------------------|----------|
| Package manager | `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `bun.lockb` | Use detected package manager |
| Framework | `next.config.*`, `nuxt.config.*`, `svelte.config.*`, `vite.config.*`, `elm.json`, `angular.json` | Follow framework conventions |
| Backend | `manage.py`, `go.mod`, `Cargo.toml`, `requirements.txt`, `pyproject.toml` | Follow backend patterns |
| Directory structure | `src/`, `lib/`, `app/`, `packages/` | Follow existing structure |
| Config files | `tsconfig.json`, `.eslintrc.*`, `.prettierrc` | Extend, don't replace |
| Test framework | `jest.config.*`, `vitest.config.*`, `pytest.ini` | Use existing test setup |
| Build tooling | `vite.config.*`, `webpack.config.*`, `turbo.json` | Use existing bundler |
| Database | `prisma/`, `drizzle.config.*`, `migrations/`, `alembic/` | See infra-database skill |
| Docker | `docker-compose.yml`, `Dockerfile` | See infra-docker skill |

### If Existing Project Found

| Scenario | Action |
|----------|--------|
| Adding feature to existing project | Follow existing patterns exactly |
| Has different tech than requested | Clarify with user: extend existing or migrate? |
| Has partial setup | Complete setup without replacing existing config |
| Converting structure | Gradual migration, preserve functionality first |
| Has Makefile or scripts/dev.sh | Preserve/wrap existing interfaces |

### Universal Package Manager Detection

```bash
detect_package_manager() {
    [ -f "pnpm-lock.yaml" ] && echo "pnpm" && return
    [ -f "yarn.lock" ] && echo "yarn" && return
    [ -f "bun.lockb" ] && echo "bun" && return
    [ -f "package-lock.json" ] && echo "npm" && return
    [ -f "package.json" ] && echo "npm" && return
    [ -f "poetry.lock" ] && echo "poetry" && return
    [ -f "Pipfile.lock" ] && echo "pipenv" && return
    [ -f "go.mod" ] && echo "go" && return
    [ -f "Cargo.toml" ] && echo "cargo" && return
    [ -f "Gemfile.lock" ] && echo "bundler" && return
    echo "unknown"
}
```

### Brownfield Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Does project have existing package.json / pyproject.toml / go.mod?         │
│           │                                                                 │
│           ├── YES → Does it have existing directory structure?              │
│           │              │                                                  │
│           │              ├── YES → BROWNFIELD: Follow existing patterns     │
│           │              │                                                  │
│           │              └── NO → PARTIAL: Complete setup carefully         │
│           │                                                                 │
│           └── NO → GREENFIELD: Use standard templates                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Step 4: Customize Configuration

### Configuration Layers

```
┌─────────────────────────────────────────┐
│            Application Config           │  ← app.config.ts, settings.py
├─────────────────────────────────────────┤
│            Build/Bundle Config          │  ← vite.config.ts, webpack.config.js
├─────────────────────────────────────────┤
│            Tooling Config               │  ← eslint, prettier, jest
├─────────────────────────────────────────┤
│            Environment Config           │  ← .env, docker-compose
├─────────────────────────────────────────┤
│            Infrastructure Config        │  ← Dockerfile, k8s, terraform
└─────────────────────────────────────────┘
```

### Essential Configuration Files

| Category | Files | Purpose |
|----------|-------|---------|
| **Package** | package.json, pyproject.toml, go.mod | Dependencies |
| **TypeScript** | tsconfig.json | Compiler options |
| **Linting** | .eslintrc, .pylintrc, .golangci.yml | Code quality |
| **Formatting** | .prettierrc, .editorconfig | Code style |
| **Testing** | jest.config.js, pytest.ini | Test runner |
| **Git** | .gitignore, .gitattributes | Version control |
| **Environment** | .env.example, .env.local | Env variables |
| **Docker** | Dockerfile, docker-compose.yml | Containerization |
| **CI/CD** | .github/workflows/, .gitlab-ci.yml | Automation |

→ See `references/configuration-templates.md`

## Step 5: Generate Structure

### Project Structure Principles

| Principle | Description |
|-----------|-------------|
| **Flat over nested** | Avoid deep nesting (max 3-4 levels) |
| **Feature-based** | Group by feature, not by type |
| **Predictable** | Consistent naming, obvious locations |
| **Scalable** | Structure that works at 10x size |

### Common Structures

#### Frontend (React/Vue)

```
project/
├── src/
│   ├── components/          # Shared components
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   ├── features/            # Feature modules
│   │   └── auth/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api.ts
│   │       └── index.ts
│   ├── hooks/               # Shared hooks
│   ├── lib/                 # Utilities
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── public/
├── tests/
│   ├── e2e/
│   └── integration/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

#### Backend (Node.js/Express)

```
project/
├── src/
│   ├── modules/             # Feature modules
│   │   └── users/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       ├── users.repository.ts
│   │       ├── users.routes.ts
│   │       ├── users.types.ts
│   │       └── users.test.ts
│   ├── common/              # Shared code
│   │   ├── middleware/
│   │   ├── errors/
│   │   └── utils/
│   ├── config/              # Configuration
│   ├── database/            # DB setup, migrations
│   ├── app.ts               # Express app setup
│   └── server.ts            # Entry point
├── tests/
│   ├── integration/
│   └── fixtures/
├── scripts/
├── .env.example
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

#### Backend (Python/Django)

```
project/
├── src/
│   └── project_name/
│       ├── apps/
│       │   └── users/
│       │       ├── models.py
│       │       ├── views.py
│       │       ├── serializers.py
│       │       ├── urls.py
│       │       └── tests/
│       ├── core/            # Shared code
│       ├── settings/
│       │   ├── base.py
│       │   ├── development.py
│       │   └── production.py
│       ├── urls.py
│       └── wsgi.py
├── tests/
├── scripts/
├── pyproject.toml
├── Dockerfile
└── README.md
```

→ See `references/directory-structures.md`

## Step 6: Verify Setup

### Verification Checklist

```markdown
## Scaffolding Verification

### Build
- [ ] Dependencies install without errors
- [ ] Project builds/compiles successfully
- [ ] No TypeScript/type errors
- [ ] Linting passes

### Run
- [ ] Development server starts
- [ ] Application renders/responds
- [ ] Hot reload works
- [ ] Environment variables load

### Test
- [ ] Test runner executes
- [ ] Sample tests pass
- [ ] Coverage reporting works

### Tools
- [ ] Linting works (IDE and CLI)
- [ ] Formatting works
- [ ] Git hooks run (if configured)
- [ ] CI pipeline runs (if configured)
```

### Smoke Test Commands

```bash
# Install dependencies
npm install  # or yarn, pnpm, pip install, go mod download

# Build
npm run build  # or equivalent

# Lint
npm run lint

# Test
npm run test

# Start dev server
npm run dev
```

## Step 7: Document

### README Template

```markdown
# Project Name

Brief description of what this project does.

## Prerequisites

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+

## Getting Started

1. Clone the repository
2. Copy environment file: `cp .env.example .env`
3. Install dependencies: `pnpm install`
4. Start database: `docker-compose up -d db`
5. Run migrations: `pnpm db:migrate`
6. Start dev server: `pnpm dev`

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server |
| `build` | Build for production |
| `test` | Run tests |
| `lint` | Run linter |
| `format` | Format code |

## Project Structure

[Brief explanation of directory structure]

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `API_KEY` | External API key | Yes |

## Deployment

[Deployment instructions]

## Contributing

[Contribution guidelines]
```

→ See `references/documentation-templates.md`

## Feature Scaffolding

### Feature Structure

When adding a feature to existing project:

```
src/features/[feature-name]/
├── components/              # Feature-specific components
│   └── FeatureComponent.tsx
├── hooks/                   # Feature-specific hooks
│   └── useFeature.ts
├── api/                     # API calls
│   └── featureApi.ts
├── types/                   # Type definitions
│   └── feature.types.ts
├── utils/                   # Utilities
│   └── featureUtils.ts
├── __tests__/               # Tests
│   └── Feature.test.tsx
└── index.ts                 # Public exports
```

### Feature Checklist

```markdown
## Feature Scaffolding Checklist

### Structure
- [ ] Feature directory created
- [ ] Components directory (if UI)
- [ ] Hooks directory (if needed)
- [ ] API module (if backend calls)
- [ ] Types file
- [ ] Test files
- [ ] Index file with exports

### Integration
- [ ] Route added (if needed)
- [ ] Navigation updated (if needed)
- [ ] State management connected (if needed)
- [ ] API endpoints defined

### Boilerplate
- [ ] Component skeleton
- [ ] Hook skeleton
- [ ] Test skeleton
- [ ] Type definitions
```

## Service Scaffolding

### Microservice Structure

```
service-name/
├── src/
│   ├── handlers/            # Request handlers
│   ├── services/            # Business logic
│   ├── repositories/        # Data access
│   ├── models/              # Data models
│   ├── middleware/          # Middleware
│   ├── config/              # Configuration
│   └── index.ts             # Entry point
├── tests/
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

### Service Checklist

```markdown
## Service Scaffolding Checklist

### Core
- [ ] Entry point configured
- [ ] HTTP server setup
- [ ] Health check endpoint
- [ ] Graceful shutdown

### Configuration
- [ ] Environment variables
- [ ] Config validation
- [ ] Secrets management

### Infrastructure
- [ ] Dockerfile
- [ ] Docker Compose (dev)
- [ ] Kubernetes manifests (if needed)

### Observability
- [ ] Logging setup
- [ ] Metrics endpoint
- [ ] Tracing setup (if needed)

### CI/CD
- [ ] Build workflow
- [ ] Test workflow
- [ ] Deploy workflow
```

→ See `references/service-templates.md`

## Stack-Specific Guidance

### TypeScript/Node.js

```json
// tsconfig.json essentials
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Python

```toml
# pyproject.toml essentials
[project]
name = "project-name"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "ruff>=0.1",
    "mypy>=1.0",
]

[tool.ruff]
line-length = 88
select = ["E", "F", "I"]

[tool.mypy]
strict = true
```

### Go

```go
// Standard project layout
project/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handlers/
│   ├── services/
│   └── models/
├── pkg/                     # Public packages
├── go.mod
├── go.sum
└── Makefile
```

→ See `references/stack-configurations.md`

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Over-scaffolding** | Too many empty directories | Only create what you need now |
| **Wrong abstraction level** | Premature service extraction | Start simple, extract when needed |
| **Inconsistent naming** | Mixed conventions | Establish and follow naming rules |
| **Missing configuration** | Works locally, fails in CI | Include all config files |
| **No verification** | Scaffold doesn't build | Always verify setup works |

## Output Checklist

Before considering scaffolding complete:

```markdown
## Scaffolding Completion Checklist

### Structure
- [ ] All necessary directories created
- [ ] Entry points configured
- [ ] Exports properly defined

### Configuration
- [ ] Package manager configured
- [ ] Build tooling configured
- [ ] Linting configured
- [ ] Formatting configured
- [ ] Testing configured
- [ ] Environment management set up

### Verification
- [ ] Dependencies install
- [ ] Project builds
- [ ] Tests run
- [ ] Dev server starts
- [ ] Linting passes

### Documentation
- [ ] README with setup instructions
- [ ] Environment variables documented
- [ ] Scripts documented
- [ ] Structure explained
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architect` | Architecture informs scaffold structure |
| `frontend-design` | (Frontend systems) DESIGN.md informs component directory structure |
| `spec` | Spec may define required components to scaffold |
| `implement` | Scaffold provides foundation for implementation |
| `code-verification` | Scaffold should pass verification from start |

## Key Principles

**Start minimal.** Add structure as needed, not preemptively.

**Follow conventions.** Use established patterns for the stack.

**Verify immediately.** A scaffold that doesn't build is useless.

**Document setup.** Others need to know how to get started.

**Consistency over novelty.** Match existing project patterns when adding features.

## References

- `references/project-templates.md`: Full project templates by stack
- `references/directory-structures.md`: Directory layout patterns
- `references/configuration-templates.md`: Config file templates
- `references/service-templates.md`: Microservice scaffolding
- `references/documentation-templates.md`: README and doc templates
- `references/stack-configurations.md`: Stack-specific setup guides

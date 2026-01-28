---
name: distribute
description: "Set up CI/CD distribution pipelines for automated releases. Creates GitHub Actions workflows, configures platform deployment (Vercel or Railway), produces tarball releases with SHA256 checksums, and optionally publishes Docker images to GHCR."
phase: SHIP
category: core
version: "1.0.0"
depends_on: ["code-review"]
tags: [shipping, ci-cd, release, distribution, core-workflow]
---

# Distribute

Set up automated distribution pipelines.

## When to Use

- **New project ready to ship** — Set up the CI/CD pipeline from scratch
- **Adding platform deployment** — Connect Vercel or Railway to an existing repo
- **Release automation** — Create tarball releases with checksums
- **Docker publishing** — Publish container images to GHCR
- When you say: "set up distribution", "create release pipeline", "deploy to Vercel", "automate releases"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `github-actions-workflow.md` | Complete workflow template with all four pipeline stages |
| `platform-selection.md` | Decision tree for choosing Vercel vs Railway |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `tarball-release.md` | When customizing release artifacts or adding tagged releases |

**Verification:** Ensure `.github/workflows/distribute.yml` exists and is valid YAML.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `.github/workflows/distribute.yml` | Project root | Always |
| GitHub Release (rolling "latest") | GitHub | Always |
| Platform configuration | `.vercel/` or `railway.toml` | When platform selected |

## Core Concept

Distribution answers: **"How does code automatically get from main branch to users?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DISTRIBUTION PIPELINE                                    │
│                                                                             │
│  Push to Main                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  GitHub Actions (distribute.yml)                                            │
│       │                                                                     │
│       ├──► Test Gate                                                        │
│       │      └─ npm test (must pass to continue)                            │
│       │                                                                     │
│       ├──► Platform Deploy                                                  │
│       │      ├─ Vercel (web apps: Next.js, static, SSR)                     │
│       │      └─ Railway (persistent: MCP, SSE, WebSocket)                   │
│       │                                                                     │
│       ├──► Tarball Release                                                  │
│       │      └─ Rolling "latest" + SHA256 checksum                          │
│       │                                                                     │
│       └──► Docker Image (if Dockerfile exists)                              │
│              └─ ghcr.io/{org}/{repo}:latest                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Distribution is **not** production deployment strategy — that's the `deploy` skill. Distribution automates the pipeline that triggers deployment. Deploy defines *what* happens; distribute defines *how* it gets triggered.

## Platform Selection

| Workload | Platform | Why |
|----------|----------|-----|
| Static site, Next.js, SSR | **Vercel** | Edge-optimized, zero config |
| Full-stack with Postgres | **Vercel + Neon** | Serverless DB, preview branches |
| MCP server, SSE, WebSocket | **Railway** | Persistent connections |
| Long-running process (>60s) | **Railway** | No serverless timeout |
| API with Dockerfile | **Railway** | Container-native |

> See `references/platform-selection.md`

## The Distribution Process

### Step 1: Detect Workload Type

Analyze the project to determine the right platform:

```
package.json → "next" in dependencies?     → Vercel
package.json → SSE or WebSocket server?     → Railway
Dockerfile exists?                          → Railway (or GHCR-only)
Static HTML/CSS?                            → Vercel
pyproject.toml / Cargo.toml?                → Railway
```

### Step 2: Create GitHub Repository

If the project doesn't have a remote yet:

```bash
# Create repo (public or private)
gh repo create {name} --source=. --push

# Or if repo exists but no remote
git remote add origin https://github.com/{org}/{name}.git
git push -u origin main
```

### Step 3: Generate Workflow

Create `.github/workflows/distribute.yml` using the template from `references/github-actions-workflow.md`. The workflow includes four jobs:

1. **test** — Runs test suite as a quality gate
2. **deploy-vercel** or **deploy-railway** — Platform deployment (conditional)
3. **release** — Tarball with SHA256 checksum (always)
4. **docker** — GHCR image (conditional on Dockerfile)

### Step 4: Configure Platform

**For Vercel:**

```bash
vercel link
gh secret set VERCEL_TOKEN --body "$(vercel whoami --token)"
gh secret set VERCEL_ORG_ID --body "team_xxx"   # from .vercel/project.json
gh secret set VERCEL_PROJECT_ID --body "prj_xxx" # from .vercel/project.json
```

**For Railway:**

```bash
railway link
gh secret set RAILWAY_TOKEN --body "your-token"
```

### Step 5: Create Initial Release

Push to main to trigger the first automated release:

```bash
git add .github/workflows/distribute.yml
git commit -m "Add distribution pipeline"
git push origin main
```

The workflow creates a rolling "latest" release with:
- Tarball (`{repo}-v{version}.tar.gz`)
- Checksum (`checksums.txt`)

### Step 6: Verify Pipeline

```bash
# Check workflow ran
gh run list --limit 1

# Check release exists
gh release view latest

# Check platform deployment (Vercel)
vercel ls --prod

# Check platform deployment (Railway)
railway status
```

## Tarball Release Pattern

The distribution pipeline uses a **rolling "latest" release** — a single GitHub release that gets updated on every push to main.

| Pattern | Behavior |
|---------|----------|
| Rolling "latest" | Single release, always current, no clutter |
| Stack-agnostic versioning | Detects from package.json, Cargo.toml, pyproject.toml, or VERSION |
| SHA256 checksum | Always included for verification |
| Graceful skip | Platform deploy skips if secrets not configured |
| Docker to GHCR | If Dockerfile exists, publishes `ghcr.io/{org}/{repo}:latest` |

> See `references/tarball-release.md`

## Distribution Verification Checklist

```markdown
## Distribution Verification

### Pipeline
- [ ] `.github/workflows/distribute.yml` exists
- [ ] Workflow YAML is valid
- [ ] Test job runs project test suite
- [ ] Workflow triggers on push to main

### Platform
- [ ] Platform selected (Vercel or Railway)
- [ ] Platform linked to project
- [ ] GitHub secrets configured
- [ ] Platform deployment succeeds

### Release
- [ ] Tarball created with correct version
- [ ] SHA256 checksum generated
- [ ] Rolling "latest" release created on GitHub
- [ ] Previous "latest" release replaced (not accumulated)

### Docker (if applicable)
- [ ] Dockerfile exists and builds
- [ ] Image pushed to ghcr.io
- [ ] Image tagged as latest
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `deploy` | Deploy handles production strategy (blue-green, canary, rollback); distribute handles CI/CD pipeline automation |
| `git-workflow` | Merge to main triggers the distribute pipeline |
| `code-review` | PR approval precedes distribution setup |
| `scaffold` | Scaffold may create initial project structure; distribute adds CI/CD on top |
| `security-audit` | Audit may flag secrets management or pipeline security |

## Slash Command

The `distribute` **skill** sets up the CI/CD pipeline — it is used during the SHIP phase of the engineering-loop or distribution-loop.

The `/distribution-loop` **command** runs the full distribution workflow: assess changes, verify readiness, commit/push, and confirm all targets received the update. Use the command when you want to distribute; use the skill when you want to configure the pipeline.

## Key Principles

**Automate the path from merge to production.** No manual steps between PR merge and deployment.

**Rolling releases avoid clutter.** A single "latest" release stays current without accumulating stale versions.

**Stack-agnostic versioning.** Detect version from whatever config file the project uses.

**Graceful degradation.** Pipeline steps skip when their secrets or prerequisites are missing — no failures for optional features.

**Every project deserves a release pipeline.** Even internal tools benefit from automated distribution.

## Mode-Specific Behavior

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full pipeline setup from scratch |
| **Approach** | Create repo, workflow, platform config, initial release |
| **Platform** | Free choice based on workload detection |
| **Deliverables** | `.github/workflows/distribute.yml`, platform config, initial release |
| **Verification** | Full pipeline runs end-to-end |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Add distribution to existing project |
| **Approach** | Extend existing CI/CD if present, don't replace |
| **Platform** | Match existing deployment patterns |
| **Deliverables** | New or updated workflow, platform config |
| **Verification** | Existing CI/CD still works, new pipeline runs |

**Polish considerations:**
- [ ] Existing CI/CD workflows preserved
- [ ] New workflow doesn't conflict with existing ones
- [ ] Platform choice matches existing deployment
- [ ] Secrets don't collide with existing ones

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Minimal additions conforming to existing standards |
| **Approach** | Follow existing CI/CD patterns exactly |
| **Platform** | Must use organization-approved platforms |
| **Deliverables** | Workflow conforming to org standards |
| **Verification** | Passes org CI/CD policy checks |

**Enterprise requirements:**
- Workflow must follow organization template
- Platform must be on approved list
- Secrets must go through org secret management
- Docker images must use org-approved base images

---

## References

- `references/github-actions-workflow.md`: Complete workflow template
- `references/platform-selection.md`: Platform decision guide and setup commands
- `references/tarball-release.md`: Tarball creation and rolling release pattern

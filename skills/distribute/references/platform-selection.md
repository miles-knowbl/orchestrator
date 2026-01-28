# Platform Selection Guide

Choose the right deployment platform based on your workload characteristics.

## Decision Matrix

| Workload | Platform | Why |
|----------|----------|-----|
| Static site, Next.js, SSR | **Vercel** | Edge-optimized, zero config |
| Full-stack with Postgres | **Vercel + Neon** | Serverless DB, preview branches |
| MCP server, SSE, WebSocket | **Railway** | Persistent connections |
| Long-running process (>60s) | **Railway** | No serverless timeout |
| API with Dockerfile | **Railway** | Container-native |

## Decision Tree

```
Is it a web app (Next.js, static, SSR)?
  ├─ Yes → Does it need a database?
  │    ├─ Yes → Vercel + Neon
  │    └─ No  → Vercel
  └─ No → Does it need persistent connections (WebSocket, SSE)?
       ├─ Yes → Railway
       └─ No  → Does it run longer than 60 seconds?
            ├─ Yes → Railway
            └─ No  → Either works; default to Vercel
```

## Vercel Setup

### Initial Configuration

```bash
# Link project to Vercel
vercel link

# This creates .vercel/project.json with org and project IDs
```

### GitHub Secrets

```bash
# Get token from https://vercel.com/account/tokens
gh secret set VERCEL_TOKEN --body "your-token"

# Get IDs from .vercel/project.json after linking
gh secret set VERCEL_ORG_ID --body "team_xxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
```

### With Neon Database

```bash
# Standard Vercel setup (above) plus:
# Add DATABASE_URL to Vercel env vars (NOT GitHub secrets)
vercel env add DATABASE_URL production

# Install Neon Vercel Integration for automatic preview branch databases
# https://vercel.com/integrations/neon
```

### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

For Next.js projects, Vercel auto-detects — no `vercel.json` needed.

## Railway Setup

### Initial Configuration

```bash
# Link project to Railway
railway link

# This connects your local directory to a Railway project
```

### GitHub Secrets

```bash
# Get token from https://railway.app/account/tokens
gh secret set RAILWAY_TOKEN --body "your-token"

# Optional: specify service name for multi-service projects
gh secret set RAILWAY_SERVICE --body "service-name"
```

### Railway Configuration

Railway auto-detects most project types. For explicit configuration, use a `railway.toml`:

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
restartPolicyType = "on_failure"
```

## Dual Platform Setup

Some projects deploy to both platforms (e.g., dashboard on Vercel, API on Railway):

| Component | Platform | Example |
|-----------|----------|---------|
| Dashboard / docs site | Vercel | `dashboard.myproject.com` |
| API server | Railway | `api.myproject.com` |
| MCP server | Railway | `mcp.myproject.com` |

To enable dual-platform deployment:

1. Configure **both** sets of GitHub secrets (Vercel + Railway)
2. Do **not** set a `DEPLOY_PLATFORM` variable
3. Remove any `if` conditionals from deploy jobs — both run unconditionally
4. Each job gracefully skips if its secrets are missing

## Environment Variables

### Vercel

```bash
# Add production env var
vercel env add VAR_NAME production

# Add to all environments
vercel env add VAR_NAME production preview development
```

### Railway

```bash
# Set via CLI
railway variables set VAR_NAME=value

# Or via dashboard: railway.app → Project → Variables
```

## Graceful Degradation

The `distribute.yml` workflow skips platform deployment if secrets are not configured. This means:

- New repos get tarball releases immediately (no secrets needed)
- Platform deployment activates when secrets are added
- Docker publishing activates when a Dockerfile is added
- No workflow failures for missing optional configuration

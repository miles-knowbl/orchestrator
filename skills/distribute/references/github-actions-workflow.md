# GitHub Actions Workflow Template

The `distribute.yml` workflow automates the full distribution pipeline on push to main.

## Complete Workflow

```yaml
name: Distribute

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test

  deploy-vercel:
    needs: test
    runs-on: ubuntu-latest
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - name: Install Vercel CLI
        run: npm i -g vercel@latest
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}

  deploy-railway:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      - name: Deploy
        run: |
          if [ -n "$RAILWAY_SERVICE" ]; then
            railway up -d --service "$RAILWAY_SERVICE"
          else
            railway up -d
          fi
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          RAILWAY_SERVICE: ${{ secrets.RAILWAY_SERVICE }}

  release:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Detect version
        id: version
        run: |
          if [ -f package.json ]; then
            VERSION=$(node -p "require('./package.json').version")
          elif [ -f Cargo.toml ]; then
            VERSION=$(grep '^version' Cargo.toml | head -1 | sed 's/.*"\(.*\)".*/\1/')
          elif [ -f pyproject.toml ]; then
            VERSION=$(grep '^version' pyproject.toml | head -1 | sed 's/.*"\(.*\)".*/\1/')
          elif [ -f VERSION ]; then
            VERSION=$(cat VERSION)
          else
            VERSION="0.0.0"
          fi
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"
          echo "Detected version: $VERSION"

      - name: Create tarball
        run: |
          REPO_NAME=$(basename "$GITHUB_REPOSITORY")
          tar czf "$REPO_NAME-v${{ steps.version.outputs.version }}.tar.gz" \
            --exclude='.git' \
            --exclude='node_modules' \
            --exclude='.env*' \
            .
          shasum -a 256 "$REPO_NAME-v${{ steps.version.outputs.version }}.tar.gz" > checksums.txt

      - name: Create or update rolling release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          REPO_NAME=$(basename "$GITHUB_REPOSITORY")
          TARBALL="$REPO_NAME-v${{ steps.version.outputs.version }}.tar.gz"

          # Delete existing "latest" release if it exists
          gh release delete latest --yes 2>/dev/null || true
          git push origin :refs/tags/latest 2>/dev/null || true

          # Create new "latest" release
          gh release create latest \
            --title "Latest (v${{ steps.version.outputs.version }})" \
            --notes "Rolling release — updated on every push to main.

          **Version:** ${{ steps.version.outputs.version }}
          **Commit:** ${{ github.sha }}
          **Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)" \
            "$TARBALL" checksums.txt
```

## Workflow Structure

| Job | Depends On | Condition | Purpose |
|-----|-----------|-----------|---------|
| `test` | — | Always | Run test suite as gate |
| `deploy-vercel` | test | Always (skips gracefully if secrets missing) | Deploy to Vercel |
| `deploy-railway` | test | Always (skips gracefully if secrets missing) | Deploy to Railway |
| `release` | test | Always | Create tarball + rolling release |

## Required Secrets

| Secret | Platform | How to Set |
|--------|----------|------------|
| `VERCEL_TOKEN` | Vercel | `gh secret set VERCEL_TOKEN` |
| `VERCEL_ORG_ID` | Vercel | `gh secret set VERCEL_ORG_ID` |
| `VERCEL_PROJECT_ID` | Vercel | `gh secret set VERCEL_PROJECT_ID` |
| `RAILWAY_TOKEN` | Railway | `gh secret set RAILWAY_TOKEN` |
| `RAILWAY_SERVICE` | Railway | `gh secret set RAILWAY_SERVICE` (optional, for multi-service projects) |
| `GITHUB_TOKEN` | GitHub | Automatic (provided by Actions) |

## Dual Platform Workflow

When a project deploys to **both** Vercel and Railway (e.g., dashboard on Vercel, API server on Railway), both deploy jobs run unconditionally. Do **not** use `if` conditionals or `DEPLOY_PLATFORM` — simply configure both sets of secrets.

### Deployment Modes

| Mode | Vercel Secrets | Railway Secrets | Result |
|------|---------------|-----------------|--------|
| Vercel only | Configured | Not configured | Vercel deploys, Railway skips |
| Railway only | Not configured | Configured | Railway deploys, Vercel skips |
| Dual platform | Configured | Configured | Both deploy |

### Railway Service Selection

When deploying to Railway, the service name is optional. Use `RAILWAY_SERVICE` for multi-service projects:

```yaml
- name: Deploy
  run: |
    if [ -n "$RAILWAY_SERVICE" ]; then
      railway up -d --service "$RAILWAY_SERVICE"
    else
      railway up -d
    fi
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
    RAILWAY_SERVICE: ${{ secrets.RAILWAY_SERVICE }}
```

## Customization Points

- **Test command**: Replace `npm test` with your project's test runner
- **Node version**: Update `node-version` to match your project
- **Tarball excludes**: Add project-specific excludes to the `tar` command
- **Docker tags**: Add version-specific tags alongside `latest`

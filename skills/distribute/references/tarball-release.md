# Tarball Release Guide

Create reproducible release artifacts with checksums using the rolling "latest" release pattern.

## Version Detection

The workflow auto-detects the project version from these sources (in priority order):

| Source | Detection |
|--------|-----------|
| `package.json` | `node -p "require('./package.json').version"` |
| `Cargo.toml` | `grep '^version' Cargo.toml` |
| `pyproject.toml` | `grep '^version' pyproject.toml` |
| `VERSION` file | `cat VERSION` |
| Fallback | `0.0.0` |

## Tarball Creation

```bash
# Standard tarball excluding common non-distributable files
REPO_NAME=$(basename "$PWD")
VERSION=$(node -p "require('./package.json').version")

tar czf "$REPO_NAME-v$VERSION.tar.gz" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env*' \
  --exclude='.vercel' \
  --exclude='.railway' \
  .
```

### SHA256 Checksum

```bash
# Generate checksum
shasum -a 256 "$REPO_NAME-v$VERSION.tar.gz" > checksums.txt

# Verify (consumer side)
shasum -a 256 -c checksums.txt
```

## Rolling "Latest" Release Pattern

Instead of creating a new GitHub release for every push, maintain a single rolling "latest" release that gets updated:

```bash
# Delete existing release and tag
gh release delete latest --yes 2>/dev/null || true
git push origin :refs/tags/latest 2>/dev/null || true

# Create fresh release with current artifacts
gh release create latest \
  --title "Latest (v$VERSION)" \
  --notes "Rolling release — updated on every push to main." \
  "$TARBALL" checksums.txt
```

### Why Rolling Releases

| Approach | Pros | Cons |
|----------|------|------|
| **Rolling "latest"** | Clean releases page, always current | No version history in releases |
| **Per-push releases** | Full history | Cluttered releases page |
| **Tagged releases** | Semantic versions | Requires manual tagging |

The rolling pattern is the default. For libraries or tools that need semantic version releases, add tagged releases alongside the rolling one.

## Tagged Releases (Optional)

When you want to cut a versioned release in addition to the rolling one:

```bash
# Tag the commit
git tag "v$VERSION"
git push origin "v$VERSION"

# Create a versioned release
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --generate-notes \
  "$TARBALL" checksums.txt
```

## Docker Images

When a `Dockerfile` exists, the workflow also publishes to GHCR:

```bash
# Build and tag
docker build -t ghcr.io/$GITHUB_REPOSITORY:latest .

# Push
docker push ghcr.io/$GITHUB_REPOSITORY:latest
```

### Consumer Usage

```bash
# Pull the image
docker pull ghcr.io/org/repo:latest

# Or reference in docker-compose.yml
services:
  app:
    image: ghcr.io/org/repo:latest
```

## Installation From Release

Consumers can install from the tarball:

```bash
# Download latest
gh release download latest --repo org/repo --pattern '*.tar.gz'

# Verify checksum
gh release download latest --repo org/repo --pattern 'checksums.txt'
shasum -a 256 -c checksums.txt

# Extract
tar xzf repo-v*.tar.gz
```

# Git Workflow Scripts

Ready-to-use scripts for common git operations.

## Setup

Save these scripts to your project's `scripts/` directory and make executable:

```bash
chmod +x scripts/*.sh
```

---

## worktree-create.sh

Create an isolated worktree for a system.

```bash
#!/bin/bash
# Usage: ./scripts/worktree-create.sh sys-002 work-order-service
# Creates: .worktrees/work-order-service with feature/system-work-orders branch

set -e

SYSTEM_ID=$1
SYSTEM_NAME=$2

if [ -z "$SYSTEM_ID" ] || [ -z "$SYSTEM_NAME" ]; then
    echo "Usage: $0 <system-id> <system-name>"
    echo "Example: $0 sys-002 work-order-service"
    exit 1
fi

BRANCH_NAME="feature/system-${SYSTEM_NAME}"
WORKTREE_PATH=".worktrees/${SYSTEM_NAME}"

echo "🌳 Creating worktree for ${SYSTEM_NAME}..."

# Ensure we're on main and up to date
git checkout main
git pull origin main

# Create branch if it doesn't exist
if git show-ref --quiet "refs/heads/${BRANCH_NAME}"; then
    echo "Branch ${BRANCH_NAME} already exists"
else
    echo "Creating branch ${BRANCH_NAME}..."
    git branch "${BRANCH_NAME}"
fi

# Create worktree directory
mkdir -p .worktrees

# Add worktree
if [ -d "${WORKTREE_PATH}" ]; then
    echo "Worktree already exists at ${WORKTREE_PATH}"
else
    git worktree add "${WORKTREE_PATH}" "${BRANCH_NAME}"
    echo "✅ Created worktree at ${WORKTREE_PATH}"
fi

# Navigate to worktree
echo ""
echo "To work in this worktree:"
echo "  cd ${WORKTREE_PATH}"
echo ""
echo "Branch: ${BRANCH_NAME}"
```

---

## worktree-cleanup.sh

Remove a worktree after work is complete.

```bash
#!/bin/bash
# Usage: ./scripts/worktree-cleanup.sh work-order-service [--delete-branch]
# Removes worktree and optionally deletes the branch

set -e

SYSTEM_NAME=$1
DELETE_BRANCH=$2

if [ -z "$SYSTEM_NAME" ]; then
    echo "Usage: $0 <system-name> [--delete-branch]"
    echo "Example: $0 work-order-service --delete-branch"
    exit 1
fi

WORKTREE_PATH=".worktrees/${SYSTEM_NAME}"
BRANCH_NAME="feature/system-${SYSTEM_NAME}"

echo "🧹 Cleaning up worktree for ${SYSTEM_NAME}..."

# Check worktree exists
if [ ! -d "${WORKTREE_PATH}" ]; then
    echo "Worktree not found at ${WORKTREE_PATH}"
    exit 1
fi

# Return to main
cd "$(git rev-parse --show-toplevel)"

# Remove worktree
git worktree remove "${WORKTREE_PATH}" --force
echo "✅ Removed worktree"

# Optionally delete branch
if [ "$DELETE_BRANCH" = "--delete-branch" ]; then
    git branch -d "${BRANCH_NAME}" 2>/dev/null || git branch -D "${BRANCH_NAME}"
    echo "✅ Deleted branch ${BRANCH_NAME}"
fi

# Prune worktree references
git worktree prune

echo ""
echo "Cleanup complete!"
```

---

## worktree-status.sh

Show status of all worktrees.

```bash
#!/bin/bash
# Usage: ./scripts/worktree-status.sh
# Shows all worktrees with their branch and status

echo "📊 Worktree Status"
echo "=================="
echo ""

# List all worktrees
git worktree list --porcelain | while read -r line; do
    if [[ $line == worktree* ]]; then
        path="${line#worktree }"
    elif [[ $line == HEAD* ]]; then
        head="${line#HEAD }"
    elif [[ $line == branch* ]]; then
        branch="${line#branch refs/heads/}"

        # Get status info
        if [ -d "$path" ]; then
            cd "$path"

            # Count uncommitted changes
            changes=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

            # Get ahead/behind
            upstream=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)
            if [ -n "$upstream" ]; then
                ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null)
                behind=$(git rev-list --count HEAD..@{u} 2>/dev/null)
                sync="↑${ahead} ↓${behind}"
            else
                sync="no upstream"
            fi

            cd - > /dev/null

            # Print status
            printf "%-40s %-30s changes: %-3s %s\n" "$path" "$branch" "$changes" "$sync"
        fi
    fi
done

echo ""
echo "Total worktrees: $(git worktree list | wc -l | tr -d ' ')"
```

---

## pr-create.sh

Create a pull request with standard format.

```bash
#!/bin/bash
# Usage: ./scripts/pr-create.sh "feat: Work Order Service" [--draft]
# Creates a PR from current branch to main

set -e

TITLE=$1
DRAFT=$2

if [ -z "$TITLE" ]; then
    echo "Usage: $0 \"<title>\" [--draft]"
    echo "Example: $0 \"feat: Work Order Service\" --draft"
    exit 1
fi

BRANCH=$(git branch --show-current)
SYSTEM_NAME=$(echo "$BRANCH" | sed 's/feature\/system-//')

echo "📝 Creating PR for ${BRANCH}..."

# Ensure we have latest main
git fetch origin main

# Check for unpushed commits
UNPUSHED=$(git log origin/${BRANCH}..${BRANCH} 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt 0 ]; then
    echo "Pushing ${UNPUSHED} commits..."
    git push origin "${BRANCH}"
fi

# Build PR body
PR_BODY=$(cat << EOF
## Summary

[Brief description of what this PR does]

## Changes

- [Change 1]
- [Change 2]

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] No security issues introduced
- [ ] Performance acceptable

## Related

- Closes #[issue number]

---
*System: ${SYSTEM_NAME}*
EOF
)

# Create PR
if [ "$DRAFT" = "--draft" ]; then
    gh pr create --base main --head "${BRANCH}" --title "${TITLE}" --body "${PR_BODY}" --draft
else
    gh pr create --base main --head "${BRANCH}" --title "${TITLE}" --body "${PR_BODY}"
fi

echo ""
echo "✅ PR created!"
```

---

## sync-main.sh

Sync current branch with main (rebase).

```bash
#!/bin/bash
# Usage: ./scripts/sync-main.sh
# Rebases current branch on latest main

set -e

BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ]; then
    echo "Already on main, pulling latest..."
    git pull origin main
    exit 0
fi

echo "🔄 Syncing ${BRANCH} with main..."

# Stash any changes
STASHED=false
if [ -n "$(git status --porcelain)" ]; then
    echo "Stashing local changes..."
    git stash
    STASHED=true
fi

# Fetch and rebase
git fetch origin main
git rebase origin/main

if [ "$STASHED" = true ]; then
    echo "Restoring stashed changes..."
    git stash pop
fi

echo ""
echo "✅ Branch synced with main"
echo ""
echo "To push: git push origin ${BRANCH} --force-with-lease"
```

---

## commit-feature.sh

Make a conventional commit.

```bash
#!/bin/bash
# Usage: ./scripts/commit-feature.sh "add work order CRUD endpoints"
# Creates: feat(work-order): add work order CRUD endpoints

set -e

MESSAGE=$1

if [ -z "$MESSAGE" ]; then
    echo "Usage: $0 \"<commit message>\""
    echo "Example: $0 \"add work order CRUD endpoints\""
    exit 1
fi

# Extract scope from branch name
BRANCH=$(git branch --show-current)
SCOPE=$(echo "$BRANCH" | sed 's/feature\/system-//' | cut -d'-' -f1-2)

# Default type
TYPE="feat"

# Detect type from message
if [[ "$MESSAGE" == fix:* ]] || [[ "$MESSAGE" == *"fix "* ]]; then
    TYPE="fix"
    MESSAGE="${MESSAGE#fix: }"
elif [[ "$MESSAGE" == docs:* ]] || [[ "$MESSAGE" == *"documentation"* ]]; then
    TYPE="docs"
    MESSAGE="${MESSAGE#docs: }"
elif [[ "$MESSAGE" == test:* ]] || [[ "$MESSAGE" == *"test"* ]]; then
    TYPE="test"
    MESSAGE="${MESSAGE#test: }"
elif [[ "$MESSAGE" == refactor:* ]]; then
    TYPE="refactor"
    MESSAGE="${MESSAGE#refactor: }"
fi

# Stage all changes
git add -A

# Commit with conventional format
FULL_MESSAGE="${TYPE}(${SCOPE}): ${MESSAGE}"
git commit -m "${FULL_MESSAGE}"

echo ""
echo "✅ Committed: ${FULL_MESSAGE}"
```

---

## branch-cleanup.sh

Clean up merged branches.

```bash
#!/bin/bash
# Usage: ./scripts/branch-cleanup.sh
# Removes local branches that have been merged to main

set -e

echo "🧹 Cleaning up merged branches..."

# Switch to main
git checkout main
git pull origin main

# Find and delete merged branches
MERGED=$(git branch --merged main | grep -v "main" | grep -v "\*")

if [ -z "$MERGED" ]; then
    echo "No merged branches to clean up"
    exit 0
fi

echo "The following branches have been merged:"
echo "$MERGED"
echo ""
read -p "Delete these branches? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "$MERGED" | xargs git branch -d
    echo "✅ Branches deleted"
else
    echo "Cancelled"
fi
```

---

## Installation

Add all scripts to your project:

```bash
mkdir -p scripts

# Copy each script above to scripts/
# Then make executable:
chmod +x scripts/*.sh

# Add to .gitignore if you don't want to commit
echo "scripts/*.sh" >> .gitignore

# Or commit them for team use
git add scripts/
git commit -m "chore: add git workflow scripts"
```

## Usage Summary

| Script | Purpose | Example |
|--------|---------|---------|
| `worktree-create.sh` | Create isolated worktree | `./scripts/worktree-create.sh sys-002 work-orders` |
| `worktree-cleanup.sh` | Remove worktree | `./scripts/worktree-cleanup.sh work-orders --delete-branch` |
| `worktree-status.sh` | Show all worktrees | `./scripts/worktree-status.sh` |
| `pr-create.sh` | Create PR | `./scripts/pr-create.sh "feat: Work Orders"` |
| `sync-main.sh` | Rebase on main | `./scripts/sync-main.sh` |
| `commit-feature.sh` | Conventional commit | `./scripts/commit-feature.sh "add CRUD"` |
| `branch-cleanup.sh` | Delete merged branches | `./scripts/branch-cleanup.sh` |

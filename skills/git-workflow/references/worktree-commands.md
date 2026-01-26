# Worktree Commands Reference

Complete reference for git worktree operations.

## Basic Worktree Operations

### Create Worktree with New Branch

```bash
git worktree add <path> -b <new-branch-name>
```

Creates a new working directory at `<path>` and creates a new branch `<new-branch-name>` starting from the current HEAD.

**Example:**
```bash
git worktree add .worktrees/system-auth -b feature/system-auth
```

### Create Worktree from Existing Branch

```bash
git worktree add <path> <existing-branch>
```

Creates a new working directory at `<path>` checking out `<existing-branch>`.

**Example:**
```bash
git worktree add .worktrees/hotfix-urgent hotfix/urgent-fix
```

### Create Worktree from Remote Branch

```bash
git fetch origin
git worktree add <path> <remote-branch>
```

**Example:**
```bash
git fetch origin
git worktree add .worktrees/review-pr origin/feature/new-feature
```

### Create Detached HEAD Worktree

```bash
git worktree add --detach <path> <commit>
```

Creates a worktree at a specific commit without creating a branch.

**Example:**
```bash
git worktree add --detach .worktrees/investigate-bug abc1234
```

## Listing Worktrees

### List All Worktrees

```bash
git worktree list
```

**Output:**
```
/home/user/repo                 abc1234 [main]
/home/user/repo/.worktrees/system-auth  def5678 [feature/system-auth]
/home/user/repo/.worktrees/system-orders  ghi9012 [feature/system-orders]
```

### Verbose List

```bash
git worktree list --porcelain
```

**Output:**
```
worktree /home/user/repo
HEAD abc1234
branch refs/heads/main

worktree /home/user/repo/.worktrees/system-auth
HEAD def5678
branch refs/heads/feature/system-auth
```

## Removing Worktrees

### Remove Worktree (Clean)

```bash
git worktree remove <path>
```

Removes worktree if working directory is clean.

**Example:**
```bash
git worktree remove .worktrees/system-auth
```

### Force Remove Worktree

```bash
git worktree remove --force <path>
```

Removes worktree even if there are uncommitted changes.

**Example:**
```bash
git worktree remove --force .worktrees/abandoned-feature
```

### Prune Stale Worktrees

```bash
git worktree prune
```

Removes worktree administrative files for worktrees whose directories have been deleted.

### Dry Run Prune

```bash
git worktree prune --dry-run
```

Shows what would be pruned without actually doing it.

## Moving Worktrees

### Move Worktree to New Location

```bash
git worktree move <worktree> <new-path>
```

**Example:**
```bash
git worktree move .worktrees/system-auth .worktrees/auth-service
```

## Worktree Lock/Unlock

### Lock Worktree

```bash
git worktree lock <path>
```

Prevents worktree from being pruned. Useful for worktrees on removable drives.

**Example:**
```bash
git worktree lock .worktrees/external-drive-work
```

### Lock with Reason

```bash
git worktree lock --reason "On external drive" <path>
```

### Unlock Worktree

```bash
git worktree unlock <path>
```

## Common Patterns

### Pattern: System Development

```bash
# 1. Start from clean main
cd /path/to/repo
git checkout main
git pull origin main

# 2. Create worktree for system
git worktree add .worktrees/system-servicegrid -b feature/system-servicegrid

# 3. Work in worktree
cd .worktrees/system-servicegrid
# ... develop ...

# 4. Push changes
git push -u origin feature/system-servicegrid

# 5. Create PR
gh pr create --base main --head feature/system-servicegrid

# 6. After merge, cleanup
cd /path/to/repo
git checkout main
git pull origin main
git worktree remove .worktrees/system-servicegrid
git branch -d feature/system-servicegrid
```

### Pattern: Parallel Systems

```bash
# System 1
git worktree add .worktrees/system-auth -b feature/system-auth

# System 2 (different terminal)
git worktree add .worktrees/system-orders -b feature/system-orders

# System 3 (different terminal)
git worktree add .worktrees/system-routing -b feature/system-routing
```

### Pattern: Review a PR

```bash
# Fetch PR branch
git fetch origin pull/123/head:pr-123

# Create worktree for review
git worktree add .worktrees/review-pr-123 pr-123

# Review
cd .worktrees/review-pr-123
# ... review code, run tests ...

# Cleanup
cd /path/to/repo
git worktree remove .worktrees/review-pr-123
git branch -D pr-123
```

### Pattern: Hotfix While Feature in Progress

```bash
# Current state: working on feature in worktree
# Need to make urgent hotfix

# Create hotfix worktree from main
git worktree add .worktrees/hotfix-urgent -b hotfix/urgent-fix origin/main

# Work on hotfix
cd .worktrees/hotfix-urgent
# ... fix ...
git commit -am "fix: urgent production issue"
git push -u origin hotfix/urgent-fix

# Create PR, get it merged

# Return to feature work
cd .worktrees/system-servicegrid
git fetch origin main
git rebase origin/main
```

### Pattern: Testing Different Configurations

```bash
# Test against different base branches
git worktree add .worktrees/test-against-develop develop
git worktree add .worktrees/test-against-main main

# Run tests in each
cd .worktrees/test-against-develop && npm test
cd .worktrees/test-against-main && npm test
```

## Directory Structure

### Recommended Layout

```
repository/
├── .git/                 # Shared git database
├── .gitignore           # Should include .worktrees/
├── src/                 # Main branch source
├── ...
└── .worktrees/          # All worktrees here
    ├── system-auth/     # feature/system-auth
    ├── system-orders/   # feature/system-orders
    └── hotfix-urgent/   # hotfix/urgent-fix
```

### .gitignore Entry

```gitignore
# Worktrees directory
.worktrees/
```

## Troubleshooting

### Error: "is already checked out"

```bash
# Can't create worktree for branch that's checked out elsewhere
git worktree add .worktrees/test main
# fatal: 'main' is already checked out at '/path/to/repo'

# Solution: use different branch or detached HEAD
git worktree add .worktrees/test-main --detach main
```

### Error: "not a valid worktree path"

```bash
# Worktree was deleted without git worktree remove
git worktree remove .worktrees/deleted
# fatal: '.worktrees/deleted' is not a valid worktree path

# Solution: prune stale entries
git worktree prune
```

### Worktree Has Uncommitted Changes

```bash
# Can't remove worktree with changes
git worktree remove .worktrees/dirty
# fatal: '.worktrees/dirty' contains modified or untracked files

# Solution 1: commit or stash changes
cd .worktrees/dirty
git stash  # or git commit

# Solution 2: force remove
git worktree remove --force .worktrees/dirty
```

### Worktree on Different Filesystem

```bash
# Lock worktrees on removable drives
git worktree lock --reason "On USB drive" /mnt/usb/worktree

# This prevents accidental pruning
```

## Best Practices

1. **Use `.worktrees/` directory** — Keep all worktrees organized
2. **Add to .gitignore** — Don't commit worktree directories
3. **Name branches clearly** — Include system/feature name
4. **Clean up after merge** — Remove worktrees promptly
5. **Prune regularly** — Run `git worktree prune` occasionally
6. **Lock if needed** — For worktrees on removable storage

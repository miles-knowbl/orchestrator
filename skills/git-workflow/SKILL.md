---
name: git-workflow
description: "Manages git workflows for the engineering loop. Handles worktrees for parallel development, branching conventions, PR creation, and coordination between agents and human engineers. Provides isolation for concurrent system development."
phase: SHIP
category: core
version: "1.0.0"
depends_on: []
tags: [git, branching, deployment, pr, core-workflow]
---

# Git Workflow

Parallel development with git worktrees and structured branching.

## When to Use

- **Starting work on a system** — Create isolated worktree
- **Parallel development** — Multiple systems simultaneously
- **Coordination** — Multiple engineers/agents on same repo
- **PR creation** — Preparing work for review
- **Hotfixes** — Emergency fixes while feature work continues

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `worktree-commands.md` | Core worktree commands and patterns |
| `pr-templates.md` | Templates for pull request descriptions |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `conflict-resolution.md` | When merge conflicts occur |
| `scripts.md` | Helper scripts for common operations |

**Verification:** Ensure worktree is created and branch follows naming convention.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Git worktree | `../{system-name}/` | When starting system work |
| Feature branch | Git | Always |
| PR description | GitHub | When ready for review |

## Core Concept

Git worktrees allow multiple working directories from a single repository, enabling:
- Isolated development environments per system
- No need to stash/switch branches
- Parallel work on independent systems
- Clean separation of concerns

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GIT WORKTREE MODEL                                   │
│                                                                             │
│  repository/                                                                │
│  ├── .git/                    # Shared git database                         │
│  ├── main branch (production) # Protected, merge only                       │
│  │                                                                          │
│  └── .worktrees/              # Isolated working directories                │
│      ├── system-auth/         # Agent 1 working here                        │
│      ├── system-orders/       # Agent 2 working here                        │
│      └── hotfix-login/        # Human engineer fixing bug                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Branching Convention

### Branch Naming

```
{type}/{system-or-feature-name}
```

| Type | Use Case | Example |
|------|----------|---------|
| `feature/` | New system or feature | `feature/system-servicegrid` |
| `hotfix/` | Urgent production fix | `hotfix/auth-bypass` |
| `bugfix/` | Non-urgent bug fix | `bugfix/order-validation` |
| `chore/` | Maintenance, deps | `chore/update-dependencies` |
| `docs/` | Documentation only | `docs/api-reference` |

### Protected Branches

| Branch | Purpose | Merge Via |
|--------|---------|-----------|
| `main` | Production code | PR with approval |
| `develop` | Integration (optional) | PR from feature |

## Workflow: Claim a System

### Step 1: Navigate to Repository

```bash
cd /path/to/repository
```

### Step 2: Ensure Main is Current

```bash
git checkout main
git pull origin main
```

### Step 3: Create Worktree

```bash
# Create worktree with new branch
git worktree add .worktrees/system-servicegrid -b feature/system-servicegrid

# This creates:
# - .worktrees/system-servicegrid/ (working directory)
# - feature/system-servicegrid (new branch from current HEAD)
```

### Step 4: Navigate to Worktree

```bash
cd .worktrees/system-servicegrid
```

### Step 5: Verify Setup

```bash
# Confirm branch
git branch --show-current
# feature/system-servicegrid

# Confirm location
pwd
# /path/to/repository/.worktrees/system-servicegrid
```

## Workflow: Daily Development

### Making Changes

```bash
# Work in worktree
cd .worktrees/system-servicegrid

# Make changes...
# Edit files, run tests, etc.

# Stage and commit
git add .
git commit -m "feat(servicegrid): implement work order model"
```

### Commit Message Convention

```
{type}({scope}): {description}

[optional body]

[optional footer]
```

| Type | Meaning |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code change (no feature/fix) |
| `test` | Adding tests |
| `chore` | Maintenance |

Example:
```
feat(servicegrid): implement work order model

- Add WorkOrder model with status enum
- Add validation for required fields
- Add database migration

Closes #123
```

### Pushing Changes

```bash
# First push (set upstream)
git push -u origin feature/system-servicegrid

# Subsequent pushes
git push
```

### Pulling Updates from Main

When main has been updated and you need those changes:

```bash
# Option 1: Rebase (preferred for clean history)
git fetch origin main
git rebase origin/main

# Option 2: Merge (if rebase is complex)
git fetch origin main
git merge origin/main
```

## Workflow: Create PR

### Step 1: Ensure All Changes Committed

```bash
git status
# Should be clean
```

### Step 2: Push Final Changes

```bash
git push
```

### Step 3: Create PR via GitHub CLI

```bash
gh pr create \
  --base main \
  --head feature/system-servicegrid \
  --title "feat: ServiceGrid Core System" \
  --body-file PR_DESCRIPTION.md \
  --label "system:servicegrid" \
  --reviewer @tech-lead
```

Or with inline body:

```bash
gh pr create \
  --base main \
  --head feature/system-servicegrid \
  --title "feat: ServiceGrid Core System" \
  --body "## Summary
Implements the core ServiceGrid system.

Closes #123

## Changes
- Work order model and API
- Status management
- Mobile sync support

## Testing
- Unit tests: ✅
- Integration tests: ✅
- Manual testing: ✅"
```

### Step 4: Link PR to Issue

```bash
# PR body should reference issue
# "Closes #123" or "Fixes #123"
```

→ See `references/pr-templates.md`

## Workflow: After Merge

### Step 1: Return to Main Repository

```bash
cd /path/to/repository
```

### Step 2: Update Main

```bash
git checkout main
git pull origin main
```

### Step 3: Remove Worktree

```bash
git worktree remove .worktrees/system-servicegrid
```

### Step 4: Optionally Delete Branch

```bash
# Local
git branch -d feature/system-servicegrid

# Remote (usually done via PR merge settings)
git push origin --delete feature/system-servicegrid
```

## Parallel Development

### Multiple Worktrees

```bash
# Agent 1 works on ServiceGrid
git worktree add .worktrees/system-servicegrid -b feature/system-servicegrid
cd .worktrees/system-servicegrid

# Agent 2 works on Routing (different terminal/session)
git worktree add .worktrees/system-routing -b feature/system-routing
cd .worktrees/system-routing

# Human engineer works on hotfix
git worktree add .worktrees/hotfix-auth -b hotfix/auth-bypass
cd .worktrees/hotfix-auth
```

### List Active Worktrees

```bash
git worktree list
# /path/to/repo                 abc1234 [main]
# /path/to/repo/.worktrees/system-servicegrid  def5678 [feature/system-servicegrid]
# /path/to/repo/.worktrees/system-routing      ghi9012 [feature/system-routing]
```

### Coordination Rules

1. **No shared files** — Each worktree modifies different parts
2. **API contracts** — Agree on interfaces before implementing
3. **Merge order** — Dependencies merge first
4. **Communication** — Update GitHub issue with progress

## Conflict Resolution

### When Conflicts Occur

Conflicts happen when:
- Multiple worktrees modify same files
- Main updated after branch created
- Dependent system merged, breaking yours

### Resolution Process

```bash
# In your worktree
git fetch origin main
git rebase origin/main

# If conflicts:
# 1. Edit conflicted files
# 2. Resolve conflicts
# 3. Stage resolved files
git add <resolved-files>

# 4. Continue rebase
git rebase --continue

# 5. Force push (if already pushed)
git push --force-with-lease
```

### Avoiding Conflicts

- Communicate what files you're modifying
- Pull main frequently
- Keep PRs small and merge often
- Use feature flags for partial features

## Commands Reference

### Worktree Commands

```bash
# Create worktree with new branch
git worktree add <path> -b <branch-name>

# Create worktree from existing branch
git worktree add <path> <existing-branch>

# List worktrees
git worktree list

# Remove worktree
git worktree remove <path>

# Prune stale worktree entries
git worktree prune
```

### Branch Commands

```bash
# Create and checkout new branch
git checkout -b <branch-name>

# List branches
git branch -a

# Delete local branch
git branch -d <branch-name>

# Delete remote branch
git push origin --delete <branch-name>
```

### PR Commands (GitHub CLI)

```bash
# Create PR
gh pr create --base main --head <branch>

# List PRs
gh pr list

# Check PR status
gh pr status

# View PR
gh pr view <number>

# Merge PR
gh pr merge <number> --squash --delete-branch
```

→ See `references/worktree-commands.md`

## Human-in-the-Loop Gates

### When Human Approval Required

| Gate | Trigger | Process |
|------|---------|---------|
| Architecture | New patterns | Add `needs:architecture-review` label |
| Security | Auth/crypto/PII | Add `needs:security-review` label |
| Database | Schema changes | Add `needs:dba-review` label |
| Deploy | Production merge | Required reviewer approval |

### Requesting Review

```bash
# Create PR with specific reviewers
gh pr create \
  --reviewer security-team,tech-lead \
  --label "needs:security-review"

# Add reviewers to existing PR
gh pr edit <number> --add-reviewer @security-team
```

### Waiting for Approval

```bash
# Check PR review status
gh pr checks <number>

# View review comments
gh pr view <number> --comments
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `engineering` (loop) | Git workflow is part of the implementation phase |
| `entry-portal` | Creates issues that git workflow implements |
| `code-review` | Prepares PR for review, handles feedback |

## Key Principles

**Isolate work.** Each system gets its own worktree.

**Commit often.** Small, logical commits are easier to review and revert.

**Pull main frequently.** Avoid large merge conflicts.

**PR early.** Open draft PR early for visibility.

**Clean up.** Remove worktrees after merge.

## Mode-Specific Behavior

Git workflow and branching approach differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system branches |
| **Approach** | Comprehensive—feature branches per system |
| **Patterns** | Free choice—establish branching conventions |
| **Deliverables** | Full PR with complete system |
| **Validation** | Standard review process |
| **Constraints** | Minimal—squash or merge commit |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific branches |
| **Approach** | Extend existing—match repo conventions |
| **Patterns** | Should match existing branch/commit style |
| **Deliverables** | Delta PR for single gap or related gaps |
| **Validation** | Existing + pattern conformance review |
| **Constraints** | Don't break existing merge conventions |

**Polish considerations:**
- Branch names reference gap being filled
- PRs should be smaller and focused
- Commit messages follow existing repo style
- Merge strategy matches repo convention

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-request-specific branches |
| **Approach** | Surgical—isolated change environment required |
| **Patterns** | Must conform exactly—CR number in all references |
| **Deliverables** | Change record PR matching CR scope exactly |
| **Validation** | Full regression + multiple approvals |
| **Constraints** | Requires approval—team policy enforced |

**Enterprise git workflow requirements:**
- Branch name includes CR number
- PR title includes CR number
- All commits reference CR
- Squash commits for clean history
- Delete branch after merge

**Enterprise branch naming:**
```
change/CR-12345-fix-auth-timeout
```

**Enterprise commit format:**
```
fix(auth): resolve timeout issue

Implements the fix specified in CR-12345.
- Increase timeout from 5s to 30s
- Add retry logic for transient failures

CR-12345
```

---

## References

- `references/worktree-commands.md`: Complete worktree command reference
- `references/pr-templates.md`: PR description templates
- `references/conflict-resolution.md`: Detailed conflict resolution guide

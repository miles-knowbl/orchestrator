# Conflict Resolution

Guide to resolving git conflicts in worktrees.

## Why Conflicts Happen

Conflicts occur when:
- Multiple developers modify the same lines
- Main branch is updated after your branch was created
- Dependent system is merged, changing shared files
- Two worktrees accidentally modify the same file

## Conflict Prevention

### Before They Happen

1. **Communicate** — Let others know what files you're modifying
2. **Pull frequently** — Integrate main often to minimize drift
3. **Small PRs** — Merge often, don't let branches live too long
4. **Define boundaries** — Each system should own its files
5. **API contracts** — Agree on interfaces before implementing

### Check for Potential Conflicts

```bash
# Before starting work, check if main has diverged
git fetch origin main
git log --oneline HEAD..origin/main
# If many commits, consider rebasing before starting

# See what files changed on main
git diff --name-only HEAD origin/main
```

## Detecting Conflicts

### Before Merge/Rebase

```bash
# Dry run merge to see conflicts
git merge --no-commit --no-ff origin/main
git diff --name-only --diff-filter=U
# U = Unmerged (conflicted)

# Abort the dry run
git merge --abort
```

### During Rebase

```bash
git rebase origin/main
# CONFLICT (content): Merge conflict in src/file.ts
```

## Resolving Conflicts

### Standard Resolution Process

```bash
# 1. Start the rebase
git fetch origin main
git rebase origin/main

# 2. Git stops at first conflict
# Conflicted files are marked in status
git status
# both modified: src/file.ts

# 3. Open conflicted file
# Look for conflict markers:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> origin/main

# 4. Edit file to resolve
# Remove markers, keep correct code
# May need to combine both changes

# 5. Stage resolved file
git add src/file.ts

# 6. Continue rebase
git rebase --continue

# 7. Repeat for each conflict

# 8. Push (force required after rebase)
git push --force-with-lease
```

### Understanding Conflict Markers

```typescript
<<<<<<< HEAD
// Your changes (current branch)
const config = { timeout: 5000 };
=======
// Their changes (incoming from main)
const config = { timeout: 3000, retries: 3 };
>>>>>>> origin/main
```

**Resolution options:**

```typescript
// Option 1: Keep yours
const config = { timeout: 5000 };

// Option 2: Keep theirs
const config = { timeout: 3000, retries: 3 };

// Option 3: Combine both
const config = { timeout: 5000, retries: 3 };
```

### Using VS Code for Resolution

```bash
# Open conflicted file in VS Code
code src/file.ts

# VS Code shows:
# - "Accept Current Change" (yours)
# - "Accept Incoming Change" (theirs)
# - "Accept Both Changes"
# - "Compare Changes"
```

### Using Git Mergetool

```bash
# Configure mergetool
git config --global merge.tool vimdiff

# Or for VS Code
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'

# Launch mergetool for conflicts
git mergetool
```

## Conflict Scenarios

### Scenario 1: Same File, Different Sections

```bash
# Your changes: modified function A
# Their changes: modified function B (different part of file)

# Resolution: Usually both can be kept
# Git may auto-resolve, or you keep both sections
```

### Scenario 2: Same Lines Modified

```bash
# Your changes: timeout = 5000
# Their changes: timeout = 3000

# Resolution: Decide which value is correct
# May need to discuss with other developer
```

### Scenario 3: File Deleted vs Modified

```bash
# You: deleted the file
# They: modified the file

# Resolution:
# Keep deletion: git rm src/file.ts
# Keep modification: git add src/file.ts
```

### Scenario 4: File Renamed

```bash
# You: renamed file.ts -> newName.ts
# They: modified file.ts

# Resolution: Apply their changes to your renamed file
# May need manual editing
```

### Scenario 5: Package Lock Conflicts

```bash
# package-lock.json almost always conflicts

# Resolution: Regenerate
git checkout --ours package-lock.json  # Or --theirs
rm package-lock.json
npm install
git add package-lock.json
```

### Scenario 6: Migration File Conflicts

```bash
# Database migrations with conflicting timestamps

# Resolution:
# 1. Abort current resolution
# 2. Rename your migration to new timestamp
# 3. Ensure migrations run in correct order
# 4. Test migration sequence
```

## Abort and Retry

### Abort Rebase

```bash
# Something went wrong, start over
git rebase --abort
```

### Abort Merge

```bash
git merge --abort
```

### Reset to Known State

```bash
# Go back to before you started
git reset --hard origin/feature/my-branch
```

## Advanced Resolution

### Interactive Rebase for Complex Cases

```bash
# Rebase with ability to edit, squash, reorder
git rebase -i origin/main

# In editor:
# pick abc1234 First commit
# squash def5678 Fixup commit
# pick ghi9012 Third commit

# Squashing related commits can reduce conflicts
```

### Cherry-Pick Specific Commits

```bash
# If rebase is too messy, start fresh
git checkout main
git checkout -b feature/my-feature-v2
git cherry-pick abc1234  # Pick good commits
git cherry-pick def5678
```

### Theirs/Ours Strategy

```bash
# Accept all their changes for a file
git checkout --theirs src/file.ts
git add src/file.ts

# Accept all your changes for a file
git checkout --ours src/file.ts
git add src/file.ts
```

## After Resolution

### Verify Resolution

```bash
# Make sure code compiles
npm run build  # or equivalent

# Run tests
npm test

# Check for markers accidentally left in
grep -r "<<<<<<" src/
grep -r "======" src/
grep -r ">>>>>>" src/
```

### Push Resolved Branch

```bash
# After rebase, force push is required
git push --force-with-lease

# --force-with-lease is safer than --force
# It fails if remote has new commits you haven't seen
```

### Communicate Resolution

```bash
# Comment on PR
"Resolved conflicts with main. Key decisions:
- Kept their timeout value (3000ms) per #123
- Combined our retry logic with their error handling"
```

## Coordination with Team

### Before Resolving

1. Check if anyone else is working on same files
2. Discuss complex conflicts before resolving
3. Consider pair programming for tricky merges

### After Resolving

1. Run full test suite
2. Note resolution decisions in PR
3. Request re-review if changes are significant

## Conflict Resolution Checklist

- [ ] Understood both changes (yours and theirs)
- [ ] Resolved all markers removed
- [ ] Code compiles
- [ ] Tests pass
- [ ] No unintended changes
- [ ] Pushed with force-with-lease
- [ ] PR updated with resolution notes

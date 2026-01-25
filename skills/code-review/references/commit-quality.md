# Commit Quality

Standards for commit messages and history.

## Why This Matters

Commits are documentation. They explain not just what changed but why. Good commit history makes debugging, reverting, and understanding code evolution possible. Bad history is noise that obscures the codebase's story.

## Commit Message Format

### Standard Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Components

**Type** (required):
| Type | When to Use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes nor adds |
| `docs` | Documentation only |
| `test` | Adding or fixing tests |
| `chore` | Maintenance (deps, config, tooling) |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

**Scope** (optional): Component or area affected
- `feat(auth): Add password reset`
- `fix(orders): Handle empty cart`
- `refactor(api): Extract validation middleware`

**Subject** (required):
- Imperative mood: "Add feature" not "Added feature"
- No period at end
- ≤50 characters
- Capitalize first letter

**Body** (optional but encouraged):
- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

**Footer** (optional):
- Reference issues: `Fixes #123`, `Closes #456`
- Note breaking changes: `BREAKING CHANGE: API endpoint renamed`
- Co-authors: `Co-authored-by: Name <email>`

### Examples

**Good:**
```
feat(orders): Add CSV export endpoint

Users can now export their order history as CSV. The export
includes order date, items, totals, and status.

- Adds GET /api/orders/export endpoint
- Supports date range filtering via query params
- Limited to 10,000 orders per export

Closes #234
```

**Good (simple):**
```
fix(auth): Handle expired token gracefully

Previously threw 500, now returns 401 with clear message.

Fixes #567
```

**Bad:**
```
fixed stuff
```

**Bad:**
```
WIP
```

**Bad:**
```
Refactoring and also fixed the bug and added some tests and updated deps
```

## Commit Atomicity

### One Logical Change Per Commit

Each commit should be:
- **Complete:** Doesn't leave code in broken state
- **Atomic:** Single logical change
- **Reversible:** Can be reverted without breaking other changes

**Good sequence:**
```
1. refactor(api): Extract validation to middleware
2. feat(api): Add order export endpoint
3. test(api): Add tests for order export
4. docs(api): Document export endpoint
```

**Bad sequence:**
```
1. WIP export feature
2. more work
3. fix tests
4. oops forgot this
5. final cleanup
```

### When to Split Commits

Split when:
- You're changing unrelated things
- Your message needs "and" (feat: Add X and fix Y)
- You could revert part but not all
- Different parts could be reviewed separately

Don't split when:
- Changes are truly atomic (feature + its tests)
- Splitting would leave intermediate broken states

## History Hygiene

### Before Opening PR

Clean up your history:

| Issue | Fix |
|-------|-----|
| WIP commits | Interactive rebase, squash |
| "oops" commits | Fixup into relevant commit |
| Merge commits from main | Rebase instead |
| Commits that break tests | Squash or reorder |

**Interactive rebase workflow:**
```bash
# Rebase last N commits
git rebase -i HEAD~N

# In editor:
pick abc123 feat: Add export endpoint
fixup def456 oops forgot error handling
pick ghi789 test: Add export tests
squash jkl012 more tests
```

### Merge Strategy

| Strategy | When to Use |
|----------|-------------|
| Squash merge | Small PRs, messy history |
| Rebase merge | Clean history, want to preserve commits |
| Merge commit | Want explicit merge record |

**Team should agree on strategy** — consistency matters more than choice.

## Commit Quality Checklist

### Per Commit

```markdown
- [ ] Message follows format (type: subject)
- [ ] Subject is imperative mood
- [ ] Subject ≤50 characters
- [ ] Body explains what and why (if not obvious)
- [ ] References issues if applicable
- [ ] Commit is atomic (one logical change)
- [ ] Tests pass at this commit
```

### PR History

```markdown
- [ ] No WIP or fixup commits
- [ ] No "oops" commits
- [ ] Logical progression of changes
- [ ] No merge commits from main (rebased)
- [ ] Each commit could be reverted independently
```

## Common Antipatterns

### The Megacommit

**Symptom:** Single commit with 500+ lines touching many files.

**Problem:** Can't revert partially, hard to review, hard to understand.

**Fix:** Split into logical commits, even retroactively via rebase.

### The Stream of Consciousness

**Symptom:**
```
1. start feature
2. more work
3. WIP
4. almost done
5. done
6. fix tests
7. really done
```

**Problem:** History tells no useful story.

**Fix:** Squash into meaningful commits before PR.

### The Merge Spaghetti

**Symptom:** Lots of "Merge branch 'main' into feature" commits.

**Problem:** Pollutes history, makes bisect difficult.

**Fix:** Rebase onto main instead of merging.

### The Lying Message

**Symptom:** Message says "fix: X" but commit also adds feature Y.

**Problem:** History is misleading, reverts are risky.

**Fix:** Split into separate commits.

## Review Guidance

### What to Check

| Aspect | Look For |
|--------|----------|
| Message format | Follows team conventions |
| Atomicity | Each commit is one logical change |
| Completeness | No broken intermediate states |
| Accuracy | Messages match actual changes |
| Cleanliness | No WIP, fixup, merge commits |

### When to Request Changes

- Commits leave tests broken
- Messages are meaningless ("asdf", "WIP")
- One commit mixes unrelated changes
- History is hard to follow

### When to Let It Go

- Minor formatting issues in messages
- Slightly large but logical commits
- Team hasn't agreed on standards (establish standards first)

## Output Format

When reporting commit quality:

```markdown
## Commit Quality

**Commits:** 4

### Assessment

✅ Good:
- Clear, descriptive messages
- Logical progression of changes
- Tests pass at each commit

⚠️ Issues:
- Commit 3 ("fix tests") should be squashed into commit 2
- Commit 4 message doesn't follow format (missing type)

### Commits

1. `feat(orders): Add export endpoint` ✅
   - Clear message, atomic change

2. `feat(orders): Add date filtering to export` ✅
   - Good incremental addition

3. `fix tests` ⚠️
   - Should be squashed into commit 2
   - Message doesn't follow format

4. `update readme` ⚠️
   - Should be `docs(orders): Document export endpoint`

### Recommendation

Minor cleanup needed before merge:
1. Squash commit 3 into commit 2
2. Reword commit 4 to follow format
```

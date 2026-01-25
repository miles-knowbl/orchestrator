# Diff Analysis

How to analyze what changed in a PR and whether the changes are appropriate.

## Why This Matters

The diff is the artifact under review. Understanding what changed—and what didn't change but should have—is fundamental to good review. Large or unfocused diffs hide bugs and make review ineffective.

## Diff Analysis Framework

### 1. Scope Alignment

**Does the diff match the PR description?**

| Situation | Action |
|-----------|--------|
| Diff matches description | Proceed with review |
| Diff is subset of description | Note incomplete work |
| Diff exceeds description | Question unrelated changes |
| Diff contradicts description | Request clarification |

**Red flags:**
- PR titled "Fix login bug" includes refactoring of unrelated code
- PR titled "Add feature X" also includes "while I was there" changes
- Description says one thing, code does another

### 2. Change Classification

Classify each change in the diff:

| Type | Examples | Review Focus |
|------|----------|--------------|
| **Feature** | New endpoints, components, logic | Correctness, completeness |
| **Bugfix** | Error handling, edge cases | Root cause addressed, regression test |
| **Refactor** | Restructuring without behavior change | Behavior preserved, tests pass |
| **Chore** | Dependencies, config, tooling | Security, compatibility |
| **Docs** | README, comments, API docs | Accuracy, completeness |
| **Test** | New tests, test fixes | Coverage, reliability |

**Mixed PRs are smells.** A PR should ideally be one type. "Feature + Refactor" should usually be two PRs.

### 3. Size Assessment

| Lines Changed | Assessment | Action |
|---------------|------------|--------|
| < 100 | Small | Normal review |
| 100-300 | Medium | Careful review |
| 300-500 | Large | Consider splitting |
| 500+ | Too large | Request split |

**Exceptions to size limits:**
- Generated code (migrations, schemas)
- Bulk renames/moves (but verify they're mechanical)
- New files with tests (test code inflates counts)
- Deletion-heavy changes (removing code is usually safe)

**Not exceptions:**
- "It's all related" — Large related changes should still be incremental
- "It was easier to do together" — Easier to write ≠ easier to review

### 4. Risk Distribution

**Where are the high-risk changes?**

| Risk Level | Examples |
|------------|----------|
| **Critical** | Auth, payments, data mutations, security |
| **High** | Core business logic, integrations, migrations |
| **Medium** | Feature code, UI components |
| **Low** | Tests, docs, config, logging |

**Good PRs:** High-risk changes are isolated, small, and obvious.
**Bad PRs:** High-risk changes are buried in large diffs or mixed with low-risk noise.

### 5. File-by-File Analysis

For each file changed:

```markdown
### [filename]

**Type:** Feature / Bugfix / Refactor / Chore / Docs / Test
**Risk:** Critical / High / Medium / Low
**Changes:**
- [Summary of what changed]
**Questions:**
- [Anything unclear or concerning]
```

### 6. What's Missing?

Sometimes the most important review finding is what's NOT in the diff:

| Expected | Why It Might Be Missing |
|----------|------------------------|
| Tests | Forgot, deferred, "tested manually" |
| Migration | Schema change without migration |
| Documentation | New feature without docs |
| Config changes | Feature flag, environment variable |
| Error handling | Happy path only |
| Logging | New operation without observability |

## Diff Patterns

### Pattern: Shotgun Surgery

**Symptom:** Many files changed, each with small modifications.

**Possible causes:**
- Legitimate cross-cutting change (rename, new parameter)
- Poor abstraction (change requires touching many places)
- Breaking encapsulation

**Review action:** Verify changes are mechanical and consistent. If not mechanical, question the design.

### Pattern: God Commit

**Symptom:** One commit with hundreds of lines across many files.

**Possible causes:**
- Developer forgot to commit incrementally
- Genuine atomic change (rare)
- Squashed messy history

**Review action:** Request breakdown or detailed explanation of how pieces relate.

### Pattern: Test-to-Code Ratio

**Healthy ratio:** 0.5x to 2x test lines per code line.

| Ratio | Interpretation |
|-------|----------------|
| 0x | No tests — flag unless trivial change |
| 0.1x-0.5x | Light testing — acceptable for simple changes |
| 0.5x-2x | Good coverage |
| 2x+ | Thorough — great for critical code |
| 10x+ | Excessive? — verify tests are meaningful |

### Pattern: Refactor + Feature

**Symptom:** PR includes both behavior changes and structural changes.

**Problem:** Can't tell if bugs are from feature or refactor.

**Solution:** Split into:
1. PR 1: Refactor (all tests pass, no behavior change)
2. PR 2: Feature (builds on clean refactored code)

## Diff Review Checklist

```markdown
## Diff Analysis

**PR:** [Title]
**Size:** [X] lines changed across [Y] files

### Scope
- [ ] Changes match PR description
- [ ] No unrelated changes
- [ ] Scope is appropriate (not too big)

### Classification
- [ ] Clear change type (feature/bugfix/refactor/etc.)
- [ ] Not mixing multiple change types

### Risk
- [ ] High-risk changes identified
- [ ] High-risk changes are isolated and reviewable
- [ ] No buried critical changes

### Completeness
- [ ] Expected tests present
- [ ] Documentation updated if needed
- [ ] Migration included if needed
- [ ] No obvious missing pieces

### Files Summary
| File | Type | Risk | Notes |
|------|------|------|-------|
| ... | ... | ... | ... |
```

## Output Format

When reporting diff analysis:

```markdown
## Diff Analysis

**Size:** 247 lines across 8 files — Medium, acceptable

**Scope:** ✅ Matches description "Add order export feature"

**Classification:** Feature + Test (appropriate)

**Risk Distribution:**
- Critical: None
- High: `src/services/order-service.js` (business logic)
- Medium: `src/controllers/order-controller.js`
- Low: `tests/*`, `README.md`

**Missing:**
- ⚠️ No migration for new `export_format` column
- 💡 Consider adding JSDoc for new public function

**Concerns:**
- None identified
```

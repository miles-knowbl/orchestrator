# PR Templates

Templates for Pull Request descriptions.

## System PR Template

For PRs implementing a complete system:

```markdown
## 🎯 System: [System Name]

Closes #[issue-number]

### Summary

[2-3 sentences describing what this system does]

### Changes

- [Major change 1]
- [Major change 2]
- [Major change 3]

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision 1] | [Choice] | [Why] |
| [Decision 2] | [Choice] | [Why] |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resource | List resources |
| POST | /api/resource | Create resource |
| ... | ... | ... |

### Database Changes

- [ ] No database changes
- [ ] Migration included: `YYYYMMDD_description.sql`
- [ ] Migration reviewed by DBA

### Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed

**Test Coverage:** [X]%

### Documentation

- [ ] README updated
- [ ] API documentation updated
- [ ] Architecture docs updated
- [ ] Runbook created/updated

### Security Considerations

- [ ] No security implications
- [ ] Security review requested
- [ ] Auth/authz properly implemented
- [ ] Input validation implemented
- [ ] No sensitive data logged

### Performance

- [ ] No performance implications
- [ ] Performance tested
- [ ] Meets SLA: [target]

### Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets
- [ ] All tests passing
- [ ] Documentation complete

### Screenshots/Recordings

[If applicable, add screenshots or recordings]

### How to Test

1. [Step 1]
2. [Step 2]
3. [Step 3]
```

## Feature PR Template

For PRs adding a feature to an existing system:

```markdown
## ✨ Feature: [Feature Name]

Closes #[issue-number]

### Summary

[Brief description of the feature]

### Changes

- [Change 1]
- [Change 2]

### Testing

- [ ] Unit tests added
- [ ] Manual testing completed

### Checklist

- [ ] Code follows style guidelines
- [ ] Tests passing
- [ ] Documentation updated (if needed)

### How to Test

1. [Step 1]
2. [Step 2]
```

## Bug Fix PR Template

For PRs fixing bugs:

```markdown
## 🐛 Fix: [Bug Description]

Closes #[issue-number]

### Problem

[What was happening]

### Root Cause

[Why it was happening]

### Solution

[What was changed to fix it]

### Testing

- [ ] Added test that reproduces the bug
- [ ] Test now passes with fix
- [ ] Regression tests still pass

### Checklist

- [ ] Root cause identified
- [ ] Fix is minimal and targeted
- [ ] Tests added to prevent regression
```

## Hotfix PR Template

For urgent production fixes:

```markdown
## 🚨 Hotfix: [Issue]

### Urgency

**Severity:** [Critical/High]
**Impact:** [Who/what is affected]
**Reported:** [When/where]

### Problem

[What is broken in production]

### Fix

[Minimal change to resolve]

### Rollback Plan

```bash
[Commands to rollback if needed]
```

### Testing

- [ ] Fix verified locally
- [ ] Fix verified in staging
- [ ] Monitoring in place

### Deploy Steps

1. [Step 1]
2. [Step 2]

### Post-Deploy Verification

- [ ] [Check 1]
- [ ] [Check 2]
```

## Documentation PR Template

For documentation-only changes:

```markdown
## 📚 Docs: [What's being documented]

### Changes

- [Doc change 1]
- [Doc change 2]

### Preview

[Link to preview if available]

### Checklist

- [ ] Spelling/grammar checked
- [ ] Links verified
- [ ] Code examples tested
```

## Dependency Update PR Template

For updating dependencies:

```markdown
## 📦 Deps: Update [package] to [version]

### Changes

| Package | From | To | Changelog |
|---------|------|-----|-----------|
| [pkg] | [old] | [new] | [link] |

### Breaking Changes

- [ ] None
- [ ] Yes: [describe]

### Security Fixes

- [ ] None
- [ ] Yes: [CVE if applicable]

### Testing

- [ ] All tests passing
- [ ] Application tested manually
- [ ] No behavior changes observed

### Checklist

- [ ] Lock file updated
- [ ] No unintended downgrades
- [ ] Changelog reviewed
```

## PR Description Best Practices

### Do

- Link to the issue being addressed
- Explain WHY not just WHAT
- Include testing instructions
- Add screenshots for UI changes
- List any breaking changes
- Note any required follow-up

### Don't

- Leave the description empty
- Copy-paste the entire diff
- Include sensitive information
- Make it longer than necessary

## Creating PR with Template

### Using File

```bash
# Create PR_DESCRIPTION.md with template content
gh pr create \
  --base main \
  --head feature/my-feature \
  --title "feat: My Feature" \
  --body-file PR_DESCRIPTION.md
```

### Using Here-doc

```bash
gh pr create \
  --base main \
  --head feature/my-feature \
  --title "feat: My Feature" \
  --body "## Summary

Implements XYZ feature.

Closes #123

## Changes

- Added foo
- Modified bar

## Testing

- [x] Unit tests
- [x] Manual testing"
```

## Repository PR Template

Create `.github/PULL_REQUEST_TEMPLATE.md` for automatic template:

```markdown
## Summary

[Brief description]

Closes #

## Changes

-

## Testing

- [ ] Tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] All tests passing
```

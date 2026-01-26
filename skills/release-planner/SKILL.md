---
name: release-planner
description: "Plan releases by scoping included changes, defining version strategy, coordinating cherry-picks, and establishing release criteria. Manages the ceremony of shipping."
phase: INIT
category: core
version: "1.0.0"
depends_on: []
tags: [release, planning, versioning, coordination]
---

# Release Planner

Plan a release by scoping the changes to include, determining the version number, defining release criteria, identifying blockers, and establishing the rollout strategy. This skill manages the ceremony around shipping: ensuring the right things go out, in the right order, with the right safeguards.

## When to Use

- Before cutting a release from main or a release branch
- When multiple PRs or features need to be coordinated into a single release
- When deciding between a major, minor, or patch version bump
- When cherry-picking fixes into a release branch
- When establishing go/no-go criteria for a release

## Process

1. **Identify changes since last release** - Use `git log` from the last release tag to HEAD. List all commits, PRs merged, and issues closed. Group by author and component for a complete picture.
2. **Classify changes** - Categorize each change as: feature (new capability), fix (bug correction), breaking (backward-incompatible change), chore (internal improvement, no user impact), or docs (documentation only). Flag any change that requires user action.
3. **Determine version bump** - Apply semantic versioning: MAJOR for breaking changes, MINOR for new features (backward compatible), PATCH for bug fixes only. If the release contains both features and fixes, MINOR wins. If it contains breaking changes, MAJOR wins.
4. **Define release criteria** - Establish the conditions that must be true before the release ships: all tests pass on the release branch, no known P0 or P1 bugs, performance benchmarks within acceptable range, documentation updated for new features.
5. **Identify release blockers** - Review open issues and PRs tagged for this release. Any unresolved blocker prevents the release. Document each blocker with its status and owner.
6. **Plan rollout strategy** - Define how the release will be deployed: all at once, canary, staged rollout, or feature-flagged. Include monitoring criteria for proceeding or rolling back at each stage.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| RELEASE-PLAN.md | Markdown | Complete release plan |

### RELEASE-PLAN.md Contents

- **Version**: Proposed version number with semver justification
- **Release Date**: Target date (or "when criteria met")
- **Changes Included**: Categorized list of all changes (features, fixes, breaking, chores)
- **Release Criteria**: Conditions that must be satisfied before shipping
- **Blockers**: Open issues or PRs that block the release, with owners
- **Cherry-Picks**: Any commits to cherry-pick into the release branch (with hashes)
- **Rollout Strategy**: How the release will be deployed (canary, staged, full)
- **Rollback Plan**: How to roll back if post-release monitoring shows problems
- **Timeline**: Key dates (code freeze, RC cut, release, post-release monitoring)
- **Stakeholders**: Who needs to be informed and who gives final approval

## Quality Criteria

- All changes since the last release are accounted for (none missing from the list)
- Version number follows semver correctly based on the types of changes included
- Release criteria are testable and specific (not "everything looks good")
- Every blocker has an owner and a resolution plan
- Rollout strategy includes monitoring and rollback criteria
- Breaking changes are called out prominently with migration guidance
- Timeline is realistic and accounts for testing and review time

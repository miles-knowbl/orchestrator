---
name: changelog-generator
description: "Generate structured changelogs from git history, PRs, and commit messages. Categorizes changes by type (Added, Changed, Deprecated, Removed, Fixed, Security) following Keep a Changelog format."
phase: DOCUMENT
category: engineering
version: "1.0.0"
depends_on: [release-planner]
tags: [release, changelog, documentation, versioning]
---

# Changelog Generator

Generate a structured, human-readable changelog from git history, pull requests, and commit messages. Follow the Keep a Changelog format to produce entries that are useful to both developers and users. The changelog is the definitive record of what changed between versions.

## When to Use

- During the release process, after changes are scoped by the release planner
- After a version is finalized but before it is published
- When maintaining a running CHANGELOG.md for the project
- When preparing release artifacts for distribution

## Process

1. **Read git log since last release tag** - Identify the last release tag and collect all commits between that tag and the current HEAD (or release branch tip). Include merge commits for PR context.
2. **Parse commit messages and PR titles** - Extract the meaningful description from each change. Use PR titles when available (they are usually better-written than individual commit messages). Follow conventional commit prefixes if the project uses them (feat:, fix:, chore:, etc.).
3. **Categorize by type** - Assign each change to one of the Keep a Changelog categories:
   - **Added**: New features or capabilities
   - **Changed**: Modifications to existing features
   - **Deprecated**: Features marked for future removal
   - **Removed**: Features or capabilities removed
   - **Fixed**: Bug fixes
   - **Security**: Vulnerability fixes or security improvements
4. **Group by component or area** - Within each category, group related changes by the part of the system they affect (API, CLI, UI, database, etc.). This helps readers find relevant changes quickly.
5. **Write human-readable descriptions** - Rewrite terse commit messages into clear, user-oriented descriptions. Each entry should answer: what changed and why it matters. Start with a verb (Add, Fix, Update, Remove).
6. **Link to PRs and issues** - Add references to the relevant pull request or issue for each entry. Use the format `([#123](url))` for inline links.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| CHANGELOG.md | Markdown (appended) | Versioned changelog following Keep a Changelog |

### CHANGELOG.md Entry Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Description of new feature ([#123](url))

### Changed
- Description of modification ([#124](url))

### Fixed
- Description of bug fix ([#125](url))

### Security
- Description of security fix ([#126](url))
```

Follow the full specification at [keepachangelog.com](https://keepachangelog.com).

## Quality Criteria

- Every meaningful change is included (no silent changes that surprise users)
- Categories are correct (a bug fix is not listed under "Added")
- Descriptions are human-readable and user-oriented (not raw commit messages like "fix stuff")
- Each entry starts with a verb and describes what changed from the user's perspective
- PR or issue links are included for traceability
- Internal-only changes (CI config, test refactors) are either omitted or clearly marked as internal
- The version number and date match the release plan
- The format follows Keep a Changelog conventions exactly

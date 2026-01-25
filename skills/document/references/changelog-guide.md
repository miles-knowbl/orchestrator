# Changelog Guide

How to write and maintain changelogs and release notes.

## Changelog Principles

1. **For humans**: Write for people, not machines
2. **Chronological**: Newest changes first
3. **Grouped**: Organize by change type
4. **Linked**: Reference issues, PRs, commits
5. **Versioned**: Follow semantic versioning

## Keep a Changelog Format

Based on [keepachangelog.com](https://keepachangelog.com/).

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature being developed

## [1.2.0] - 2024-01-15

### Added
- User authentication via OAuth (#123)
- Rate limiting on API endpoints (#145)
- Dark mode support in web UI (#156)

### Changed
- Improved error messages for validation errors
- Upgraded Node.js from 18 to 20 (#167)
- Refactored database queries for better performance

### Deprecated
- The `legacyAuth` option will be removed in v2.0

### Removed
- Dropped support for Node.js 16

### Fixed
- Memory leak in long-running WebSocket connections (#178)
- Incorrect timezone handling in date pickers (#182)
- Race condition in concurrent order updates (#189)

### Security
- Updated `lodash` to patch CVE-2024-1234
- Fixed XSS vulnerability in user profile page (#195)

## [1.1.0] - 2024-01-01

### Added
- Feature A
- Feature B

### Fixed
- Bug X
- Bug Y

## [1.0.0] - 2023-12-01

Initial release.

### Added
- Core functionality
- API endpoints
- Web interface

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

## Change Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Added** | New features | New API endpoint, new config option |
| **Changed** | Changes to existing features | Updated behavior, improved performance |
| **Deprecated** | Features to be removed | Old API version, legacy option |
| **Removed** | Features removed | Deleted endpoint, dropped support |
| **Fixed** | Bug fixes | Resolved crash, fixed calculation |
| **Security** | Security fixes | Patched vulnerability, updated dependency |

## Writing Changelog Entries

### Good Entries

```markdown
### Added
- User authentication via Google OAuth - Users can now sign in with their Google accounts (#123)
- Export data to CSV - Added "Export" button to data tables

### Fixed  
- Fixed memory leak when processing large files - Memory usage now stays constant regardless of file size (#178)
- Order totals now correctly handle decimal currencies like JPY (#182)

### Security
- Updated `jsonwebtoken` to 9.0.0 to address CVE-2023-48238
```

### Bad Entries

```markdown
### Added
- Added stuff (#123)  ❌ Too vague
- New feature  ❌ No description

### Fixed
- Fixed bug  ❌ What bug?
- Various fixes  ❌ Meaningless

### Changed
- Updated dependencies  ❌ Which ones? Why?
- Refactored code  ❌ User-facing impact?
```

### Entry Format

```markdown
- [Brief description] - [Additional context if needed] ([#PR] or [#issue])
```

Examples:
```markdown
- Add user profile page - Users can now view and edit their profile (#234)
- Fix crash when uploading files larger than 10MB (#456)
- Update React from 17 to 18 for improved performance (#567)
```

## Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

| Change | Version Bump | Example |
|--------|--------------|---------|
| Breaking changes | MAJOR | 1.0.0 → 2.0.0 |
| New features (backward compatible) | MINOR | 1.0.0 → 1.1.0 |
| Bug fixes (backward compatible) | PATCH | 1.0.0 → 1.0.1 |

### Breaking Changes

Document breaking changes prominently:

```markdown
## [2.0.0] - 2024-02-01

### ⚠️ Breaking Changes

- **API**: Renamed `userId` to `user_id` in all responses
  - Migration: Update your code to use `user_id`
  
- **Config**: Removed `legacyMode` option
  - Migration: Remove `legacyMode` from your config file

- **Minimum Node.js version is now 18**
  - Migration: Upgrade Node.js to 18 or later

### Migration Guide

See [MIGRATION.md](MIGRATION.md) for detailed upgrade instructions.
```

## Release Notes

More detailed than changelog entries, for major releases.

```markdown
# Release Notes: v2.0.0

**Release Date:** 2024-02-01

We're excited to announce version 2.0 of Example App! This major release 
includes significant performance improvements, a redesigned API, and 
several new features.

## Highlights

### 🚀 50% Faster Performance

We've completely rewritten the data processing engine. Benchmarks show:
- API response times reduced by 50%
- Memory usage reduced by 30%
- File processing 3x faster

### 🔐 Enhanced Security

- Two-factor authentication now available for all accounts
- API keys can now have scoped permissions
- Audit logs for all admin actions

### 🎨 Redesigned Dashboard

The dashboard has been completely redesigned:
- New card-based layout
- Real-time updates
- Dark mode support

## Breaking Changes

This release includes breaking changes. Please review the 
[Migration Guide](MIGRATION.md) before upgrading.

### API Changes

| Old | New |
|-----|-----|
| `GET /users/:userId` | `GET /users/:user_id` |
| `response.userId` | `response.user_id` |

### Configuration Changes

The following config options have been removed:
- `legacyMode` - Legacy mode is no longer supported
- `oldApiVersion` - Only v2 API is supported

### Minimum Requirements

- Node.js 18+ (was 16+)
- PostgreSQL 14+ (was 12+)

## New Features

### User Authentication

```javascript
// New OAuth support
const user = await auth.loginWithGoogle();

// Two-factor authentication
await auth.enableTwoFactor(user.id);
```

### Data Export

Users can now export their data in multiple formats:
- CSV
- JSON
- Excel

### Webhooks

Configure webhooks to receive real-time notifications:

```javascript
await webhooks.create({
  url: 'https://your-server.com/webhook',
  events: ['order.created', 'order.updated']
});
```

## Bug Fixes

- Fixed memory leak in WebSocket connections (#178)
- Fixed incorrect date formatting in reports (#182)
- Fixed race condition in order processing (#189)

## Deprecations

The following features are deprecated and will be removed in v3.0:

- `legacyExport()` - Use `export()` instead
- `v1` API endpoints - Use `v2` endpoints

## Known Issues

- Dashboard may flicker on Safari 15 (workaround: use Safari 16+)
- CSV export limited to 100,000 rows

## Upgrade Instructions

1. Review breaking changes above
2. Read the [Migration Guide](MIGRATION.md)
3. Update dependencies: `npm update example-app`
4. Run migrations: `npm run migrate`
5. Test in staging before production

## Thank You

Thanks to all 23 contributors who made this release possible!

Special thanks to @alice, @bob, and @carol for major contributions.

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for the complete list of changes.
```

## Automation

### Conventional Commits

Use conventional commit messages for automated changelogs:

```
feat: add user authentication
fix: resolve memory leak in file processing
docs: update API documentation
chore: upgrade dependencies
BREAKING CHANGE: rename userId to user_id
```

### Tools

| Tool | Purpose |
|------|---------|
| [standard-version](https://github.com/conventional-changelog/standard-version) | Automate versioning and changelog |
| [semantic-release](https://github.com/semantic-release/semantic-release) | Fully automated releases |
| [release-please](https://github.com/googleapis/release-please) | Google's release automation |

### GitHub Actions Example

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Release
        run: npx semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Best Practices

### Do

- ✅ Write from user's perspective
- ✅ Include PR/issue references
- ✅ Group related changes
- ✅ Highlight breaking changes
- ✅ Keep unreleased section updated
- ✅ Include migration instructions

### Don't

- ❌ Use commit messages as entries
- ❌ Include internal refactoring (unless it affects users)
- ❌ Write vague entries like "bug fixes"
- ❌ Mix unrelated changes
- ❌ Forget to update version links

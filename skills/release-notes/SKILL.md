---
name: release-notes
description: "Write user-facing release notes that communicate what changed, why it matters, and what to do. Translates technical changes into user impact language."
phase: DOCUMENT
category: core
version: "1.0.0"
depends_on: [changelog-generator]
tags: [release, documentation, communication, users]
---

# Release Notes

Write user-facing release notes that communicate changes in terms of impact, not implementation. While the changelog is a complete technical record, release notes are a curated narrative: they highlight what matters to users, explain why changes were made, and provide clear instructions for upgrading. Release notes are marketing and documentation combined.

## When to Use

- After the changelog is generated for a release
- Before publishing a release to users (GitHub release, blog post, email)
- When communicating breaking changes that require user action
- For major or minor releases (patch releases may only need the changelog)

## Process

1. **Read the changelog for this version** - Review all entries in the changelog. Understand the full scope of changes.
2. **Identify user-facing changes** - Filter out internal changes (CI updates, test refactors, dependency bumps with no behavior change). Focus on changes that users will notice or that affect their workflows.
3. **Write impact-first descriptions** - For each user-facing change, lead with the benefit or impact, not the technical implementation. Instead of "Refactored query engine to use prepared statements," write "Database queries are now 40% faster and resistant to SQL injection."
4. **Add migration instructions for breaking changes** - For every breaking change, provide explicit step-by-step instructions for migrating. Include before/after code examples. Test the migration instructions yourself to verify they work.
5. **Include the upgrade path** - Document how to upgrade: the command to run, configuration changes needed, and any prerequisites. Make it copy-pasteable.
6. **Highlight new features with examples** - For significant new features, include a short usage example (code snippet, CLI command, or screenshot) so users can immediately understand and try the feature.

## Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| RELEASE-NOTES.md | Markdown | User-facing release communication |

### RELEASE-NOTES.md Contents

- **Version and Date**: The version number and release date
- **Highlights**: The top 3 most impactful changes, each in 1-2 sentences
- **What's New**: New features with descriptions and usage examples
- **What's Changed**: Modifications to existing behavior with context on why
- **Breaking Changes**: Each breaking change with:
  - What changed
  - Why it changed
  - Migration guide (step-by-step with code examples)
- **Bug Fixes**: Notable fixes that users may have been affected by
- **Known Issues**: Any known limitations or issues in this release
- **Upgrade Instructions**: Step-by-step guide to upgrade from the previous version

## Quality Criteria

- Written for users, not developers: avoids internal jargon and implementation details
- Highlights lead with impact ("50% faster startup") not implementation ("rewrote init loop")
- Every breaking change has a complete, tested migration guide with code examples
- New features include at least one usage example
- Upgrade instructions are copy-pasteable and tested
- Known issues are honest and include workarounds where available
- The tone is professional and helpful, not apologetic or overly promotional
- Release notes are concise: users should be able to scan them in under 2 minutes

---
name: gotcha-documenter
description: "Document project gotchas - the non-obvious things that trip people up. Captures edge cases, surprising behaviors, common mistakes, and workarounds that aren't immediately apparent from code or docs."
phase: DOCUMENT
category: meta
version: "1.0.0"
depends_on: ["context-cultivation"]
tags: [documentation, knowledge-management, onboarding, gotchas]
---

# Gotcha Documenter

Document the things that trip people up.

## When to Use

- **After context cultivation** - Insights reveal gotchas to document
- **Onboarding new team members** - Capture what confused you
- **Bug discovered** - Root cause was a gotcha worth documenting
- **Code review feedback** - Reviewer caught something non-obvious
- **Stack Overflow moment** - You had to search for a solution

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `GOTCHAS.md` | Project root | Always |

## Gotcha Categories

### Code Gotchas
- Surprising API behaviors
- Hidden side effects
- Non-obvious parameter requirements
- Implicit ordering dependencies

### Environment Gotchas
- Platform-specific behaviors
- Configuration requirements
- Version compatibility issues
- Path/permission issues

### Process Gotchas
- Required manual steps
- Order of operations matters
- Common mistakes in workflow
- Things the docs don't mention

### Integration Gotchas
- Third-party quirks
- Authentication edge cases
- Rate limits and timeouts
- Data format surprises

## Template

```markdown
## [Category]: [Short Title]

**Gotcha:** [What trips people up]

**Why it happens:** [Root cause or context]

**Solution:** [How to handle it]

**Example:**
\`\`\`
[Code or steps showing the gotcha and fix]
\`\`\`

**Discovered:** [Date, context]
```

## Quality Criteria

A good gotcha entry:
- Is specific and actionable
- Explains the "why" not just the "what"
- Includes a concrete example
- Suggests a solution or workaround
- Links to related issues/PRs if applicable

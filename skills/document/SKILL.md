---
name: document
description: "Generate and maintain technical documentation. Creates README files, API documentation, code comments, architecture docs, and user guides. Ensures documentation stays accurate, accessible, and useful. Follows documentation standards and best practices for different audiences."
---

# Document

Generate and maintain technical documentation.

## When to Use

- **New project** — Create initial documentation suite
- **New feature** — Document new functionality
- **API changes** — Update API documentation
- **Onboarding** — Create guides for new team members
- **Release** — Generate changelogs and release notes
- When you say: "document this", "write docs for", "create a README"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `readme-templates.md` | Templates for effective READMEs |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `api-documentation.md` | When documenting APIs |
| `architecture-docs.md` | When documenting architecture |
| `code-comments.md` | When adding inline documentation |
| `changelog-guide.md` | When writing changelogs |

**Verification:** Ensure README.md exists with quick start that actually works.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `README.md` | Project root | Always |
| API documentation | `docs/` | If public API exists |
| `CHANGELOG.md` | Project root | For versioned projects |

## Core Concept

Document answers: **"How do I explain this clearly to someone who isn't me?"**

Good documentation is:
- **Accurate** — Matches the actual code/system
- **Accessible** — Written for the target audience
- **Actionable** — Readers can accomplish their goals
- **Maintained** — Updated when things change

Documentation is NOT:
- Comments on every line of code
- Duplicating what the code already says
- A one-time task (it requires maintenance)

## Documentation Types

| Type | Audience | Purpose | Update Frequency |
|------|----------|---------|------------------|
| **README** | New developers, users | First impression, quick start | Every major change |
| **API Docs** | Developers integrating | How to use the API | Every API change |
| **Code Comments** | Future maintainers | Why, not what | With code changes |
| **Architecture** | Senior devs, architects | System design decisions | Major changes only |
| **Runbooks** | Operators, on-call | How to operate/fix | After incidents |
| **User Guides** | End users | How to use the product | Feature releases |
| **Tutorials** | Learners | Step-by-step learning | Periodically |
| **ADRs** | Future team members | Why decisions were made | When decisions made |

## The Documentation Process

```
┌─────────────────────────────────────────────────────────┐
│                DOCUMENTATION PROCESS                    │
│                                                         │
│  1. IDENTIFY AUDIENCE                                   │
│     └─→ Who will read this? What do they need?          │
│                                                         │
│  2. DETERMINE SCOPE                                     │
│     └─→ What needs documenting? What's out of scope?    │
│                                                         │
│  3. GATHER INFORMATION                                  │
│     └─→ Code, specs, interviews, existing docs          │
│                                                         │
│  4. STRUCTURE CONTENT                                   │
│     └─→ Organize for reader's journey                   │
│                                                         │
│  5. WRITE DRAFT                                         │
│     └─→ Clear, concise, example-rich                    │
│                                                         │
│  6. REVIEW & VERIFY                                     │
│     └─→ Technically accurate? Readable?                 │
│                                                         │
│  7. PUBLISH & MAINTAIN                                  │
│     └─→ Keep it current, remove stale content           │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Identify Audience

### Audience Analysis

| Audience | Knowledge Level | Goals | Preferred Format |
|----------|-----------------|-------|------------------|
| **New developer** | Low project knowledge | Get started quickly | Quick start, examples |
| **Experienced dev** | High technical skill | Reference details | API docs, specs |
| **Operator** | Knows how to run | Fix issues fast | Runbooks, troubleshooting |
| **End user** | Non-technical | Accomplish tasks | Screenshots, step-by-step |
| **Manager** | High-level view | Understand capabilities | Overview, architecture |

### Writing for Your Audience

```markdown
## For New Developers
- Assume no prior context
- Start with "what is this?"
- Provide copy-paste examples
- Link to prerequisites

## For Experienced Developers
- Skip the basics
- Provide complete reference
- Include edge cases
- Link to source code

## For End Users
- Use their language, not technical jargon
- Focus on tasks, not features
- Include screenshots
- Provide troubleshooting
```

## Step 2: Determine Scope

### Documentation Inventory

```markdown
## Documentation Needed

### Essential (Must Have)
- [ ] README with quick start
- [ ] Installation instructions
- [ ] Basic usage examples
- [ ] Environment variables reference

### Important (Should Have)
- [ ] API documentation
- [ ] Architecture overview
- [ ] Contributing guide
- [ ] Troubleshooting guide

### Nice to Have
- [ ] Tutorials for common tasks
- [ ] Video walkthroughs
- [ ] Migration guides
- [ ] Performance tuning guide
```

### What NOT to Document

- Implementation details that change frequently
- Things the code clearly expresses
- Obvious type information
- Internal helper functions

## Step 3: Gather Information

### Information Sources

| Source | What to Extract |
|--------|-----------------|
| **Code** | Actual behavior, APIs, types |
| **Tests** | Usage examples, edge cases |
| **Specs** | Intended behavior, requirements |
| **Git history** | Why changes were made |
| **Interviews** | Tribal knowledge, gotchas |
| **Existing docs** | What to update/remove |
| **Support tickets** | Common questions |

### Extraction Techniques

```bash
# Extract function signatures
grep -r "export function\|export const" src/

# Find public APIs
grep -r "@public\|@api" src/

# Extract environment variables
grep -r "process\.env\." src/ | grep -oE "process\.env\.[A-Z_]+" | sort -u

# Find TODOs and FIXMEs
grep -r "TODO\|FIXME" src/
```

## Step 4: Structure Content

### Information Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DOCUMENTATION MAP                    │
│                                                         │
│  Landing (README)                                       │
│  ├── What is this?                                      │
│  ├── Quick Start ←── Most users start here              │
│  └── Links to deeper docs                               │
│                                                         │
│  Getting Started                                        │
│  ├── Installation                                       │
│  ├── Configuration                                      │
│  └── First steps                                        │
│                                                         │
│  Guides (Task-oriented)                                 │
│  ├── How to do X                                        │
│  ├── How to do Y                                        │
│  └── How to do Z                                        │
│                                                         │
│  Reference (Information-oriented)                       │
│  ├── API Reference                                      │
│  ├── Configuration Reference                            │
│  └── CLI Reference                                      │
│                                                         │
│  Explanation (Understanding-oriented)                   │
│  ├── Architecture                                       │
│  ├── Design decisions                                   │
│  └── Concepts                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### The Diátaxis Framework

| Quadrant | Purpose | Form |
|----------|---------|------|
| **Tutorials** | Learning | Lessons (do this, then this) |
| **How-to Guides** | Problem-solving | Steps (to achieve X, do Y) |
| **Reference** | Information | Dry description (X is Y) |
| **Explanation** | Understanding | Discussion (X works because Y) |

## Step 5: Write Draft

### Writing Principles

**Be concise.** Remove unnecessary words.
```markdown
# Bad
In order to install the application, you will need to run the following command:

# Good
Install with:
```

**Use active voice.**
```markdown
# Bad
The configuration file should be created by the user.

# Good
Create a configuration file.
```

**Front-load important information.**
```markdown
# Bad
After completing the installation process and configuring your environment 
variables, you can start the server by running npm start.

# Good
Run `npm start` to start the server.

Prerequisites: Install dependencies and configure environment variables first.
```

**Show, don't just tell.**
```markdown
# Bad
The API returns user data.

# Good
The API returns user data:
```json
{
  "id": "123",
  "name": "Alice",
  "email": "alice@example.com"
}
```
```

→ See `references/writing-guidelines.md`

## README Template

```markdown
# Project Name

One-line description of what this project does.

## Features

- Feature 1
- Feature 2
- Feature 3

## Quick Start

```bash
# Install
npm install project-name

# Configure
cp .env.example .env

# Run
npm start
```

## Documentation

- [Installation Guide](docs/installation.md)
- [API Reference](docs/api.md)
- [Configuration](docs/configuration.md)
- [Contributing](CONTRIBUTING.md)

## Requirements

- Node.js 18+
- PostgreSQL 14+

## License

MIT
```

→ See `references/readme-templates.md`

## API Documentation

### Endpoint Documentation

```markdown
## Create User

Creates a new user account.

### Request

```http
POST /api/users
Content-Type: application/json
Authorization: Bearer <token>
```

#### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| name | string | Yes | Display name (1-100 chars) |
| role | string | No | User role (default: "user") |

#### Example

```json
{
  "email": "alice@example.com",
  "name": "Alice Smith",
  "role": "admin"
}
```

### Response

#### Success (201 Created)

```json
{
  "data": {
    "id": "usr_123",
    "email": "alice@example.com",
    "name": "Alice Smith",
    "role": "admin",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Errors

| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 409 | EMAIL_EXISTS | Email already registered |
```

→ See `references/api-documentation.md`

## Code Comments

### When to Comment

| Comment | Don't Comment |
|---------|---------------|
| **Why** something is done | **What** code does (code should be clear) |
| Complex algorithms | Simple operations |
| Non-obvious side effects | Type information (use types) |
| Workarounds and their reasons | Obvious function behavior |
| Public API contracts | Implementation details |

### Comment Styles

```typescript
/**
 * Calculates the optimal shipping route for an order.
 * 
 * Uses Dijkstra's algorithm with warehouse proximity weighting.
 * Falls back to nearest warehouse if no optimal route found.
 * 
 * @param order - The order to ship
 * @param warehouses - Available warehouses with inventory
 * @returns The selected warehouse and estimated delivery date
 * @throws {NoInventoryError} If no warehouse has sufficient inventory
 * 
 * @example
 * const route = await calculateRoute(order, warehouses);
 * console.log(route.warehouse.name, route.estimatedDelivery);
 */
export async function calculateShippingRoute(
  order: Order,
  warehouses: Warehouse[]
): Promise<ShippingRoute> {
  // ...
}

// BAD: Comments that repeat the code
// Increment counter by 1
counter++;

// GOOD: Comments that explain why
// Skip the first item because it's the header row
for (let i = 1; i < rows.length; i++) {
  // ...
}

// GOOD: Warning about non-obvious behavior
// WARNING: This function mutates the input array for performance.
// Clone the array first if you need to preserve the original.
function sortInPlace(items: Item[]): void {
  // ...
}
```

→ See `references/code-comments.md`

## Architecture Documentation

### Architecture Overview

```markdown
# Architecture Overview

## System Context

[Diagram showing system and external actors]

## High-Level Architecture

[Diagram showing major components]

## Key Design Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| PostgreSQL for primary data | ACID compliance, team expertise | Scaling requires more effort |
| Redis for caching | Sub-ms latency, built-in expiration | Additional infrastructure |
| Event-driven for async | Decoupling, resilience | Eventual consistency |

## Data Flow

[Diagram showing how data moves through system]

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React | User interface |
| API | Node.js/Express | REST API |
| Database | PostgreSQL | Primary data store |
| Cache | Redis | Session, hot data |
| Queue | SQS | Async processing |

## Further Reading

- [ADR-001: Database Selection](adrs/001-database.md)
- [ADR-002: Authentication Approach](adrs/002-auth.md)
```

→ See `references/architecture-docs.md`

## Runbooks

### Runbook Template

```markdown
# Runbook: [Issue Name]

## Overview
Brief description of the issue and its impact.

## Symptoms
- Symptom 1 (what you'll see)
- Symptom 2
- Related alerts: [Alert names]

## Impact
- User impact: [Description]
- Business impact: [Description]
- Severity: [P1/P2/P3]

## Quick Diagnosis

```bash
# Check service health
curl https://api.example.com/health

# Check recent logs
kubectl logs -l app=api --tail=100

# Check metrics
# [Link to dashboard]
```

## Resolution Steps

### Step 1: [First action]
```bash
[Command to run]
```
Expected output: [What you should see]

### Step 2: [Second action]
[Instructions]

### Step 3: Verify fix
```bash
# Verify service is healthy
curl https://api.example.com/health
```

## Escalation
If the above steps don't resolve the issue:
1. Page the on-call engineer: [Contact]
2. Escalate to: [Team/Person]

## Post-Incident
- [ ] Create incident ticket
- [ ] Update this runbook if needed
- [ ] Schedule post-mortem if P1/P2

## Related
- [Link to architecture docs]
- [Link to related runbooks]
```

→ See `references/runbook-templates.md`

## Changelog & Release Notes

### Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New feature X for doing Y

### Changed
- Improved performance of Z by 50%

### Fixed
- Bug where A happened when B

## [2.1.0] - 2024-01-15

### Added
- User authentication via OAuth (#123)
- Rate limiting on API endpoints (#145)
- Dark mode support (#156)

### Changed
- Upgraded Node.js to v20 (#167)
- Improved error messages for validation errors

### Fixed
- Memory leak in long-running connections (#178)
- Incorrect timezone handling in reports (#182)

### Security
- Updated dependencies to patch CVE-2024-1234

### Deprecated
- The `legacyAuth` option will be removed in v3.0

## [2.0.0] - 2024-01-01

### Breaking Changes
- Renamed `userId` to `user_id` in API responses
- Minimum Node.js version is now 18

### Migration Guide
See [MIGRATION.md](MIGRATION.md) for upgrade instructions.
```

→ See `references/changelog-guide.md`

## Documentation Maintenance

### Keeping Docs Current

| Trigger | Action |
|---------|--------|
| Code PR merged | Update relevant docs in same PR |
| New feature shipped | Update README, user docs |
| API changed | Update API docs |
| Incident resolved | Update runbooks |
| Question asked twice | Add to FAQ/docs |

### Documentation Review Checklist

```markdown
## Periodic Review Checklist

### Accuracy
- [ ] Code examples still work
- [ ] Screenshots match current UI
- [ ] Links are not broken
- [ ] Version numbers are current

### Completeness
- [ ] New features are documented
- [ ] Deprecated features are marked
- [ ] Common questions are answered

### Quality
- [ ] No spelling/grammar errors
- [ ] Consistent terminology
- [ ] Clear and concise
- [ ] Properly formatted
```

### Stale Documentation Indicators

- 🚩 Last updated >6 months ago
- 🚩 References old versions
- 🚩 Broken code examples
- 🚩 Screenshots don't match UI
- 🚩 "TODO" or "Coming soon" sections
- 🚩 References removed features

## Documentation Tools

| Tool | Purpose | Best For |
|------|---------|----------|
| **Markdown** | Simple docs | README, guides |
| **JSDoc/TSDoc** | Code docs | API documentation |
| **OpenAPI/Swagger** | API specs | REST API docs |
| **Docusaurus** | Doc sites | Product documentation |
| **Storybook** | Component docs | UI libraries |
| **Mermaid** | Diagrams | Architecture docs |

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `spec` | Specs are internal; docs are external-facing |
| `architect` | ADRs document architecture decisions |
| `implement` | Code comments are part of implementation |
| `scaffold` | Initial README is part of scaffolding |
| `code-review` | Review should check doc updates |

## Key Principles

**Write for your reader.** Not for yourself.

**Less is more.** Concise docs get read; verbose docs get skipped.

**Show examples.** One good example is worth paragraphs of explanation.

**Keep it current.** Outdated docs are worse than no docs.

**Make it findable.** Good docs that can't be found are useless.

**Test your docs.** Follow your own instructions. Do they work?

## References

- `references/readme-templates.md`: README templates for different project types
- `references/api-documentation.md`: API documentation patterns and examples
- `references/code-comments.md`: When and how to comment code
- `references/architecture-docs.md`: Architecture documentation templates
- `references/runbook-templates.md`: Operational runbook templates
- `references/writing-guidelines.md`: Technical writing best practices
- `references/changelog-guide.md`: Changelog and release notes guide

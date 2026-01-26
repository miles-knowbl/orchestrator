---
name: portability
description: "Assess and document skill transferability across projects and domains, identifying required adaptations and context dependencies."
phase: COMPLETE
category: meta
version: "1.0.0"
depends_on: ["skill-verifier"]
tags: [meta, portability, reusability, transfer, assessment]
---

# Portability

Assess skill transferability across projects and domains.

## When to Use

- **After skill creation** — Evaluate how portable a new skill is
- **Cross-project reuse** — Adapting a skill for a different project
- **Skill library curation** — Deciding what belongs in the shared library
- When you say: "is this reusable", "port this skill", "how transferable"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Portability assessment | Skill's SKILL.md (section) | Always |

## Core Concept

Portability assessment answers: **"Can this skill be applied to a different project without modification?"**

```
Fully Portable ←──────────────────────→ Completely Domain-Specific
  (works anywhere)                        (only works here)
```

## Portability Levels

| Level | Description | Example |
|-------|-------------|---------|
| **Universal** | Works for any project | `code-review`, `test-generation` |
| **Category-portable** | Works within a category (web, CLI, API) | `frontend-design`, `infra-docker` |
| **Stack-portable** | Works within a tech stack (Node.js, Python) | `infra-database` (Drizzle-specific) |
| **Domain-specific** | Tied to a specific domain or project | Custom business logic skills |

## Assessment Criteria

| Criterion | Portable | Not Portable |
|-----------|----------|--------------|
| Language references | Generic or multi-language | Single language only |
| Framework dependencies | Framework-agnostic | Tied to specific framework |
| Domain concepts | General engineering | Business-specific terminology |
| File paths | Configurable or conventional | Hardcoded paths |
| External dependencies | Standard tools | Proprietary or rare tools |

## Adaptation Catalog

When porting a skill, common adaptations include:

| Adaptation | Description |
|------------|-------------|
| **Language swap** | Replace code examples with target language |
| **Framework swap** | Replace framework patterns (Express → Fastify) |
| **Convention mapping** | Map naming conventions to target project |
| **Tool substitution** | Replace tools (Drizzle → Prisma, vitest → jest) |
| **Scope adjustment** | Expand or narrow scope for target context |

## Checklist

- [ ] Portability level assessed (universal → domain-specific)
- [ ] Context dependencies identified
- [ ] Required adaptations documented
- [ ] Generic vs. specific sections clearly separated
- [ ] Examples provided in multiple languages/frameworks (if portable)

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `skill-verifier` | Verifier checks skill quality; portability checks transferability |
| `skill-design` | Design decisions affect portability |
| `retrospective` | Portability insights feed into future skill design |

## Key Principles

**Generic by default.** Write skills for the general case; specialize only when necessary.

**Separate the portable from the specific.** Keep domain-specific content in references, not the core skill.

**Adaptation over duplication.** One portable skill with adaptations beats five copies.

**Document the dependencies.** Make implicit context explicit so porters know what to change.

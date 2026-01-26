# SKILL.md Template

Complete 13-section template for authoring a skill definition. Every skill MUST follow this exact section order.

## YAML Frontmatter

```yaml
---
name: skill-name           # kebab-case, must match directory name
description: "One-sentence  # 15-30 words, starts with verb
  summary of the skill."
phase: INIT                # INIT|SCAFFOLD|IMPLEMENT|TEST|VERIFY|VALIDATE|DOCUMENT|REVIEW|SHIP|COMPLETE
category: core             # core|infra|meta|specialized|custom
version: "1.0.0"           # Quoted semver string
depends_on: []             # Array of skill names; empty if none
tags: [tag1, tag2, tag3]   # 3-6 descriptive tags, unique set per skill
---
```

| Field | Required | Rules |
|-------|----------|-------|
| `name` | Yes | kebab-case, matches directory name exactly |
| `description` | Yes | 15-30 words, starts with a verb, no jargon |
| `phase` | Yes | One of the 10 defined phases |
| `category` | Yes | core, infra, meta, specialized, or custom |
| `version` | Yes | Quoted semver (e.g., "1.0.0") |
| `depends_on` | Yes | Array of skill names; empty array if none |
| `tags` | Yes | 3-6 tags; no two skills should share the same tag set |

## Section Order and Guidance

### 1. Title
`# Skill Name` followed by the frontmatter description verbatim. Capitalized, no hyphens.

### 2. When to Use (min 4 triggers)
Bold-label bullets with double-dash separator. End with `When you say:` line listing 2-3 example phrases.

### 3. Reference Requirements
Two tables: **MUST read** (`| Reference | Why Required |`) and **Read if applicable** (`| Reference | When Needed |`). Minimum 2 entries each. End with a **Verification** sentence.

### 4. Required Deliverables
Table: `| Deliverable | Location | Condition |`. At least 1 deliverable. Use "Always" or a specific condition.

### 5. Core Concept
Central question in bold: `**"What question does this skill answer?"**`. Then 3-5 **IS** statements (bold label + practical meaning) and 3-5 **IS NOT** statements referencing the responsible skill: `(that is \`other-skill\`)`.

Example:
```markdown
Skill Name is NOT:
- Detailed implementation (that is `implement`)
- Requirements gathering (that is `spec`)
```

### 6. Process Diagram
ASCII box diagram with numbered steps matching the Step sections. Use `+->` arrows.

### 7. Steps (60%+ of total content)
Each step is a `## Step N: Name` heading with: opening paragraph, at least one table/checklist/template, concrete guidance, and reference cross-links (`> See references/filename.md`). Steps are the heart of the skill -- allocate 60%+ of total line count here.

### 8. Output Formats
At least two formats: Quick (simple cases) and Full (complex cases). Include actual markdown templates inside fenced code blocks, not just descriptions.

### 9. Common Patterns
3-4 named patterns with description and `**Use when:**` trigger line.

### 10. Relationship to Other Skills
Table: `| Skill | Relationship |`. Minimum 4-6 entries covering upstream, downstream, and parallel skills. Backtick-quote skill names.

### 11. Key Principles
4-6 principles. Format: `**Bold principle.** Explanation.` Actionable, not platitudes.

### 12. References
Bullet list: `- \`references/filename.md\`: Description`. Minimum 4 entries. Every listed file must exist in the `references/` directory.

## Content Requirements Summary

| Section | Min Lines | Must Include |
|---------|-----------|--------------|
| Frontmatter | 8 | All 7 fields |
| Title | 2 | Name + description |
| When to Use | 6 | 4+ triggers + example phrases |
| Reference Requirements | 12 | 2 MUST + 2 conditional + verification |
| Required Deliverables | 5 | 1+ deliverable with location |
| Core Concept | 15 | Central question + IS + IS NOT |
| Process Diagram | 12 | ASCII diagram matching steps |
| Steps | 60%+ | Tables, checklists, templates per step |
| Output Formats | 15 | Quick + Full format templates |
| Common Patterns | 15 | 3+ named patterns with triggers |
| Relationships | 8 | 4+ skill relationships |
| Key Principles | 10 | 4+ actionable principles |
| References | 6 | 4+ reference file listings |

**Total minimum:** 300 lines. **Target:** 400-600 lines. Steps must be 60%+ of total.

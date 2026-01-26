# Skill Template Guide

How to convert extracted procedures into properly formatted skill library entries.
Use this reference during Step 5 (Skill Extraction) when an extracted procedure is a candidate for the skill library.

## When to Convert

Not every extracted procedure should become a skill entry. Convert when ALL of these hold:

| Criterion | Test |
|-----------|------|
| **Repeatable** | Would someone perform this procedure more than once? |
| **Self-contained** | Can someone follow it without reading the source content? |
| **Transferable** | Does it apply outside the original context? |
| **Non-trivial** | Does it involve 3+ steps or decision points? |
| **Not already covered** | Does the skill library lack this capability? |

If any criterion fails, the extraction stays in EXTRACTED-SKILLS.md as a candidate but does not get formatted as a full skill entry.

## Required Sections

Every skill entry must include these sections. Omitting any section produces an incomplete entry.

### 1. Frontmatter

```yaml
---
name: skill-name-in-kebab-case
description: "One sentence describing what this skill does and when to use it."
phase: IMPLEMENT  # Which loop phase: INIT, SCAFFOLD, IMPLEMENT, TEST, VERIFY, VALIDATE, DOCUMENT, REVIEW, SHIP, COMPLETE
category: core    # core, specialized, meta, or infra
version: "1.0.0"
depends_on: []    # Other skills this one requires
tags: [keyword1, keyword2, keyword3]
---
```

**Rules:**
- Name uses kebab-case, matches the directory name
- Description is a single sentence, starts with an imperative verb
- Phase reflects when in the engineering loop this skill is most relevant
- Version starts at 1.0.0 for new skills

### 2. Title and Summary

```markdown
# Skill Name

One paragraph summary of what this skill does, why it exists, and what outcome it produces.
```

### 3. When to Use

```markdown
## When to Use

- **Trigger condition 1** --- Description of when this skill applies
- **Trigger condition 2** --- Description of another trigger
- When you say: "quoted trigger phrases"
```

**Rules:**
- List 3-6 trigger conditions
- Each starts bold with a short label, then a dash and description
- Include natural language triggers ("When you say...")

### 4. Required Deliverables

```markdown
## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| File or artifact name | Where it goes | When it is produced |
```

### 5. Core Process
Numbered, named steps. Each step includes: what to do (imperative), how to do it (specific), decision points ("If X, do Y. Otherwise, do Z."), and expected output. Every step must be executable without interpretation.

### 6. Output Format
Template showing the exact structure of the skill's deliverable. Use fenced code blocks with `markdown` language identifier.

### 7. Key Principles
3-6 principles, each starting bold with a short name. Principles explain **why**, not just what. One paragraph per principle.

## Formatting Standards

| Element | Rule |
|---------|------|
| **H1** | Skill name only (one per file) |
| **H2** | Major sections: When to Use, Process, Output Format, Key Principles |
| **H3/H4** | Process steps and sub-steps |
| **Tables** | Structured comparisons and parameter lists; always include header row |
| **Code blocks** | Fenced with language identifier; under 30 lines; use `markdown` for templates |
| **Bullet lists** | Unordered items (conditions, principles); numbered for ordered steps; checkboxes for verification |
| **Bold** | Key terms on first use, section labels, deliverable names |
| `Code font` | File names, commands, variable names, config values |
| **---** separator | Between bold label and description in "When to Use" lists |

## Quality Checklist

Run before finalizing any skill entry.

- [ ] Frontmatter has all required fields; description starts with imperative verb
- [ ] "When to Use" has 3-6 trigger conditions with natural language triggers
- [ ] Process has numbered, named steps with enough detail to execute independently
- [ ] Output format includes a concrete template with exact file names
- [ ] Key principles section present (3-6 principles with "why" explanations)
- [ ] Reader unfamiliar with source content can follow the procedure
- [ ] No undefined jargon; decision points are explicit (if/then, not "consider")
- [ ] Name in frontmatter matches directory name; formatting follows standards
- [ ] Terminology matches existing skill library vocabulary
- [ ] Phase assignment is correct for the engineering loop
- [ ] Skill does one thing well; no unacknowledged overlap with existing skills
- [ ] Prerequisites listed in `depends_on`; scope neither too granular nor too broad

## Conversion Workflow

1. **Assess fit** --- Run "When to Convert" criteria. Stop if any fails.
2. **Draft frontmatter** --- Assign name, phase, category, tags. Check for name conflicts.
3. **Expand procedure** --- Add detail until each step is independently executable.
4. **Add decision points** --- Make every if/then branch explicit.
5. **Write triggers** --- Define when someone would invoke this. Focus on the problem, not the solution.
6. **Define deliverables** --- Specify exact files and artifacts produced.
7. **State principles** --- Extract 3-6 guiding principles ("why" behind the "what").
8. **Create output template** --- Concrete example of the skill's deliverable format.
9. **Run quality checklist** --- Verify against every item above.

## Common Conversion Mistakes

| Mistake | Fix |
|---------|-----|
| Copying source verbatim | Rewrite in imperative voice with full context |
| Missing implicit steps | Walk through mentally; add every action between stated steps |
| Scope creep (does 3 things) | Split into focused skills with dependencies |
| No decision points | Add branches for common variations and errors |
| Vague output | Specify exact file name, format, and structure |
| Wrong phase assignment | Review phase definitions in the loop controller |

---
name: skill-design
description: "Design, create, and maintain skills in the skill library. Codifies the 13-section template, quality standards, MECE validation, lifecycle management, and extraction pipeline integration. The authoritative meta-skill for skill governance."
phase: SCAFFOLD
category: operations
version: "1.0.0"
depends_on: []
tags: [meta, skill-library, quality, templates, governance]
---

# Skill Design

Design, create, and maintain high-quality skills for the skill library.

## When to Use

- **Creating a new skill from scratch** --- New domain, capability, or workflow not covered by existing skills
- **Upgrading a skeletal skill** --- Existing skill below 300 lines or missing template sections
- **Deciding standalone vs enhancement vs reference** --- Content could go multiple places and you need a principled decision
- **Reviewing skill quality** --- Pre-publish quality gate to ensure a skill meets minimum standards
- **Deprecating or demoting a skill** --- Skill no longer needed or should become a reference under another skill
- When you say: "create a new skill", "design a skill", "is this skill good enough?", "should this be its own skill?", "upgrade this skill"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `skill-template.md` | The complete 13-section template with authoring guidance for every section |
| `quality-checklist.md` | Minimum quality criteria every skill must meet before publishing |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `mece-validation.md` | When checking overlap with existing skills or validating coverage |
| `lifecycle-management.md` | When versioning, deprecating, or demoting a skill |
| `extraction-integration.md` | When creating skills from inbox extractions via the content-analysis pipeline |

**Verification:** Every published skill must pass the quality checklist with no failures. A skill that fails any quality gate is not ready for publishing.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `SKILL.md` | `skills/{name}/` | Always --- the skill definition following the 13-section template |
| Reference files | `skills/{name}/references/` | Always --- minimum 4 reference files, 80-150 lines each |
| `VALIDATION.md` | Project root | When creating a new skill --- temporary artifact documenting validation results |

## Core Concept

Skill Design answers: **"How do we build, maintain, and evolve a high-quality skill?"**

Skill Design is:
- **The authoritative process for skill creation and governance** --- No skill enters the library without following this process
- **Template-driven** --- Every skill follows the same 13-section structure, enabling automated indexing, search, and composition
- **Quality-gated** --- Minimum standards are enforced before publishing; skeletal skills are upgraded, not shipped
- **MECE-aware** --- Validates that skills are mutually exclusive (no significant overlap) and collectively exhaustive (all phases covered)
- **Lifecycle-complete** --- Covers the full arc: create, improve, deprecate, demote, and consolidate
- **Self-referential** --- This skill is itself a model of the template it describes

Skill Design is NOT:
- Content analysis (that is `content-analysis` --- extracting skills from content)
- Documentation in general (that is `document` --- documenting code and systems)
- Code scaffolding (that is `scaffold` --- creating project directory structures)
- A one-time process --- Skills improve continuously through use and feedback
- Style guidance --- This skill defines structure and quality gates, not prose style
- Library infrastructure --- Indexing, serving, and API design are engineering concerns, not skill design concerns

## The Skill Design Process

```
+-----------------------------------------------------------------------+
|                       SKILL DESIGN PROCESS                             |
|                                                                        |
|  1. NEED ASSESSMENT                                                    |
|     +---> Is a new skill needed? Check overlap, decide outcome         |
|                                                                        |
|  2. SCOPE DEFINITION                                                   |
|     +---> Single responsibility, phase, category, boundaries           |
|                                                                        |
|  3. TEMPLATE SCAFFOLDING                                               |
|     +---> Create directory, frontmatter, section headers               |
|                                                                        |
|  4. CONTENT AUTHORING                                                  |
|     +---> Write all 13 sections with required depth                    |
|                                                                        |
|  5. REFERENCE AUTHORING                                                |
|     +---> Write 4+ reference files, 80-150 lines each                 |
|                                                                        |
|  6. MECE VALIDATION                                                    |
|     +---> Check overlap, coverage, dependency graph                    |
|                                                                        |
|  7. QUALITY REVIEW                                                     |
|     +---> Apply quality checklist, fix deficiencies                    |
|                                                                        |
|  8. PUBLISHING                                                         |
|     +---> Place in skills/, verify via API, announce                   |
|                                                                        |
+-----------------------------------------------------------------------+
```

## Step 1: Need Assessment

Before creating a skill, determine whether a new skill is actually needed. The bar for a new standalone skill is high --- most content belongs as an enhancement to an existing skill or as a reference file.

### Decision Tree: Is a New Skill Needed?

```
+-----------------------------------------------------------------------+
|                                                                        |
|  Does content represent a distinct, reusable capability?               |
|          |                                                             |
|          +-- NO --> Not a skill. Archive as a note or reference.       |
|          |                                                             |
|          +-- YES --> Does an existing skill cover this domain?         |
|                          |                                             |
|                          +-- YES --> Is overlap > 60% (Jaccard)?       |
|                          |              |                              |
|                          |              +-- YES --> Enhance existing    |
|                          |              |          skill, not new one   |
|                          |              |                              |
|                          |              +-- NO --> Is overlap > 40%?   |
|                          |                           |                 |
|                          |                           +-- YES -->       |
|                          |                           |   Investigate:  |
|                          |                           |   add reference |
|                          |                           |   or merge?     |
|                          |                           |                 |
|                          |                           +-- NO -->        |
|                          |                               Create new    |
|                          |                               standalone    |
|                          |                                             |
|                          +-- NO --> Create new standalone skill        |
|                                                                        |
+-----------------------------------------------------------------------+
```

### Overlap Detection

Use the skills library API to find similar skills:

```bash
# Find skills with similar tags or descriptions
GET /api/skills?search={keywords}

# Compare tags via Jaccard similarity
# Jaccard = |intersection| / |union| of tag sets
# > 60% = likely duplicate, enhance existing
# 40-60% = investigate carefully
# < 40% = likely distinct, safe to create
```

### Decision Criteria

| Outcome | When | Action |
|---------|------|--------|
| **Create standalone** | Distinct capability, <40% overlap, fills a phase gap | Proceed to Step 2 |
| **Enhance existing** | >60% overlap with an existing skill | Add sections or depth to the existing skill |
| **Add as reference** | 40-60% overlap, content is supporting detail | Create a reference file under the closest existing skill |
| **Not needed** | Content is not a reusable capability | Archive as a note; do not create a skill |

### Need Assessment Checklist

```markdown
- [ ] Searched existing skills for overlap (keyword search + tag comparison)
- [ ] Calculated Jaccard similarity against closest matches
- [ ] Identified which phase this capability belongs to
- [ ] Confirmed this is a reusable capability, not a one-off procedure
- [ ] Decision documented: create / enhance / reference / not needed
```

## Step 2: Scope Definition

A well-scoped skill has a single clear responsibility, a defined phase, explicit boundaries, and a short dependency list.

### Single Responsibility

A skill should do one thing well. If you find yourself writing "and" in the description more than once, the skill may be too broad. Split it.

| Signal | Interpretation |
|--------|----------------|
| Description requires "and" twice | Likely two skills bundled |
| Steps span multiple phases | Skill may be too broad |
| Tags span unrelated domains | Scope is not focused |
| IS NOT list exceeds 6 items | Skill is trying to be everything |
| More than 3 depends_on | Skill may be a meta-workflow, not a skill |

### Phase Assignment

Every skill belongs to exactly one phase. Choose the phase where the skill's primary work occurs:

| Phase | Purpose | Example Skills |
|-------|---------|----------------|
| INIT | Project setup, context gathering | `context-ingestion` |
| SCAFFOLD | Structure creation, planning | `scaffold`, `context-cultivation`, `skill-design` |
| IMPLEMENT | Building and coding | `implement` |
| TEST | Test creation and execution | `test-generation` |
| VERIFY | Code correctness checking | `code-verification` |
| VALIDATE | Content and quality validation | `content-analysis` |
| DOCUMENT | Documentation authoring | `document` |
| REVIEW | Quality review and feedback | `code-review` |
| SHIP | Deployment and release | `deploy` |
| COMPLETE | Wrap-up and retrospective | `loop-controller` |

### Boundary Definition

Explicitly state what the skill covers and what it delegates:

```markdown
## Boundary Definition for [skill-name]

**This skill covers:**
- [Specific capability 1]
- [Specific capability 2]
- [Specific capability 3]

**This skill delegates to:**
- [other-skill]: [what it handles]
- [other-skill]: [what it handles]

**Gray areas (document the decision):**
- [Topic X]: Handled here because [reason], not by [other-skill] because [reason]
```

### Category Selection

| Category | Definition | Examples |
|----------|-----------|----------|
| **core** | Essential to the engineering loop; every project needs it | `implement`, `scaffold`, `test-generation` |
| **meta** | Skills about the skill system itself | `skill-design`, `content-analysis` |
| **specialized** | Domain-specific or situational skills | `context-cultivation`, `priority-matrix` |
| **infra** | Infrastructure and platform skills | `deploy`, `error-handling` |
| **custom** | Project-specific skills not in the shared library | Per-project overrides |

### Tag Selection

Choose 3-6 descriptive tags. Check existing skills to avoid duplicating tag sets:

```markdown
- [ ] Tags are lowercase, hyphenated
- [ ] 3-6 tags selected
- [ ] No tag set duplicates another skill's tags exactly
- [ ] Tags reflect the skill's domain, not generic verbs
- [ ] At least one tag is shared with a related skill (for discoverability)
```

### Dependency Declaration

List skills in `depends_on` only if they MUST execute before this skill can run:

```markdown
- [ ] Every dependency is a real runtime prerequisite, not just a related skill
- [ ] Dependency graph is acyclic (no circular references)
- [ ] Prefer fewer dependencies; most skills should have 0-2
```

## Step 3: Template Scaffolding

Create the directory structure and populate the SKILL.md with the 13-section skeleton.

### Directory Structure

```
skills/{name}/
+-- SKILL.md
+-- references/
    +-- (reference files will go here)
```

### YAML Frontmatter Template

```yaml
---
name: {name}
description: "{One sentence, 20-40 words, present tense, describes the capability}"
phase: {PHASE}
category: {core|meta|specialized|infra|custom}
version: "1.0.0"
depends_on: [{list of skill names, or empty}]
tags: [{3-6 lowercase hyphenated tags}]
---
```

### Section Header Skeleton

```markdown
---
name: {name}
description: "{description}"
phase: {PHASE}
category: {category}
version: "1.0.0"
depends_on: []
tags: [{tags}]
---

# {Title}

{One-line description in imperative form.}

## When to Use

- **{Trigger 1}** --- {Explanation}
- **{Trigger 2}** --- {Explanation}
- **{Trigger 3}** --- {Explanation}
- **{Trigger 4}** --- {Explanation}
- When you say: "{natural language triggers}"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `{ref-1}.md` | {Why} |
| `{ref-2}.md` | {Why} |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `{ref-3}.md` | {When} |

**Verification:** {What must be true before marking complete.}

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| {Deliverable 1} | {Path} | {When} |

## Core Concept

{Skill Name} answers: **"{Central question}"**

{Skill Name} is:
- **{Characteristic 1}** --- {Explanation}
- **{Characteristic 2}** --- {Explanation}

{Skill Name} is NOT:
- {Anti-characteristic 1} (that is `{other-skill}`)
- {Anti-characteristic 2}

## The {Skill Name} Process

{ASCII box diagram}

## Step 1: {Step Name}

{Content}

## Step N: {Step Name}

{Content}

## Output Formats

### Quick Format

{Template}

### Full Format

{Template}

## Common Patterns

### {Pattern Name}

{Description}

**Use when:** {Conditions}

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `{skill}` | {Relationship} |

## Key Principles

**{Principle 1}.** {Explanation}

**{Principle 2}.** {Explanation}

## References

- `references/{ref-1}.md`: {Description}
- `references/{ref-2}.md`: {Description}
```

### Scaffolding Checklist

```markdown
- [ ] Directory created: skills/{name}/
- [ ] Subdirectory created: skills/{name}/references/
- [ ] SKILL.md created with frontmatter and all 13 section headers
- [ ] Frontmatter fields validated (name, description, phase, category, version, depends_on, tags)
- [ ] Ready for content authoring
```

## Step 4: Content Authoring

This is the bulk of skill creation. Each of the 13 sections has specific requirements for what it must contain, minimum depth, and common mistakes to avoid.

### Section-by-Section Authoring Guide

#### Section 1: Title + One-Line Description

| Requirement | Detail |
|-------------|--------|
| **Format** | H1 heading matching the `name` field, followed by one sentence |
| **Voice** | Imperative: "Design...", "Generate...", "Analyze..." |
| **Length** | 5-15 words |
| **Common mistake** | Describing what the skill is instead of what it does |

#### Section 2: When to Use

| Requirement | Detail |
|-------------|--------|
| **Format** | Bulleted list with **bold trigger** followed by em-dash explanation |
| **Count** | 4-6 triggers minimum |
| **Must include** | "When you say:" line with 3-5 natural language phrases |
| **Common mistake** | Triggers too vague ("when needed") or too narrow ("only for React projects") |

Example from `content-analysis`:
```markdown
- **Inbox item arrives** --- New content enters the second-brain pipeline and needs decomposition
- When you say: "analyze this content", "extract skills from", "find patterns in"
```

#### Section 3: Reference Requirements

| Requirement | Detail |
|-------------|--------|
| **Format** | Two tables: MUST read + Read if applicable |
| **MUST table** | 2-3 references that are always required |
| **If-applicable table** | 2-4 references needed in specific situations |
| **Verification line** | One sentence: what must be true before the skill is complete |
| **Common mistake** | Listing references without explaining why they are required |

#### Section 4: Required Deliverables

| Requirement | Detail |
|-------------|--------|
| **Format** | Table with Deliverable, Location, and Condition columns |
| **Condition column** | "Always", "When X", or "If Y" --- not blank |
| **Common mistake** | Omitting the Condition column or leaving it as "Always" for optional deliverables |

#### Section 5: Core Concept

| Requirement | Detail |
|-------------|--------|
| **Format** | "answers: **question**" followed by IS list and IS NOT list |
| **IS list** | 4-6 items, each **bold** with em-dash explanation |
| **IS NOT list** | 4-6 items, each naming the skill that handles the excluded concern |
| **Common mistake** | IS NOT list that does not reference specific other skills |

#### Section 6: Process Diagram

| Requirement | Detail |
|-------------|--------|
| **Format** | ASCII box diagram showing all process steps |
| **Content** | Step number, step name, one-line description of action |
| **Common mistake** | Using Mermaid or other non-ASCII formats that do not render universally |

#### Section 7: Steps (The Bulk --- 60%+ of Total Lines)

| Requirement | Detail |
|-------------|--------|
| **Format** | Each step is an H2 heading: "## Step N: Name" |
| **Minimum per step** | Introductory paragraph + at least one table, checklist, or code block |
| **Tables** | Use for structured comparisons, decision matrices, classification schemes |
| **Checklists** | Use for verification and completeness checking |
| **Code blocks** | Use for templates, output formats, commands |
| **Decision trees** | Use for branching logic (ASCII format) |
| **Common mistake** | Steps that are only prose with no structured elements |

#### Section 8: Output Formats

| Requirement | Detail |
|-------------|--------|
| **Quick format** | Lightweight output for small or simple tasks |
| **Full format** | Complete output for comprehensive tasks |
| **Both must** | Include markdown code blocks showing the exact template |
| **Common mistake** | Only providing one format, or formats that are too abstract to copy |

#### Section 9: Common Patterns

| Requirement | Detail |
|-------------|--------|
| **Count** | 3-4 named patterns |
| **Each pattern** | H3 heading, paragraph description, "**Use when:**" line |
| **Common mistake** | Patterns that are just restatements of the steps |

#### Section 10: Relationship to Other Skills

| Requirement | Detail |
|-------------|--------|
| **Format** | Table with Skill and Relationship columns |
| **Count** | 4-8 related skills |
| **Relationship text** | Specific: what this skill provides to or receives from the other |
| **Common mistake** | Vague relationships like "related to" or "works with" |

#### Section 11: Key Principles

| Requirement | Detail |
|-------------|--------|
| **Count** | 5-6 principles |
| **Format** | **Bold principle statement.** Followed by one-line explanation |
| **Common mistake** | Principles that are too generic ("write good code") or not actionable |

#### Section 12: References

| Requirement | Detail |
|-------------|--------|
| **Format** | Bulleted list: `references/{name}.md`: {one-line description} |
| **Count** | Match the reference files created in Step 5 |
| **Common mistake** | Listing references that do not exist, or forgetting to list created references |

### Authoring Quality Heuristics

| Heuristic | Target |
|-----------|--------|
| Total line count | 400-600 lines |
| Tables per skill | 8-15 |
| Code blocks per skill | 5-10 |
| Checklists per skill | 3-6 |
| ASCII diagrams per skill | 1-3 |
| Prose paragraphs between structured elements | 1-3 paragraphs max before next table/block |

## Step 5: Reference Authoring

Reference files provide the supporting detail that keeps the main SKILL.md scannable while ensuring the skill is self-contained.

### Reference File Standards

| Aspect | Requirement |
|--------|-------------|
| **Length** | 80-150 lines per file |
| **Count** | Minimum 4 reference files per skill |
| **Focus** | Each reference covers exactly one aspect of the skill |
| **Naming** | Lowercase-hyphenated: `quality-checklist.md`, `lifecycle-management.md` |
| **Usability** | Must be immediately useful during skill execution, not background reading |

### Reference File Structure

```markdown
# {Reference Title}

{One paragraph introduction: what this reference covers and when to use it.}

## {Section 1}

{Content with tables, lists, and examples.}

## {Section 2}

{Content with tables, lists, and examples.}

## Quick Reference

{Summary table or checklist for fast lookup during execution.}
```

### Reference Authoring Checklist

```markdown
- [ ] At least 4 reference files created
- [ ] Each file is 80-150 lines
- [ ] Each file covers a single focused topic
- [ ] Files use lowercase-hyphenated naming
- [ ] Files contain tables, lists, or structured data (not just prose)
- [ ] Files are useful during execution, not just background context
- [ ] All references listed in SKILL.md Section 12 match actual files
- [ ] SKILL.md Section 3 tables reference the correct filenames
```

### Minimum Reference Set for Any Skill

Every skill should have at minimum:

| Reference Type | Purpose | Example Filename |
|----------------|---------|------------------|
| **Primary process guide** | Deep detail on the skill's main process | `analysis-framework.md` |
| **Quality criteria** | Standards and checklists for the skill's output | `quality-checklist.md` |
| **Templates/formats** | Reusable templates for the skill's deliverables | `output-templates.md` |
| **Decision guidance** | Decision trees and heuristics for judgment calls | `decision-guide.md` |

## Step 6: MECE Validation

MECE (Mutually Exclusive, Collectively Exhaustive) validation ensures the skill library as a whole remains clean: no duplicate skills, no gaps in coverage.

### Overlap Check

For the new skill, compare against all existing skills:

```markdown
## Overlap Analysis: {new-skill} vs Existing Skills

| Existing Skill | Shared Tags | Jaccard Score | Verdict |
|----------------|-------------|---------------|---------|
| {skill-1} | {tags} | {0.XX} | {distinct / investigate / duplicate} |
| {skill-2} | {tags} | {0.XX} | {distinct / investigate / duplicate} |
```

### Jaccard Thresholds

| Score | Interpretation | Action |
|-------|----------------|--------|
| < 0.20 | Clearly distinct | No concern |
| 0.20 - 0.39 | Minor overlap | Document the boundary |
| 0.40 - 0.59 | Significant overlap | Investigate: should one be a reference under the other? |
| 0.60 - 0.79 | Likely duplicate | Merge or clearly differentiate scope |
| >= 0.80 | Almost certainly duplicate | Do not create; enhance existing skill instead |

### Phase Coverage Check

After adding the new skill, verify phase coverage:

```markdown
## Phase Coverage

| Phase | Skills | Coverage |
|-------|--------|----------|
| INIT | {list} | {adequate / gap} |
| SCAFFOLD | {list} | {adequate / gap} |
| IMPLEMENT | {list} | {adequate / gap} |
| TEST | {list} | {adequate / gap} |
| VERIFY | {list} | {adequate / gap} |
| VALIDATE | {list} | {adequate / gap} |
| DOCUMENT | {list} | {adequate / gap} |
| REVIEW | {list} | {adequate / gap} |
| SHIP | {list} | {adequate / gap} |
| COMPLETE | {list} | {adequate / gap} |
```

### Dependency Graph Validation

The skill dependency graph must be a Directed Acyclic Graph (DAG). No circular dependencies.

```markdown
- [ ] New skill's depends_on does not create a cycle
- [ ] No skill transitively depends on itself
- [ ] Dependency chain length is <= 3 (prefer shallow graphs)
```

### Coverage Analysis API

After adding the skill, verify via the skills library API:

```bash
# Check coverage across phases
GET /api/skills-coverage

# Check dependency graph for cycles
GET /api/skills-graph

# Verify the new skill appears correctly
GET /api/skills/{name}?includeReferences=true
```

## Step 7: Quality Review

Apply the quality checklist to every skill before publishing. No exceptions.

### Quality Checklist

```markdown
## Skill Quality Review: {skill-name}

### Structure (all required)
- [ ] All 13 sections present
- [ ] Sections appear in the correct order
- [ ] YAML frontmatter is valid and complete
- [ ] Title matches the `name` field

### Depth (minimum thresholds)
- [ ] Total line count >= 300 (target: 400-600)
- [ ] At least 4 reference files
- [ ] Steps section comprises 60%+ of total lines
- [ ] Each step has at least one table, checklist, or code block

### Content Quality
- [ ] No placeholder content ("TODO", "TBD", "[fill in]", "...")
- [ ] Code examples are syntactically valid
- [ ] Tables have header rows and consistent columns
- [ ] ASCII diagrams render correctly in fixed-width fonts
- [ ] Checklists use `- [ ]` format

### Consistency
- [ ] Em-dash separator is `---` (three hyphens), used consistently
- [ ] Bold formatting uses `**text**`, not `__text__`
- [ ] Skill references use backtick-quoted names: `skill-name`
- [ ] Reference file names match actual files in `references/`

### Completeness
- [ ] When to Use has 4-6 triggers plus natural language line
- [ ] Core Concept has IS list (4-6) and IS NOT list (4-6)
- [ ] Common Patterns has 3-4 named patterns
- [ ] Relationship table has 4-8 entries
- [ ] Key Principles has 5-6 principles

### MECE
- [ ] Overlap analysis completed against existing skills
- [ ] Jaccard scores documented for closest matches
- [ ] No score >= 0.60 without explicit scope differentiation
- [ ] Phase coverage maintained or improved
```

### Quality Grades

| Grade | Criteria | Action |
|-------|----------|--------|
| **Publishable** | All checklist items pass | Proceed to Step 8 |
| **Needs polish** | 1-3 minor items fail | Fix and re-review |
| **Needs rework** | 4+ items fail or any structural issue | Return to Step 4 |
| **Not viable** | Fundamental scope or overlap issue | Return to Step 1 |

## Step 8: Publishing

Once a skill passes quality review, publish it to the skills library.

### Publishing Steps

1. **Place the skill** in the `skills/` directory:
   ```
   skills/{name}/
   +-- SKILL.md
   +-- references/
       +-- {ref-1}.md
       +-- {ref-2}.md
       +-- {ref-3}.md
       +-- {ref-4}.md
   ```

2. **Server auto-indexes** on restart or file watch. No manual registration required.

3. **Verify via API:**
   ```bash
   # Skill is indexed and returns full content
   GET /api/skills/{name}?includeReferences=true

   # Skill appears in coverage report
   GET /api/skills-coverage

   # Skill appears in dependency graph
   GET /api/skills-graph

   # Skill is searchable by tags and description
   GET /api/skills?search={keywords}
   ```

4. **Verify via MCP:**
   ```
   mcp__skills-library__get_skill({ name: "{name}", includeReferences: true })
   ```

5. **Announce:** The skill is available for use. Downstream skills that reference it can now declare it in `depends_on`.

### Post-Publishing Checklist

```markdown
- [ ] SKILL.md and all references are in skills/{name}/
- [ ] API returns the skill with full content and references
- [ ] Skill appears in coverage report under correct phase
- [ ] Dependency graph has no cycles
- [ ] Search returns the skill for relevant keywords
- [ ] VALIDATION.md (if created) has been cleaned up from project root
```

## Output Formats

### Quick Format (Scaffold Only)

When you only need to create the skeleton for later authoring:

```markdown
skills/{name}/
+-- SKILL.md (frontmatter + 13 section headers, no content)
+-- references/
```

Produces a SKILL.md of approximately 60-80 lines with the frontmatter and every section header as a placeholder. Content authoring follows separately.

### Full Format (Complete Skill)

When delivering a fully authored, publication-ready skill:

```markdown
skills/{name}/
+-- SKILL.md (all 13 sections, 400-600 lines)
+-- references/
    +-- {ref-1}.md (80-150 lines)
    +-- {ref-2}.md (80-150 lines)
    +-- {ref-3}.md (80-150 lines)
    +-- {ref-4}.md (80-150 lines)
```

### Validation Report Template

When creating a new skill, produce a temporary VALIDATION.md:

```markdown
# Skill Validation Report: {skill-name}

**Date:** {date}
**Author:** {author}
**Phase:** {phase}
**Category:** {category}

## Need Assessment
- **Decision:** Create standalone / Enhance existing / Add reference
- **Closest existing skill:** {name} (Jaccard: {score})
- **Justification:** {Why a new skill is needed}

## Scope
- **Single responsibility:** {One sentence}
- **Phase:** {phase}
- **Category:** {category}
- **Tags:** {list}
- **depends_on:** {list}

## Quality Checklist Results
- Structure: {PASS / FAIL with details}
- Depth: {PASS / FAIL with details}
- Content Quality: {PASS / FAIL with details}
- Consistency: {PASS / FAIL with details}
- Completeness: {PASS / FAIL with details}
- MECE: {PASS / FAIL with details}

## MECE Analysis
| Existing Skill | Jaccard | Verdict |
|----------------|---------|---------|
| {skill} | {score} | {verdict} |

## Phase Coverage Impact
- Before: {phases covered}
- After: {phases covered}
- Net change: {added / no change}

## Verdict
**{PUBLISH / NEEDS POLISH / NEEDS REWORK / NOT VIABLE}**

## Notes
{Any additional context or decisions}
```

## Common Patterns

### Greenfield Skill

A completely new domain or capability with no existing skill overlap. Follow the full 8-step process from Need Assessment through Publishing. The skill fills a genuine gap in the library.

**Use when:** An entirely new capability is needed, phase coverage has a gap, and no existing skill comes close (Jaccard < 0.20 against all existing skills).

### Extraction-to-Skill

The inbox pipeline (via `content-analysis`) classifies content as a standalone skill candidate. The extraction (typically 50-80 lines) must be expanded to the full 13-section template (400-600 lines). The extraction provides the seed content; this pattern provides the expansion process.

**Use when:** `content-analysis` produces a standalone skill classification with extraction confidence >= 0.7 and the need assessment confirms no existing skill covers the domain.

### Promotion

A reference document under a parent skill has grown substantial (exceeding 200 lines) or covers a capability that is clearly distinct from the parent. Promote it to its own skill directory with its own references. Update the parent skill to reference the new skill in its Relationship table.

**Use when:** A reference file exceeds 200 lines, covers a distinct capability, and would benefit from having its own references and structured process.

### Consolidation

Multiple shallow or overlapping skills are merged into one comprehensive skill. The best content from each source skill is preserved. Original skills are demoted to references under the consolidated skill, or deprecated entirely. Coverage analysis confirms reduced overlap.

**Use when:** Coverage analysis reveals two or more skills with Jaccard > 0.40 that would serve users better as a single comprehensive skill with references.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `content-analysis` | Extracts candidate skills from content; skill-design validates and expands them to full template |
| `context-ingestion` | Feeds raw content that may eventually become skills through the extraction pipeline |
| `context-cultivation` | Cultivated insights inform scope decisions for new skills |
| `document` | Shares documentation standards; skill-design applies them specifically to skill authoring |
| `code-review` | Reviews code quality; skill-design reviews skill quality using analogous rigor |
| `scaffold` | Scaffolds code projects; skill-design scaffolds skill directories and templates |
| `loop-controller` | Manages the engineering loop lifecycle; skill-design manages the skill lifecycle |
| `metadata-extraction` | Extracts structural metadata; skill-design defines the metadata schema (frontmatter) for skills |

## Key Principles

**Template consistency enables automation.** Every skill following the same 13-section structure means tools can parse, index, search, and compose them reliably. Deviating from the template breaks the toolchain.

**Depth over breadth.** One 500-line skill with references beats five 50-line stubs. Depth makes skills self-contained and usable without external context. A shallow skill forces the user to search elsewhere for the details they need.

**MECE is non-negotiable.** Skills must be mutually exclusive (no significant overlap) and collectively exhaustive (all phases covered). Run validation before publishing. Overlapping skills confuse both humans and automated selection.

**References are first-class.** Supporting docs are not optional extras. They make skills self-contained and provide the detail that keeps the main SKILL.md scannable. A skill without references is incomplete.

**Prefer enhancement over creation.** Before creating a new skill, check if the content belongs as a section or reference in an existing skill. The bar for a new standalone skill is high. The library benefits from fewer, deeper skills over many shallow ones.

**Skills improve through use.** Every execution should feed back improvements via `capture_improvement`. The library is a living system, not a static archive. The best skills are the ones that have been used, critiqued, and refined.

## References

- `references/skill-template.md`: The complete 13-section template with authoring guidance for every section, field definitions, and examples
- `references/quality-checklist.md`: Minimum quality criteria every skill must meet, organized by category with pass/fail thresholds
- `references/mece-validation.md`: Procedures for checking skill overlap (Jaccard similarity), phase coverage, and dependency graph acyclicity
- `references/lifecycle-management.md`: Versioning conventions, deprecation process, demotion workflow, and consolidation procedures
- `references/extraction-integration.md`: How to convert inbox extractions from content-analysis into full skills using the 8-step process

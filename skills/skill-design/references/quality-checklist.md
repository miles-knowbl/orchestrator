# Quality Checklist

Comprehensive quality gate for reviewing a skill before it is accepted into the skills library. Organized by category with pass/fail criteria.

## Structure Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| S1 | All 13 sections present | Every section from the template exists | Missing "Common Patterns" section |
| S2 | Correct section order | Sections follow template order exactly | "Key Principles" before "Steps" |
| S3 | Proper heading levels | `#` for title, `##` for sections, `###` for subsections | Using `###` for a main section |
| S4 | YAML frontmatter valid | Opens and closes with `---`, all fields present | Missing `tags` field |
| S5 | Title matches frontmatter | `# Name` matches `name:` field (human-readable form) | Frontmatter says `context-ingestion`, title says `Ingestion` |
| S6 | Steps match process diagram | Numbered steps in diagram correspond to `## Step N` sections | Diagram shows 8 steps but only 6 step sections exist |
| S7 | References section matches files | Every file in References exists in `references/` directory | Lists `analysis-guide.md` but file does not exist |

**Verdict:** All 7 checks must pass. Any failure requires revision.

## Depth Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| D1 | Minimum 300 lines | Total SKILL.md line count >= 300 | 180-line skill with thin steps |
| D2 | Target 400-600 lines | Ideal range for comprehensive coverage | 250 lines (needs expansion) |
| D3 | Steps are 60%+ of content | Steps sections collectively dominate | Steps are 90 lines in a 300-line skill (30%) |
| D4 | Each step has substance | Every step has at least one table, checklist, or template | Step 3 is two paragraphs with no structured content |
| D5 | No single-paragraph steps | Steps must have subsections or structured elements | `## Step 4: Validate` followed by one paragraph |
| D6 | Process diagram present | ASCII box diagram shows the full workflow | Diagram replaced with a bullet list |
| D7 | Output formats include templates | Both quick and full formats have markdown templates | "Use the standard output format" with no template |

**Verdict:** D1 is hard fail. D2 is advisory. D3-D7 must all pass.

## References Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| R1 | At least 4 reference files | `references/` directory contains >= 4 `.md` files | Only 2 reference files |
| R2 | Each file 80-150 lines | Line count per reference in range | 40-line stub reference |
| R3 | References are focused | Each file covers one specific topic | `everything-guide.md` covering 5 topics |
| R4 | Reference Requirements table complete | MUST-read and conditional references listed | Only MUST-read, no conditional |
| R5 | No orphan references | Every file in `references/` is mentioned in SKILL.md | `deprecated-guide.md` exists but is not referenced |
| R6 | References support steps | At least 2 references are cited from within step content | References only listed at bottom, never cited in steps |

**Verdict:** R1 and R2 are hard fail. R3-R6 must all pass.

## Content Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| C1 | No placeholders | No `[TODO]`, `[TBD]`, `[PLACEHOLDER]`, `[...]` | `## Step 5: [TBD]` |
| C2 | No empty sections | Every section has substantive content | `## Common Patterns` followed by nothing |
| C3 | Core Concept has IS/IS NOT | Both positive and negative identity defined | Only IS statements, no IS NOT |
| C4 | IS NOT references other skills | Each boundary names the responsible skill | "This is not analysis" without naming which skill does analysis |
| C5 | When to Use has 4+ triggers | At least 4 bold-label trigger bullets | Only 2 trigger conditions |
| C6 | Key Principles are actionable | Principles give concrete guidance | "Quality matters" (platitude, not actionable) |
| C7 | Relationship table has 4+ entries | Upstream, downstream, and lateral skills mapped | Only 2 relationships listed |
| C8 | Deliverables table complete | Every deliverable has location and condition | Missing condition column |

**Verdict:** All 8 checks must pass.

## Formatting Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| F1 | Tables for structured data | Comparisons, matrices, and field lists use tables | Long bullet list that should be a table |
| F2 | ASCII diagrams for processes | Workflow and architecture use box diagrams | Process described only in prose |
| F3 | Code blocks for templates | Output templates and examples use fenced blocks | Templates in plain text without fencing |
| F4 | Consistent separators | Double-dash `--` for descriptions in bullets | Mixing `--`, `-`, `:`, and `|` as separators |
| F5 | Backtick-quoted skill names | Skill names use backticks in prose and tables | Plain text `context-ingestion` without backticks |
| F6 | Bold labels in lists | Bullet points use `**Label**` before explanation | Bullets without bold label prefix |
| F7 | No raw URLs | Links are descriptive, not bare URLs | `See https://example.com` |

**Verdict:** F1-F3 are hard fail. F4-F7 are advisory but should be fixed.

## Frontmatter Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| FM1 | name is kebab-case | Matches `[a-z0-9]+(-[a-z0-9]+)*` | `skillDesign` or `Skill_Design` |
| FM2 | name matches directory | `name` field equals the skill's directory name | Directory is `skill-design/`, name is `design` |
| FM3 | description is 15-30 words | Word count in range, starts with verb | 8-word description or 50-word description |
| FM4 | phase is valid | One of the 10 defined phases or META | `phase: PLANNING` (not a valid phase) |
| FM5 | category is valid | One of: core, infra, meta, specialized, custom | `category: utility` |
| FM6 | version is quoted semver | Matches `"X.Y.Z"` pattern | `version: 1.0` (unquoted, missing patch) |
| FM7 | tags are 3-6 items | Array length in range, descriptive | 1 tag or 10 tags |
| FM8 | depends_on lists real skills | Every dependency exists in the skills library | `depends_on: [requirements]` when no `requirements` skill exists |

**Verdict:** All 8 checks must pass.

## MECE Checklist

| # | Check | Pass Criteria | Fail Example |
|---|-------|---------------|--------------|
| M1 | Tag Jaccard < 40% | No existing skill shares > 40% of tags | New skill tags overlap 60% with `implement` |
| M2 | Description is distinct | Description does not paraphrase another skill | "Implements features" when `implement` exists |
| M3 | Steps teach unique process | Steps do not duplicate another skill's process | Steps 1-5 mirror `code-review` steps |
| M4 | Phase assignment justified | Skill fits its phase's purpose | Data analysis skill assigned to SHIP phase |
| M5 | Not better as a reference | Skill is broad enough for standalone status | 150-line skill covering one narrow sub-topic |

**Verdict:** M1-M4 must pass. M5 is advisory but may trigger demotion.

## Anti-Patterns

### Shallow Skill
- **Symptom:** Under 200 lines, steps are 1-2 paragraphs each, no tables or templates
- **Cause:** Rushed authoring or insufficient domain understanding
- **Fix:** Expand each step with structured content; add concrete examples and checklists

### Template Stub
- **Symptom:** All 13 sections present but most contain placeholder text or minimal content
- **Cause:** Template was filled in mechanically without real thought
- **Fix:** Rewrite from scratch using the skill's actual domain knowledge; delete and restart

### Copy-Paste Without Adaptation
- **Symptom:** Steps, tables, or templates are copied from another skill with minimal changes
- **Cause:** Author used an existing skill as a starting point but did not adapt
- **Fix:** Identify what is unique about this skill and rewrite borrowed content to reflect its specific process

### Missing Boundaries
- **Symptom:** Core Concept has IS statements but no IS NOT, or IS NOT entries lack skill references
- **Cause:** Author did not think about where this skill ends and others begin
- **Fix:** Map adjacent skills and explicitly draw boundaries with cross-references

### Reference Desert
- **Symptom:** SKILL.md references section is present but `references/` directory has 0-1 files
- **Cause:** References were planned but never authored
- **Fix:** Author reference files before marking the skill as complete; each 80-150 lines

## Scoring Rubric

| Category | Weight | Pass/Fail |
|----------|--------|-----------|
| Structure | Required | All 7 checks pass |
| Depth | Required | D1 passes; D3-D7 pass |
| References | Required | R1, R2 pass; R3-R6 pass |
| Content | Required | All 8 checks pass |
| Formatting | Required | F1-F3 pass; F4-F7 advisory |
| Frontmatter | Required | All 8 checks pass |
| MECE | Required | M1-M4 pass; M5 advisory |

### Overall Verdict

- **PASS:** All required checks in all categories pass
- **CONDITIONAL PASS:** All required checks pass but 2+ advisory items flagged (fix before next version)
- **FAIL:** Any required check fails (must revise and re-review)

A skill that fails any single required check is not ready for the library. Fix the failing checks and re-run the full checklist.

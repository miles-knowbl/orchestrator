# Extraction-to-Skill Integration

How the inbox extraction pipeline connects to skill creation, enhancement, and reference authoring.

## Pipeline Overview

```
INBOX ITEM --> EXTRACTION (~50-80 lines) --> CLASSIFICATION --> Action
                                                |
                    +---------------------------+------------------+
                    |                           |                  |
             standalone_skill          skill_enhancement     reference_doc
             (full design)             (expand existing)     (add ref file)
```

## Classification Types

| Type | Criteria | Action |
|------|----------|--------|
| `standalone_skill` | Distinct process with 5+ steps, no existing skill covers it, fills a gap | Full skill-design process |
| `skill_enhancement` | Adds depth to existing skill: new patterns, steps, or examples | Enhance existing skill |
| `reference_doc` | Focused sub-topic that supports an existing skill's process | Add reference file to parent |

### Decision Tree

1. Does the extraction cover a multi-step process?
   - **NO** -- Is it focused on one sub-topic? YES: `reference_doc`. NO: archive or discard.
   - **YES** -- Does an existing skill cover this process?
     - **NO** -- `standalone_skill`
     - **YES** -- Does it add 3+ new patterns or steps? YES: `skill_enhancement`. NO: `reference_doc`

## Expansion: Extraction to Full Skill (7 Steps)

### Step 1: Review Extraction for Accuracy
Verify claims are factual, scope is correct, no hallucinated content, key concepts identified.

### Step 2: Run Need Assessment

| Assessment | Question | Pass Criteria |
|------------|----------|---------------|
| Overlap check | Does an existing skill cover >40% of this? | Jaccard < 0.40 on tags |
| Phase fit | Which phase does this belong to? | Clear assignment, not forced |
| Workflow fit | Which loop would invoke this? | At least one concrete usage |
| Depth potential | Can this support 400+ lines? | At least 5 distinct steps visible |

If need assessment fails, reclassify as `skill_enhancement` or `reference_doc`.

### Step 3: Scaffold Template
Generate the 13-section SKILL.md skeleton (see `skill-template.md`). Fill frontmatter from extraction metadata. Leave section bodies empty.

### Step 4: Expand Each Section

| Section | Extraction Provides | Author Adds |
|---------|--------------------|--------------|
| When to Use | 1-2 triggers | 2-4 additional triggers, example phrases |
| Core Concept | Key idea | IS/IS NOT framework, central question |
| Steps | Process outline | Full tables, checklists, templates per step |
| Common Patterns | 1-2 patterns | 2-3 additional patterns with triggers |
| Key Principles | Implicit principles | 4-6 explicit, actionable principles |

**Expansion ratio:** Each extraction line expands to ~5-8 lines. A 60-line extraction targets a 400-line skill.

### Step 5: Author Reference Files
Create 4+ reference files (80-150 lines each): step support, pattern catalogs, template libraries, decision guides.

### Step 6: MECE Validate
Run full MECE validation (see `mece-validation.md`): tag Jaccard, DAG check, phase coverage, unique tags.

### Step 7: Quality Review
Run full quality checklist (see `quality-checklist.md`): 13 sections, 300+ lines, 60%+ steps, 4+ references.

## Enhancement Process

When classification is `skill_enhancement`:

1. **Identify target** -- Which skill and which section(s) benefit?
2. **Draft additions** -- Match the existing skill's style and format
3. **Integrate** -- Add new patterns, steps, or expanded tables
4. **Update references** -- Add a reference file if enhancement is substantial
5. **Bump version** -- Minor for new sections/significant additions; Patch for clarifications

| Size | Content Added | Version Impact |
|------|---------------|----------------|
| Small (< 20 lines) | Bullets, table rows, clarifications | Patch |
| Medium (20-80 lines) | New pattern, expanded step, new examples | Minor |
| Large (80+ lines) | New step, new reference file, restructured section | Minor or Major |

## Reference File Addition

When classification is `reference_doc`:

1. Identify parent skill
2. Name the file (kebab-case, descriptive of the topic)
3. Write content (80-150 lines, one topic, tables and examples)
4. Add to parent's Reference Requirements and References sections
5. Bump parent version (minor)

## Quality Comparison

| Attribute | Extraction (~50 lines) | Full Skill (~500 lines) |
|-----------|----------------------|------------------------|
| Structure | Ad-hoc, varies by source | Template-driven, 13 sections |
| Depth | Surface-level coverage | Deep guidance with examples |
| References | None | 4+ supporting files |
| Validation | None | Quality checklist + MECE |
| Deliverables | Not defined | Explicit outputs with locations |
| Boundaries | Implicit | Explicit IS/IS NOT with cross-refs |

## Common Pitfalls

| Pitfall | Prevention |
|---------|------------|
| **Premature promotion** -- treating extraction as finished skill | Always run the 7-step expansion |
| **Wrong classification** -- narrow topic as standalone | Run decision tree; check overlap |
| **Expansion bloat** -- padding to hit line counts | Focus on tables and templates, not prose |
| **Orphan extraction** -- never classified or acted upon | Track all extractions to completion |
| **Style mismatch** -- enhancement breaks parent format | Read parent skill before writing |

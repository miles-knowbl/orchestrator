---
name: content-analysis
description: "Analyze provided content to extract meaningful information, reusable skills, and recurring patterns. Applies structured decomposition, taxonomy-driven classification, and confidence-scored extraction to transform raw content into actionable knowledge components. Powers the inbox/second-brain extraction pipeline."
phase: VALIDATE
category: meta
version: "2.0.0"
depends_on: []
tags: [meta, analysis, extraction, patterns, knowledge, taxonomy, second-brain]
---

# Content Analysis

Analyze provided content to extract meaningful information, skills, and patterns for reuse.

## When to Use

- **Inbox item arrives** --- New content enters the second-brain pipeline and needs decomposition into knowledge components
- **Skill extraction needed** --- Content contains procedures, instructions, or workflows that should become reusable skills
- **Pattern discovery requested** --- You have a body of content and want to surface recurring structures, techniques, or anti-patterns
- **Content audit or review** --- Existing knowledge base needs quality assessment and gap identification
- **Cross-domain transfer** --- Insights from one domain need to be generalized for application elsewhere
- **Knowledge base enrichment** --- Second brain needs new entries with proper taxonomy and confidence scoring
- When you say: "analyze this content", "extract skills from", "find patterns in", "what's reusable here", "break this down"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `content-taxonomy.md` | Classification hierarchy for all content types and knowledge components |
| `confidence-scoring.md` | Framework for assigning confidence levels to extracted elements |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `extraction-heuristics.md` | When content is ambiguous or multi-layered and automated heuristics are needed |
| `pattern-catalog.md` | When matching extracted patterns against known pattern archetypes |
| `skill-template-guide.md` | When extracted procedures need to be formatted as reusable skill definitions |

**Verification:** Ensure every extracted element has a taxonomy classification, a confidence score, and at least one supporting evidence citation from the source content.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `ANALYSIS-REPORT.md` | Project root | Always --- full extraction results with scored elements |
| `EXTRACTED-PATTERNS.md` | Project root | When 2+ patterns identified --- catalog of discovered patterns |
| `EXTRACTED-SKILLS.md` | Project root | When procedures or workflows found --- reusable skill candidates |
| `EXTRACTION-LOG.md` | Project root | When content is complex or ambiguous --- decision trail for extraction choices |

## Core Concept

Content Analysis answers: **"What reusable knowledge lives inside this content?"**

Content analysis is:
- **Decompositive** --- Breaks content into atomic knowledge components that can be independently stored, searched, and recombined
- **Taxonomic** --- Every extracted element is classified within a consistent hierarchy so it can be found and related to other knowledge
- **Scored** --- Confidence levels accompany every extraction so downstream consumers know how much weight to assign
- **Evidence-linked** --- Every extracted element traces back to specific passages in the source content
- **Transfer-oriented** --- Extractions are generalized beyond their original context to maximize reuse across domains

Content analysis is NOT:
- Summarization (summaries compress; analysis decomposes and classifies)
- Source collection (that is `context-ingestion`)
- Synthesis across sources (that is `context-cultivation`)
- Priority ranking (that is `priority-matrix`)
- Opinion or recommendation (analysis surfaces what is there, not what to do about it)

## The Content Analysis Process

```
┌──────────────────────────────────────────────────────────────────┐
│                   CONTENT ANALYSIS PROCESS                       │
│                                                                  │
│  1. CONTENT INTAKE                                               │
│     └─> Parse structure, identify format, assess scope           │
│                                                                  │
│  2. STRUCTURAL DECOMPOSITION                                     │
│     └─> Break content into segments, sections, and atoms         │
│                                                                  │
│  3. TAXONOMY CLASSIFICATION                                      │
│     └─> Classify each segment by type, domain, and granularity   │
│                                                                  │
│  4. PATTERN RECOGNITION                                          │
│     └─> Identify recurring structures, techniques, anti-patterns │
│                                                                  │
│  5. SKILL EXTRACTION                                             │
│     └─> Pull out procedures, workflows, and reusable methods     │
│                                                                  │
│  6. CONFIDENCE SCORING                                           │
│     └─> Assign confidence to every extracted element             │
│                                                                  │
│  7. CROSS-REFERENCE MAPPING                                      │
│     └─> Link extractions to existing knowledge and each other    │
│                                                                  │
│  8. VALIDATION & ASSEMBLY                                        │
│     └─> Quality check, assemble deliverables, flag gaps          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Step 1: Content Intake

Before decomposing content, understand what you are working with. This step establishes the scope, format, and structural characteristics of the input.

### Intake Assessment

| Dimension | Questions to Answer |
|-----------|---------------------|
| **Format** | Is this prose, code, structured data, conversation, mixed media? |
| **Length** | How much content? Paragraph, page, chapter, corpus? |
| **Density** | Information-dense (technical spec) or information-sparse (casual note)? |
| **Structure** | Headings, lists, code blocks, or unstructured freeform? |
| **Domain** | Technical, business, creative, scientific, procedural? |
| **Provenance** | Original work, curated collection, generated output, transcription? |

### Intake Output

```markdown
### Content Intake Summary

- **Source:** [identifier or description]
- **Format:** [prose / code / structured / conversation / mixed]
- **Length:** [word count or section count]
- **Density:** High / Medium / Low
- **Structure Level:** [well-structured / semi-structured / unstructured]
- **Primary Domain:** [domain]
- **Secondary Domains:** [list if cross-domain]
- **Provenance:** [original / curated / generated / transcribed]
- **Estimated Extraction Yield:** High / Medium / Low
```

### Intake Decision Matrix

| Density | Structure | Approach |
|---------|-----------|----------|
| High | Well-structured | Section-by-section deep extraction |
| High | Unstructured | Chunking pass first, then deep extraction per chunk |
| Low | Well-structured | Skip structural extraction, focus on key claims |
| Low | Unstructured | Scan for high-value nuggets, skip bulk content |

## Step 2: Structural Decomposition

Break the content into progressively smaller units. Each unit becomes a candidate for classification and extraction.

### Decomposition Hierarchy

```
Document
  └── Section (H2-level or thematic boundary)
        └── Segment (paragraph, code block, list group)
              └── Atom (single claim, instruction, definition, or data point)
```

### Decomposition Techniques

| Technique | Description | Best For |
|-----------|-------------|----------|
| **Heading-based splitting** | Use existing headings as natural boundaries | Well-structured documents |
| **Topic shift detection** | Identify where the subject changes | Unstructured prose |
| **Marker-based parsing** | Split on code fences, list markers, or formatting | Mixed-format content |
| **Sentence-level analysis** | Treat each sentence as a potential atom | Dense technical content |
| **Dialogue turn splitting** | Split on speaker changes | Conversations and interviews |

### Segment Classification During Decomposition

As you decompose, tag each segment with its structural role:

| Role | Description | Example |
|------|-------------|---------|
| **Declarative** | States a fact or definition | "REST APIs use HTTP methods for CRUD operations" |
| **Procedural** | Describes steps or instructions | "First, configure the database connection" |
| **Evaluative** | Expresses judgment or comparison | "React outperforms Vue in large-scale applications" |
| **Exemplary** | Provides a concrete example or illustration | "For instance, a shopping cart service..." |
| **Contextual** | Provides background or framing | "In the early 2000s, microservices emerged..." |
| **Cautionary** | Warns against something | "Never store passwords in plaintext" |

### Decomposition Checklist

```markdown
- [ ] Content divided into sections with clear boundaries
- [ ] Each section broken into segments (paragraph-level)
- [ ] Key segments decomposed to atomic level
- [ ] Every segment tagged with structural role
- [ ] No content orphaned or skipped
- [ ] Hierarchical relationships preserved (atom → segment → section)
```

## Step 3: Taxonomy Classification

Every segment and atom receives a classification within a multi-dimensional taxonomy. Consistent classification enables search, retrieval, and relationship mapping across the knowledge base.

### Primary Taxonomy Dimensions

| Dimension | Values | Purpose |
|-----------|--------|---------|
| **Content Type** | concept, procedure, pattern, principle, example, reference, opinion, data | What kind of knowledge is this? |
| **Domain** | engineering, design, business, operations, meta, cross-domain | What field does this belong to? |
| **Granularity** | atomic, composite, framework | How self-contained is this? |
| **Actionability** | actionable, informational, contextual | Can you do something with it directly? |
| **Durability** | evergreen, seasonal, ephemeral | How long will this remain valid? |

### Content Type Definitions

| Type | Definition | Signal Phrases |
|------|-----------|----------------|
| **Concept** | An idea, model, or mental framework | "X is...", "The idea of...", "Fundamentally..." |
| **Procedure** | Step-by-step instructions for achieving a result | "First...", "To do X...", "The process is..." |
| **Pattern** | A recurring solution structure applicable across contexts | "A common approach is...", "This pattern..." |
| **Principle** | A guiding rule or heuristic for decision-making | "Always...", "Never...", "Prefer X over Y" |
| **Example** | A concrete instance illustrating a concept or procedure | "For instance...", "Consider the case of..." |
| **Reference** | Factual data, API signatures, configuration values | Tables, lists of parameters, version numbers |
| **Opinion** | A subjective assessment or recommendation | "I believe...", "The best approach is...", "We prefer..." |
| **Data** | Quantitative information, metrics, measurements | Numbers, percentages, benchmarks, statistics |

### Classification Template

For each significant segment or atom:

```markdown
### [Segment Title or Summary]

- **Content Type:** [concept / procedure / pattern / principle / example / reference / opinion / data]
- **Domain:** [engineering / design / business / operations / meta / cross-domain]
- **Granularity:** [atomic / composite / framework]
- **Actionability:** [actionable / informational / contextual]
- **Durability:** [evergreen / seasonal / ephemeral]
- **Keywords:** [3-5 descriptive terms]
- **Source Location:** [section/paragraph/line reference]
```

### Classification Quality Rules

| Rule | Rationale |
|------|-----------|
| **Single primary type** | Each element gets one content type; avoid double-classification |
| **Domain may be multiple** | Cross-domain elements list primary + secondary domains |
| **Durability requires justification** | If marked evergreen, explain why it will not age |
| **Opinions are labeled honestly** | Subjective content is typed as opinion, even when authoritative |
| **Keywords match existing vocabulary** | Reuse terms from the knowledge base before inventing new ones |

## Step 4: Pattern Recognition

Patterns are recurring structures that transcend their immediate context. This step identifies patterns that can be generalized and cataloged for reuse.

### Pattern Detection Strategies

| Strategy | Method | Yields |
|----------|--------|--------|
| **Repetition scanning** | Look for structures, phrases, or approaches that appear multiple times | Frequency patterns |
| **Analogy detection** | Identify elements that resemble known patterns from the pattern catalog | Archetypal matches |
| **Inversion analysis** | Examine what the content avoids or warns against | Anti-patterns |
| **Abstraction laddering** | Climb from specific examples to the general principle they embody | Design principles |
| **Relationship mapping** | Chart how elements depend on, enable, or conflict with each other | Structural patterns |

### Pattern Types

| Type | Description | Example |
|------|-------------|---------|
| **Solution pattern** | A reusable approach to a recurring problem | "Use a queue to decouple producers from consumers" |
| **Process pattern** | A repeatable sequence of steps that produces consistent results | "Always validate input before processing" |
| **Structural pattern** | A recurring organizational shape | "Hub-and-spoke architecture for centralized control" |
| **Communication pattern** | A recurring way information flows or is presented | "Decision records follow context-decision-consequences format" |
| **Anti-pattern** | A recurring approach that produces poor results | "Premature optimization at the expense of readability" |
| **Transition pattern** | A recurring way systems or processes evolve | "Start monolithic, extract services as boundaries emerge" |

### Pattern Documentation Template

```markdown
### Pattern: [Descriptive Name]

**Type:** [solution / process / structural / communication / anti-pattern / transition]
**Confidence:** [high / medium / low]
**Evidence Count:** [N] occurrences in source content
**Generalizability:** [universal / domain-specific / context-dependent]

**Description:**
[Clear explanation of the pattern in domain-neutral language]

**Source Evidence:**
1. [Source location]: "[Relevant excerpt]"
2. [Source location]: "[Relevant excerpt]"

**When to Apply:**
- [Conditions under which this pattern is useful]

**When to Avoid:**
- [Conditions under which this pattern is harmful or inappropriate]

**Related Patterns:**
- [Complementary patterns]
- [Alternative patterns]
- [Conflicting patterns]
```

### Pattern Quality Criteria

```markdown
- [ ] Pattern appears at least twice in the source content (or once with strong analogy to known pattern)
- [ ] Pattern is described in domain-neutral terms where possible
- [ ] When-to-apply and when-to-avoid are both specified
- [ ] Confidence level reflects evidence strength
- [ ] Related patterns are identified
```

## Step 5: Skill Extraction

Skills are reusable procedures or workflows that can be applied independently. This step identifies procedural knowledge and formats it for the skill library.

### Skill Detection Signals

| Signal | Description | Example |
|--------|-------------|---------|
| **Imperative sequences** | Ordered steps that produce a result | "1. Create the config file 2. Set the port 3. Start the server" |
| **Decision trees** | Branching logic for handling different conditions | "If X, then do Y; otherwise do Z" |
| **Checklists** | Items that must be verified or completed | "Before deploying, ensure: tests pass, docs updated, changelog written" |
| **Recipes** | Input-process-output descriptions with specific parameters | "Take the user ID, query the database, return the profile object" |
| **Troubleshooting guides** | Diagnosis and resolution paths | "If you see error X, check Y, then try Z" |

### Skill Extraction Template

```markdown
### Extracted Skill: [Name]

**Source Location:** [where in the content this was found]
**Extraction Confidence:** [high / medium / low]
**Completeness:** [complete / partial --- needs additional steps / fragment --- needs significant expansion]

**Trigger:** [When would someone invoke this skill?]
**Input:** [What information or preconditions are required?]
**Output:** [What does successful execution produce?]

**Procedure:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
...

**Decision Points:**
- [Conditions that change the procedure]

**Error Handling:**
- [What can go wrong and how to handle it]

**Prerequisites:**
- [Skills, tools, or knowledge needed before starting]

**Skill Library Fit:**
- **Phase:** [which skill library phase this belongs to]
- **Category:** [core / specialized / meta / infra]
- **Existing Overlap:** [does this duplicate or extend an existing skill?]
```

### Skill Quality Assessment

| Quality | Criterion | Pass If |
|---------|-----------|---------|
| **Self-contained** | Can someone follow this without the source content? | Steps are complete and unambiguous |
| **Repeatable** | Will this produce the same result each time? | No implicit assumptions or missing context |
| **Transferable** | Can this be applied outside its original context? | Domain-specific terms are defined or generalizable |
| **Testable** | Can you verify the skill was applied correctly? | Output is observable and measurable |
| **Scoped** | Does this do one thing well? | Single clear purpose, not a multi-skill bundle |

## Step 6: Confidence Scoring

Every extracted element --- pattern, skill, classification, claim --- receives a confidence score. Confidence scoring is the mechanism that separates rigorous analysis from speculation.

### Confidence Framework

| Level | Score | Definition | Evidence Threshold |
|-------|-------|------------|--------------------|
| **Definitive** | 0.9-1.0 | Explicitly stated, unambiguous, verifiable | Direct quote, formal definition, or code |
| **Strong** | 0.7-0.89 | Clearly implied, well-supported, minor inference | Multiple supporting passages, consistent context |
| **Moderate** | 0.5-0.69 | Reasonable inference with some uncertainty | Single passage with supporting context |
| **Tentative** | 0.3-0.49 | Plausible but speculative, limited evidence | Indirect inference, pattern matching without confirmation |
| **Weak** | 0.0-0.29 | Speculative, based on analogy or extrapolation | No direct evidence, derived from related content |

### Scoring Dimensions

Each confidence score is a composite of three sub-scores:

| Dimension | Question | Weight |
|-----------|----------|--------|
| **Explicitness** | How directly does the source state this? | 40% |
| **Consistency** | Does other content in the source support this? | 35% |
| **Completeness** | Is the extraction capturing the full picture? | 25% |

### Composite Score Calculation

```
confidence = (explicitness * 0.40) + (consistency * 0.35) + (completeness * 0.25)
```

Each dimension is scored 0.0-1.0. The composite is the weighted average.

### Confidence Adjustments

Apply these adjustments to the raw composite score:

| Adjustment | Condition | Effect |
|------------|-----------|--------|
| **Corroboration boost** | Same finding appears in multiple sections | +0.1 |
| **Contradiction penalty** | Other content contradicts this extraction | -0.15 |
| **Ambiguity penalty** | Source language is vague or hedging | -0.1 |
| **Domain authority boost** | Source is authoritative in the extraction domain | +0.05 |
| **Staleness penalty** | Content is dated and domain is fast-moving | -0.1 |

### Confidence Scoring Checklist

```markdown
- [ ] Every extracted element has a confidence score
- [ ] Scores are justified with evidence citations
- [ ] Adjustments are documented (e.g., "+0.1 corroboration: also stated in section 3")
- [ ] No scores above 0.9 without direct quotes or formal definitions
- [ ] No scores below 0.3 without flagging as speculative
```

## Step 7: Cross-Reference Mapping

Extracted elements do not exist in isolation. This step maps relationships between extractions and connects them to existing knowledge.

### Relationship Types

| Relationship | Description | Notation |
|--------------|-------------|----------|
| **Supports** | Element A provides evidence for Element B | A → supports → B |
| **Contradicts** | Element A conflicts with Element B | A → contradicts → B |
| **Extends** | Element A builds on Element B | A → extends → B |
| **Instantiates** | Element A is a concrete example of Element B | A → instantiates → B |
| **Requires** | Element A depends on Element B | A → requires → B |
| **Supersedes** | Element A replaces or updates Element B | A → supersedes → B |
| **Complements** | Element A and B together provide more value than either alone | A ↔ complements ↔ B |

### Cross-Reference Matrix

```markdown
### Extraction Cross-References

| Element | Supports | Contradicts | Extends | Related Existing Knowledge |
|---------|----------|-------------|---------|----------------------------|
| PAT-001 | SKL-002 | --- | --- | [existing pattern X] |
| SKL-001 | PAT-001, PAT-003 | --- | [existing skill Y] | --- |
| CLM-001 | CLM-003 | CLM-005 | --- | [existing claim Z] |
```

### Integration with Existing Knowledge Base

For each extraction, check:

```markdown
- [ ] Does this duplicate an existing knowledge base entry?
  - If yes: Flag as potential update to existing entry
- [ ] Does this extend an existing entry?
  - If yes: Note the entry ID and the extension
- [ ] Does this contradict an existing entry?
  - If yes: Flag for reconciliation with confidence comparison
- [ ] Is this genuinely novel?
  - If yes: Mark as candidate for new knowledge base entry
```

## Step 8: Validation and Assembly

Final quality pass before assembling deliverables. This step ensures every extraction meets quality standards and the output is internally consistent.

### Validation Checklist

```markdown
## Extraction Quality Review

### Completeness
- [ ] All content sections have been analyzed (no skipped sections)
- [ ] Every significant claim has been extracted or explicitly deprioritized
- [ ] Extraction depth matches content density (high density = deep extraction)
- [ ] Gaps between content and extractions are documented

### Classification Quality
- [ ] Every extraction has a taxonomy classification
- [ ] Content types are correctly assigned (procedure vs. concept, etc.)
- [ ] Domain assignments are accurate
- [ ] Keywords are consistent with existing vocabulary

### Confidence Quality
- [ ] Every extraction has a confidence score
- [ ] Scores are calibrated (not all clustered at one level)
- [ ] High-confidence extractions have strong evidence
- [ ] Low-confidence extractions are flagged appropriately

### Pattern Quality
- [ ] Patterns are described in generalizable terms
- [ ] Each pattern has when-to-apply and when-to-avoid
- [ ] Anti-patterns are labeled as such
- [ ] Pattern evidence is cited

### Skill Quality
- [ ] Extracted skills are self-contained
- [ ] Procedures are complete (no missing steps)
- [ ] Decision points are documented
- [ ] Skill library fit is assessed

### Cross-Reference Quality
- [ ] Relationships between extractions are mapped
- [ ] Connections to existing knowledge are noted
- [ ] Contradictions are surfaced, not hidden
- [ ] Duplicate candidates are flagged
```

### Assembly Sequence

1. Compile ANALYSIS-REPORT.md with all extractions, classifications, and scores
2. Extract patterns into EXTRACTED-PATTERNS.md (if 2+ patterns found)
3. Extract skills into EXTRACTED-SKILLS.md (if procedures found)
4. Write EXTRACTION-LOG.md for complex or ambiguous content
5. Final consistency pass across all deliverables

### Coverage Thresholds

| Metric | Target | Minimum |
|--------|--------|---------|
| Content analyzed | 100% of significant sections | 90% of significant sections |
| Extractions classified | 100% | 100% (no unclassified extractions) |
| Confidence scored | 100% | 100% (no unscored extractions) |
| Cross-references mapped | All obvious relationships | Major relationships identified |
| Patterns documented | All recurring structures | Patterns with 2+ occurrences |

## Output Formats

### Quick Format (Single document, low-medium density)

```markdown
# Content Analysis: [Source Title]

**Analyzed:** [Date]
**Source:** [identifier]
**Content Type:** [format] | **Density:** [level] | **Domain:** [domain]

## Key Extractions

### Concepts
1. **[Concept Name]** (confidence: X.XX) --- [one-line description]
2. **[Concept Name]** (confidence: X.XX) --- [one-line description]

### Patterns
1. **[Pattern Name]** ([type], confidence: X.XX) --- [one-line description]

### Skills
1. **[Skill Name]** (confidence: X.XX, completeness: [level]) --- [one-line description]

### Principles
1. **[Principle]** (confidence: X.XX) --- [one-line description]

## Confidence Summary
- Definitive (0.9+): [N] extractions
- Strong (0.7-0.89): [N] extractions
- Moderate (0.5-0.69): [N] extractions
- Tentative/Weak (<0.5): [N] extractions

## Gaps
- [Missing information or coverage gaps]

## Cross-References
- [Connections to existing knowledge]
```

### Full Format (Complex content, high density, or multi-section)

```markdown
# Content Analysis Report

**Source:** [title or identifier]
**Analyzed:** [date]
**Analyst Context:** [what prompted this analysis]

## Executive Summary

[2-3 paragraph overview of findings. Lead with highest-value extraction.
State overall confidence. Note key patterns and gaps.]

## Content Intake Assessment

[Intake summary from Step 1]

## Structural Decomposition

### Section Map
| Section | Segments | Atoms | Dominant Type | Key Finding |
|---------|----------|-------|---------------|-------------|
| [Name] | [N] | [N] | [type] | [one-line] |

## Classified Extractions

### Concepts (N found)

#### [Concept 1 Title]
- **Classification:** concept / [domain] / [granularity] / [actionability] / [durability]
- **Confidence:** X.XX ([explicitness] / [consistency] / [completeness])
- **Evidence:** [source location and excerpt]
- **Keywords:** [terms]
- **Description:** [full description]

[Repeat for each concept...]

### Patterns (N found)

[Full pattern documentation from Step 4 template]

### Skills (N found)

[Full skill documentation from Step 5 template]

### Principles (N found)

[Each principle with classification and confidence]

### Reference Data (N found)

[Factual extractions with source citations]

## Cross-Reference Map

[Matrix from Step 7]

## Confidence Distribution

| Level | Count | Percentage | Notes |
|-------|-------|------------|-------|
| Definitive (0.9+) | [N] | [%] | [notes] |
| Strong (0.7-0.89) | [N] | [%] | [notes] |
| Moderate (0.5-0.69) | [N] | [%] | [notes] |
| Tentative (0.3-0.49) | [N] | [%] | [notes] |
| Weak (<0.3) | [N] | [%] | [notes] |

## Gaps and Limitations

| Gap | Impact | Suggested Action |
|-----|--------|-----------------|
| [Description] | [Effect on analysis quality] | [How to address] |

## Recommendations for Knowledge Base

- **New entries:** [N] extractions recommended for addition
- **Updates:** [N] existing entries should be updated
- **Conflicts:** [N] contradictions need reconciliation
- **Skills:** [N] procedures ready for skill library formatting

## Extraction Log

[Major decisions, ambiguities resolved, elements deprioritized]
```

## Common Patterns

### The Deep Dissection

Process a single dense document with maximum extraction depth. Every paragraph yields classified atoms. Every claim is scored. Every procedure is extracted as a skill candidate. Use the full decomposition hierarchy and apply all taxonomy dimensions.

**Use when:** Analyzing a comprehensive technical guide, a detailed specification, or an authoritative reference that is likely to yield many high-confidence extractions.

### The Pattern Sweep

Skim content for structural patterns rather than individual knowledge atoms. Focus on how the content is organized, what approaches recur, and what the implicit rules are. Classification focuses on pattern and principle types rather than concept and reference types.

**Use when:** Content is a collection of examples (case studies, code samples, project retrospectives) where the value is in the recurring approaches rather than individual facts.

### The Skill Harvest

Prioritize procedural knowledge extraction above all other types. Scan for imperative sequences, decision trees, checklists, and troubleshooting guides. Every extracted skill is assessed for completeness and library fit. Non-procedural content is classified quickly but not deeply extracted.

**Use when:** Content is a how-to guide, runbook, playbook, or instructional material where the primary goal is building reusable procedures.

### The Triage Scan

Rapid, shallow analysis to determine whether content warrants deeper analysis. Classify at the section level only, score confidence broadly, and produce a quick-format output with recommendations for which sections deserve full analysis.

**Use when:** Large volume of content arrives at once and you need to prioritize what to analyze deeply. Typical for inbox processing where not all items are equally valuable.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-ingestion` | Ingestion collects and organizes raw sources; content analysis decomposes individual sources into knowledge components |
| `context-cultivation` | Cultivation synthesizes across sources; content analysis extracts within a single source. Analysis feeds cultivation with classified components |
| `metadata-extraction` | Metadata extraction captures structural metadata (author, date, format); content analysis extracts semantic content (concepts, patterns, skills) |
| `priority-matrix` | Analysis produces classified extractions; priority matrix ranks them for action |
| `proposal-builder` | Analyzed content provides evidence and patterns that strengthen proposals |
| `code-verification` | Verification validates code structure; content analysis validates knowledge structure |

## Key Principles

**Decompose before classifying.** Break content into atoms before attempting to classify. Trying to classify large chunks leads to vague, multi-type labels. Atomic elements get precise classifications.

**Confidence is not optional.** Every extraction must carry a score. Unscored extractions are indistinguishable from speculation. The score does not need to be perfect --- it needs to exist and be justified.

**Taxonomy consistency enables retrieval.** The value of classification collapses if every analysis invents new categories. Reuse existing taxonomy terms before creating new ones. When new terms are genuinely needed, define them explicitly and add them to the taxonomy.

**Extract for transfer, not for record.** The goal is not to summarize the source --- it is to extract knowledge that can be applied elsewhere. Always ask: "Would this extraction be useful to someone who never sees the source content?"

**Anti-patterns are patterns.** What the content warns against, avoids, or demonstrates as failure is as valuable as positive patterns. Catalog anti-patterns with equal rigor.

**Gaps in the content are findings.** When important topics are absent from the source, that absence is itself an extraction. Document what is missing with the same precision as what is present.

## References

- `references/content-taxonomy.md`: Full classification hierarchy with definitions, examples, and decision trees for ambiguous cases
- `references/confidence-scoring.md`: Detailed scoring rubrics, calibration examples, and adjustment rules for all confidence dimensions
- `references/extraction-heuristics.md`: Signal phrases, structural markers, and automated heuristics for identifying extractable elements
- `references/pattern-catalog.md`: Catalog of known pattern archetypes for matching during pattern recognition
- `references/skill-template-guide.md`: Formatting guide for converting extracted procedures into skill library entries

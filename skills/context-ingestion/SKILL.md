---
name: context-ingestion
description: "Gather and organize context from multiple sources into a structured format. Handles documents, URLs, conversations, and notes. Produces a verified source registry and compiled context corpus ready for downstream analysis."
phase: INIT
category: engineering
version: "2.0.0"
depends_on: []
tags: [planning, research, intake, sources, information-gathering]
---

# Context Ingestion

Gather and organize context from multiple sources into a structured format.

## When to Use

- **New proposal or project kickoff** -- Need to collect and structure background information before analysis begins
- **Client or domain onboarding** -- Entering unfamiliar territory and need to build a knowledge base quickly
- **Research intake** -- Multiple documents, links, or conversations need to be cataloged and made searchable
- **Scattered source material** -- Information exists across different formats and locations, needs consolidation
- **Pre-analysis preparation** -- Downstream skills (context-cultivation, priority-matrix) need a clean, structured input
- When you say: "gather context", "collect sources", "ingest this", "pull together the background", "what do we know?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `source-evaluation.md` | Criteria for assessing source reliability and relevance |
| `extraction-patterns.md` | Standard patterns for pulling content from different source types |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `metadata-schema.md` | When extending default metadata fields for a domain |
| `deduplication-rules.md` | When sources overlap or repeat across formats |
| `url-fetch-guidelines.md` | When ingesting web content at scale |

**Verification:** Ensure CONTEXT-SOURCES.md contains at least one entry per source provided, each with a completed metadata block and reliability rating.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `CONTEXT-SOURCES.md` | Project root | Always -- registry of all sources with metadata |
| `RAW-CONTEXT.md` | Project root | Always -- extracted content organized by source |
| `INGESTION-LOG.md` | Project root | When 5+ sources -- processing notes and decisions |

## Core Concept

Context Ingestion answers: **"What do we know, where did it come from, and how reliable is it?"**

Context ingestion is:
- **Systematic** -- Every source is processed through the same evaluation and extraction pipeline
- **Traceable** -- Every fact in the compiled output links back to a specific source
- **Evaluative** -- Sources are rated for reliability, recency, and relevance, not treated as equally valid
- **Comprehensive** -- Actively seeks breadth across source types to avoid blind spots
- **Non-interpretive** -- Captures what sources say without adding analysis (that is context-cultivation's job)

Context ingestion is NOT:
- Analysis or synthesis (that is `context-cultivation`)
- Priority setting or ranking (that is `priority-matrix`)
- Proposal writing (that is `proposal-builder`)
- Making recommendations based on what was found
- Summarizing to the point of losing source fidelity

## The Context Ingestion Process

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONTEXT INGESTION PROCESS                     │
│                                                                  │
│  1. SOURCE DISCOVERY                                             │
│     └─> Inventory all available and findable sources             │
│                                                                  │
│  2. SOURCE TRIAGE                                                │
│     └─> Evaluate relevance and reliability, prioritize intake    │
│                                                                  │
│  3. CONTENT EXTRACTION                                           │
│     └─> Pull structured content from each source type            │
│                                                                  │
│  4. METADATA TAGGING                                             │
│     └─> Attach provenance, dates, authors, reliability scores    │
│                                                                  │
│  5. DEDUPLICATION & CROSS-REFERENCING                            │
│     └─> Identify overlaps, flag contradictions                   │
│                                                                  │
│  6. REGISTRY ASSEMBLY                                            │
│     └─> Build CONTEXT-SOURCES.md with full metadata              │
│                                                                  │
│  7. CORPUS COMPILATION                                           │
│     └─> Build RAW-CONTEXT.md organized by topic and source       │
│                                                                  │
│  8. COMPLETENESS CHECK                                           │
│     └─> Verify coverage, flag gaps, log decisions                │
└──────────────────────────────────────────────────────────────────┘
```

## Step 1: Source Discovery

Identify every available source before processing any of them. Cast a wide net.

### Source Inventory Checklist

```markdown
- [ ] User-provided documents (PDFs, Word docs, slides, spreadsheets)
- [ ] URLs and web pages explicitly shared
- [ ] Conversation transcripts or chat logs
- [ ] Meeting notes or recordings
- [ ] Freeform notes or braindumps
- [ ] Existing project files (README, specs, prior proposals)
- [ ] Codebase context (if technical project)
- [ ] Email threads or correspondence
- [ ] Competitor or market materials
- [ ] Regulatory or compliance documents
```

### Discovery Strategies

| Strategy | Description | When to Apply |
|----------|-------------|---------------|
| **Explicit collection** | Gather everything the user has directly provided | Always -- first pass |
| **Adjacency search** | Look for related files near provided sources | When sources reference other documents |
| **Gap-driven search** | Identify missing perspectives and ask for them | After initial inventory reveals blind spots |
| **Domain scan** | Search for standard artifacts in the domain | When onboarding to a new industry or codebase |
| **Stakeholder mapping** | Identify who else might have relevant information | When building proposals or strategies |

### Source Discovery Output

```markdown
### Source Inventory

| # | Source Name | Type | Status | Notes |
|---|------------|------|--------|-------|
| 1 | Client brief.pdf | Document | Pending extraction | Primary input |
| 2 | https://example.com/about | URL | Pending fetch | Company background |
| 3 | Kickoff call notes | Conversation | Pending extraction | Key decisions made |
| 4 | Competitor analysis spreadsheet | Document | Pending extraction | Market context |
| 5 | [GAP] Technical requirements | Unknown | Not yet provided | Need to request |
```

## Step 2: Source Triage

Not all sources deserve equal attention. Evaluate before extracting.

### Reliability Assessment

Rate each source on a 1-5 scale across three dimensions:

| Dimension | 1 (Low) | 3 (Medium) | 5 (High) |
|-----------|---------|------------|-----------|
| **Authority** | Unknown author, no credentials | Known author, some expertise | Domain expert, official source |
| **Recency** | Over 2 years old | 6-24 months old | Less than 6 months old |
| **Specificity** | Generic, tangentially related | Partially relevant | Directly addresses the topic |

### Composite Reliability Score

```
Reliability = (Authority + Recency + Specificity) / 3
  5.0 - 4.0  =  HIGH    -->  Extract fully, high confidence
  3.9 - 2.5  =  MEDIUM  -->  Extract selectively, note caveats
  2.4 - 1.0  =  LOW     -->  Extract key claims only, flag uncertainty
```

### Triage Priority Matrix

| Reliability | Relevance High | Relevance Medium | Relevance Low |
|-------------|---------------|-----------------|--------------|
| **HIGH** | Extract first, full depth | Extract second, full depth | Extract key points only |
| **MEDIUM** | Extract second, selective | Extract third, selective | Skip or skim |
| **LOW** | Extract with caveats | Skim for unique claims | Skip |

### Red Flags During Triage

Watch for sources that require extra scrutiny:

- **Undated material** -- Cannot assess recency; flag and note
- **Promotional content** -- May overstate capabilities; cross-reference claims
- **Single-source claims** -- Important facts backed by only one source; note as unverified
- **Contradicting sources** -- Two sources disagree on facts; capture both, flag for resolution
- **Stale technical content** -- Technology references that may be outdated; verify currency

## Step 3: Content Extraction

Apply source-type-specific extraction patterns to pull structured content.

### Extraction by Source Type

| Source Type | Extraction Method | Key Elements to Capture |
|-------------|-------------------|------------------------|
| **Documents (PDF, DOCX)** | Section-by-section extraction | Headings, key paragraphs, data tables, figures, conclusions |
| **URLs / Web pages** | Main content extraction, ignore navigation | Article body, author, date, key data points |
| **Conversations** | Decision and action extraction | Decisions made, action items, open questions, participants |
| **Meeting notes** | Structured summary | Attendees, agenda items, decisions, follow-ups |
| **Freeform notes** | Topic clustering | Group by theme, preserve original phrasing for key ideas |
| **Spreadsheets** | Data characterization | Column meanings, row counts, key metrics, date ranges |
| **Code / Repos** | Structure and pattern extraction | Architecture, tech stack, dependencies, conventions |
| **Email threads** | Chronological decision tracking | Thread of decisions, final positions, open items |

### Extraction Template

For each source, produce a block following this format:

```markdown
### [Source Name]

**Source ID:** SRC-001
**Type:** Document | URL | Conversation | Notes | Code | Data
**Reliability:** HIGH | MEDIUM | LOW (score: X.X)
**Extracted:** [date]

#### Key Content

[Extracted content organized by topic. Use direct quotes for important
statements. Paraphrase for general context. Always attribute.]

#### Notable Claims

- [Specific factual claim from the source]
- [Another claim worth tracking]

#### Open Questions

- [Questions raised by this source]
- [Ambiguities that need clarification]
```

### Extraction Quality Rules

| Rule | Rationale |
|------|-----------|
| **Preserve original language for key claims** | Paraphrasing can shift meaning; quote when precision matters |
| **Note page/section numbers** | Enables verification without re-reading entire source |
| **Separate fact from opinion** | Mark subjective assessments as such (e.g., "Author claims...") |
| **Flag quantitative data** | Numbers, dates, and metrics are high-value; always capture precisely |
| **Capture what is NOT said** | Notable omissions (e.g., no mention of budget) are information too |

## Step 4: Metadata Tagging

Every source entry gets a complete metadata block. Consistent metadata enables filtering, sorting, and tracing.

### Standard Metadata Schema

```markdown
---
source_id: SRC-001
title: "Client Requirements Brief"
type: document
format: pdf
author: "Jane Smith, VP Product"
organization: "Acme Corp"
date_created: 2025-11-15
date_accessed: 2026-01-25
reliability: 4.2
authority: 5
recency: 4
specificity: 4
word_count: 3200
topics: [requirements, timeline, budget, integrations]
related_sources: [SRC-003, SRC-007]
contradicts: []
status: extracted
notes: "Primary input document. Contains both requirements and constraints."
---
```

### Required vs Optional Metadata

| Field | Required | Default if Missing |
|-------|----------|--------------------|
| `source_id` | Yes | Auto-generated (SRC-NNN) |
| `title` | Yes | Filename or URL |
| `type` | Yes | -- |
| `reliability` | Yes | -- |
| `date_accessed` | Yes | Current date |
| `topics` | Yes | -- |
| `author` | No | "Unknown" |
| `date_created` | No | "Unknown" |
| `organization` | No | "Unknown" |
| `related_sources` | No | [] |
| `contradicts` | No | [] |

## Step 5: Deduplication and Cross-Referencing

After extraction, identify overlaps and build connections between sources.

### Deduplication Rules

| Scenario | Action |
|----------|--------|
| **Exact duplicate** | Keep the more authoritative or more recent version; note the duplicate |
| **Overlapping content** | Merge into a single entry, cite both sources |
| **Same topic, different angles** | Keep both; link via `related_sources` |
| **Contradicting claims** | Keep both; flag in `contradicts` field; note in INGESTION-LOG.md |

### Cross-Reference Matrix

Build a topic-to-source matrix to visualize coverage:

```markdown
### Cross-Reference Matrix

| Topic | SRC-001 | SRC-002 | SRC-003 | SRC-004 | Coverage |
|-------|---------|---------|---------|---------|----------|
| Budget | X | | X | | 2 sources |
| Timeline | X | X | | | 2 sources |
| Tech stack | | | X | X | 2 sources |
| User needs | X | X | X | | 3 sources |
| Competitors | | | | X | 1 source |
| Compliance | | | | | 0 -- GAP |
```

Topics with 0-1 sources should be flagged as potential gaps.

## Step 6: Registry Assembly

Compile CONTEXT-SOURCES.md as the authoritative source registry.

### CONTEXT-SOURCES.md Template

```markdown
# Context Sources Registry

**Project:** [Project name]
**Ingestion Date:** [Date]
**Total Sources:** [Count]
**Source Types:** [Breakdown by type]

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total sources | [N] |
| High reliability | [N] |
| Medium reliability | [N] |
| Low reliability | [N] |
| Unique topics covered | [N] |
| Identified gaps | [N] |

## Source Registry

### SRC-001: [Title]

- **Type:** [type]
- **Author:** [author]
- **Date:** [date]
- **Reliability:** [score] ([HIGH/MEDIUM/LOW])
- **Topics:** [topic1, topic2, topic3]
- **Related:** [SRC-NNN, SRC-NNN]
- **Summary:** [One-line description of what this source contributes]

### SRC-002: [Title]

[Same format...]

## Coverage Map

[Cross-reference matrix from Step 5]

## Identified Gaps

| Gap | Impact | Suggested Action |
|-----|--------|-----------------|
| [Missing topic] | [How this affects downstream work] | [How to fill it] |
```

## Step 7: Corpus Compilation

Build RAW-CONTEXT.md as the organized content corpus, structured for consumption by context-cultivation.

### RAW-CONTEXT.md Template

```markdown
# Raw Context Corpus

**Project:** [Project name]
**Compiled:** [Date]
**Sources:** [Count] (see CONTEXT-SOURCES.md for full registry)

## How to Read This Document

Content is organized by topic. Each section draws from one or more
sources, identified by source ID (e.g., SRC-001). Direct quotes are
in blockquotes. Paraphrased content is in plain text.

---

## Topic: [Topic Name]

**Sources:** SRC-001, SRC-003, SRC-007

### From SRC-001 (Client Brief, reliability: HIGH)

[Extracted content relevant to this topic]

> "Direct quote from the source when precision matters" (p.12)

### From SRC-003 (Meeting Notes, reliability: MEDIUM)

[Extracted content relevant to this topic]

**Note:** This partially contradicts SRC-001 regarding [specific point].
See INGESTION-LOG.md for details.

---

## Topic: [Next Topic]

[Same structure...]

---

## Unclassified Content

[Content that does not fit neatly into a topic but may be relevant.
Tag with source ID for traceability.]
```

### Organization Principles

| Principle | Application |
|-----------|-------------|
| **Topic-first, not source-first** | Group by what the content is about, not where it came from |
| **Highest reliability first** | Within each topic, lead with the most authoritative source |
| **Contradictions are visible** | When sources disagree, show both and flag the conflict |
| **Gaps are explicit** | Empty topics or thin coverage are noted, not hidden |
| **Original language preserved** | Use blockquotes for critical statements; paraphrase for general context |

## Step 8: Completeness Check

Before marking ingestion as complete, verify coverage and quality.

### Completeness Checklist

```markdown
## Ingestion Completeness Review

### Source Coverage
- [ ] All provided sources have been processed
- [ ] Each source has a complete metadata block in CONTEXT-SOURCES.md
- [ ] Each source has extracted content in RAW-CONTEXT.md
- [ ] Source IDs are consistent across all documents

### Quality Checks
- [ ] Reliability scores assigned to every source
- [ ] No placeholder or stub entries remain
- [ ] Contradictions between sources are flagged
- [ ] Direct quotes are accurately attributed
- [ ] Quantitative data (dates, numbers, metrics) verified against source

### Coverage Analysis
- [ ] Cross-reference matrix is complete
- [ ] Gaps are identified and documented
- [ ] Gap impact and suggested actions provided
- [ ] Topics with single-source coverage flagged for attention

### Downstream Readiness
- [ ] RAW-CONTEXT.md is organized by topic (not by source)
- [ ] Content is sufficient for context-cultivation to begin
- [ ] INGESTION-LOG.md documents any decisions or anomalies (if applicable)
```

### Coverage Threshold

| Metric | Target | Minimum |
|--------|--------|---------|
| Sources processed | 100% of provided | 90% of provided |
| Metadata completeness | All required fields | source_id + title + type + reliability |
| Topic coverage | No gaps in core topics | Gaps documented with impact |
| Cross-references | All relationships mapped | Major relationships identified |

## Output Formats

### Quick Format (3 or fewer sources)

```markdown
# Context Sources

**Project:** [Name]
**Date:** [Date]

## Sources

### SRC-001: [Title]
- **Type:** [type] | **Reliability:** [score]
- **Key content:** [2-3 sentence summary]

### SRC-002: [Title]
- **Type:** [type] | **Reliability:** [score]
- **Key content:** [2-3 sentence summary]

## Compiled Context

### [Topic 1]
[Combined content from sources, attributed by SRC-ID]

### [Topic 2]
[Combined content from sources, attributed by SRC-ID]

## Gaps
- [Any missing information noted]
```

### Full Format (4+ sources)

Use the complete CONTEXT-SOURCES.md and RAW-CONTEXT.md templates from Steps 6 and 7, with:
- Full metadata blocks for every source
- Cross-reference matrix
- INGESTION-LOG.md for processing decisions
- Completeness checklist executed and documented

## Common Patterns

### The Deep Dive

Process a small number of highly detailed sources with maximum extraction depth. Every section, every data point, every claim is captured and tagged.

**Use when:** Working with 1-3 dense, authoritative documents (e.g., an RFP, a technical specification, a regulatory filing).

### The Wide Sweep

Process many sources at moderate depth, prioritizing breadth of coverage over extraction completeness. Focus on key claims and unique contributions from each source.

**Use when:** Onboarding to a new domain with 10+ heterogeneous sources (e.g., market research, competitor sites, internal docs, meeting notes).

### The Conversation Harvest

Extract structured information from unstructured dialogue -- meetings, chat logs, interviews. Focus on decisions, action items, stated preferences, and unanswered questions.

**Use when:** Primary inputs are conversations, calls, or informal exchanges rather than polished documents.

### The Incremental Build

Start with an initial source set, process it, then add new sources as they arrive. Each addition triggers a targeted update to the registry and corpus rather than a full reprocessing.

**Use when:** Sources arrive over time rather than all at once (e.g., ongoing client engagement, rolling research).

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-cultivation` | Receives CONTEXT-SOURCES.md and RAW-CONTEXT.md as primary inputs; transforms raw context into synthesized insights |
| `priority-matrix` | Uses cultivated context (which depends on ingested context) to establish priorities |
| `proposal-builder` | Final consumer in the proposal-loop chain; traces claims back to source IDs |
| `metadata-extraction` | Can be invoked as a sub-process during Step 4 for automated metadata tagging |
| `content-analysis` | Complementary skill for deeper analysis of individual complex documents |
| `architect` | In engineering contexts, architecture decisions benefit from ingested technical context |

## Key Principles

**Provenance is non-negotiable.** Every piece of extracted content must trace back to a specific source via its SRC-ID. Untraceable claims are unreliable claims.

**Evaluate before you extract.** Triage saves time. A low-relevance, low-reliability source processed at full depth is wasted effort. Assess first, then calibrate extraction depth.

**Structure enables downstream work.** The value of ingestion is not in the reading -- it is in organizing content so that context-cultivation, priority-matrix, and proposal-builder can work efficiently.

**Gaps are findings, not failures.** Discovering what is missing is as valuable as capturing what is present. Always document gaps with their impact and a suggested path to fill them.

**Preserve fidelity, defer interpretation.** Capture what sources actually say, in their own words when it matters. Interpretation, synthesis, and judgment belong to downstream skills.

**Contradictions are signals.** When sources disagree, do not resolve the conflict -- surface it. Contradictions often point to the most important areas for further investigation.

## References

- `references/source-evaluation.md`: Detailed criteria for assessing source authority, recency, and specificity
- `references/extraction-patterns.md`: Source-type-specific extraction templates and techniques
- `references/metadata-schema.md`: Extended metadata fields for domain-specific ingestion
- `references/deduplication-rules.md`: Rules for handling overlapping and duplicate content
- `references/url-fetch-guidelines.md`: Best practices for web content extraction at scale

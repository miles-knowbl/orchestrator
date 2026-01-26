---
name: metadata-extraction
description: "Extract, parse, and normalize metadata from diverse content sources including URLs, HTTP headers, HTML meta tags, structured data formats, and document structural elements. Produces standardized metadata records conforming to Dublin Core, OpenGraph, JSON-LD, and schema.org vocabularies. Supports the inbox/second-brain pipeline by ensuring every ingested item has rich, consistent, machine-readable metadata."
phase: IMPLEMENT
category: meta
version: "2.0.0"
depends_on: []
tags: [meta, analysis, utilities, parsing]
---

# Metadata Extraction

Extract and normalize metadata from diverse content sources into standardized, machine-readable records.

## When to Use

- **Content enters the inbox pipeline** --- A new URL, document, or media item arrives and needs cataloging before downstream processing
- **Source identification required** --- You need to determine what a piece of content is, where it came from, and who created it
- **Structured data harvesting** --- A page or document contains embedded metadata (OpenGraph, JSON-LD, microdata) that should be captured
- **Cross-platform normalization** --- Content from GitHub, YouTube, documentation sites, blogs, and other platforms needs a uniform metadata format
- **Cataloging and classification** --- Building a knowledge base or second brain that requires consistent metadata across heterogeneous sources
- **Attribution and provenance tracking** --- Need to establish authorship, publication dates, licensing, and source chains
- **Quality assessment of sources** --- Evaluating metadata completeness and reliability before committing to deeper analysis
- When you say: "extract metadata", "catalog this", "what is this source", "parse this URL", "normalize these records", "tag this content"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `metadata-schemas.md` | Canonical field definitions for Dublin Core, OpenGraph, JSON-LD, and schema.org mappings |
| `platform-extractors.md` | Platform-specific extraction patterns for GitHub, YouTube, docs sites, blogs, and APIs |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `normalization-rules.md` | When merging metadata from multiple vocabularies or resolving conflicts between embedded schemas |
| `structured-data-formats.md` | When parsing RDFa, Microdata, JSON-LD, or other embedded structured data from HTML documents |

**Verification:** Ensure every extracted record contains at minimum: title, source_url (or source_path), content_type, date_accessed, and at least one topic tag. Records missing required fields must be flagged as incomplete.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| Metadata record(s) | Inline or appended to source entry | Always --- at least one record per input source |
| Extraction report | Inline summary | When 3+ sources processed --- completeness statistics and quality flags |
| Normalization log | Inline notes | When schema conflicts detected --- decisions on field mapping and precedence |
| Quality assessment | Appended to record | When metadata completeness falls below 70% --- flags and remediation suggestions |

## Core Concept

Metadata Extraction answers: **"What is this content, where did it come from, and how should it be cataloged?"**

Good metadata extraction is:
- **Comprehensive** --- Pulls from every available signal: URL structure, HTTP headers, HTML meta tags, structured data, visible content, and platform conventions
- **Normalized** --- Maps heterogeneous source metadata into a single consistent schema regardless of origin platform
- **Standards-aware** --- Leverages Dublin Core, OpenGraph, JSON-LD, and schema.org vocabularies rather than inventing ad-hoc fields
- **Resilient** --- Degrades gracefully when metadata is sparse, falling back through extraction layers until something useful is found
- **Honest** --- Reports confidence levels and flags incomplete or ambiguous metadata rather than guessing

Metadata Extraction is NOT:
- Content analysis or summarization (that is `content-analysis`)
- Source evaluation or reliability scoring (that is `context-ingestion`)
- Semantic understanding or theme extraction (that is `context-cultivation`)
- Full-text indexing or search optimization
- Data transformation or ETL processing

## The Metadata Extraction Process

```
+-----------------------------------------------------------------+
|               METADATA EXTRACTION PROCESS                        |
|                                                                  |
|  1. SOURCE IDENTIFICATION                                        |
|     +---> Parse URL, detect file type, identify platform         |
|                                                                  |
|  2. STRUCTURAL METADATA EXTRACTION                               |
|     +---> Titles, headings, dates, authors, descriptions         |
|                                                                  |
|  3. EMBEDDED SCHEMA EXTRACTION                                   |
|     +---> OpenGraph, JSON-LD, Microdata, Dublin Core, RDFa       |
|                                                                  |
|  4. PLATFORM-SPECIFIC EXTRACTION                                 |
|     +---> GitHub, YouTube, docs sites, blogs, APIs               |
|                                                                  |
|  5. SEMANTIC METADATA INFERENCE                                  |
|     +---> Topics, categories, language, content class            |
|                                                                  |
|  6. SCHEMA NORMALIZATION                                         |
|     +---> Map all fields to canonical schema, resolve conflicts  |
|                                                                  |
|  7. QUALITY ASSESSMENT                                           |
|     +---> Completeness score, reliability flags, gap report      |
|                                                                  |
|  8. OUTPUT FORMATTING                                            |
|     +---> Produce standardized metadata record                   |
+-----------------------------------------------------------------+
```

## Step 1: Source Identification

Before extracting metadata, determine what you are looking at. The source type dictates which extraction strategies apply.

### URL Parsing

Decompose URLs to extract embedded metadata signals:

| URL Component | Metadata Signal | Example |
|---------------|-----------------|---------|
| **Protocol** | Security, access type | `https` = secure; `file` = local |
| **Domain** | Publisher, platform | `github.com` = code repository |
| **Subdomain** | Content division | `docs.example.com` = documentation |
| **Path segments** | Content hierarchy, type | `/blog/2025/01/title` = blog post, dated |
| **Path extensions** | File format | `.pdf`, `.md`, `.html` |
| **Query parameters** | View state, filters | `?v=xxxxx` = YouTube video ID |
| **Fragment** | Section reference | `#installation` = specific section |

### URL Pattern Recognition

```markdown
## Common URL Patterns

### GitHub
- `github.com/{owner}/{repo}` --> Repository root
- `github.com/{owner}/{repo}/blob/{branch}/{path}` --> File view
- `github.com/{owner}/{repo}/issues/{n}` --> Issue
- `github.com/{owner}/{repo}/pull/{n}` --> Pull request
- `github.com/{owner}/{repo}/releases/tag/{tag}` --> Release

### YouTube
- `youtube.com/watch?v={id}` --> Video
- `youtube.com/playlist?list={id}` --> Playlist
- `youtube.com/@{handle}` --> Channel
- `youtu.be/{id}` --> Short video link

### Documentation Sites
- `docs.{product}.com/{path}` --> Product documentation
- `{product}.readthedocs.io/{path}` --> ReadTheDocs project
- `developer.{company}.com/{path}` --> Developer portal
- `{domain}/api/{version}/{path}` --> API documentation

### Blogs and Articles
- `{domain}/blog/{year}/{month}/{slug}` --> Dated blog post
- `{domain}/posts/{slug}` --> Undated post
- `medium.com/@{author}/{slug}` --> Medium article
- `dev.to/{author}/{slug}` --> Dev.to article
```

### Content Type Detection

Determine content type through multiple signals, in priority order:

| Priority | Signal | Method |
|----------|--------|--------|
| 1 | **HTTP Content-Type header** | Direct server declaration; most authoritative |
| 2 | **File extension** | `.pdf`, `.html`, `.json`, `.md`, `.mp4` |
| 3 | **URL pattern** | Platform-specific patterns (see above) |
| 4 | **Content sniffing** | First bytes / magic numbers of file content |
| 5 | **Heuristic** | Presence of HTML tags, JSON structure, markdown syntax |

### Content Type Taxonomy

```markdown
## Content Classes

- **document**: PDF, Word, slides, spreadsheets
- **webpage**: HTML pages, blog posts, articles
- **code**: Source files, repositories, gists, notebooks
- **media**: Video, audio, images, podcasts
- **data**: JSON, CSV, XML, YAML data files
- **api**: API documentation, endpoint references, schemas
- **conversation**: Forum threads, Q&A, chat logs, comments
- **reference**: Wiki pages, encyclopedic entries, glossaries
```

### Source Identification Checklist

```markdown
- [ ] URL parsed into components (protocol, domain, path, query, fragment)
- [ ] Platform identified (GitHub, YouTube, docs site, blog, generic)
- [ ] Content type determined (document, webpage, code, media, data, api)
- [ ] File format identified if applicable (PDF, HTML, MD, JSON)
- [ ] Access method confirmed (public, authenticated, local)
```

## Step 2: Structural Metadata Extraction

Extract metadata from the visible and structural elements of the content.

### HTML Document Metadata

| Element | Extraction Target | Fallback |
|---------|-------------------|----------|
| `<title>` | Page title | First `<h1>`, then `<h2>` |
| `<meta name="description">` | Page description | First `<p>` of main content |
| `<meta name="author">` | Author name | Byline element, schema.org author |
| `<meta name="keywords">` | Topic keywords | None (often absent or unreliable) |
| `<meta name="date">` / `<time>` | Publication date | URL date pattern, last-modified header |
| `<link rel="canonical">` | Canonical URL | Current URL |
| `<html lang="...">` | Content language | Heuristic detection |

### Date Extraction Priority

Dates are critical metadata but notoriously inconsistent. Extract in this priority order:

| Priority | Source | Reliability | Format Variants |
|----------|--------|-------------|-----------------|
| 1 | `<meta property="article:published_time">` | High | ISO 8601 |
| 2 | `<time datetime="...">` element | High | ISO 8601 |
| 3 | JSON-LD `datePublished` | High | ISO 8601 |
| 4 | HTTP `Last-Modified` header | Medium | RFC 7231 |
| 5 | URL path date pattern (`/2025/01/15/`) | Medium | Year/month/day |
| 6 | Visible text pattern ("Published January 15, 2025") | Low | Natural language |
| 7 | Copyright year in footer | Low | Year only |

### Date Normalization

All extracted dates must be normalized to ISO 8601 format:

```
Full:      2025-01-15T14:30:00Z
Date only: 2025-01-15
Year-month: 2025-01
Year only:  2025
Unknown:   null (with flag: "date_unknown": true)
```

### Author Extraction

| Source | Pattern | Confidence |
|--------|---------|------------|
| `<meta name="author">` | Direct declaration | High |
| Schema.org `author` property | Structured data | High |
| Byline element (`class="author"`, `class="byline"`) | Convention-based | Medium |
| GitHub commit / profile | Platform API | High |
| YouTube channel name | Platform convention | High |
| Text pattern ("By John Smith") | Regex heuristic | Low |

### Structural Elements Checklist

```markdown
- [ ] Title extracted (with source noted: <title>, <h1>, og:title, etc.)
- [ ] Description extracted or generated from first paragraph
- [ ] Author identified (or marked "Unknown" with confidence: low)
- [ ] Publication date extracted and normalized to ISO 8601
- [ ] Language identified (ISO 639-1 code)
- [ ] Canonical URL determined
- [ ] Word count or content length estimated
```

## Step 3: Embedded Schema Extraction

Modern web pages embed structured metadata in multiple overlapping formats. Extract from all available schemas, then normalize in Step 6.

### OpenGraph Protocol (og:)

OpenGraph tags are the most widely deployed structured metadata on the web. Extract from `<meta property="og:...">` tags.

| Property | Maps To | Notes |
|----------|---------|-------|
| `og:title` | title | Often more descriptive than `<title>` |
| `og:description` | description | Social-sharing optimized description |
| `og:type` | content_type | `article`, `video.other`, `website`, `profile` |
| `og:url` | canonical_url | Authoritative URL for the content |
| `og:image` | thumbnail_url | Preview image URL |
| `og:site_name` | publisher | Site or brand name |
| `og:locale` | language | Format: `en_US` |
| `article:published_time` | date_published | ISO 8601 datetime |
| `article:modified_time` | date_modified | ISO 8601 datetime |
| `article:author` | author_url | URL to author profile |
| `article:section` | category | Content section/category |
| `article:tag` | topics[] | Content tags (may repeat) |

### JSON-LD (Linked Data)

JSON-LD is the most machine-readable format, embedded in `<script type="application/ld+json">`. Extract and parse the JSON structure.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Example Article Title",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "url": "https://example.com/authors/jane"
  },
  "datePublished": "2025-01-15T10:00:00Z",
  "dateModified": "2025-01-20T14:30:00Z",
  "publisher": {
    "@type": "Organization",
    "name": "Example Publisher",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  },
  "description": "A description of the article content.",
  "image": "https://example.com/article-image.jpg",
  "mainEntityOfPage": "https://example.com/article-url"
}
```

### Key schema.org Types

| @type | Expected Properties | Content Class |
|-------|-------------------|---------------|
| `Article` / `NewsArticle` / `BlogPosting` | headline, author, datePublished, publisher | webpage |
| `WebPage` / `WebSite` | name, url, description | webpage |
| `SoftwareSourceCode` / `SoftwareApplication` | name, author, programmingLanguage, codeRepository | code |
| `VideoObject` | name, description, duration, uploadDate, thumbnailUrl | media |
| `HowTo` / `TechArticle` | name, step[], proficiencyLevel | reference |
| `Person` / `Organization` | name, url, sameAs[] | entity |
| `Dataset` | name, description, distribution, license | data |
| `APIReference` | name, description, programmingModel | api |

### Dublin Core Metadata

Dublin Core elements appear as `<meta name="DC...." content="...">` or `<meta name="dcterms....">`. This is common in academic, government, and library contexts.

| DC Element | Maps To | Notes |
|------------|---------|-------|
| `DC.title` | title | Formal title |
| `DC.creator` | author | Creator/author name |
| `DC.subject` | topics[] | Subject keywords |
| `DC.description` | description | Content description |
| `DC.publisher` | publisher | Publishing entity |
| `DC.date` | date_published | Publication date |
| `DC.type` | content_type | DCMI Type Vocabulary |
| `DC.format` | format | MIME type |
| `DC.identifier` | identifier | DOI, ISBN, URI |
| `DC.language` | language | ISO 639 code |
| `DC.rights` | license | Rights statement |
| `DC.source` | source_url | Derived-from source |
| `DC.relation` | related[] | Related resources |
| `DC.coverage` | coverage | Spatial/temporal scope |

### Microdata and RDFa

These formats embed metadata directly in HTML attributes:

```html
<!-- Microdata -->
<div itemscope itemtype="https://schema.org/Article">
  <h1 itemprop="headline">Article Title</h1>
  <span itemprop="author">Jane Smith</span>
  <time itemprop="datePublished" datetime="2025-01-15">Jan 15, 2025</time>
</div>

<!-- RDFa -->
<div vocab="https://schema.org/" typeof="Article">
  <h1 property="headline">Article Title</h1>
  <span property="author">Jane Smith</span>
  <time property="datePublished" datetime="2025-01-15">Jan 15, 2025</time>
</div>
```

### Schema Extraction Checklist

```markdown
- [ ] OpenGraph tags extracted (og:title, og:description, og:type, og:url, og:image)
- [ ] JSON-LD blocks parsed (all <script type="application/ld+json"> elements)
- [ ] Dublin Core elements checked (DC.* and dcterms.* meta tags)
- [ ] Microdata scanned (itemscope/itemprop attributes)
- [ ] RDFa scanned (vocab/typeof/property attributes)
- [ ] Twitter Card tags checked (twitter:title, twitter:description, twitter:image)
- [ ] Schema conflicts noted (e.g., og:title differs from JSON-LD headline)
```

## Step 4: Platform-Specific Extraction

Different platforms expose metadata through platform-specific conventions, APIs, and page structures. Apply targeted extractors based on the platform identified in Step 1.

### GitHub

| Metadata Field | Extraction Source |
|----------------|-------------------|
| Repository name | URL path: `/{owner}/{repo}` |
| Owner / organization | URL path: `/{owner}/` |
| Description | `<meta property="og:description">` or repo about section |
| Primary language | Language bar / `linguist` data |
| Topics | Repository topics (tags below description) |
| Stars / forks | Social proof metrics |
| License | `LICENSE` file or API `license` field |
| Last updated | Most recent commit date or push date |
| README content | `README.md` at repository root |
| Contributors | Contributor count from page or API |
| Open issues | Issue count for activity assessment |

### YouTube

| Metadata Field | Extraction Source |
|----------------|-------------------|
| Video title | `og:title` or JSON-LD `name` |
| Channel name | `og:site_name` or channel link text |
| Upload date | JSON-LD `uploadDate` or `datePublished` |
| Duration | JSON-LD `duration` (ISO 8601 duration) |
| Description | `og:description` (often truncated) or JSON-LD |
| View count | JSON-LD `interactionCount` |
| Thumbnail | `og:image` or JSON-LD `thumbnailUrl` |
| Tags | `<meta name="keywords">` (comma-separated) |
| Category | JSON-LD `genre` or visible category link |
| Captions available | Accessibility metadata or API |

### Documentation Sites

| Metadata Field | Extraction Source |
|----------------|-------------------|
| Product / project name | Site header, `og:site_name`, breadcrumb root |
| Doc version | URL segment (`/v2/`, `/latest/`), version selector |
| Section / category | Breadcrumb trail, sidebar navigation context |
| Page title | `<h1>` or `og:title` (strip product prefix) |
| Last updated | Footer date, git blame date, meta tag |
| Navigation context | Previous/next links, breadcrumb hierarchy |
| API version | Path segment or header declaration |

### Blog / Article Platforms

| Platform | Author Source | Date Source | Tags Source |
|----------|-------------|-------------|------------|
| **Medium** | Author card, `@{handle}` in URL | `<time>` element | Bottom-of-article tags |
| **Dev.to** | URL `/{author}/`, profile card | `<time>` element | Visible tag list |
| **WordPress** | `<meta name="author">`, byline | `<time class="entry-date">` | `<a rel="tag">` elements |
| **Ghost** | JSON-LD author, byline | JSON-LD datePublished | JSON-LD keywords |
| **Substack** | Publication name + author | `<time>` or JSON-LD | Categories if present |
| **Hugo / Jekyll** | YAML frontmatter `author` | Frontmatter `date` | Frontmatter `tags` |

### Platform Extraction Checklist

```markdown
- [ ] Platform identified from URL pattern
- [ ] Platform-specific extractor applied
- [ ] Platform-unique fields captured (stars, views, duration, etc.)
- [ ] Author profile URL captured (not just name)
- [ ] Platform-specific content type mapped to canonical type
```

## Step 5: Semantic Metadata Inference

When explicit metadata is absent or sparse, infer semantic properties from content analysis. These inferred fields carry lower confidence than extracted fields.

### Topic Inference

Derive topics from available signals, in priority order:

| Priority | Signal | Method | Confidence |
|----------|--------|--------|------------|
| 1 | Explicit tags / keywords | Direct extraction | High |
| 2 | Article section / category | Platform categorization | High |
| 3 | Title keywords | Key noun phrases from title | Medium |
| 4 | Heading structure | H2/H3 topics across the document | Medium |
| 5 | URL path segments | Meaningful path words | Low |
| 6 | Content body analysis | Frequent terms and phrases | Low |

### Content Classification

Assign a primary content class based on structural signals:

| Content Class | Signals |
|---------------|---------|
| **tutorial** | Step-numbered headings, "how to" in title, code blocks interspersed with prose |
| **reference** | Table-heavy, alphabetical ordering, definition lists, API signatures |
| **conceptual** | Explanatory prose, minimal code, "what is" / "understanding" in title |
| **news** | Dateline, recent date, event-driven topic, publication attribution |
| **opinion** | First-person voice, evaluative language, "I think" / "my experience" |
| **announcement** | "Introducing", "announcing", "releasing", version numbers, changelog format |
| **discussion** | Multiple voices, thread structure, Q&A format |
| **specification** | Formal language, MUST/SHALL/MAY keywords (RFC 2119), numbered requirements |

### Language Detection

| Method | Reliability | Application |
|--------|-------------|-------------|
| `<html lang="...">` attribute | High | Declared by page author |
| `Content-Language` HTTP header | High | Server-declared |
| `og:locale` property | High | OpenGraph declaration |
| Heuristic character analysis | Medium | Script detection (Latin, CJK, Arabic, Cyrillic) |
| n-gram frequency analysis | Medium | Statistical language identification |

### Semantic Inference Checklist

```markdown
- [ ] Topics assigned (with source: explicit, inferred, or both)
- [ ] Content class determined (tutorial, reference, conceptual, etc.)
- [ ] Language identified (ISO 639-1 code)
- [ ] Reading level estimated if applicable (technical depth)
- [ ] Inferred fields marked with confidence: medium or confidence: low
```

## Step 6: Schema Normalization

Map all extracted metadata --- from structural elements, embedded schemas, platform-specific fields, and inferred properties --- into a single canonical record.

### Canonical Metadata Schema

```yaml
# Required fields
title: "string"              # Content title
source_url: "string"         # URL or file path of the source
content_type: "string"       # Canonical type: webpage, document, code, media, data, api, conversation, reference
date_accessed: "ISO 8601"    # When this metadata was extracted
topics: ["string"]           # At least one topic tag

# Strongly recommended fields
description: "string"        # Content summary (1-3 sentences)
author: "string"             # Primary author name
author_url: "string"         # URL to author profile
date_published: "ISO 8601"   # Publication or creation date
date_modified: "ISO 8601"    # Last modification date
language: "string"           # ISO 639-1 language code
publisher: "string"          # Publishing platform or organization
canonical_url: "string"      # Authoritative URL (may differ from source_url)

# Optional enrichment fields
license: "string"            # License identifier (SPDX or description)
thumbnail_url: "string"      # Preview image URL
word_count: "number"         # Approximate content length
reading_time_minutes: "number"  # Estimated reading time
content_class: "string"      # tutorial, reference, conceptual, news, opinion, etc.
platform: "string"           # github, youtube, medium, docs, blog, etc.
format: "string"             # MIME type or file format
identifier: "string"         # DOI, ISBN, or other formal identifier
related: ["string"]          # URLs of related content
tags_explicit: ["string"]    # Tags declared by the source
tags_inferred: ["string"]    # Tags inferred during extraction

# Quality fields
metadata_completeness: "number"  # 0.0-1.0 score
extraction_confidence: "string"  # high, medium, low
extraction_notes: ["string"]     # Flags, warnings, or decisions made during extraction
```

### Field Precedence Rules

When multiple sources provide the same field, apply this precedence:

| Field | First Choice | Second Choice | Third Choice | Last Resort |
|-------|-------------|---------------|--------------|-------------|
| **title** | JSON-LD `headline` | `og:title` | `<title>` | First `<h1>` |
| **description** | JSON-LD `description` | `og:description` | `<meta name="description">` | First paragraph |
| **author** | JSON-LD `author.name` | `<meta name="author">` | Byline element | Platform profile |
| **date_published** | JSON-LD `datePublished` | `article:published_time` | `<time datetime>` | URL date pattern |
| **topics** | Explicit tags + `article:tag` | DC.subject | `<meta name="keywords">` | Inferred from title |
| **content_type** | JSON-LD `@type` mapped | `og:type` mapped | Platform convention | Heuristic |

### Conflict Resolution

When extracted values conflict across schemas:

| Conflict Type | Resolution Strategy |
|---------------|---------------------|
| **Minor wording difference** | Prefer the more specific or complete version |
| **Substantive disagreement** | Prefer JSON-LD > OpenGraph > meta tags > inferred |
| **Date discrepancy** | Prefer the earliest plausible date as published; note discrepancy |
| **Author mismatch** | Prefer structured data (JSON-LD) over unstructured (byline text) |
| **Multiple types** | Use most specific type; note alternative classification |

### Normalization Checklist

```markdown
- [ ] All extracted fields mapped to canonical schema
- [ ] Field precedence applied where conflicts exist
- [ ] Dates normalized to ISO 8601
- [ ] Language normalized to ISO 639-1
- [ ] Content type mapped to canonical taxonomy
- [ ] Conflict resolution decisions documented in extraction_notes
- [ ] Required fields present (title, source_url, content_type, date_accessed, topics)
```

## Step 7: Quality Assessment

Assess the completeness and reliability of the extracted metadata record before finalizing.

### Completeness Scoring

Calculate metadata completeness as a ratio of populated fields to total applicable fields:

```
Completeness = (populated required fields / 5) * 0.5
             + (populated recommended fields / 7) * 0.3
             + (populated optional fields / total optional) * 0.2

Score ranges:
  0.90 - 1.00  =  EXCELLENT  -->  Rich metadata, high confidence
  0.70 - 0.89  =  GOOD       -->  Sufficient for cataloging and discovery
  0.50 - 0.69  =  FAIR       -->  Usable but with notable gaps
  0.30 - 0.49  =  POOR       -->  Significant gaps, flag for manual review
  0.00 - 0.29  =  MINIMAL    -->  Only basic identification possible
```

### Reliability Indicators

| Indicator | Positive Signal | Negative Signal |
|-----------|----------------|-----------------|
| **Source authority** | Known publisher, verified author | Anonymous, unverifiable source |
| **Schema richness** | JSON-LD + OpenGraph + meta tags | No structured data at all |
| **Date availability** | Published date with timezone | No dates anywhere |
| **Cross-schema consistency** | All schemas agree on key fields | Contradictions between schemas |
| **Platform recognition** | Known platform with established patterns | Unknown site with no conventions |
| **Content structure** | Clear headings, semantic HTML | Flat text, no structure |

### Quality Flags

Flag any of the following conditions in `extraction_notes`:

```markdown
## Quality Flags

- MISSING_DATE: No publication date found from any source
- MISSING_AUTHOR: No author identified; attribution not possible
- INFERRED_ONLY: Key fields populated only through inference (no explicit metadata)
- SCHEMA_CONFLICT: Conflicting values found across metadata schemas
- STALE_CONTENT: Content appears outdated (date > 2 years old)
- TRUNCATED_DESCRIPTION: Description was cut off or incomplete
- NO_STRUCTURED_DATA: No JSON-LD, OpenGraph, or Dublin Core found
- REDIRECT_DETECTED: Source URL redirected; canonical may differ
- PAYWALL_SUSPECTED: Full content may not be accessible
- GENERATED_CONTENT: Content appears AI-generated (metadata pattern)
```

### Quality Assessment Checklist

```markdown
- [ ] Completeness score calculated
- [ ] Reliability indicators assessed
- [ ] Quality flags applied where applicable
- [ ] Missing required fields explicitly noted
- [ ] Confidence level assigned (high / medium / low)
- [ ] Remediation suggestions provided for POOR or MINIMAL scores
```

## Step 8: Output Formatting

Produce the final metadata record in the standardized format.

### Record Assembly

Combine all extraction, normalization, and quality assessment into the final output. Include provenance information showing which extraction step produced each field.

### Final Record Validation

Before outputting, verify:

```markdown
- [ ] All required fields present and non-empty
- [ ] All dates in ISO 8601 format
- [ ] All URLs are absolute (not relative)
- [ ] Topics array has at least one entry
- [ ] content_type is from canonical taxonomy
- [ ] metadata_completeness score is calculated
- [ ] extraction_confidence is set
- [ ] extraction_notes captures any flags or decisions
```

## Output Formats

### Quick Format (single source, inline use)

```markdown
**Metadata: [Title]**
- **Source:** [URL or path]
- **Type:** [content_type] | **Platform:** [platform]
- **Author:** [author] | **Published:** [date_published]
- **Language:** [language] | **License:** [license]
- **Topics:** [topic1, topic2, topic3]
- **Description:** [description]
- **Completeness:** [score] ([EXCELLENT/GOOD/FAIR/POOR/MINIMAL])
- **Flags:** [any quality flags]
```

### Full Format (detailed record, cataloging use)

```yaml
---
# Metadata Record
title: "[Title]"
source_url: "[URL]"
canonical_url: "[Canonical URL]"
content_type: "[type]"
content_class: "[class]"
platform: "[platform]"
format: "[MIME type or format]"

# Attribution
author: "[Author Name]"
author_url: "[Author Profile URL]"
publisher: "[Publisher Name]"

# Temporal
date_published: "[ISO 8601]"
date_modified: "[ISO 8601]"
date_accessed: "[ISO 8601]"

# Classification
language: "[ISO 639-1]"
topics:
  - "[topic1]"
  - "[topic2]"
tags_explicit:
  - "[tag1]"
tags_inferred:
  - "[tag2]"

# Enrichment
description: "[1-3 sentence description]"
thumbnail_url: "[URL]"
word_count: [number]
reading_time_minutes: [number]
license: "[SPDX or description]"
identifier: "[DOI, ISBN, etc.]"
related:
  - "[URL]"

# Quality
metadata_completeness: [0.0-1.0]
extraction_confidence: "[high/medium/low]"
extraction_notes:
  - "[Note or flag]"

# Provenance
extracted_by: "metadata-extraction v2.0.0"
extraction_date: "[ISO 8601]"
schemas_found: ["json-ld", "opengraph", "dublin-core"]
---
```

## Common Patterns

### Web Page Extraction

Process a standard web page (blog post, article, documentation page) through the full pipeline. Start with URL parsing to identify the platform, then extract HTML structural metadata, harvest all embedded schemas (OpenGraph, JSON-LD, Dublin Core), apply platform-specific extractors, infer any missing semantic fields, normalize, and assess quality.

**Use when:** The source is an HTML page accessible via URL. This is the most common extraction scenario and exercises all pipeline steps.

### API Documentation Extraction

Extract metadata from API reference pages, focusing on technical specificity. Capture the API product name, version, endpoint paths, authentication requirements, and rate limits. Map to schema.org `APIReference` or `TechArticle` types. Pay special attention to version information embedded in URLs (`/v2/`, `/latest/`) and documentation framework metadata (Swagger/OpenAPI, Redoc, Slate).

**Use when:** The source is API documentation, SDK reference, or developer portal content. These sources have distinctive structural patterns and specialized metadata needs.

### Video and Media Extraction

Extract metadata from video platforms (YouTube, Vimeo) and podcast hosts. Focus on duration, upload date, creator/channel, view metrics, and associated text content (descriptions, transcripts, show notes). JSON-LD on video platforms is typically rich; prefer it over OpenGraph for structured fields like duration.

**Use when:** The source is a video, podcast episode, or other media content. These sources carry temporal metadata (duration) and engagement metrics not found in text content.

### Code Repository Extraction

Extract metadata from code hosting platforms (GitHub, GitLab, Bitbucket). Capture repository name, owner, description, primary language, topics/tags, license, star/fork counts, contributor count, and last activity date. README content provides the richest description source. API endpoints (when accessible) provide the most structured data.

**Use when:** The source is a code repository, gist, or code-sharing platform. These sources have a unique metadata vocabulary (stars, forks, languages) that must be mapped to canonical fields.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-ingestion` | Ingestion invokes metadata-extraction as a sub-process during source registration; extracted metadata populates the CONTEXT-SOURCES.md entries |
| `content-analysis` | Content analysis operates on the content body; metadata-extraction provides the structural envelope (title, author, date, type) that frames the analysis |
| `context-cultivation` | Cultivation uses metadata fields (topics, dates, authors) to group and cross-reference sources during thematic coding |
| `priority-matrix` | Source metadata (recency, authority, content type) informs priority weighting and relevance scoring |
| `proposal-builder` | Extracted metadata provides attribution data for source citations in proposals |

## Key Principles

**Extract before you infer.** Always attempt to find explicitly declared metadata before falling back to inference. Declared metadata from the content author is more reliable than algorithmically derived values. Only infer when explicit sources are exhausted.

**Standards over invention.** Use Dublin Core, OpenGraph, JSON-LD, and schema.org vocabularies. These standards exist because metadata interoperability is a solved problem at the vocabulary level. Custom fields should be exceptional, not default.

**Degrade gracefully.** Not every source has rich metadata. A PDF with no embedded metadata still has a filename, a file size, and a creation date. The extraction pipeline must produce a usable record from even the sparsest inputs, clearly marking what was found versus inferred.

**Provenance is non-negotiable.** Every field in the output record should be traceable to a specific extraction step and source. When downstream consumers question a metadata value, the extraction notes must answer "where did this come from?"

**Completeness is measurable.** Do not hand-wave about metadata quality. Calculate a completeness score. Flag gaps explicitly. A record that honestly reports 40% completeness is more useful than one that silently omits the assessment.

**Normalize relentlessly.** The entire value of metadata extraction collapses if dates are in five formats, content types use three taxonomies, and languages are sometimes codes and sometimes names. Every field must conform to its canonical format, every time, without exception.

## References

- `references/metadata-schemas.md`: Canonical field definitions, Dublin Core element set, OpenGraph property catalog, schema.org type mappings, and cross-schema equivalence tables
- `references/platform-extractors.md`: Platform-specific extraction patterns for GitHub, YouTube, Medium, Dev.to, WordPress, ReadTheDocs, and common documentation frameworks
- `references/normalization-rules.md`: Date format normalization, language code mapping, content type taxonomy, and conflict resolution procedures
- `references/structured-data-formats.md`: Parsing guides for JSON-LD, RDFa, Microdata, and embedded metadata in PDF, DOCX, and image EXIF headers

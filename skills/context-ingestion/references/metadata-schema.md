# Metadata Schema

Standard metadata fields, normalization rules, and templates for cataloging ingested context sources.

## Field Definitions

### Required Fields

Every ingested source must have these fields populated:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `source_id` | string | Unique identifier, auto-generated | `src_20250115_a3f8` |
| `title` | string | Descriptive title of the source | "PostgreSQL 16 JSONB Performance Guide" |
| `source_type` | enum | Category of the source | `document`, `web`, `conversation`, `video`, `code` |
| `url` | string | Canonical URL or file path | `https://example.com/pg16-guide` |
| `ingested_at` | ISO 8601 | Timestamp of ingestion | `2025-01-15T14:30:00Z` |
| `relevance_score` | float | Weighted evaluation score (1.0-5.0) | `4.2` |
| `summary` | string | 1-3 sentence description of content | "Covers JSONB indexing improvements in PG16..." |

### Optional Fields

Include when available to improve retrieval and quality assessment:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `author` | string | Content creator | "Jane Smith" |
| `published_at` | ISO 8601 | Original publication date | `2024-11-20T00:00:00Z` |
| `updated_at` | ISO 8601 | Last modification date | `2025-01-10T09:00:00Z` |
| `language` | ISO 639-1 | Content language | `en` |
| `tags` | string[] | Topic tags for classification | `["postgresql", "performance", "jsonb"]` |
| `authority_score` | int | Authority dimension (1-5) | `4` |
| `recency_score` | int | Recency dimension (1-5) | `5` |
| `specificity_score` | int | Specificity dimension (1-5) | `4` |
| `parent_source_id` | string | ID of a source this was extracted from | `src_20250110_b2c1` |
| `related_sources` | string[] | IDs of related ingested sources | `["src_20250112_d4e5"]` |
| `caveats` | string | Known limitations or biases | "Written by vendor; may favor their product" |
| `content_hash` | string | SHA-256 of extracted content | `a3f8c2...` |
| `word_count` | int | Approximate word count of extracted content | `2400` |
| `extraction_method` | enum | How content was obtained | `manual`, `fetch`, `upload`, `transcript` |

## Source Type Enum

| Value | Use When |
|-------|----------|
| `document` | PDF, Word, Markdown, plain text files |
| `web` | Web pages fetched by URL |
| `conversation` | Chat logs, email threads, meeting notes |
| `video` | Video or audio transcripts |
| `code` | Source code files or repositories |
| `api` | API responses or documentation |
| `image` | Diagrams, screenshots, visual references |
| `composite` | Source containing multiple formats |

## Normalization Rules

### Dates

- **Always store as ISO 8601 with timezone:** `YYYY-MM-DDTHH:MM:SSZ`
- **If only a date is known:** Use midnight UTC: `2025-01-15T00:00:00Z`
- **If only month/year is known:** Use first of month: `2025-01-01T00:00:00Z`
- **If no date is available:** Omit the field entirely; do not guess
- **Relative dates** ("last week", "recently"): Convert to absolute date based on ingestion time and note conversion in `caveats`

### Authors

- **Full name format:** "First Last" (no titles, no suffixes unless disambiguation is needed)
- **Organizations as authors:** Use the organization name: "Google Cloud Team"
- **Multiple authors:** Comma-separated: "Jane Smith, John Doe"
- **Unknown author:** Omit the field; do not use "Anonymous" or "Unknown"
- **Usernames:** Prefix with platform: "github:octocat", "twitter:@handle"

### URLs

- **Always use canonical form:** Strip tracking parameters (`utm_*`, `ref`, `source`)
- **Prefer HTTPS:** Upgrade HTTP to HTTPS if the site supports it
- **Remove fragments** unless they point to a specific section relevant to the extraction
- **Archive URLs:** If original may disappear, also store `archive_url` pointing to web archive
- **Local files:** Use absolute paths: `file:///Users/home/docs/spec.pdf`
- **Normalize trailing slashes:** Remove trailing slash unless it changes the resource

### Tags

- **Lowercase only:** `postgresql` not `PostgreSQL`
- **Hyphenate multi-word:** `machine-learning` not `machine_learning` or `machine learning`
- **Prefer specific over general:** `react-hooks` over `react` when content is specifically about hooks
- **Maximum 10 tags per source** to maintain signal value
- **Use established vocabularies** when available (e.g., language names, framework names)

## Source Metadata Template

```yaml
source_id: "src_YYYYMMDD_XXXX"
title: ""
source_type: ""           # document | web | conversation | video | code | api | image | composite
url: ""
author: ""                # Optional
published_at: ""          # Optional, ISO 8601
updated_at: ""            # Optional, ISO 8601
ingested_at: ""           # ISO 8601, auto-populated
language: "en"            # ISO 639-1
tags: []
relevance_score: 0.0      # 1.0 - 5.0
authority_score: 0        # 1 - 5, optional
recency_score: 0          # 1 - 5, optional
specificity_score: 0      # 1 - 5, optional
summary: ""
caveats: ""               # Optional
content_hash: ""          # SHA-256 of extracted content
word_count: 0
extraction_method: ""     # manual | fetch | upload | transcript
parent_source_id: ""      # Optional
related_sources: []       # Optional
```

## ID Generation

Source IDs follow the pattern `src_YYYYMMDD_XXXX` where:

- `YYYYMMDD` is the ingestion date
- `XXXX` is a 4-character hex suffix from the first 4 chars of the content hash

This ensures:
- IDs are chronologically sortable
- IDs are unique (hash collision in 4 hex chars is acceptable given date prefix)
- IDs are human-readable and debuggable

## Validation Rules

Before persisting metadata, validate:

- [ ] `source_id` matches pattern `src_\d{8}_[0-9a-f]{4}`
- [ ] `title` is non-empty and under 200 characters
- [ ] `source_type` is a valid enum value
- [ ] `url` is a valid URL or absolute file path
- [ ] `ingested_at` is a valid ISO 8601 timestamp
- [ ] `relevance_score` is between 1.0 and 5.0
- [ ] `tags` contains no duplicates and each tag is lowercase hyphenated
- [ ] `content_hash` is a valid 64-character hex string (if provided)
- [ ] No required field is null or empty string

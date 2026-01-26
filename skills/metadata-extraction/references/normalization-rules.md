# Normalization Rules Reference

Rules for transforming raw extracted metadata into the orchestrator's canonical schema.

## Date Format Normalization

**Target format:** ISO 8601 -- `YYYY-MM-DDTHH:mm:ssZ` (UTC preferred)

| Input Pattern               | Example                      | Normalized Output         |
|-----------------------------|------------------------------|---------------------------|
| ISO 8601 with offset        | `2025-03-15T10:30:00+05:00`  | `2025-03-15T05:30:00Z`   |
| ISO 8601 no timezone        | `2025-03-15T10:30:00`        | `2025-03-15T10:30:00Z` * |
| Date only                   | `2025-03-15`                 | `2025-03-15T00:00:00Z`   |
| US / EU slash format        | `03/15/2025`                 | `2025-03-15T00:00:00Z`   |
| Long English                | `March 15, 2025`             | `2025-03-15T00:00:00Z`   |
| Unix timestamp (sec/ms)     | `1710489000`                 | `2024-03-15T10:30:00Z`   |
| Relative                    | `3 days ago`                 | Compute from current time |

\* Dates without timezone assume UTC. Flag `timezone_assumed: true` in extras.

**Disambiguation:** For `01/02/2025`, prefer MM/DD for `.com` domains, DD/MM for `.co.uk`, `.de`, `.fr`. Use locale metadata if available. Flag `date_ambiguous: true` if unresolvable.

**Validation:** Reject dates before `1990-01-01` or more than 1 day in the future. If `dateModified < datePublished`, swap and flag `dates_swapped: true`.

## Language Code Mapping

**Target:** ISO 639-1 two-letter codes, lowercase.

| Input Variants                          | Normalized |
|-----------------------------------------|------------|
| `en`, `en-US`, `en_US`, `en-GB`, `eng` | `en`       |
| `fr`, `fr-FR`, `fr_CA`, `fra`          | `fr`       |
| `de`, `de-DE`, `de_AT`, `deu`          | `de`       |
| `zh`, `zh-CN`, `zh_TW`, `zho`          | `zh`       |
| `ja`, `ja-JP`, `jpn`                   | `ja`       |

Rules: Strip region subtags. Convert ISO 639-2/T three-letter codes. Lowercase. Map full language names to codes. Omit if unknown.

## Content Type Taxonomy

**Orchestrator canonical types** (closed vocabulary):

| Content Type    | Description                      | Typical MIME Types             |
|-----------------|----------------------------------|--------------------------------|
| `article`       | Blog post, news, essay           | `text/html`                    |
| `webpage`       | Generic web page                 | `text/html`                    |
| `documentation` | Technical docs, API references   | `text/html`                    |
| `tutorial`      | Step-by-step guide               | `text/html`                    |
| `video`         | Video content                    | `video/*`                      |
| `audio`         | Podcast, recording               | `audio/*`                      |
| `repository`    | Source code repository           | --                             |
| `issue`         | Bug report, feature request      | --                             |
| `pull-request`  | Code review / merge request      | --                             |
| `discussion`    | Forum thread, Q&A                | --                             |
| `paper`         | Academic paper                   | `application/pdf`              |
| `document`      | PDF, DOCX, general document      | `application/pdf`, `app/vnd.*` |
| `dataset`       | Structured data file             | `text/csv`, `application/json` |
| `software`      | Application or tool              | --                             |
| `profile`       | Person or organization page      | --                             |
| `image`         | Standalone image                 | `image/*`                      |
| `api-doc`       | API specification                | `application/json`, `text/yaml`|
| `other`         | Uncategorized                    | --                             |

**Inference order:** Schema.org `@type` > `og:type` > URL patterns (`/docs/`, `/blog/`) > MIME type > defaults (`webpage` for HTML, `document` for PDF).

## Author Name Normalization

1. **Trim whitespace**, collapse multiple spaces.
2. **Strip titles/suffixes:** `Dr.`, `Prof.`, `PhD`, `Jr.` -- store original in extras.
3. **"Last, First" format:** convert `Doe, John` to `John Doe`.
4. **Usernames:** Strip `@` prefix. Prefer display name over username when both available.
5. **Deduplicate** case-insensitively across sources.
6. **Organizations:** Keep as-is (e.g., `Google Developers`). Do not split.

| Raw Input              | Normalized          |
|------------------------|---------------------|
| `  John   Doe  `      | `John Doe`          |
| `Doe, John`            | `John Doe`          |
| `@jdoe`               | `jdoe`              |
| `Dr. Jane Smith, PhD` | `Jane Smith`        |

## URL Canonicalization Rules

1. **Enforce HTTPS** (unless site lacks support).
2. **Lowercase hostname** (path case preserved).
3. **Remove default ports** (`:443`, `:80`).
4. **Remove trailing slash** (unless path is `/`).
5. **Strip tracking params:** `utm_*`, `ref`, `fbclid`, `gclid`, `mc_cid`.
6. **Remove fragment** unless SPA route (`#!/`).
7. **Resolve shorteners:** `t.co`, `bit.ly`, `goo.gl` to final destination.
8. **Prefer** `<link rel="canonical">` over `og:url` over fetched URL.

| Platform | Input                                  | Canonical                          |
|----------|----------------------------------------|------------------------------------|
| GitHub   | `github.com/owner/repo/tree/main`      | `github.com/owner/repo`            |
| YouTube  | `youtu.be/dQw4w9WgXcQ`                | `youtube.com/watch?v=dQw4w9WgXcQ`  |
| YouTube  | `youtube.com/watch?v=x&feature=shared` | `youtube.com/watch?v=x`            |

## Conflict Resolution

### Priority Order (highest to lowest)

1. **Explicit structured data** -- JSON-LD, microdata
2. **Platform API** -- GitHub API, YouTube API, etc.
3. **OpenGraph meta tags**
4. **Dublin Core meta tags**
5. **HTML meta tags / DOM heuristics**
6. **HTTP headers**

### Field-Specific Rules

- **Title:** Prefer shortest non-truncated version. Strip ` | Site Name` suffixes.
- **Date:** Prefer the most specific value (datetime over date-only). Specificity overrides source priority.
- **Author:** Merge unique authors from all sources. Order: structured data, OG, DOM.
- **Description:** Prefer longest version up to 500 chars. OG descriptions preferred over auto-generated.
- **URL:** `rel=canonical` wins.

Log all conflict resolutions with chosen value, source, and rejected alternatives.

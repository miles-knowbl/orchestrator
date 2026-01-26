# Platform Extractors Reference

Platform-specific extraction patterns, selectors, and API endpoints for metadata extraction.

## GitHub

### Repository Metadata

**API:** `GET /repos/{owner}/{repo}`

| API Field          | Maps To         | Notes                 |
|--------------------|-----------------|-----------------------|
| `full_name`        | `title`         | `owner/repo` format   |
| `description`      | `description`   |                       |
| `owner.login`      | `author[0]`     | Repository owner      |
| `created_at`       | `datePublished` | ISO 8601              |
| `updated_at`       | `dateModified`  | ISO 8601              |
| `topics`           | `tags`          | Merge with `language` |
| `license.spdx_id`  | `license`       | SPDX identifier       |
| `html_url`         | `sourceUrl`     |                       |

### Issues and Pull Requests

**APIs:** `GET /repos/{owner}/{repo}/issues/{number}`, `.../pulls/{number}`

Fields: `title`, `body` (truncate to 500), `user.login`, `created_at`, `updated_at`, `labels[].name`, `html_url`. Content type: `issue` or `pull-request`.

### Discussions

**GraphQL:** `repository.discussion(number)` -- fields: `title`, `body`, `author.login`, `createdAt`, `category.name`.

### HTML Fallback (no API token)

```
title         -> meta[property="og:title"] || .markdown-title
description   -> meta[property="og:description"]
author        -> .author a (first match)
datePublished -> relative-time[datetime]
tags          -> .topic-tag
```

## YouTube

### Video Metadata

**API:** `GET /youtube/v3/videos?part=snippet,contentDetails&id={videoId}`

| API Field                     | Maps To         | Notes               |
|-------------------------------|-----------------|----------------------|
| `snippet.title`               | `title`         |                      |
| `snippet.description`         | `description`   | Truncate to 500      |
| `snippet.channelTitle`        | `author[0]`     |                      |
| `snippet.publishedAt`         | `datePublished` | ISO 8601             |
| `snippet.tags`                | `tags`          |                      |
| `snippet.thumbnails.high.url` | `thumbnailUrl`  | Prefer high quality  |

Content type: `video`. Channels (`/channels?part=snippet&id={id}`): content type `profile`.

### HTML Fallback (no API key)

YouTube embeds JSON-LD (`@type: VideoObject`) -- parse that first. Also: `meta[property="og:title"]`, `meta[itemprop="datePublished"]`, `meta[property="og:video:tag"]`.

## Medium / Dev.to

### Medium

No public API. Extract from HTML meta tags and JSON-LD (`@type: NewsArticle`):

```
title         -> meta[property="og:title"]
description   -> meta[property="og:description"]
author        -> meta[name="author"] || link[rel="author"]
datePublished -> meta[property="article:published_time"]
tags          -> meta[property="article:tag"] (multiple)
publisher     -> "Medium"
```

### Dev.to

**API:** `GET /api/articles/{id_or_slug}`

Fields: `title`, `description`, `user.name` (author), `published_at`, `edited_at`, `tag_list`, `cover_image`, `url`. Content type: `article`.

## Documentation Sites

### ReadTheDocs

**URL pattern:** `https://{project}.readthedocs.io/en/{version}/{path}`
**API:** `GET /api/v3/projects/{slug}/` (project name, description, language).

Selectors: `h1:first-of-type` (title), `meta[name="description"]`, `.last-updated` (dateModified). Content type: `documentation`.

### GitBook

**URL pattern:** `https://{org}.gitbook.io/{space}/{path}`

Renders as SPA; prefer server-rendered meta tags: `og:title`, `og:description`, `og:image`, `og:site_name`. Content type: `documentation`.

### Docusaurus

Blog posts embed JSON-LD (`@type: BlogPosting`). Selectors: `meta[property="og:title"]`, `.authorName` (blog), `time[datetime]` (blog), `.tag` (blog) or breadcrumbs (docs). Content type: `documentation` (docs) or `article` (blog).

## General Fallback Strategy

When platform-specific extraction fails, apply this cascade:

1. **JSON-LD blocks** -- `<script type="application/ld+json">`
2. **OpenGraph meta** -- `meta[property^="og:"]`
3. **Twitter Card meta** -- `meta[name^="twitter:"]`
4. **Dublin Core meta** -- `meta[name^="dc."]` or `meta[name^="DC."]`
5. **Standard HTML meta** -- `<title>`, `meta[name="description"]`, `meta[name="author"]`
6. **DOM heuristics** -- first `<h1>`, first `<p>` with >100 chars, `<time>` elements
7. **HTTP headers** -- `Last-Modified`, `Content-Language`, `Content-Type`

Collect from all layers; higher-priority sources override lower ones during normalization (see normalization-rules.md).

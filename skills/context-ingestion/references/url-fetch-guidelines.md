# URL Fetch Guidelines

Standards for validating, fetching, extracting, and caching web content during context ingestion.

## URL Validation and Normalization

### Validation Checks

Before attempting any fetch, validate the URL:

| Check | Rule | Action on Failure |
|-------|------|-------------------|
| Scheme present | Must start with `http://` or `https://` | Prepend `https://` |
| Valid domain | Must resolve to a routable address | Reject; log as unreachable |
| No credentials in URL | Must not contain `user:pass@` | Strip credentials; warn |
| Reasonable length | Under 2048 characters | Reject; likely malformed |
| No local/private IPs | Must not point to `127.0.0.1`, `10.*`, `192.168.*` | Reject; security boundary |
| Encoding correct | Special characters properly percent-encoded | Re-encode with standard library |

### Normalization Steps

Apply in order before fetching or comparing URLs:

1. **Lowercase the scheme and host:** `HTTPS://Example.COM` becomes `https://example.com`
2. **Remove default ports:** Strip `:443` for HTTPS, `:80` for HTTP
3. **Remove tracking parameters:** Strip `utm_*`, `ref`, `source`, `fbclid`, `gclid`
4. **Remove trailing slash** on paths (unless root `/`)
5. **Sort remaining query parameters** alphabetically for consistent comparison
6. **Resolve path segments:** Convert `/a/../b/` to `/b/`
7. **Upgrade HTTP to HTTPS** when the domain is known to support it

**Canonical URL example:**
```
Input:  HTTP://Example.COM:80/docs/../api/v2/?ref=twitter&utm_source=blog&format=json
Output: https://example.com/api/v2?format=json
```

## Content Extraction from Web Pages

### Standard Extraction Pipeline

1. **Fetch raw HTML** with appropriate headers (see request configuration below)
2. **Parse HTML** and locate the main content area
3. **Convert to Markdown** preserving headings, lists, tables, code blocks, and links
4. **Strip non-content elements:** navigation, sidebars, ads, footers, cookie banners
5. **Extract metadata** from `<head>`: title, description, author, canonical URL, published date
6. **Record extraction metadata:** fetch timestamp, HTTP status, content length

### Request Configuration

| Header | Value | Purpose |
|--------|-------|---------|
| `User-Agent` | `ContextIngestion/1.0 (compatible)` | Identify the bot; respect robots.txt |
| `Accept` | `text/html,application/xhtml+xml` | Request HTML content |
| `Accept-Language` | `en-US,en;q=0.9` | Prefer English content |
| `Accept-Encoding` | `gzip, deflate` | Reduce transfer size |

### Handling Special Page Types

| Page Type | Detection | Strategy |
|-----------|-----------|----------|
| JS-rendered SPA | Empty or minimal `<body>` after initial fetch | Use headless browser fetch (Playwright/Puppeteer) as fallback |
| Paywalled content | HTTP 402, login redirect, or paywall modal detected | Record URL and title only; mark `extraction_method: blocked`; do not attempt bypass |
| Rate-limited | HTTP 429 response | Respect `Retry-After` header; exponential backoff starting at 5 seconds |
| Redirected | HTTP 301/302 | Follow up to 5 redirects; record both original and final URL |
| PDF served as web | `Content-Type: application/pdf` | Download and process with PDF extraction pipeline |
| API/JSON response | `Content-Type: application/json` | Store structured data directly; no HTML parsing |
| Large page (>1MB) | Content-Length or streamed size exceeds 1MB | Truncate to first 1MB; note truncation in caveats |
| Geo-blocked | HTTP 403 with geographic indicators | Record as inaccessible; note region restriction |

### robots.txt Compliance

- **Always check** `/robots.txt` before first fetch to a new domain
- **Respect disallow rules** for the configured User-Agent
- **Cache robots.txt** per domain for 24 hours
- **If robots.txt blocks access:** Record URL and title only; mark as `extraction_method: robots_blocked`

## Fallback Strategies

When the primary fetch fails, attempt fallbacks in order:

| Priority | Strategy | When to Use | Limitations |
|----------|----------|-------------|-------------|
| 1 | Retry with backoff | Transient errors (5xx, timeout, network) | Max 3 retries; 5s, 15s, 45s delays |
| 2 | Headless browser fetch | JS-rendered content, empty body | Slower; higher resource cost |
| 3 | Web archive lookup | Page is down or removed | Content may be stale |
| 4 | Google Cache | Recent page unavailable | May not exist; ephemeral |
| 5 | Alternative URL | Same content at a different URL (mirror, CDN) | Requires known alternatives |
| 6 | Manual flag | All automated methods fail | Record URL; mark for human retrieval |

### Web Archive Lookup

Use `https://archive.org/wayback/available?url={url}` to check availability, then fetch from `https://web.archive.org/web/{url}`. Record `archive_url`, `archive_date`, and add caveat: "Content retrieved from web archive; may not reflect current state."

## Caching and Freshness Policies

### Cache Storage

| Field | Description |
|-------|-------------|
| `cache_key` | Normalized URL (post-normalization) |
| `cached_at` | ISO 8601 timestamp of last successful fetch |
| `content_hash` | SHA-256 of fetched content |
| `http_etag` | ETag header from response (if provided) |
| `http_last_modified` | Last-Modified header (if provided) |
| `ttl_hours` | Time-to-live before re-fetch is required |

### Freshness Rules

| Content Type | Default TTL | Rationale |
|-------------|-------------|-----------|
| API documentation | 72 hours | Updated infrequently; versioned |
| Blog posts | 168 hours (7 days) | Rarely edited after publication |
| News articles | 24 hours | May receive corrections |
| GitHub README/docs | 48 hours | Active repos update frequently |
| Stack Overflow answers | 168 hours | Edits are infrequent after initial period |
| Official specs (RFC, W3C) | 720 hours (30 days) | Extremely stable |
| Dynamic dashboards/status pages | 1 hour | Data changes constantly |

### Conditional Fetch

When re-fetching cached content, use conditional requests to save bandwidth:

1. **If ETag is stored:** Send `If-None-Match: {etag}` header
2. **If Last-Modified is stored:** Send `If-Modified-Since: {date}` header
3. **On HTTP 304 (Not Modified):** Update `cached_at`, keep existing content
4. **On HTTP 200:** Compare content hash; if changed, update cache and re-extract

### Cache Invalidation

Force re-fetch (ignore cache) when:

- User explicitly requests fresh content
- Source is referenced in a contradiction that needs resolution
- More than 2x the TTL has elapsed since last fetch
- The source is known to have been updated (e.g., changelog entry discovered)

## Fetch Checklist

For every URL fetch during ingestion:

- [ ] URL validated and normalized
- [ ] robots.txt checked for the domain
- [ ] Cache checked; conditional fetch headers set if cached
- [ ] Request sent with proper headers and timeout (30 second default)
- [ ] Response status handled (2xx proceed, 3xx follow, 4xx/5xx fallback)
- [ ] Content extracted and converted to Markdown
- [ ] Metadata extracted from page headers and HTML head
- [ ] Cache updated with new content, hash, and headers
- [ ] Extraction metadata recorded (method, timestamp, status code)

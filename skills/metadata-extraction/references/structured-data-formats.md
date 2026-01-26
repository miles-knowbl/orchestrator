# Structured Data Formats Reference

Parsing guides for JSON-LD, RDFa, microdata, and embedded file metadata.

## JSON-LD Parsing Guide

JSON-LD is the preferred structured data format. Found in `<script type="application/ld+json">` blocks.

### Extraction Steps

1. Select all `<script type="application/ld+json">` elements.
2. Parse each as JSON. Skip malformed blocks.
3. Handle single objects and `@graph` arrays.
4. Match `@type` against known Schema.org types to find the primary entity.
5. For `@graph`, find the node whose `@id` matches the page URL or has the most specific `@type`.

### Example (single entity)

```json
{
  "@context": "https://schema.org", "@type": "Article",
  "headline": "Understanding Metadata",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "datePublished": "2025-03-15T10:00:00Z",
  "publisher": { "@type": "Organization", "name": "Tech Blog" }
}
```

For `@graph` patterns, prefer the most specific type: `BlogPosting` over `Article` over `WebPage`.

### Author Forms

| Form                                   | Extraction                    |
|----------------------------------------|-------------------------------|
| `"author": "Jane Doe"`                | Use string directly           |
| `"author": { "name": "Jane Doe" }`    | Extract `name` property       |
| `"author": [{ "name": "Jane" }, ...]` | Extract all `name` values     |
| `"author": { "@id": "#person1" }`     | Resolve `@id` within `@graph` |

### Edge Cases

- **Multiple blocks:** Process all; extract from the content-bearing type (skip BreadcrumbList, Organization-only blocks).
- **Nested objects:** Always check `publisher.name`, `author.name`, `image.url` before treating as strings.
- **Missing `@context`:** Still parse; treat property names as Schema.org terms.
- **`@type` arrays:** Use the most specific type from the array.

## RDFa Extraction Patterns

RDFa embeds structured data in HTML attributes: `vocab`, `typeof`, `property`, `resource`, `content`.

### Extraction Steps

1. Find elements with `typeof` to identify entity boundaries.
2. Collect descendant elements with `property` attributes.
3. Extract values from: `content` attribute (preferred), `href`/`src`, or text content.
4. Map property names using the active `vocab` or `prefix` declarations.

### Example

```html
<div vocab="https://schema.org/" typeof="Article">
  <h1 property="headline">Understanding RDFa</h1>
  <span property="author" typeof="Person">
    <span property="name">Jane Doe</span>
  </span>
  <meta property="datePublished" content="2025-03-15" />
</div>
```

## Microdata Extraction

Uses `itemscope`, `itemtype`, and `itemprop` attributes.

### Extraction Steps

1. Find elements with `itemscope` and `itemtype` (filter for `https://schema.org/` types).
2. Collect descendant `itemprop` elements (stop at nested `itemscope` boundaries).
3. Extract values by element type:

| Element Type    | Value Source           |
|-----------------|------------------------|
| `<meta>`        | `content` attribute    |
| `<a>`, `<link>` | `href` attribute       |
| `<img>`         | `src` attribute        |
| `<time>`        | `datetime` attribute   |
| `<data>`        | `value` attribute      |
| All others      | Text content (trimmed) |

Nested items (`itemprop` + `itemscope`): extract the nested item's properties and associate with the parent property.

## Embedded File Metadata

### PDF Properties

Extract from the document info dictionary using a PDF library (`pdf-parse`, `pdfjs-dist`).

| PDF Property   | Maps To         | Notes                                 |
|----------------|-----------------|---------------------------------------|
| `Title`        | `title`         |                                       |
| `Author`       | `author`        | May be semicolon-separated            |
| `Subject`      | `description`   |                                       |
| `Keywords`     | `tags`          | Comma or semicolon-separated          |
| `CreationDate` | `datePublished` | Format: `D:YYYYMMDDHHmmssOHH'mm'`    |
| `ModDate`      | `dateModified`  | Same format                           |

### DOCX Metadata

Extract from `docProps/core.xml` inside the ZIP archive. Uses Dublin Core elements: `dc:title`, `dc:creator`, `dc:description`, `dc:subject`, `dcterms:created`, `dcterms:modified`, `cp:keywords`.

### Image EXIF Headers

Extract using an EXIF library (`exif-reader`, `sharp`).

| EXIF Tag              | Maps To         | Notes                              |
|-----------------------|-----------------|------------------------------------|
| `ImageDescription`    | `description`   |                                    |
| `Artist`              | `author`        |                                    |
| `Copyright`           | `license`       | Free-text copyright                |
| `DateTimeOriginal`    | `datePublished` | Format: `YYYY:MM:DD HH:mm:ss`     |
| `DateTime`            | `dateModified`  | Replace first two `:` with `-`     |
| `GPSLatitude/Long`    | extras.geo      | Convert DMS to decimal             |

## Parsing Priority Order

| Priority | Format        | Rationale                                          |
|----------|---------------|----------------------------------------------------|
| 1        | JSON-LD       | Most explicit; not mixed with presentation markup  |
| 2        | Microdata     | Clear attribute contracts in HTML                  |
| 3        | RDFa          | Similar to microdata, less common on modern sites  |
| 4        | Meta tags     | OpenGraph, Twitter Cards, Dublin Core              |
| 5        | File-embedded | PDF, DOCX, EXIF -- only for non-HTML resources     |

**Merge strategy:** Extract from all formats. Higher-priority sources provide primary values. Fill missing fields from lower-priority sources. Log all contributing sources for provenance.

**Date exception:** Specificity overrides source priority. If JSON-LD has `2025-03-15` but OG has `2025-03-15T10:30:00Z`, prefer the OG value. See normalization-rules.md for full conflict resolution.

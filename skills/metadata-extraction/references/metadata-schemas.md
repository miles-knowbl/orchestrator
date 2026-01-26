# Metadata Schemas Reference

Canonical field definitions and cross-schema mappings for the orchestrator's metadata extraction pipeline.

## Orchestrator Internal Schema

The orchestrator normalizes all extracted metadata into this canonical form:

| Field            | Type       | Required | Description                              |
|------------------|------------|----------|------------------------------------------|
| `title`          | string     | yes      | Primary title of the resource            |
| `description`    | string     | no       | Summary or abstract (max 500 chars)      |
| `author`         | string[]   | no       | Ordered list of creator names            |
| `datePublished`  | string     | no       | ISO 8601 publication date                |
| `dateModified`   | string     | no       | ISO 8601 last-modified date              |
| `language`       | string     | no       | ISO 639-1 language code                  |
| `contentType`    | string     | yes      | Orchestrator taxonomy type               |
| `sourceUrl`      | string     | yes      | Canonical URL of the resource            |
| `tags`           | string[]   | no       | Subject keywords, lowercased             |
| `license`        | string     | no       | SPDX identifier or free-text license     |
| `thumbnailUrl`   | string     | no       | Representative image URL                 |
| `publisher`      | string     | no       | Organization or platform name            |

## Dublin Core Element Set (DC-15)

The 15 core Dublin Core elements and their orchestrator mappings:

| DC Element      | Definition                                    | Maps To             |
|-----------------|-----------------------------------------------|---------------------|
| `dc:title`      | Name given to the resource                    | `title`             |
| `dc:creator`    | Entity primarily responsible for content      | `author`            |
| `dc:subject`    | Topic of the resource                         | `tags`              |
| `dc:description`| Account of the resource                       | `description`       |
| `dc:publisher`  | Entity responsible for making available       | `publisher`         |
| `dc:contributor`| Entity contributing to the resource           | (stored in extras)  |
| `dc:date`       | Date associated with lifecycle event          | `datePublished`     |
| `dc:type`       | Nature or genre of the resource               | `contentType`       |
| `dc:format`     | File format or medium                         | (MIME in extras)    |
| `dc:identifier` | Unambiguous reference (DOI, ISBN, URL)        | `sourceUrl`         |
| `dc:source`     | Derived-from resource                         | (stored in extras)  |
| `dc:language`   | Language of the resource                      | `language`          |
| `dc:relation`   | Related resource reference                    | (stored in extras)  |
| `dc:coverage`   | Spatial or temporal scope                     | (stored in extras)  |
| `dc:rights`     | Rights held in/over the resource              | `license`           |

## OpenGraph Property Catalog

Properties extracted from `<meta property="og:..." />` tags:

| OG Property       | Maps To         | Notes                                   |
|--------------------|-----------------|----------------------------------------|
| `og:title`         | `title`         | Preferred over `<title>` when present  |
| `og:description`   | `description`   | Preferred over meta description        |
| `og:url`           | `sourceUrl`     | Canonical URL                          |
| `og:image`         | `thumbnailUrl`  | First image only                       |
| `og:type`          | `contentType`   | Requires type mapping (see below)      |
| `og:locale`        | `language`      | Convert `en_US` to `en`               |
| `og:site_name`     | `publisher`     | Platform or site name                  |
| `og:updated_time`  | `dateModified`  | ISO 8601 expected                      |
| `article:author`          | `author`    | URL or name string               |
| `article:published_time`  | `datePublished` | ISO 8601                     |
| `article:tag`             | `tags`      | One tag per meta element               |

### OG Type to Content Type Mapping

| `og:type`         | Orchestrator `contentType` |
|--------------------|---------------------------|
| `article`          | `article`                 |
| `website`          | `webpage`                 |
| `video.other`      | `video`                   |
| `music.song`       | `audio`                   |
| `profile`          | `profile`                 |
| `book`             | `document`                |

## Schema.org Type Mappings

Extracted from JSON-LD or microdata `@type` values:

| Schema.org Type    | Orchestrator `contentType` | Key Properties Extracted           |
|--------------------|----------------------------|------------------------------------|
| `Article`          | `article`                  | headline, author, datePublished    |
| `BlogPosting`      | `article`                  | headline, author, datePublished    |
| `WebPage`          | `webpage`                  | name, description, url             |
| `VideoObject`      | `video`                    | name, description, thumbnailUrl    |
| `AudioObject`      | `audio`                    | name, duration, encodingFormat     |
| `SoftwareSourceCode` | `repository`             | name, programmingLanguage          |
| `SoftwareApplication` | `software`              | name, operatingSystem, offers      |
| `HowTo`           | `tutorial`                  | name, step, totalTime              |
| `QAPage`          | `discussion`                | name, mainEntity                   |
| `Dataset`         | `dataset`                   | name, distribution, license        |
| `ScholarlyArticle`| `paper`                     | headline, author, citation         |
| `TechArticle`     | `article`                   | headline, proficiencyLevel         |
| `APIReference`    | `api-doc`                   | name, description                  |

## Cross-Schema Equivalence Table

Quick lookup for the same concept across schemas:

| Concept      | Orchestrator   | Dublin Core      | OpenGraph            | Schema.org         |
|-------------|----------------|------------------|----------------------|--------------------|
| Title       | `title`        | `dc:title`       | `og:title`           | `name`/`headline`  |
| Summary     | `description`  | `dc:description` | `og:description`     | `description`      |
| Creator     | `author`       | `dc:creator`     | `article:author`     | `author`           |
| Published   | `datePublished`| `dc:date`        | `article:published_time` | `datePublished`|
| Modified    | `dateModified` | --               | `og:updated_time`    | `dateModified`     |
| Language    | `language`     | `dc:language`    | `og:locale`          | `inLanguage`       |
| Category    | `contentType`  | `dc:type`        | `og:type`            | `@type`            |
| Link        | `sourceUrl`    | `dc:identifier`  | `og:url`             | `url`              |
| Image       | `thumbnailUrl` | --               | `og:image`           | `thumbnailUrl`     |
| Rights      | `license`      | `dc:rights`      | --                   | `license`          |
| Keywords    | `tags`         | `dc:subject`     | `article:tag`        | `keywords`         |
| Publisher   | `publisher`    | `dc:publisher`   | `og:site_name`       | `publisher`        |

## Extraction Priority

When the same field appears in multiple schemas, prefer in this order:

1. **JSON-LD / Schema.org** -- most structured and explicit
2. **OpenGraph** -- widely adopted, usually curated by authors
3. **Dublin Core** -- common in academic and institutional pages
4. **HTML meta tags** -- fallback (`<title>`, `<meta name="description">`)
5. **Inferred from content** -- last resort (first `<h1>`, first paragraph)

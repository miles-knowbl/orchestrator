# Extraction Patterns

Techniques for extracting actionable context from different content types while preserving meaning and attribution.

## Extraction by Content Type

### Documents (PDF, Markdown, Word, Plain Text)

| Element | Extract | Skip |
|---------|---------|------|
| Section headings and hierarchy | Yes - preserves structure | - |
| Body text with key assertions | Yes - core content | - |
| Tables and structured data | Yes - often highest density | - |
| Code blocks and examples | Yes - with language annotation | - |
| Footnotes and endnotes | Yes - often contain caveats | - |
| Table of contents | No | Redundant with headings |
| Page numbers and headers | No | Layout artifact |
| Boilerplate (copyright, disclaimers) | No | Unless legally relevant |
| Decorative images | No | No informational value |

### Web Pages

| Element | Extract | Skip |
|---------|---------|------|
| Main content area (`<article>`, `<main>`) | Yes - primary target | - |
| Page title and meta description | Yes - useful for metadata | - |
| Author, date, canonical URL | Yes - for attribution | - |
| Code snippets and pre-formatted blocks | Yes - with syntax context | - |
| Navigation menus | No | Site structure, not content |
| Sidebar ads and promotions | No | Noise |
| Cookie banners and modals | No | UI chrome |
| Comments section | Selective | Only if highly upvoted or author-replied |

### Conversations (Chat, Email, Threads)

| Element | Extract | Skip |
|---------|---------|------|
| Decisions and conclusions | Yes - highest priority | - |
| Action items and assignments | Yes - with attribution | - |
| Requirements stated by stakeholders | Yes - with exact wording | - |
| Links shared with context | Yes - note who shared and why | - |
| Greetings and pleasantries | No | Social filler |
| Repeated back-and-forth negotiation | Summarize | Extract final position only |
| Emoji reactions | No | Unless they signal consensus (e.g., many thumbs-up) |

### Video/Audio Transcripts

| Element | Extract | Skip |
|---------|---------|------|
| Key statements with timestamps | Yes - enables verification | - |
| Demonstrated workflows (step-by-step) | Yes - as numbered procedures | - |
| Screen-shared content descriptions | Yes - describe what was shown | - |
| Speaker introductions and banter | No | Social context only |
| Filler words and false starts | No | Transcript noise |
| Q&A segments | Selective | Extract if questions match your topic |

## Core Extraction Techniques

### 1. Assertion Extraction
Pull out factual claims as standalone statements:

```
Source: "After migrating to PostgreSQL 16, we observed a 40% improvement
in query performance for our JSONB workloads, though this required
rewriting several stored procedures."

Extracted:
- PostgreSQL 16 improves JSONB query performance by ~40%
- Migration from earlier versions may require stored procedure rewrites
```

### 2. Definition Extraction
Capture explicit definitions of terms, concepts, or patterns:

```
Source: "Circuit breaking is a stability pattern where calls to an external
service are monitored, and if failures exceed a threshold, subsequent calls
are short-circuited for a cooldown period."

Extracted: Circuit breaking = stability pattern; monitor external service
calls; short-circuit on failure threshold; cooldown period.
```

### 3. Procedure Extraction
Convert narrative instructions into numbered steps:

```
Source: "First you'll want to set up the config file, then make sure to
run migrations before starting the server..."

Extracted:
1. Create/configure the config file
2. Run database migrations
3. Start the server
```

### 4. Constraint Extraction
Identify limitations, requirements, and boundaries:

```
Source: "The API supports up to 1000 requests per minute per API key.
Batch endpoints accept a maximum of 100 items. File uploads limited to 25MB."

Extracted constraints:
- Rate limit: 1000 req/min per API key
- Batch size: max 100 items
- Upload limit: 25MB per file
```

## Preserving Context and Attribution

Every extracted piece of content must carry:

| Field | Purpose | Example |
|-------|---------|---------|
| `source_id` | Link back to original source | `src_2024_pg16_blog` |
| `extracted_from` | Specific location within source | "Section 3, paragraph 2" |
| `extraction_date` | When extraction occurred | `2025-01-15` |
| `confidence` | Extractor's confidence in accuracy | `high`, `medium`, `low` |
| `context_note` | Any caveats about the extraction | "Author later corrected this in comments" |

## Handling Multi-Format Sources

When a single source contains multiple formats (e.g., a web page with embedded video, code, and diagrams):

1. **Extract each format independently** using the appropriate pattern above
2. **Link extractions** with a shared `source_id` and sequential `part` numbers
3. **Note format transitions** where meaning depends on seeing both formats together
4. **Prioritize text over visual** when both convey the same information
5. **Describe visuals in text** when they contain unique information not stated elsewhere

## What to Never Extract

Regardless of content type, always skip:

- **Personally identifiable information** (emails, phone numbers, addresses) unless explicitly needed
- **Authentication credentials** (API keys, passwords, tokens) even if visible in examples
- **Copyrighted content in full** - extract facts and ideas, not verbatim reproductions
- **Unqualified speculation** - preserve uncertainty markers ("maybe", "I think") if extracted
- **Outdated version-specific details** when newer info is available from the same source

## Extraction Quality Check

After extraction, verify:

- [ ] Each extraction can stand alone without the original source
- [ ] Attribution is complete (source, location, date)
- [ ] No meaning was lost or distorted in summarization
- [ ] Uncertainty and caveats from the original are preserved
- [ ] No sensitive data was inadvertently captured

---
name: context-ingestion
description: "Gather and organize context from multiple sources into a structured format. Handles documents, URLs, conversations, and notes."
phase: INIT
category: specialized
---

# Context Ingestion

Gather and structure context from diverse sources.

## When to Use

- Starting a new proposal or project
- Onboarding to a new client or domain
- Collecting background for analysis
- When you say: "gather context", "collect sources", "ingest this information"

## Required Deliverables

| Deliverable | Location | Description |
|-------------|----------|-------------|
| CONTEXT-SOURCES.md | Root | Registry of all sources with metadata |
| RAW-CONTEXT.md | Root | Extracted content organized by source |

## Process

```
┌─────────────────────────────────────────────────────────────┐
│                  CONTEXT INGESTION                          │
│                                                             │
│  1. SOURCE DISCOVERY                                        │
│     └─→ Identify all relevant sources                       │
│                                                             │
│  2. SOURCE CATEGORIZATION                                   │
│     └─→ Documents, URLs, conversations, notes               │
│                                                             │
│  3. CONTENT EXTRACTION                                      │
│     └─→ Pull key content from each source                   │
│                                                             │
│  4. METADATA TAGGING                                        │
│     └─→ Date, author, reliability, relevance                │
│                                                             │
│  5. REGISTRY CREATION                                       │
│     └─→ Build CONTEXT-SOURCES.md                            │
│                                                             │
│  6. CONTENT COMPILATION                                     │
│     └─→ Build RAW-CONTEXT.md                                │
└─────────────────────────────────────────────────────────────┘
```

## Source Types

| Type | How to Process |
|------|----------------|
| Documents | Extract key sections, summarize |
| URLs | Fetch and extract main content |
| Conversations | Identify key points and decisions |
| Notes | Organize by topic |

## Success Criteria

- 80%+ of relevant sources captured
- Each source has complete metadata
- Content is organized and searchable
- No duplicate entries

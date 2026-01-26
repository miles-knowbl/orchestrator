---
name: deck-text-schema
description: "Define text content schema for presentation slides specifying typography, hierarchy, formatting rules, and content structure."
phase: IMPLEMENT
category: specialized
version: "1.0.0"
depends_on: ["taste-schema", "content-analysis"]
tags: [specialized, design, schema, typography, presentation]
---

# Deck Text Schema

Define the text content structure and typography for presentation slides.

## When to Use

- **Deck generation** — Creating the text specification for a presentation
- **Typography consistency** — Establishing text rules across slides
- **Content hierarchy** — Defining how text flows through the deck
- When you say: "text schema", "slide composition", "deck typography"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `deck-text-schema.json` | Project root | Always |

## Core Concept

Text schema answers: **"What text appears on each slide, how is it structured, and how should it be styled?"**

```
Taste Schema (brand) → Text Schema (content rules) → Slide Generation (applied)
```

The text schema defines content types, hierarchy, and formatting rules that ensure every slide communicates clearly.

## Schema Structure

```json
{
  "version": "1.0.0",
  "typography": {
    "headingFont": "Inter",
    "bodyFont": "Inter",
    "monoFont": "JetBrains Mono"
  },
  "textTypes": {
    "slideTitle": { "maxLength": 60, "fontSize": "3xl", "weight": "bold" },
    "subtitle": { "maxLength": 120, "fontSize": "xl", "weight": "normal" },
    "body": { "maxLength": 300, "fontSize": "base", "weight": "normal" },
    "bullet": { "maxLength": 80, "fontSize": "lg", "weight": "normal" },
    "caption": { "maxLength": 100, "fontSize": "sm", "weight": "light" },
    "callout": { "maxLength": 150, "fontSize": "lg", "weight": "semibold" }
  },
  "slideTypes": {
    "title": { "fields": ["slideTitle", "subtitle"] },
    "content": { "fields": ["slideTitle", "body", "bullets"] },
    "comparison": { "fields": ["slideTitle", "leftColumn", "rightColumn"] },
    "quote": { "fields": ["callout", "caption"] },
    "closing": { "fields": ["slideTitle", "body"] }
  },
  "constraints": {
    "maxBulletsPerSlide": 5,
    "maxWordsPerBullet": 15,
    "maxSlidesTotal": 20
  }
}
```

## Text Types

| Type | Purpose | Max Length | Style |
|------|---------|-----------|-------|
| **slideTitle** | Main slide heading | 60 chars | Bold, large |
| **subtitle** | Supporting heading | 120 chars | Normal, medium |
| **body** | Paragraph text | 300 chars | Normal, base |
| **bullet** | List item | 80 chars | Normal, medium |
| **caption** | Image/figure label | 100 chars | Light, small |
| **callout** | Emphasized quote/stat | 150 chars | Semibold, large |

## Content Hierarchy

```
Slide Title (one per slide)
├── Subtitle (optional, one per slide)
├── Body (optional, one block)
├── Bullets (optional, max 5)
│   ├── Bullet 1
│   ├── Bullet 2
│   └── ...
├── Callout (optional, one per slide)
└── Caption (optional, paired with images)
```

## Slide Type Templates

| Slide Type | Required Fields | Optional Fields |
|------------|-----------------|-----------------|
| **Title** | slideTitle, subtitle | — |
| **Content** | slideTitle | body, bullets |
| **Comparison** | slideTitle, leftColumn, rightColumn | — |
| **Quote** | callout | caption |
| **Closing** | slideTitle | body |

## Checklist

- [ ] Text types defined with max lengths
- [ ] Typography system specified (fonts, sizes, weights)
- [ ] Slide type templates defined
- [ ] Content constraints set (max bullets, max slides)
- [ ] Hierarchy rules documented
- [ ] Schema exported as deck-text-schema.json

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `taste-schema` | Provides brand identity that typography must match |
| `deck-image-schema` | Text and image schemas coordinate for slide layout |
| `content-analysis` | Analyzed content feeds into text structure |

## Key Principles

**Less text per slide.** Presentations are visual — keep text concise.

**Hierarchy is king.** Clear title → subtitle → body → bullets hierarchy on every slide.

**Constraints prevent overload.** Max lengths and counts keep slides scannable.

**Schema is the contract.** Generation tools consume the schema; content fills the template.

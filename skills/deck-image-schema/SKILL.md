---
name: deck-image-schema
description: "Define visual schema for presentation content specifying image types, layout positions, sizing, and styling rules for deck generation."
phase: IMPLEMENT
category: content
version: "1.0.0"
depends_on: ["taste-codifier", "content-analysis"]
tags: [specialized, design, schema, visual, presentation]
---

# Deck Image Schema

Define the visual specification for presentation slide imagery.

## When to Use

- **Deck generation** — Creating the image specification for a presentation
- **Visual consistency** — Establishing image rules across slides
- **Brand alignment** — Ensuring images match the taste-codifier identity
- When you say: "image schema", "visual specification", "deck images"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `deck-image-schema.json` | Project root | Always |

## Core Concept

Image schema answers: **"What images appear on each slide, where, and how should they look?"**

```
Taste Codifier (brand) → Image Schema (visual rules) → Slide Generation (applied)
```

The image schema bridges brand identity (from taste-codifier) to concrete visual specifications per slide type.

## Schema Structure

```json
{
  "version": "1.0.0",
  "defaults": {
    "aspectRatio": "16:9",
    "quality": "high",
    "style": "professional"
  },
  "slideTypes": {
    "title": {
      "hero": { "position": "full-bleed", "opacity": 0.3, "overlay": true }
    },
    "content": {
      "accent": { "position": "right-third", "size": "medium" }
    },
    "comparison": {
      "left": { "position": "left-half", "size": "contained" },
      "right": { "position": "right-half", "size": "contained" }
    }
  },
  "imageTypes": {
    "hero": "Full-width background image",
    "accent": "Supporting visual element",
    "icon": "Small symbolic image",
    "diagram": "Technical illustration",
    "screenshot": "Product or UI capture"
  }
}
```

## Image Types

| Type | Purpose | Sizing | Position |
|------|---------|--------|----------|
| **Hero** | Full-bleed background | Cover entire slide | Background layer |
| **Accent** | Supporting visual | 1/3 to 1/2 slide | Right or bottom |
| **Icon** | Symbolic representation | 48-96px | Inline with text |
| **Diagram** | Technical illustration | Up to 2/3 slide | Centered or right |
| **Screenshot** | Product capture | Contained with border | Centered |

## Layout Grid

```
┌──────────────────────────────────┐
│  ┌────────┐  ┌────────────────┐  │
│  │        │  │                │  │
│  │  Left  │  │     Right      │  │
│  │  Third │  │     Two-Thirds │  │
│  │        │  │                │  │
│  └────────┘  └────────────────┘  │
└──────────────────────────────────┘
```

## Checklist

- [ ] Image types defined with sizing rules
- [ ] Layout positions specified per slide type
- [ ] Aspect ratio and quality defaults set
- [ ] Visual style aligned with taste-codifier
- [ ] Schema exported as deck-image-schema.json

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `taste-codifier` | Provides brand identity that images must match |
| `deck-text-schema` | Text and image schemas coordinate for slide layout |
| `content-analysis` | Analyzed content determines which images are needed |

## Key Principles

**Consistency over variety.** Every slide should feel like part of the same deck.

**Schema drives generation.** The schema is the contract between design intent and slide output.

**Position is semantic.** Use named positions (right-third) not pixel coordinates.

**Type determines treatment.** Each image type has consistent sizing and placement rules.

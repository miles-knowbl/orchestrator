---
name: taste-codifier
description: "Analyzes diverse source material (text, images, video) to extract and codify a creator's 'taste'—their distinctive voice patterns across textual and visual dimensions. Use this skill when: (1) Creating a taste schema from source material, (2) Documenting a voice for consistent reproduction, (3) Building a style guide for AI-assisted content generation, (4) Capturing brand voice or personal voice patterns. Outputs a comprehensive JSON taste schema."
phase: SCAFFOLD
category: content
version: "1.0.0"
depends_on: []
tags: [specialized, voice, branding, schema, content-generation]
---

# Taste Codifier

Extracts voice patterns from source material to produce a comprehensive, format-agnostic taste schema.

## When to Use

- User provides source material and wants their "voice" or "style" codified
- User wants a schema that can later drive consistent content generation
- User says "codify my taste", "capture my voice", "create a style profile"

## Core Concept

A **taste schema** captures the full "universe" of a voice—every dimension that makes content recognizable as coming from that creator. It is:
- **Format-agnostic**: Pure essence, not tied to any output type
- **MECE**: Mutually Exclusive, Collectively Exhaustive across dimensions
- **Maximalist**: Every field populated, even with low-confidence extrapolations
- **Derivable**: Downstream skills use this schema to produce specific outputs (image schemas, text schemas, video schemas)

## Workflow

### Step 1: Source Inventory

Catalog all provided sources:
```
Text: docs, transcripts, posts, articles, emails
Image: graphics, photos, slides, brand materials  
Video: presentations, interviews, social content
```

Count sources per category—this determines confidence levels.

### Step 2: Read Analysis Guide

Read `references/analysis-guide.md` for detailed extraction techniques. Key phases:
1. Textual pattern extraction (7 dimensions)
2. Visual pattern extraction (5 dimensions)
3. Anti-pattern identification
4. Confidence calibration

### Step 3: Extract Patterns

Work through each dimension systematically. For each:
- Find multiple examples in source material
- Identify the underlying pattern (not just instances)
- Note frequency and consistency
- Collect signature examples

**Textual Dimensions:**
1. Narrative mechanics (arc types, specificity anchors, story patterns)
2. Rhetorical signature (analogies, humor, contrarian inversions)
3. Emotional architecture (vulnerability, triumph, gratitude layers)
4. Identity threads (core claims, belonging dynamics)
5. Teaching moves (frameworks, advice inversions)
6. Audience relationship (hooks, intimacy, permissions)
7. Narrative metadata (audience adaptations, story clusters, phrases)

**Visual Dimensions:**
1. Color system (palette, relationships, emotional associations)
2. Typography system (heading/body/accent styles, hierarchy)
3. Composition system (layout, whitespace, flow)
4. Imagery system (illustration, icons, motifs, metaphors)
5. Mood/atmosphere (energy, texture, lighting, emotion)

### Step 4: Identify Anti-Patterns

Document what is conspicuously absent:
- Textual patterns never used
- Visual approaches avoided
- Topics off-limits
- Tones that don't appear

### Step 5: Populate Schema

Use `references/schema-structure.json` as the template. Fill every field:
- High-confidence fields: Direct evidence from sources
- Low-confidence fields: Reasonable extrapolations, marked as such

### Step 6: Calibrate Confidence

Set confidence levels based on:
- **High**: 20+ text sources, 10+ images, patterns at 70%+ consistency
- **Medium**: 5-20 text, 3-10 images, 40-70% consistency
- **Low**: <5 text, <3 images, <40% consistency

Low confidence still requires all fields populated—just note uncertainty.

### Step 7: Validate

Before delivering:
1. Read key sections aloud—does it sound like the voice?
2. Could someone unfamiliar recreate the voice from this schema?
3. Check for contradictions between dimensions
4. Ensure anti-patterns are documented

## Output Format

Deliver as a single JSON file named `{voice-name}-taste-schema.json`.

The schema should be immediately usable by downstream derivative skills to produce:
- Image schemas (infographics, graphics, charts)
- Text schemas (articles, posts, threads)
- Video schemas (storyboards with timing)

## Key Principles

**Fill every field.** The taste schema is maximalist. Even sparse source material should yield a complete schema—mark low-confidence extrapolations but don't leave gaps.

**Pattern over instance.** Don't just list examples—identify the underlying pattern. "Self-deprecating humor placed before credentials to disarm" not "Makes jokes."

**Anti-patterns are patterns.** What's absent defines the voice as much as what's present.

**Essence first.** If time-constrained, prioritize: core DNA → emotional architecture → narrative mechanics → rhetorical signature → audience relationship → visual dimensions.

## Example Essence Block

From the Cliff Weitzman voice analysis:

```json
{
  "essence": {
    "core_dna": "Transform shame into superpowers through specific numbers, earned vulnerability, and contrarian reframes.",
    "values": ["persistence", "vulnerability as strength", "brute force", "gratitude", "helping others like past self"],
    "worldview": "Weakness contains hidden strength; rejection is data, not verdict; the universe has a plan.",
    "emotional_signature": "Vulnerable optimism backed by quantified improbability",
    "transformation_promise": "Permission to be slower, different, or rejected—and still succeed"
  }
}
```

## References

- `references/schema-structure.json`: Full JSON schema template with field descriptions
- `references/analysis-guide.md`: Detailed extraction techniques for each dimension
- `references/dimension-definitions.md`: Quick reference for understanding each dimension

---
name: taste-to-image-schema
description: "Derives a fully-specified image schema from a taste schema + topic. Use when: (1) Generating social media graphics aligned to a voice, (2) Creating infographics, illustrations, or photo-based content that matches a style profile, (3) Producing image generation prompts (for Midjourney, DALL-E, Gemini, etc.) that maintain voice consistency. Input: taste schema JSON + topic/message. Output: image schema JSON + generation prompt."
phase: IMPLEMENT
category: content
version: "1.0.0"
depends_on: [taste-codifier]
tags: [specialized, visual, image-generation, schema, content-generation]
---

# Taste to Image Schema

Takes a taste schema (from taste-codifier) plus a topic or message, and produces a fully-specified image schema with a ready-to-use generation prompt.

## Inputs Required

1. **Taste schema** — JSON file from taste-codifier skill
2. **Topic/message** — What the image should be about
3. **Optional context:**
   - Target platform (Instagram, Twitter, LinkedIn, etc.)
   - Specific aspect ratio requirements
   - Generation tool preference (Midjourney, DALL-E, Gemini, etc.)

## Workflow

### Step 1: Determine Mode

First decision: **Archetype** or **Dimensional**?

**Use Archetype mode when:**
- The message IS the visual (text-forward)
- No meaningful imagery needed
- Typography and layout carry the design

→ See `references/archetypes.md` for the five archetypes:
- Quote graphic
- Text post
- Stat callout
- List post
- Comparison text

**Use Dimensional mode when:**
- Imagery matters to the message
- Photos, illustrations, or diagrams are needed
- Visual style is a meaningful choice

→ See `references/dimensional-mode.md` for dimension configuration

### Step 2: Configure Classification

**If Archetype mode:**
```json
{
  "classification": {
    "mode": "archetype",
    "archetype": "quote_graphic | text_post | stat_callout | list_post | comparison_text",
    "dimensions": null
  }
}
```

**If Dimensional mode:**
```json
{
  "classification": {
    "mode": "dimensional",
    "archetype": null,
    "dimensions": {
      "composition": "single_focus | sectioned",
      "text_image_balance": "text_dominant | balanced | image_dominant",
      "visual_style": "photorealistic | illustrated | diagrammatic",
      "format": "static | sequential"
    }
  }
}
```

### Step 3: Define Intent

Extract from the topic/message:
- **title**: Working title
- **goal**: What the image accomplishes (1-2 sentences)
- **audience**: Who sees this, in what context
- **core_message**: Single most important takeaway
- **emotional_target**: How viewer should feel

### Step 4: Set Canvas

Based on platform and content:

| Platform | Common Ratios |
|----------|---------------|
| Instagram Feed | 1:1, 4:5 |
| Instagram Story | 9:16 |
| Twitter/X | 16:9, 1:1 |
| LinkedIn | 1.91:1, 1:1 |
| Presentation | 16:9 |
| Mobile wallpaper | 9:16 |

### Step 5: Design Sections

Build the `sections` array. Each section needs:
- **id**: Unique identifier (e.g., "header", "main", "footer")
- **purpose**: What this section accomplishes
- **zone**: Spatial location on canvas
- **heading**: Heading text (empty string if none)
- **body_text**: Body text (empty string if none)
- **visual_elements**: List of visual components
- **visual_description**: Detailed description for generation
- **mood**: Emotional register
- **data_required**: Any data/stats needed

For archetypes, use the templates in `references/archetypes.md`.
For dimensional, design sections based on composition type.

### Step 6: Apply Taste Schema Style

Pull from the taste schema's visual dimensions:

**Colors:**
- `taste_schema.visual_dimensions.color_system.primary` → dominant colors
- `taste_schema.visual_dimensions.color_system.secondary` → supporting
- `taste_schema.visual_dimensions.color_system.accent` → emphasis
- Respect `forbidden_colors`

**Typography:**
- `taste_schema.visual_dimensions.typography_system.heading_style`
- `taste_schema.visual_dimensions.typography_system.body_style`
- `taste_schema.visual_dimensions.typography_system.hierarchy_patterns`

**Imagery (if dimensional):**
- `taste_schema.visual_dimensions.imagery_system.illustration_style`
- `taste_schema.visual_dimensions.imagery_system.recurring_motifs`
- `taste_schema.visual_dimensions.mood_atmosphere`

**If visual dimensions are low-confidence:**
Derive visual direction from textual dimensions:
- `essence.emotional_signature` → mood
- `essence.values` → thematic elements
- `textual_dimensions.rhetorical_signature.explanatory_analogies.source_domains` → visual metaphor sources

### Step 7: Document Voice Alignment

Fill the `voice_alignment` block:
- Which taste schema elements were applied
- Signature elements that must be present
- Anti-patterns intentionally avoided

### Step 8: Generate Prompt

Create the `generation_prompt` block:

**Primary prompt structure:**
```
[Scene/subject description], [style reference], [mood/atmosphere], [color palette], [composition notes], [technical quality markers]
```

**Example:**
```
A vertical mobile wallpaper showing two contrasting paths: on top, a figure struggling against chaotic Hokusai-style waves carrying a heavy golden sack; below, a serene figure walking a cherry blossom-lined path toward Mount Fuji. Japanese Ukiyo-e woodblock print style with bold black outlines and flat colors. Prussian blue and stormy grey above, warm vermilion and sakura pink below. Red torii gate at the center dividing the two worlds. Textured washi paper background throughout. --ar 9:16
```

**Negative prompt (if supported):**
What to exclude (e.g., "photorealistic, 3D render, modern elements")

**Style modifiers:**
Platform-specific keywords (e.g., "trending on artstation", "editorial photography")

### Step 9: Handle Sequential (if applicable)

If `format: sequential`:
- Set `sequential_extension.is_sequential: true`
- Define `panel_count`
- Describe `panel_relationship`
- Add `per_panel_overrides` for any panel-specific changes

## Output

Deliver as JSON file: `{topic-slug}-image-schema.json`

The output should be immediately usable:
1. The `generation_prompt.primary_prompt` can be pasted directly into an image generation tool
2. The full schema serves as a reference for designers or for iteration

## Key Principles

**Voice-first.** Every visual choice should trace back to the taste schema. If you can't justify a choice from the taste schema, reconsider it.

**Fully specified.** No empty fields. The schema should be complete enough that someone unfamiliar with the context could execute it.

**Prompt-ready.** The generation prompt should work as-is. Don't require additional interpretation.

**Anti-patterns matter.** Actively document what you're NOT doing based on the taste schema.

## Example: Ukiyo-e Decision Image

**Input:** Taste schema with illustrated style preference + topic "game you're playing"

**Output classification:**
```json
{
  "mode": "dimensional",
  "archetype": null,
  "dimensions": {
    "composition": "sectioned",
    "text_image_balance": "balanced",
    "visual_style": "illustrated",
    "format": "static"
  }
}
```

**Output sections:** Header (question), Game A zone (negative path), Decision point (torii gate), Game B zone (positive path), Footer (CTA)

**Output style:** Ukiyo-e colors, brush calligraphy typography, woodblock texture, nature motifs

**Output prompt:** Full scene description with style references and technical parameters

## References

- `references/image-schema-structure.json`: Full JSON output schema
- `references/archetypes.md`: Text-forward archetype definitions and templates
- `references/dimensional-mode.md`: Image-forward dimension configurations

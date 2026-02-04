# Image Archetypes

Text-forward image types where Visual Style isn't a meaningful dimension. These are pre-solved patterns optimized for typography, color, and layout rather than imagery.

## When to Use Archetypes vs Dimensions

**Use Archetypes when:**
- The message IS the visual
- No meaningful illustration, photo, or diagram is needed
- Typography and layout carry the design
- Quick social content where text dominates

**Use Dimensions when:**
- Imagery is important to the message
- You need photos, illustrations, or data visualization
- The visual style matters (photorealistic vs illustrated vs diagrammatic)
- More complex compositions with multiple visual elements

---

## Archetype: Quote Graphic

**Purpose:** Elevate a single quote or statement for maximum shareability.

**Structural Elements:**
- Quote text (large, dominant)
- Attribution (smaller, positioned below or adjacent)
- Optional: decorative quote marks, accent lines, subtle brand element
- Background: solid color, subtle gradient, or minimal texture

**Section Template:**
```json
{
  "sections": [
    {
      "id": "quote",
      "purpose": "The quote itself",
      "zone": "center, 60-70% of canvas",
      "heading": "",
      "body_text": "[THE QUOTE]",
      "visual_elements": ["Large quotation marks (optional)", "Accent line or border (optional)"],
      "visual_description": "Typography is the visual. Consider size contrast, line breaks for rhythm.",
      "mood": "Depends on quote content"
    },
    {
      "id": "attribution",
      "purpose": "Source credibility",
      "zone": "below quote, right-aligned or centered",
      "heading": "",
      "body_text": "— [ATTRIBUTION]",
      "visual_elements": ["Smaller type", "Optional: small photo/avatar"],
      "visual_description": "Secondary emphasis, should not compete with quote",
      "mood": "Subdued, supporting"
    }
  ]
}
```

**Taste Schema Mapping:**
- Colors: `visual_dimensions.color_system.primary` for background, `accent` for decorative elements
- Typography: `visual_dimensions.typography_system.heading_style` for quote
- Voice: Quote should feel like it could have come from this voice

---

## Archetype: Text Post

**Purpose:** Deliver a message, thought, or announcement in a clean, readable format.

**Structural Elements:**
- Main message (headline or short paragraph)
- Optional: subheading, context line
- Background: solid or simple gradient
- Optional: simple icon or brand mark

**Section Template:**
```json
{
  "sections": [
    {
      "id": "message",
      "purpose": "Primary content",
      "zone": "center or top-aligned with padding",
      "heading": "[HEADLINE IF APPLICABLE]",
      "body_text": "[MAIN MESSAGE]",
      "visual_elements": ["Optional icon", "Optional brand element"],
      "visual_description": "Clean, readable. Hierarchy through size/weight, not imagery.",
      "mood": "Matches message content"
    }
  ]
}
```

**Taste Schema Mapping:**
- Colors: Background from `primary`, text from high-contrast complement
- Typography: Body style or heading style depending on message length
- Voice: Sentence structure and word choice should match voice patterns

---

## Archetype: Stat Callout

**Purpose:** Make a single number or metric visually impactful.

**Structural Elements:**
- The number (very large, dominant)
- Context label (what the number means)
- Optional: comparison or timeframe
- Optional: simple icon representing the metric

**Section Template:**
```json
{
  "sections": [
    {
      "id": "stat",
      "purpose": "The number itself",
      "zone": "center, dominant",
      "heading": "[THE NUMBER with unit if applicable]",
      "body_text": "",
      "visual_elements": ["Number as hero element"],
      "visual_description": "Massive typography. The number IS the visual.",
      "mood": "Impact, authority"
    },
    {
      "id": "context",
      "purpose": "Explain what the number means",
      "zone": "below or beside the stat",
      "heading": "",
      "body_text": "[WHAT THIS NUMBER REPRESENTS]",
      "visual_elements": ["Optional icon representing the metric"],
      "visual_description": "Smaller, secondary. Provides meaning without competing.",
      "mood": "Explanatory"
    }
  ]
}
```

**Taste Schema Mapping:**
- Numbers: Voice's relationship with specificity (`textual_dimensions.narrative_mechanics.specificity_anchors`)
- Color: Use accent color for the number itself
- This archetype aligns well with voices that use concrete numbers as credibility anchors

---

## Archetype: List Post

**Purpose:** Deliver multiple points in a scannable format.

**Structural Elements:**
- Title/headline (what the list is about)
- 3-7 list items (numbered or bulleted)
- Optional: brief intro line
- Background: solid with clear section separation

**Section Template:**
```json
{
  "sections": [
    {
      "id": "header",
      "purpose": "Frame the list",
      "zone": "top, 15-20% of canvas",
      "heading": "[LIST TITLE]",
      "body_text": "[Optional intro line]",
      "visual_elements": [],
      "visual_description": "Clear headline treatment, sets expectation",
      "mood": "Authoritative, instructive"
    },
    {
      "id": "list_items",
      "purpose": "The actual content",
      "zone": "middle, 70-80% of canvas",
      "heading": "",
      "body_text": "1. [ITEM]\n2. [ITEM]\n3. [ITEM]...",
      "visual_elements": ["Numbers or bullets", "Optional icons per item", "Visual separation between items"],
      "visual_description": "Clear hierarchy. Each item visually distinct but cohesive.",
      "mood": "Scannable, useful"
    }
  ]
}
```

**Taste Schema Mapping:**
- Teaching style: `textual_dimensions.teaching_moves.framework_delivery`
- If voice uses numbered frameworks, honor that pattern
- Typography hierarchy is critical—heading vs item distinction

---

## Archetype: Comparison Text

**Purpose:** Present two options, paths, or states for contrast.

**Structural Elements:**
- Two columns or zones
- Labels for each side (A vs B, Before/After, This/That)
- Matching structure on each side
- Optional: visual divider or VS element

**Section Template:**
```json
{
  "sections": [
    {
      "id": "header",
      "purpose": "Frame the comparison",
      "zone": "top",
      "heading": "[COMPARISON TITLE OR QUESTION]",
      "body_text": "",
      "visual_elements": [],
      "visual_description": "Sets up the tension or choice",
      "mood": "Provocative, engaging"
    },
    {
      "id": "option_a",
      "purpose": "First option",
      "zone": "left half or top half",
      "heading": "[OPTION A LABEL]",
      "body_text": "[OPTION A POINTS]",
      "visual_elements": ["Color coding for this option", "Optional icon"],
      "visual_description": "Visually distinct from Option B but parallel structure",
      "mood": "[Depends on framing—often 'bad' or 'common']"
    },
    {
      "id": "option_b",
      "purpose": "Second option",
      "zone": "right half or bottom half",
      "heading": "[OPTION B LABEL]",
      "body_text": "[OPTION B POINTS]",
      "visual_elements": ["Different color coding", "Optional icon"],
      "visual_description": "Parallel to Option A, visually differentiated",
      "mood": "[Depends on framing—often 'good' or 'proposed']"
    }
  ]
}
```

**Taste Schema Mapping:**
- Contrarian inversions: `textual_dimensions.rhetorical_signature.contrarian_inversions`
- This archetype naturally supports "Most people think X / I've found Y" patterns
- Color: Use contrasting colors for each option

---

## Archetype Selection Guide

| If the content is... | Use this archetype |
|---------------------|-------------------|
| A single powerful quote or statement | Quote Graphic |
| A thought, announcement, or short message | Text Post |
| A single impressive number/metric | Stat Callout |
| Multiple tips, steps, or points | List Post |
| Two contrasting options or paths | Comparison Text |
| Something that needs imagery to work | → Use Dimensional mode instead |

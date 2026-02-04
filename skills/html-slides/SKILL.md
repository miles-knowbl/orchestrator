---
name: html-slides
description: "Renders presentation schemas into a self-contained HTML file using reveal.js. The HTML is version-controllable, hostable anywhere, and can be converted to other formats. Optionally exports to Google Slides via API."
phase: DOCUMENT
category: specialized
version: "1.0.0"
depends_on: [deck-text-schema, deck-image-schema]
tags: [specialized, presentation, html, reveal.js, rendering]
---

# HTML Slides

Renders deck schemas into a self-contained HTML presentation using reveal.js.

## When to Use

- After deck-text-schema and deck-image-schema are complete
- To produce the final deliverable of the deck-loop
- When you need a presentation that works anywhere

## Why HTML First

| Benefit | Description |
|---------|-------------|
| **Universal** | Works in any browser, no special software needed |
| **Version Control** | Text-based, diffs cleanly in git |
| **Hostable** | Deploy to any static host (GitHub Pages, Vercel, etc.) |
| **Convertible** | Can export to PDF, or push to Google Slides |
| **AI-Editable** | Easy to modify programmatically |

## Inputs Required

1. **deck-text-schema.json** — Slide content, structure, speaker notes
2. **deck-image-schema.json** — Visual specifications, image prompts
3. **taste-schema.json** — Brand styling parameters

## Output Structure

```
output/
├── index.html          # Self-contained presentation
├── assets/
│   ├── images/         # Generated/sourced images
│   └── custom.css      # Brand-specific overrides
└── render-manifest.json # Build metadata
```

## Workflow

### Step 1: Load Schemas

```javascript
const textSchema = await loadJSON('deck-text-schema.json');
const imageSchema = await loadJSON('deck-image-schema.json');
const tasteSchema = await loadJSON('taste-schema.json');
```

### Step 2: Generate Slide HTML

For each slide in the text schema:

```html
<section data-background-color="{slide.background}">
  <h2>{slide.title}</h2>
  <div class="content">
    {slide.body}
  </div>
  <aside class="notes">
    {slide.speakerNotes}
  </aside>
</section>
```

### Step 3: Apply Brand Styling

Extract from taste-schema:
- Primary/secondary colors → CSS variables
- Typography → font imports and styles
- Mood → transition effects, background treatment

```css
:root {
  --r-background-color: {taste.visual.colors.background};
  --r-main-color: {taste.visual.colors.text};
  --r-heading-color: {taste.visual.colors.primary};
  --r-link-color: {taste.visual.colors.accent};
}
```

### Step 4: Process Images

For each image specification:
1. Check if image URL provided → use directly
2. If generation prompt provided → generate via AI
3. Optimize and place in assets/images/

### Step 5: Assemble HTML

Use the reveal.js template:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{presentation.title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/theme/white.css">
  <style>{customCSS}</style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      {generatedSlides}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      transition: '{taste.visual.mood.energy === "high" ? "slide" : "fade"}'
    });
  </script>
</body>
</html>
```

### Step 6: Generate Manifest

```json
{
  "version": "1.0.0",
  "generatedAt": "ISO-timestamp",
  "slideCount": 12,
  "imageCount": 8,
  "sourceSchemas": {
    "text": "deck-text-schema.json",
    "image": "deck-image-schema.json",
    "taste": "taste-schema.json"
  },
  "output": {
    "html": "index.html",
    "assets": "assets/"
  },
  "exports": {
    "googleSlides": null,
    "pdf": null
  }
}
```

## Optional: Google Slides Export

If Google Slides API is configured:

1. Create new presentation via API
2. Map reveal.js slides to Slides format
3. Upload images to Drive
4. Apply brand styling via Slides API
5. Update manifest with share link

```json
{
  "exports": {
    "googleSlides": {
      "id": "1abc...",
      "url": "https://docs.google.com/presentation/d/1abc.../edit",
      "exportedAt": "ISO-timestamp"
    }
  }
}
```

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| HTML presentation | `index.html` | Always |
| Render manifest | `render-manifest.json` | Always |
| Assets directory | `assets/` | If images present |

## Validation Checklist

Before marking complete:
- [ ] HTML renders correctly in browser
- [ ] All slides present and in order
- [ ] Images load properly
- [ ] Brand colors applied
- [ ] Speaker notes included
- [ ] Navigation works (arrows, space)
- [ ] Manifest is accurate

## References

- [reveal-js-config.md](references/reveal-js-config.md) — reveal.js configuration options
- [google-slides-api.md](references/google-slides-api.md) — Google Slides export guide

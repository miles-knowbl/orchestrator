# Dimensional Mode Guide

For image-forward content where Visual Style is a meaningful choice. Use dimensional mode when imagery—photos, illustrations, diagrams—is important to the message.

## The Dimensions

### 1. Composition

How the canvas is organized spatially.

| Value | Definition | Best For |
|-------|------------|----------|
| **Single-focus** | One main visual element, unified composition | Hero images, portraits, product shots, single-scene illustrations |
| **Sectioned** | Divided into distinct zones with different content | Comparisons, infographics, before/after, multi-element explanations |

**Composition Decision:**
- Is there ONE thing to show? → Single-focus
- Are there MULTIPLE things to show or compare? → Sectioned

---

### 2. Text-Image Balance

The relative weight of text vs visual content.

| Value | Definition | Text Role | Image Role |
|-------|------------|-----------|------------|
| **Text-dominant** | Text is primary, image supports | Headline, key message, detailed copy | Backdrop, mood-setter, secondary |
| **Balanced** | Text and image share weight | Title + context, integrated with visual | Equal storytelling partner |
| **Image-dominant** | Image is primary, minimal text | Caption only, or watermark | The message IS the image |

**Balance Decision:**
- Would this work without the image? → Text-dominant
- Do text and image equally drive the message? → Balanced
- Would this work without text (or nearly so)? → Image-dominant

---

### 3. Visual Style

The aesthetic treatment of imagery.

| Value | Definition | Characteristics |
|-------|------------|-----------------|
| **Photorealistic** | Photography or photorealistic renders | Real-world scenes, people, products, places |
| **Illustrated** | Hand-drawn, digital illustration, stylized | Artistic interpretation, stylized scenes, conceptual imagery |
| **Diagrammatic** | Charts, graphs, flowcharts, technical visuals | Data visualization, process flows, system diagrams |

**Style Decision:**
- Is real-world imagery important (people, places, products)? → Photorealistic
- Is artistic interpretation or stylization the point? → Illustrated
- Is data, process, or system the point? → Diagrammatic

---

### 4. Format

Static or sequential.

| Value | Definition | Use Case |
|-------|------------|----------|
| **Static** | Single image | Most social posts, hero images, one-off graphics |
| **Sequential** | Multi-panel carousel or series | Storytelling, tutorials, multi-point explanations |

---

## Common Dimensional Combinations

### Single-focus + Text-dominant + Photorealistic
**"Bold text over photo"**
- Hero image with overlay headline
- Mood-setting background with message
- Example: Inspirational quote over landscape photo

### Single-focus + Balanced + Photorealistic
**"Photo with integrated text"**
- Product shot with feature callout
- Portrait with bio text
- Example: Team member spotlight

### Single-focus + Image-dominant + Photorealistic
**"Hero photo"**
- Minimal or no text
- Image tells the story
- Example: Event photo, product beauty shot

### Single-focus + Balanced + Illustrated
**"Hero illustration"**
- Stylized scene with integrated message
- Conceptual artwork with title
- Example: Blog post header, concept visualization

### Single-focus + Image-dominant + Illustrated
**"Art piece"**
- Artistic expression as the content
- Caption/signature only
- Example: Portfolio piece, artistic post

### Sectioned + Text-dominant + Illustrated
**"Illustrated explainer"**
- Multiple text sections with supporting illustrations
- Icons or small visuals per section
- Example: How-to with step illustrations

### Sectioned + Balanced + Photorealistic
**"Before/After" or "Comparison with photos"**
- Two or more photo zones
- Text labels/context for each
- Example: Transformation reveal, A/B comparison

### Sectioned + Balanced + Illustrated
**"Visual narrative" (Your Ukiyo-e example)**
- Multiple illustrated scenes/zones
- Text integrated throughout
- Example: Decision framework, journey visualization

### Sectioned + Balanced + Diagrammatic
**"Infographic"**
- Charts, flows, or diagrams
- Explanatory text integrated
- Example: Data story, process explanation

### Sectioned + Image-dominant + Diagrammatic
**"Dashboard" or "Data visualization"**
- Multiple charts/graphs
- Minimal labeling
- Example: Performance summary, analytics snapshot

---

## Applying Taste Schema to Dimensional Images

### Color System
Pull directly from `taste_schema.visual_dimensions.color_system`:
- Primary colors → dominant visual elements
- Secondary colors → supporting elements
- Accent colors → emphasis, CTAs, highlights
- Respect `forbidden_colors`

### Typography
Pull from `taste_schema.visual_dimensions.typography_system`:
- Heading style for titles
- Body style for supporting text
- Hierarchy patterns for multi-level text

### Imagery Style
If taste schema has visual data:
- Match `illustration_style` or `photography_style`
- Honor `recurring_motifs` where appropriate
- Apply `texture_preferences`

If taste schema visual dimensions are low-confidence:
- Derive visual style from textual emotional signature
- Match energy level and mood to voice

### Voice Alignment
Beyond visuals, ensure the image "feels" like the voice:
- Text follows voice patterns (sentence structure, vocabulary)
- Emotional register matches `essence.emotional_signature`
- Anti-patterns from taste schema are avoided

---

## Section Design for Dimensional Images

For Sectioned compositions, plan zones deliberately:

**Vertical flow (9:16, stories):**
```
┌─────────────────┐
│     Header      │ 15-20%
├─────────────────┤
│                 │
│   Main Zone     │ 50-60%
│                 │
├─────────────────┤
│     Footer      │ 20-25%
└─────────────────┘
```

**Horizontal split (16:9, landscape):**
```
┌──────────┬──────────┐
│          │          │
│  Left    │  Right   │
│          │          │
└──────────┴──────────┘
```

**Grid (1:1, complex):**
```
┌─────────────────┐
│     Header      │
├────────┬────────┤
│ Cell 1 │ Cell 2 │
├────────┼────────┤
│ Cell 3 │ Cell 4 │
└────────┴────────┘
```

Each section needs:
- **id**: Unique name
- **purpose**: Why this section exists
- **zone**: Where it lives on canvas
- **heading/body_text**: Text content (empty string if none)
- **visual_elements**: List of visual components
- **visual_description**: Detailed imagery description for generation
- **mood**: Emotional register for this section

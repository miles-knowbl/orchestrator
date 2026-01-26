# Retrospective: Orchestrator Deck

**Loop:** deck-loop v1.0.0
**Date:** 2026-01-26
**Facilitator:** Claude (agentic execution)
**Scenario:** Presenting Orchestrator to a 6-person DevEx team evaluating adoption

---

## Summary

| Metric | Value |
|--------|-------|
| Phases Completed | 6/6 |
| Gates Passed | 5/5 |
| Skills Applied | 7 (context-ingestion, taste-schema, deck-text-schema, deck-image-schema, content-analysis, pptx, retrospective) |
| Deliverables Produced | 9 files |
| Sources Processed | 14 |
| Slides Generated | 12 |
| Quality Score | 91/100 |
| Issues Found | 3 (all low severity) |
| Style Iterations | 2 (v1 functional → v2 bold geometry) |
| Final File Size | 393 KB |

**One-line summary:** The deck loop produced a 12-slide presentation from raw codebase to styled .pptx in a single session, with a mid-stream visual redesign driven by user feedback.

---

## What Worked Well

### 1. Six-Phase Pipeline with Human Gates

**Evidence:**
- All 5 gates approved on first attempt — no rework between phases
- Each gate gave the user a natural review point without overwhelming them
- The quality-gate (after VALIDATE) caught 3 issues before rendering, all low-severity

**Why it worked:**
- Phase boundaries force completeness before moving forward
- Human gates at the right moments: after context, after taste, after composition, after quality, after render
- No wasted effort — content was validated before the expensive rendering step

**Keep doing:**
- VALIDATE before DOCUMENT (content-analysis caught issues early)
- Taste-gate before composition (prevented style rework)

### 2. Taste Schema as Design Contract

**Evidence:**
- taste-schema.json defined palette, typography, density, voice — all referenced by later phases
- deck-image-schema.json traced every color reference back to the palette
- Content-analysis audited brand alignment (95%) against the schema
- When the user requested restyling, the taste schema's constraints kept the redesign coherent

**Why it worked:**
- A taste schema creates a shared vocabulary between text and visual composition
- Brand alignment becomes auditable, not subjective
- Constraints (no stock photos, no animations, 30-40% whitespace) prevented common presentation anti-patterns

**Keep doing:**
- Taste schema as a gate-protected phase
- Brand alignment audit in content-analysis

### 3. Separation of Text and Visual Schemas

**Evidence:**
- deck-text-schema.json focused on narrative arc, speaker notes, pacing
- deck-image-schema.json focused on archetypes, layout zones, color placement
- This separation allowed independent review and made the composition-gate tractable

**Why it worked:**
- Text authors think in narrative arcs; visual designers think in layout zones
- Separate files prevent one concern from dominating the other
- Easier to audit: "is the story right?" is a different question from "is the layout right?"

**Keep doing:**
- Dual schemas in IMPLEMENT phase
- Different archetypes per slide (text-forward, diagram-forward, minimal)

### 4. pptxgenjs as Render Target

**Evidence:**
- Generated 12 slides programmatically with no manual PowerPoint editing
- Supported gradient fills, shapes, multi-zone layouts, speaker notes
- File output (393 KB) is portable — opens in PowerPoint, Keynote, Google Slides

**Why it worked:**
- Programmatic generation means the entire deck is reproducible from schemas
- JavaScript/Node ecosystem — no external dependencies beyond npm
- Direct .pptx output avoids conversion-quality issues

**Keep doing:**
- pptxgenjs for PowerPoint generation
- generate-deck.mjs as the render script

---

## What Didn't Work

### 1. Initial Visual Quality Was Too Plain

**Evidence:**
- v1 deck passed all quality gates but user immediately asked "how can we style it so it's unique and gorgeous"
- Required a full rewrite of generate-deck.mjs (v2 with bold geometry)
- v2 added ~40% more code and 39% more file size

**Root Cause Analysis (5 Whys):**

1. Why was v1 too plain?
   → The image schema specified layouts and colors but not decorative elements

2. Why didn't the image schema include decorative elements?
   → The taste schema prioritized "clean" and "engineering" aesthetics, which was interpreted as minimalist

3. Why was minimalist insufficient?
   → The user wanted the deck to stand out visually, not just be correct

4. Why didn't we anticipate this?
   → The taste-gate approval validated tone and palette but didn't show visual examples

5. Why weren't visual examples shown at taste-gate?
   → **The taste schema is text-only — no visual previews before rendering**

**Impact:** Medium — Required a full v2 rewrite, though the text content and narrative structure were preserved.

**Remediation:**
- Add "visual ambition level" to taste-schema (minimal / polished / bold)
- Consider a low-fidelity visual preview at taste-gate (even ASCII/text mockup of one slide)
- Include decorative element categories in the image schema (geometric accents, texture patterns, typography scale)

### 2. pptxgenjs API Discovery Was Trial-and-Error

**Evidence:**
- 3 runtime errors during v1 generation: ESM import, constructor pattern, hex color format
- ShapeType names had to be discovered via runtime inspection
- No TypeScript types available in .mjs context

**Root Cause Analysis (5 Whys):**

1. Why were there runtime errors?
   → pptxgenjs API has undocumented constraints (6-digit hex only, default export pattern)

2. Why weren't these constraints known upfront?
   → Documentation doesn't cover ESM usage patterns well

3. Why did we use .mjs instead of .ts?
   → Quick scripting approach — avoided TypeScript build step

4. Why not use TypeScript with tsx?
   → We ended up using tsx anyway after the ESM error

5. Why wasn't tsx the default from the start?
   → **No established pattern for pptx generation in the skills library**

**Impact:** Low — All errors were resolved within the session. But each error required a fix-and-retry cycle.

**Remediation:**
- Create a pptxgenjs reference doc with known constraints (hex format, import pattern, ShapeType names)
- Default to `npx tsx` for .mjs scripts that import npm packages
- Add the working import pattern to the pptx skill references

### 3. Icon Rendering Gap

**Evidence:**
- deck-image-schema.json specified 13 Lucide icons across 3 slides
- pptxgenjs cannot render SVG icons natively
- Icons were omitted from the final deck — replaced with text labels

**Root Cause Analysis (5 Whys):**

1. Why weren't icons rendered?
   → pptxgenjs doesn't support SVG embedding

2. Why did the schema specify icons that can't be rendered?
   → The image schema was designed for ideal visual output, not renderer constraints

3. Why wasn't this caught in VALIDATE?
   → Content-analysis flagged icon naming issues but not renderability

4. Why didn't content-analysis check renderability?
   → **The skill audits schema completeness, not renderer capability**

5. Why aren't renderer constraints documented?
   → No renderer capability profile exists

**Impact:** Low — The deck is readable without icons. But slides 7-9 lost some visual communication that icons would have provided.

**Remediation:**
- Create a renderer capability profile (what pptxgenjs can/can't do)
- Add renderability check to content-analysis skill
- Consider embedding pre-rendered icon PNGs as an alternative

---

## Root Cause Summary

| Issue | Root Cause | Category |
|-------|------------|----------|
| V1 too plain | Taste schema has no visual ambition level | Schema gap |
| pptxgenjs API errors | No reference doc for pptx generation | Knowledge gap |
| Icons not rendered | No renderer capability profile | Tool gap |

---

## Improvement Proposals

### Skill Amendments

| Skill | Amendment | Rationale | Priority |
|-------|-----------|-----------|----------|
| taste-schema | Add "visual ambition" dimension (minimal/polished/bold) | Prevent style mismatch at render time | P1 |
| deck-image-schema | Add decorative element categories | Make geometric accents, textures explicit in schema | P2 |
| content-analysis | Add renderer capability check | Catch unrenderable elements before rendering | P2 |
| pptx | Create reference doc with pptxgenjs constraints | Prevent recurring API discovery issues | P1 |

### Process Changes

| Change | Current | Proposed | Benefit |
|--------|---------|----------|---------|
| Visual ambition | Implicit (interpreted as minimal) | Explicit in taste-schema | Prevents v1-to-v2 rewrites |
| Renderer constraints | Unknown until runtime | Documented in reference doc | Fewer generation errors |
| Icon handling | Specified but unrenderable | Capability-aware schema or PNG fallback | Icons appear in final deck |

---

## Calibration Adjustments

| Factor | Observation | Adjustment |
|--------|-------------|------------|
| Phase count | 6 phases worked well for deck generation | Keep 6-phase structure |
| Gate count | 5 gates — all passed first attempt | Consider combining taste+composition gates for smaller decks |
| Style iteration | 1 major restyle after initial render | Add visual ambition to taste-gate to prevent |
| Slide count | 12 slides for 15 minutes | Good density — 75s average per slide |
| Generation time | Single script execution (~2s) | Fast enough, no optimization needed |

---

## New Patterns Identified

| Pattern | Context | Template Candidate? |
|---------|---------|---------------------|
| Taste schema as design contract | Visual + narrative identity defined before composition | Yes |
| Dual schema composition | Separate text and visual schemas composed independently | Yes |
| Gap-driven assembly | VALIDATE gaps → DOCUMENT fills them | Yes (inherited from proposal loop) |
| Style iteration on render | v1 render → user feedback → v2 restyle without content changes | Yes |
| Programmatic deck generation | Schema → pptxgenjs script → .pptx output | Yes |

#### Pattern Detail: Style Iteration on Render

**Context:** When the initial render is functionally correct but aesthetically insufficient
**Solution:** Keep text schemas unchanged, rewrite only the render script with new decorative elements and visual treatments. The separation of content (text-schema) from presentation (generate-deck.mjs) enables this.
**Example:** v1 was clean but plain. v2 added gradient bars, dot grids, bleed circles, oversized numbers — all without changing a single word of content.
**Codify as:** Reference doc in the pptx skill

---

## Deliverables Produced

| File | Phase | Purpose |
|------|-------|---------|
| `deck-state.json` | All | Loop state tracking |
| `CONTEXT-SOURCES.md` | INIT | Source inventory (14 sources) |
| `RAW-CONTEXT.md` | INIT | Extracted content |
| `taste-schema.json` | SCAFFOLD | Visual + narrative identity |
| `deck-text-schema.json` | IMPLEMENT | 12-slide text composition |
| `deck-image-schema.json` | IMPLEMENT | Per-slide visual specs |
| `CONTENT-ANALYSIS.md` | VALIDATE | Quality audit (91/100) |
| `generate-deck.mjs` | DOCUMENT | Render script (v2, bold geometry) |
| `Orchestrator-Deck.pptx` | DOCUMENT | Final presentation (12 slides, 393 KB) |
| `render-manifest.json` | DOCUMENT | Render results |

---

## Lessons Learned

- **Visual ambition must be explicit.** "Clean engineering aesthetic" and "unique and gorgeous" are different targets. The taste schema should capture ambition level, not just palette and fonts.
- **Separate content from rendering.** The dual-schema approach (text + visual) allowed a complete visual redesign without touching narrative content. This separation is the key enabler for style iteration.
- **Renderer constraints should be documented upfront.** Every runtime error during pptx generation was a pptxgenjs constraint that could have been known in advance. A reference doc would eliminate this class of errors.
- **Decorative elements are not decoration.** Dot grids, gradient bars, and oversized numbers transformed the deck from "correct" to "compelling." These elements should be first-class in the image schema, not afterthoughts.
- **Gates at the right altitude.** Content gates (context, composition, quality) protect substance. Render gates protect presentation. Both are necessary — they catch different classes of issues.

---

*Retrospective completed. Loop closed.*

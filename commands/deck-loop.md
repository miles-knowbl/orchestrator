# /deck-loop Command

**Single entry point for presentation creation.** Transforms discovery context and brand assets into polished slide decks through a structured 6-phase pipeline.

## Purpose

This command orchestrates the complete deck generation workflow: gathering context, extracting brand identity, composing slides, validating content quality, and rendering PowerPoint files — with human approval gates at every stage.

**The flow you want:** provide your topic, audience, and brand assets, say `go`, and the loop produces a polished `.pptx`.

## Usage

```
/deck-loop [--resume] [--phase=PHASE]
```

**Options:**
- `--resume`: Resume from existing deck-state.json
- `--phase=PHASE`: Start from specific phase (INIT | SCAFFOLD | IMPLEMENT | VALIDATE | DOCUMENT | COMPLETE)

## Input Discovery

When invoked, the loop gathers:

| Input | Required | Example |
|-------|----------|---------|
| **Topic/purpose** | Yes | "Q4 sales results for board" |
| **Audience** | Yes | "Executive board, non-technical" |
| **Brand assets** | Recommended | Logo, color palette, font, existing slides |
| **Source materials** | Recommended | Reports, data, images, prior decks |
| **Slide count preference** | Optional | "10-15 slides" or "auto" |
| **Tone** | Optional | "Professional but approachable" |

## Execution Flow

### Step 1: Cold Start Detection

```
if deck-state.json exists:
  → Show current phase, pending gates, progress
  → Ask: "Resume from {phase}? [Y/n]"
else:
  → Fresh start, gather inputs
```

### Step 2: Initialize State

Create `deck-state.json`:

```json
{
  "loop": "deck-loop",
  "version": "1.0.0",
  "phase": "INIT",
  "status": "active",
  "gates": {
    "context-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "taste-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "composition-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "quality-gate": { "status": "pending", "required": true, "approvalType": "human" },
    "render-gate": { "status": "pending", "required": true, "approvalType": "human" }
  },
  "phases": {
    "INIT": { "status": "pending", "skills": ["context-ingestion"] },
    "SCAFFOLD": { "status": "pending", "skills": ["taste-schema"] },
    "IMPLEMENT": { "status": "pending", "skills": ["deck-text-schema", "deck-image-schema"] },
    "VALIDATE": { "status": "pending", "skills": ["content-analysis"] },
    "DOCUMENT": { "status": "pending", "skills": ["pptx"] },
    "COMPLETE": { "status": "pending", "skills": ["retrospective"] }
  },
  "started_at": "ISO-timestamp",
  "last_updated": "ISO-timestamp"
}
```

### Step 3: Execute Phases

```
INIT ──────────► SCAFFOLD ──────────► IMPLEMENT
  │                │                     │
  │ [context-gate] │ [taste-gate]        │ [composition-gate]
  │  human         │  human              │  human
  ▼                ▼                     ▼
context-ingestion taste-schema        deck-text-schema
                                      deck-image-schema

  ▼                  ▼                    ▼

VALIDATE ──────────► DOCUMENT ──────────► COMPLETE
  │                    │
  │ [quality-gate]     │ [render-gate]
  │  human             │  human
  ▼                    ▼
content-analysis     pptx              retrospective
```

**7 skills across 6 phases, 5 human gates**

### Step 4: Gate Enforcement

Five gates control progression — all require human approval:

| Gate | After Phase | Blocks Until | Deliverables |
|------|-------------|--------------|-------------|
| `context-gate` | INIT | User says `approved` | CONTEXT-SOURCES.md, RAW-CONTEXT.md |
| `taste-gate` | SCAFFOLD | User says `approved` | taste-schema.json |
| `composition-gate` | IMPLEMENT | User says `approved` | deck-text-schema.json, deck-image-schema.json |
| `quality-gate` | VALIDATE | User says `approved` | CONTENT-ANALYSIS.md |
| `render-gate` | DOCUMENT | User says `approved` | *.pptx, render-manifest.json |

**Gate presentation:**
```
═══════════════════════════════════════════════════════════════
║  CONTEXT GATE                                               ║
║                                                             ║
║  CONTEXT-SOURCES.md and RAW-CONTEXT.md ready for review.    ║
║  8 sources processed, 3 categories covered.                 ║
║                                                             ║
║  Commands:                                                  ║
║    approved     — Pass gate, continue to SCAFFOLD           ║
║    changes: ... — Request modifications                     ║
║    show context — Display RAW-CONTEXT.md                    ║
║    show sources — Display CONTEXT-SOURCES.md                ║
═══════════════════════════════════════════════════════════════
```

### Step 5: Loop Completion

After COMPLETE phase:
1. Run retrospective skill → RETROSPECTIVE.md
2. Present summary: slides generated, quality score, brand alignment
3. Output final .pptx file location

## Skill Execution Details

### INIT: Context Ingestion
- **Skill**: `context-ingestion`
- **Input**: Topic description, source materials (docs, data, prior decks, brand guidelines)
- **Output**: CONTEXT-SOURCES.md (source inventory), RAW-CONTEXT.md (extracted content)
- **What it does**: Catalogs all sources with IDs, extracts facts/data/quotes, identifies gaps

### SCAFFOLD: Brand Identity Extraction
- **Skill**: `taste-schema`
- **Input**: Brand assets (logo, colors, fonts, existing materials)
- **Output**: taste-schema.json
- **What it does**: Extracts 12 visual dimensions (color harmony, typography, shape language, etc.) and 8 narrative dimensions (voice, tone, complexity, pace, etc.) with confidence scoring

### IMPLEMENT: Slide Composition
- **Skill 1**: `deck-text-schema` (runs first)
  - **Input**: RAW-CONTEXT.md + taste-schema.json
  - **Output**: deck-text-schema.json
  - **What it does**: Determines slide count, defines narrative arc (opening/development/closing), structures each slide with title, purpose, content, voice alignment

- **Skill 2**: `deck-image-schema` (runs after text schema)
  - **Input**: deck-text-schema.json + taste-schema.json
  - **Output**: deck-image-schema.json
  - **What it does**: Classifies each slide (text-forward archetype vs image-forward dimensional), defines visual zones, generates image prompts, specifies treatments

### VALIDATE: Content Quality
- **Skill**: `content-analysis`
- **Input**: All deliverables from prior phases
- **Output**: CONTENT-ANALYSIS.md
- **What it does**: Audits text completeness, image requirement coverage, brand alignment, identifies gaps with resolution strategies, produces quality score

### DOCUMENT: PowerPoint Rendering
- **Skill**: `pptx`
- **Input**: deck-text-schema.json + deck-image-schema.json + generated images
- **Output**: *.pptx + render-manifest.json
- **What it does**: Converts schemas to PowerPoint using HTML intermediate format, applies CSS design system, places images, handles 15+ layout templates

### COMPLETE: Retrospective
- **Skill**: `retrospective`
- **Output**: RETROSPECTIVE.md
- **What it does**: Analyzes what worked, what didn't, root causes, improvement proposals

## Commands During Execution

| Command | Action |
|---------|--------|
| `go` | Continue execution / proceed to next phase |
| `status` | Show current phase, gate status, progress |
| `approved` | Pass current gate |
| `changes: [feedback]` | Request changes at gate |
| `pause` | Stop after current skill |
| `skip [skill]` | Skip a skill (requires reason) |
| `show [deliverable]` | Display a deliverable |
| `phase [name]` | Jump to specific phase |

## State Files

| File | Purpose |
|------|---------|
| `deck-state.json` | Current phase, gate status, progress |
| `CONTEXT-SOURCES.md` | Source inventory with IDs |
| `RAW-CONTEXT.md` | Extracted content from all sources |
| `taste-schema.json` | Brand visual + narrative identity |
| `deck-text-schema.json` | Slide structure and narrative arc |
| `deck-image-schema.json` | Per-slide visual specifications |
| `CONTENT-ANALYSIS.md` | Quality audit and gap analysis |
| `render-manifest.json` | Per-slide render pass/fail |
| `RETROSPECTIVE.md` | Loop learnings |

## Example Session

```
User: /deck-loop

Deck Loop v1.0.0: Starting deck generation...

  No existing deck state found.

  What are we creating?

User: Q4 2025 sales results presentation for the executive board.
      Brand assets are in /assets/brand/.
      Source data in /data/q4-results.xlsx and /docs/q4-narrative.md.
      10-12 slides, professional tone.

Deck Loop: Initializing...

  ═══════════════════════════════════════════════════════
  ║  READY — Deck Loop v1.0.0                          ║
  ║                                                     ║
  ║  Topic: Q4 2025 Sales Results                       ║
  ║  Audience: Executive Board                          ║
  ║  Phases: 6                                          ║
  ║  Gates: context → taste → composition →             ║
  ║         quality → render                            ║
  ║                                                     ║
  ║  Say 'go' to begin.                                 ║
  ═══════════════════════════════════════════════════════

User: go

Deck Loop: Starting INIT phase...

  [1/1] context-ingestion → Gathering sources...
        ✓ CONTEXT-SOURCES.md (4 sources cataloged)
        ✓ RAW-CONTEXT.md (revenue data, team metrics, narrative)

  ✓ INIT phase complete

  ═══════════════════════════════════════════════════════
  ║  CONTEXT GATE                                       ║
  ║                                                     ║
  ║  4 sources processed across 2 categories.           ║
  ║  Key data: revenue, team performance, outlook.      ║
  ║                                                     ║
  ║  Say 'approved' to continue to SCAFFOLD.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: context-gate ✓

Deck Loop: Starting SCAFFOLD phase...

  [1/1] taste-schema → Extracting brand identity...
        ✓ taste-schema.json
          12 visual dimensions (confidence: 0.88)
          8 narrative dimensions (confidence: 0.91)
          Primary palette: #1A2B5E, #4A90D9, #F5F7FA

  ✓ SCAFFOLD phase complete

  ═══════════════════════════════════════════════════════
  ║  TASTE GATE                                         ║
  ║                                                     ║
  ║  Brand identity extracted.                          ║
  ║  Overall confidence: 0.89                           ║
  ║                                                     ║
  ║  Say 'approved' to continue to IMPLEMENT.           ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: taste-gate ✓

Deck Loop: Starting IMPLEMENT phase...

  [1/2] deck-text-schema → Composing slides...
        ✓ deck-text-schema.json
          11 slides, 3-act narrative arc
          Opening: title + agenda
          Development: revenue, segments, team, pipeline
          Closing: outlook + Q&A

  [2/2] deck-image-schema → Defining visuals...
        ✓ deck-image-schema.json
          6 text-forward slides (stat callout, list post)
          5 image-forward slides (charts, team photos)
          11 image generation prompts created

  ✓ IMPLEMENT phase complete

  ═══════════════════════════════════════════════════════
  ║  COMPOSITION GATE                                   ║
  ║                                                     ║
  ║  11 slides composed with visual specs.              ║
  ║  Narrative arc: results → analysis → outlook.       ║
  ║                                                     ║
  ║  Say 'approved' to continue to VALIDATE.            ║
  ═══════════════════════════════════════════════════════

User: approved

  Gate passed: composition-gate ✓

  ...continues through VALIDATE → DOCUMENT → COMPLETE

  ═══════════════════════════════════════════════════════
  ║  DECK COMPLETE                                      ║
  ║                                                     ║
  ║  Output: Q4-2025-Sales-Results.pptx                 ║
  ║  Slides: 11                                         ║
  ║  Quality: 91/100                                    ║
  ║  Brand alignment: 0.89                              ║
  ║  Gates passed: 5/5                                  ║
  ═══════════════════════════════════════════════════════
```

## Resuming a Session

```
User: /deck-loop

Deck Loop v1.0.0: Found existing deck state.

  Phase: IMPLEMENT (in progress)

  Completed:
    ✓ INIT
    ✓ SCAFFOLD

  Gates:
    ✓ context-gate (approved)
    ✓ taste-gate (approved)
    ○ composition-gate (pending)
    ○ quality-gate (pending)
    ○ render-gate (pending)

  Resume? [Y/n]:

User: go

Deck Loop: Resuming IMPLEMENT phase...
  [1/2] deck-text-schema → Composing slides...
```

## References

This command uses the **skills-library MCP server**. Fetch skill details via:

```
mcp__skills-library__get_skill(name: "skill-name", includeReferences: true)
```

Key references by skill:

| Skill | References |
|-------|-----------|
| taste-schema | visual-dimensions.md, narrative-dimensions.md |
| deck-text-schema | deck-format.md, slide-types.md |
| deck-image-schema | slide-archetypes.md, dimensional-mode.md |
| pptx | html2pptx.md, css-design-system.md, slide-rendering.md |

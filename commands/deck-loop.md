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

---

## Prerequisites (MUST DO FIRST)

**Before starting the loop, ensure the orchestrator server is running.**

### Step 1: Check Server Health

```bash
curl -s http://localhost:3002/health
```

**Expected response:** `{"status":"ok","timestamp":"...","version":"..."}`

### Step 2: If Server Not Running

If the health check fails, **DO NOT manually start the server**. The `ensure-orchestrator.sh` hook will automatically:

1. Open a new Terminal/iTerm window
2. Start the server there (with visible logs)
3. Wait for it to become healthy

**Just proceed to call an MCP tool** (like `start_execution`) — the hook triggers on any `mcp__orchestrator__*` call and handles server startup automatically.

**NEVER run `npm start &` in background.** The server needs its own Terminal window for persistent operation and log visibility.

---

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
  "version": "2.0.0",
  "phase": "INIT",
  "status": "active",

  "context": {
    "tier": "system",
    "organization": "personal",
    "system": "presentations",
    "module": null
  },

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
| `context-gate` | INIT | User says `approved` | CONTEXT-BRIEF.md |
| `taste-gate` | SCAFFOLD | User says `approved` | TASTE-SCHEMA.json |
| `composition-gate` | IMPLEMENT | User says `approved` | DECK-TEXT-SCHEMA.json, DECK-IMAGE-SCHEMA.json |
| `quality-gate` | VALIDATE | User says `approved` | QUALITY-REVIEW.md |
| `render-gate` | DOCUMENT | User says `approved` | output.pptx |

**Gate presentation (context-gate):**
```
═══════════════════════════════════════════════════════════════
║  CONTEXT GATE                                  [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 CONTEXT-BRIEF.md — Sources gathered, audience ID'd    ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Sources gathered: 8                                    ║
║    ✓ Audience identified: Executive Board                   ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to SCAFFOLD          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (taste-gate):**
```
═══════════════════════════════════════════════════════════════
║  TASTE GATE                                    [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 TASTE-SCHEMA.json — Brand palette, typography, layout ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Brand palette: extracted                               ║
║    ✓ Typography: matched                                    ║
║    ✓ Layout rules: defined                                  ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to IMPLEMENT         ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (composition-gate):**
```
═══════════════════════════════════════════════════════════════
║  COMPOSITION GATE                              [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 DECK-TEXT-SCHEMA.json — Slide text and structure      ║
║    📄 DECK-IMAGE-SCHEMA.json — Visual specs per slide       ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Slides composed: 11                                    ║
║    ✓ Narrative flow: 3-act arc                              ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to VALIDATE          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (quality-gate):**
```
═══════════════════════════════════════════════════════════════
║  QUALITY GATE                                  [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 QUALITY-REVIEW.md — Content accuracy, brand check     ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Content accuracy: verified                             ║
║    ✓ Brand compliance: aligned                              ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to DOCUMENT          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
═══════════════════════════════════════════════════════════════
```

**Gate presentation (render-gate):**
```
═══════════════════════════════════════════════════════════════
║  RENDER GATE                                   [HUMAN]     ║
║                                                             ║
║  Deliverables:                                              ║
║    📄 output.pptx — Final rendered presentation             ║
║                                                             ║
║  Summary:                                                   ║
║    ✓ Slide count: 11                                        ║
║    ✓ File size: 2.4 MB                                      ║
║                                                             ║
║  Commands:                                                  ║
║    approved      — Pass gate, continue to COMPLETE          ║
║    changes: ...  — Request modifications                    ║
║    show [file]   — Display a deliverable                    ║
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

══════════════════════════════════════
  INIT                           [1/6]
══════════════════════════════════════

  ┌─ context-ingestion
  │  Gathering sources...
  │  Cataloging 4 sources across 2 categories...
  │  Extracting facts, data, and quotes...
  │
  │  Output:
  │    📄 CONTEXT-BRIEF.md — 4 sources, audience identified
  └─ ✓ context-ingestion complete

  ✓ INIT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  CONTEXT GATE                                  [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 CONTEXT-BRIEF.md — Sources gathered, audience ID'd    ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Sources gathered: 4                                    ║
  ║    ✓ Audience identified: Executive Board                   ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to SCAFFOLD          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: context-gate ✓

══════════════════════════════════════
  SCAFFOLD                       [2/6]
══════════════════════════════════════

  ┌─ taste-schema
  │  Extracting brand identity...
  │  Analyzing visual dimensions...
  │  Analyzing narrative dimensions...
  │
  │  Output:
  │    📄 TASTE-SCHEMA.json — Brand identity extracted
  │       12 visual dimensions (confidence: 0.88)
  │       8 narrative dimensions (confidence: 0.91)
  │       Primary palette: #1A2B5E, #4A90D9, #F5F7FA
  └─ ✓ taste-schema complete

  ✓ SCAFFOLD complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  TASTE GATE                                    [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 TASTE-SCHEMA.json — Brand palette, typography, layout ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Brand palette: extracted                               ║
  ║    ✓ Typography: matched                                    ║
  ║    ✓ Layout rules: defined                                  ║
  ║    ✓ Overall confidence: 0.89                               ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to IMPLEMENT         ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: taste-gate ✓

══════════════════════════════════════
  IMPLEMENT                      [3/6]
══════════════════════════════════════

  ┌─ deck-text-schema
  │  Composing slides...
  │  Building narrative arc...
  │  Structuring 11 slides across 3 acts...
  │
  │  Output:
  │    📄 DECK-TEXT-SCHEMA.json — 11 slides, 3-act arc
  │       Opening: title + agenda
  │       Development: revenue, segments, team, pipeline
  │       Closing: outlook + Q&A
  └─ ✓ deck-text-schema complete

  ┌─ deck-image-schema
  │  Defining visuals per slide...
  │  Classifying slide archetypes...
  │  Generating image prompts...
  │
  │  Output:
  │    📄 DECK-IMAGE-SCHEMA.json — 11 visual specs
  │       6 text-forward slides (stat callout, list post)
  │       5 image-forward slides (charts, team photos)
  │       11 image generation prompts created
  └─ ✓ deck-image-schema complete

  ✓ IMPLEMENT complete (2 skills, 2 deliverables)

  ═══════════════════════════════════════════════════════════════
  ║  COMPOSITION GATE                              [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 DECK-TEXT-SCHEMA.json — Slide text and structure      ║
  ║    📄 DECK-IMAGE-SCHEMA.json — Visual specs per slide       ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Slides composed: 11                                    ║
  ║    ✓ Narrative flow: 3-act arc                              ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to VALIDATE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: composition-gate ✓

══════════════════════════════════════
  VALIDATE                       [4/6]
══════════════════════════════════════

  ┌─ content-analysis
  │  Auditing text completeness...
  │  Checking image requirement coverage...
  │  Verifying brand alignment...
  │
  │  Output:
  │    📄 QUALITY-REVIEW.md — Quality score: 91/100
  └─ ✓ content-analysis complete

  ✓ VALIDATE complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  QUALITY GATE                                  [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 QUALITY-REVIEW.md — Content accuracy, brand check     ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Content accuracy: verified                             ║
  ║    ✓ Brand compliance: aligned                              ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to DOCUMENT          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: quality-gate ✓

══════════════════════════════════════
  DOCUMENT                       [5/6]
══════════════════════════════════════

  ┌─ pptx
  │  Converting schemas to PowerPoint...
  │  Applying CSS design system...
  │  Placing images across 11 slides...
  │
  │  Output:
  │    📄 output.pptx — 11 slides, 2.4 MB
  └─ ✓ pptx complete

  ✓ DOCUMENT complete (1 skill, 1 deliverable)

  ═══════════════════════════════════════════════════════════════
  ║  RENDER GATE                                   [HUMAN]     ║
  ║                                                             ║
  ║  Deliverables:                                              ║
  ║    📄 output.pptx — Final rendered presentation             ║
  ║                                                             ║
  ║  Summary:                                                   ║
  ║    ✓ Slide count: 11                                        ║
  ║    ✓ File size: 2.4 MB                                      ║
  ║                                                             ║
  ║  Commands:                                                  ║
  ║    approved      — Pass gate, continue to COMPLETE          ║
  ║    changes: ...  — Request modifications                    ║
  ║    show [file]   — Display a deliverable                    ║
  ═══════════════════════════════════════════════════════════════

User: approved

  Gate passed: render-gate ✓

══════════════════════════════════════
  COMPLETE                       [6/6]
══════════════════════════════════════

  ┌─ retrospective
  │  Reviewing loop execution...
  │  Analyzing what worked and what didn't...
  └─ ✓ RETROSPECTIVE.md

  ✓ COMPLETE (1 skill, 1 deliverable)

╔═════════════════════════════════════════════════════════════════════╗
║                                                                     ║
║   DECK LOOP COMPLETE                                                ║
║                                                                     ║
╠═════════════════════════════════════════════════════════════════════╣
║                                                                     ║
║   PHASES                                                            ║
║   ──────                                                            ║
║   ✓ INIT        Context gathered from 4 sources                     ║
║   ✓ SCAFFOLD    Brand identity extracted (confidence: 0.89)         ║
║   ✓ IMPLEMENT   11 slides composed with visual specs                ║
║   ✓ VALIDATE    Content quality verified (91/100)                   ║
║   ✓ DOCUMENT    PowerPoint rendered (2.4 MB)                        ║
║   ✓ COMPLETE    Retrospective captured                              ║
║                                                                     ║
║   GATES PASSED                                                      ║
║   ────────────                                                      ║
║   ✓ Context Gate [HUMAN]                                            ║
║   ✓ Taste Gate [HUMAN]                                              ║
║   ✓ Composition Gate [HUMAN]                                        ║
║   ✓ Quality Gate [HUMAN]                                            ║
║   ✓ Render Gate [HUMAN]                                             ║
║                                                                     ║
║   DELIVERABLES                                                      ║
║   ────────────                                                      ║
║   📄 CONTEXT-BRIEF.md        Sources and audience brief             ║
║   📄 TASTE-SCHEMA.json       Brand identity schema                  ║
║   📄 DECK-TEXT-SCHEMA.json   Slide text and narrative arc           ║
║   📄 DECK-IMAGE-SCHEMA.json  Visual specifications                  ║
║   📄 QUALITY-REVIEW.md       Content quality audit                  ║
║   📄 output.pptx             Final presentation (11 slides)         ║
║   📄 RETROSPECTIVE.md        Loop retrospective                     ║
║                                                                     ║
║   OUTPUT                                                            ║
║   ──────                                                            ║
║   📄 Q4-2025-Sales-Results.pptx                                     ║
║   Slides: 11  |  Quality: 91/100  |  Brand: 0.89                   ║
║                                                                     ║
╚═════════════════════════════════════════════════════════════════════╝
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
    ✓ context-gate [HUMAN] (approved)
    ✓ taste-gate [HUMAN] (approved)
    ○ composition-gate [HUMAN] (pending)
    ○ quality-gate [HUMAN] (pending)
    ○ render-gate [HUMAN] (pending)

  Resume? [Y/n]:

User: go

Deck Loop: Resuming IMPLEMENT phase...

══════════════════════════════════════
  IMPLEMENT                      [3/6]
══════════════════════════════════════

  ┌─ deck-text-schema
  │  Composing slides...
```

## References

This command uses the **skills-library MCP server**. Fetch skill details via:

```
mcp__orchestrator__get_skill(name: "skill-name", includeReferences: true)
```

Key references by skill:

| Skill | References |
|-------|-----------|
| taste-schema | visual-dimensions.md, narrative-dimensions.md |
| deck-text-schema | deck-format.md, slide-types.md |
| deck-image-schema | slide-archetypes.md, dimensional-mode.md |
| pptx | html2pptx.md, css-design-system.md, slide-rendering.md |

---

## MCP Execution Protocol (REQUIRED for Slack Notifications)

**CRITICAL: All loop executions MUST be tracked through the MCP server to enable Slack thread notifications and execution history.**

### On Loop Start

When the loop begins, call:

```
mcp__orchestrator__start_execution({
  loopId: "deck-loop",
  project: "[presentation name]"
})
```

**Store the returned `executionId`** — you'll need it for all subsequent calls.

### Pre-Loop Context Loading (MANDATORY)

**CRITICAL: Before proceeding with any phase, you MUST process the `preLoopContext` returned by start_execution.**

The response includes:
```json
{
  "executionId": "...",
  "preLoopContext": {
    "requiredDeliverables": [
      { "phase": "DESIGN", "skill": "deck-design", "deliverables": ["DECK-SPEC.md"] }
    ],
    "skillGuarantees": [
      { "skill": "deck-design", "guaranteeCount": 3, "guaranteeNames": ["..."] }
    ],
    "dreamStatePath": ".claude/DREAM-STATE.md",
    "roadmapPath": "ROADMAP.md"
  }
}
```

**You MUST:**
1. **Read the Dream State** (if `dreamStatePath` provided) — understand the vision and checklist
2. **Read the ROADMAP** (if `roadmapPath` provided) — see available next moves for completion proposal
3. **Note all required deliverables** — know what each skill must produce
4. **Note guarantee counts** — understand what will be validated

**DO NOT proceed to DESIGN phase until you have loaded this context.** Skipping this step causes poor loop execution (missing deliverables, no completion proposal, etc.).

### During Execution

**After completing each skill**, call:
```
mcp__orchestrator__complete_skill({
  executionId: "[stored executionId]",
  skillId: "[skill name]",
  deliverables: ["deck.pptx"]  // optional
})
```

**After completing all skills in a phase**, call:
```
mcp__orchestrator__complete_phase({ executionId: "[stored executionId]" })
```

### At Gates

**When user approves a gate**, call:
```
mcp__orchestrator__approve_gate({
  executionId: "[stored executionId]",
  gateId: "[gate name]",
  approvedBy: "user"
})
```

### Phase Transitions

**To advance to the next phase**, call:
```
mcp__orchestrator__advance_phase({ executionId: "[stored executionId]" })
```

### Why This Matters

Without MCP execution tracking:
- No Slack notifications (thread-per-execution)
- No execution history
- No calibration data collection

---

## Clarification Protocol

This loop follows the **Deep Context Protocol**. Before proceeding past INIT:

1. **Probe relentlessly** — Ask 5-10+ questions about the presentation
2. **Surface assumptions** — "I'm assuming a formal tone for this audience — correct?"
3. **Gather context** — Who's the audience? What's the goal? What action should they take?
4. **Don't stop early** — Keep asking until the story and style are clear

At every phase transition and gate, pause to ask:
- "Does this narrative arc match your vision?"
- "Any slides I should add/remove/reorder?"
- "Ready to proceed with this design?"

See `commands/_shared/clarification-protocol.md` for detailed guidance.

---

## Context Hierarchy

This loop operates within the **Organization → System → Module** hierarchy:

| Tier | Scope | Dream State Location |
|------|-------|---------------------|
| **Organization** | All systems across workspace | `~/.claude/DREAM-STATE.md` |
| **System** | This repository/application | `{repo}/.claude/DREAM-STATE.md` |
| **Module** | Specific concern within system | `{repo}/{path}/.claude/DREAM-STATE.md` or inline |

### Context Loading (Automatic on Init)

When this loop initializes, it automatically loads:

```
1. Organization Dream State (~/.claude/DREAM-STATE.md)
   └── Org-wide vision, active systems, master checklist

2. System Dream State ({repo}/.claude/DREAM-STATE.md)
   └── System vision, modules, progress checklist

3. Recent Runs (auto-injected via query_runs)
   └── Last 3-5 relevant runs for context continuity

4. Memory (patterns, calibration)
   └── Learned patterns from all applicable tiers
```

---

## On Completion

When this loop reaches COMPLETE phase and finishes:

### 1. Archive Run (Full Artifacts)

**Location:** `~/.claude/runs/{year-month}/{project}-deck-loop-{timestamp}/`

Create a directory containing ALL loop artifacts:

```bash
ARCHIVE_DIR=~/.claude/runs/$(date +%Y-%m)/${PROJECT}-deck-loop-$(date +%Y%m%d-%H%M)
mkdir -p "$ARCHIVE_DIR"

mv deck-state.json "$ARCHIVE_DIR/" 2>/dev/null || true
cp CONTEXT-SOURCES.md RAW-CONTEXT.md CONTEXT-BRIEF.md \
   taste-schema.json deck-text-schema.json deck-image-schema.json \
   QUALITY-REVIEW.md CONTENT-ANALYSIS.md render-manifest.json \
   RETROSPECTIVE.md \
   "$ARCHIVE_DIR/" 2>/dev/null || true
```

**Artifact organization:**
| Category | Location | Files |
|----------|----------|-------|
| **Permanent** | Project root | `output.pptx` (final presentation) |
| **Transient** | `~/.claude/runs/` | All schema files, review docs, `deck-state.json` |

### 2. Update Dream State

At the System level (`{repo}/.claude/DREAM-STATE.md`):
- Update "Recent Completions" section
- Note presentation created

### 3. Commit All Artifacts

**Principle:** A completed loop leaves no orphaned files.

```bash
git add -A
git diff --cached --quiet || git commit -m "Deck complete: [description]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Note:** This step commits but does NOT push. Use `/distribution-loop` to push to remote and trigger CI/CD.

### 4. Clean Project Directory

Remove transient artifacts that have been archived:

```bash
rm -f CONTEXT-SOURCES.md RAW-CONTEXT.md CONTEXT-BRIEF.md \
      taste-schema.json deck-text-schema.json deck-image-schema.json \
      QUALITY-REVIEW.md CONTENT-ANALYSIS.md render-manifest.json \
      RETROSPECTIVE.md deck-state.json 2>/dev/null || true
```

**Result:** Next `/deck-loop` invocation starts fresh with context gathering.

### 5. Leverage Proposal (REQUIRED)

Before showing completion, evaluate and propose the next highest leverage move.

See `commands/_shared/leverage-protocol.md` for full details.

**Output:**
```
══════════════════════════════════════════════════════════════
  NEXT HIGHEST LEVERAGE MOVE

  Recommended: /{loop} → {target}
  Value Score: X.X/10

  Say 'go' to start, or specify a different loop.
══════════════════════════════════════════════════════════════
```

### 5. Completion Message

```
══════════════════════════════════════════════════════════════
  Run archived: ~/.claude/runs/2025-01/presentations-deck-loop-29T14-30.json
  Dream State updated: .claude/DREAM-STATE.md

  Next invocation will start fresh.
══════════════════════════════════════════════════════════════
```

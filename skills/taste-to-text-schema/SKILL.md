---
name: taste-to-text-schema
description: "Derives a fully-specified text schema from a taste schema + topic. Use when: (1) Writing threads or articles aligned to a voice, (2) Creating social media content or blog posts that maintain voice consistency, (3) Generating content outlines with voice-aware structure. Input: taste schema JSON + topic/message. Output: text schema JSON with complete content or detailed outline. Every output includes a companion micro-post (140 chars) for sharing."
phase: IMPLEMENT
category: content
version: "1.0.0"
depends_on: [taste-codifier]
tags: [specialized, text, writing, schema, content-generation]
---

# Taste to Text Schema

Takes a taste schema (from taste-codifier) plus a topic or message, and produces a fully-specified text schema with ready-to-publish content.

## Inputs Required

1. **Taste schema** — JSON file from taste-codifier skill
2. **Topic/message** — What the text should be about
3. **Optional context:**
   - Target platform (Twitter, LinkedIn, Substack, blog, etc.)
   - Specific length requirements
   - Audience information beyond what's in taste schema

## Output Formats

Two formats, both include a companion micro-post:

| Format | Description | Micro-post Role |
|--------|-------------|-----------------|
| **Thread** | Sequence of micro-posts | First post IS the hook micro-post |
| **Article** | Unified piece (short/medium/long) | Companion post for sharing with link |

## Workflow

### Step 1: Determine Format

**Thread** when:
- Platform is Twitter/X
- Content naturally breaks into atomic units
- Engagement/shareability is priority
- <2000 words total content

**Article** when:
- Platform is blog, newsletter, LinkedIn article, etc.
- Content needs unified flow
- Depth and development are priority
- Any length

### Step 2: Configure Dimensions

All four dimensions apply to both formats:

| Dimension | Options | Question to Ask |
|-----------|---------|-----------------|
| **Structure** | `linear` · `sectioned` · `narrative` | How should it be organized? |
| **Purpose** | `inform` · `persuade` · `teach` · `provoke` | What should it accomplish? |
| **Audience expertise** | `novice` · `general` · `expert` | How much do they already know? |
| **Evidence style** | `data_driven` · `story_driven` · `assertion` | How will claims be supported? |

**Format-specific:**
- Thread: `post_count` (3-5, 6-10, 10+)
- Article: `length` (short <800w, medium 800-2500w, long 2500w+)

### Step 3: Define Intent

Extract from the topic:
- **title**: Working title
- **goal**: What it accomplishes (1-2 sentences)
- **audience**: Who reads this, in what context
- **core_message**: Single most important takeaway
- **emotional_target**: How reader should feel after
- **desired_action**: What reader should do/think/believe after

### Step 4: Write the Hook Micro-Post

The micro-post is the most important element. It must:
- Work in ≤140 characters
- Create curiosity
- Stand alone as complete thought
- For articles: include `[LINK]` placeholder

**Hook patterns (choose one):**
- Contrarian: Challenge conventional wisdom
- Curiosity gap: Promise valuable insight
- Story tease: Begin a narrative
- List promise: Enumerate what's coming
- Bold claim: Assertive statement

**Density requirement:** Every word must earn its place. Use meaning-dense words—specific numbers, concrete nouns, active verbs.

→ See `references/thread-format.md` or `references/article-format.md` for patterns

### Step 5: Build the Body

**For threads:**
Design each post:
- Post 1 = hook micro-post
- Posts 2 to N-1 = development (one beat per post)
- Final post = closer

Each post needs:
- `post_number`
- `purpose`
- `text` (≤280 chars)
- `character_count`
- `transition_from_previous`
- `voice_elements`

→ See `references/thread-format.md` for full guidance

**For articles:**
Design sections:
- Headline + subheadline
- Introduction
- Body sections (structured per dimension)
- Conclusion with closer

Each section needs:
- `section_id`
- `section_type` (intro, body, conclusion, callout, aside)
- `heading` (if sectioned structure)
- `content_summary` (for outline)
- `content_full` (the actual text)
- `purpose`
- `voice_elements`

→ See `references/article-format.md` for full guidance

### Step 6: Create Pull Quotes (Articles Only)

Extract 1-6 shareable quotes that:
- Stand completely alone
- Capture core insights
- Are ≤280 characters (tweetable)
- Sound quotable (rhythm, punch)

### Step 7: Design the Closer

| Type | Function | When to Use |
|------|----------|-------------|
| **CTA** | Direct action request | When you want specific behavior |
| **Reflection** | Synthesize takeaway | When insight is the point |
| **Callback** | Return to opening | When symmetry strengthens |
| **Open question** | Invite thinking | When you want discussion |
| **Challenge** | Push to act | When behavior change is goal |

### Step 8: Apply Taste Schema Voice

Pull from taste schema throughout:

**From `narrative_mechanics`:**
- Arc types (if telling a story)
- Specificity anchors (exact numbers, sensory details, proper nouns)

**From `rhetorical_signature`:**
- Analogies from their source domains
- Humor with correct function and timing
- Contrarian inversions

**From `emotional_architecture`:**
- Vulnerability formula (specific + past + overcome)
- Earned victories paired with struggle
- Gratitude with specific targets

**From `teaching_moves`:**
- Named frameworks (using their naming patterns)
- Advice inversions

**From `audience_relationship`:**
- Universal hooks (their language)
- Permission grants (in closer)

**From `signature_phrases`:**
- Opening moves
- Transition phrases
- Closing moves

### Step 9: Document Voice Alignment

Fill `voice_alignment` block with:
- Which taste elements were applied
- Narrative mechanics used (arcs, specificity)
- Rhetorical signature used (analogies, humor, inversions)
- Emotional architecture used (vulnerability, triumph, gratitude)
- Teaching moves used (frameworks, advice flips)
- Anti-patterns avoided

### Step 10: Add Metadata

- Target platform
- SEO considerations (if article)
- Hashtags (if applicable)
- Publication timing notes

## Output

Deliver as JSON file: `{topic-slug}-text-schema.json`

The output should be:
1. **Executable** — Content is complete and ready to publish (or detailed enough to draft from)
2. **Voice-aligned** — Traceable to taste schema decisions
3. **Self-contained** — All context needed to understand the piece

## Key Principles

**Micro-post is mandatory.** Every output includes a 140-char hook/companion post. This is the most important element.

**Voice-first.** Every choice traces back to taste schema. If you can't justify it from the schema, reconsider.

**Structure serves purpose.** Choose dimensions based on what the content needs to accomplish, not habit.

**Specificity is credibility.** Numbers, names, details. Pull from taste schema's specificity patterns.

## Example: Thread Classification

**Input:** Taste schema with story-driven evidence style + topic "lessons from failure"

**Output classification:**
```json
{
  "format": "thread",
  "dimensions": {
    "structure": "narrative",
    "purpose": "teach",
    "audience_expertise": "general",
    "evidence_style": "story_driven"
  },
  "format_specific": {
    "post_count": 7,
    "length": null
  }
}
```

## Example: Article Classification

**Input:** Taste schema + topic "framework for decision-making"

**Output classification:**
```json
{
  "format": "article",
  "dimensions": {
    "structure": "sectioned",
    "purpose": "teach",
    "audience_expertise": "general",
    "evidence_style": "assertion"
  },
  "format_specific": {
    "post_count": null,
    "length": "medium"
  }
}
```

## References

- `references/text-schema-structure.json`: Full JSON output schema
- `references/thread-format.md`: Thread-specific guidance
- `references/article-format.md`: Article-specific guidance

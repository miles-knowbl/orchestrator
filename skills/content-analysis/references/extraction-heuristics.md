# Extraction Heuristics Reference

Signal phrases, structural markers, and detection patterns for identifying extractable content.
Use this reference during structural decomposition and skill/pattern extraction to avoid missed extractions and false positives.

## Signal Phrases by Content Type

### Procedure Signals
These phrases indicate step-by-step instructions worth extracting.

| Signal | Strength | Example |
|--------|----------|---------|
| "Step N:" / "1. 2. 3." | Strong | Explicit numbered sequence |
| "First... then... finally..." | Strong | Temporal ordering of actions |
| "To [achieve X], [do Y]" | Strong | Goal-action structure |
| "Run the following..." | Strong | Direct imperative |
| "Make sure to..." | Moderate | Imperative with emphasis |
| "You will need to..." | Moderate | Future action framing |
| "The process involves..." | Moderate | Process description (may lack detail) |
| "It helps to..." | Weak | Suggestion, not procedure |

### Pattern Signals
These phrases indicate a recurring solution or structure worth cataloging.

| Signal | Strength | Example |
|--------|----------|---------|
| "A common approach is..." | Strong | Explicitly labeled as recurring |
| "This pattern..." / "The X pattern" | Strong | Named pattern reference |
| "We always..." / "We typically..." | Strong | Habitual practice implies pattern |
| "The standard way to..." | Moderate | Implies convention |
| "This is similar to..." | Moderate | Analogy suggests pattern recognition |
| "In general..." | Weak | May be too vague |

### Anti-Pattern Signals
These phrases indicate cautionary knowledge.

| Signal | Strength | Example |
|--------|----------|---------|
| "Do not..." / "Never..." | Strong | Direct prohibition |
| "Avoid..." / "Watch out for..." | Strong | Explicit warning |
| "A common mistake is..." | Strong | Named anti-pattern |
| "This leads to problems when..." | Moderate | Consequence-based warning |
| "We learned the hard way..." | Moderate | Experience-based caution |
| "It might seem like... but..." | Moderate | Counterintuitive warning |

### Concept and Principle Signals

| Signal | Type | Strength |
|--------|------|----------|
| "X is defined as..." | Concept | Strong |
| "The idea behind X is..." | Concept | Strong |
| "This means that..." / "In other words..." | Concept | Moderate |
| "Always..." / "Never..." | Principle | Strong |
| "Prefer X over Y" | Principle | Strong |
| "The rule of thumb is..." / "As a general principle..." | Principle | Strong |
| "When in doubt..." | Principle | Moderate |

## Structural Markers

### High-Value Structural Indicators

| Marker | What It Suggests | Extraction Priority |
|--------|-----------------|---------------------|
| **Numbered lists** | Procedure or ranked items | High --- likely an ordered process |
| **Code blocks** | Reference data, examples, or procedures | High --- concrete and specific |
| **Tables** | Reference data or comparison matrices | High --- structured knowledge |
| **Headings with "How to..."** | Procedure | High --- explicit instructional content |
| **Bullet lists with imperative verbs** | Checklist or procedure | High --- actionable steps |
| **Blockquotes** | Key quotes, principles, or callouts | Medium --- may be opinion or emphasis |
| **Bold/italic inline text** | Author-emphasized terms or concepts | Medium --- signals importance |
| **Admonition blocks (Note, Warning, Tip)** | Principles, anti-patterns, or tips | Medium --- curated knowledge |
| **Footnotes or asides** | Supplementary context | Low --- often tangential |

### Section-Level Indicators

| Section Title Pattern | Likely Content Type | Extraction Focus |
|----------------------|--------------------|--------------------|
| "Getting Started" | Tutorial / Procedure | Steps and prerequisites |
| "API Reference" | Reference | Signatures, parameters, return types |
| "Best Practices" | Principles / Patterns | Rules and recurring solutions |
| "Troubleshooting" | Procedure / Anti-Pattern | Diagnostic steps and known pitfalls |
| "Architecture" / "Design" | Concept / Pattern | Models and structural approaches |
| "FAQ" | Mixed | Scan for procedures and concepts |
| "Changelog" / "Release Notes" | Data / Reference | Low extraction yield; mostly ephemeral |

## Automated Detection Patterns

### Regex-Style Indicators

Use these patterns during structural decomposition to flag candidate segments:

| Pattern | Detects |
|---------|---------|
| `^\d+\.\s` (numbered line start) | Procedure step |
| `^[-*]\s\[[ x]\]` (checkbox) | Checklist item |
| `^#{1,3}\s(How to|Setting up|Configure|Install)` | Procedure heading |
| `^(Note|Warning|Tip|Important|Caution):` | Principle or anti-pattern callout |
| `^(Always|Never|Avoid|Prefer|Do not)\s` | Principle or anti-pattern |
| Triple backtick blocks | Code example or reference data |
| `\b(pattern|anti-pattern|approach|technique|strategy)\b` | Pattern candidate |
| `\b(because|therefore|consequently|as a result)\b` | Causal reasoning (concept support) |

### Density Estimation Heuristic

Estimate information density to calibrate extraction depth:

```
density_score = (code_blocks + tables + lists) / total_paragraphs
```

| Density Score | Interpretation | Extraction Approach |
|---------------|---------------|---------------------|
| > 0.5 | High density | Deep extraction; most segments yield content |
| 0.2 - 0.5 | Medium density | Selective extraction; focus on structured segments |
| < 0.2 | Low density | Skim for high-value nuggets; skip filler |

## False Positive Filtering

### Common False Positives

| Looks Like | Actually Is | How to Detect |
|-----------|-------------|---------------|
| Procedure (numbered steps) | Narrative timeline (historical sequence) | Steps lack imperative verbs; describe what happened, not what to do |
| Pattern (repeated structure) | Formatting convention (stylistic repetition) | Structure repeats but content does not generalize |
| Principle ("Always do X") | Contextual advice (applies only in described scenario) | Missing generalizability; bound to specific context |
| Reference (data table) | Example data (illustrative, not authoritative) | Table labeled "example" or contains placeholder values |
| Anti-pattern ("Don't do X") | Personal preference without justification | No consequence described; no evidence of poor outcomes |
| Concept (definition) | Marketing language (branding, not explaining) | Vague superlatives; no technical substance |

### Filtering Rules

1. **Imperative test:** If it looks like a procedure but has no imperative verbs ("create", "run", "configure"), it is likely narrative. Downgrade to concept or example.
2. **Generalizability test:** If it looks like a pattern but only applies to one described scenario, it is an example. Reclassify.
3. **Consequence test:** If it looks like an anti-pattern but describes no negative outcome, it is opinion. Reclassify and lower confidence.
4. **Placeholder test:** If data contains "example", "sample", "foo/bar", or "xxx", it is illustrative. Classify as example, not reference.
5. **Substance test:** If a "definition" contains no technical specifics, it may be marketing. Skip or classify as opinion with low confidence.

## Extraction Priority Matrix

When time or scope is limited, prioritize extraction by this matrix:

| Signal Strength | Structural Support | Priority |
|----------------|-------------------|----------|
| Strong signal phrase + structured marker | Has heading, code, or table | Extract first |
| Strong signal phrase only | Prose without structure | Extract second |
| Structural marker only | No signal phrases | Evaluate carefully; may be formatting artifact |
| Weak signals only | No structure | Extract only if density is high |

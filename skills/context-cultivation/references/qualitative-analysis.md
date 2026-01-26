# Qualitative Analysis Methods

Systematic approaches for coding and categorizing qualitative data during context cultivation.

## The Three-Stage Coding Process

Qualitative coding progresses through three stages. Each stage operates at a higher level of abstraction.

### Stage 1: Open Coding

Read each source without preconceptions. Label every meaningful segment with a descriptive code.

| Principle | Guidance |
|-----------|----------|
| **Granularity** | One code per distinct idea; do not bundle multiple concepts |
| **Language** | Use in-vivo codes (source's own words) when possible |
| **Exhaustiveness** | Code every relevant segment; do not skip based on perceived importance |
| **Neutrality** | Describe what is said, not what you think it means |

**Process:**
1. Read the full source once without marking anything
2. Re-read and assign a short descriptive label to each meaningful segment
3. Record the exact segment text alongside the code for traceability
4. Use consistent naming: lowercase, hyphenated (e.g., `user-abandons-checkout`)

**Example open codes from a product feedback source:**
```
Segment: "I tried three times but the upload kept failing"
Code: upload-failure-repeated

Segment: "The dashboard loads fast but I can never find what I need"
Code: dashboard-findability-poor

Segment: "We switched from Competitor X because of pricing"
Code: competitor-pricing-driver
```

### Stage 2: Axial Coding

Group related open codes into categories. Look for relationships between codes.

| Relationship Type | Question | Example |
|-------------------|----------|---------|
| **Causal** | Does one code cause another? | `slow-response` causes `user-frustration` |
| **Contextual** | When or where does this code appear? | `error-spike` appears during `peak-hours` |
| **Consequential** | What results from this code? | `poor-onboarding` leads to `early-churn` |
| **Associative** | Do these codes co-occur? | `mobile-user` associates with `simplified-workflow` |

**Process:**
1. Lay out all open codes (physically or in a list)
2. Sort codes that share a relationship into groups
3. Name each group with a category label
4. Document why codes belong together
5. Note codes that fit multiple categories (these often signal important connections)

### Stage 3: Selective Coding

Identify 3-7 core themes that connect your categories into a coherent narrative.

**Theme formation criteria:**
- Spans at least 2 categories
- Supported by evidence from 2+ independent sources
- Reveals something not obvious from any single code
- Can be stated as a declarative sentence

**Process:**
1. Review all categories and ask: "What story do these tell together?"
2. Draft candidate theme statements
3. Test each theme against the evidence (can you trace it back to specific codes?)
4. Discard themes that lack sufficient grounding
5. Rank themes by strength (source count, evidence quality, consistency)

## Thematic Coding Quick Reference

| Step | Input | Output | Duration Guide |
|------|-------|--------|----------------|
| Open coding | Raw source text | 20-50 individual codes per source | 60% of coding time |
| Axial coding | All open codes | 5-15 categories | 25% of coding time |
| Selective coding | All categories | 3-7 themes | 15% of coding time |

## Grounded Theory Principles for Context Cultivation

Grounded theory insists that findings emerge from data rather than being imposed on it.

| Principle | Application |
|-----------|-------------|
| **Theoretical sensitivity** | Stay alert to what the data is saying, not what you expect it to say |
| **Constant comparison** | Continuously compare new codes against existing ones for consistency |
| **Theoretical saturation** | Stop coding when new sources stop producing new codes |
| **Memo writing** | Record analytical thoughts as they occur; these become insight seeds |
| **Negative case analysis** | Actively seek evidence that contradicts emerging themes |

## Code-to-Theme Progression Example

**Domain:** Enterprise software adoption barriers

```
OPEN CODES (15 selected from 40+):
  training-insufficient, documentation-outdated, admin-overwhelmed,
  integration-complex, migration-risky, data-loss-fear,
  champion-departed, executive-skeptical, budget-frozen,
  vendor-unresponsive, support-slow, contract-unclear,
  workflow-disruption, parallel-systems, productivity-dip

CATEGORIES (5):
  Knowledge Gap:     training-insufficient, documentation-outdated
  Technical Risk:    integration-complex, migration-risky, data-loss-fear
  Organizational:    champion-departed, executive-skeptical, budget-frozen
  Vendor Trust:      vendor-unresponsive, support-slow, contract-unclear
  Transition Cost:   workflow-disruption, parallel-systems, productivity-dip

THEMES (3):
  1. "Adoption fails at the organizational layer, not the technical layer"
     - Organizational + Vendor Trust categories dominate
     - Technical Risk is real but secondary
  2. "Knowledge transfer is the hidden bottleneck"
     - Knowledge Gap + Transition Cost interlock
     - Training investment predicts adoption success
  3. "Trust must be earned before and during adoption, not after"
     - Vendor Trust + Organizational categories intertwine
     - Champion departure collapses trust structures
```

## Coding Hygiene Checklist

Before completing thematic coding, verify:

```
- [ ] Code names are consistent across all sources (no synonymous duplicates)
- [ ] Every code maps to at least one category
- [ ] No category contains fewer than 2 codes (merge or reclassify singletons)
- [ ] Every theme traces back to specific codes and segments
- [ ] At least one theme is supported by 3+ independent sources
- [ ] Memos document the reasoning behind non-obvious groupings
- [ ] Counter-evidence has been sought for each theme
- [ ] Source attribution is preserved at every level (code, category, theme)
```

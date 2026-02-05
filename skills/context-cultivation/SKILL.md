---
name: context-cultivation
description: "Process raw context into cultivated insights. Performs qualitative analysis across ingested sources to identify themes, patterns, contradictions, gaps, and opportunities. Produces a structured synthesis that transforms disparate information into actionable intelligence for downstream prioritization and proposal building."
phase: SCAFFOLD
category: engineering
version: "2.0.0"
depends_on: ["context-ingestion"]
tags: [planning, analysis, synthesis, qualitative-analysis, pattern-recognition]
---

# Context Cultivation

Process raw context into cultivated insights.

## When to Use

- **After context ingestion completes** --- Raw sources are collected and you need to make sense of them
- **Multiple sources need synthesis** --- Information is scattered across documents, conversations, and notes
- **Pattern identification required** --- You suspect recurring themes but need to surface them explicitly
- **Gap analysis needed** --- Before proposing a solution, you need to know what information is missing
- **Contradictions must be resolved** --- Sources disagree and you need to reconcile or flag conflicts
- **Opportunity discovery** --- Raw context contains latent possibilities not yet articulated
- When you say: "analyze this context", "find patterns", "what are the themes", "synthesize these sources", "what's missing"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `qualitative-analysis.md` | Methods for coding and categorizing qualitative data |
| `synthesis-framework.md` | Framework for combining insights across sources |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `gap-analysis-techniques.md` | When identifying missing information systematically |
| `contradiction-resolution.md` | When sources conflict on key points |
| `opportunity-mapping.md` | When exploring latent possibilities in context |

**Verification:** Ensure CULTIVATED-CONTEXT.md contains at least one theme, one pattern, and one gap before marking complete.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `CULTIVATED-CONTEXT.md` | Project root | Always |
| `PATTERNS.md` | Project root | When 3+ patterns identified |
| `GAPS.md` | Project root | When gaps affect downstream work |

## Core Concept

Context Cultivation answers: **"What does all this information actually mean?"**

Cultivated insights are:
- **Synthesized** --- Multiple sources distilled into coherent themes
- **Evidenced** --- Every insight traces back to specific source material
- **Actionable** --- Insights inform decisions, not just describe data
- **Prioritized** --- Not all findings carry equal weight
- **Honest** --- Gaps and contradictions are surfaced, not hidden

Context Cultivation is NOT:
- Data collection (that is `context-ingestion`)
- Prioritization of work items (that is `priority-matrix`)
- Solution design (that is `architect` or `proposal-builder`)
- Summarization (summaries compress; cultivation extracts meaning)

## The Cultivation Process

```
+-------------------------------------------------------------+
|                   CONTEXT CULTIVATION                        |
|                                                              |
|  1. SOURCE INVENTORY                                         |
|     +---> Catalog what you have and assess quality           |
|                                                              |
|  2. THEMATIC CODING                                          |
|     +---> Read sources, assign codes, group into themes      |
|                                                              |
|  3. PATTERN RECOGNITION                                      |
|     +---> Identify recurring structures and relationships    |
|                                                              |
|  4. CONTRADICTION ANALYSIS                                   |
|     +---> Flag where sources conflict, assess severity       |
|                                                              |
|  5. GAP ANALYSIS                                             |
|     +---> What is missing? What questions remain?            |
|                                                              |
|  6. OPPORTUNITY MAPPING                                      |
|     +---> What possibilities emerge from the patterns?       |
|                                                              |
|  7. INSIGHT SYNTHESIS                                        |
|     +---> Weave findings into actionable intelligence        |
|                                                              |
|  8. CONFIDENCE ASSESSMENT                                    |
|     +---> Rate confidence levels, flag assumptions           |
+-------------------------------------------------------------+
```

## Step 1: Source Inventory

Before analysis, assess what you have to work with.

| Aspect | Questions |
|--------|-----------|
| **Coverage** | Do sources cover the full problem space? |
| **Recency** | How current is the information? |
| **Reliability** | How trustworthy is each source? |
| **Diversity** | Do sources represent multiple perspectives? |
| **Depth** | Surface-level or detailed? |

### Source Quality Matrix

Rate each source from the ingestion output:

```markdown
| Source | Coverage | Recency | Reliability | Depth | Overall |
|--------|----------|---------|-------------|-------|---------|
| [Source 1] | High | Current | Primary | Deep | Strong |
| [Source 2] | Partial | Dated | Secondary | Surface | Moderate |
| [Source 3] | Narrow | Current | Primary | Deep | Strong |
```

### Inventory Checklist

```markdown
- [ ] All ingested sources reviewed for quality
- [ ] Source types cataloged (primary, secondary, tertiary)
- [ ] Obvious coverage gaps noted before deep analysis
- [ ] Sources with questionable reliability flagged
- [ ] Sufficient material to proceed (minimum 2 independent sources)
```

## Step 2: Thematic Coding

Thematic coding is the systematic process of labeling content to identify recurring subjects.

### Coding Method

1. **Open coding** --- Read each source and assign descriptive labels to meaningful segments
2. **Axial coding** --- Group related codes into higher-order categories
3. **Selective coding** --- Identify the core themes that connect categories

### Coding Taxonomy

| Level | Description | Example |
|-------|-------------|---------|
| **Code** | Granular label for a specific data point | "user-frustration-onboarding" |
| **Category** | Group of related codes | "User Experience Issues" |
| **Theme** | High-level pattern spanning categories | "Onboarding is the primary conversion barrier" |

### Practical Coding Process

For each source, extract coded segments:

```markdown
### Source: [Name]

| Segment | Code | Category |
|---------|------|----------|
| "Users abandon signup at step 3" | dropout-step3 | Onboarding Friction |
| "Support tickets spike on Mondays" | support-timing | Operational Patterns |
| "Competitor X launched similar feature" | competitive-pressure | Market Position |
```

### Theme Assembly

After coding all sources, assemble themes:

```markdown
### Theme: [Theme Name]

**Strength:** Strong / Moderate / Emerging
**Source Count:** [N] sources reference this theme
**Evidence:**
- [Source A]: "[Relevant quote or data point]"
- [Source B]: "[Relevant quote or data point]"
- [Source C]: "[Relevant quote or data point]"

**Interpretation:** [What this theme means in context]
```

### Coding Quality Checks

```markdown
- [ ] Every source has been coded (no skipped sources)
- [ ] Codes are consistent (same label for same concept)
- [ ] Categories are mutually exclusive where possible
- [ ] Themes emerge from data, not imposed from assumptions
- [ ] At least one theme is supported by 2+ sources
```

## Step 3: Pattern Recognition

Patterns are recurring structures that reveal how things connect, not just what topics appear.

### Pattern Types

| Pattern Type | Description | Signal |
|--------------|-------------|--------|
| **Frequency** | Same observation across multiple sources | 3+ sources say the same thing |
| **Sequence** | Events or conditions that follow a predictable order | A leads to B leads to C |
| **Correlation** | Two phenomena that appear together | When X increases, Y also increases |
| **Absence** | Something expected that consistently does not appear | No one mentions security |
| **Clustering** | Issues or opportunities that group together | Three problems share a root cause |
| **Divergence** | A break from an established norm | One source contradicts all others |

### Pattern Documentation

For each pattern identified:

```markdown
### Pattern: [Descriptive Name]

**Type:** [Frequency / Sequence / Correlation / Absence / Clustering / Divergence]
**Confidence:** High / Medium / Low
**Evidence Count:** [N] data points

**Description:**
[Clear explanation of the pattern]

**Supporting Evidence:**
1. [Source]: [Specific data point]
2. [Source]: [Specific data point]
3. [Source]: [Specific data point]

**Implications:**
- [What this pattern suggests for the problem space]
- [How this affects potential solutions]

**Counter-evidence:**
- [Any data points that contradict or weaken the pattern]
```

### Pattern Strength Assessment

| Confidence Level | Criteria |
|------------------|----------|
| **High** | 3+ independent sources, no contradicting evidence, consistent across contexts |
| **Medium** | 2 sources or strong single source, minor caveats |
| **Low** | Single source, indirect evidence, or significant counter-evidence |

## Step 4: Contradiction Analysis

Contradictions are not problems to hide. They are signals of complexity that must be surfaced.

### Identifying Contradictions

| Contradiction Type | Description | Resolution Approach |
|--------------------|-------------|---------------------|
| **Factual** | Sources disagree on facts or data | Verify against primary sources |
| **Interpretive** | Sources agree on facts, disagree on meaning | Present both interpretations |
| **Temporal** | Information was true at different times | Note timeline, use most recent |
| **Perspectival** | Different stakeholders see things differently | Capture all perspectives |
| **Methodological** | Different methods yield different results | Note methodology differences |

### Contradiction Documentation

```markdown
### Contradiction: [Brief Title]

**Sources in conflict:**
- [Source A] claims: "[Statement]"
- [Source B] claims: "[Statement]"

**Type:** [Factual / Interpretive / Temporal / Perspectival / Methodological]
**Severity:** [Critical / Significant / Minor]

**Analysis:**
[Why these sources disagree and what it means]

**Resolution:**
- [ ] Resolved: [Explanation]
- [ ] Unresolved: Flagged for further investigation
- [ ] Irrelevant: Does not affect downstream work

**Impact on Insights:**
[How this contradiction affects the reliability of related themes or patterns]
```

### Contradiction Severity Guide

| Severity | Definition | Action Required |
|----------|------------|-----------------|
| **Critical** | Affects core assumptions or key decisions | Must resolve before proceeding |
| **Significant** | Affects secondary themes or supporting evidence | Flag clearly, attempt resolution |
| **Minor** | Peripheral disagreement, does not affect main findings | Document and move on |

## Step 5: Gap Analysis

Gaps are what you do not know but need to know. Identifying them is as valuable as identifying themes.

### Gap Discovery Questions

| Domain | Questions to Ask |
|--------|------------------|
| **Stakeholder** | Whose perspective is missing? Who was not consulted? |
| **Temporal** | What time periods are not covered? Is context current? |
| **Technical** | What technical details are assumed but unverified? |
| **Quantitative** | Where are opinions stated without supporting numbers? |
| **Competitive** | What do we not know about alternatives or competitors? |
| **Risk** | What risks have not been assessed? |
| **User** | What user needs are assumed but not validated? |

### Gap Classification

```markdown
### Gap: [Brief Title]

**Domain:** [Stakeholder / Temporal / Technical / Quantitative / Competitive / Risk / User]
**Severity:** [Blocking / Important / Nice-to-have]

**What is missing:**
[Clear description of the missing information]

**Why it matters:**
[Impact on analysis quality and downstream decisions]

**How to fill:**
- [ ] [Specific action to obtain the missing information]
- [ ] [Alternative source if primary is unavailable]

**Workaround if unfillable:**
[How to proceed if the gap cannot be filled]
```

### Gap Severity Definitions

| Severity | Definition | Implication |
|----------|------------|-------------|
| **Blocking** | Cannot produce reliable insights without this | Pause cultivation, return to ingestion |
| **Important** | Insights are less reliable without this | Proceed with caveats, flag in output |
| **Nice-to-have** | Would strengthen analysis but not essential | Note for future investigation |

## Step 6: Opportunity Mapping

Opportunities emerge at the intersection of themes, patterns, and gaps. This step transforms analytical findings into forward-looking possibilities.

### Opportunity Sources

| Source | How Opportunities Emerge |
|--------|--------------------------|
| **Strong themes** | Validated needs or interests become addressable areas |
| **Recurring patterns** | Systematic behaviors suggest leverage points |
| **Gaps in the market** | Missing capabilities or unmet needs |
| **Contradictions** | Unresolved tensions that a solution could bridge |
| **Convergence** | Multiple themes pointing toward the same space |
| **Absence patterns** | What nobody is doing that should be done |

### Opportunity Documentation

```markdown
### Opportunity: [Descriptive Title]

**Source:** [Which themes/patterns/gaps suggest this]
**Confidence:** High / Medium / Low
**Novelty:** Novel / Incremental / Established

**Description:**
[What the opportunity is and why it exists]

**Evidence:**
- Theme: [Related theme and connection]
- Pattern: [Related pattern and connection]
- Gap: [Related gap this could fill]

**Potential Impact:** [High / Medium / Low]
**Feasibility Notes:** [Any initial assessment of viability]
```

## Step 7: Insight Synthesis

Synthesis is where all prior steps converge into a coherent narrative. An insight is not a fact restated --- it is a new understanding derived from combining multiple data points.

### Insight Qualities

| Quality | Test |
|---------|------|
| **Novel** | Does it say something the sources do not say individually? |
| **Evidenced** | Can you trace it back to specific data points? |
| **Actionable** | Does it suggest what to do, not just what is? |
| **Specific** | Is it concrete enough to inform a decision? |
| **Honest** | Does it acknowledge its own limitations? |

### Synthesis Techniques

| Technique | Method | Best For |
|-----------|--------|----------|
| **Triangulation** | Combine 3+ sources on same topic for robust finding | Validating key claims |
| **Abstraction** | Move from specific observations to general principles | Finding transferable insights |
| **Narrative threading** | Connect insights into a coherent story | Communicating to stakeholders |
| **Inversion** | Ask "what would be true if the opposite held?" | Stress-testing assumptions |
| **Implication chains** | Follow "if this is true, then..." to second-order effects | Uncovering hidden consequences |

### Insight Template

```markdown
### Insight: [Title]

**Confidence:** High / Medium / Low
**Synthesis Method:** [Triangulation / Abstraction / Narrative / Inversion / Implication Chain]

**Statement:**
[One clear sentence stating the insight]

**Derivation:**
[How this insight emerges from the underlying evidence]
- Theme: [Related theme]
- Pattern: [Related pattern]
- Additional evidence: [Any supporting data]

**Implications:**
- [What this means for the problem space]
- [What this means for potential solutions]

**Caveats:**
- [What could make this insight wrong]
- [Confidence-reducing factors]
```

## Step 8: Confidence Assessment

Every cultivated output must carry a confidence rating. Intellectual honesty about uncertainty is a feature, not a weakness.

### Confidence Framework

| Level | Definition | Evidence Threshold |
|-------|------------|--------------------|
| **Established** | Multiple strong sources agree, no counter-evidence | 4+ independent confirmations |
| **Strong** | Clear evidence from reliable sources | 2-3 reliable sources |
| **Moderate** | Supported but with caveats or limited sources | 1-2 sources with partial corroboration |
| **Emerging** | Suggestive but not conclusive | Pattern visible but not fully confirmed |
| **Speculative** | Logical inference without direct evidence | Derived from implication chains only |

### Assumption Register

Document assumptions that underpin insights:

```markdown
| ID | Assumption | Affects | Evidence | Risk if Wrong |
|----|-----------|---------|----------|---------------|
| A1 | Market size is growing | Opportunity 1 | Industry report (2024) | Solution targets shrinking market |
| A2 | Users prefer self-service | Theme 3 | 2 interviews | Need different engagement model |
| A3 | Budget is available | Feasibility | Client conversation | Scope reduction needed |
```

## Output Formats

### Quick Cultivation (3-5 Sources, Focused Scope)

```markdown
# Cultivated Context: [Topic]

## Key Themes
1. **[Theme 1]** (Strong) --- [One-line summary with source count]
2. **[Theme 2]** (Moderate) --- [One-line summary with source count]
3. **[Theme 3]** (Emerging) --- [One-line summary with source count]

## Critical Patterns
- **[Pattern]:** [Description] (Confidence: [Level])

## Gaps
- **[Gap 1]** ([Severity]): [What is missing]
- **[Gap 2]** ([Severity]): [What is missing]

## Top Insights
1. [Insight statement] (Confidence: [Level])
2. [Insight statement] (Confidence: [Level])

## Opportunities
1. [Opportunity title] --- [Brief description]

## Confidence Summary
- Themes: [N] identified, [N] strong
- Gaps: [N] identified, [N] blocking
- Assumptions: [N] documented
- Overall confidence: [Level]
```

### Full Cultivation (6+ Sources, Complex Domain)

Use the complete structure from Steps 1-8, producing:

```markdown
# Cultivated Context: [Topic]

## Executive Summary
[2-3 paragraph synthesis of all findings. Lead with the most
important insight. State confidence level. Acknowledge key gaps.]

## Source Inventory
[Source Quality Matrix from Step 1]

## Themes
[Full theme documentation from Step 2, ordered by strength]

### Theme 1: [Title] (Strong)
[Evidence, interpretation, source references]

### Theme 2: [Title] (Moderate)
[Evidence, interpretation, source references]

## Patterns
[Full pattern documentation from Step 3]

## Contradictions
[Full contradiction analysis from Step 4]

## Gap Analysis
[Full gap documentation from Step 5]

## Opportunities
[Full opportunity mapping from Step 6]

## Synthesized Insights
[Full insight documentation from Step 7, ordered by confidence]

### Insight 1: [Title]
[Statement, derivation, implications, caveats]

## Confidence Assessment
[Confidence framework application from Step 8]

## Assumption Register
[All assumptions documented]

## Recommendations for Next Phase
- Priority matrix should weight: [Suggested dimensions from themes]
- Key decisions needed: [From contradictions and gaps]
- Further investigation: [From blocking gaps]
```

## Common Patterns

### The Convergence Pattern

Multiple independent sources point toward the same conclusion from different angles. This is the strongest form of evidence in qualitative analysis. When three or more unrelated sources independently surface the same theme, confidence is high regardless of individual source reliability.

**Use when:** Several sources from different perspectives reach similar conclusions independently.

### The Iceberg Pattern

Surface-level themes mask deeper structural issues. Initial coding reveals obvious topics, but second-pass analysis reveals the underlying dynamics driving those surface symptoms. The visible themes are symptoms; the real insight is the root cause beneath.

**Use when:** Themes feel symptomatic rather than causal, and you suspect deeper structural factors.

### The Silence Pattern

What sources do not mention is as informative as what they do. When a topic you would expect to appear is consistently absent, this absence is itself a pattern. It may indicate an unrecognized risk, a blind spot in the domain, or an assumption so deeply held that nobody questions it.

**Use when:** Expected topics are missing from all sources, or a critical perspective is unrepresented.

### The Tension Pattern

Two legitimate but opposing forces create a productive tension. Rather than resolving the contradiction, the insight is that the tension itself defines the problem space. Solutions must navigate between the poles, not eliminate one side.

**Use when:** Contradictions cannot be resolved because both sides have valid evidence, suggesting a both/and rather than either/or situation.

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `context-ingestion` | Ingestion provides RAW-CONTEXT.md and CONTEXT-SOURCES.md as inputs |
| `priority-matrix` | Cultivated themes and opportunities feed into prioritization dimensions |
| `proposal-builder` | Insights, patterns, and evidence feed directly into proposal narrative |
| `architect` | Technical patterns and gaps inform architectural decisions |
| `spec` | Cultivated requirements and constraints feed into specifications |
| `content-analysis` | May provide additional analytical depth on specific content types |

## Key Principles

**Evidence over intuition.** Every theme, pattern, and insight must trace back to specific source material. If you cannot point to the evidence, it is an assumption, not a finding.

**Gaps are findings.** Identifying what is missing is as valuable as identifying what is present. A well-documented gap prevents downstream teams from building on incomplete information.

**Confidence is a spectrum.** Not all insights are created equal. Rating confidence honestly allows downstream consumers to make informed decisions about how much weight to give each finding.

**Synthesis is not summarization.** Summaries compress information. Synthesis creates new understanding by combining information in ways that reveal what no single source could show alone.

**Contradictions are signals.** When sources disagree, the instinct is to pick a side. Instead, treat contradictions as data points that reveal complexity in the problem space.

**Cultivate, do not fabricate.** Insights must grow from the data. Resist the temptation to impose a narrative that the evidence does not support, no matter how elegant it would be.

## References

- `references/qualitative-analysis.md`: Methods for coding, categorizing, and analyzing qualitative data
- `references/synthesis-framework.md`: Framework for combining insights across heterogeneous sources
- `references/gap-analysis-techniques.md`: Systematic approaches to identifying missing information
- `references/contradiction-resolution.md`: Strategies for handling conflicting source material
- `references/opportunity-mapping.md`: Techniques for identifying latent possibilities in analyzed context

# Proposal Loop

Create compelling proposals through structured context processing.

## Overview

The proposal loop transforms raw context about a potential client or engagement into a polished proposal:

1. **Context Ingestion** - Gather and organize all relevant context sources
2. **Context Cultivation** - Process context into insights, patterns, and gaps
3. **Priority Matrix** - Rank opportunities across prioritization dimensions
4. **Proposal Builder** - Generate the final proposal document

## Phases

### INIT: Context Ingestion
- Gather context from multiple sources (documents, URLs, conversations)
- Create CONTEXT-SOURCES.md with source registry
- Create RAW-CONTEXT.md with extracted content

### SCAFFOLD: Context Cultivation
- Identify themes and patterns in the raw context
- Surface gaps and opportunities
- Create CULTIVATED-CONTEXT.md and PATTERNS.md

### IMPLEMENT: Priority Matrix
- Rank all possible work threads
- Apply 4 prioritization dimensions:
  - Impact
  - Effort
  - Urgency
  - Strategic alignment
- Create PRIORITIES.md and MATRIX.md

### COMPLETE: Proposal Builder
- Generate polished proposal document
- Apply appropriate template
- Include executive summary, scope, timeline, pricing
- Create PROPOSAL.md

## Gates

Each phase requires human approval before proceeding:

| Gate | Deliverables | Purpose |
|------|--------------|---------|
| Context | CONTEXT-SOURCES.md, RAW-CONTEXT.md | Ensure 80% source coverage |
| Cultivation | CULTIVATED-CONTEXT.md, PATTERNS.md | Validate insights |
| Priorities | PRIORITIES.md, MATRIX.md | Confirm priority ranking |
| Final | PROPOSAL.md | Approve for delivery |

## When to Use

- New client proposals
- Project scoping
- Engagement planning
- Any situation requiring structured context-to-proposal flow

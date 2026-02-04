# Context Cultivation Loop

Build and maintain project knowledge through systematic context gathering and documentation.

## When to Use

- **Starting a new project** - Gather and document initial context
- **Onboarding to existing codebase** - Build understanding systematically
- **Knowledge is scattered** - Consolidate tribal knowledge
- **Gotchas need documenting** - Capture what trips people up
- **Guarantees need tracking** - Document contracts and invariants
- **Patterns emerging** - Recognize and formalize recurring patterns

## Phases

```
GATHER → ANALYZE → DOCUMENT → COMPLETE
```

### GATHER
Collect context from multiple sources:
- Codebase exploration
- Documentation review
- Conversation/chat history
- External resources

**Skill:** context-ingestion

### ANALYZE
Cultivate gathered context into insights:
- Identify themes and patterns
- Surface contradictions
- Find gaps in knowledge
- Prioritize findings

**Skill:** context-cultivation

### DOCUMENT
Capture specific knowledge types:
- **Gotchas** - Things that trip people up
- **Guarantees** - Contracts and invariants
- **Patterns** - Recurring solutions

**Skills:** gotcha-documenter, guarantee-tracker, pattern-collector

### COMPLETE
Integrate knowledge into the project:
- Update CLAUDE.md with key insights
- Link to detailed documentation
- Set up ongoing maintenance

**Skill:** knowledge-integrator

## Deliverables

| Phase | Deliverable | Description |
|-------|-------------|-------------|
| GATHER | `CONTEXT-SOURCES.md` | List of ingested sources |
| ANALYZE | `CULTIVATED-CONTEXT.md` | Synthesized insights |
| DOCUMENT | `GOTCHAS.md` | Documented gotchas |
| DOCUMENT | `GUARANTEES.md` | Tracked guarantees |
| DOCUMENT | `PATTERNS.md` | Recognized patterns |
| COMPLETE | Updated `CLAUDE.md` | Integrated knowledge |

## Related Loops

- **dream-loop** - Strategic evolution (uses cultivation output)
- **learning-loop** - Learning from execution (produces patterns)
- **audit-loop** - Systematic review (validates knowledge)

## Example Usage

```
/cultivation-loop

# Onboarding to a new codebase
- Ingests: codebase, docs, Slack history
- Produces: GOTCHAS.md, GUARANTEES.md
- Updates: CLAUDE.md with key insights
```

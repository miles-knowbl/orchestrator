# Competitive Signals Reference

Types of competitive indicators to extract.

## Active Evaluation Signals

### Explicit Mentions

| Signal | Example |
|--------|---------|
| Named competitors | "Also talking to Intercom" |
| Evaluation stage | "They're doing a demo next week" |
| Comparison questions | "How do you compare to [competitor]?" |
| Feature parity | "Does your product have [competitor feature]?" |
| Pricing comparison | "They quoted us $X" |

### Implicit Signals

| Signal | Interpretation |
|--------|---------------|
| Specific feature questions | Comparing to competitor's feature |
| Unusual requirements | May be competitor's unique capability |
| Timeline pressure | Other vendor setting urgency |
| "Industry standard" references | Testing against competition |

---

## Past Experience Signals

### Previous User

| Signal | Example |
|--------|---------|
| Direct statement | "We used [competitor] before" |
| Time period | "For about 2 years" |
| Migration | "When we left [competitor]..." |
| Lessons | "With [competitor] we learned..." |

### Previous Evaluation

| Signal | Example |
|--------|---------|
| Eliminated | "We ruled out [competitor]" |
| Short-listed | "[Competitor] made our final 3" |
| Chose competitor | "We went with [competitor] instead" |
| Passed on all | "Decided not to buy anything" |

---

## Sentiment Signals

### Positive Sentiment (about competitor)

| Signal | Concern Level |
|--------|--------------|
| "We liked [competitor]" | High concern |
| "They have great [feature]" | Medium concern |
| "[Competitor] is the leader" | Medium concern |
| Warm references | Medium concern |

### Negative Sentiment (about competitor)

| Signal | Opportunity Level |
|--------|------------------|
| "Too expensive" | High opportunity |
| "Didn't work for us" | High opportunity |
| "Support was terrible" | High opportunity |
| "Limited customization" | High opportunity |
| "Outgrew them" | Medium opportunity |

### Neutral Sentiment

| Signal | Interpretation |
|--------|---------------|
| Factual comparison | Still evaluating |
| No opinion expressed | Need more intel |
| "It's fine but..." | Open to alternatives |

---

## Build vs. Buy Signals

### Build Consideration

| Signal | Likelihood |
|--------|------------|
| "Could we build this ourselves?" | Actively considering |
| "We have engineers who could..." | Medium consideration |
| "Our team looked at building..." | Past consideration |
| "No way we're building this" | Not considering |

### Buy Preference

| Signal | Strength |
|--------|----------|
| "We'd rather buy" | Strong preference |
| "Don't have time to build" | Strong preference |
| "Not our core competency" | Medium preference |
| "Want a vendor relationship" | Medium preference |

---

## Status Quo Signals

### Active Resistance

| Signal | Example |
|--------|---------|
| "Current solution works" | Satisfied with status quo |
| "Not a priority right now" | Deprioritized |
| "We're not ready for change" | Change resistance |
| "Too busy to switch" | Timing objection |

### Open to Change

| Signal | Example |
|--------|---------|
| "Current solution isn't working" | Ready to move |
| "Outgrowing what we have" | Capacity issue |
| "Need something better" | Dissatisfied |
| "Ready for an upgrade" | Proactive change |

---

## Competitive Intelligence Questions

### Direct Questions

1. "Who else are you evaluating?"
2. "Have you used AI solutions before?"
3. "What other vendors have you talked to?"
4. "What's your shortlist look like?"

### Indirect Questions

1. "What's most important in your decision?"
2. "What would make you choose us over alternatives?"
3. "What concerns do you have about any solution?"
4. "What's your biggest fear in making this decision?"

---

## Red Flag Signals

| Signal | Risk |
|--------|------|
| Competitor mentioned positively | May prefer them |
| Unusual feature request | Matches competitor capability |
| "Need to compare prices" | May be losing on price |
| Delay after competitor meeting | May be leaning their way |
| Champion less engaged | May have been swayed |
| Request for RFP | Formalizing process, possibly for competitor |

---

## Signal Confidence Levels

### High Confidence

- Direct statements about competitors
- Named vendors with status
- Explicit sentiment expressions
- Quotes about competitor experience

### Medium Confidence

- Comparison questions (implies evaluation)
- Feature requirements matching competitor
- Timeline changes after competitor meetings
- Reference checks for competitors

### Low Confidence

- Industry assumptions
- Company size implications
- Generic "evaluating options"
- No competitive mentions (doesn't mean no competition)

---

## Documentation Requirements

For each competitor, capture:

```json
{
  "name": "Competitor Name",
  "type": "direct|adjacent|internal|status-quo",
  "status": "active|past-user|eliminated|preferred|unknown",
  "sentiment": "positive|negative|neutral",
  "confidence": "high|medium|low",
  "evidence": ["quote", "behavior", "inference"],
  "source": "communication reference"
}
```

# Sentiment Shifts Reference

How to detect, interpret, and respond to sentiment changes.

## Positive Shifts

### Skeptical → Neutral

**Causes:**
- Concerns addressed directly
- Proof points provided (case studies, references)
- Risk mitigation offered
- Better understanding of solution

**Signals:**
- Fewer objections
- More open questions (vs. challenging)
- Willing to continue conversation
- Acknowledges some value

**Response:**
- Continue addressing concerns
- Don't assume deal is won
- Provide more proof points
- Maintain momentum

### Neutral → Supportive

**Causes:**
- Successful demo or POC
- Champion advocacy
- Executive alignment
- "Aha moment" on value

**Signals:**
- More engaged, enthusiastic
- Asks about next steps
- Offers to help internally
- Uses "we" language

**Response:**
- Enable them with materials
- Ask for introductions
- Move to close
- Don't take for granted

### Skeptical → Supportive (Rare, Powerful)

**Causes:**
- Complete turnaround on concerns
- Overwhelming proof
- Peer pressure from supportive colleagues
- Direct instruction from above

**Signals:**
- Public reversal of position
- Becomes vocal advocate
- "I was wrong about this"

**Response:**
- Acknowledge their openness
- They often become strongest advocates
- Give them credit internally

---

## Negative Shifts

### Supportive → Neutral

**Causes:**
- Unaddressed concerns
- Competitor entered picture
- Internal politics changed
- Timeline slipped

**Signals:**
- Less responsive
- Less enthusiastic
- More questions, fewer statements
- Cooler tone

**Response:**
- Immediate attention
- Ask directly: "I sense a shift..."
- Identify root cause
- Re-engage with value

### Neutral → Skeptical

**Causes:**
- Bad experience (missed meeting, poor demo)
- Competitor preference emerging
- New stakeholder with objections
- Budget pressure

**Signals:**
- Challenges increase
- Engagement decreases
- More "what about..." questions
- Delays increase

**Response:**
- Address head-on
- Understand the trigger
- May need champion intervention
- Don't ignore

### Supportive → Skeptical (Red Flag)

**Causes:**
- Major disappointment
- Trust broken
- Competitor won them over
- Internal pressure against

**Signals:**
- Complete reversal
- May avoid contact
- Previously helpful, now obstructive
- Public position change

**Response:**
- Emergency intervention
- Understand what happened
- May need executive engagement
- Could lose deal without action

---

## Red Flag Signals

Immediate attention needed:

| Signal | Meaning | Action |
|--------|---------|--------|
| Supportive contact goes silent (>7 days) | Something changed | Reach out directly |
| Tone shift in emails (warm → cold) | Sentiment dropping | Ask what's going on |
| New stakeholder enters with objections | Political shift | Understand their concerns |
| "Let's revisit this next quarter" | Deprioritized | Re-establish urgency |
| Competitor mentioned positively | Risk of loss | Differentiate, prove value |
| Request for formal RFP | May signal distancing | May be good or bad |
| Meeting cancellations without reschedule | Avoiding you | Direct conversation needed |
| Champion stops responding | Lost your champion | Emergency recovery |

---

## Detecting Shifts

### Compare Over Time

Keep sentiment history:

```json
{
  "sentimentHistory": [
    {"date": "2026-02-01", "sentiment": "neutral", "source": "initial-email"},
    {"date": "2026-02-03", "sentiment": "supportive", "source": "discovery-call"},
    {"date": "2026-02-10", "sentiment": "neutral", "source": "follow-up-email"}
  ]
}
```

### Pattern Recognition

| Pattern | Interpretation |
|---------|----------------|
| Steady supportive | Champion, reliable ally |
| Improving | Converting, winning them over |
| Declining | Losing them, needs attention |
| Volatile | Uncertain, influenced by recent events |
| Stuck neutral | Need to move them or work around |

### Leading Indicators

Watch for early warning signs before full shift:

- Response time increasing
- Email length decreasing
- Enthusiasm words disappearing
- "Let me check" increasing
- Competitive mentions appearing

---

## Response Strategies

### For Positive Shifts

1. **Acknowledge** — "Great to see your enthusiasm"
2. **Enable** — "Here's materials to help you advocate"
3. **Leverage** — "Could you introduce me to..."
4. **Lock in** — "Can we schedule the next step?"

### For Negative Shifts

1. **Notice early** — Don't wait for full shift
2. **Ask directly** — "I sense some hesitation..."
3. **Listen fully** — Let them explain concerns
4. **Address root cause** — Not symptoms
5. **Follow up** — Verify concerns resolved

### When Champion Goes Cold

1. Try direct outreach (call, not email)
2. Ask if something changed
3. Verify they're still in role
4. Have backup champion if possible
5. May need executive intervention

---

## Sentiment vs. Role Implications

| Role | Positive Shift Impact | Negative Shift Impact |
|------|----------------------|----------------------|
| Champion | Deal accelerates | Deal at risk |
| Decision-Maker | Approval likely | May not approve |
| Influencer | Adds momentum | Creates headwind |
| Blocker | Obstacle removed | Expected |
| Evaluator | Good evaluation likely | May fail evaluation |

## Documentation

Always document:
- What shifted (from → to)
- When it shifted
- Why (suspected cause)
- Evidence (specific signals)
- Response taken

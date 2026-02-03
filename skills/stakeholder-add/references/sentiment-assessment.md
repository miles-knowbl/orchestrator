# Sentiment Assessment Reference

How to gauge stakeholder support, neutrality, or skepticism.

## Sentiment Levels

### Supportive

**Definition:** Actively wants the deal to happen.

**Verbal Signals:**
- "This is exactly what we need"
- "How soon can we get started?"
- "I'll advocate for this internally"
- "What do you need from me?"
- Uses "we" when discussing implementation
- Asks about next steps, timelines

**Behavioral Signals:**
- Responds quickly
- Proactively shares information
- Makes introductions
- Attends meetings prepared
- Engages actively, asks questions
- Follows up without prompting

**Email/Written Signals:**
- Enthusiastic tone
- Exclamation points (appropriate usage)
- Forward-leaning language
- Shares with colleagues

### Neutral

**Definition:** Neither supporting nor opposing; evaluating objectively.

**Verbal Signals:**
- "Let me think about that"
- "I'd need to see more"
- "What are the pros and cons?"
- "How does this compare to X?"
- Asks clarifying questions
- Neither advocates nor objects

**Behavioral Signals:**
- Responds at normal pace
- Attends meetings but doesn't drive
- Asks reasonable questions
- Provides information when asked
- Waiting for more data/proof

**Email/Written Signals:**
- Professional, measured tone
- Questions rather than statements
- Neither warm nor cold

### Skeptical

**Definition:** Has doubts, concerns, or objections that haven't been addressed.

**Verbal Signals:**
- "I'm not sure this will work"
- "We tried something like this before"
- "What about [concern]?"
- "Our situation is different"
- "That seems risky"
- "I'd need to see proof"

**Behavioral Signals:**
- Slow to respond
- Asks challenging questions
- Brings up edge cases, risks
- References past failures
- Arms crossed, leaning back (in person)
- Multitasking in meetings

**Email/Written Signals:**
- Short responses
- Questions that challenge claims
- CC's others (covering bases)
- Formal, distant tone

### Unknown

**Definition:** Not enough interaction to assess.

**When to Use:**
- Haven't met them yet
- Only introduced by name
- Brief interaction with no signal
- Recently added, need more data

**Action:** Get more interaction to assess.

## Assessment Framework

### Direct Evidence (Strongest)

What they've explicitly said:

| Statement | Sentiment |
|-----------|-----------|
| "I love this" | Supportive |
| "I have concerns about X" | Skeptical |
| "Looks interesting" | Neutral |
| "This won't work here" | Skeptical |
| "Let's do this" | Supportive |

### Behavioral Evidence (Strong)

How they act:

| Behavior | Sentiment |
|----------|-----------|
| Makes intros, shares info | Supportive |
| Slow to respond, minimal engagement | Skeptical or Neutral |
| Asks good questions, stays engaged | Neutral to Supportive |
| Raises objections, challenges claims | Skeptical |
| Advocates to others | Supportive |

### Contextual Evidence (Supporting)

Their situation:

| Context | Likely Sentiment |
|---------|------------------|
| Owns the problem being solved | Likely Supportive |
| Losing budget/headcount to this | Likely Skeptical |
| Has competing priority | Likely Neutral |
| Burned by similar solution before | Likely Skeptical |
| Getting pressure from above | Likely Supportive |

## Sentiment by Role

### Champions

Should always be Supportive. If Champion is Neutral or Skeptical, they're not really a Champion—reclassify.

### Decision-Makers

- **Supportive DM:** Great position, focus on closing
- **Neutral DM:** Common, need to build case and credibility
- **Skeptical DM:** Address concerns directly, may need executive alignment

### Influencers

- **Supportive Influencer:** Can become Champion
- **Neutral Influencer:** Win them over with proof
- **Skeptical Influencer:** Address concerns or risk becoming Blocker

### Evaluators

Often start Neutral. Movement to Supportive or Skeptical based on evaluation findings.

## Sentiment Shifts

### Positive Shifts (Skeptical → Neutral → Supportive)

Caused by:
- Concerns addressed directly
- Proof points (case studies, references)
- Successful demo or POC
- Champion advocacy
- Executive alignment
- Risk mitigation offered

### Negative Shifts (Supportive → Neutral → Skeptical)

Caused by:
- Unaddressed concerns
- Competitive pressure
- Internal politics
- Budget constraints
- Timeline slippage
- Bad experience (missed demo, poor response)
- Champion leaving

## Red Flag Signals

Immediate attention needed:

- Supportive contact goes silent (> 7 days)
- Tone shift in emails (warm → cold)
- New stakeholder enters with objections
- "Let's revisit this next quarter"
- Competitor mentioned positively
- Request for formal RFP (may signal distancing)
- Meeting cancellations without reschedule

## Updating Sentiment

**When to update:**
- After significant interaction
- When new evidence emerges
- If behavior contradicts current assessment

**Always note why:**
```json
{
  "sentiment": "skeptical",
  "sentimentUpdatedAt": "2026-02-03",
  "sentimentReason": "Raised concerns about integration timeline in Feb 3 meeting"
}
```

## Sentiment vs. Role Matrix

| Role | Supportive | Neutral | Skeptical |
|------|-----------|---------|-----------|
| Champion | Expected | Re-evaluate role | Not a champion |
| Decision-Maker | Ideal | Normal | Risk - address |
| Influencer | Asset | Opportunity | Risk |
| Evaluator | Good sign | Normal | Address criteria |
| Blocker | Converted! | Progress | Expected |

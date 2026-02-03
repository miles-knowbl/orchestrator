# Champion Behaviors Reference

Observable behaviors that indicate champion strength.

## High-Signal Behaviors

### Proactive Communication

**What to look for:**
- Reaches out without prompting
- Shares updates on internal discussions
- Alerts you to obstacles or changes
- Keeps you informed of timeline shifts
- Provides unsolicited feedback

**Example signals:**
- "Just wanted to let you know..."
- "Heads up on something..."
- "Thought you should know..."
- "Quick update from our end..."

**Score impact:** +20-30 to Engagement

### Information Sharing

**What to look for:**
- Shares internal dynamics
- Explains organizational structure
- Reveals competing priorities
- Provides competitive intelligence
- Shares stakeholder concerns

**Example signals:**
- "Between us, the real issue is..."
- "Here's what you need to know about [person]..."
- "We're also talking to [competitor]..."
- "The CFO is concerned about..."

**Score impact:** +15-25 to Advocacy

### Introduction Making

**What to look for:**
- Offers to introduce key stakeholders
- Sets up meetings with decision-makers
- Brings in relevant team members
- Facilitates executive access

**Example signals:**
- "Let me set up a meeting with..."
- "You should talk to [person], I'll introduce you"
- "I'll bring [decision-maker] to the next call"
- "Let me get you time with our CTO"

**Score impact:** +20-30 to Authority/Advocacy

### Internal Selling

**What to look for:**
- Advocates in internal meetings
- Presents your solution favorably
- Defends against objections
- Uses "we" when discussing your solution

**Example signals:**
- "I've been telling the team about this..."
- "In our leadership meeting, I brought up..."
- "When [person] objected, I explained..."
- Uses "our solution" or "when we implement"

**Score impact:** +25-35 to Advocacy

### Process Acceleration

**What to look for:**
- Expedites internal reviews
- Removes bureaucratic obstacles
- Fast-tracks approvals
- Compresses timelines

**Example signals:**
- "I've already got the security review started"
- "I'll push to get budget approved this week"
- "Let me see if we can skip that step"
- "I know someone in procurement..."

**Score impact:** +15-25 to Authority

---

## Medium-Signal Behaviors

### Responsiveness

**What to look for:**
- Replies within 24 hours
- Answers questions thoroughly
- Available for meetings
- Accommodates your schedule

**Score impact:** +10-15 to Engagement

### Meeting Preparation

**What to look for:**
- Comes prepared
- Has reviewed materials
- Brings relevant info
- Takes notes

**Score impact:** +10-15 to Engagement

### Constructive Feedback

**What to look for:**
- Provides honest feedback
- Shares concerns constructively
- Helps you improve positioning
- Points out weak spots

**Score impact:** +10-15 to Advocacy

---

## Low-Signal Behaviors

### Passive Participation

**What to look for:**
- Attends meetings but doesn't drive
- Answers questions when asked
- Waits for you to lead
- Doesn't follow up

**Score impact:** +5-10 max to Engagement

### Vague Support

**What to look for:**
- "This looks interesting"
- "I like it"
- "Seems good"
- No concrete action

**Score impact:** +5-10 max to Advocacy

---

## Negative-Signal Behaviors

### Disengagement

**What to look for:**
- Response times increasing
- Shorter, terser replies
- Missing meetings
- Delegating to others

**Score impact:** -10-20 to Engagement

### Hesitation

**What to look for:**
- "I need to think about this"
- "Let me check with..."
- Delays making introductions
- Avoids commitment

**Score impact:** -10-15 to Advocacy

### Distance

**What to look for:**
- Uses "you" not "we"
- Refers to "your solution"
- Doesn't take ownership
- Positions as evaluator not advocate

**Score impact:** -15-25 to Advocacy

---

## Behavior Tracking

### Log Key Behaviors

For each interaction, note:

```json
{
  "date": "2026-02-03",
  "interaction": "Discovery call",
  "behaviors": [
    {"type": "proactive-communication", "detail": "Shared internal dynamics before meeting"},
    {"type": "introduction-offer", "detail": "Offered to set up CTO meeting"},
    {"type": "we-language", "detail": "Said 'when we implement this'"}
  ],
  "sentiment": "supportive",
  "engagementLevel": "high"
}
```

### Trend Analysis

Compare behaviors over time:

| Period | Responsiveness | Proactivity | Advocacy |
|--------|---------------|-------------|----------|
| Week 1 | 24 hours | Low | None |
| Week 2 | 12 hours | Medium | Some |
| Week 3 | 4 hours | High | Strong |

**Trend:** Improving → Champion strengthening

---

## Behavior-Based Questions

To assess champion behaviors:

1. "How have your internal conversations about this been going?"
2. "What's the reaction been from [stakeholder]?"
3. "What questions are people asking internally?"
4. "What obstacles do you see and how can we address them together?"
5. "What would help you make the case internally?"

Answers reveal:
- Whether they're having internal conversations (advocacy)
- Their level of organizational awareness (engagement)
- Their ability to influence (authority)
- Their commitment to success (all components)

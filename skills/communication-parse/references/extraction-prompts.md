# Extraction Prompts

Effective prompts for Claude-powered signal extraction from communications.

## Master Extraction Prompt

Use this comprehensive prompt for full signal extraction:

```
Analyze this sales communication and extract all intelligence signals.

COMMUNICATION:
{communication_content}

CONTEXT:
- Deal: {deal_name}
- Stage: {current_stage}
- Known stakeholders: {stakeholder_list}

Extract the following, being explicit about confidence levels:

1. PAIN POINTS
   - Category (volume, cost, quality, speed, compliance, security, experience, talent, legacy, integration)
   - Description
   - Severity (high/medium/low)
   - Direct quote if available
   - Speaker
   - Confidence (explicit/inferred)

2. BUDGET SIGNALS
   - Type (stated, range, comparison, timing, no-budget)
   - Value or range
   - Quote if available
   - Confidence

3. TIMELINE SIGNALS
   - Type (deadline, event, fiscal, urgency, open-ended)
   - Date or timeframe
   - Quote if available
   - Confidence

4. STAKEHOLDER MENTIONS
   - Name and title
   - Role in decision
   - Sentiment toward us
   - Power/influence indicators

5. TECHNICAL REQUIREMENTS
   - Category (integration, security, scale, compliance, existing-systems)
   - Requirement description
   - Priority (must-have, nice-to-have, future)

6. COMPETITIVE SIGNALS
   - Competitors mentioned
   - Current solutions
   - Evaluation status
   - Sentiment toward alternatives

7. AI MATURITY INDICATORS
   - Past AI experience
   - Internal AI capabilities
   - Comfort level with AI
   - Concerns or hesitations

8. USE CASE CLARITY
   - Primary use case
   - Clarity level (vague/exploring/defined/scoped)
   - Scope boundaries mentioned

For each signal, provide:
- The specific insight
- Supporting quote (if explicit)
- Confidence level
- Potential score impact

Output as structured JSON.
```

## Category-Specific Prompts

### Pain Point Deep Dive

When communications are rich with problem descriptions:

```
Focus on pain points in this communication.

For each pain point identified:
1. What category? (volume, cost, quality, speed, compliance, security, experience, talent, legacy, integration)
2. How severe? Use these indicators:
   - HIGH: Explicit urgency words, executive attention, business impact stated
   - MEDIUM: Acknowledged problem, seeking solutions
   - LOW: Minor frustration, future concern
3. Who mentioned it?
4. Exact quote capturing the pain
5. Is this a new pain point or reinforcement of known issue?
```

### Budget Signal Extraction

When financial signals may be present:

```
Extract all budget-related signals from this communication.

Look for:
1. EXPLICIT: "Budget is X", "We have Y allocated"
2. RANGE: "Between X and Y", "Up to X"
3. COMPARISON: "We pay X for current solution"
4. TIMING: "Budget cycle in Q4", "New fiscal year"
5. AUTHORITY: Who controls budget? Who has sign-off?
6. CONSTRAINTS: Procurement process, approval levels

For each signal:
- Quote the relevant text
- Classify the signal type
- Rate confidence (explicit/strong-inference/inference/weak)
- Note any conditions or dependencies
```

### Timeline Extraction

When timing signals may be present:

```
Extract all timeline signals from this communication.

Look for:
1. HARD DEADLINES: "Must be live by X"
2. SOFT TARGETS: "Hoping to have this by X"
3. TRIGGER EVENTS: "Board meeting in X", "Conference in X"
4. FISCAL TIMING: "End of fiscal year", "Budget renewal"
5. URGENCY INDICATORS: "ASAP", "urgent", "can't wait"
6. COMPETING PRIORITIES: Other projects, resource constraints

For each signal:
- Quote the relevant text
- Convert to specific date if possible
- Rate urgency (high/medium/low)
- Note dependencies or conditions
```

### Stakeholder Mapping

When new contacts or power dynamics are mentioned:

```
Analyze stakeholder information in this communication.

For each person mentioned:
1. Name and title (as stated)
2. Role in decision:
   - CHAMPION: Actively selling internally
   - INFLUENCER: Has input but not final say
   - DECISION MAKER: Has authority to approve
   - BLOCKER: May oppose or slow deal
   - END USER: Will use the solution
3. Sentiment indicators:
   - POSITIVE: Enthusiastic, engaged, advocating
   - NEUTRAL: Open but not committed
   - SKEPTICAL: Has concerns, needs convincing
   - NEGATIVE: Actively resistant
4. Power indicators:
   - Budget authority
   - Technical authority
   - Organizational influence
5. Relationship to other stakeholders
```

### Technical Requirements

When technical details are discussed:

```
Extract technical requirements from this communication.

Categories:
1. INTEGRATION: Systems that must connect
2. SECURITY: Auth, compliance, data handling
3. SCALE: Volume, performance, capacity
4. DEPLOYMENT: Cloud, on-prem, hybrid
5. EXISTING SYSTEMS: Current tech stack

For each requirement:
- Specific requirement description
- Category
- Priority (must-have/nice-to-have/future)
- Quote if explicitly stated
- Potential complexity (low/medium/high)
```

## Prompt Chaining

For complex communications, chain prompts:

### Step 1: Initial Scan
```
Read this communication and identify which signal categories are present:
- Pain Points: [Yes/No]
- Budget: [Yes/No]
- Timeline: [Yes/No]
- Stakeholders: [Yes/No]
- Technical: [Yes/No]
- Competitive: [Yes/No]
- AI Maturity: [Yes/No]
- Use Case: [Yes/No]

For categories marked Yes, briefly note what's there.
```

### Step 2: Deep Extraction
Run category-specific prompts only for categories identified in Step 1.

### Step 3: Synthesis
```
Given these extracted signals:
{extracted_signals}

Synthesize:
1. What's the single most important new insight?
2. What score should change and by how much?
3. What action should we take next?
4. What questions remain unanswered?
```

## Handling Ambiguity

When signals are unclear:

```
This signal is ambiguous: "{signal}"

Possible interpretations:
A) {interpretation_a}
B) {interpretation_b}

Based on context:
- Deal stage: {stage}
- Known information: {context}
- Speaker history: {speaker_info}

Which interpretation is more likely? Assign confidence level.
```

## Confidence Calibration

Use this to validate confidence levels:

| Confidence | Criteria | Example |
|------------|----------|---------|
| explicit | Direct statement, no interpretation needed | "Our budget is $300K" |
| strong-inference | Clear implication from context | "Finance approved" → budget exists |
| inference | Reasonable conclusion | Big company + urgent need → likely has budget |
| weak | Speculation | Industry average suggests X |

## Output Templates

### Quick Summary
```
{communication_id}
Key Signals:
- {signal_1}
- {signal_2}
Score Impacts: {score}: {change}
Next: {recommended_action}
```

### Full Extraction
```json
{
  "communicationId": "",
  "parsedAt": "",
  "signalSummary": {
    "painPoints": 0,
    "budgetConfirmed": false,
    "timelineConfirmed": false,
    "newStakeholders": 0,
    "technicalRequirements": 0
  },
  "signals": { ... },
  "scoreImpacts": { ... },
  "nextActions": []
}
```

# Signal Taxonomy Reference

Complete taxonomy of signals to extract from sales communications.

## 1. Pain Point Signals

### Categories

| Category | Description | Keywords |
|----------|-------------|----------|
| volume | Capacity/scale issues | "drowning", "overwhelmed", "too many", "can't keep up" |
| cost | Cost pressure | "expensive", "budget", "spending too much", "ROI" |
| quality | Quality problems | "errors", "mistakes", "complaints", "inconsistent" |
| speed | Time/efficiency issues | "slow", "takes too long", "waiting", "delays" |
| compliance | Regulatory needs | "audit", "compliance", "regulation", "SOC 2", "GDPR" |
| security | Security concerns | "breach", "vulnerability", "secure", "protect" |
| experience | Customer/user experience | "frustrated", "complaints", "satisfaction", "NPS" |
| talent | People/hiring issues | "can't hire", "training", "turnover", "expertise" |
| legacy | Old system problems | "outdated", "legacy", "technical debt", "old system" |
| integration | Connection issues | "doesn't talk to", "manual", "disconnected", "silos" |

### Severity Assessment

| Severity | Indicators |
|----------|------------|
| high | Executive-level concern, quantified impact, urgent language |
| medium | Department-level issue, acknowledged problem |
| low | Nice-to-have, mentioned in passing |

### Pain Point Extraction Template

```json
{
  "category": "volume",
  "description": "Support ticket volume increased 300%",
  "severity": "high",
  "impact": "Team overwhelmed, response times degraded",
  "quantified": "300% increase",
  "quote": "We're drowning in tickets",
  "speaker": "Sarah Chen",
  "source": "2026-02-03-meeting-discovery.md",
  "confidence": "explicit"
}
```

---

## 2. Budget Signals

### Signal Types

| Type | Examples |
|------|----------|
| explicit-amount | "$200K-400K", "half a million", "$1M+" |
| range-indicator | "six figures", "significant investment" |
| approval-status | "budget approved", "need to get budget", "included in FY plan" |
| constraint | "limited budget", "need to justify", "competing priorities" |
| comparison | "costs less than hiring", "cheaper than current" |

### Budget Extraction Template

```json
{
  "type": "explicit-range",
  "value": "$200K-$400K",
  "currency": "USD",
  "period": "one-time",
  "status": "approved",
  "approver": "CFO",
  "quote": "Budget approved for $200-400K",
  "source": "2026-02-03-meeting-discovery.md",
  "confidence": "explicit"
}
```

### Budget Inference Rules

| Signal | Inference |
|--------|-----------|
| "Need to get approval" | Budget not yet secured |
| "Already in our plan" | Budget likely available |
| "Need to build business case" | Budget uncertain |
| "Board approved AI initiative" | Strong budget signal |
| "This quarter's budget is tight" | May need to wait |

---

## 3. Timeline Signals

### Signal Types

| Type | Examples |
|------|----------|
| hard-deadline | "Must be live by June 30" |
| soft-target | "Hoping for Q2" |
| fiscal-constraint | "Need to spend before fiscal year end" |
| event-driven | "Before our busy season", "For the conference" |
| dependency | "After the migration completes" |
| urgency | "ASAP", "urgent", "critical" |

### Timeline Extraction Template

```json
{
  "type": "hard-deadline",
  "value": "2026-06-30",
  "driver": "Peak season preparation",
  "flexibility": "low",
  "quote": "Need this by June",
  "source": "2026-02-03-meeting-discovery.md",
  "confidence": "explicit"
}
```

### Decision Timeline Mapping

| Signal | Decision Timeline |
|--------|-------------------|
| "Looking at this week" | immediate |
| "This quarter" | this-quarter |
| "Next budget cycle" | next-quarter |
| "Someday", "Eventually" | long-term |
| No signals | unknown |

---

## 4. Stakeholder Signals

### New Stakeholder Indicators

- Name + title mentioned
- "I'll need to involve [name]"
- "Let me check with [name]"
- Meeting attendee not previously known
- CC'd on email

### Stakeholder Intelligence

| Signal | What It Reveals |
|--------|-----------------|
| "My boss [name]" | Reports-to relationship |
| "Legal will need to review" | Blocker identification |
| "I'll champion this" | Champion confirmation |
| "[Name] is skeptical" | Blocker identification |
| "[Name] loves this" | Advocate identification |

### Stakeholder Extraction Template

```json
{
  "name": "Michael Torres",
  "title": "CTO",
  "relationship": "Sarah's peer, technical decision authority",
  "sentiment": "unknown",
  "engagementStatus": "not-yet-engaged",
  "mentionContext": "Sarah will loop him in for technical discussion",
  "source": "2026-02-03-meeting-discovery.md"
}
```

---

## 5. Technical Signals

### Categories

| Category | Examples |
|----------|----------|
| integration | "Needs to connect to Salesforce", "API with our CRM" |
| authentication | "SSO with Okta", "SAML", "OAuth" |
| data | "Access to our knowledge base", "Customer data" |
| security | "SOC 2 required", "On-prem only", "Data residency" |
| scale | "10K concurrent users", "1M requests/day" |
| platform | "Must work on mobile", "Shopify Plus" |
| compliance | "HIPAA", "PCI", "GDPR" |

### Technical Extraction Template

```json
{
  "category": "integration",
  "requirement": "Shopify Plus e-commerce platform",
  "priority": "must-have",
  "currentState": "Using Shopify Plus for all e-commerce",
  "complexity": "medium",
  "source": "2026-02-03-meeting-discovery.md",
  "confidence": "explicit"
}
```

---

## 6. Competitive Signals

### Signal Types

| Type | Examples |
|------|----------|
| active-evaluation | "Also talking to [vendor]" |
| past-experience | "We used [vendor] before" |
| internal-option | "Could we build this ourselves?" |
| preference | "[Vendor] has better X" |
| elimination | "Ruled out [vendor]" |

### Competitive Extraction Template

```json
{
  "competitor": "Intercom",
  "status": "past-user",
  "sentiment": "negative",
  "reason": "Too expensive, poor customization",
  "source": "2026-02-03-meeting-discovery.md",
  "confidence": "explicit"
}
```

---

## 7. AI Maturity Signals

### Maturity Levels

| Level | Signals |
|-------|---------|
| no-experience | "First time looking at AI", "Don't know where to start" |
| exploring | "Researching options", "Just learning" |
| attempted | "Tried [tool] before", "Had a POC" |
| deployed | "Using [tool] for X", "Have an AI team" |
| mature | "Multiple AI systems", "AI-first strategy" |

### AI Maturity Extraction Template

```json
{
  "level": "exploring",
  "priorAttempts": [],
  "internalCapability": "No dedicated AI team",
  "aiStrategy": "Board interested, no formal strategy",
  "source": "2026-02-03-meeting-discovery.md"
}
```

---

## 8. Use Case Signals

### Clarity Levels

| Level | Indicators |
|-------|------------|
| exploring | "We need AI" with no specifics |
| defined | Clear automation target identified |
| scoped | Requirements documented, prototype-ready |

### Use Case Extraction Template

```json
{
  "primary": "Tier 1 chat support for returns/exchanges",
  "secondary": ["FAQ automation", "Authentication help"],
  "clarity": "defined",
  "scope": "Customer-facing chat only, not internal",
  "successCriteria": "Reduce ticket volume by 30%",
  "source": "2026-02-03-meeting-discovery.md"
}
```

---

## Signal Confidence Rules

### Explicit (Direct Statement)

- Exact quote available
- Speaker identified
- No interpretation needed

### Strong Inference

- Clear implication
- Context supports conclusion
- Would be understood by any reader

### Inference

- Reasonable conclusion
- Based on industry norms or patterns
- Some interpretation required

### Weak

- Speculation
- Limited evidence
- Could be wrong

**Rule:** When in doubt, lower the confidence level.

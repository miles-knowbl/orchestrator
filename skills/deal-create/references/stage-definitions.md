# Pipeline Stage Definitions

Standard stage definitions for the KnoPilot sales pipeline.

## Stage Overview

```
Lead → Target → Discovery → Contracting → Production → Closed
                                                      ↓
                                              Won / Lost
```

## Stage: Lead

**Definition:** A potential prospect identified through inbound, outbound, or referral.

### Entry Criteria
- Contact information captured
- Initial interest signal (form fill, referral, event meeting)

### Key Activities
- Initial research on company, industry, challenges
- Identify potential champion
- Craft personalized outreach

### Exit Criteria
- Qualified interest confirmed → **Target**
- Initial meeting scheduled → **Target**
- Disqualified → **Closed-Lost**

### Typical Duration
1-7 days

---

## Stage: Target

**Definition:** A qualified prospect with confirmed interest and scheduled engagement.

### Entry Criteria
- Meeting scheduled or active dialogue initiated
- Basic qualification (industry fit, company size alignment)

### Key Activities
- Deep company research (goals, challenges, AI maturity)
- Pre-meeting intelligence gathering
- Stakeholder mapping (champion + decision-makers)

### Exit Criteria
- Discovery call completed → **Discovery**
- Disqualified → **Closed-Lost**

### Typical Duration
1-14 days

---

## Stage: Discovery

**Definition:** Active exploration of prospect needs, use cases, and fit.

### Entry Criteria
- Discovery conversation initiated
- Prospect actively exploring solutions

### Key Activities
- Uncover specific pain points
- Assess AI maturity level and prior attempts
- Identify technical requirements and integration needs
- Clarify use case
- Gauge budget/timeline signals
- Strengthen champion relationship
- Map decision-making process and stakeholders
- Position unique value
- Offer free custom prototype when appropriate

### Exit Criteria
- Use case defined and prototype requested → **Contracting**
- Prospect ready to discuss contracting → **Contracting**
- Disqualified → **Closed-Lost**

### Typical Duration
14-45 days

---

## Stage: Contracting

**Definition:** Negotiating terms, pricing, and scope to formalize engagement.

### Entry Criteria
- Prospect committed to moving forward
- Prototype delivered (if applicable) and validated
- Budget/timeline confirmed

### Key Activities
- Scope definition and statement of work
- Pricing discussions
- Legal/security reviews
- Contract negotiation
- Champion enablement for internal sell

### Exit Criteria
- Contract signed → **Production** (Closed-Won)
- Deal lost → **Closed-Lost**

### Typical Duration
14-60 days

---

## Stage: Production

**Definition:** Post-contract phase where solution is built and launched.

### Entry Criteria
- Contract signed

### Key Activities
- Kickoff and discovery workshops
- Build and pilot phases
- Production deployment
- Handoff to customer success

### Exit Criteria
- Solution live in production
- Transitioned to ongoing support/expansion

### Typical Duration
30-180 days (varies by scope)

---

## Stage: Closed-Won

**Definition:** Deal successfully closed, contract signed.

### Entry Criteria
- Contract executed
- Payment terms agreed

### Tracking
- Final deal value
- Close date
- Key success factors
- Lessons learned

---

## Stage: Closed-Lost

**Definition:** Deal did not close.

### Entry Criteria
- Prospect explicitly declined
- Prospect went with competitor
- Prospect decided not to proceed
- Disqualified during any stage

### Tracking
- Loss reason (required)
- Competitor (if applicable)
- Lessons learned
- Potential for future re-engagement

### Common Loss Reasons
- Budget constraints
- Timing not right
- Went with competitor
- Internal build decision
- Stakeholder change
- Requirements mismatch
- No decision

---

## Stage Transition Rules

### Forward Transitions

| From | To | Requires |
|------|-----|----------|
| Lead | Target | Meeting scheduled OR active dialogue |
| Target | Discovery | Discovery call completed |
| Discovery | Contracting | Use case defined, commitment confirmed |
| Contracting | Production | Contract signed |
| Production | Closed-Won | Solution deployed |

### Backward Transitions

Generally avoided. If deal regresses:
- Document reason in stage history
- Consider if Closed-Lost is more appropriate

### Skip Transitions

Allowed when justified:
- Lead → Discovery (if discovery call happens immediately)
- Target → Contracting (if scope already clear)

Document skip reason in stage history.

---

## Stage Health Indicators

### Lead Stage
| Indicator | Healthy | At Risk |
|-----------|---------|---------|
| Days in stage | < 7 | > 14 |
| Outreach attempts | 1-3 | > 5 with no response |

### Target Stage
| Indicator | Healthy | At Risk |
|-----------|---------|---------|
| Days in stage | < 14 | > 30 |
| Meeting scheduled | Yes | No after 7 days |

### Discovery Stage
| Indicator | Healthy | At Risk |
|-----------|---------|---------|
| Days in stage | < 45 | > 60 |
| Champion engaged | Weekly contact | > 14 days silence |
| Use case clarity | Defined | Still exploring after 30 days |

### Contracting Stage
| Indicator | Healthy | At Risk |
|-----------|---------|---------|
| Days in stage | < 45 | > 60 |
| Blocker count | 0-1 | > 2 active blockers |
| Decision-maker engaged | Yes | No access to DM |

---

## Disqualification Criteria

Disqualify (move to Closed-Lost) if:

1. **No fit**
   - Industry outside target market
   - Company size too small/large
   - Use case doesn't match capabilities

2. **No budget**
   - Confirmed no budget available
   - Budget significantly below minimum threshold

3. **No timeline**
   - "Maybe next year" with no concrete plans
   - Decision pushed indefinitely

4. **No champion**
   - Can't identify internal advocate
   - Champion left the company

5. **No response**
   - 5+ outreach attempts with no response
   - 30+ days of silence in active stage

Always document disqualification reason.

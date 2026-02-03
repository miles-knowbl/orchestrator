# Negotiation Tracking Reference

How to track contract negotiations.

## Negotiation Stages

### Stage 1: Proposal Sent

**Status:** Waiting for response

**Track:**
- Date sent
- Who received
- Follow-up dates
- Initial feedback

**Typical duration:** 1-5 days

### Stage 2: Verbal Acceptance

**Status:** Business aligned, starting legal

**Track:**
- Acceptance confirmation
- Contract sent to legal
- Legal contacts identified
- Target timeline

**Typical duration:** 1-3 days

### Stage 3: Legal Review

**Status:** Under legal review

**Track:**
- Who's reviewing
- Review timeline
- Questions received
- Redlines expected when

**Typical duration:** 5-14 days

### Stage 4: Redlines

**Status:** Negotiating terms

**Track:**
- Each redlined term
- Positions (theirs and ours)
- Responses sent
- Turn-around times

**Typical duration:** 3-10 days

### Stage 5: Final Draft

**Status:** Terms agreed, finalizing

**Track:**
- Final version created
- All issues resolved
- Signatory confirmation
- Signature process

**Typical duration:** 1-3 days

### Stage 6: Signature

**Status:** Awaiting signature

**Track:**
- Who needs to sign
- Signature method (DocuSign, etc.)
- Signature progress
- Blocking issues

**Typical duration:** 1-5 days

---

## Issue Tracking

### Issue Types

| Type | Examples |
|------|----------|
| Legal | Liability, indemnification, IP, warranties |
| Business | Payment terms, pricing, scope |
| Operational | SLA, support, implementation |
| Security | Data handling, compliance, audit |

### Issue Status

| Status | Meaning |
|--------|---------|
| Open | Issue identified, not yet addressed |
| Negotiating | Active back-and-forth |
| Proposed-resolution | Resolution proposed, awaiting response |
| Agreed | Both parties aligned |
| Escalated | Requires executive involvement |
| Dealbreaker | Potential deal-stopper |

### Issue Priority

| Priority | Criteria |
|----------|----------|
| Critical | Could kill deal, must resolve |
| High | Important, blocks signature |
| Medium | Should resolve, some flexibility |
| Low | Nice to have, can compromise |

### Issue Template

```json
{
  "id": "ISSUE-001",
  "type": "legal",
  "issue": "Liability cap",
  "description": "Customer wants liability capped at annual contract value",
  "theirPosition": "Cap at contract value",
  "ourPosition": "Standard 2x contract value",
  "ourRationale": "Industry standard, protects against significant issues",
  "status": "negotiating",
  "priority": "high",
  "owner": "Our legal",
  "history": [
    {"date": "2026-02-08", "action": "Received redline"},
    {"date": "2026-02-10", "action": "Counter-proposed 1.5x"}
  ],
  "proposedResolution": "1.5x contract value",
  "notes": "Common negotiation point, expect compromise"
}
```

---

## Approval Tracking

### Their Approvals

| Role | Typical Approver | What They Approve |
|------|------------------|-------------------|
| Business | Champion, Project owner | Business terms, scope |
| Legal | General counsel, Legal team | Contract terms |
| Finance | CFO, Finance director | Pricing, payment terms |
| Procurement | Procurement manager | Vendor compliance |
| Security | CISO, Security team | Security terms |
| Executive | CEO, VP | Final authority |

### Our Approvals

| Role | What They Approve |
|------|-------------------|
| Sales | Deal terms, pricing |
| Sales leadership | Discounts, special terms |
| Legal | Contract terms |
| Finance | Payment terms, credit |

### Approval Status

| Status | Meaning |
|--------|---------|
| Not required | This approver not needed |
| Pending | Awaiting their review |
| In review | Currently reviewing |
| Approved | Sign-off received |
| Rejected | Did not approve |
| Conditional | Approved with conditions |

---

## Timeline Management

### Key Milestones

| Milestone | What to Track |
|-----------|---------------|
| Proposal sent | Date, recipient |
| Verbal acceptance | Date, who confirmed |
| Legal review start | Date, who's reviewing |
| Redlines received | Date, number of issues |
| Counter sent | Date, issues addressed |
| Terms agreed | Date, final terms |
| Contract signed | Date, effective date |

### Duration Tracking

```
Total days in contracting = Signature date - Proposal sent date

By stage:
- Proposal to acceptance: X days
- Acceptance to legal: X days
- Legal review: X days
- Redlines: X days
- Final to signature: X days
```

### SLA Tracking

| Party | SLA | Track |
|-------|-----|-------|
| Us | Respond to redlines in 2 business days | Days to respond |
| Them | Review in stated timeline | Days in review |
| Both | Turn documents in 1 day | Turn-around time |

---

## Communication Log

### Log Template

```json
{
  "date": "2026-02-08",
  "type": "email",
  "from": "ShopCo Legal",
  "to": "Our Legal",
  "subject": "Redlines on master agreement",
  "summary": "3 redlines: liability cap, indemnification, data handling",
  "action_required": true,
  "action_due": "2026-02-10"
}
```

### Key Communications to Log

- Proposal delivery
- Acceptance confirmation
- Questions received
- Redlines received
- Counter-proposals sent
- Escalation requests
- Final agreement
- Signature status

---

## Velocity Metrics

### Healthy vs. Stalled

| Metric | Healthy | At Risk | Stalled |
|--------|---------|---------|---------|
| Days since last activity | 0-3 | 4-7 | 7+ |
| Turns on redlines | <3 | 3-5 | 5+ |
| Open issues | Decreasing | Stable | Increasing |
| Total contracting time | <30 days | 30-45 days | 45+ days |

### Red Flags

- No response in 5+ days
- New issues emerging late
- Executive involvement requested
- Scope changes requested
- Competitor mentioned
- "Need to think about it"

---

## Documentation

### Required Documents

- [ ] Proposal sent (stored)
- [ ] Contract version (current)
- [ ] Redlines received (all versions)
- [ ] Our responses (all versions)
- [ ] Approval confirmations
- [ ] Final signed contract

### Version Control

```
contracts/
  proposal-v1.pdf
  contract-v1-sent.pdf
  contract-v2-their-redlines.pdf
  contract-v3-our-response.pdf
  contract-v4-final.pdf
  contract-signed.pdf
```

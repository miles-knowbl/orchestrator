# ADR Template

Architecture Decision Records capture significant technical decisions.

## What is an ADR?

An Architecture Decision Record documents:
- **Context** — The situation that led to the decision
- **Options** — What alternatives were considered
- **Decision** — What was chosen
- **Rationale** — Why it was chosen
- **Consequences** — What happens as a result

## When to Create an ADR

### Create ADR For

- Technology selection (language, framework, database)
- Architectural patterns (monolith vs microservices, event sourcing)
- Security approaches (auth mechanism, encryption)
- Integration strategies (sync vs async, push vs pull)
- Data modeling decisions (schema design, relationships)
- API design decisions (REST vs GraphQL, versioning)
- Infrastructure choices (cloud provider, deployment strategy)

### Don't Need ADR For

- Implementation details (how to write a specific function)
- Bug fixes (unless they reveal architectural issues)
- Temporary solutions (document as tech debt instead)
- Obvious choices (only one viable option)

## ADR Numbering

```
decisions/
├── 000-template.md           # This template
├── 001-technology-stack.md   # First decision
├── 002-auth-approach.md      # Second decision
├── 003-database-choice.md    # Third decision
└── ...
```

Numbers are sequential. Never reuse numbers.

## Template

```markdown
# ADR-[NNN]: [Short Title]

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Date

YYYY-MM-DD

## Participants

- [Name/Role] - [Author/Reviewer/Approver]
- [Name/Role] - [Author/Reviewer/Approver]

## Context

[Describe the situation that requires a decision. Include:
- What problem are we trying to solve?
- What constraints exist?
- What is the current state?
- Why is this decision needed now?]

## Decision Drivers

- [Driver 1: e.g., "Need to support 10,000 concurrent users"]
- [Driver 2: e.g., "Team has experience with Python"]
- [Driver 3: e.g., "Must integrate with existing SAP system"]

## Options Considered

### Option 1: [Name]

**Description:**
[What is this option? How would it work?]

**Pros:**
- [Pro 1]
- [Pro 2]
- [Pro 3]

**Cons:**
- [Con 1]
- [Con 2]

**Estimated Effort:** [Low/Medium/High]

### Option 2: [Name]

**Description:**
[What is this option? How would it work?]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]
- [Con 3]

**Estimated Effort:** [Low/Medium/High]

### Option 3: [Name]

**Description:**
[What is this option? How would it work?]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Estimated Effort:** [Low/Medium/High]

## Decision

**We will use [Option X]: [Name]**

[One or two sentences stating the decision clearly]

## Rationale

[Explain why this option was chosen. Address:
- How does it best meet the decision drivers?
- Why were other options rejected?
- What trade-offs are being accepted?]

## Consequences

### Positive

- [Positive consequence 1]
- [Positive consequence 2]
- [Positive consequence 3]

### Negative

- [Negative consequence 1]
- [Negative consequence 2]

### Neutral

- [Neutral consequence / change in process]

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [How to mitigate] |
| [Risk 2] | Low/Med/High | Low/Med/High | [How to mitigate] |

## Related Decisions

- ADR-[NNN]: [Related ADR title]
- ADR-[NNN]: [Related ADR title]

## References

- [Link to relevant documentation]
- [Link to research or benchmarks]
- GitHub Issue: #[number]

## Notes

[Any additional context, caveats, or future considerations]

---

*Last updated: YYYY-MM-DD*
```

## Example ADR

```markdown
# ADR-002: Authentication Approach

## Status

Accepted

## Date

2024-01-15

## Participants

- Tech Lead - Author
- Security Team - Reviewer
- CTO - Approver

## Context

We need to implement authentication for the ServiceGrid platform. The system will have:
- Web application for dispatchers
- Mobile app for technicians
- API for third-party integrations

Currently, we have no authentication system. The team has experience with both
session-based and token-based auth. We need to support offline mobile access.

## Decision Drivers

- Must support offline mobile access (technicians in areas with poor connectivity)
- Must support third-party API access
- Security team requires short-lived credentials
- Team has experience with JWT from previous projects

## Options Considered

### Option 1: Session-Based Authentication

**Description:**
Store sessions server-side in Redis. Cookie-based for web, custom header for mobile.

**Pros:**
- Simple to implement
- Easy to revoke (delete session)
- Server has full control

**Cons:**
- Requires session store (Redis)
- Doesn't work offline on mobile
- Not great for third-party APIs
- Additional infrastructure

**Estimated Effort:** Medium

### Option 2: JWT-Based Authentication

**Description:**
Use JSON Web Tokens with short expiry. Refresh tokens for long sessions.
Access tokens stored in memory (web) or secure storage (mobile).

**Pros:**
- Stateless (no session store needed)
- Works offline (until token expires)
- Standard approach for APIs
- Team has experience

**Cons:**
- Token revocation requires additional strategy
- Token size larger than session ID
- Must handle token refresh

**Estimated Effort:** Medium

### Option 3: OAuth 2.0 with External Provider

**Description:**
Use Auth0 or Okta for authentication. Delegate all auth complexity to provider.

**Pros:**
- Handles all auth complexity
- Built-in MFA, social login
- Security handled by experts

**Cons:**
- Additional cost ($$$)
- External dependency for critical path
- May not work offline
- Less control

**Estimated Effort:** Low (implementation) / High (cost)

## Decision

**We will use Option 2: JWT-Based Authentication**

We will implement JWT authentication with:
- 15-minute access token expiry
- 7-day refresh token expiry
- Refresh token rotation on use
- Redis-based revocation list for compromised tokens

## Rationale

JWT best meets our decision drivers:
1. **Offline support**: Tokens work without server contact until expiry
2. **API support**: Standard Bearer token approach
3. **Short-lived credentials**: 15-minute expiry satisfies security
4. **Team experience**: We've built JWT auth before

Sessions were rejected due to offline requirements. OAuth providers were
rejected due to cost and offline concerns.

## Consequences

### Positive

- No session store needed for normal operation
- Mobile app works offline until token expiry
- Clean API authentication story
- Standard approach, easy to understand

### Negative

- Must implement token refresh logic
- Must maintain revocation list for compromised tokens
- Tokens larger than session IDs (minor bandwidth impact)

### Neutral

- Will use Redis for revocation list only (not all sessions)

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Token theft | Medium | High | Short expiry, HTTPS only, secure storage |
| Refresh token leak | Low | High | Token rotation, device binding |
| Offline token expiry | Medium | Medium | Grace period, background refresh |

## Related Decisions

- ADR-001: Technology Stack (chose Node.js)
- ADR-003: API Design (will use REST)

## References

- OWASP JWT Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html
- RFC 7519 (JWT): https://tools.ietf.org/html/rfc7519
- GitHub Issue: #45

---

*Last updated: 2024-01-15*
```

## ADR Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Proposed   │────▶│   Accepted   │────▶│  Superseded  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    ▲
                            │                    │
                            ▼                    │
                     ┌──────────────┐            │
                     │  Deprecated  │────────────┘
                     └──────────────┘
```

### Status Definitions

| Status | Meaning |
|--------|---------|
| **Proposed** | Under discussion, not yet decided |
| **Accepted** | Decision made, actively followed |
| **Deprecated** | No longer recommended, but still understood |
| **Superseded** | Replaced by a newer ADR |

### Updating ADRs

- **Never delete** ADRs (they're history)
- **Never modify** decisions retroactively
- **Add notes** for clarifications
- **Create new ADR** to supersede old one

## Quick ADR Template

For simpler decisions:

```markdown
# ADR-[NNN]: [Title]

**Status:** Accepted
**Date:** YYYY-MM-DD

## Context
[What's the situation?]

## Decision
[What did we decide?]

## Consequences
[What happens as a result?]
```

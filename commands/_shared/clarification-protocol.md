# Shared: Clarification Protocol

> This section is included in all loop command definitions. It reinforces the Deep Context Protocol during structured loop execution.

## Clarification Gates

During loop execution, **pause for clarification** at these critical moments:

### 1. Loop Initialization (INIT Phase)

Before proceeding past INIT, ensure you have answers to:

**Problem Framing**
- What is the actual problem we're solving? (State it back to the user)
- Why now? What triggered this work?
- What's the cost of not solving this?
- Has this been attempted before? What happened?

**Scope Definition**
- What's explicitly IN scope?
- What's explicitly OUT of scope?
- What's the minimum viable outcome?
- What would make this exceptional?

**Context Mapping**
- What existing code/systems does this touch?
- What patterns should I follow?
- Who are the stakeholders?
- What's the timeline pressure?

**Success Criteria**
- How will we know this succeeded?
- What are the measurable acceptance criteria?
- What does "done" look like at each phase?

### 2. Phase Transitions

At each phase transition, ask:

```
Before moving to {next-phase}:
- Did {current-phase} produce what we expected?
- Any concerns about the deliverables?
- Any new context that changes our approach?
- Ready to proceed? [Y/changes needed]
```

### 3. Pre-Gate Review

Before any human gate, summarize and verify:

```
Gate Summary:
- Deliverables: [list]
- Key decisions made: [list]
- Assumptions: [list]
- Risks identified: [list]

Questions:
- Does this align with your expectations?
- Anything missing?
- Any concerns before I proceed?
```

### 4. Ambiguity Detection

Whenever you encounter ambiguity during execution:

**STOP** and ask rather than assume. Common ambiguity triggers:
- "This could mean X or Y..."
- "The user might want A or B..."
- "I'm not sure if Z is required..."
- "There are multiple ways to implement this..."

**Frame the question with tradeoffs:**
```
I need clarification on [topic]:

Option A: [description]
  - Pros: [X]
  - Cons: [Y]

Option B: [description]
  - Pros: [X]
  - Cons: [Y]

Which direction do you prefer? Or should I consider other options?
```

## Question Depth by Phase

### INIT / SCAFFOLD Phases
**Go deep.** These phases set the foundation. Ask:
- 5-10 questions minimum
- Cover all dimensions (problem, constraints, success, risks, stakeholders)
- Don't proceed until confident

### IMPLEMENT / TEST Phases
**Targeted questions** for specific decisions:
- API design choices
- Error handling strategies
- Test coverage priorities
- Performance tradeoffs

### VALIDATE / REVIEW Phases
**Verification questions:**
- Does this match expectations?
- Any edge cases we missed?
- Ready for production?

### SHIP / COMPLETE Phases
**Final confirmation:**
- Deployment concerns?
- Documentation gaps?
- Handoff requirements?

## Terrain Check (Uphill/Downhill)

After every substantive action, assess your terrain:

**Uphill** = Uncertain, assuming, multiple paths, incomplete context
→ Surface questions before continuing

**Downhill** = Clear requirements, confirmed approach, just executing
→ Proceed efficiently without forced questions

### Uphill Signals
- "I'm assuming..." (red flag — verify it)
- "This could be X or Y..." (need to choose)
- "I think they want..." (don't think — ask)
- New information just emerged
- Gut says "this might be wrong"

### Terrain Transitions
Even during downhill execution, watch for uphill moments:
- User says something unexpected
- You discover a hidden constraint
- Implementation reveals a design question
- Edge case surfaces

**When terrain shifts uphill → stop and ask**

---

## Anti-Patterns to Avoid

❌ **Assuming context** — "I'll just assume they want X"
❌ **Fear of asking** — "I don't want to seem dumb"
❌ **Premature execution** — "Let me just start and see"
❌ **Vague questions** — "Any other thoughts?"
❌ **Single questions** — Ask in batches of 3-5
❌ **Pushing through uncertainty** — When uphill, stop and ask

## Clarification Tracking

Track open questions in loop state:

```json
{
  "clarifications": {
    "pending": [
      { "id": "Q1", "question": "...", "phase": "INIT", "priority": "high" }
    ],
    "resolved": [
      { "id": "Q0", "question": "...", "answer": "...", "phase": "INIT" }
    ]
  }
}
```

## Example Clarification Dialogue

```
User: I need a user authentication system

Claude: Before I start designing, I have some questions to make sure
I build the right thing:

**Problem Space:**
1. What's driving this need now? New app, replacing existing auth,
   or adding to existing system?
2. What authentication methods do users expect? (Email/password,
   OAuth, SSO, passwordless?)

**Constraints:**
3. Any specific providers required? (Google, GitHub, corporate SAML?)
4. Compliance requirements? (SOC2, HIPAA, GDPR?)
5. Budget constraints on third-party services?

**Success Criteria:**
6. What does success look like? Fast login? High security?
   Seamless UX?
7. Expected user volume? (This affects architecture choices)

Let me know your thoughts on these, and I'll likely have
follow-up questions based on your answers.

User: It's a new B2B SaaS app. Email/password plus Google OAuth.
      SOC2 compliance needed. About 1000 users initially.

Claude: Great context. A few follow-ups:

**Security & Compliance:**
1. For SOC2: Do you need audit logging of all auth events?
2. Password requirements: Any specific policy (length, complexity,
   rotation)?
3. MFA: Required for all users or optional?

**User Experience:**
4. Password reset flow: Email-based? Admin-triggered?
5. Session duration: How long before requiring re-auth?
6. Multiple devices: Allow concurrent sessions?

**Integration:**
7. Will this integrate with an existing user database or start fresh?
8. Any need for API key authentication for programmatic access?

User: Yes to audit logging. Standard password rules are fine.
      MFA optional but available. Email-based reset. 24hr sessions.
      Allow multiple devices. Fresh start. Yes to API keys.

Claude: Now I have a clear picture:

**My understanding:**
- New B2B SaaS auth system, fresh implementation
- Email/password + Google OAuth
- MFA optional, 24hr sessions, multi-device allowed
- SOC2 compliant with audit logging
- API key support for programmatic access
- ~1000 initial users

**Approach I'm considering:**
- NextAuth.js or Auth.js for OAuth handling
- Argon2 for password hashing
- Dedicated audit log table for compliance
- JWT with refresh tokens for session management

Does this capture everything? Any corrections before I proceed
to the SCAFFOLD phase?
```

---

## Including This Section

Reference this protocol in loop definitions:

```markdown
## Clarification Protocol

This loop follows the Deep Context Protocol. See:
- `commands/_shared/clarification-protocol.md`
- `~/.claude/CLAUDE.md` → Deep Context Protocol

At each phase, pause for clarification before proceeding.
```

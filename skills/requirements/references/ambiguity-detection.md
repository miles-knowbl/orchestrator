# Ambiguity Detection

Finding and resolving unclear requirements.

## Why This Matters

Ambiguous requirements lead to building the wrong thing. Every ambiguity is a potential misunderstanding. Finding them early is cheap; finding them after implementation is expensive.

## Types of Ambiguity

### 1. Lexical Ambiguity

**The same word means different things.**

| Word | Possible Meanings |
|------|-------------------|
| "User" | End user? Admin? System account? |
| "Report" | PDF document? Dashboard? Email summary? |
| "Export" | Download file? API endpoint? Email delivery? |
| "Notification" | Email? Push? In-app? SMS? |
| "Active" | Currently logged in? Has recent activity? Not deleted? |

**Resolution:** Define terms explicitly in a glossary.

### 2. Syntactic Ambiguity

**Sentence structure allows multiple interpretations.**

| Ambiguous | Interpretation A | Interpretation B |
|-----------|------------------|------------------|
| "Users can edit their own posts and comments" | Users edit (their own posts) and (their own comments) | Users edit (their own posts) and (all comments) |
| "Admin can delete inactive users and orders" | Admin deletes (inactive users) and (inactive orders) | Admin deletes (inactive users) and (all orders) |
| "Show error if file is too large or invalid" | Show error if (file too large) OR (file invalid) | Show error if file is (too large or invalid) — same meaning actually, but what's "invalid"? |

**Resolution:** Rewrite for clarity or break into separate statements.

### 3. Semantic Ambiguity

**Concepts are unclear or subjective.**

| Vague Term | Questions to Clarify |
|------------|---------------------|
| "Fast" | What response time? Under what conditions? |
| "Secure" | Against what threats? What compliance standards? |
| "User-friendly" | For what users? Compared to what? |
| "Scalable" | To what scale? Users? Data? Requests? |
| "Recent" | Last hour? Day? Week? |

**Resolution:** Replace with specific, measurable criteria.

### 4. Scope Ambiguity

**Unclear what's included or excluded.**

| Statement | Ambiguity |
|-----------|-----------|
| "Support file uploads" | What file types? What sizes? Where stored? |
| "Add search functionality" | Search what? Full-text? Filters? Autocomplete? |
| "Integrate with CRM" | Which CRM? What data? One-way or two-way? |

**Resolution:** Explicitly list what's in and out of scope.

### 5. Referential Ambiguity

**Unclear what a pronoun or reference refers to.**

| Ambiguous | Problem |
|-----------|---------|
| "When the user saves it, notify them" | What is "it"? Who is "them"? |
| "This should match the existing behavior" | What existing behavior specifically? |
| "Use the standard format" | What standard? Whose standard? |

**Resolution:** Replace pronouns with specific nouns.

## Detection Techniques

### The "Which One?" Test

For every noun, ask "which one specifically?"

```markdown
Original: "Users can export their data"

Questions:
- Which users? (All users? Premium users? Admins?)
- Which data? (All data? Selected data? Their profile?)
- Export to where? (Download? Email? Cloud storage?)
- In what format? (CSV? JSON? PDF?)
```

### The "How Would You Test This?" Test

If you can't write a test, it's ambiguous.

| Requirement | Testable? |
|-------------|-----------|
| "Page should load quickly" | No — what's "quickly"? |
| "Page should load in under 2 seconds" | Yes — can measure |
| "System should be secure" | No — secure against what? |
| "Passwords must be hashed with bcrypt" | Yes — can verify |

### The "Two People" Test

Would two people build the same thing from this spec?

If two developers could interpret a requirement differently and both be "right," it's ambiguous.

### The Checklist Scan

Scan requirements for these red flags:

```markdown
### Vague Nouns
- [ ] "data" — what data specifically?
- [ ] "content" — what type of content?
- [ ] "information" — what information?
- [ ] "item" — what kind of item?
- [ ] "record" — what record?
- [ ] "resource" — what resource?

### Vague Verbs
- [ ] "manage" — what operations: create, read, update, delete?
- [ ] "handle" — what does handling involve?
- [ ] "process" — what processing steps?
- [ ] "support" — to what extent?
- [ ] "allow" — under what conditions?

### Vague Adjectives
- [ ] "appropriate" — according to whom?
- [ ] "reasonable" — by what measure?
- [ ] "relevant" — relevant to what?
- [ ] "sufficient" — how much is enough?
- [ ] "significant" — what threshold?

### Vague Adverbs
- [ ] "quickly" — how fast?
- [ ] "easily" — how easily?
- [ ] "frequently" — how often?
- [ ] "automatically" — triggered by what?
- [ ] "optionally" — who decides?

### Implicit Conditions
- [ ] Missing error cases
- [ ] Missing permission checks
- [ ] Missing edge cases
- [ ] Missing timing constraints
- [ ] Missing state dependencies
```

## Resolution Strategies

### Define in Glossary

```markdown
## Glossary

**User:** An authenticated person with an account. Does not include
admin accounts or system service accounts.

**Active User:** A user who has logged in within the last 30 days.

**Export:** Downloading a file to the user's device. Does not include
API access or email delivery.
```

### Rewrite for Clarity

| Ambiguous | Clear |
|-----------|-------|
| "Users can manage their posts" | "Users can create, edit, and delete their own posts" |
| "Handle errors appropriately" | "Display user-friendly error message, log full error to monitoring" |
| "The system should be fast" | "API responses complete in under 200ms at p95" |

### Break Into Specifics

```markdown
Ambiguous:
- "Support file uploads"

Specific:
- Users can upload files up to 10MB
- Supported formats: JPG, PNG, PDF
- Files are stored in S3
- Files are scanned for viruses before storage
- Maximum 10 files per user
```

### Provide Examples

```markdown
"Valid email format" means:
- user@example.com
- user.name@example.co.uk
- user+tag@example.com
- user@example (no TLD)
- @example.com (no local part)
- user@.com (empty domain)
```

### State Assumptions Explicitly

```markdown
### Assumptions
- Users have a maximum of 10,000 orders (based on current data)
- Export will be used monthly, not daily
- Users have stable internet connections
- Browser supports modern JavaScript (ES6+)

If any assumption is wrong, requirements may need revision.
```

## Ambiguity Checklist

When reviewing a spec:

```markdown
### Ambiguity Review

**Terminology:**
- [ ] All domain terms defined
- [ ] No vague nouns (data, content, information)
- [ ] No vague verbs (manage, handle, process)
- [ ] No vague adjectives (appropriate, reasonable)

**Scope:**
- [ ] What's included is explicit
- [ ] What's excluded is explicit
- [ ] Edge cases are addressed

**Behavior:**
- [ ] All user actions have defined outcomes
- [ ] Error cases are specified
- [ ] Permissions/access are defined

**Constraints:**
- [ ] Performance requirements are quantified
- [ ] Limits are specified (size, count, time)
- [ ] Dependencies are listed

**Testability:**
- [ ] Every requirement can be tested
- [ ] Two people would build the same thing
```

---
name: security-audit
description: "Perform comprehensive security analysis of code and systems. Identifies vulnerabilities including injection attacks, authentication flaws, data exposure, and misconfigurations. Follows OWASP guidelines and security best practices. Provides actionable remediation guidance."
phase: VALIDATE
category: engineering
version: "1.0.0"
depends_on: [implement]
tags: [security, validation, audit, owasp, core-workflow]
---

# Security Audit

Identify and remediate security vulnerabilities.

## When to Use

- **New feature** — Security review before release
- **Authentication changes** — Any auth/authz modifications
- **Data handling** — Code that processes sensitive data
- **External inputs** — APIs, file uploads, user inputs
- **Dependencies** — New or updated third-party packages
- **Pre-production** — Security gate before deployment
- When you say: "security review", "check for vulnerabilities", "audit this code"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `owasp-top-10.md` | Comprehensive vulnerability categories |
| `vulnerability-patterns.md` | Common vulnerability patterns to check |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `remediation-patterns.md` | When fixing found vulnerabilities |
| `secure-code-review.md` | When reviewing code for security |
| `dependency-security.md` | When auditing dependencies |

**Verification:** All OWASP Top 10 categories must be addressed in audit.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `SECURITY-AUDIT.md` | Project root | Always |

## Core Concept

Security audit answers: **"How could an attacker exploit this system?"**

Think like an attacker:
- What inputs can I control?
- What data can I access?
- What actions can I perform?
- What assumptions can I violate?

Security is about:
- **Confidentiality** — Preventing unauthorized data access
- **Integrity** — Preventing unauthorized data modification
- **Availability** — Preventing service disruption

## The Security Audit Process

```
┌─────────────────────────────────────────────────────────┐
│                SECURITY AUDIT PROCESS                   │
│                                                         │
│  1. UNDERSTAND THE SYSTEM                               │
│     └─→ Architecture, data flows, trust boundaries      │
│                                                         │
│  2. IDENTIFY ATTACK SURFACE                             │
│     └─→ Entry points, data inputs, external interfaces  │
│                                                         │
│  3. THREAT MODELING                                     │
│     └─→ Who attacks? What do they want? How?            │
│                                                         │
│  4. VULNERABILITY ANALYSIS                              │
│     └─→ OWASP Top 10, code patterns, dependencies       │
│                                                         │
│  5. RISK ASSESSMENT                                     │
│     └─→ Severity, likelihood, impact                    │
│                                                         │
│  6. REMEDIATION PLANNING                                │
│     └─→ Fixes, mitigations, defense in depth            │
│                                                         │
│  7. VERIFICATION                                        │
│     └─→ Test fixes, regression testing                  │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Understand the System

### System Analysis Checklist

```markdown
## Architecture
- [ ] What components exist? (frontend, API, database, cache)
- [ ] How do components communicate?
- [ ] What are the trust boundaries?
- [ ] Where is sensitive data stored?

## Data Classification
- [ ] What data is collected? (PII, credentials, financial)
- [ ] Where does data flow?
- [ ] How is data protected at rest?
- [ ] How is data protected in transit?

## Authentication & Authorization
- [ ] How do users authenticate?
- [ ] How are sessions managed?
- [ ] What authorization model is used?
- [ ] What are the privilege levels?

## External Dependencies
- [ ] What third-party services are used?
- [ ] What libraries/packages are included?
- [ ] What APIs are consumed?
```

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    TRUST BOUNDARY                       │
│  ┌─────────┐                          ┌─────────────┐  │
│  │ Browser │──HTTPS──▶│ API Gateway │──▶│ Auth Service│  │
│  └─────────┘          └──────┬──────┘  └─────────────┘  │
│       │                      │                          │
│       │                      ▼                          │
│       │               ┌─────────────┐                   │
│       │               │ App Server  │                   │
│       │               └──────┬──────┘                   │
│       │                      │                          │
│       │         ┌────────────┼────────────┐            │
│       │         ▼            ▼            ▼            │
│       │    ┌────────┐  ┌──────────┐  ┌─────────┐      │
│       │    │Database│  │  Cache   │  │  Queue  │      │
│       │    └────────┘  └──────────┘  └─────────┘      │
└───────│─────────────────────────────────────────────────┘
        │
        ▼
   [Attacker Entry Point]
```

## Step 2: Identify Attack Surface

### Attack Surface Components

| Component | Attack Vectors |
|-----------|----------------|
| **Web forms** | XSS, CSRF, injection |
| **API endpoints** | Auth bypass, injection, DoS |
| **File uploads** | Malware, path traversal, DoS |
| **URL parameters** | Injection, IDOR, open redirect |
| **Cookies/headers** | Session hijacking, injection |
| **WebSockets** | Auth bypass, injection |
| **Database queries** | SQL injection |
| **System commands** | Command injection |
| **File operations** | Path traversal |
| **Deserialization** | Remote code execution |

### Entry Point Inventory

```markdown
## API Endpoints
| Endpoint | Method | Auth | Input | Risk |
|----------|--------|------|-------|------|
| /api/users | POST | None | JSON body | High - User creation |
| /api/users/:id | GET | JWT | URL param | Medium - IDOR risk |
| /api/upload | POST | JWT | File | High - File upload |
| /api/search | GET | None | Query string | Medium - Injection |

## User Inputs
| Input | Type | Validation | Sanitization |
|-------|------|------------|--------------|
| email | String | Regex | HTML escape |
| comment | String | Length | Markdown only |
| file | Binary | Type check | Virus scan |
```

## Step 3: Threat Modeling

### STRIDE Model

| Threat | Description | Example |
|--------|-------------|---------|
| **S**poofing | Pretending to be someone else | Forged authentication |
| **T**ampering | Modifying data or code | SQL injection |
| **R**epudiation | Denying actions taken | Missing audit logs |
| **I**nformation Disclosure | Exposing data | Error messages with stack traces |
| **D**enial of Service | Making system unavailable | Resource exhaustion |
| **E**levation of Privilege | Gaining unauthorized access | Admin bypass |

### Threat Scenarios

```markdown
## Threat: Account Takeover
- **Attacker**: External malicious user
- **Goal**: Access other users' accounts
- **Method**: 
  - Credential stuffing
  - Password reset exploitation
  - Session hijacking
- **Impact**: High - Full account access
- **Mitigations**:
  - Rate limiting
  - MFA
  - Secure password reset flow

## Threat: Data Exfiltration
- **Attacker**: Malicious insider or external attacker
- **Goal**: Steal sensitive user data
- **Method**:
  - SQL injection
  - IDOR vulnerabilities
  - API abuse
- **Impact**: Critical - Data breach, compliance violation
- **Mitigations**:
  - Input validation
  - Authorization checks
  - Data encryption
```

## Step 4: Vulnerability Analysis

### OWASP Top 10 (2021)

| # | Vulnerability | Description |
|---|---------------|-------------|
| A01 | **Broken Access Control** | Users act outside intended permissions |
| A02 | **Cryptographic Failures** | Weak/missing encryption |
| A03 | **Injection** | Hostile data sent to interpreter |
| A04 | **Insecure Design** | Missing security controls |
| A05 | **Security Misconfiguration** | Improper settings |
| A06 | **Vulnerable Components** | Known vulnerabilities in dependencies |
| A07 | **Auth Failures** | Broken authentication |
| A08 | **Data Integrity Failures** | Untrusted deserialization, CI/CD issues |
| A09 | **Logging Failures** | Insufficient logging/monitoring |
| A10 | **SSRF** | Server-side request forgery |

→ See `references/owasp-top-10.md`

### Code Review Security Checklist

```markdown
## Input Validation
- [ ] All user input validated on server side
- [ ] Input length limits enforced
- [ ] Input type/format validated
- [ ] Allow-lists preferred over deny-lists

## Output Encoding
- [ ] HTML output escaped
- [ ] JSON output properly encoded
- [ ] SQL queries parameterized
- [ ] Shell commands escaped

## Authentication
- [ ] Passwords properly hashed (bcrypt/argon2)
- [ ] Session tokens sufficiently random
- [ ] Session expiration implemented
- [ ] Password requirements enforced

## Authorization
- [ ] Every endpoint checks authorization
- [ ] No direct object references without checks
- [ ] Principle of least privilege applied
- [ ] Admin functions properly protected

## Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] TLS used for all communications
- [ ] Secrets not in source code
- [ ] PII handled according to policy

## Error Handling
- [ ] Errors don't leak sensitive info
- [ ] Generic error messages to users
- [ ] Detailed errors logged securely
- [ ] Fail securely (deny by default)
```

→ See `references/secure-code-review.md`

## Step 5: Risk Assessment

### Severity Rating

| Severity | CVSS Score | Description |
|----------|------------|-------------|
| **Critical** | 9.0-10.0 | Immediate exploitation, severe impact |
| **High** | 7.0-8.9 | Easily exploitable, significant impact |
| **Medium** | 4.0-6.9 | Some exploitation difficulty, moderate impact |
| **Low** | 0.1-3.9 | Difficult to exploit, minimal impact |
| **Info** | 0.0 | Best practice, no direct security impact |

### Risk Matrix

```
                    IMPACT
                Low    Med    High   Crit
           ┌────────────────────────────────
     High  │  Med    High   Crit   Crit
LIKELIHOOD │
     Med   │  Low    Med    High   Crit
           │
     Low   │  Low    Low    Med    High
```

### Vulnerability Report Format

```markdown
## VULN-001: SQL Injection in User Search

### Summary
The user search endpoint is vulnerable to SQL injection through
the `query` parameter, allowing attackers to extract database contents.

### Severity: Critical (CVSS 9.8)

### Location
- File: `src/api/users/search.ts`
- Line: 45
- Endpoint: `GET /api/users/search?query=`

### Vulnerable Code
```typescript
const users = await db.query(
  `SELECT * FROM users WHERE name LIKE '%${query}%'`
);
```

### Proof of Concept
```
GET /api/users/search?query=' OR '1'='1' --
```

### Impact
- Full database read access
- Potential data exfiltration
- Possible privilege escalation

### Remediation
Use parameterized queries:
```typescript
const users = await db.query(
  'SELECT * FROM users WHERE name LIKE $1',
  [`%${query}%`]
);
```

### References
- CWE-89: SQL Injection
- OWASP SQL Injection Prevention
```

## Step 6: Remediation Planning

### Remediation Priority

| Priority | Timeline | Criteria |
|----------|----------|----------|
| **P0** | Immediate | Critical severity, actively exploited |
| **P1** | < 24 hours | Critical/High, easily exploitable |
| **P2** | < 1 week | High/Medium, requires specific conditions |
| **P3** | < 1 month | Medium/Low, defense in depth |
| **P4** | Backlog | Low/Info, best practices |

### Defense in Depth

```
┌─────────────────────────────────────────────────────────┐
│                  DEFENSE IN DEPTH                       │
│                                                         │
│  Layer 1: PERIMETER                                     │
│  └─→ WAF, DDoS protection, rate limiting                │
│                                                         │
│  Layer 2: NETWORK                                       │
│  └─→ Firewalls, network segmentation, TLS               │
│                                                         │
│  Layer 3: APPLICATION                                   │
│  └─→ Input validation, output encoding, auth            │
│                                                         │
│  Layer 4: DATA                                          │
│  └─→ Encryption, access controls, masking               │
│                                                         │
│  Layer 5: MONITORING                                    │
│  └─→ Logging, alerting, incident response               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Common Fixes

| Vulnerability | Fix |
|---------------|-----|
| SQL Injection | Parameterized queries |
| XSS | Context-aware output encoding |
| CSRF | CSRF tokens, SameSite cookies |
| Auth Bypass | Centralized auth middleware |
| IDOR | Authorization checks on every request |
| Sensitive Data | Encryption, tokenization |
| Hardcoded Secrets | Environment variables, secret managers |
| Vulnerable Deps | Update, patch, or replace |

→ See `references/remediation-patterns.md`

## Step 7: Verification

### Security Testing

```markdown
## Verification Checklist

### Automated Testing
- [ ] SAST (Static Analysis) scan passes
- [ ] DAST (Dynamic Analysis) scan passes
- [ ] Dependency vulnerability scan passes
- [ ] Security unit tests pass

### Manual Testing
- [ ] Attempted to exploit original vulnerability
- [ ] Tested edge cases and bypasses
- [ ] Verified fix doesn't introduce new issues
- [ ] Tested related functionality

### Regression Testing
- [ ] Existing security tests still pass
- [ ] Functionality not broken by fix
- [ ] Performance not degraded
```

### Security Test Cases

```typescript
describe('SQL Injection Prevention', () => {
  it('rejects SQL injection in search query', async () => {
    const response = await request(app)
      .get('/api/users/search')
      .query({ query: "' OR '1'='1" });
    
    // Should not return all users
    expect(response.body.length).toBeLessThan(100);
  });
  
  it('properly escapes special characters', async () => {
    const response = await request(app)
      .get('/api/users/search')
      .query({ query: "O'Brien" });
    
    expect(response.status).toBe(200);
    // Should find users with apostrophes in name
  });
});

describe('XSS Prevention', () => {
  it('escapes HTML in user-generated content', async () => {
    await createUser({ name: '<script>alert(1)</script>' });
    
    const response = await request(app).get('/api/users/1');
    
    expect(response.body.name).not.toContain('<script>');
    expect(response.body.name).toContain('&lt;script&gt;');
  });
});

describe('Authorization', () => {
  it('prevents accessing other users data', async () => {
    const user1Token = await loginAs('user1');
    
    const response = await request(app)
      .get('/api/users/user2/profile')
      .set('Authorization', `Bearer ${user1Token}`);
    
    expect(response.status).toBe(403);
  });
});
```

## Common Vulnerability Patterns

### Injection Vulnerabilities

```typescript
// SQL INJECTION - BAD
const user = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// SQL INJECTION - GOOD
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// COMMAND INJECTION - BAD
exec(`convert ${filename} output.png`);

// COMMAND INJECTION - GOOD
execFile('convert', [filename, 'output.png']);

// NOSQL INJECTION - BAD
db.users.find({ username: req.body.username, password: req.body.password });

// NOSQL INJECTION - GOOD
db.users.find({ 
  username: String(req.body.username), 
  password: String(req.body.password) 
});
```

### Authentication Vulnerabilities

```typescript
// TIMING ATTACK - BAD
if (password === storedPassword) { /* ... */ }

// TIMING ATTACK - GOOD
if (crypto.timingSafeEqual(Buffer.from(password), Buffer.from(storedPassword))) { /* ... */ }

// WEAK PASSWORD HASH - BAD
const hash = crypto.createHash('md5').update(password).digest('hex');

// STRONG PASSWORD HASH - GOOD
const hash = await bcrypt.hash(password, 12);

// INSECURE SESSION - BAD
const sessionId = `user_${Date.now()}`;

// SECURE SESSION - GOOD
const sessionId = crypto.randomBytes(32).toString('hex');
```

### Authorization Vulnerabilities

```typescript
// IDOR - BAD
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  res.json(doc); // No ownership check!
});

// IDOR - GOOD
app.get('/api/documents/:id', async (req, res) => {
  const doc = await Document.findOne({
    _id: req.params.id,
    ownerId: req.user.id  // Ownership check
  });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// PRIVILEGE ESCALATION - BAD
app.post('/api/users', async (req, res) => {
  const user = await User.create(req.body); // Accepts role from input!
});

// PRIVILEGE ESCALATION - GOOD
app.post('/api/users', async (req, res) => {
  const { email, name, password } = req.body;
  const user = await User.create({ 
    email, name, password,
    role: 'user'  // Always set role server-side
  });
});
```

→ See `references/vulnerability-patterns.md`

## Dependency Security

### Checking Dependencies

```bash
# npm audit
npm audit
npm audit fix

# Snyk
snyk test
snyk monitor

# OWASP Dependency Check
dependency-check --project MyProject --scan ./
```

### Dependency Policy

```markdown
## Dependency Security Policy

### Before Adding
- [ ] Check for known vulnerabilities
- [ ] Review maintainer activity
- [ ] Assess dependency count (prefer fewer)
- [ ] Check license compatibility

### Ongoing
- [ ] Run `npm audit` in CI
- [ ] Update dependencies monthly
- [ ] Subscribe to security advisories
- [ ] Have process for emergency patches
```

→ See `references/dependency-security.md`

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `code-review` | Security is part of review checklist |
| `architect` | Security architecture decisions |
| `implement` | Secure coding practices |
| `code-verification` | Security linting rules |
| `test-generation` | Security test cases |
| `spec` | Security requirements in specs |

## Key Principles

**Defense in depth.** Multiple layers of protection.

**Least privilege.** Minimum permissions necessary.

**Fail secure.** Deny by default on errors.

**Don't trust input.** Validate everything from outside trust boundary.

**Keep secrets secret.** Never in code, logs, or error messages.

**Stay updated.** Patch vulnerabilities promptly.

## Mode-Specific Behavior

Security audit scope and requirements differ by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full system audit |
| **Approach** | Comprehensive—all OWASP Top 10 categories |
| **Patterns** | Free choice—establish security baseline |
| **Deliverables** | Full SECURITY-AUDIT.md |
| **Validation** | Standard—all dependencies audited |
| **Constraints** | Minimal—blocks SHIP phase on findings |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific + integration points |
| **Approach** | Extend existing—categories relevant to gap |
| **Patterns** | Should match existing security patterns |
| **Deliverables** | Delta security assessment |
| **Validation** | Existing controls + new gap coverage |
| **Constraints** | Don't weaken existing security—blocks gap completion |

**Polish considerations:**
- Does gap introduce new attack surface?
- Are existing security patterns followed?
- Do new dependencies have vulnerabilities?
- Does gap affect auth/authz?
- Is sensitive data handling consistent?

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change impact only |
| **Approach** | Surgical—all OWASP categories mandatory |
| **Patterns** | Must conform exactly—no security control changes |
| **Deliverables** | Security impact assessment with sign-off |
| **Validation** | Full regression + penetration testing may be required |
| **Constraints** | Requires approval—security team must sign off |

**Enterprise security requirements:**
- Security audit is mandatory for all changes
- Security team must approve before merge
- Any security finding blocks deployment
- Penetration testing may be required
- Compliance documentation required

**Enterprise security checklist:**
- [ ] Change reviewed against all OWASP categories
- [ ] No new vulnerabilities introduced
- [ ] Existing security controls not weakened
- [ ] Security team sign-off obtained
- [ ] Compliance requirements verified

**Enterprise security sign-off:**
```markdown
## Security Approval: CR-12345

**Reviewed by:** Security Team
**Date:** 2024-01-17
**Decision:** APPROVED / APPROVED WITH CONDITIONS / REJECTED

**Findings:** None / [List findings]
**Conditions:** None / [List conditions]
```

---

## References

- `references/owasp-top-10.md`: Detailed OWASP Top 10 analysis
- `references/secure-code-review.md`: Security-focused code review
- `references/vulnerability-patterns.md`: Common vulnerabilities and fixes
- `references/remediation-patterns.md`: Remediation strategies
- `references/dependency-security.md`: Third-party dependency security

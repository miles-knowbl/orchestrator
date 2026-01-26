# Symptom Specification

How to describe bugs precisely.

## Why This Matters

Vague bug reports lead to vague debugging. "It doesn't work" could be a thousand different problems. Precise symptoms narrow the search space and make hypotheses easier to generate and test.

## The Bug Specification Template

```markdown
## Bug: [One-line summary]

### What happens
[Precise description of the incorrect behavior]

### What should happen
[Expected behavior]

### Error details
[Exact error message, stack trace, logs - copy/paste, don't paraphrase]

### Steps to reproduce
1. [First step]
2. [Second step]
3. [Bug occurs]

### Environment
- Version/commit: [specific version]
- OS: [if relevant]
- Browser: [if relevant]
- Configuration: [relevant settings]

### Frequency
[Always / Sometimes / Once]
[If sometimes: conditions that seem to affect it]

### When it started
[Date/time or after which change]

### Related context
[Recent changes, similar past bugs, relevant business context]
```

## Precision Techniques

### Describe Behavior, Not Interpretation

| Imprecise (Interpretation) | Precise (Behavior) |
|---------------------------|-------------------|
| "Login is broken" | "Login form returns 401 with valid credentials" |
| "It's slow" | "Page load takes 12 seconds, was 2 seconds" |
| "Data is wrong" | "Order total shows $0.00, should be $47.99" |
| "It crashed" | "Node process exits with code 137 (OOM)" |

### Quantify When Possible

| Vague | Quantified |
|-------|------------|
| "Sometimes fails" | "Fails 3 out of 10 times" |
| "It's slow" | "Response time is 8,000ms, expected 200ms" |
| "After a while" | "After 30 minutes of operation" |
| "Under load" | "At 500 concurrent connections" |

### Capture Exact Error Messages

**Bad:**
> It says something about connection being refused

**Good:**
> Error: connect ECONNREFUSED 127.0.0.1:5432
>     at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)

### Include Stack Traces

Stack traces show:
- Where the error occurred
- The call chain that led there
- Which file/line to investigate

**Read stack traces bottom-to-top** for call flow, top-to-bottom for immediate cause.

### Note What Changed

| Change Type | How It Helps |
|-------------|--------------|
| Code changes | `git diff` since it last worked |
| Deploys | Correlation with deploy time |
| Config changes | Environment variable diffs |
| Data changes | New/modified records |
| External changes | Dependencies, APIs, infrastructure |

## Symptom Categories

### Error Symptoms

Questions to answer:
- What is the exact error message?
- What is the error code/type?
- Is there a stack trace?
- Which operation triggered it?
- Is it consistent or intermittent?

### Behavioral Symptoms

Questions to answer:
- What does the system do?
- What should it do instead?
- Are there side effects? (data changed, emails sent, etc.)
- Is the behavior consistent?

### Performance Symptoms

Questions to answer:
- What metric is affected? (latency, throughput, CPU, memory)
- What are the current values?
- What are the expected values?
- When did it change?
- Is it constant or variable?

### Data Symptoms

Questions to answer:
- What data is wrong?
- What should it be?
- When did it become wrong?
- Which records are affected? (all, some, pattern)
- Can you see the correct data somewhere else?

## Environment Specification

### What to Capture

| Component | Details to Include |
|-----------|-------------------|
| Application | Version, commit SHA, build date |
| Runtime | Node version, Python version, etc. |
| Database | Version, schema version, relevant data |
| OS | Version, architecture |
| Browser | Name, version, extensions |
| Network | VPN, proxy, firewall |
| Config | Relevant environment variables |

### Environment Comparison

If it works in one environment and not another:

```markdown
## Working Environment
- Node 18.17.0
- PostgreSQL 14.1
- Redis 6.2
- Env: development

## Failing Environment
- Node 18.19.0  ← Version difference
- PostgreSQL 14.1
- Redis 7.0     ← Version difference
- Env: staging
```

Differences are prime suspects.

## Reproduction Quality

| Level | Description | Debuggability |
|-------|-------------|---------------|
| **Deterministic** | Happens every time with specific steps | Easy |
| **Statistical** | Happens X% of the time | Medium |
| **Environmental** | Happens only in certain environments | Medium |
| **Temporal** | Happens after N minutes/hours | Hard |
| **Heisenbug** | Disappears when you observe it | Very hard |
| **One-time** | Happened once, can't reproduce | Hardest |

For non-deterministic bugs, capture as much context as possible from the occurrence.

## Output Format

When specifying a symptom:

```markdown
## Bug Specification

### Summary
User authentication fails silently on mobile Safari

### What Happens
User enters valid credentials, clicks login, form resets to empty state.
No error message displayed, no network error in console.

### What Should Happen
User should be redirected to dashboard, or see error message if auth fails.

### Error Details
No JavaScript errors in console.
Network tab shows POST /api/auth returns 200 OK.
Response body: {"success": true, "token": "eyJ..."}

### Steps to Reproduce
1. Open app in Safari on iOS 16
2. Enter valid email/password
3. Tap "Login"
4. Observe: form clears, stays on login page

### Environment
- iOS 16.4, Safari
- App version: 2.1.0
- API version: production (v3.2.1)

### Frequency
Always on iOS Safari
Never on Chrome, Firefox, or Safari macOS

### When It Started
First reported: Jan 15
Possibly after deploy of v2.1.0 on Jan 14

### Related Context
v2.1.0 included refactor of auth flow to use new cookie settings.
Safari has stricter third-party cookie handling.
```

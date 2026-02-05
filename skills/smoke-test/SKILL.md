---
name: smoke-test
description: "Verifies critical features actually work by calling live endpoints. Unlike integration-test (which writes test code), this skill executes manual verification against deployed/running services. Essential for audit-loop to catch functional regressions."
phase: VERIFY
category: engineering
version: "1.0.0"
depends_on: []
tags: [testing, verification, live-testing, audit, functional]
---

# Smoke Test

Verify critical features actually work by calling live endpoints.

## When to Use

- **During audits** — Verify features work, not just that code looks correct
- **After deployment** — Confirm deployed services respond correctly
- **Before sign-off** — Validate critical paths function end-to-end
- **Regression detection** — Catch broken features that static analysis misses

## Why This Skill Exists

Static code analysis can verify:
- Code patterns are correct
- Types are valid
- Security patterns are followed

Static code analysis **CANNOT** verify:
- The endpoint actually returns data
- AI integrations are properly configured
- Third-party services are connected
- The feature works end-to-end

**This skill fills that gap.**

## Core Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION SPECTRUM                        │
│                                                                 │
│  Static Analysis        Smoke Test           Full E2E          │
│  ──────────────        ──────────           ────────           │
│  Reads code            Calls endpoints      Full user flow     │
│  Fast, shallow         Medium, targeted     Slow, comprehensive│
│                                                                 │
│  "Does code look       "Does endpoint       "Does entire       │
│   correct?"             respond?"            workflow work?"   │
│                                                                 │
│  ┌───────────┐         ┌───────────┐        ┌───────────┐     │
│  │   Code    │         │   API     │        │  Browser  │     │
│  │  Review   │         │   Call    │        │   Test    │     │
│  └───────────┘         └───────────┘        └───────────┘     │
│                                                                 │
│  audit-loop            audit-loop           CI/CD pipeline     │
│  REVIEW phase          VERIFY phase         pre-deploy         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Smoke Test Process

### Step 1: Identify Critical Paths

For any system, identify the **must-work** features:

```markdown
## Critical Paths: [System Name]

### P0 - System Unusable If Broken
| Feature | Endpoint/Action | Expected Behavior |
|---------|-----------------|-------------------|
| User login | POST /auth/login | Returns JWT |
| Core generation | POST /generate | Returns content |
| Data retrieval | GET /items | Returns items |

### P1 - Major Feature Broken
| Feature | Endpoint/Action | Expected Behavior |
|---------|-----------------|-------------------|
| Secondary feature | POST /feature-b | Returns result |
| Export | GET /export | Returns file |
```

### Step 2: Execute Verification

For each critical path, actually call the endpoint:

```bash
# Example: Verify edge function works
curl -X POST https://project.supabase.co/functions/v1/generate-image \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source_ids": ["test-source"], "mode": "archetype"}' \
  | jq '.status, .error'
```

### Step 3: Document Results

```markdown
## Smoke Test Results

| Feature | Status | Response | Notes |
|---------|--------|----------|-------|
| generate-image | FAIL | 500 | "Cannot read property 'content'" |
| generate-article | PASS | 200 | Returns job ID |
| chat endpoint | FAIL | 401 | Auth misconfigured |
| enrich-source | PASS | 200 | Returns enrichment |
```

### Step 4: Classify Failures

| Severity | Criteria | Action |
|----------|----------|--------|
| **CRITICAL** | Core feature completely broken | Block deployment |
| **HIGH** | Major feature degraded | Urgent fix required |
| **MEDIUM** | Secondary feature broken | Fix in next sprint |
| **LOW** | Edge case failure | Backlog |

## Deliverables

| Deliverable | Location | Contents |
|-------------|----------|----------|
| `SMOKE-TEST.md` | Project root | Test results, failures, recommendations |

### SMOKE-TEST.md Template

```markdown
# Smoke Test Report

**Date:** YYYY-MM-DD
**Environment:** production / staging / local
**Tester:** [name/agent]

## Summary

| Status | Count |
|--------|-------|
| PASS | X |
| FAIL | Y |
| SKIP | Z |

## Critical Path Results

### P0 Features (Must Work)

| Feature | Status | Response | Evidence |
|---------|--------|----------|----------|
| [name] | PASS/FAIL | [code] | [details] |

### P1 Features (Should Work)

| Feature | Status | Response | Evidence |
|---------|--------|----------|----------|
| [name] | PASS/FAIL | [code] | [details] |

## Failures

### [CRITICAL] Feature Name

**Endpoint:** POST /api/feature
**Expected:** 200 with data
**Actual:** 500 Internal Server Error

**Response:**
```json
{
  "error": "Cannot read property 'foo' of undefined"
}
```

**Root Cause Hypothesis:** [analysis]
**Recommended Fix:** [suggestion]

## Test Commands

```bash
# Commands used for verification
curl ...
```

## Conclusion

[Summary of system health based on smoke test results]
```

## Integration with Audit Loop

The audit-loop should include smoke-test in its VALIDATE phase:

```json
{
  "phases": {
    "VALIDATE": {
      "status": "pending",
      "skills": ["smoke-test", "integration-test", "code-verification"]
    }
  }
}
```

**Execution order:**
1. `smoke-test` — Call live endpoints, identify broken features
2. `integration-test` — Verify test coverage for working features
3. `code-verification` — Verify findings against code

**Why smoke-test first:**
- Catches critical failures immediately
- Prevents wasting time analyzing code that doesn't work
- Provides concrete evidence of problems

## Environment Detection

Smoke test should auto-detect the environment:

```javascript
// Detect environment from project files
const envConfig = {
  supabase: {
    url: process.env.SUPABASE_URL || readFromEnvFile('.env'),
    anonKey: process.env.SUPABASE_ANON_KEY || readFromEnvFile('.env')
  },
  endpoints: detectEdgeFunctions('supabase/functions/'),
  localDev: detectLocalServer('package.json')
};
```

## What to Test

### For Supabase Edge Functions

```bash
# List all edge functions
ls supabase/functions/

# Test each one that should be publicly callable
for fn in generate-image generate-article chat enrich-source; do
  echo "Testing $fn..."
  curl -X POST "$SUPABASE_URL/functions/v1/$fn" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"test": true}'
done
```

### For REST APIs

```bash
# Health check
curl "$API_URL/health"

# Auth endpoints
curl -X POST "$API_URL/auth/login" -d '{"test": true}'

# Core CRUD
curl "$API_URL/items"
```

### For Frontend + Backend Integration

```bash
# Start local dev server
npm run dev &

# Wait for server
sleep 5

# Test key pages load
curl -s http://localhost:3000 | grep -q "<!DOCTYPE" && echo "PASS" || echo "FAIL"

# Test API routes
curl http://localhost:3000/api/health
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `integration-test` | Writes test code; smoke-test executes manual verification |
| `code-verification` | Verifies code patterns; smoke-test verifies runtime behavior |
| `deploy` | Deploys code; smoke-test verifies deployment worked |
| `architecture-review` | Reviews design; smoke-test verifies implementation |

## Key Principles

**Call the actual endpoint.** Don't assume code that looks correct works.

**Test in the real environment.** Mocks hide integration failures.

**Document evidence.** Include actual response bodies, not just pass/fail.

**Prioritize by impact.** Test P0 features first.

**Fail fast.** If core features are broken, stop and report immediately.

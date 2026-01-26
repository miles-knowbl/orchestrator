# INTEGRATION-TEST.md Template

## Integration Test Plan: {{system-name}}

**Domain:** {{domain}}
**Date:** {{date}}
**Systems Under Test:** {{systems}}

---

## Test Scope

### In Scope
- {{component-1}} ↔ {{component-2}} integration
- {{external-service}} connectivity
- End-to-end {{flow-name}} flow

### Out of Scope
- Unit-level testing (covered by unit tests)
- Performance testing (separate perf-analysis)
- Security testing (separate security-audit)

---

## Test Scenarios

### Scenario 1: {{scenario-name}}

**Description:** {{what-is-being-tested}}

**Preconditions:**
- {{precondition-1}}
- {{precondition-2}}

**Steps:**
1. {{step-1}}
2. {{step-2}}
3. {{step-3}}

**Expected Result:**
- {{expected-1}}
- {{expected-2}}

**Actual Result:** {{pass/fail}}

---

### Scenario 2: {{scenario-name}}

...

---

## Environment Setup

```bash
# Start dependencies
{{setup-commands}}

# Run integration tests
{{test-commands}}

# Cleanup
{{cleanup-commands}}
```

---

## Test Results Summary

| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| {{name}} | ✅/❌ | {{s}}s | |

**Total:** {{pass}}/{{total}} passed
**Duration:** {{m}}m {{s}}s

---

## Issues Found

| ID | Scenario | Issue | Severity | Status |
|----|----------|-------|----------|--------|
| 1 | {{name}} | {{issue}} | {{H/M/L}} | {{status}} |

---

**Tested by:** {{agent}}
**Date:** {{date}}

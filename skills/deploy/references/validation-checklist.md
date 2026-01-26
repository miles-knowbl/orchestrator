# Validation Checklist Reference

Systematic validation before, during, and after deployment reduces incidents. This reference provides checklists for deployment validation across environments.

## Pre-Deployment Validation

### Code Readiness

| Check | Command / Action | Pass Criteria |
|-------|------------------|---------------|
| All tests pass | `npm test` | Exit code 0, no skipped tests |
| Build succeeds | `npm run build` | No errors, output matches expected |
| Linting clean | `npm run lint` | Zero warnings, zero errors |
| Type checking passes | `npx tsc --noEmit` | No type errors |
| No debug code | Search for `console.log`, `debugger` | None in production paths |
| Dependencies audited | `npm audit` | No critical/high vulnerabilities |
| Environment variables documented | Review `.env.example` | All new vars documented and set |

### Change Readiness

| Check | Pass Criteria |
|-------|---------------|
| PR approved | At least 1 approval, no blocking comments |
| Staging tested | All critical paths verified |
| Migration reviewed | Backward-compatible, rollback tested |
| Feature flags configured | Flags set to correct default state |
| Rollback plan documented | Clear steps, estimated time, owner |

### Infrastructure Readiness

| Check | Pass Criteria |
|-------|---------------|
| Target environment healthy | All services green |
| Sufficient resources | >30% headroom available |
| No conflicting deploys | No other team deploying |
| Backup verified | Point-in-time recovery available |
| SSL certificates valid | >30 days remaining |

## Post-Deployment Smoke Tests

| Test | Method | Expected Result | Timeout |
|------|--------|-----------------|---------|
| Health endpoint | `GET /health` | 200 with `status: ok` | 5s |
| Homepage loads | `GET /` | 200, key content present | 10s |
| Authentication works | Login with test account | Session created | 15s |
| API responds | `GET /api/v1/status` | 200 with valid JSON | 5s |
| Database connected | Health check includes DB | DB status: ok | 5s |
| Static assets served | Check CSS/JS loads | 200, correct content-type | 5s |

### Smoke Test Script
```bash
#!/bin/bash
set -euo pipefail
BASE_URL="${1:?Usage: smoke-test.sh <base-url>}"
FAILURES=0

smoke() {
  local name="$1" url="$2" expected="$3"
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")
  if [ "$status" = "$expected" ]; then
    echo "  PASS  $name (HTTP $status)"
  else
    echo "  FAIL  $name (expected $expected, got $status)"
    FAILURES=$((FAILURES + 1))
  fi
}

smoke "Health check" "$BASE_URL/health" "200"
smoke "Homepage"     "$BASE_URL/"       "200"
smoke "API status"   "$BASE_URL/api/v1/status" "200"
smoke "404 handling" "$BASE_URL/nonexistent"   "404"

[ "$FAILURES" -gt 0 ] && echo "ROLLBACK RECOMMENDED" && exit 1
echo "All smoke tests passed" && exit 0
```

## Environment-Specific Checks

### Staging
| Check | Notes |
|-------|-------|
| Production-like data present | Anonymized production data or realistic seed |
| External integrations connected | Sandbox/test credentials for third parties |
| Performance baseline established | Response times within 2x of production |
| Migration applied cleanly | Schema matches expected state |
| Notifications go to test targets | No real users contacted |

### Production
| Check | Notes |
|-------|-------|
| Version endpoint returns new version | Deployment actually applied |
| Error rate not elevated | Compare to 1-hour pre-deploy baseline |
| No new error types in logs | Scan for novel error messages |
| External integrations working | Payments, email, webhooks operational |
| CDN cache invalidated (if applicable) | Users see new assets |

## Stakeholder Sign-Off

### Pre-Deploy

| Role | Responsibility | Sign-Off Method |
|------|----------------|-----------------|
| Engineering Lead | Code quality, architecture | PR approval |
| QA / Test Lead | Test coverage, staging validation | Test report |
| Product Owner | Feature completeness | Acceptance in ticket |
| DBA (if migration) | Migration safety | Migration review approved |

### Post-Deploy

| Role | Confirms | Timeframe |
|------|----------|-----------|
| Deploying Engineer | Smoke tests pass, metrics nominal | T+5 minutes |
| Engineering Lead | No elevated errors | T+30 minutes |
| Product Owner | Feature works as expected | T+1 hour |

## Incident Response if Validation Fails

### Decision Tree
```
Smoke test failed?
  Single non-critical endpoint --> Log issue, fix forward
  Error rate > 2x baseline    --> ROLLBACK IMMEDIATELY
  Fixable in < 15 minutes     --> Hotfix and redeploy
  Otherwise                   --> ROLLBACK, fix in next deploy
```

### Rollback Triggers (Immediate)

| Condition | Threshold |
|-----------|-----------|
| Service completely down | Health check returning 5xx or timeout |
| Error rate spike | >5x baseline for >2 minutes |
| Data integrity risk | Any indication of corrupt writes |
| Security vulnerability | Exposed credentials, broken auth |
| Payment processing broken | Any failures above baseline |

### Post-Incident Steps

1. **Stabilize**: Confirm rollback successful, services healthy
2. **Communicate**: Notify stakeholders of rollback and timeline
3. **Investigate**: Root cause analysis within 24 hours
4. **Document**: Incident report with timeline and lessons
5. **Prevent**: Add test coverage or monitoring for the failure mode
6. **Re-attempt**: Fix, re-validate in staging, re-deploy with extra monitoring

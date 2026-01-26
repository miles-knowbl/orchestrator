# Failure Taxonomy Reference

MECE classification of failure states with recovery procedures.

---

## Purpose

A failure taxonomy enables:
1. **Systematic handling** — Known failures have known fixes
2. **Faster recovery** — No reinventing solutions
3. **Prevention** — Learn from past failures
4. **Calibration** — Track failure rates by type

---

## Taxonomy Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FAILURE TAXONOMY (MECE)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ENVIRONMENT FAILURES                                                    │
│     └── Setup, dependencies, configuration                                  │
│                                                                             │
│  2. BUILD FAILURES                                                          │
│     └── Compilation, bundling, asset processing                             │
│                                                                             │
│  3. TEST FAILURES                                                           │
│     └── Unit, integration, E2E test failures                                │
│                                                                             │
│  4. VERIFICATION FAILURES                                                   │
│     └── Lint, type check, static analysis                                   │
│                                                                             │
│  5. RUNTIME FAILURES                                                        │
│     └── Crashes, errors during execution                                    │
│                                                                             │
│  6. DATA FAILURES                                                           │
│     └── Schema, migration, validation issues                                │
│                                                                             │
│  7. INTEGRATION FAILURES                                                    │
│     └── API, service, external dependency issues                            │
│                                                                             │
│  8. DEPLOYMENT FAILURES                                                     │
│     └── CI/CD, hosting, infrastructure issues                               │
│                                                                             │
│  9. COORDINATION FAILURES                                                   │
│     └── Multi-agent conflicts, locks, merges                                │
│                                                                             │
│  10. SCOPE FAILURES                                                         │
│      └── Requirements, spec, estimation issues                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Category 1: Environment Failures

### E1.1: Missing Dependencies

**Symptoms:**
- `Module not found` errors
- `Package X is not installed`
- Import errors at startup

**Recovery:**
```bash
# Node.js
npm install
# or
yarn install

# Python
pip install -r requirements.txt

# Check for peer dependencies
npm ls
```

**Prevention:**
- Lock files committed (package-lock.json)
- CI runs fresh install
- Document system dependencies in README

### E1.2: Wrong Node/Python/Runtime Version

**Symptoms:**
- Syntax errors on valid code
- API not available errors
- `Unsupported engine` warnings

**Recovery:**
```bash
# Check required version in package.json engines
# Use nvm/pyenv to switch
nvm use
# or
nvm install $(cat .nvmrc)
```

**Prevention:**
- `.nvmrc` or `.python-version` in repo
- CI enforces version
- README documents requirements

### E1.3: Environment Variables Missing

**Symptoms:**
- `undefined` config values
- Connection failures
- Auth failures

**Recovery:**
```bash
# Check .env.example for required vars
cp .env.example .env
# Fill in values
```

**Prevention:**
- `.env.example` with all required vars
- Startup validation of required env vars
- Clear error messages when missing

### E1.4: Port Already in Use

**Symptoms:**
- `EADDRINUSE` error
- Server won't start

**Recovery:**
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 {PID}
# Or use different port
PORT=3001 npm start
```

**Prevention:**
- Configurable ports
- Graceful shutdown in dev
- Check port before starting

---

## Category 2: Build Failures

### B2.1: TypeScript Compilation Error

**Symptoms:**
- Type errors
- `tsc` fails
- Red squiggles in editor

**Recovery:**
1. Read error message carefully
2. Fix type issue (add types, fix logic)
3. If stuck, check tsconfig.json settings
4. As last resort, use `// @ts-ignore` (document why)

**Prevention:**
- Strict mode from start
- Type tests on commit
- Good IDE integration

### B2.2: Module Resolution Failure

**Symptoms:**
- `Cannot find module`
- Path alias not working

**Recovery:**
```bash
# Check tsconfig paths
# Check bundler config (vite, webpack)
# Verify file exists at path
```

**Prevention:**
- Consistent path strategy
- Test path aliases in CI
- Document path configuration

### B2.3: Asset Processing Failure

**Symptoms:**
- CSS/SCSS build fails
- Image optimization fails
- Bundle too large

**Recovery:**
- Check asset source files
- Verify preprocessor config
- Check for corrupt files

**Prevention:**
- Asset validation in CI
- Size budgets
- Consistent asset pipeline

---

## Category 3: Test Failures

### T3.1: Unit Test Failure

**Symptoms:**
- Test assertion fails
- Expected vs actual mismatch

**Recovery:**
1. Read test failure output
2. Determine if test or code is wrong
3. Fix the bug or update the test
4. Run test in isolation to verify

**Prevention:**
- TDD where appropriate
- Clear test descriptions
- Test one thing per test

### T3.2: Integration Test Failure

**Symptoms:**
- API test fails
- Database test fails
- Service interaction fails

**Recovery:**
1. Check if dependencies are running
2. Check if test database is seeded
3. Look for race conditions
4. Check for environment differences

**Prevention:**
- Isolated test databases
- Proper test fixtures
- Retry flaky tests (with caution)

### T3.3: E2E Test Failure

**Symptoms:**
- Browser test fails
- Element not found
- Timeout

**Recovery:**
1. Run test with headed browser
2. Add wait conditions
3. Check for UI changes
4. Verify test environment matches prod

**Prevention:**
- Stable selectors (data-testid)
- Explicit waits over implicit
- Test in CI with same env as local

### T3.4: Flaky Test

**Symptoms:**
- Test passes sometimes, fails sometimes
- Different results in CI vs local

**Recovery:**
1. Identify source of flakiness (timing, order, state)
2. Add proper synchronization
3. Isolate test state
4. Consider quarantine while fixing

**Prevention:**
- Avoid shared state
- Explicit waits
- Deterministic test data
- Run tests multiple times in CI

---

## Category 4: Verification Failures

### V4.1: Lint Error

**Symptoms:**
- ESLint/Prettier errors
- Style violations

**Recovery:**
```bash
# Auto-fix what's possible
npm run lint -- --fix
# Manual fix remaining
```

**Prevention:**
- Pre-commit hooks
- Editor integration
- CI lint check

### V4.2: Type Error

**Symptoms:**
- TypeScript errors
- Type mismatch

**Recovery:**
1. Understand what type is expected
2. Fix code to match type
3. Or update type if code is correct
4. Avoid `any` escape hatch

**Prevention:**
- Strict TypeScript config
- Good type definitions
- Type tests

### V4.3: Security Vulnerability

**Symptoms:**
- `npm audit` findings
- Dependency vulnerabilities

**Recovery:**
```bash
# Check what's vulnerable
npm audit
# Update if possible
npm update {package}
# Or use resolution/override
```

**Prevention:**
- Regular dependency updates
- Automated security scanning
- Minimal dependencies

---

## Category 5: Runtime Failures

### R5.1: Unhandled Exception

**Symptoms:**
- App crashes
- Stack trace in logs
- 500 errors

**Recovery:**
1. Read stack trace
2. Identify root cause
3. Add error handling
4. Fix underlying bug

**Prevention:**
- Global error handlers
- Try-catch at boundaries
- Error monitoring (Sentry)

### R5.2: Memory Leak

**Symptoms:**
- Growing memory usage
- Eventually crashes
- Slow performance

**Recovery:**
1. Profile with heap snapshots
2. Identify retained objects
3. Fix cleanup/disposal

**Prevention:**
- Cleanup in useEffect/componentWillUnmount
- Weak references where appropriate
- Memory tests for long-running processes

### R5.3: Performance Degradation

**Symptoms:**
- Slow responses
- High CPU usage
- Timeouts

**Recovery:**
1. Profile to find bottleneck
2. Optimize hot paths
3. Add caching
4. Consider scaling

**Prevention:**
- Performance budgets
- Regular profiling
- Load testing

---

## Category 6: Data Failures

### D6.1: Schema Mismatch

**Symptoms:**
- Database errors
- Missing columns
- Type mismatches

**Recovery:**
1. Check current schema vs expected
2. Generate/apply migration
3. Verify data integrity

**Prevention:**
- Always use migrations
- Test migrations up and down
- Schema validation at startup

### D6.2: Migration Failure

**Symptoms:**
- Migration won't apply
- Partial migration state
- Data corruption

**Recovery:**
1. Check migration status
2. Rollback if possible
3. Fix migration and reapply
4. May need manual DB fix

**Prevention:**
- Test migrations on copy of prod data
- Reversible migrations
- Backup before migrate

### D6.3: Validation Failure

**Symptoms:**
- Invalid data accepted
- Constraint violations
- Data integrity issues

**Recovery:**
1. Add missing validation
2. Fix existing bad data
3. Prevent future bad data

**Prevention:**
- Validation at all boundaries
- Database constraints
- Type-safe schemas (Zod)

---

## Category 7: Integration Failures

### I7.1: API Contract Violation

**Symptoms:**
- Unexpected response format
- Missing fields
- Type errors from API

**Recovery:**
1. Check API documentation
2. Update client expectations
3. Add defensive parsing
4. Contact API owner if their bug

**Prevention:**
- Contract testing
- API versioning
- Response validation

### I7.2: External Service Unavailable

**Symptoms:**
- Timeouts
- Connection refused
- 503 errors

**Recovery:**
1. Check service status
2. Implement retry with backoff
3. Fall back to cached data
4. Graceful degradation

**Prevention:**
- Circuit breakers
- Fallback strategies
- Health checks
- Timeout configuration

### I7.3: Rate Limiting

**Symptoms:**
- 429 errors
- Requests rejected
- Quota exceeded

**Recovery:**
1. Implement backoff
2. Queue requests
3. Request quota increase
4. Cache responses

**Prevention:**
- Rate limit awareness
- Request batching
- Caching layer
- Monitor usage

---

## Category 8: Deployment Failures

### D8.1: CI Pipeline Failure

**Symptoms:**
- Build fails in CI
- Tests pass local, fail CI
- Deployment blocked

**Recovery:**
1. Check CI logs
2. Identify difference from local
3. Fix environment/config
4. Retry

**Prevention:**
- Local CI simulation (act)
- Same versions local/CI
- Cached dependencies

### D8.2: Container Build Failure

**Symptoms:**
- Docker build fails
- Image too large
- Missing dependencies in container

**Recovery:**
1. Check Dockerfile
2. Multi-stage builds for size
3. Verify all deps copied

**Prevention:**
- .dockerignore
- Multi-stage builds
- Regular image updates

### D8.3: Production Deploy Failure

**Symptoms:**
- Deploy fails
- App won't start in prod
- Health check fails

**Recovery:**
1. Check deploy logs
2. Verify env vars in prod
3. Rollback if needed
4. Fix and redeploy

**Prevention:**
- Staging environment
- Health checks
- Rollback automation
- Blue-green deploys

---

## Category 9: Coordination Failures

### C9.1: Merge Conflict

**Symptoms:**
- Git conflict markers
- Can't merge branches
- CI fails on merge

**Recovery:**
1. Identify conflicting changes
2. Determine correct resolution
3. Resolve conflicts
4. Test merged result

**Prevention:**
- Smaller, more frequent merges
- Clear system boundaries
- Communication between agents

### C9.2: Lock Contention

**Symptoms:**
- Agent waiting on lock
- Timeout acquiring lock
- Deadlock

**Recovery:**
1. Check lock holder
2. Wait or request release
3. Force release if expired
4. Retry operation

**Prevention:**
- Short lock durations
- Lock ordering (prevent deadlock)
- Timeout + retry

### C9.3: State Inconsistency

**Symptoms:**
- Agents have different view of state
- Actions based on stale data
- Conflicting operations

**Recovery:**
1. Identify source of truth
2. Sync all agents to truth
3. Replay if needed

**Prevention:**
- Single source of truth
- Atomic updates
- Event-driven state changes

---

## Category 10: Scope Failures

### S10.1: Missing Requirement

**Symptoms:**
- Feature incomplete
- User reports missing functionality
- Gap discovered late

**Recovery:**
1. Document the requirement
2. Estimate impact
3. Add to current or next loop
4. Implement

**Prevention:**
- Thorough scope discovery
- User feedback early
- Comprehensive specs

### S10.2: Spec Ambiguity

**Symptoms:**
- Implementation doesn't match intent
- Multiple interpretations possible
- Rework needed

**Recovery:**
1. Clarify with user/stakeholder
2. Document clarification
3. Adjust implementation

**Prevention:**
- Concrete examples in specs
- Review specs before implementing
- Ask clarifying questions

### S10.3: Underestimation

**Symptoms:**
- Taking longer than expected
- Scope larger than thought
- More loops needed

**Recovery:**
1. Re-estimate remaining work
2. Adjust expectations
3. Consider scope reduction
4. Learn for calibration

**Prevention:**
- Conservative estimates
- Buffer for unknowns
- Calibration from history
- Break down large items

---

## Failure Handling Protocol

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FAILURE HANDLING PROTOCOL                               │
│                                                                             │
│  1. DETECT                                                                  │
│     • Automated (test failure, build error)                                 │
│     • Manual (review, user report)                                          │
│                                                                             │
│  2. CLASSIFY                                                                │
│     • Identify category from taxonomy                                       │
│     • Determine severity                                                    │
│                                                                             │
│  3. RECOVER                                                                 │
│     • Follow category-specific recovery procedure                           │
│     • Escalate if recovery fails                                            │
│                                                                             │
│  4. VERIFY                                                                  │
│     • Confirm issue is resolved                                             │
│     • Run relevant tests                                                    │
│                                                                             │
│  5. PREVENT                                                                 │
│     • Add test/check to catch this in future                                │
│     • Update documentation                                                  │
│     • Consider systemic fix                                                 │
│                                                                             │
│  6. RECORD                                                                  │
│     • Log failure in journey                                                │
│     • Update calibration                                                    │
│     • Feed into retrospective                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Generating Codebase-Specific Taxonomy

Each codebase may have specific failure patterns. To generate:

1. **Analyze history** — What has failed before?
2. **Identify tech-specific failures** — Framework, language quirks
3. **Add custom categories** — Domain-specific issues
4. **Document recovery** — What worked to fix it

### Template for Custom Failure

```markdown
### {CATEGORY}.{NUMBER}: {Failure Name}

**Symptoms:**
- {symptom-1}
- {symptom-2}

**Recovery:**
1. {step-1}
2. {step-2}
3. {step-3}

**Prevention:**
- {prevention-1}
- {prevention-2}
```

---

*A comprehensive failure taxonomy turns surprises into procedures.*

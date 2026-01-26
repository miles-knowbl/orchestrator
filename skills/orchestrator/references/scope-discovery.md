# Scope Discovery Reference

Pre-loop analysis to identify everything that needs to be done.

---

## Purpose

Scope discovery minimizes loops by catching all work upfront. The goal is to answer: **"What does 'done' look like, and what's missing?"**

---

## Discovery by Mode

### Greenfield Discovery

For new projects, scope discovery means:

1. **Capture vision** (via entry-portal)
   - What is this project?
   - What problem does it solve?
   - Who are the users?

2. **Identify systems**
   - Core functionality
   - Supporting systems
   - Infrastructure needs

3. **Generate feature specs**
   - 18-section specs per system
   - Capability breakdown
   - Integration points

4. **Estimate scope**
   - Complexity per system
   - Dependencies between systems
   - Parallelization opportunities

### Brownfield-Polish Discovery

For near-complete apps, scope discovery means finding gaps:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    POLISH GAP CATEGORIES (MECE)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DEPLOYMENT GAPS                                                         │
│     • CI/CD pipeline missing or incomplete                                  │
│     • Hosting not configured                                                │
│     • Environment variables not set                                         │
│     • Secrets not managed                                                   │
│     • Domain/DNS not configured                                             │
│     • SSL not set up                                                        │
│                                                                             │
│  2. UI/UX GAPS                                                              │
│     • Not dark mode                                                         │
│     • Not responsive                                                        │
│     • Inconsistent styling                                                  │
│     • Missing loading states                                                │
│     • Missing error states                                                  │
│     • Accessibility issues                                                  │
│     • No favicon/meta tags                                                  │
│                                                                             │
│  3. DATA GAPS                                                               │
│     • Schema incomplete                                                     │
│     • Validation missing                                                    │
│     • CRUD operations incomplete                                            │
│     • Seed data missing                                                     │
│     • Migrations not set up                                                 │
│                                                                             │
│  4. TESTING GAPS                                                            │
│     • No unit tests                                                         │
│     • No integration tests                                                  │
│     • No E2E tests                                                          │
│     • Coverage below target                                                 │
│                                                                             │
│  5. DOCUMENTATION GAPS                                                      │
│     • README incomplete                                                     │
│     • API not documented                                                    │
│     • No setup instructions                                                 │
│     • No architecture overview                                              │
│                                                                             │
│  6. SECURITY GAPS                                                           │
│     • Auth incomplete                                                       │
│     • Input not validated                                                   │
│     • Secrets exposed                                                       │
│     • Dependencies vulnerable                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Brownfield-Enterprise Discovery

For enterprise codebases, scope discovery means:

1. **Deep codebase analysis**
   - Architecture patterns
   - Code conventions
   - Testing patterns
   - Existing abstractions

2. **Dependency mapping**
   - What depends on what
   - Integration points
   - Shared resources

3. **Roadmap review**
   - Existing plans
   - Team priorities
   - Blocked items

4. **Highest-leverage identification**
   - What has most impact
   - What unblocks others
   - What aligns with team

---

## Gap Detection Procedures

### Deployment Gap Detection

```bash
# Check CI/CD
ls .github/workflows/*.yml 2>/dev/null || echo "GAP: No GitHub Actions"
ls .gitlab-ci.yml 2>/dev/null || echo "GAP: No GitLab CI"
ls Jenkinsfile 2>/dev/null || echo "GAP: No Jenkins"

# Check deployment config
ls Dockerfile 2>/dev/null || echo "GAP: No Dockerfile"
ls docker-compose.yml 2>/dev/null || echo "GAP: No docker-compose"
ls vercel.json 2>/dev/null || echo "GAP: No Vercel config"
ls netlify.toml 2>/dev/null || echo "GAP: No Netlify config"
ls fly.toml 2>/dev/null || echo "GAP: No Fly.io config"

# Check environment
ls .env.example 2>/dev/null || echo "GAP: No .env.example"
grep -r "process.env" src/ 2>/dev/null | head -5 || echo "INFO: No env vars used"
```

### UI/UX Gap Detection

```bash
# Check for dark mode
grep -r "dark" --include="*.css" --include="*.scss" --include="*.tailwind" . 2>/dev/null || echo "GAP: No dark mode styles"
grep -r "prefers-color-scheme" . 2>/dev/null || echo "GAP: No system theme detection"

# Check for responsive
grep -r "@media" --include="*.css" . 2>/dev/null || echo "GAP: No media queries"
grep -r "sm:|md:|lg:|xl:" . 2>/dev/null || echo "INFO: Check Tailwind breakpoints"

# Check meta tags
grep -r "viewport" --include="*.html" --include="*.tsx" --include="*.jsx" . 2>/dev/null || echo "GAP: No viewport meta"
grep -r "favicon" . 2>/dev/null || echo "GAP: No favicon"
```

### Data Gap Detection

```bash
# Check schema
ls prisma/schema.prisma 2>/dev/null || ls drizzle/ 2>/dev/null || echo "GAP: No schema definition"

# Check migrations
ls prisma/migrations/ 2>/dev/null || ls drizzle/migrations/ 2>/dev/null || echo "GAP: No migrations"

# Check validation
grep -r "zod\|yup\|joi\|validator" package.json 2>/dev/null || echo "GAP: No validation library"

# Check seed data
grep -r "seed" package.json 2>/dev/null || echo "GAP: No seed script"
```

### Testing Gap Detection

```bash
# Check test files
find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l
# If 0, GAP: No tests

# Check test config
ls jest.config.* vitest.config.* 2>/dev/null || echo "GAP: No test config"

# Check coverage config
grep -r "coverage" jest.config.* vitest.config.* 2>/dev/null || echo "GAP: No coverage config"

# Check E2E
ls cypress/ playwright/ 2>/dev/null || echo "GAP: No E2E framework"
```

### Documentation Gap Detection

```bash
# Check README
wc -l README.md 2>/dev/null || echo "GAP: No README"
# If < 20 lines, GAP: README too short

# Check docs
ls docs/ 2>/dev/null || echo "GAP: No docs directory"

# Check API docs
grep -r "openapi\|swagger" . 2>/dev/null || echo "GAP: No API documentation"

# Check code comments
grep -r "@param\|@returns\|@example" src/ 2>/dev/null | wc -l
# If low, GAP: Sparse documentation
```

### Security Gap Detection

```bash
# Check auth
grep -r "auth\|login\|session\|jwt" src/ 2>/dev/null || echo "INFO: Check if auth needed"

# Check input validation
grep -r "sanitize\|escape\|validate" src/ 2>/dev/null || echo "GAP: No input sanitization"

# Check for secrets in code
grep -r "password\|secret\|api_key" --include="*.ts" --include="*.js" . 2>/dev/null | grep -v ".env" && echo "GAP: Possible hardcoded secrets"

# Check dependencies
npm audit 2>/dev/null || yarn audit 2>/dev/null || echo "INFO: Run dependency audit"
```

---

## Gap Severity Classification

| Severity | Definition | Examples |
|----------|------------|----------|
| **Critical** | Blocks production deployment | No deployment config, broken build |
| **High** | Significantly impacts quality | No auth, major UI issues, no validation |
| **Medium** | Reduces polish | Missing tests, incomplete docs |
| **Low** | Nice to have | Minor style issues, extra features |

---

## SCOPE-DISCOVERY.md Template

```markdown
# Scope Discovery: {project-name}

**Date:** {date}
**Mode:** {detected-mode}
**Analyst:** {orchestrator/agent}

## Executive Summary

{2-3 sentences: current state, main gaps, estimated effort}

## Mode Confirmation

- **Detected:** {mode}
- **Confidence:** {X}%
- **Confirmed:** {yes/no/overridden}

## Gap Analysis

### Critical Gaps (blocks deployment)

| Gap | Category | Description | Effort |
|-----|----------|-------------|--------|
| {gap-1} | Deployment | {description} | {S/M/L} |

### High Priority Gaps (quality impact)

| Gap | Category | Description | Effort |
|-----|----------|-------------|--------|
| {gap-2} | UI/UX | {description} | {S/M/L} |
| {gap-3} | Data | {description} | {S/M/L} |

### Medium Priority Gaps (polish)

| Gap | Category | Description | Effort |
|-----|----------|-------------|--------|
| {gap-4} | Testing | {description} | {S/M/L} |
| {gap-5} | Documentation | {description} | {S/M/L} |

### Low Priority Gaps (nice to have)

| Gap | Category | Description | Effort |
|-----|----------|-------------|--------|
| {gap-6} | {category} | {description} | {S/M/L} |

## Systems/Tasks to Build

| ID | System | Type | Priority | Parallelizable | Dependencies |
|----|--------|------|----------|----------------|--------------|
| S1 | {system-1} | {gap-fill/new} | Critical | No | - |
| S2 | {system-2} | {gap-fill/new} | High | Yes | - |
| S3 | {system-3} | {gap-fill/new} | High | Yes | - |
| S4 | {system-4} | {gap-fill/new} | Medium | Yes | S1 |

## Execution Plan

### Loop 1 (Critical + High)

**Sequential:**
1. S1: {system-1} — {reason for sequential}

**Parallel (after S1):**
- S2: {system-2} → Agent 1
- S3: {system-3} → Agent 2

**Exit Criteria:**
- [ ] {criterion-1}
- [ ] {criterion-2}

### Loop 2 (Medium + Low, if needed)

**Parallel:**
- S4: {system-4} → Agent 1
- S5: {system-5} → Agent 2

**Exit Criteria:**
- [ ] {criterion-3}
- [ ] {criterion-4}

## Estimates

| Dimension | Value |
|-----------|-------|
| Total gaps | {N} |
| Estimated loops | {1-3} |
| Estimated hours (agentic) | {X-Y hours} |
| Parallelization factor | {N agents} |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {risk-1} | {L/M/H} | {L/M/H} | {mitigation} |

## Open Questions

- [ ] {question-1}
- [ ] {question-2}
```

---

## Discovery Best Practices

1. **Be thorough upfront** — Missing a gap means an extra loop later
2. **Classify severity honestly** — Not everything is critical
3. **Identify parallelization** — More parallel = faster completion
4. **Consider dependencies** — Order matters
5. **Estimate conservatively** — Surprises are usually bad

---

*Comprehensive scope discovery is the key to minimizing loops.*

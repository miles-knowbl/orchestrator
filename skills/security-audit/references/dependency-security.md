# Dependency Security

Managing security risks from third-party dependencies.

## The Dependency Risk

Modern applications use hundreds of dependencies. Each dependency:
- May contain vulnerabilities
- May be abandoned or unmaintained
- May have its own vulnerable dependencies
- Could be compromised (supply chain attack)

## Vulnerability Scanning

### npm audit

```bash
# Run audit
npm audit

# Fix automatically where possible
npm audit fix

# Force fix (may have breaking changes)
npm audit fix --force

# Generate JSON report
npm audit --json > audit-report.json

# Check specific severity
npm audit --audit-level=high
```

### Snyk

```bash
# Install
npm install -g snyk

# Authenticate
snyk auth

# Test for vulnerabilities
snyk test

# Monitor project (continuous)
snyk monitor

# Test specific file
snyk test --file=package.json

# Ignore specific vulnerability
snyk ignore --id=SNYK-JS-LODASH-567746
```

### GitHub Dependabot

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    ignore:
      # Ignore major version updates for stability
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

### OWASP Dependency-Check

```bash
# Docker
docker run --rm \
  -v $(pwd):/src \
  owasp/dependency-check \
  --scan /src \
  --format HTML \
  --out /src/report

# In CI pipeline
dependency-check --project "MyApp" --scan . --format JSON
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run npm audit
        run: npm audit --audit-level=high
        
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### Pre-commit Hook

```bash
#!/bin/sh
# .husky/pre-commit

# Run npm audit before commit
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "Security vulnerabilities found. Fix before committing."
  exit 1
fi
```

## Dependency Evaluation

### Before Adding a Dependency

| Check | How | Why |
|-------|-----|-----|
| Vulnerabilities | `npm audit`, Snyk | Known security issues |
| Maintenance | GitHub activity | Abandoned = no patches |
| Popularity | npm downloads | More eyes = more scrutiny |
| Dependencies | `npm ls` | Transitive risk |
| License | package.json | Legal compliance |
| Size | bundlephobia.com | Attack surface |

### Evaluation Checklist

```markdown
## New Dependency Evaluation: [package-name]

### Security
- [ ] No known vulnerabilities (npm audit, Snyk)
- [ ] Maintainer has security policy
- [ ] Package has been audited (if critical)

### Maintenance
- [ ] Last commit within 6 months
- [ ] Responds to issues/PRs
- [ ] Has multiple maintainers
- [ ] Clear release process

### Quality
- [ ] Has tests
- [ ] TypeScript support
- [ ] Documentation exists
- [ ] Used by reputable projects

### Risk Assessment
- [ ] Minimal permissions required
- [ ] Reasonable dependency count
- [ ] No eval() or similar dangers
- [ ] No suspicious post-install scripts

### Decision
- [ ] APPROVED / REJECTED
- Reason: _______________
- Alternatives considered: _______________
```

## Lock Files

### Why Lock Files Matter

```bash
# package.json might say:
"lodash": "^4.17.0"

# But without lock file, you might get:
# - 4.17.0 (old, vulnerable)
# - 4.17.21 (current, patched)
# - 4.18.0 (future, unknown)

# Lock file pins exact versions
```

### Best Practices

```bash
# Always commit lock files
git add package-lock.json

# Use npm ci in CI/CD (respects lock file exactly)
npm ci  # Not npm install

# Regenerate lock file carefully
rm package-lock.json
npm install
npm audit
git diff package-lock.json  # Review changes
```

## Dependency Pinning

### Version Strategies

```json
{
  "dependencies": {
    // Exact version (most secure, most maintenance)
    "express": "4.18.2",
    
    // Allow patches (balance of security and updates)
    "lodash": "~4.17.21",
    
    // Allow minor versions (convenient but riskier)
    "axios": "^1.6.0",
    
    // Never use in production
    "debug": "*",
    "dev-tool": "latest"
  }
}
```

### Recommended Approach

```json
{
  "dependencies": {
    // Production: Allow patches only
    "express": "~4.18.2",
    "pg": "~8.11.0"
  },
  "devDependencies": {
    // Dev: Allow minor versions
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

## Supply Chain Attacks

### Attack Vectors

| Attack | Description | Example |
|--------|-------------|---------|
| Typosquatting | Similar package names | `lodash` vs `1odash` |
| Dependency Confusion | Public package same name as private | Internal `auth` package |
| Compromised Maintainer | Account takeover | event-stream incident |
| Malicious Code | Hidden in install scripts | Cryptominers |

### Protections

```bash
# 1. Verify package authenticity
npm view lodash
# Check: maintainers, repository, homepage

# 2. Check install scripts
npm show [package] scripts
# Be suspicious of preinstall/postinstall

# 3. Use scoped packages for internal
@mycompany/auth  # Can't be confused with public

# 4. Enable package-lock
npm config set package-lock true

# 5. Use npm provenance (when available)
npm publish --provenance
```

### Registry Security

```bash
# Use private registry for internal packages
npm config set @mycompany:registry https://npm.mycompany.com

# Audit registry configuration
npm config list

# Consider registry mirroring for air-gapped environments
```

## Handling Vulnerabilities

### Triage Process

```markdown
## Vulnerability Triage

1. **Assess Severity**
   - Critical/High: Immediate action
   - Medium: Plan for this sprint
   - Low: Backlog

2. **Determine Exploitability**
   - Is the vulnerable code path used?
   - Is it reachable from untrusted input?
   - Are there mitigating controls?

3. **Find Remediation**
   - Update to patched version
   - Use alternative package
   - Apply workaround
   - Accept risk (document decision)

4. **Verify Fix**
   - Run audit again
   - Test functionality
   - Deploy to staging first
```

### Remediation Options

```bash
# Option 1: Update package
npm update lodash

# Option 2: Update to specific version
npm install lodash@4.17.21

# Option 3: Force resolution (for transitive deps)
# Add to package.json:
{
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}

# Option 4: Replace package
npm uninstall vulnerable-package
npm install alternative-package

# Option 5: Fork and patch (last resort)
# Fork to your org, apply patch, use forked version
```

### Documentation

```markdown
## Security Decision Record

**Package:** minimist
**Vulnerability:** CVE-2021-44906 (Prototype Pollution)
**Severity:** Critical
**CVSS:** 9.8

**Analysis:**
- minimist is a transitive dependency of mkdirp
- We don't use the vulnerable function directly
- Input to minimist comes from our CLI args only
- No untrusted input reaches minimist

**Decision:** Accept risk for 30 days
**Reason:** Breaking change in update, need testing time
**Mitigation:** Input validation on CLI arguments
**Review Date:** 2024-02-15

**Approved By:** @security-lead
**Date:** 2024-01-15
```

## Dependency Updates

### Update Strategy

```markdown
## Monthly Dependency Update Process

### Week 1: Assessment
- [ ] Run `npm outdated`
- [ ] Run `npm audit`
- [ ] Review Dependabot PRs
- [ ] Categorize updates (security, features, chores)

### Week 2: Security Updates
- [ ] Apply all security patches
- [ ] Test in staging
- [ ] Deploy to production
- [ ] Monitor for issues

### Week 3: Minor Updates
- [ ] Apply non-breaking updates
- [ ] Run full test suite
- [ ] Deploy if tests pass

### Week 4: Major Updates
- [ ] Evaluate breaking changes
- [ ] Update code if needed
- [ ] Schedule for next release
```

### Automated Updates

```yaml
# Renovate configuration (alternative to Dependabot)
# renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "config:base",
    ":semanticCommits",
    "group:recommended"
  ],
  "vulnerabilityAlerts": {
    "enabled": true,
    "labels": ["security"]
  },
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ]
}
```

## Monitoring

### Continuous Monitoring

```typescript
// Scheduled job to check for new vulnerabilities
import { exec } from 'child_process';
import { WebhookClient } from 'discord.js';

async function checkVulnerabilities() {
  return new Promise((resolve, reject) => {
    exec('npm audit --json', (error, stdout) => {
      const result = JSON.parse(stdout);
      
      if (result.metadata.vulnerabilities.high > 0 || 
          result.metadata.vulnerabilities.critical > 0) {
        // Alert security team
        alertSecurityTeam(result);
      }
      
      resolve(result);
    });
  });
}

// Run daily
cron.schedule('0 9 * * *', checkVulnerabilities);
```

### Metrics to Track

| Metric | Target | Action if Exceeded |
|--------|--------|-------------------|
| Critical vulns | 0 | Immediate fix |
| High vulns | <3 | Fix within 7 days |
| Medium vulns | <10 | Fix within 30 days |
| Outdated deps | <20% | Monthly updates |
| Avg dependency age | <6 months | Review and update |

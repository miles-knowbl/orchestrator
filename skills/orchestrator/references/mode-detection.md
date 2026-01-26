# Mode Detection Reference

Complete signal taxonomy and detection algorithm for project mode classification.

---

## Signal Taxonomy (MECE)

### 1. Codebase Metrics

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| File count | `find . -type f \| wc -l` | 0: +1.0 | 1-100: +0.3 | 500+: +0.4 |
| Lines of code | `cloc` or `wc -l` | 0: +1.0 | <10k: +0.3 | 100k+: +0.4 |
| Directory depth | `find . -type d \| wc -l` | 0-1: +0.5 | 2-10: +0.2 | 20+: +0.3 |

### 2. Version Control

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| No .git directory | `test -d .git` | +0.8 | - | - |
| Commit count | `git rev-list --count HEAD` | <5: +0.3 | 10-200: +0.3 | 1000+: +0.3 |
| Contributor count | `git shortlog -sn \| wc -l` | 1: +0.2 | 1-3: +0.4 | 5+: +0.4 |
| Branch count | `git branch -a \| wc -l` | <3: +0.2 | 3-10: +0.2 | 20+: +0.3 |
| Tag count | `git tag \| wc -l` | 0: +0.2 | 1-5: +0.2 | 10+: +0.3 |
| Repo age (days) | First commit date | <7: +0.3 | 7-180: +0.3 | 365+: +0.3 |

### 3. Dependency Management

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| No package file | Missing package.json/go.mod/etc | +0.7 | - | - |
| Has package file | Present | - | +0.1 | +0.1 |
| Dependency count | Parse package.json | 0: +0.3 | 1-20: +0.2 | 50+: +0.3 |
| Lock file present | package-lock.json, yarn.lock | - | +0.1 | +0.2 |
| Monorepo structure | Multiple package.json | - | - | +0.4 |

### 4. CI/CD & Deployment

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| No CI config | Missing .github/workflows, etc | +0.2 | +0.5 | - |
| Has CI config | Present | - | - | +0.4 |
| No deployment config | Missing Dockerfile, vercel.json | +0.2 | +0.5 | - |
| Has deployment config | Present | - | - | +0.4 |
| Multiple environments | staging + prod configs | - | - | +0.5 |
| Infrastructure as code | Terraform, Pulumi, CDK | - | - | +0.4 |

### 5. Testing & Quality

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| No test files | Missing *.test.*, *.spec.* | +0.3 | +0.2 | - |
| Basic tests | < 20 test files | - | +0.3 | - |
| Comprehensive tests | 50+ test files | - | - | +0.4 |
| No test config | Missing jest.config, vitest.config | +0.2 | +0.2 | - |
| Coverage config | Has coverage thresholds | - | - | +0.3 |
| No linting | Missing eslint, prettier config | +0.2 | +0.2 | - |
| Has linting | Config present | - | +0.1 | +0.2 |

### 6. Documentation

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| No README | Missing README.md | +0.3 | +0.2 | - |
| Basic README | < 100 lines | - | +0.2 | - |
| Detailed README | 100+ lines | - | - | +0.2 |
| No docs directory | Missing /docs | +0.2 | +0.2 | - |
| Has docs directory | Present | - | - | +0.3 |
| API documentation | OpenAPI, JSDoc | - | - | +0.3 |
| Architecture docs | ADRs, diagrams | - | - | +0.4 |

### 7. Process Artifacts (Enterprise Markers)

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| CODEOWNERS | Present | - | - | +0.5 |
| PR template | .github/pull_request_template.md | - | - | +0.3 |
| Issue templates | .github/ISSUE_TEMPLATE/ | - | - | +0.3 |
| Contributing guide | CONTRIBUTING.md | - | - | +0.3 |
| Code of conduct | CODE_OF_CONDUCT.md | - | - | +0.2 |
| Security policy | SECURITY.md | - | - | +0.3 |
| Changelog | CHANGELOG.md | - | - | +0.3 |

### 8. Compliance & Governance

| Signal | How to Measure | Greenfield | Polish | Enterprise |
|--------|----------------|------------|--------|------------|
| License file | LICENSE, LICENSE.md | - | +0.1 | +0.2 |
| Compliance markers | SOC2, HIPAA, GDPR mentions | - | - | +0.5 |
| Audit logs | Audit trail code | - | - | +0.4 |
| Feature flags | LaunchDarkly, env-based flags | - | - | +0.3 |
| Secrets management | Vault, AWS Secrets Manager | - | - | +0.4 |

---

## Scoring Algorithm

### Step 1: Gather All Signals

```javascript
function gatherSignals(codebasePath) {
  const signals = [];

  // Filesystem signals
  signals.push(measureFileCount(codebasePath));
  signals.push(measureLOC(codebasePath));
  signals.push(measureDirectoryDepth(codebasePath));

  // Git signals
  if (hasGit(codebasePath)) {
    signals.push(measureCommitCount(codebasePath));
    signals.push(measureContributorCount(codebasePath));
    signals.push(measureBranchCount(codebasePath));
    signals.push(measureRepoAge(codebasePath));
  } else {
    signals.push({ name: 'no_git', weights: { greenfield: 0.8 } });
  }

  // Infrastructure signals
  signals.push(measurePackageFile(codebasePath));
  signals.push(measureCICD(codebasePath));
  signals.push(measureDeployment(codebasePath));

  // Quality signals
  signals.push(measureTests(codebasePath));
  signals.push(measureLinting(codebasePath));
  signals.push(measureDocumentation(codebasePath));

  // Process signals
  signals.push(measureProcessArtifacts(codebasePath));

  return signals;
}
```

### Step 2: Calculate Scores

```javascript
function calculateScores(signals) {
  const scores = {
    greenfield: 0,
    polish: 0,
    enterprise: 0
  };

  for (const signal of signals) {
    if (signal.weights.greenfield) {
      scores.greenfield += signal.weights.greenfield;
    }
    if (signal.weights.polish) {
      scores.polish += signal.weights.polish;
    }
    if (signal.weights.enterprise) {
      scores.enterprise += signal.weights.enterprise;
    }
  }

  return scores;
}
```

### Step 3: Normalize and Classify

```javascript
function classify(scores) {
  const total = scores.greenfield + scores.polish + scores.enterprise;

  if (total === 0) {
    // No signals = assume greenfield
    return {
      mode: 'greenfield',
      confidence: 1.0,
      margin: 1.0
    };
  }

  // Normalize to percentages
  const normalized = {
    greenfield: scores.greenfield / total,
    polish: scores.polish / total,
    enterprise: scores.enterprise / total
  };

  // Find winner
  const sorted = Object.entries(normalized)
    .sort(([, a], [, b]) => b - a);

  const winner = sorted[0][0];
  const confidence = sorted[0][1];
  const runnerUp = sorted[1] ? sorted[1][1] : 0;
  const margin = confidence - runnerUp;

  return {
    mode: winner,
    confidence: confidence,
    margin: margin,
    scores: normalized
  };
}
```

---

## Confidence Interpretation

| Confidence | Margin | Interpretation |
|------------|--------|----------------|
| > 70% | > 30% | High confidence, clear winner |
| 50-70% | 15-30% | Medium confidence, likely correct |
| 40-50% | 5-15% | Low confidence, needs user attention |
| < 40% | < 5% | Ambiguous, require user selection |

---

## Mode Behavior Summary

| Aspect | Greenfield | Polish | Enterprise |
|--------|------------|--------|------------|
| **Entry point** | entry-portal (vision) | scope discovery | codebase analysis |
| **Spec detail** | Full 18 sections | Gap-focused | Pattern-matching |
| **Scaffolding** | Create everything | Extend only | Minimal touch |
| **Patterns** | Establish new | Polish existing | Match exactly |
| **Testing** | Create suite | Fill gaps | Match style |
| **Deployment** | Optional | Required | Use existing |
| **Coordination** | N/A | Solo or small team | Multi-agent |

---

## Override Guidelines

### When to Override to Greenfield
- Starting a new module in an existing repo
- Repo exists but current code should be replaced
- User explicitly wants fresh start

### When to Override to Polish
- Enterprise codebase but feature is small
- Just want to finish and ship quickly
- Team size doesn't match codebase age

### When to Override to Enterprise
- Small codebase but high quality standards needed
- Part of a larger ecosystem
- Compliance requirements exist

---

*Use this taxonomy to ensure consistent mode detection across codebases.*

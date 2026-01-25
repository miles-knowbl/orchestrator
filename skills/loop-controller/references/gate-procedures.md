# Gate Procedures

How to request, check, and manage human approval gates.

## Gate Types

| Gate | Purpose | Trigger | Approver |
|------|---------|---------|----------|
| `architecture` | Validate architectural decisions | New patterns, major changes | Tech Lead |
| `security` | Review security implications | Auth, crypto, PII handling | Security Team |
| `database` | Review schema changes | Migrations, data changes | DBA |
| `external` | Review third-party integrations | New API integrations | Tech Lead |
| `deploy` | Approve production release | Every PR merge | Release Manager |

## Detecting Gate Requirements

### Architecture Gate

Required when:
- New architectural pattern introduced
- Major structural change to existing system
- New service/component added
- Significant dependency added

Detection:
```bash
# Check for new patterns
git diff --name-only origin/main | grep -E "(src/infrastructure|src/config|docker-compose)"

# Check for new dependencies
git diff origin/main -- package.json | grep '"+' | grep -v '"-'
```

### Security Gate

Required when:
- Authentication/authorization changes
- Cryptographic operations
- PII handling
- API security (rate limiting, input validation)
- Secret management

Detection:
```bash
# Check for security-related files
git diff --name-only origin/main | grep -iE "(auth|security|crypto|password|token|secret)"

# Check for sensitive patterns in diff
git diff origin/main | grep -iE "(password|secret|private_key|api_key)"
```

### Database Gate

Required when:
- Schema migrations
- Index changes
- Data transformations
- Stored procedures

Detection:
```bash
# Check for migration files
git diff --name-only origin/main | grep -E "(migrations?/|schema)"

# Check for Prisma/TypeORM changes
git diff --name-only origin/main | grep -E "(prisma|\.entity\.ts|\.model\.ts)"
```

### External Gate

Required when:
- New third-party API integration
- Changes to existing integration
- Webhook implementations

Detection:
```bash
# Check for integration files
git diff --name-only origin/main | grep -iE "(integration|external|webhook|api-client)"

# Check for new HTTP clients
git diff origin/main | grep -E "(axios|fetch|http\.request)"
```

### Deploy Gate

Required: **Always for SHIP stage**

## Requesting Approval

### Via GitHub CLI

```bash
# 1. Create or update PR
gh pr create --base main --head feature/system-name \
  --title "feat: System Name" \
  --body-file PR_DESCRIPTION.md

# 2. Add gate-specific label
gh pr edit $PR_NUMBER --add-label "needs:security-review"

# 3. Add reviewers
gh pr edit $PR_NUMBER --add-reviewer @security-team

# 4. Post review request comment
gh pr comment $PR_NUMBER --body "## Security Review Requested

This PR includes the following security-relevant changes:

### Changes
- JWT token handling in \`src/auth/token.service.ts\`
- Password hashing in \`src/users/password.service.ts\`

### Security Checklist
- [ ] Authentication properly implemented
- [ ] Authorization checks in place
- [ ] Input validation complete
- [ ] No sensitive data logged
- [ ] Secrets properly managed

Please review and approve if satisfactory."
```

### Gate Request Templates

#### Architecture Review Request

```markdown
## Architecture Review Requested

### Summary
[What architectural changes are being made]

### Changes
- [Change 1]
- [Change 2]

### Architectural Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision] | [Choice] | [Why] |

### Impact
- [Component affected]
- [Integration points]

### Questions for Reviewer
- [Specific question 1]
- [Specific question 2]

### Checklist
- [ ] Follows established patterns
- [ ] Documented in ADR (if significant)
- [ ] Backward compatible (or migration plan)
- [ ] Performance implications considered
```

#### Security Review Request

```markdown
## Security Review Requested

### Summary
[What security-relevant changes are being made]

### Security Changes
| Area | Change | Risk Level |
|------|--------|------------|
| [Auth] | [Change] | [High/Med/Low] |

### Security Checklist
- [ ] Authentication implemented correctly
- [ ] Authorization checks present
- [ ] Input validation complete
- [ ] Output encoding applied
- [ ] Secrets not hardcoded
- [ ] Sensitive data not logged
- [ ] Rate limiting in place (if API)
- [ ] HTTPS enforced

### Threat Model
[Any identified threats and mitigations]

### Questions for Reviewer
- [Specific security question]
```

#### Database Review Request

```markdown
## Database Review Requested

### Summary
[What database changes are being made]

### Migration Details
| Migration | Type | Tables Affected |
|-----------|------|-----------------|
| [Name] | [CREATE/ALTER/DROP] | [Tables] |

### Schema Changes
```sql
-- Key changes
[SQL snippet]
```

### Data Impact
- Records affected: [estimate]
- Downtime required: [yes/no]
- Rollback plan: [description]

### Performance Impact
- [ ] Indexes added for new queries
- [ ] Query plans reviewed
- [ ] No N+1 issues introduced

### Checklist
- [ ] Migration is reversible
- [ ] Migration tested locally
- [ ] Backup plan documented
- [ ] Runbook updated
```

## Checking Approval Status

### Via GitHub CLI

```bash
# Check PR reviews
gh pr view $PR_NUMBER --json reviews

# Check specific review status
gh pr view $PR_NUMBER --json reviews --jq '.reviews[] | select(.author.login=="security-team") | .state'

# Check PR checks
gh pr checks $PR_NUMBER
```

### Via API

```bash
# Get review status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/org/repo/pulls/$PR_NUMBER/reviews

# Parse for approvals
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/org/repo/pulls/$PR_NUMBER/reviews | \
  jq '[.[] | select(.state=="APPROVED")] | length'
```

### Polling Strategy

```javascript
async function waitForApproval(prNumber, requiredApprovers, timeout = 3600000) {
  const startTime = Date.now();
  const pollInterval = 60000; // 1 minute
  
  while (Date.now() - startTime < timeout) {
    const reviews = await getReviews(prNumber);
    const approvals = reviews.filter(r => r.state === 'APPROVED');
    
    const hasRequired = requiredApprovers.every(approver =>
      approvals.some(a => a.user.login === approver || a.user.team === approver)
    );
    
    if (hasRequired) {
      return { approved: true, reviews: approvals };
    }
    
    // Check for rejections
    const rejections = reviews.filter(r => r.state === 'CHANGES_REQUESTED');
    if (rejections.length > 0) {
      return { approved: false, rejected: true, reviews: rejections };
    }
    
    await sleep(pollInterval);
  }
  
  return { approved: false, timeout: true };
}
```

## Handling Approval Results

### On Approval

```bash
# Update loop state
jq '.gates.security.status = "approved" | 
    .gates.security.approvedAt = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'" |
    .gates.security.approvedBy = "security-team"' loop-state.json > tmp.json && mv tmp.json loop-state.json

# Add checkpoint
jq '.checkpoints += [{"type": "approval", "message": "Security review approved", "at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}]' loop-state.json > tmp.json && mv tmp.json loop-state.json

# Continue loop
loop resume
```

### On Rejection

```bash
# Log rejection
gh pr view $PR_NUMBER --json reviews --jq '.reviews[] | select(.state=="CHANGES_REQUESTED") | .body'

# Transition to addressing feedback
# Update loop state to go back to IMPLEMENT or appropriate stage

jq '.state = "IMPLEMENT" | 
    .failures.history += [{"stage": "gate-rejection", "error": "Changes requested by reviewer", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}]' loop-state.json > tmp.json && mv tmp.json loop-state.json
```

### On Timeout

```bash
# Escalate
echo "Gate approval timed out after 1 hour"
echo "PR: $PR_NUMBER"
echo "Gate: security"
echo "Requested: $(jq -r '.gates.security.requestedAt' loop-state.json)"

# Notify via Slack/email if configured
# Transition to BLOCKED
jq '.state = "BLOCKED" | .blockedReason = "Gate approval timeout: security"' loop-state.json > tmp.json && mv tmp.json loop-state.json
```

## Gate State Management

### In loop-state.json

```json
{
  "gates": {
    "architecture": {
      "required": true,
      "status": "approved",
      "requestedAt": "2024-01-17T08:00:00Z",
      "approvedBy": "tech-lead@company.com",
      "approvedAt": "2024-01-17T09:30:00Z",
      "notes": "Approved pattern for event sourcing"
    },
    "security": {
      "required": true,
      "status": "requested",
      "requestedAt": "2024-01-17T10:00:00Z"
    },
    "database": {
      "required": false,
      "status": "not-applicable"
    },
    "external": {
      "required": false,
      "status": "not-applicable"
    },
    "deploy": {
      "required": true,
      "status": "pending"
    }
  }
}
```

### Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Gate not yet evaluated |
| `not-applicable` | Gate determined not required |
| `requested` | Approval request sent |
| `approved` | Approval received |
| `rejected` | Changes requested |

## Notifications

### Slack Notification (Optional)

```bash
# Send gate request notification
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "channel": "#pr-reviews",
    "text": "🔒 Security review requested",
    "attachments": [{
      "color": "warning",
      "fields": [
        {"title": "PR", "value": "<'$PR_URL'|#'$PR_NUMBER'>", "short": true},
        {"title": "System", "value": "'$SYSTEM_NAME'", "short": true},
        {"title": "Changes", "value": "Auth token handling, password hashing"}
      ]
    }]
  }' \
  $SLACK_WEBHOOK_URL
```

### Email Template

```
Subject: [Action Required] Security Review: PR #123 - Work Order Service

A security review is required for the following PR:

PR: #123 - feat: Work Order Service authentication
Branch: feature/system-work-orders
Author: agent-001

Security-relevant changes:
- JWT token handling (src/auth/token.service.ts)
- Password hashing (src/users/password.service.ts)

Please review: https://github.com/org/repo/pull/123

This is blocking deployment until approved.
```

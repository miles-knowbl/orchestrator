# GitHub Issue Format

Templates and conventions for system issues.

## Issue Creation

### Using GitHub CLI

```bash
# Create issue with FeatureSpec attached
gh issue create \
  --repo "org/repo" \
  --title "🎯 System: [Name]" \
  --body-file ISSUE_BODY.md \
  --label "domain:azure-standard" \
  --label "system:servicegrid" \
  --label "status:specified" \
  --label "priority:p1"
```

### Using GitHub API

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/org/repo/issues \
  -d '{
    "title": "🎯 System: ServiceGrid Core",
    "body": "...",
    "labels": ["domain:azure-standard", "system:servicegrid", "status:specified", "priority:p1"]
  }'
```

## Issue Body Template

```markdown
## 🎯 System: [System Name]

| Property | Value |
|----------|-------|
| **Domain** | [domain-name] |
| **System ID** | sys-[number] |
| **Priority** | P[1-5] |
| **Dependencies** | #[issue], #[issue] or None |
| **Complexity** | Small / Medium / Large / XL |

---

### Overview

[2-3 sentence description of what this system does and why it matters]

---

### FeatureSpec

<details>
<summary>📋 Click to expand full specification</summary>

[Paste complete 18-section FeatureSpec here]

</details>

---

### Acceptance Criteria

Core functionality that must work for this system to be complete:

- [ ] [Criterion 1 - specific, testable]
- [ ] [Criterion 2 - specific, testable]
- [ ] [Criterion 3 - specific, testable]
- [ ] [Criterion 4 - specific, testable]

### Quality Gates

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Code coverage > 80%
- [ ] No critical security vulnerabilities
- [ ] Performance targets met
- [ ] Documentation complete

---

### Technical Notes

[Any important technical context, decisions, or constraints]

---

### Links

- Dream State: [link to dream-state.md]
- Related Issues: #[number], #[number]
- Figma/Designs: [link if applicable]
- API Docs: [link if applicable]
```

## Label Convention

### Domain Labels
```
domain:{domain-name}
```
Examples: `domain:azure-standard`, `domain:inventory`, `domain:customer-portal`

### System Labels
```
system:{system-name}
```
Examples: `system:auth`, `system:servicegrid`, `system:routing`

### Status Labels
```
status:{status}
```
Values:
- `status:discovered` - Identified, needs specification
- `status:specified` - FeatureSpec complete
- `status:ready` - Dependencies met, can start
- `status:in-progress` - Currently being built
- `status:review` - In PR review
- `status:blocked` - Cannot proceed

### Priority Labels
```
priority:p{1-5}
```
Values:
- `priority:p1` - Critical, build first
- `priority:p2` - High, build soon
- `priority:p3` - Medium, build when ready
- `priority:p4` - Low, build eventually
- `priority:p5` - Nice to have

### Type Labels
```
type:{type}
```
Values:
- `type:system` - Full system/service
- `type:feature` - Feature within existing system
- `type:enhancement` - Improvement to existing
- `type:bugfix` - Fix for existing

## Example Issues

### System Issue

```markdown
## 🎯 System: Work Order Service

| Property | Value |
|----------|-------|
| **Domain** | azure-standard-ops |
| **System ID** | sys-002 |
| **Priority** | P1 |
| **Dependencies** | #100 (Auth Service) |
| **Complexity** | Large |

---

### Overview

The Work Order Service is the core of the field service platform. It manages the
complete lifecycle of work orders from creation through completion, including
assignment, scheduling, status tracking, and completion documentation.

---

### FeatureSpec

<details>
<summary>📋 Click to expand full specification</summary>

# Work Order Service FeatureSpec

## 1. Overview
[Full spec content...]

## 2. Problem Statement
[Full spec content...]

[... remaining 16 sections ...]

</details>

---

### Acceptance Criteria

- [ ] Work orders can be created with required fields
- [ ] Work orders can be assigned to technicians
- [ ] Work order status transitions are enforced
- [ ] Technicians can update work order status from mobile
- [ ] Completion requires signature and photo documentation
- [ ] Work order history is fully auditable
- [ ] API supports filtering, sorting, and pagination
- [ ] Offline-created work orders sync when connected

### Quality Gates

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Code coverage > 80%
- [ ] No critical security vulnerabilities
- [ ] API response time < 200ms p95
- [ ] Documentation complete

---

### Technical Notes

- Must integrate with existing Auth Service for user management
- Use PostgreSQL with proper indexing for work order queries
- Event sourcing for work order state changes
- WebSocket support for real-time updates to dispatcher dashboard

---

### Links

- Dream State: docs/dream-state.md
- Auth Service: #100
- API Design: docs/api/work-orders.yaml
```

### Feature Issue (within existing system)

```markdown
## ✨ Feature: Bulk Work Order Import

| Property | Value |
|----------|-------|
| **System** | Work Order Service |
| **Priority** | P3 |
| **Dependencies** | #123 (Work Order Service core) |
| **Complexity** | Medium |

---

### Overview

Enable dispatchers to import multiple work orders from CSV files,
validating data and providing error feedback before committing.

---

### Acceptance Criteria

- [ ] CSV upload UI in dispatcher dashboard
- [ ] Validation of all required fields before import
- [ ] Clear error messages for invalid rows
- [ ] Preview of valid rows before commit
- [ ] Batch creation with transaction rollback on failure
- [ ] Import history with ability to view past imports

---

### Technical Notes

- Max file size: 10MB
- Max rows per import: 1000
- Support for UTF-8 encoding with BOM
```

## Linking Issues

### Dependency Links

In the issue body:
```markdown
**Dependencies:** #100, #101
```

### Cross-References

When issues reference each other:
```markdown
Related to #100
Blocked by #101
Blocks #102
```

### After Issue Creation

Update the system queue with the issue number:

```json
{
  "id": "sys-002",
  "name": "Work Order Service",
  "githubIssue": 123,  // ← Add this
  "status": "specified"
}
```

## Issue Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ISSUE LIFECYCLE                                       │
│                                                                             │
│  1. CREATE                                                                  │
│     • Entry portal creates issue with FeatureSpec                           │
│     • Labels: domain, system, status:specified, priority                    │
│     • Update system-queue.json with issue number                            │
│                                                                             │
│  2. ASSIGN                                                                  │
│     • When dependencies are met, assign to engineer/agent                   │
│     • Update label: status:in-progress                                      │
│                                                                             │
│  3. TRACK                                                                   │
│     • Checkbox progress in Acceptance Criteria                              │
│     • Comments for decisions and blockers                                   │
│     • Link to PRs as work progresses                                        │
│                                                                             │
│  4. REVIEW                                                                  │
│     • Final PR linked to issue                                              │
│     • Update label: status:review                                           │
│                                                                             │
│  5. CLOSE                                                                   │
│     • PR merged                                                             │
│     • Verify all acceptance criteria checked                                │
│     • Close issue with comment summarizing completion                       │
│     • Update system-queue.json status to complete                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Closing Comment Template

When closing a completed system issue:

```markdown
## ✅ System Complete

**Merged PRs:**
- #150 - Core work order model and API
- #155 - Status transitions and validation
- #160 - Mobile sync support
- #165 - Documentation

**Metrics:**
- Lines of code: ~3,500
- Test coverage: 87%
- API endpoints: 12
- Development time: 2 weeks

**Documentation:**
- README: /services/work-order/README.md
- API Docs: /docs/api/work-orders.md
- Architecture: /docs/architecture/work-order-service.md

**Next Steps:**
- sys-003 Route Optimization can now begin (#124)
- sys-005 Analytics Dashboard can now begin (#126)
```

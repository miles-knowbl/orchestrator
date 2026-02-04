# Blocker Types

Classification guide for blockers.

## Type Definitions

### Dependency Blocker

**Description:** Module waiting on another module to complete.

**Identification:**
- Listed in `blockedBy` array
- Blocker is another module in roadmap
- Blocker has known status

**Resolution:** Complete the dependency.

**Example:**
```
Module: api-endpoints
Blocked by: auth-service (dependency)
Resolution: Complete auth-service first
```

### External Blocker

**Description:** Waiting on something outside the system.

**Identification:**
- Blocker not in roadmap
- Requires external action
- Outside development control

**Resolution:** External action or workaround.

**Examples:**
- Waiting for API credentials
- Waiting for vendor response
- Waiting for infrastructure provisioning

### Technical Blocker

**Description:** Technical obstacle preventing progress.

**Identification:**
- Bug or incompatibility
- Requires investigation
- Known technical debt

**Resolution:** Technical solution or workaround.

**Examples:**
- Library version conflict
- Performance issue
- Breaking API change

### Resource Blocker

**Description:** Needs resource not currently available.

**Identification:**
- Human review needed
- Specific expertise required
- Access permission needed

**Resolution:** Obtain resource or find alternative.

**Examples:**
- Needs design review
- Needs security audit
- Needs database admin access

### Decision Blocker

**Description:** Waiting on decision before proceeding.

**Identification:**
- Multiple valid approaches
- Needs stakeholder input
- Architecture choice pending

**Resolution:** Make decision or escalate.

**Examples:**
- Which framework to use?
- Build vs buy decision
- API design approval

## Severity Levels

| Severity | Description | Criteria |
|----------|-------------|----------|
| Critical | Blocks multiple important modules | >3 dependents, high DSA |
| High | Blocks single important module | 1-3 dependents, high DSA |
| Medium | Blocks lower-priority work | Any dependents, medium DSA |
| Low | Self-contained blockage | No dependents |

## Unblock Strategies

### Direct Completion

When blocker is unblocked itself:
1. Add blocker to queue
2. Complete blocker
3. Blocked modules auto-unblock

### Workaround

When blocker can be bypassed:
1. Identify minimal interface needed
2. Create stub/mock
3. Proceed with dependent work
4. Replace stub when blocker completes

### Chain Unblock

When blocker has its own blockers:
1. Trace full dependency chain
2. Find first unblocked item
3. Plan sequential completion
4. Consider parallel work where possible

### Defer

When unblocking is too costly:
1. Mark dependent as deferred
2. Document reason
3. Set revisit criteria
4. Move to other work

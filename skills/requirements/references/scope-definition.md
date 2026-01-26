# Scope Definition

Drawing clear boundaries around what's included and excluded.

## Why This Matters

Scope creep is the most common cause of project failure. Every undefined boundary is an invitation for expansion. Clear scope protects the timeline, the team, and the quality of what you ship.

## The Scope Definition Process

### 1. Start with the Problem

What problem are we solving? Scope should serve the problem, not exceed it.

| Problem | Appropriate Scope | Scope Creep |
|---------|-------------------|-------------|
| "Users need to analyze orders in Excel" | CSV export | PDF export, scheduled reports, analytics dashboard |
| "Users forget their passwords" | Password reset via email | Biometric login, SSO, security questions |

### 2. Define Minimum Viable Scope

What's the smallest thing that solves the problem?

```markdown
### MVP Analysis

**Problem:** Users can't analyze their order data

**Minimum solution:**
- Export orders as CSV
- Include basic order data

**Not minimum (save for later):**
- Multiple export formats
- Column customization
- Scheduled exports
- Data visualization
```

### 3. Categorize Requirements

| Category | Definition | Example |
|----------|------------|---------|
| **Must Have** | Feature doesn't work without this | Export button, CSV generation |
| **Should Have** | Important but not blocking | Date range filter |
| **Could Have** | Nice to have if time permits | Column selection |
| **Won't Have** | Explicitly excluded | PDF export, scheduled exports |

### 4. Document the Boundaries

```markdown
### In Scope
- User can export their own orders
- Export as CSV format
- Include order ID, date, customer, total, status
- Filter by date range

### Out of Scope
- Export other users' orders (admin feature, future)
- Excel (xlsx) format
- PDF format
- Scheduled/recurring exports
- Export of customers or products (separate features)
- Real-time data sync
```

## Scope Negotiation

### When Scope Is Too Large

```markdown
Original scope: "Full user management"

Questions to ask:
1. What's the most critical capability?
2. What can users do today? (What's the gap?)
3. What would make this useful enough to ship?
4. What can wait until V2?

Negotiated scope:
- V1: Create users, basic roles (admin/user)
- V2: Custom roles, permissions
- V3: Teams, delegation
```

### The 80/20 Rule

20% of the scope often delivers 80% of the value. Find that 20%.

| Full Scope | 80/20 Scope | Value Captured |
|------------|-------------|----------------|
| Export with 20 format options | CSV only | 80% (most users use CSV) |
| Full RBAC with custom roles | Two roles: admin/user | 90% (covers most cases) |
| Rich text editor | Plain text + markdown | 70% (most content is simple) |

### Trading Scope for Quality

When time is fixed, scope is the lever:

```
Fixed: Timeline, Quality
Variable: Scope

If: Scope > Capacity
Then: Reduce scope (don't reduce quality, don't extend timeline)
```

## Scope Documentation

### Simple Format

```markdown
**In Scope:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Out of Scope:**
- [Excluded 1] — Reason: [Why excluded]
- [Excluded 2] — Reason: [Why excluded]
```

### Detailed Format

```markdown
### Scope: [Feature Name]

#### In Scope (Must Have)
| Capability | Description | Acceptance Criteria |
|------------|-------------|---------------------|
| [Cap 1] | [Description] | [Criteria] |
| [Cap 2] | [Description] | [Criteria] |

#### In Scope (Should Have)
| Capability | Description | Can Ship Without? |
|------------|-------------|-------------------|
| [Cap 3] | [Description] | Yes, but degraded UX |

#### In Scope (Could Have)
| Capability | Description | Effort | Value |
|------------|-------------|--------|-------|
| [Cap 4] | [Description] | Low | Medium |

#### Out of Scope
| Item | Reason | Future Phase? |
|------|--------|---------------|
| [Item 1] | [Reason] | V2 |
| [Item 2] | [Reason] | Never |
| [Item 3] | [Reason] | When requested |
```

## Scope Creep Prevention

### Red Flags

| Warning Sign | Response |
|--------------|----------|
| "While we're at it..." | "Let's add that to the backlog for V2" |
| "Can we also..." | "Is this blocking the original goal?" |
| "It would be nice to..." | "Nice-to-have goes in Could Have" |
| "Users might want..." | "Do we have evidence they want it?" |
| "It's just a small change" | "Small changes add up. Does this serve the core goal?" |

### The Scope Change Process

When new requirements emerge:

```markdown
1. Document the request
2. Assess impact (time, complexity, dependencies)
3. Compare to original goal (does it serve the same problem?)
4. Decide: In scope (trade something out) or Out of scope (V2)
5. Get explicit approval for any scope changes
6. Update the spec document
```

### Defending Scope

When stakeholders push for more:

| Push | Response |
|------|----------|
| "We need all of this" | "What if we can only ship one? Which is most important?" |
| "It's not complete without X" | "Is X blocking the core use case?" |
| "Competitors have this" | "Is it why users choose competitors?" |
| "It won't take long" | "Let's estimate properly. If it's quick, we can add it to V2." |

## Phased Scope

### When to Phase

Phase when:
- Full scope exceeds timeline
- Uncertainty requires learning
- Foundational work enables future features
- Risk needs to be reduced incrementally

### Phase Structure

```markdown
### Phase 1: Foundation (2 weeks)
Goal: Basic export works
- CSV export
- All orders
- Fixed columns

### Phase 2: Flexibility (2 weeks)
Goal: Users can customize export
- Date range filter
- Column selection
- Excel format

### Phase 3: Automation (2 weeks)
Goal: Users don't have to remember to export
- Scheduled exports
- Email delivery

### Future (Not scheduled)
- Export templates
- API access
- Data visualization
```

## Scope Checklist

```markdown
### Scope Definition Review

**Completeness:**
- [ ] All requirements are categorized (Must/Should/Could/Won't)
- [ ] Out of scope is explicitly listed
- [ ] Reasons for exclusions are documented
- [ ] Phase boundaries are clear (if phased)

**Clarity:**
- [ ] No ambiguous requirements
- [ ] Each item is specific enough to estimate
- [ ] Success criteria are defined

**Alignment:**
- [ ] Scope serves the stated problem
- [ ] Scope fits the timeline
- [ ] Stakeholders have approved scope
- [ ] Team has reviewed scope

**Change Management:**
- [ ] Process for scope changes is defined
- [ ] Version history is maintained
```

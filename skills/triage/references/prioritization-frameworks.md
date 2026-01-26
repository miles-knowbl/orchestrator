# Prioritization Frameworks

Detailed guide to each prioritization framework.

## Framework Selection Guide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHICH FRAMEWORK?                                          │
│                                                                             │
│  What's your situation?                                                     │
│  │                                                                          │
│  ├─ Building new system with many dependencies                              │
│  │   └─→ Dependency-First                                                   │
│  │                                                                          │
│  ├─ Need to maximize ROI with limited resources                             │
│  │   └─→ WSJF (Weighted Shortest Job First)                                 │
│  │                                                                          │
│  ├─ Fixed deadline, need to define what's in/out                            │
│  │   └─→ MoSCoW                                                             │
│  │                                                                          │
│  ├─ Mix of urgent fires and strategic work                                  │
│  │   └─→ Eisenhower Matrix                                                  │
│  │                                                                          │
│  └─ Many items, need quantitative comparison                                │
│      └─→ RICE Scoring                                                       │
│                                                                             │
│  Tip: Often useful to combine frameworks                                    │
│  Example: Dependency-First for order, WSJF within each tier                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dependency-First Prioritization

### When to Use

- New domain/project with interconnected systems
- Infrastructure work that enables other work
- Clear technical dependencies

### Process

1. **List all items** with their dependencies
2. **Build dependency graph** (directed acyclic graph)
3. **Topological sort** to get valid order
4. **Within each tier**, order by secondary criteria (value, effort)

### Algorithm

```javascript
function dependencyFirstSort(systems) {
  const sorted = [];
  const visited = new Set();
  const inProgress = new Set();

  function visit(system) {
    if (visited.has(system.id)) return;
    if (inProgress.has(system.id)) {
      throw new Error(`Circular dependency: ${system.id}`);
    }

    inProgress.add(system.id);

    for (const depId of system.dependencies) {
      const dep = systems.find(s => s.id === depId);
      if (dep) visit(dep);
    }

    inProgress.delete(system.id);
    visited.add(system.id);
    sorted.push(system);
  }

  for (const system of systems) {
    visit(system);
  }

  return sorted;
}
```

### Example

```markdown
## Dependency Analysis: Field Service Platform

### Systems and Dependencies
| System | Depends On |
|--------|------------|
| Auth | — |
| Users | Auth |
| Work Orders | Auth, Users |
| Scheduling | Work Orders |
| Mobile | Auth, Work Orders, Scheduling |
| Analytics | Work Orders |

### Dependency Graph
```
Auth ─────────────────┬─────────────────┐
  │                   │                 │
  ▼                   ▼                 │
Users              Work Orders ◄────────┘
  │                   │
  │                   ├─────────┬───────────┐
  │                   │         │           │
  │                   ▼         ▼           ▼
  │              Scheduling  Analytics   Mobile
  │                   │                     ▲
  └───────────────────┴─────────────────────┘
```

### Tiered Result
| Tier | Systems | Notes |
|------|---------|-------|
| 1 | Auth | No dependencies |
| 2 | Users, Work Orders | Depend only on Tier 1 |
| 3 | Scheduling, Analytics | Depend on Tier 1-2 |
| 4 | Mobile | Depends on multiple |

### Within-Tier Ordering (by value)
| Priority | System | Tier | Value Score |
|----------|--------|------|-------------|
| 1 | Auth | 1 | Foundation |
| 2 | Work Orders | 2 | 9 (core feature) |
| 3 | Users | 2 | 7 (required) |
| 4 | Scheduling | 3 | 8 (key value) |
| 5 | Analytics | 3 | 5 (nice to have) |
| 6 | Mobile | 4 | 8 (but blocked) |
```

---

## WSJF (Weighted Shortest Job First)

### When to Use

- Limited capacity, need to maximize value
- Continuous flow of work
- Economic optimization

### Formula

```
WSJF = (Business Value + Time Criticality + Risk Reduction) / Job Size
```

### Scoring Guide

**Business Value (1-10)**
| Score | Meaning |
|-------|---------|
| 1-2 | Minor improvement |
| 3-4 | Helpful but not critical |
| 5-6 | Important to users |
| 7-8 | Significant business impact |
| 9-10 | Game-changing / critical |

**Time Criticality (1-10)**
| Score | Meaning |
|-------|---------|
| 1-2 | Can wait indefinitely |
| 3-4 | Needed sometime this quarter |
| 5-6 | Needed this month |
| 7-8 | Needed this sprint |
| 9-10 | Needed immediately |

**Risk Reduction / Opportunity Enablement (1-10)**
| Score | Meaning |
|-------|---------|
| 1-2 | No risk reduction |
| 3-4 | Minor uncertainty reduced |
| 5-6 | Moderate learning value |
| 7-8 | Significant risk reduction |
| 9-10 | Critical path de-risking |

**Job Size (1-10)**
| Score | Meaning | Rough Hours |
|-------|---------|-------------|
| 1 | Trivial | < 4 |
| 2 | XS | 4-8 |
| 3 | S | 8-16 |
| 5 | M | 16-40 |
| 8 | L | 40-80 |
| 13 | XL | 80-160 |

### Example Worksheet

```markdown
## WSJF Scoring: Q1 Backlog

| System | Value | Time | Risk | Total | Size | WSJF | Rank |
|--------|-------|------|------|-------|------|------|------|
| Payment Integration | 9 | 8 | 4 | 21 | 8 | 2.6 | 3 |
| Search Feature | 7 | 5 | 3 | 15 | 3 | 5.0 | 1 |
| Admin Dashboard | 5 | 4 | 2 | 11 | 5 | 2.2 | 4 |
| API Rate Limiting | 6 | 7 | 5 | 18 | 2 | 9.0 | 1 |
| Mobile App | 8 | 4 | 3 | 15 | 13 | 1.2 | 5 |

### Result Order
1. API Rate Limiting (WSJF: 9.0) — Small, urgent, reduces risk
2. Search Feature (WSJF: 5.0) — Good value, small effort
3. Payment Integration (WSJF: 2.6) — High value but large
4. Admin Dashboard (WSJF: 2.2) — Moderate value
5. Mobile App (WSJF: 1.2) — Large effort dampens score
```

---

## MoSCoW Method

### When to Use

- Fixed deadline (release date, contract)
- Need to define MVP
- Scope negotiation with stakeholders

### Categories

| Category | Meaning | % of Effort (typical) |
|----------|---------|----------------------|
| **Must** | Without this, the release is a failure | 60% |
| **Should** | Important, painful to leave out | 20% |
| **Could** | Nice to have, if time permits | 15% |
| **Won't** | Explicitly excluded from this release | — |

### Process

1. List all potential items
2. Classify each with stakeholders
3. Ensure Musts fit in timeline
4. Plan Shoulds for remaining capacity
5. Coulds only if ahead of schedule

### Example

```markdown
## MoSCoW: Field Service v1.0

**Release Date:** March 15
**Available Capacity:** 400 hours

### Must Have (Critical for launch)
| Feature | Effort | Running Total |
|---------|--------|---------------|
| User authentication | 30 | 30 |
| Work order CRUD | 50 | 80 |
| Basic assignment | 40 | 120 |
| Technician mobile view | 60 | 180 |
| Customer notifications | 30 | 210 |
| **Total Must** | **210** | |

**Must-have utilization:** 210/400 = 52% ✓

### Should Have (Important)
| Feature | Effort | Running Total |
|---------|--------|---------------|
| Status history | 25 | 235 |
| Route optimization (basic) | 45 | 280 |
| Supervisor dashboard | 35 | 315 |
| **Total Should** | **105** | |

**Must + Should:** 315/400 = 79% ✓

### Could Have (Nice to have)
| Feature | Effort | Notes |
|---------|--------|-------|
| Offline mode | 50 | Only if ahead |
| Advanced reporting | 40 | Nice for stakeholders |
| Customer portal | 45 | Can wait for v1.1 |

### Won't Have (Explicitly v1.1+)
- Mobile app (iOS/Android native)
- Third-party integrations
- Machine learning predictions
- Multi-tenant support
```

---

## RICE Scoring

### When to Use

- Product backlog prioritization
- Comparing diverse feature requests
- Data-driven decisions

### Formula

```
RICE = (Reach × Impact × Confidence) / Effort
```

### Component Definitions

**Reach:** Number of users/customers affected per time period
- Count of users per quarter
- Can be transactions, requests, etc.

**Impact:** Degree of effect per person
| Score | Meaning |
|-------|---------|
| 3 | Massive — transforms experience |
| 2 | High — significant improvement |
| 1 | Medium — noticeable improvement |
| 0.5 | Low — minor improvement |
| 0.25 | Minimal — barely noticeable |

**Confidence:** How sure are you?
| Score | Meaning |
|-------|---------|
| 100% | High — backed by data |
| 80% | Medium — some evidence |
| 50% | Low — gut feeling |

**Effort:** Person-months of work
- Team-independent measure
- Include all work (dev, design, QA)

### Example

```markdown
## RICE Scoring: Product Backlog

### Scoring Table
| Feature | Reach | Impact | Confidence | Effort | Score |
|---------|-------|--------|------------|--------|-------|
| Search improvements | 10,000 | 1 | 80% | 2 | 4,000 |
| Mobile app | 5,000 | 2 | 70% | 5 | 1,400 |
| Admin bulk actions | 100 | 3 | 90% | 1 | 270 |
| API v2 | 500 | 2 | 60% | 3 | 200 |
| Dark mode | 8,000 | 0.5 | 90% | 0.5 | 7,200 |

### Ranked Result
| Rank | Feature | RICE | Notes |
|------|---------|------|-------|
| 1 | Dark mode | 7,200 | Quick win, high reach |
| 2 | Search improvements | 4,000 | Good impact |
| 3 | Mobile app | 1,400 | High effort hurts score |
| 4 | Admin bulk actions | 270 | Low reach |
| 5 | API v2 | 200 | Low confidence + effort |

### Insights
- Dark mode scores highest due to low effort + high reach
- Mobile app has high impact but effort dampens priority
- Admin bulk actions helps few but helps them a lot
```

---

## Combining Frameworks

Often useful to use multiple frameworks:

### Example: Dependency + WSJF

```markdown
## Combined Prioritization

### Step 1: Dependency Tiers
| Tier | Systems |
|------|---------|
| 1 | Auth |
| 2 | Users, Orders |
| 3 | Scheduling, Analytics |
| 4 | Mobile |

### Step 2: WSJF Within Tiers

**Tier 2:**
| System | Value | Time | Risk | Size | WSJF |
|--------|-------|------|------|------|------|
| Orders | 9 | 7 | 5 | 5 | 4.2 |
| Users | 6 | 5 | 3 | 3 | 4.7 |

**Tier 3:**
| System | Value | Time | Risk | Size | WSJF |
|--------|-------|------|------|------|------|
| Scheduling | 8 | 6 | 4 | 5 | 3.6 |
| Analytics | 5 | 3 | 2 | 3 | 3.3 |

### Final Order
1. Auth (Tier 1 — no choice)
2. Users (Tier 2, higher WSJF)
3. Orders (Tier 2, lower WSJF)
4. Scheduling (Tier 3, higher WSJF)
5. Analytics (Tier 3, lower WSJF)
6. Mobile (Tier 4 — blocked until Tier 3)
```

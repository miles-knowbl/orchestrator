# Estimation Methods

Detailed guide to each estimation method with examples.

## Method Selection Guide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHICH METHOD TO USE?                                      │
│                                                                             │
│  How much detail do you have?                                               │
│  │                                                                          │
│  ├─ Just a concept, no spec yet                                             │
│  │   └─→ T-Shirt Sizing                                                     │
│  │                                                                          │
│  ├─ Have done similar work before                                           │
│  │   └─→ Analogous Estimation                                               │
│  │                                                                          │
│  ├─ Work is repetitive/countable                                            │
│  │   └─→ Parametric Estimation                                              │
│  │                                                                          │
│  ├─ High uncertainty, need to show risk                                     │
│  │   └─→ Three-Point Estimation                                             │
│  │                                                                          │
│  └─ Detailed spec, need accurate forecast                                   │
│      └─→ Bottom-Up Estimation                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## T-Shirt Sizing

### Definition

Quick relative sizing using Small/Medium/Large/XL categories.

### When to Use

- Early project planning
- Backlog grooming
- Comparing relative effort of items
- When detailed specs don't exist yet

### Reference Points

Establish calibration with team:

| Size | Reference Example | Hours (Typical) |
|------|-------------------|-----------------|
| **S** | Add a config option | 1-4 |
| **M** | New API endpoint with tests | 4-16 |
| **L** | New feature with multiple endpoints | 16-40 |
| **XL** | New service or major feature | 40-100 |

### Process

1. Review item description
2. Compare to reference examples
3. Assign size
4. If between sizes, round up
5. If larger than XL, decompose

### Example

```markdown
## T-Shirt Sizing Session

| Item | Size | Rationale |
|------|------|-----------|
| Add email validation | S | Simple regex, one field |
| User profile page | M | CRUD + UI, straightforward |
| OAuth integration | L | External API, security, multiple flows |
| Reporting dashboard | XL | Multiple charts, data aggregation, filters |
| Mobile app MVP | Beyond XL | Decompose into smaller items |
```

---

## Analogous Estimation

### Definition

Estimate by comparing to similar completed work.

### When to Use

- Similar work has been done before
- Historical data is available
- New work has recognizable patterns

### Process

1. Identify similar past work
2. Note the actual effort from that work
3. Identify differences (scope, complexity, context)
4. Adjust estimate based on differences
5. Document the comparison

### Example

```markdown
## Analogous Estimate: Notification Service

### Reference: Email Service (completed Q3)

| Aspect | Email Service (Actual) | Notification Service | Adjustment |
|--------|------------------------|---------------------|------------|
| **Core logic** | 16 hours | Similar complexity | 16 hours |
| **Channels** | 1 (SMTP) = 8 hours | 4 channels | 32 hours |
| **Templates** | 6 hours | Reuse pattern | 6 hours |
| **Testing** | 10 hours | More channels | 16 hours |
| **Deployment** | 4 hours | Same process | 4 hours |

### Summary

| | Email | Notification | Delta |
|-|-------|--------------|-------|
| **Total** | 44 hours | 74 hours | +68% |

### Confidence: Medium
- Same architecture pattern: +confidence
- More channels to integrate: -confidence
- Team is experienced now: +confidence
```

---

## Parametric Estimation

### Definition

Calculate estimate using mathematical relationships between variables.

### When to Use

- Work is repetitive
- Units are countable (endpoints, screens, reports)
- Historical rates are known

### Process

1. Identify the countable units
2. Determine rate per unit (from history)
3. Count units in new work
4. Multiply: Estimate = Count × Rate
5. Add fixed costs (setup, deployment, etc.)

### Common Parameters

| Unit | Typical Rate | Notes |
|------|--------------|-------|
| REST endpoint | 2-4 hours | Including basic tests |
| Database table | 1-2 hours | Schema + model |
| UI screen | 4-8 hours | Depending on complexity |
| Integration | 8-16 hours | Per external system |
| Report | 4-12 hours | Depending on complexity |

### Example

```markdown
## Parametric Estimate: Customer Portal API

### Known Rates (from team history)
- REST endpoint: 3 hours average
- Database model: 1.5 hours average
- Integration test: 1 hour per endpoint

### Scope Count
| Unit | Count |
|------|-------|
| Endpoints | 12 |
| Database models | 5 |
| Integrations | 2 |

### Calculation

| Component | Count | Rate | Total |
|-----------|-------|------|-------|
| Endpoints | 12 | 3 | 36 |
| Models | 5 | 1.5 | 7.5 |
| Integration tests | 12 | 1 | 12 |
| External integrations | 2 | 12 | 24 |
| **Subtotal** | | | **79.5** |
| Setup/scaffolding | | | 8 |
| Documentation | | | 6 |
| **Total** | | | **93.5 hours** |

### Confidence: High
- Well-understood work
- Rates from recent similar project
```

---

## Three-Point Estimation (PERT)

### Definition

Account for uncertainty using optimistic, most likely, and pessimistic scenarios.

### When to Use

- Significant uncertainty exists
- Need to communicate risk to stakeholders
- Novel or complex work
- External dependencies

### Formula

```
PERT Estimate = (O + 4M + P) / 6

Where:
  O = Optimistic (best case, 10% probability)
  M = Most Likely (realistic case)
  P = Pessimistic (worst case, 10% probability)

Standard Deviation = (P - O) / 6
```

### Process

1. Estimate optimistic scenario (everything goes right)
2. Estimate most likely scenario (typical experience)
3. Estimate pessimistic scenario (things go wrong, but project completes)
4. Calculate PERT estimate
5. Report range based on standard deviation

### Example

```markdown
## Three-Point Estimate: Payment Gateway Integration

### Scenarios

| Scenario | Estimate | Assumptions |
|----------|----------|-------------|
| **Optimistic (O)** | 30 hours | Clean API, good docs, no compliance issues |
| **Most Likely (M)** | 50 hours | Some API quirks, normal back-and-forth |
| **Pessimistic (P)** | 100 hours | Poor API, compliance review required, rework |

### Calculation

PERT = (30 + 4×50 + 100) / 6 = **55 hours**
Std Dev = (100 - 30) / 6 = **11.7 hours**

### Ranges

| Confidence | Range | Interpretation |
|------------|-------|----------------|
| 68% (±1σ) | 43-67 hours | Likely range |
| 95% (±2σ) | 32-78 hours | Almost certain |

### Recommendation

**Estimate: 55 hours** with range of 43-67 hours

Key risks:
- API documentation quality unknown
- Compliance review may be required
- Test environment availability

### Confidence: Medium
```

---

## Bottom-Up Estimation

### Definition

Build estimate by summing detailed task-level estimates.

### When to Use

- Detailed spec available
- Need accurate forecast
- Sprint planning / commitment
- Fixed-price work

### Process

1. Decompose work into tasks (< 1 day each)
2. Estimate each task
3. Identify dependencies
4. Sum for total effort
5. Calculate duration considering parallelism
6. Add contingency

### Task Granularity

| Too Big | Right Size | Too Small |
|---------|------------|-----------|
| "Build the API" | "Implement POST /orders endpoint" | "Write line 45 of controller" |
| "Add authentication" | "Integrate JWT middleware" | "Import jwt library" |

### Example

```markdown
## Bottom-Up Estimate: Inventory Service

### Task Breakdown

#### 1. Setup & Scaffolding
| Task | Hours | Dependencies |
|------|-------|--------------|
| Create repo structure | 1 | - |
| Configure database | 2 | - |
| Setup CI/CD | 2 | - |
| **Subtotal** | **5** | |

#### 2. Core Models
| Task | Hours | Dependencies |
|------|-------|--------------|
| Product model | 2 | Setup |
| Location model | 1.5 | Setup |
| Stock model | 2 | Product, Location |
| Movement model | 2 | Stock |
| **Subtotal** | **7.5** | |

#### 3. API Endpoints
| Task | Hours | Dependencies |
|------|-------|--------------|
| GET /products | 2 | Product model |
| POST /products | 2 | Product model |
| GET /stock | 3 | Stock model |
| POST /stock/adjust | 4 | Stock, Movement |
| GET /movements | 2 | Movement model |
| **Subtotal** | **13** | |

#### 4. Business Logic
| Task | Hours | Dependencies |
|------|-------|--------------|
| Stock calculation | 4 | Models |
| Low stock alerts | 3 | Stock |
| Reservation system | 6 | Stock |
| **Subtotal** | **13** | |

#### 5. Testing
| Task | Hours | Dependencies |
|------|-------|--------------|
| Unit tests | 8 | All code |
| Integration tests | 6 | All code |
| **Subtotal** | **14** | |

#### 6. Documentation & Polish
| Task | Hours | Dependencies |
|------|-------|--------------|
| API documentation | 4 | All endpoints |
| README | 2 | All |
| Code review fixes | 4 | Review feedback |
| **Subtotal** | **10** | |

### Summary

| Phase | Hours |
|-------|-------|
| Setup | 5 |
| Models | 7.5 |
| Endpoints | 13 |
| Business Logic | 13 |
| Testing | 14 |
| Documentation | 10 |
| **Total Effort** | **62.5 hours** |

### Duration Calculation

- 1 developer: 62.5 / 6 hours/day = **10.4 days** (~2 weeks)
- 2 developers (some parallelism): **7-8 days** (~1.5 weeks)

### Contingency

Add 15% for unknowns: 62.5 × 1.15 = **72 hours**

### Final Estimate

**Effort:** 72 hours (range: 62-80)
**Duration:** 2 weeks (1 developer)
**Confidence:** High
```

---

## Combining Methods

Often useful to use multiple methods and compare:

```markdown
## Multi-Method Estimate: Search Feature

| Method | Estimate | Notes |
|--------|----------|-------|
| T-Shirt | L (~30 hours) | Quick assessment |
| Analogous | 35 hours | Compared to filters feature |
| Three-Point | 38 hours | (25 + 4×35 + 60)/6 |
| Bottom-Up | 42 hours | Detailed task list |

### Reconciliation

- Methods converge around 35-42 hours
- Bottom-up slightly higher (good - it's more detailed)
- Use 40 hours as estimate
- Range: 32-48 hours (±20%)

### Final: 40 hours, Medium confidence
```

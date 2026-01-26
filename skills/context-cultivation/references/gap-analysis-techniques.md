# Gap Analysis Techniques

Systematic approaches for identifying, classifying, and addressing missing information during context cultivation.

## Systematic Gap Identification

Gaps hide in plain sight. Use these structured sweeps to surface them.

### Domain Sweep

Examine each domain systematically. For every domain, ask: "What do we know, and what should we know but do not?"

| Domain | Key Questions | Gap Signals |
|--------|---------------|-------------|
| **Users** | Who are they? What do they need? How do they behave? | Assumptions stated as facts; no user data cited |
| **Technical** | What exists? What are the constraints? What is the stack? | Architecture described vaguely; no version specifics |
| **Market** | Who competes? What is the landscape? What are the trends? | No competitor mentions; market size unstated |
| **Business** | What is the model? What are the economics? What are KPIs? | Revenue model unclear; success metrics missing |
| **Organizational** | Who decides? What is the culture? What are the politics? | Decision-makers unidentified; process undocumented |
| **Temporal** | What is the timeline? What has changed recently? | No dates in sources; historical context absent |
| **Risk** | What could go wrong? What are the dependencies? | No risk discussion; all scenarios are optimistic |

### Perspective Sweep

Check whether all relevant viewpoints are represented: end users, technical implementers, business stakeholders, operations/support, external parties (partners, regulators, competitors), and domain experts. Any unrepresented perspective is a gap.

### Assumption Audit

Every unstated assumption is a potential gap. Extract assumptions by asking:

1. "What must be true for this theme to hold?"
2. "What are we taking for granted?"
3. "If a skeptic challenged this finding, what would they question?"

Document each assumption and rate its verification status:

| Status | Meaning |
|--------|---------|
| **Verified** | Evidence directly confirms this assumption |
| **Plausible** | Reasonable but not directly evidenced |
| **Unverified** | No evidence for or against |
| **Questionable** | Some evidence suggests this may be wrong |

## Coverage Matrix Construction

A coverage matrix maps information domains against sources to visualize where coverage is strong and where gaps exist.

### Building the Matrix

**Step 1:** List all information domains relevant to the analysis (rows).
**Step 2:** List all sources (columns).
**Step 3:** Rate coverage for each cell.

```
                    | Source A | Source B | Source C | Source D | Coverage
--------------------|---------|---------|---------|---------|----------
User needs          |  Deep   |    --   | Surface |    --   | Moderate
Technical stack     |    --   |  Deep   |    --   | Surface | Moderate
Market landscape    |    --   |    --   |    --   |    --   | GAP
Business model      | Surface |    --   |    --   |  Deep   | Moderate
Timeline/roadmap    |    --   |    --   | Surface |    --   | Weak
Risk assessment     |    --   |    --   |    --   |    --   | GAP
Stakeholder views   | Surface | Surface |    --   |    --   | Weak
```

**Legend:** `Deep` = Detailed, reliable. `Surface` = Mentioned, not detailed. `--` = Not addressed. `GAP` = No source covers this. `Weak` = Surface only.

### Reading the Matrix

| Pattern | Meaning | Action |
|---------|---------|--------|
| Column of `--` | A source contributes nothing useful | Reassess source value |
| Row of `--` | Complete gap in a domain | Flag severity; consider re-ingestion |
| Row of `Surface` | Superficial coverage only | Flag as weak area; seek depth |
| Diagonal of `Deep` | Each source specializes | Good diversity; check for blind spots |
| Cluster of `Deep` | Multiple deep sources on same domain | Strong coverage; use for triangulation |

## Gap Severity Classification

| Severity | Definition | Criteria | Action |
|----------|-----------|----------|--------|
| **Blocking** | Cannot produce reliable cultivation output | Affects core theme; no workaround exists; downstream decisions depend on it | Pause cultivation; return to ingestion phase |
| **Important** | Output is weakened but usable | Affects secondary themes; workaround exists with caveats | Proceed with explicit caveats; recommend future investigation |
| **Minor** | Would improve analysis but not essential | Affects peripheral findings; does not change main conclusions | Document for completeness; note in confidence assessment |

### Severity Decision Checklist

```
Does the gap affect a core theme or primary insight?
  YES --> Is there a reasonable workaround or assumption?
            YES --> IMPORTANT: Proceed with documented assumption
            NO  --> BLOCKING: Halt and address
  NO  --> Does it affect confidence in secondary findings?
            YES --> IMPORTANT: Document impact on confidence
            NO  --> MINOR: Note and continue
```

## Strategies for Filling Critical Gaps

### Immediate Strategies (During Cultivation)

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Inference** | Derive the missing information from available evidence | Gaps where indirect evidence exists |
| **Triangulation** | Combine partial coverage from multiple sources | Domains with surface-level mentions across sources |
| **Analogical reasoning** | Apply knowledge from similar domains | Technical or market gaps with known parallels |
| **Bounded estimation** | Establish reasonable upper and lower bounds | Quantitative gaps (market size, user counts) |

### Deferred Strategies (Post-Cultivation)

| Strategy | Description | Best For |
|----------|-------------|----------|
| **Targeted re-ingestion** | Go back and find sources for the specific gap | Blocking gaps with known source locations |
| **Stakeholder interview** | Ask someone who would know | Perspectival and organizational gaps |
| **Expert consultation** | Bring in domain expertise | Technical and market gaps requiring specialization |
| **Experimental validation** | Test the assumption directly | User behavior and technical feasibility gaps |

## Gap Documentation Template

```markdown
### Gap: [Descriptive title]

**Domain:** [User / Technical / Market / Business / Organizational / Temporal / Risk]
**Severity:** [Blocking / Important / Minor]

**What is missing:** [Precise description of the information gap]
**Why it matters:** [Impact on themes, patterns, insights, or downstream decisions]
**Fill strategy:** [Most promising approach] / Fallback: [Alternative approach]
**Working assumption:** [State the assumption if proceeding despite gap]
```

## Gap Analysis Checklist

```
- [ ] Domain sweep completed across all 7 domains
- [ ] Perspective sweep identifies missing viewpoints
- [ ] Assumption audit surfaces unstated assumptions
- [ ] Coverage matrix constructed and reviewed
- [ ] Each gap classified by severity
- [ ] Blocking gaps have fill strategies or escalation
- [ ] Gap findings integrated into confidence assessment
```

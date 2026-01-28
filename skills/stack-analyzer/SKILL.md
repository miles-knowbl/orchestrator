---
name: stack-analyzer
description: "Evaluate a target tech stack and map architectural concepts to stack-specific idioms, patterns, and libraries. Produces STACK-MAP.md with concept mapping, gap analysis, and risk assessment. Bridges the gap between source architecture and target implementation."
phase: MAP
category: specialized
version: "1.0.0"
depends_on: ["architecture-extractor"]
tags: [stack, analysis, mapping, technology, transposition]
---

# Stack Analyzer

Evaluate a target tech stack and map architecture concepts to stack-specific idioms.

## When to Use

- **Architecture transposition** --- Source architecture extracted, target stack chosen, need to map concepts
- **Stack evaluation** --- Determining if a stack can express a given architecture
- **Technology comparison** --- Mapping the same architecture to multiple stacks to compare fit
- **Gap analysis** --- Identifying where a stack lacks direct equivalents for architectural concepts
- When you say: "map this to Next.js", "how would this architecture look in Go?", "can this stack handle this architecture?"

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `STACK-MAP.md` | Project root | Always |

## Core Concept

Stack analysis answers: **"How does each architectural concept translate to this specific tech stack?"**

```
ARCHITECTURE.md          Target Stack
(what we're building)    (what we're building with)
        │                        │
        └───────────┬────────────┘
                    │
                    ▼
            ┌──────────────┐
            │ Stack        │
            │ Analyzer     │
            │              │
            │ concept →    │
            │   idiom      │
            └──────┬───────┘
                   │
                   ▼
            STACK-MAP.md
            (how each concept maps)
```

Stack analysis is NOT:
- Architecture design (that's `architect`)
- Technology selection from scratch (that's also `architect`)
- Implementation (that's `spec` and `implement`)

## The Analysis Process

```
┌─────────────────────────────────────────────────────────┐
│                 STACK ANALYSIS PROCESS                   │
│                                                         │
│  1. INVENTORY THE STACK                                 │
│     └─→ What technologies? Versions? Roles?             │
│                                                         │
│  2. MAP CONCEPTS                                        │
│     └─→ Architecture concept → stack equivalent         │
│                                                         │
│  3. TRANSLATE IDIOMS                                    │
│     └─→ Source patterns → target patterns               │
│                                                         │
│  4. IDENTIFY GAPS                                       │
│     └─→ What has no direct equivalent?                  │
│                                                         │
│  5. SELECT LIBRARIES                                    │
│     └─→ Fill gaps with ecosystem libraries              │
│                                                         │
│  6. ASSESS RISKS                                        │
│     └─→ Where is the transposition weakest?             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Inventory the Stack

Document every technology in the target stack:

```markdown
### Stack Inventory

| Technology | Version | Role | Category |
|-----------|---------|------|----------|
| [e.g., Next.js] | 14 | Application framework | Framework |
| [e.g., PostgreSQL] | 16 | Primary database | Storage |
| [e.g., Prisma] | 5.x | ORM / query builder | Data access |
| [e.g., Tailwind CSS] | 3.x | Styling | Presentation |
| [e.g., tRPC] | 11 | Type-safe API layer | Communication |
| [e.g., Redis] | 7 | Cache / pub-sub | Infrastructure |
```

**Categories:** Framework, Storage, Data Access, Communication, Presentation, Infrastructure, Auth, Monitoring, Testing

## Step 2: Map Concepts

For each architectural concept from ARCHITECTURE.md, identify the stack equivalent:

```markdown
### Concept Mapping

| Source Concept | Source Implementation | Target Stack Equivalent | Confidence |
|---------------|---------------------|------------------------|------------|
| Service layer | Express route handlers | Next.js Server Actions | High |
| Data model | Sequelize models | Prisma schema | High |
| Authentication | Passport.js + JWT | NextAuth.js | High |
| Real-time updates | Socket.io | Server-Sent Events via Route Handlers | Medium |
| Background jobs | Bull queue + Redis | Inngest or QStash | Medium |
| File storage | Local disk + S3 | Vercel Blob or S3 | High |
| Full-text search | Elasticsearch | PostgreSQL tsvector or Meilisearch | Low |
```

### Mapping Confidence

| Level | Meaning | Action Required |
|-------|---------|-----------------|
| **High** | Direct equivalent exists, well-documented | Straightforward implementation |
| **Medium** | Equivalent exists but requires adaptation | Document the adaptation in detail |
| **Low** | No direct equivalent, workaround needed | Flag in gap analysis, propose solution |

## Step 3: Translate Idioms

Source and target stacks express the same concepts differently. Document the translation:

```markdown
### Idiom Translation

| Pattern | Source Expression | Target Expression | Notes |
|---------|------------------|-------------------|-------|
| Data fetching | REST API + useEffect | Server Components + RSC | Shift from client to server |
| State management | Redux store | React Context + Server State | Less client state needed |
| Form handling | Formik + Yup | React Hook Form + Zod | Similar pattern, different libs |
| Error boundaries | Express error middleware | Next.js error.tsx files | Route-level in target |
| Database transactions | Sequelize.transaction() | Prisma.$transaction() | Nearly identical API |
| Authorization | Middleware chain | Middleware.ts + Server Action checks | Two enforcement points |
```

### Common Idiom Shifts

| Shift | From | To | Impact |
|-------|------|-----|--------|
| **Server-first** | SPA with API calls | Server Components / Server Actions | Major restructure |
| **Edge computing** | Single-region server | Edge functions + CDN | Data access patterns change |
| **Type-first** | Runtime validation | Compile-time type safety | Add type definitions everywhere |
| **Convention-based** | Explicit configuration | File-system routing, naming conventions | Directory structure matters |
| **Serverless** | Long-running process | Request-scoped functions | No persistent state |

## Step 4: Identify Gaps

Flag architectural concepts that have no direct stack equivalent:

```markdown
### Gap Analysis

| Source Concept | Gap Type | Severity | Proposed Solution |
|---------------|----------|----------|-------------------|
| [concept] | Missing | High/Medium/Low | [workaround or library] |
| [concept] | Partial | | [what's missing and how to fill it] |
| [concept] | Different | | [concept exists but works differently] |
```

**Gap types:**

| Type | Meaning | Example |
|------|---------|---------|
| **Missing** | No equivalent in stack | WebSocket server in serverless stack |
| **Partial** | Equivalent covers some but not all | ORM missing specific query patterns |
| **Different** | Equivalent exists but works fundamentally differently | Event-driven to request-response |
| **Scale** | Works at current scale but not at source scale | In-memory cache vs distributed cache |

## Step 5: Select Libraries

For each gap, recommend a library or approach:

```markdown
### Library Recommendations

| Gap | Library / Approach | Maturity | Maintenance | Integration |
|-----|-------------------|----------|-------------|-------------|
| [gap] | [library name] | Stable/Growing/New | Active/Maintained/Stale | Native/Adapter/Custom |
```

**Selection criteria:**

| Criterion | Weight | What to Check |
|-----------|--------|---------------|
| **Ecosystem fit** | High | Does it work well with the target stack? |
| **Maintenance** | High | Active maintainers? Recent releases? |
| **Type support** | Medium | TypeScript types? Quality of types? |
| **Bundle size** | Medium | Acceptable for the deployment target? |
| **Community** | Medium | Documentation? Stack Overflow? GitHub issues? |
| **Alternatives** | Low | What if this library dies? |

## Step 6: Assess Risks

Rate each mapping by transposition risk:

```markdown
### Risk Assessment

| Mapping | Risk | Impact | Likelihood | Mitigation |
|---------|------|--------|------------|------------|
| [concept → equivalent] | High/Medium/Low | [what goes wrong] | [why it might] | [how to reduce risk] |
```

**Risk factors:**

| Factor | Increases Risk |
|--------|---------------|
| Low confidence mapping | Concept translation is uncertain |
| Gap with no mature library | Custom implementation needed |
| Fundamental idiom shift | Architecture restructuring required |
| Performance-critical path | Stack may not match source performance |
| Security-critical path | Auth/authz model differs significantly |

## STACK-MAP.md Template

```markdown
# Stack Map: [Source System] → [Target Stack]

## Target Stack Inventory
[Table from Step 1]

## Concept Mapping
[Table from Step 2]

## Idiom Translation
[Table from Step 3]

## Gap Analysis
[Table from Step 4]

## Library Recommendations
[Table from Step 5]

## Risk Assessment
[Table from Step 6]

## Transposition Summary

| Metric | Value |
|--------|-------|
| Concepts mapped | [N] |
| High confidence | [N] (X%) |
| Medium confidence | [N] (X%) |
| Low confidence | [N] (X%) |
| Gaps identified | [N] |
| High-risk mappings | [N] |
| Libraries needed | [N] |

## Recommendation
[Overall assessment: is this transposition feasible? What are the biggest risks?
 What should the spec pay special attention to?]
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architecture-extractor` | Extractor produces ARCHITECTURE.md that stack-analyzer consumes |
| `architect` | Architect makes ADR decisions informed by stack-map gaps and risks |
| `spec` | Spec uses stack-map to write stack-specific implementation code |
| `implement` | Implementation follows the concept mapping and idiom translations |

## Key Principles

**Map, don't force.** If a concept doesn't translate cleanly, document the gap rather than forcing a bad mapping. Gaps inform better decisions downstream.

**Idioms over libraries.** Prefer stack-native idioms over bolting on libraries. A Next.js app should feel like Next.js, not like Express wearing a Next.js costume.

**Confidence is information.** Low-confidence mappings aren't failures — they're signals that the spec needs extra attention in those areas.

**The stack has opinions.** Respect them. Fighting a framework's conventions creates maintenance burden. When the source architecture conflicts with target stack idioms, adapt the architecture.

**Risk compounds.** Multiple medium-risk mappings in the same data flow become high-risk. Assess risk at the flow level, not just per-concept.

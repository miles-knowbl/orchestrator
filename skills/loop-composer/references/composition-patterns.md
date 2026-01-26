# Composition Patterns Reference

Concrete, production-tested loop compositions for common use cases. Use these as starting points for new loops -- customize rather than compose from scratch.

## Pattern 1: Engineering Loop (Full Rigor)

The flagship pattern. Complete software development lifecycle with comprehensive quality gates.

### Characteristics

| Property | Value |
|----------|-------|
| Phases | 9 (INIT through COMPLETE, skip VALIDATE) |
| Gates | 4 (spec, architecture, review, deploy) |
| Autonomy | supervised |
| Mode | greenfield |
| Skills | 9 unique |

### Phase Layout

```
INIT ──────────── spec
    [spec-gate]
SCAFFOLD ──────── architect, scaffold
    [architecture-gate]
IMPLEMENT ─────── implement
TEST ──────────── test-generation
VERIFY ─────────── code-verification
DOCUMENT ──────── document
REVIEW ─────────── code-review
    [review-gate]
SHIP ──────────── deploy
    [deploy-gate]
COMPLETE ──────── loop-controller
```

### When to Use

- Building production software from requirements
- Full team review and approval workflow
- Projects where quality and correctness are paramount
- New features in established codebases

### When NOT to Use

- Quick prototypes (too much overhead)
- Non-code deliverables (use proposal or content pattern)
- Infrastructure-only changes (use infrastructure pattern)

### Key Design Decisions

1. **SCAFFOLD has two skills** (architect + scaffold): Architecture decisions before file generation
2. **DOCUMENT is optional**: Not all features need dedicated documentation
3. **SHIP is optional**: Not all features deploy immediately
4. **Deploy gate is conditional**: Only gates if SHIP phase ran

### Customization Points

| Modification | How |
|-------------|-----|
| Add security review | Add `security-audit` to REVIEW phase |
| Add performance validation | Add VALIDATE phase with `perf-analysis` |
| Remove documentation | Remove DOCUMENT phase |
| Make autonomous | Change autonomy to `autonomous`, gates to `automated` |

---

## Pattern 2: Proposal Loop (Research to Document)

Context-gathering and synthesis pipeline for creating proposals, analyses, and reports.

### Characteristics

| Property | Value |
|----------|-------|
| Phases | 4 (INIT, SCAFFOLD, IMPLEMENT, COMPLETE) |
| Gates | 4 (context, cultivation, priorities, final) |
| Autonomy | supervised |
| Mode | greenfield |
| Skills | 4 unique (all custom category) |

### Phase Layout

```
INIT ──────────── context-ingestion
    [context-gate]
SCAFFOLD ──────── context-cultivation
    [cultivation-gate]
IMPLEMENT ─────── priority-matrix
    [priorities-gate]
COMPLETE ──────── proposal-builder
    [final-gate]
```

### When to Use

- Creating proposals from raw research context
- Analysis pipelines that synthesize information
- Document-centric workflows (not code)
- Consulting deliverables

### Key Design Decisions

1. **Gate after every phase**: Proposals require human judgment at each synthesis step
2. **Custom skills only**: Domain-specific skills rather than engineering core skills
3. **No TEST/VERIFY/REVIEW**: Not code, so code quality phases are irrelevant
4. **COMPLETE produces output**: proposal-builder generates the final deliverable

### Customization Points

| Modification | How |
|-------------|-----|
| Add quantitative analysis | Add `perf-analysis` or custom analysis skill to IMPLEMENT |
| Reduce gates | Remove cultivation-gate for faster iteration |
| Add review cycle | Insert REVIEW phase with human review skill |
| Multi-proposal | Run IMPLEMENT + COMPLETE multiple times with different parameters |

---

## Pattern 3: Lightweight Loop (Minimal Viable)

Fastest path from idea to output. Minimal phases, minimal gates, maximum velocity.

### Characteristics

| Property | Value |
|----------|-------|
| Phases | 3 (INIT, IMPLEMENT, COMPLETE) |
| Gates | 1 (approval after INIT) |
| Autonomy | semi-autonomous |
| Mode | greenfield |
| Skills | 3 unique |

### Phase Layout

```
INIT ──────────── spec
    [approval-gate]
IMPLEMENT ─────── implement
COMPLETE ──────── loop-controller
```

### loop.json

```json
{
  "id": "lightweight-loop",
  "name": "Lightweight Loop",
  "version": "1.0.0",
  "description": "Minimal loop for quick prototyping and small features. Spec to implementation with one approval gate.",

  "phases": [
    { "name": "INIT", "skills": ["spec"], "required": true },
    { "name": "IMPLEMENT", "skills": ["implement"], "required": true },
    { "name": "COMPLETE", "skills": ["loop-controller"], "required": true }
  ],

  "gates": [
    {
      "id": "approval-gate",
      "name": "Spec Approval",
      "afterPhase": "INIT",
      "required": true,
      "approvalType": "human",
      "deliverables": ["FEATURESPEC.md"]
    }
  ],

  "defaults": {
    "mode": "greenfield",
    "autonomy": "semi-autonomous"
  },

  "ui": {
    "theme": "engineering",
    "layout": "chat-focused",
    "features": {
      "skillBrowser": false,
      "deliverableViewer": true,
      "gateApprovalUI": true,
      "progressTimeline": false,
      "metricsPanel": false
    },
    "branding": {
      "title": "Quick Build",
      "subtitle": "Prototype fast"
    }
  },

  "skillUI": {
    "spec": {
      "displayName": "Quick Spec",
      "icon": "document-text",
      "outputDisplay": "markdown"
    },
    "implement": {
      "displayName": "Implementation",
      "icon": "code",
      "outputDisplay": "diff"
    },
    "loop-controller": {
      "displayName": "Finalize",
      "icon": "check-circle",
      "outputDisplay": "markdown"
    }
  },

  "metadata": {
    "author": "Orchestrator",
    "tags": ["engineering", "lightweight", "prototype"]
  }
}
```

### When to Use

- Small features (under 1 day of work)
- Prototypes and experiments
- Scripts and utilities
- When speed matters more than rigor

### When NOT to Use

- Production features (add TEST, VERIFY, REVIEW)
- Multi-component systems (add SCAFFOLD)
- Anything needing deployment (add SHIP)

---

## Pattern 4: Infrastructure Loop

Focused on project setup, environment configuration, and infrastructure provisioning.

### Characteristics

| Property | Value |
|----------|-------|
| Phases | 5 (INIT, SCAFFOLD, IMPLEMENT, VERIFY, COMPLETE) |
| Gates | 2 (architecture, verification) |
| Autonomy | supervised |
| Mode | greenfield |
| Skills | 5-7 (mix of core and infra) |

### Phase Layout

```
INIT ──────────── requirements
    [requirements-gate]
SCAFFOLD ──────── architect, scaffold
IMPLEMENT ─────── infra-database, infra-docker, infra-services
VERIFY ─────────── code-verification
    [verification-gate]
COMPLETE ──────── loop-controller
```

### When to Use

- New project bootstrapping
- Adding database, Docker, or service layers
- Environment configuration
- DevOps pipeline setup

### Key Design Decisions

1. **requirements instead of spec**: Infrastructure needs requirements, not feature specs
2. **Multiple IMPLEMENT skills**: Infrastructure often has parallel workstreams
3. **No TEST phase**: Infrastructure testing is handled within implementation
4. **No REVIEW or SHIP**: Infrastructure is verified, not reviewed or deployed as a feature

---

## Pattern 5: Security Audit Loop

Focused assessment of code and system security posture.

### Characteristics

| Property | Value |
|----------|-------|
| Phases | 5 (INIT, IMPLEMENT, VERIFY, REVIEW, COMPLETE) |
| Gates | 3 (requirements, findings, final) |
| Autonomy | supervised |
| Mode | brownfield |
| Skills | 5 |

### Phase Layout

```
INIT ──────────── requirements
    [requirements-gate]
IMPLEMENT ─────── implement
VERIFY ─────────── code-verification
REVIEW ─────────── security-audit, code-review
    [findings-gate]
COMPLETE ──────── loop-controller
    [final-gate]
```

### When to Use

- Pre-launch security review
- Compliance audits (SOC2, HIPAA)
- Post-incident security hardening
- Periodic security assessment

---

## Pattern Comparison Matrix

| Aspect | Engineering | Proposal | Lightweight | Infrastructure | Security |
|--------|------------|----------|-------------|----------------|----------|
| Phases | 9 | 4 | 3 | 5 | 5 |
| Gates | 4 | 4 | 1 | 2 | 3 |
| Skills | 9 | 4 | 3 | 5-7 | 5 |
| Autonomy | supervised | supervised | semi-auto | supervised | supervised |
| Mode | greenfield | greenfield | greenfield | greenfield | brownfield |
| Time | Hours-days | Hours | Minutes-hours | Hours | Hours |
| Output | Code + docs | Document | Code | Config + infra | Report + fixes |

## Composing Custom Loops

When none of the standard patterns fit:

1. **Identify the closest pattern** from the five above
2. **Start with that pattern's phase layout**
3. **Add phases** that the domain requires
4. **Remove phases** that add no value
5. **Swap skills** for domain-specific alternatives
6. **Adjust gates** to match the decision boundary profile
7. **Set defaults** for the domain's mode and autonomy needs
8. **Validate** using the composition testing process

### Example: Content Creation Loop (Custom)

Starting from Proposal pattern, customized:

```
INIT ──────────── requirements (swapped from context-ingestion)
    [brief-gate]
SCAFFOLD ──────── architect (content structure design)
IMPLEMENT ─────── implement (content writing)
REVIEW ─────────── code-review (adapted for content review)
    [editorial-gate]
COMPLETE ──────── loop-controller
```

Changes from proposal pattern:
- Added REVIEW phase for editorial review
- Swapped context-ingestion for requirements (clearer briefs)
- Used architect for content structure (reusable skill)
- Removed priority-matrix (not relevant for content)
- Reduced gates from 4 to 2 (brief + editorial)

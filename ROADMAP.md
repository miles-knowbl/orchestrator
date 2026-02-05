# Orchestrator Roadmap

> Active modules that ladder up to system completion. Each module advances the dream state.

---

## Overview

**System**: Orchestrator — Autonomous, coherent, local-first system that compounds leverage through skill-based ontology
**Progress**: 26/26 active modules complete (100%)
**Functions**: 293/293 complete
**Deferred**: 37 modules ([deferred-modules-in-progress.json](.claude/deferred-modules-in-progress.json))

---

## Architecture Layers

```
Layer 4  ──────────────────────────────────────────────────────────────────
         knopilot

Layer 3  ──────────────────────────────────────────────────────────────────
         proactive-messaging, slack-integration, voice

Layer 2  ──────────────────────────────────────────────────────────────────
         coherence-system, mece-opportunity-mapping, patterns-roundup, scoring

Layer 1  ──────────────────────────────────────────────────────────────────
         autonomous, loop-sequencing, ooda-clocks-visual, skill-trees

Layer 0  ──────────────────────────────────────────────────────────────────
         skill-registry, loop-composer, execution-engine, memory-service,
         learning-service, calibration-service, inbox-processor, run-archival,
         guarantee-service, deliverable-manager, analytics, dream-state-service,
         knowledge-graph-ontology, roadmapping
```

All modules complete.

---

## Layer 0 — Core Infrastructure

| Module | Description | Status | Unlocks |
|--------|-------------|--------|---------|
| **skill-registry** | Core service for skill CRUD operations, search, and improvement capture. | complete | knowledge-graph-ontology |
| **loop-composer** | Compose loops from skills, validate loop definitions, manage loop lifecycle. | complete | execution-engine |
| **execution-engine** | Execute loops with phase management, skill completion tracking, and gate enforcement. | complete | autonomous, run-archival |
| **memory-service** | Context persistence, pattern recording, decision tracking, and handoff creation. | complete | learning-service |
| **learning-service** | Skill improvement proposals, metrics tracking, proposal lifecycle management. | complete | — |
| **calibration-service** | Effort estimation calibration, accuracy tracking, calibration recommendations. | complete | — |
| **inbox-processor** | Second brain inbox for capturing content, URL fetching, skill extraction. | complete | — |
| **run-archival** | Archive completed loop runs, query historical runs, generate run summaries. | complete | analytics |
| **guarantee-service** | Register and validate skill guarantees, aggregate loop guarantees, enforce at gates. | complete | — |
| **deliverable-manager** | Store and retrieve execution deliverables, manage deliverable paths. | complete | — |
| **analytics** | Collect and aggregate metrics from runs, skills, calibration, gates, patterns. | complete | learning-service, patterns-roundup, scoring |
| **dream-state-service** | Manage dream state JSON, sync from roadmap, render markdown views. | complete | — |
| **knowledge-graph-ontology** | The skill-based knowledge graph where compound leverage accumulates. | complete | skill-trees, mece-opportunity-mapping |
| **roadmapping** | System-level visibility into module progress, dependencies, and completion status. | complete | coherence-system, dream-state-service |

---

## Layer 1 — Visualization & Autonomy

| Module | Description | Status | Depends On |
|--------|-------------|--------|------------|
| **autonomous** | Full loop execution without human gates + background continuous operation. | complete | execution-engine, proactive-messaging |
| **loop-sequencing** | Multi-move planning: which loops commonly run together, looking multiple moves ahead. | complete | — |
| **ooda-clocks-visual** | Gamelan-inspired circular visualization showing when patterns, hooks, and skills fire. | complete | — |
| **skill-trees** | DAG-like domain-specific sequences of skills with progression tracking. | complete | knowledge-graph-ontology |

---

## Layer 2 — Quality & Intelligence

| Module | Description | Status | Depends On |
|--------|-------------|--------|------------|
| **coherence-system** | Alignment of all orchestrator components. Ensures modules don't drift or conflict. | complete | roadmapping, knowledge-graph-ontology |
| **mece-opportunity-mapping** | Mutually Exclusive, Collectively Exhaustive opportunity analysis. | complete | knowledge-graph-ontology |
| **patterns-roundup** | Round up existing patterns + automatic pattern detection from observed behaviors. | complete | analytics |
| **scoring** | System-level evaluation. Quantifies how much each module contributes to dream state. | complete | analytics |

---

## Layer 3 — Communication

| Module | Description | Status | Depends On |
|--------|-------------|--------|------------|
| **proactive-messaging** | System reaches out across channels: terminal, Slack, notifications. | complete | — |
| **slack-integration** | Bidirectional Slack: receive commands and capture to inbox, plus send proactive messages. | complete | proactive-messaging |
| **voice** | Text-to-speech output for status updates. MacOS TTS integration with quiet hours. | complete | proactive-messaging |

---

## Layer 4 — Domain Contexts

| Module | Description | Status | Depends On |
|--------|-------------|--------|------------|
| **knopilot** | Sales CRM runtime context. Deal management, stakeholder tracking, NBA engine, pipeline intelligence. | complete | — |

---

## Updates to Existing Modules

| Target | Update | Priority | Status |
|--------|--------|----------|--------|
| **distribution-loop** | Guarantee that all commits are rounded up and pushed. No orphaned local commits. | High | complete |
| **InboxProcessor** | Finish the second brain inbox implementation. Complete the skill harvesting pipeline. | Medium | complete |

---

## Brainstorm (Not Yet Scoped)

| Idea | Notes |
|------|-------|
| **audit loops for missing skills** | Systematic audit to find gaps in skill coverage |

---

## Module Count Summary

| Layer | Complete | Total | Modules |
|-------|----------|-------|---------|
| 0 | 14 | 14 | skill-registry, loop-composer, execution-engine, memory-service, learning-service, calibration-service, inbox-processor, run-archival, guarantee-service, deliverable-manager, analytics, dream-state-service, knowledge-graph-ontology, roadmapping |
| 1 | 4 | 4 | autonomous, loop-sequencing, ooda-clocks-visual, skill-trees |
| 2 | 4 | 4 | coherence-system, mece-opportunity-mapping, patterns-roundup, scoring |
| 3 | 3 | 3 | proactive-messaging, slack-integration, voice |
| 4 | 1 | 1 | knopilot |
| **Total** | **26** | **26** | **100%** |

---

*Generated from .claude/roadmap.json on 2026-02-05*

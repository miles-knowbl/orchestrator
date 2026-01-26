# Pattern Catalog Reference

Catalog of known pattern archetypes used during pattern recognition (Step 4 of content analysis).
Match extracted patterns against these archetypes to leverage existing vocabulary and avoid reinvention.

## Pattern Type Index

| Type | Focus | Count in Catalog |
|------|-------|-----------------|
| Behavioral | How components interact at runtime | 5 archetypes |
| Structural | How components are organized | 4 archetypes |
| Architectural | System-level design decisions | 4 archetypes |
| Workflow | How processes flow through stages | 4 archetypes |
| Anti-Pattern | Recurring approaches that produce poor outcomes | 4 archetypes |

## Behavioral Patterns

### BEH-01: Producer-Consumer Decoupling
**Recognition criteria:** One component generates work; another processes it; a buffer sits between them.
**Variants:** Queue-based, event-driven, stream-based.
**Signal phrases:** "decouple", "buffer", "async processing", "work queue", "event bus"
**Generalizes to:** Any situation where production rate differs from consumption rate.

### BEH-02: Circuit Breaker
**Recognition criteria:** A wrapper that monitors failures and short-circuits calls when a threshold is reached.
**Variants:** Count-based, time-based, hybrid.
**Signal phrases:** "fail fast", "fallback", "degraded mode", "threshold", "half-open state"
**Generalizes to:** Any unreliable dependency where repeated failures are costly.

### BEH-03: Retry with Backoff
**Recognition criteria:** Failed operations are retried with increasing delay between attempts.
**Variants:** Linear backoff, exponential backoff, jittered backoff.
**Signal phrases:** "retry", "backoff", "exponential delay", "jitter", "max retries"
**Generalizes to:** Transient failures in networks, services, or resources.

### BEH-04: Observer / Pub-Sub
**Recognition criteria:** Components subscribe to events and react when events are published.
**Variants:** In-process observers, message brokers, webhook callbacks.
**Signal phrases:** "subscribe", "notify", "event-driven", "listener", "on change"
**Generalizes to:** Loose coupling between producers and consumers of information.

### BEH-05: Bulkhead Isolation
**Recognition criteria:** Resources are partitioned so failure in one partition does not cascade.
**Variants:** Thread pool isolation, process isolation, service isolation.
**Signal phrases:** "isolate", "partition", "blast radius", "contain failure", "independent pools"
**Generalizes to:** Any system where shared resources create single points of failure.

## Structural Patterns

### STR-01: Hub-and-Spoke
**Recognition criteria:** A central coordinator connects to multiple peripheral components.
**Signal phrases:** "centralized", "gateway", "router", "orchestrator", "fan-out"
**Generalizes to:** Control flow concentration, API gateways, message routers.

### STR-02: Layered Architecture
**Recognition criteria:** Components organized into horizontal layers with strict dependency direction.
**Signal phrases:** "layers", "presentation/business/data", "separation of concerns", "upper layers depend on lower"
**Generalizes to:** Any system needing clean separation between abstraction levels.

### STR-03: Pipeline / Chain
**Recognition criteria:** Data flows through sequential processing stages, each transforming the input.
**Signal phrases:** "pipeline", "stage", "transform", "middleware", "chain of responsibility"
**Generalizes to:** Data processing, request handling, build systems.

### STR-04: Plugin / Extension
**Recognition criteria:** A core system exposes extension points; behavior is added without modifying the core.
**Signal phrases:** "plugin", "extension", "hook", "middleware", "add-on", "registry"
**Generalizes to:** Systems requiring customization without core modification.

## Architectural Patterns

### ARC-01: Strangler Fig Migration
**Recognition criteria:** New system incrementally replaces old system by intercepting requests.
**Signal phrases:** "migrate incrementally", "proxy to legacy", "strangle", "route new traffic"
**Generalizes to:** Any legacy-to-modern migration where big-bang replacement is too risky.

### ARC-02: Event Sourcing
**Recognition criteria:** State changes are stored as immutable events rather than current-state snapshots.
**Signal phrases:** "event log", "append-only", "replay events", "event store", "rebuild state"
**Generalizes to:** Systems requiring audit trails, temporal queries, or state reconstruction.

### ARC-03: CQRS (Command-Query Separation)
**Recognition criteria:** Read and write operations use separate models or paths.
**Signal phrases:** "read model", "write model", "command side", "query side", "projection"
**Generalizes to:** Systems where read and write workloads have different performance or scaling needs.

### ARC-04: Sidecar / Ambassador
**Recognition criteria:** A helper process runs alongside the main process, handling cross-cutting concerns.
**Signal phrases:** "sidecar", "ambassador", "proxy", "co-located process", "service mesh"
**Generalizes to:** Cross-cutting concerns (logging, auth, networking) decoupled from application logic.

## Workflow Patterns

### WKF-01: Gate-Based Progression
**Recognition criteria:** Work advances through stages; each stage has explicit pass/fail criteria.
**Signal phrases:** "gate", "checkpoint", "must pass before", "approval required", "quality gate"
**Generalizes to:** CI/CD, review workflows, phased project delivery.

### WKF-02: Saga / Compensating Transaction
**Recognition criteria:** A multi-step process where failure at any step triggers compensating actions for prior steps.
**Signal phrases:** "compensate", "rollback", "saga", "undo", "compensation logic"
**Generalizes to:** Distributed transactions, multi-service workflows, booking systems.

### WKF-03: Fork-Join Parallelism
**Recognition criteria:** Work splits into independent branches, then merges results.
**Signal phrases:** "parallelize", "fan-out/fan-in", "fork", "join", "merge results"
**Generalizes to:** Any workflow where independent subtasks can execute concurrently.

### WKF-04: Escalation Chain
**Recognition criteria:** Issues flow upward through levels of authority or capability.
**Signal phrases:** "escalate", "tier 1/2/3", "if unresolved, then", "fallback handler"
**Generalizes to:** Support workflows, error handling hierarchies, decision authority chains.

## Anti-Patterns

| ID | Name | Recognition | Why It Fails | Misidentified As |
|----|------|-------------|-------------|-----------------|
| ANTI-01 | God Object | One component handles too many responsibilities | Coupling; changes ripple everywhere | Hub-and-spoke (which centralizes routing, not logic) |
| ANTI-02 | Premature Optimization | Performance tuning before profiling | Optimizes wrong thing; adds complexity | Optimization pattern (timing matters) |
| ANTI-03 | Distributed Monolith | Independent deployment but tight coupling | Costs of distribution without benefits | Microservices (which requires actual independence) |
| ANTI-04 | Golden Hammer | One tool applied to every problem | Forces inappropriate solutions | Standard practice (which is context-appropriate) |

## Template for New Pattern Entries

When content analysis discovers a pattern not in this catalog, document it using this template:

```markdown
### [TYPE]-[NN]: [Descriptive Name]
**Recognition criteria:** [How to identify this pattern in content]
**Variants:** [Known variations, if any]
**Signal phrases:** [Phrases that indicate this pattern]
**Generalizes to:** [Broader applicability beyond the source context]
**Why it works / Why it fails:** [For patterns / anti-patterns respectively]
**Often misidentified as:** [Common misclassifications]
```

## Matching Rules

1. **Match by recognition criteria first.** Signal phrases are secondary; the structural match matters more.
2. **One primary archetype per extraction.** If a pattern matches two archetypes, choose the more specific one and note the secondary match.
3. **Novel patterns are welcome.** If no archetype matches, create a new entry. The catalog grows through use.
4. **Anti-patterns require consequence evidence.** Do not classify something as anti-pattern without documented negative outcomes or clear reasoning for why it fails.
5. **Variants inherit the parent archetype.** A jittered backoff is still BEH-03; note the variant rather than creating a new entry.

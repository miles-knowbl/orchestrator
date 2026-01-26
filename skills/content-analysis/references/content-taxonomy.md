# Content Taxonomy Reference

Classification hierarchy for all content types encountered during content analysis.
Use this reference to assign consistent, precise taxonomy labels to every extracted element.

## Primary Content Types

### Tutorial
**Definition:** Step-by-step instructional content that teaches a skill through guided practice.
**Distinguishing trait:** Combines explanation with progressive exercises; the reader builds something.
**Signal phrases:** "In this tutorial...", "Let's build...", "Follow along...", "By the end you will..."
**Example:** "In this tutorial, we will build a REST API using Express. First, initialize the project..."

### Reference
**Definition:** Factual lookup content --- API signatures, configuration options, data tables, specifications.
**Distinguishing trait:** Optimized for scanning, not sequential reading. Value is in precision, not narrative.
**Signal phrases:** "Parameters:", "Returns:", "Default value:", "Supported values:"
**Example:** A table of CLI flags with descriptions, types, and default values.

### Pattern
**Definition:** A recurring solution structure that transcends its immediate context.
**Distinguishing trait:** Describes the shape of a solution, not the specific implementation.
**Signal phrases:** "A common approach...", "This pattern...", "Recurring structure...", "Typically solved by..."
**Example:** "The circuit breaker pattern wraps calls to external services, failing fast when the service is down."

### Procedure
**Definition:** A concrete sequence of actions that produces a specific outcome.
**Distinguishing trait:** Imperative steps with a defined end state. Unlike tutorials, no teaching narrative.
**Signal phrases:** "Step 1:", "First... then... finally...", "To achieve X, do Y", "Run the following..."
**Example:** "To deploy: 1) Run tests. 2) Build artifacts. 3) Push to registry. 4) Apply manifests."

### Concept
**Definition:** An idea, model, or mental framework that helps the reader understand a domain.
**Distinguishing trait:** Explanatory, not actionable. Builds mental models rather than producing outputs.
**Signal phrases:** "X is...", "The idea behind...", "Fundamentally...", "This means that..."
**Example:** "Eventual consistency means that all replicas will converge to the same state, given enough time."

### Example
**Definition:** A concrete instance that illustrates an abstract concept, pattern, or principle.
**Distinguishing trait:** Specific and situated. References real or realistic scenarios.
**Signal phrases:** "For instance...", "Consider...", "Suppose...", "A real-world case..."
**Example:** "Consider a shopping cart service: when the user adds an item, the event is published to a topic."

### Anti-Pattern
**Definition:** A recurring approach that produces poor outcomes despite appearing reasonable.
**Distinguishing trait:** Describes what NOT to do, often with explanation of why it fails.
**Signal phrases:** "Avoid...", "Do not...", "A common mistake...", "This leads to...", "Pitfall:"
**Example:** "Storing session state in local memory seems simple but breaks when you scale horizontally."

## Secondary Content Types

| Type | Definition | When to Use |
|------|-----------|-------------|
| **Principle** | A guiding rule or heuristic for decision-making | "Always...", "Never...", "Prefer X over Y" |
| **Opinion** | A subjective assessment with explicit or implicit bias | "I believe...", "The best...", "We prefer..." |
| **Data** | Quantitative information --- metrics, benchmarks, statistics | Numbers, percentages, measurements |
| **Narrative** | Story-form content providing context or motivation | Case studies, postmortems, historical accounts |

## Decision Tree for Ambiguous Cases

### Does it teach through guided steps?
- YES with exercises/building something --> **Tutorial**
- YES with bare imperative steps only --> **Procedure**

### Does it describe how something works without telling you to do anything?
- YES and it is abstract/generalizable --> **Concept**
- YES and it is a specific instance --> **Example**

### Does it describe a recurring solution shape?
- YES and it is recommended --> **Pattern**
- YES and it is cautioned against --> **Anti-Pattern**

### Is it optimized for lookup rather than reading?
- YES --> **Reference**

### Common Misclassifications

| Content | Often Misclassified As | Correct Type | Why |
|---------|----------------------|--------------|-----|
| "Always validate input before processing" | Procedure | **Principle** | No concrete steps; it is a heuristic |
| A code snippet showing usage | Reference | **Example** | It illustrates; it does not document an API |
| "Here is how we solved the outage" | Procedure | **Narrative** | Retrospective context, not repeatable steps |
| "Avoid using global state" | Pattern | **Anti-Pattern** | It describes what NOT to do |
| Numbered config instructions | Tutorial | **Procedure** | No teaching narrative, just steps |
| "Event sourcing captures changes as events" | Pattern | **Concept** | Explains the idea, not the solution shape |

## Taxonomy Dimensions Beyond Type

Every classified element also receives:

| Dimension | Values | Decision Rule |
|-----------|--------|---------------|
| **Domain** | engineering, design, business, operations, meta, cross-domain | What field produced this knowledge? |
| **Granularity** | atomic, composite, framework | Atomic = single idea. Composite = related cluster. Framework = complete system. |
| **Actionability** | actionable, informational, contextual | Can someone act on this immediately without further research? |
| **Durability** | evergreen, seasonal, ephemeral | Evergreen survives 3+ years. Seasonal is version-bound. Ephemeral is event-bound. |

## Compound Content Handling

When a single segment contains multiple types (e.g., a concept explained with an example):

1. **Classify by dominant type** --- the type that carries the primary value
2. **Tag secondary types** --- note the supporting types as metadata
3. **Split if both types carry independent value** --- create two extractions linked by "supports" relationship

Example: "Eventual consistency (concept) means replicas converge over time. Consider a DNS update (example) --- propagation takes hours but eventually all resolvers agree."
- Primary extraction: Concept (eventual consistency)
- Secondary extraction: Example (DNS propagation), linked as "instantiates" the concept

## Vocabulary Governance

Before creating a new taxonomy term:
1. Search existing extractions for synonymous terms
2. Check this reference for the closest existing type
3. If genuinely novel, document the new term with definition, signal phrases, and at least two examples
4. Add it to this reference in the appropriate section

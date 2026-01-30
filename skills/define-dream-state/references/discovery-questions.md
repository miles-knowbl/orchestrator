# Discovery Questions

Comprehensive question sets for defining dream states at each tier.

---

## Organization Tier

### Purpose & Vision
1. What is the overarching purpose of this organization?
2. What would the world look like if this organization fully succeeded?
3. What unique value does this organization provide?
4. In one sentence, what is this organization about?

### Structure & Domains
5. What natural groupings (domains) emerge from your work?
6. Are there domains that don't exist yet but should?
7. How do domains relate to each other? (dependencies, data flow, shared concerns)
8. Are there cross-cutting concerns that span all domains?

### Constraints & Boundaries
9. What are organization-wide technology constraints?
10. What are budget or resource constraints?
11. What compliance or regulatory requirements exist?
12. What is explicitly out of scope for this organization?

### Success & Completion
13. How will you know when this organization is "done"?
14. What metrics matter at the organization level?
15. What would make this a home run vs. just acceptable?
16. What's the minimum viable organization (if you had to ship today)?

### Patterns & Learning
17. What patterns should apply across all domains and systems?
18. What lessons from past work should be encoded here?
19. What mistakes should future work avoid?

---

## Domain Tier

### Purpose & Capability
1. What capability does this domain provide when complete?
2. How does this domain serve the organization's vision?
3. What would be missing if this domain didn't exist?
4. Who are the users/consumers of this domain's capability?

### Systems & Composition
5. What systems compose this domain?
6. How do systems in this domain integrate with each other?
7. Are there shared services or libraries within this domain?
8. What's the dependency graph between systems?

### Boundaries & Interfaces
9. What are this domain's interfaces with other domains?
10. What data flows in and out of this domain?
11. What events does this domain produce/consume?
12. What should NOT be in this domain?

### Constraints
13. What domain-specific technology choices apply?
14. What quality standards apply within this domain?
15. What operational requirements exist (uptime, latency, etc.)?

### Completion
16. When is this domain "done"?
17. What percentage of systems need to be complete for the domain to be usable?
18. What's the MVP for this domain?

---

## System Tier

### Problem & Solution
1. What problem does this system solve?
2. Who experiences this problem? How painful is it?
3. What happens if this system doesn't exist?
4. What existing solutions does this replace or improve upon?

### Users & Usage
5. Who uses this system?
6. How do they interact with it? (CLI, API, UI, background)
7. What are the primary use cases?
8. What are the edge cases?

### Architecture & Modules
9. What are the major modules/concerns within this system?
10. How do modules communicate?
11. What are the key abstractions?
12. What's the data model?

### Interfaces & Integration
13. What are the system's external APIs?
14. What systems does this depend on?
15. What systems depend on this?
16. How is the system deployed?

### Quality & Constraints
17. What are the performance requirements?
18. What are the security requirements?
19. What are the reliability requirements?
20. What technology constraints exist?

### Completion
21. When is this system "done"?
22. What tests must pass?
23. What documentation must exist?
24. What operational criteria must be met?

---

## Module Tier

### Responsibility
1. What is this module's single responsibility?
2. What concern does it encapsulate?
3. Why is this a separate module (vs. part of another)?

### Functions & Capabilities
4. What functions must this module provide?
5. What are the inputs to each function?
6. What are the outputs from each function?
7. What are the error cases?

### Dependencies
8. What other modules does this depend on?
9. What modules depend on this?
10. Are there external dependencies?

### Interface
11. What's the public API of this module?
12. What should be hidden/private?
13. How do consumers interact with this module?

### Quality
14. What tests must this module have?
15. What's the expected performance profile?
16. Are there specific security considerations?

### Completion
17. When is this module "done"?
18. What's the verification criteria for each function?
19. What integration tests validate this module?

---

## Cross-Tier Questions

These questions apply regardless of tier:

### Dependencies
- What must exist before this can be built?
- What is blocked until this is complete?
- Are there circular dependencies to break?

### Risk
- What could go wrong?
- What's the worst-case scenario?
- What's the mitigation plan?

### Iteration
- What's the MVP (minimum to be useful)?
- What can be deferred to later versions?
- How will this evolve over time?

### Learning
- What assumptions are we making?
- How will we validate those assumptions?
- What experiments should we run?

---

## Question Prioritization

Not all questions need answers upfront. Prioritize by:

1. **Must answer now** — Blocking questions that affect structure
2. **Should answer soon** — Important but can refine as you learn
3. **Can defer** — Nice to have, will emerge through work

**Tier-specific priorities:**

| Tier | Must Answer Now |
|------|-----------------|
| Organization | Vision, domains, org-wide constraints |
| Domain | Purpose, systems, domain boundaries |
| System | Problem, modules, key interfaces |
| Module | Responsibility, functions, dependencies |

# Scoring Algorithm

Detailed algorithm for calculating module leverage scores.

## Input Data

### From Dream State
- Module list with status
- Completion algebra (dependencies)
- Progress percentage

### From Roadmap
- Dependency graph
- Module descriptions
- Layer information

### From History
- Previous attempt outcomes
- Execution durations
- Success/failure patterns

### From Calibration
- Personal multipliers
- Loop-specific adjustments

## Component Algorithms

### Dream State Alignment (DSA)

**Range:** 0-10

```typescript
function calculateDSA(module: Module, dreamState: DreamState): number {
  let score = 0;

  // Is module explicitly in dream state checklist?
  if (dreamState.modules.includes(module.name)) {
    score += 5;
  }

  // Does module have specific checklist items?
  if (module.checklistItems?.length > 0) {
    score += 3;
  }

  // Does module description align with vision keywords?
  const visionMatch = countKeywordMatches(
    module.description,
    dreamState.vision
  );
  score += Math.min(visionMatch, 2);

  return Math.min(score, 10);
}
```

### Downstream Impact

**Range:** 0-10

```typescript
function calculateDownstream(module: Module, roadmap: Roadmap): number {
  // Count modules that depend on this one
  const directDependents = roadmap.modules.filter(m =>
    m.blockedBy?.includes(module.name)
  ).length;

  // Count transitive dependents (modules that would be unblocked)
  const transitiveDependents = countTransitiveDependents(module, roadmap);

  // Score: 2 points per direct, 1 per transitive
  const score = (directDependents * 2) + (transitiveDependents * 1);

  return Math.min(score, 10);
}
```

### Likelihood

**Range:** 0-10

```typescript
function calculateLikelihood(
  module: Module,
  history: ExecutionHistory,
  patterns: Pattern[]
): number {
  let score = 5; // Base neutral

  // Prior success on this module
  const priorAttempts = history.filter(e =>
    e.scope?.includes(module.name)
  );
  if (priorAttempts.some(a => a.outcome === 'success')) {
    score += 2;
  }
  if (priorAttempts.some(a => a.outcome === 'failed')) {
    score -= 1;
  }

  // Relevant patterns exist
  const relevantPatterns = patterns.filter(p =>
    p.categories.includes(module.category)
  );
  if (relevantPatterns.length > 2) {
    score += 2;
  }

  // Clear requirements
  if (module.description?.length > 100) {
    score += 1;
  }

  return Math.max(0, Math.min(score, 10));
}
```

### Time Estimate

**Range:** 0-10 (inverse: higher = faster)

```typescript
function estimateTime(module: Module, calibration: Calibration): number {
  const baseHours = MODULE_BASE_HOURS[module.category] || 3;
  const calibratedHours = baseHours * calibration.multiplier;

  // Score inversely: 1 hour = 10, 10 hours = 1
  const score = 11 - Math.min(calibratedHours, 10);

  return Math.max(1, score);
}
```

### Effort Estimate

**Range:** 0-10 (inverse: higher = easier)

```typescript
function estimateEffort(module: Module, patterns: Pattern[]): number {
  let score = 5; // Base neutral

  // Similar work done before
  if (patterns.some(p => p.type === 'implementation' &&
      p.scope === module.category)) {
    score += 2;
  }

  // Has existing scaffolding
  if (module.status === 'in-progress') {
    score += 2;
  }

  // Small scope
  if (module.functions?.length < 5) {
    score += 1;
  }

  return Math.min(score, 10);
}
```

## Final Score Calculation

```typescript
function calculateLeverage(components: ScoreComponents): number {
  const numerator = (
    (components.dsa * 0.40) +
    (components.downstream * 0.25) +
    (components.likelihood * 0.15)
  );

  const denominator = (
    (components.time * 0.10) +
    (components.effort * 0.10)
  );

  // Avoid division by zero
  if (denominator === 0) return numerator;

  return numerator / denominator;
}
```

## Score Interpretation

| Score Range | Interpretation |
|-------------|----------------|
| 8.0+ | High leverage, prioritize |
| 6.0-7.9 | Good candidate |
| 4.0-5.9 | Moderate priority |
| 2.0-3.9 | Low priority |
| < 2.0 | Consider deferring |

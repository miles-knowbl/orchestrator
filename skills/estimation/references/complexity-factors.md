# Complexity Factors

Catalog of factors that increase effort with adjustment guidelines.

## Factor Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLEXITY FACTOR CATEGORIES                              │
│                                                                             │
│  TECHNICAL           INTEGRATION         REQUIREMENTS       ORGANIZATIONAL  │
│  ─────────           ───────────         ────────────       ──────────────  │
│  New technology      External APIs       Unclear scope      Team experience │
│  Performance needs   Legacy systems      Compliance         Communication   │
│  Security needs      Data migration      UX complexity      Dependencies    │
│  Scale requirements  Multi-system        Localization       Stakeholders    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technical Factors

### New Technology

| Situation | Multiplier | Notes |
|-----------|------------|-------|
| Team has used extensively | 1.0x | No adjustment |
| Team has some experience | 1.2-1.3x | Minor learning curve |
| Team has tried once | 1.5x | Significant learning |
| Completely new to team | 1.8-2.0x | Major learning + mistakes |
| Bleeding edge / beta | 2.0-3.0x | Bugs, poor docs, changes |

**Example:**
```
Base estimate: 40 hours
Factor: New framework (team tried once) → 1.5x
Adjusted: 60 hours
```

### Performance Requirements

| Requirement | Multiplier | Typical Work Added |
|-------------|------------|-------------------|
| Standard (no specific targets) | 1.0x | None |
| Moderate (<500ms p95) | 1.2x | Basic optimization, caching |
| Strict (<100ms p95) | 1.4x | Serious optimization, load testing |
| Extreme (<50ms, high throughput) | 1.6-2.0x | Architecture changes, extensive testing |

### Security Requirements

| Requirement | Multiplier | Typical Work Added |
|-------------|------------|-------------------|
| Standard (basic auth) | 1.0x | None |
| Handles PII | 1.3x | Encryption, audit logs, compliance |
| Financial data | 1.4x | Additional controls, testing |
| Healthcare (HIPAA) | 1.5-1.8x | Compliance documentation, audits |
| Payment processing (PCI) | 1.5-2.0x | Strict controls, certification |

### Scale Requirements

| Scale | Multiplier | Notes |
|-------|------------|-------|
| Small (<1K users) | 1.0x | Single instance fine |
| Medium (1K-100K users) | 1.1x | Basic scaling patterns |
| Large (100K-1M users) | 1.3x | Caching, load balancing |
| Very Large (>1M users) | 1.5-2.0x | Distributed systems, sharding |

## Integration Factors

### External API Integration

| Situation | Multiplier per Integration |
|-----------|---------------------------|
| Well-documented, stable API | +15-20% |
| Poorly documented API | +30-40% |
| Unreliable/flaky API | +40-50% |
| Beta/unstable API | +50-80% |

**Note:** Multiple integrations may compound. 3 integrations at 1.2x each ≈ 1.7x total.

### Legacy System Integration

| Legacy Situation | Multiplier |
|------------------|------------|
| Modern, well-maintained | 1.1x |
| Older but documented | 1.3x |
| Poorly documented | 1.5x |
| "Don't touch that code" | 1.8-2.5x |

### Data Migration

| Migration Type | Multiplier |
|----------------|------------|
| Simple copy | 1.1x |
| With transformation | 1.3x |
| With validation/cleanup | 1.5x |
| Complex mapping + rollback plan | 1.8-2.0x |

## Requirements Factors

### Scope Clarity

| Clarity Level | Multiplier | Indicator |
|---------------|------------|-----------|
| Crystal clear | 1.0x | Detailed spec with examples |
| Mostly clear | 1.2x | Spec exists, some questions |
| Somewhat unclear | 1.4x | High-level only, many TBDs |
| Vague | 1.6-2.0x | "Make it work like X" |

### Regulatory/Compliance

| Compliance Type | Multiplier |
|-----------------|------------|
| None | 1.0x |
| Basic audit logging | 1.1x |
| SOC 2 / ISO 27001 | 1.3x |
| HIPAA / PCI | 1.5x |
| Government / Defense | 1.8-2.5x |

### UX Complexity

| UI Type | Multiplier |
|---------|------------|
| No UI (API only) | 1.0x |
| Simple forms | 1.1x |
| Standard CRUD | 1.2x |
| Complex interactions | 1.4x |
| Highly polished / animations | 1.5x |
| Accessibility (WCAG AA+) | +20% |

### Localization

| Localization | Multiplier |
|--------------|------------|
| Single language | 1.0x |
| 2-3 languages | 1.15x |
| Many languages | 1.3x |
| RTL support | 1.4x |

## Organizational Factors

### Team Experience

| Team Situation | Multiplier |
|----------------|------------|
| Expert team, worked together before | 0.9x |
| Experienced team | 1.0x |
| Mixed experience | 1.1x |
| Junior-heavy team | 1.3-1.5x |
| New team members | +10% per new person |

### Communication Overhead

| Situation | Multiplier |
|-----------|------------|
| Solo developer | 0.95x |
| Small co-located team | 1.0x |
| Distributed team (same timezone) | 1.1x |
| Distributed team (different timezones) | 1.2x |
| Multiple stakeholder groups | 1.2-1.4x |

### External Dependencies

| Dependency Type | Multiplier |
|-----------------|------------|
| Self-contained | 1.0x |
| Depends on 1 other team | 1.15x |
| Depends on multiple teams | 1.3x |
| Depends on external vendor | 1.3-1.5x |
| Blocked by external (timeline unknown) | Add buffer |

## Applying Multiple Factors

### Additive vs Multiplicative

For **similar category** factors: Add the excess
```
Security (1.3x) + Compliance (1.3x) from same domain
= 1.0 + 0.3 + 0.3 = 1.6x (not 1.3 × 1.3 = 1.69x)
```

For **different category** factors: Multiply
```
New tech (1.5x) × Integration (1.3x) × Unclear scope (1.4x)
= 1.5 × 1.3 × 1.4 = 2.73x
```

### Maximum Reasonable Multiplier

If combined factors exceed **3.0x**, consider:
- Is this too risky to estimate?
- Should we do a spike/prototype first?
- Should we break it down differently?

### Example: Complex Feature

```markdown
## Factor Analysis: Healthcare Patient Portal

### Base Estimate: 60 hours (from bottom-up)

### Technical Factors
- New framework (1.3x): React Native, some team experience
- Performance (1.2x): <200ms requirement

### Integration Factors  
- 2 external APIs (1.3x): EHR and billing systems
- Legacy system (1.3x): Connection to existing patient database

### Requirements Factors
- HIPAA compliance (1.5x): Healthcare data
- Accessibility (1.2x): WCAG AA required

### Organizational Factors
- Distributed team (1.1x): 2 timezones

### Calculation

Technical: 1.3 × 1.2 = 1.56
Integration: 1.3 × 1.3 = 1.69
Requirements: 1.5 × 1.2 = 1.8
Organizational: 1.1

Combined: sqrt(1.56 × 1.69 × 1.8 × 1.1) = 2.2x
(Using geometric mean to avoid over-inflation)

### Final Estimate

Base: 60 hours
Adjusted: 60 × 2.2 = **132 hours**
Range: 110-160 hours

### Key Risks
1. HIPAA compliance could require additional review cycles
2. Legacy system integration is the biggest unknown
3. Two external APIs with unknown reliability
```

## Quick Reference Card

| Factor | Low | Medium | High |
|--------|-----|--------|------|
| New Technology | 1.2x | 1.5x | 2.0x |
| Performance | 1.2x | 1.4x | 1.8x |
| Security | 1.2x | 1.4x | 1.6x |
| Integration (per) | 1.15x | 1.3x | 1.5x |
| Legacy Code | 1.2x | 1.4x | 2.0x |
| Unclear Scope | 1.2x | 1.4x | 1.8x |
| Compliance | 1.2x | 1.4x | 1.8x |
| UI Complexity | 1.2x | 1.4x | 1.6x |
| Team Experience | 1.1x | 1.2x | 1.4x |

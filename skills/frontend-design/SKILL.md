---
name: frontend-design
description: "Design frontend components, layouts, and interactions before implementation. Creates component specifications, defines design tokens, and documents interaction patterns for consistent UI/UX across the application."
phase: SCAFFOLD
category: engineering
version: "1.0.0"
depends_on: []
tags: [design, frontend, ui, ux, components]
---

# Frontend Design

Design before you build.

## When to Use

- **Frontend systems** — Web apps, mobile apps, any user-facing interface
- **Component libraries** — Reusable UI component systems
- **Design system creation** — Establishing patterns and tokens
- **Complex interactions** — Wizards, drag-drop, real-time updates
- **Multi-page applications** — Consistent navigation and layout

## Condition

This skill is **conditionally required** when:
- `systemType` is `"frontend"` or `"fullstack"`
- Capabilities include UI-related keywords (upload, dashboard, editor, preview, wizard)
- FEATURESPEC contains UI/UX requirements section

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `component-patterns.md` | Common component structures |
| `design-tokens.md` | Color, spacing, typography systems |
| `interaction-patterns.md` | Standard UI interactions |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `accessibility-checklist.md` | WCAG compliance |
| `responsive-patterns.md` | Multi-device support |

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| `DESIGN.md` | System root | Always (when skill applies) |

## Core Concept

Frontend design answers: **"What will users see and how will they interact?"**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND DESIGN                                      │
│                                                                              │
│  INPUT                              OUTPUT                                   │
│  ─────                              ──────                                   │
│  FEATURESPEC.md ─────────────────▶ Component hierarchy                      │
│  ARCHITECTURE.md ────────────────▶ Layout specifications                    │
│  Brand/taste schema ─────────────▶ Design tokens                            │
│                                    Interaction patterns                      │
│                                    State management approach                 │
│                                    Accessibility requirements                │
│                                                                              │
│  Design decisions made HERE prevent rework during implementation             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## The Design Process

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND DESIGN PROCESS                                 │
│                                                                              │
│  1. ANALYZE REQUIREMENTS                                                     │
│     └─→ Read FEATURESPEC.md capabilities                                     │
│     └─→ Identify all user-facing features                                    │
│     └─→ Note interaction requirements (drag-drop, inline edit, etc.)         │
│     └─→ List accessibility requirements                                      │
│                                                                              │
│  2. DEFINE COMPONENT HIERARCHY                                               │
│     └─→ Map pages/routes to components                                       │
│     └─→ Identify shared components                                           │
│     └─→ Define component props and state                                     │
│     └─→ Document component relationships                                     │
│                                                                              │
│  3. ESTABLISH DESIGN TOKENS                                                  │
│     └─→ Colors (primary, secondary, semantic)                                │
│     └─→ Typography (headings, body, mono)                                    │
│     └─→ Spacing scale (4px base recommended)                                 │
│     └─→ Shadows, borders, radii                                              │
│                                                                              │
│  4. SPECIFY LAYOUTS                                                          │
│     └─→ Page layouts (shell, sidebar, full-width)                            │
│     └─→ Grid systems                                                         │
│     └─→ Responsive breakpoints                                               │
│     └─→ Navigation patterns                                                  │
│                                                                              │
│  5. DOCUMENT INTERACTIONS                                                    │
│     └─→ User flows (happy path + errors)                                     │
│     └─→ Loading states                                                       │
│     └─→ Error states                                                         │
│     └─→ Empty states                                                         │
│     └─→ Transitions and animations                                           │
│                                                                              │
│  6. ACCESSIBILITY AUDIT                                                      │
│     └─→ Keyboard navigation plan                                             │
│     └─→ Screen reader considerations                                         │
│     └─→ Color contrast verification                                          │
│     └─→ Focus management                                                     │
│                                                                              │
│  7. CREATE DESIGN.md                                                         │
│     └─→ Compile all specifications                                           │
│     └─→ Include ASCII diagrams for layouts                                   │
│     └─→ Reference design tokens                                              │
│     └─→ Document key decisions                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy Pattern

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                                     │
│                                                                              │
│  App                                                                         │
│  ├── Layout                                                                  │
│  │   ├── Header                                                              │
│  │   │   ├── Logo                                                            │
│  │   │   ├── Navigation                                                      │
│  │   │   └── UserMenu                                                        │
│  │   ├── Sidebar (optional)                                                  │
│  │   │   └── NavLinks                                                        │
│  │   ├── Main (slot)                                                         │
│  │   └── Footer                                                              │
│  │                                                                           │
│  ├── Pages                                                                   │
│  │   ├── Dashboard                                                           │
│  │   │   ├── StatsCards                                                      │
│  │   │   └── RecentItems                                                     │
│  │   ├── List                                                                │
│  │   │   ├── Filters                                                         │
│  │   │   ├── ItemCard[]                                                      │
│  │   │   └── Pagination                                                      │
│  │   └── Detail                                                              │
│  │       ├── DetailHeader                                                    │
│  │       ├── DetailContent                                                   │
│  │       └── DetailActions                                                   │
│  │                                                                           │
│  └── Shared                                                                  │
│      ├── Button                                                              │
│      ├── Input                                                               │
│      ├── Card                                                                │
│      ├── Modal                                                               │
│      ├── Toast                                                               │
│      └── Loading                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Design Tokens Structure

```typescript
// Recommended token structure
const tokens = {
  colors: {
    primary: { 50: '#...', 500: '#...', 900: '#...' },
    secondary: { ... },
    neutral: { ... },
    semantic: {
      success: '#...',
      warning: '#...',
      error: '#...',
      info: '#...',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    // ...
  },
  typography: {
    fonts: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      // ...
    },
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.1)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },
};
```

## Interaction Patterns

### Loading States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LOADING STATES                                                              │
│                                                                              │
│  Initial Load        Skeleton placeholders                                   │
│  ┌─────────────┐    ┌─────────────┐                                          │
│  │ ░░░░░░░░░░░ │    │ ████████    │                                          │
│  │ ░░░░░░░░░░░ │    │ ██████      │                                          │
│  │ ░░░░░░░░░░░ │    │ ████████████│                                          │
│  └─────────────┘    └─────────────┘                                          │
│                                                                              │
│  Action Loading      Spinner + disabled state                                │
│  ┌─────────────┐                                                             │
│  │ ◌ Saving... │    Button shows spinner, prevents double-click             │
│  └─────────────┘                                                             │
│                                                                              │
│  Background          Toast notification                                      │
│  ┌─────────────┐                                                             │
│  │ ↻ Syncing   │    Non-blocking, dismissible                               │
│  └─────────────┘                                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Error States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ERROR STATES                                                                │
│                                                                              │
│  Field Error         Inline, below input                                     │
│  ┌─────────────┐                                                             │
│  │ email@...   │                                                             │
│  └─────────────┘                                                             │
│  ⚠ Invalid email                                                             │
│                                                                              │
│  Form Error          Banner at top of form                                   │
│  ┌─────────────────────────────────────┐                                     │
│  │ ⚠ Please fix 3 errors below        │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
│  Page Error          Full page with retry                                    │
│  ┌─────────────────────────────────────┐                                     │
│  │         Something went wrong        │                                     │
│  │         [Try Again] [Go Home]       │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
│  Network Error       Toast with retry                                        │
│  ┌─────────────────────────────────────┐                                     │
│  │ ⚠ Connection lost. Retrying...     │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Empty States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  EMPTY STATES                                                                │
│                                                                              │
│  First Use           Onboarding prompt                                       │
│  ┌─────────────────────────────────────┐                                     │
│  │         📁 No decks yet             │                                     │
│  │    Create your first deck to        │                                     │
│  │    get started                       │                                     │
│  │         [+ Create Deck]              │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
│  No Results          Search/filter feedback                                  │
│  ┌─────────────────────────────────────┐                                     │
│  │         🔍 No results               │                                     │
│  │    Try adjusting your filters       │                                     │
│  │         [Clear Filters]              │                                     │
│  └─────────────────────────────────────┘                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Accessibility Checklist

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard Navigation** | All interactive elements focusable, logical tab order |
| **Focus Indicators** | Visible focus rings (not just outline: none) |
| **Color Contrast** | 4.5:1 for text, 3:1 for large text/UI |
| **Screen Readers** | Semantic HTML, ARIA labels where needed |
| **Motion** | Respect prefers-reduced-motion |
| **Touch Targets** | Minimum 44x44px on mobile |
| **Error Identification** | Not color-alone, descriptive messages |

## DESIGN.md Template

```markdown
# DESIGN: [System Name]

## Overview

[1-2 sentence description of the UI]

## Design Tokens

### Colors
[Color palette with hex values]

### Typography
[Font families, sizes, weights]

### Spacing
[Spacing scale]

## Component Hierarchy

[ASCII tree of components]

## Page Layouts

### [Page Name]
[ASCII layout diagram]

## Key Interactions

### [Interaction Name]
- Trigger: [what initiates]
- Feedback: [what user sees]
- States: [loading, success, error]

## Accessibility

[Key a11y decisions]

## Open Questions

[Design decisions needing input]

---
*Designed by: frontend-design skill*
```

## Relationship to Other Skills

| Skill | Relationship |
|-------|--------------|
| `architect` | ARCHITECTURE.md informs component structure |
| `spec` | FEATURESPEC.md defines what to design |
| `implement` | DESIGN.md guides implementation |
| `code-review` | Reviews against design specs |
| `document` | Design decisions feed into docs |

## Key Principles

**Design for states.** Every component has loading, error, empty, and success states.

**Consistency over creativity.** Use established patterns; innovate only when necessary.

**Accessibility first.** Build a11y in from the start, not as an afterthought.

**Document decisions.** Future maintainers need to understand why, not just what.

**Mobile-aware.** Even desktop-first apps need responsive consideration.

## Mode-Specific Behavior

Frontend design approach differs by orchestrator mode:

### Greenfield Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Full UI/UX design |
| **Approach** | Comprehensive—design from scratch |
| **Patterns** | Free choice—establish new design system |
| **Deliverables** | Complete DESIGN.md with full token system |
| **Validation** | Standard accessibility and usability checks |
| **Constraints** | Minimal—full creative freedom |

### Brownfield-Polish Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Gap-specific UI additions |
| **Approach** | Extend existing components and patterns |
| **Patterns** | Should match existing design system |
| **Deliverables** | Delta design document |
| **Validation** | Existing + new component consistency |
| **Constraints** | Don't restructure existing design system |

**Polish considerations:**
- [ ] Existing design system documented/understood
- [ ] New components follow existing patterns
- [ ] Existing design tokens reused
- [ ] Interaction patterns match existing UI
- [ ] No new patterns without justification

### Brownfield-Enterprise Mode

| Aspect | Behavior |
|--------|----------|
| **Scope** | Change-specific UI only |
| **Approach** | Surgical—modify existing components only |
| **Patterns** | Must conform exactly—no new patterns |
| **Deliverables** | Change impact on UI document |
| **Validation** | Full regression + backwards compatibility |
| **Constraints** | Requires approval—design team sign-off |

**Enterprise frontend design constraints:**
- No new design tokens without design team approval
- New components must use existing atoms/molecules
- UI changes must be backwards compatible
- User flow changes require UX review
- Accessibility changes require a11y audit

---

## References

- `references/component-patterns.md`: Common component structures
- `references/design-tokens.md`: Token system guide
- `references/interaction-patterns.md`: Standard interactions
- `references/accessibility-checklist.md`: WCAG compliance
- `references/responsive-patterns.md`: Multi-device support

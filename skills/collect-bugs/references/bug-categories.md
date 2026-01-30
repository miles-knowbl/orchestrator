# Bug Categories Reference

Detailed definitions and examples for each bug category.

---

## UI Bugs (UI-###)

Visual issues that affect appearance but not functionality.

### Examples

| Severity | Example |
|----------|---------|
| P1 | Button text invisible due to same color as background |
| P2 | Card shadow cut off at container edge |
| P2 | Text overlaps icon on mobile breakpoint |
| P3 | 1px misalignment between header and content |
| P3 | Inconsistent border radius across similar elements |

### What to Look For

- **Layout**: Overflow, clipping, alignment, spacing
- **Typography**: Font size, weight, color, truncation
- **Colors**: Contrast, theme consistency, dark mode
- **Responsive**: Breakpoint transitions, mobile layout
- **Animation**: Jank, missing transitions, abrupt changes

---

## UX Bugs (UX-###)

Interaction and flow issues that confuse or frustrate users.

### Examples

| Severity | Example |
|----------|---------|
| P0 | Submit button does nothing (no feedback, no action) |
| P1 | Modal closes on backdrop click during form entry |
| P1 | No error message shown when save fails |
| P2 | Can't tell which field has focus |
| P2 | Success message appears for 200ms (too fast to read) |
| P3 | Tooltip appears on mobile where tap doesn't work |

### What to Look For

- **Feedback**: Loading states, success/error messages, progress
- **Navigation**: Back button behavior, breadcrumbs, deep links
- **Forms**: Validation timing, error placement, auto-focus
- **Accessibility**: Focus management, screen reader flow
- **Affordances**: Clickable things look clickable

---

## Data Bugs (DATA-###)

Incorrect, missing, or malformed data display.

### Examples

| Severity | Example |
|----------|---------|
| P0 | Shows another user's data |
| P0 | Stale data persists after update |
| P1 | Date shows as "Invalid Date" |
| P1 | Currency missing symbol or wrong format |
| P2 | Long username breaks layout instead of truncating |
| P2 | Empty array shows "undefined" instead of empty state |
| P3 | Timezone offset causes "yesterday" to show for today |

### What to Look For

- **Nulls**: undefined, null, NaN displayed to user
- **Formats**: Dates, numbers, currency, percentages
- **Lengths**: Truncation, overflow, word wrap
- **Empty states**: Arrays, objects, strings
- **Staleness**: Data not refreshing after mutation

---

## Console Bugs (CON-###)

Errors and warnings visible in developer tools.

### Examples

| Severity | Example |
|----------|---------|
| P1 | `Unhandled promise rejection: NetworkError` |
| P1 | `Cannot read property 'id' of undefined` |
| P2 | `Warning: Each child in a list should have a unique "key"` |
| P2 | `[Deprecation] Feature X will be removed in version Y` |
| P3 | `DevTools failed to load source map` |

### What to Look For

- **Errors**: Red messages, stack traces
- **Warnings**: Yellow messages, deprecations
- **Network**: Failed requests (4xx, 5xx), CORS issues
- **React**: Key warnings, hook dependency warnings
- **TypeScript**: Runtime type errors

---

## Performance Bugs (PERF-###)

Slowness, memory issues, or inefficient rendering.

### Examples

| Severity | Example |
|----------|---------|
| P1 | Page freezes for 3+ seconds on load |
| P1 | Memory usage grows unbounded over time |
| P2 | List with 100 items causes visible lag |
| P2 | Every keystroke triggers full re-render |
| P3 | Initial paint takes 2s on fast connection |

### What to Look For

- **Load time**: Time to interactive, first contentful paint
- **Responsiveness**: Input lag, scroll jank
- **Memory**: Leaks, unbounded growth, large objects
- **Rendering**: Unnecessary re-renders, layout thrashing
- **Network**: Excessive requests, large payloads

---

## Severity Decision Tree

```
Is the app unusable or crashing?
├── Yes → P0 (Blocking)
└── No
    └── Is a major feature broken?
        ├── Yes → P1 (High)
        └── No
            └── Will users notice and be annoyed?
                ├── Yes → P2 (Medium)
                └── No → P3 (Low/Cosmetic)
```

---

## Bug ID Format

```
[CATEGORY]-[NUMBER]

Examples:
- UI-001: First UI bug collected
- UX-012: Twelfth UX bug collected
- DATA-003: Third data bug collected
```

Numbers are sequential within each category for a given collection session.

# Accessibility Checklist

WCAG 2.1 AA compliance checklist for frontend applications.

## Keyboard Navigation

### Requirements
- [ ] All interactive elements are focusable (buttons, links, inputs, custom controls)
- [ ] Tab order follows visual/logical reading order
- [ ] No keyboard traps (user can always tab away)
- [ ] Skip links provided for main content
- [ ] Focus visible on all interactive elements

### Custom Components
```
Buttons:    Enter/Space to activate
Links:      Enter to follow
Checkboxes: Space to toggle
Radios:     Arrow keys to select within group
Selects:    Arrow keys to navigate, Enter to select
Tabs:       Arrow keys to switch, Enter/Space to select
Modals:     Escape to close, focus trapped inside
Menus:      Arrow keys to navigate, Escape to close
```

## Focus Management

### Visible Focus
```css
/* Good: Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Bad: Removing focus entirely */
:focus {
  outline: none; /* Never do this without replacement */
}
```

### Focus Order
```
1. Logo/skip link
2. Navigation
3. Main content (via skip link)
4. Sidebar (if present)
5. Footer
```

### Modal Focus
```
1. When modal opens: focus first focusable element
2. Tab cycles within modal only (focus trap)
3. When modal closes: return focus to trigger element
```

## Color and Contrast

### Minimum Ratios (WCAG AA)
| Element | Ratio | Tool |
|---------|-------|------|
| Normal text | 4.5:1 | WebAIM Contrast Checker |
| Large text (18px+) | 3:1 | |
| UI components | 3:1 | |
| Focus indicators | 3:1 | |

### Not Color Alone
```
❌ Red text for errors (color-only)
✅ Red text + icon + "Error:" label

❌ Green checkbox for success
✅ Green checkbox + checkmark icon + "Complete" text
```

## Semantic HTML

### Use Native Elements
```html
<!-- Good: Native button -->
<button type="button">Click me</button>

<!-- Bad: Div as button -->
<div role="button" tabindex="0" onclick="...">Click me</div>
```

### Headings
```html
<!-- Good: Logical heading hierarchy -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>

<!-- Bad: Skipping levels or style-based -->
<h1>Title</h1>
<h4>This should be h2</h4>
```

### Landmarks
```html
<header role="banner">...</header>
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

## ARIA Usage

### When to Use
```
1. When no native HTML element exists
2. To enhance native elements
3. To communicate dynamic changes

Rule: No ARIA is better than bad ARIA
```

### Common Patterns
```html
<!-- Button with loading state -->
<button aria-busy="true" aria-label="Saving...">
  <Spinner /> Saving
</button>

<!-- Expandable section -->
<button aria-expanded="false" aria-controls="section1">
  Toggle Section
</button>
<div id="section1" hidden>Content</div>

<!-- Live region for updates -->
<div aria-live="polite" aria-atomic="true">
  3 items added to cart
</div>
```

### Required ARIA
| Component | ARIA Attributes |
|-----------|-----------------|
| Modal | role="dialog", aria-modal, aria-labelledby |
| Tab panel | role="tablist/tab/tabpanel", aria-selected |
| Menu | role="menu/menuitem", aria-expanded |
| Tooltip | role="tooltip", aria-describedby |
| Alert | role="alert" or aria-live="assertive" |

## Images and Media

### Images
```html
<!-- Informative: describe content -->
<img src="chart.png" alt="Sales increased 25% in Q4">

<!-- Decorative: empty alt -->
<img src="decoration.svg" alt="">

<!-- Complex: long description -->
<img src="diagram.png" alt="System architecture" aria-describedby="diagram-desc">
<p id="diagram-desc">Detailed description...</p>
```

### Icons
```html
<!-- Icon-only button: needs label -->
<button aria-label="Close">
  <CloseIcon aria-hidden="true" />
</button>

<!-- Icon with text: hide icon from AT -->
<button>
  <SaveIcon aria-hidden="true" />
  Save
</button>
```

## Forms

### Labels
```html
<!-- Explicit label (preferred) -->
<label for="email">Email</label>
<input id="email" type="email">

<!-- Implicit label -->
<label>
  Email
  <input type="email">
</label>

<!-- aria-label for icon inputs -->
<input type="search" aria-label="Search decks">
```

### Error Messages
```html
<label for="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

### Required Fields
```html
<label for="name">
  Name <span aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true">
```

## Motion and Animation

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

### Auto-Playing Content
- Provide pause/stop controls
- Auto-stop after 5 seconds or provide control
- Never auto-play audio

## Touch Targets

### Minimum Size
```css
/* Mobile touch targets: 44x44px minimum */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Adequate spacing between targets */
.button-group button {
  margin: 8px;
}
```

## Testing Checklist

### Automated
- [ ] Run axe-core or Lighthouse accessibility audit
- [ ] Check color contrast with browser tools
- [ ] Validate HTML for proper nesting

### Manual
- [ ] Navigate entire page with keyboard only
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Zoom to 200% and verify usability
- [ ] Check in high contrast mode
- [ ] Test with reduced motion preference

### Screen Readers
| OS | Screen Reader | Browser |
|----|---------------|---------|
| macOS | VoiceOver | Safari |
| Windows | NVDA | Firefox |
| Windows | JAWS | Chrome |
| iOS | VoiceOver | Safari |
| Android | TalkBack | Chrome |

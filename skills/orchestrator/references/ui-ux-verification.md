# UI/UX Verification Reference

Ensuring beautiful, functional interfaces in brownfield-polish mode.

---

## Purpose

UI/UX verification ensures:
1. **Dark mode by default** — Clean, modern aesthetic
2. **Responsive design** — Works on all screen sizes
3. **Consistent styling** — Design system conformance
4. **Good UX patterns** — Loading, errors, empty states

---

## Verification Checklist

### 1. Dark Mode

| Check | How to Verify | Fix If Missing |
|-------|---------------|----------------|
| Background is dark | Visual inspection | Set `bg-gray-900` or `bg-slate-900` |
| Text is light | Visual inspection | Set `text-gray-100` or `text-white` |
| No white flash | Load page fresh | Add `dark` class to `<html>` before render |
| System preference respected | Toggle OS theme | Use `prefers-color-scheme` media query |
| Consistent palette | Compare all pages | Use design tokens |
| Sufficient contrast | Use contrast checker | WCAG AA minimum (4.5:1 for text) |

**Dark Mode Implementation:**

```css
/* Tailwind - in tailwind.config.js */
module.exports = {
  darkMode: 'class', // or 'media'
}

/* Apply dark mode globally */
<html class="dark">

/* Styles */
.dark body {
  @apply bg-gray-900 text-gray-100;
}
```

```javascript
// Detect system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

// Always dark (default)
document.documentElement.classList.add('dark');
```

### 2. Responsive Design

| Breakpoint | Width | What to Check |
|------------|-------|---------------|
| Mobile | < 640px | Single column, touch targets |
| Tablet | 640-1024px | Adjusted layout |
| Desktop | > 1024px | Full layout |

**Verification Commands:**

```bash
# Check for responsive classes (Tailwind)
grep -r "sm:\|md:\|lg:\|xl:" src/ | wc -l
# Should be > 0 for responsive sites

# Check for media queries (CSS)
grep -r "@media" src/ | wc -l
```

**Common Responsive Patterns:**

```html
<!-- Navigation: hamburger on mobile -->
<nav class="hidden md:flex">...</nav>
<button class="md:hidden">Menu</button>

<!-- Grid: stack on mobile -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Text: smaller on mobile -->
<h1 class="text-2xl md:text-4xl">
```

### 3. Spacing & Alignment

| Check | Standard | How to Verify |
|-------|----------|---------------|
| Consistent padding | 4px increments | Visual inspection |
| Aligned elements | Grid/flex | Browser dev tools |
| Proper margins | 4/8/16/24/32px | Measure in dev tools |
| No overflow | Elements within viewport | Scroll horizontally |

**Spacing Scale (Tailwind):**
- `p-1` = 4px
- `p-2` = 8px
- `p-4` = 16px
- `p-6` = 24px
- `p-8` = 32px

### 4. Typography

| Check | Standard | How to Verify |
|-------|----------|---------------|
| Font loaded | System or web font | Inspect computed style |
| Hierarchy clear | Distinct heading sizes | Visual inspection |
| Line height | 1.5 for body, 1.2 for headings | Computed style |
| Max width | ~65 characters for prose | Measure |

**Typography Defaults:**

```css
body {
  @apply font-sans text-base leading-relaxed;
}

h1 { @apply text-4xl font-bold leading-tight; }
h2 { @apply text-3xl font-semibold leading-tight; }
h3 { @apply text-2xl font-medium leading-snug; }

/* Prose max width */
.prose {
  @apply max-w-prose; /* ~65ch */
}
```

### 5. Interactive Elements

| Element | Required States | Check |
|---------|-----------------|-------|
| Buttons | default, hover, active, disabled | Hover and click each |
| Links | default, hover, visited, active | Navigate and return |
| Inputs | default, focus, error, disabled | Tab through form |
| Cards | default, hover (if clickable) | Hover test |

**Button States:**

```html
<button class="
  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
  disabled:bg-gray-400 disabled:cursor-not-allowed
  focus:outline-none focus:ring-2 focus:ring-blue-500
  transition-colors
">
```

### 6. Loading States

| Location | Expected | Check |
|----------|----------|-------|
| Page load | Skeleton or spinner | Throttle network in dev tools |
| Button submit | Loading indicator | Click and observe |
| Data fetch | Loading state | Slow API response |
| Image load | Placeholder or blur | Throttle images |

**Loading Patterns:**

```jsx
// Skeleton
{isLoading ? (
  <div class="animate-pulse bg-gray-700 h-4 w-full rounded" />
) : (
  <p>{content}</p>
)}

// Button loading
<button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

### 7. Error States

| Location | Expected | Check |
|----------|----------|-------|
| Form validation | Inline error messages | Submit invalid form |
| API errors | User-friendly message | Disconnect network |
| 404 page | Helpful not found page | Visit invalid URL |
| Crash | Error boundary | Throw error in component |

**Error Patterns:**

```jsx
// Form error
<input class={error ? 'border-red-500' : 'border-gray-600'} />
{error && <p class="text-red-500 text-sm">{error}</p>}

// Error boundary fallback
<div class="text-center p-8">
  <h2>Something went wrong</h2>
  <button onClick={retry}>Try again</button>
</div>
```

### 8. Empty States

| Location | Expected | Check |
|----------|----------|-------|
| Empty list | Helpful message + CTA | Clear all data |
| No search results | Suggestions | Search nonsense |
| First-time user | Onboarding | New account |

**Empty State Pattern:**

```jsx
{items.length === 0 ? (
  <div class="text-center p-8 text-gray-400">
    <Icon class="w-12 h-12 mx-auto mb-4" />
    <h3>No items yet</h3>
    <p>Get started by creating your first item.</p>
    <button>Create Item</button>
  </div>
) : (
  <ItemList items={items} />
)}
```

### 9. Accessibility

| Check | Standard | How to Verify |
|-------|----------|---------------|
| Keyboard navigation | Tab through all interactive | Use keyboard only |
| Focus visible | Clear focus ring | Tab and observe |
| Alt text | All images have alt | Inspect images |
| ARIA labels | Interactive elements labeled | Screen reader |
| Color contrast | 4.5:1 minimum | Contrast checker |

**Accessibility Basics:**

```html
<!-- Focus visible -->
<button class="focus:ring-2 focus:ring-blue-500 focus:outline-none">

<!-- Alt text -->
<img src="..." alt="Description of image" />

<!-- ARIA labels -->
<button aria-label="Close menu">
  <XIcon />
</button>

<!-- Skip link -->
<a href="#main" class="sr-only focus:not-sr-only">
  Skip to content
</a>
```

### 10. Polish Details

| Detail | Standard | How to Verify |
|--------|----------|---------------|
| Favicon | Present and appropriate | Check browser tab |
| Page title | Descriptive per page | Check browser tab |
| Meta description | Present | View page source |
| Open Graph | Social sharing works | Share link |
| Smooth transitions | 150-300ms | Interact with UI |
| No console errors | Clean console | Open dev tools |

**Polish Checklist:**

```html
<head>
  <link rel="icon" href="/favicon.ico" />
  <title>Page Title | App Name</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:image" content="..." />
</head>
```

---

## Verification Procedure

### Automated Checks

```bash
# 1. Check for dark mode classes
grep -r "dark:" src/ | wc -l
# Expect > 0

# 2. Check for responsive classes
grep -r "sm:\|md:\|lg:" src/ | wc -l
# Expect > 0

# 3. Check for loading states
grep -r "loading\|isLoading\|pending" src/ | wc -l
# Expect > 0

# 4. Run accessibility audit
npx lighthouse --only-categories=accessibility http://localhost:3000
# Expect > 90

# 5. Check console errors
# Manual: Open dev tools, check console

# 6. Run linter
npm run lint
# Expect no errors
```

### Manual Verification

```
UI/UX Verification Checklist
═══════════════════════════

Dark Mode
  [ ] Background is dark (#1a1a1a or similar)
  [ ] Text is light and readable
  [ ] No white flash on load
  [ ] Consistent color palette

Responsive
  [ ] Mobile (375px): Single column, usable
  [ ] Tablet (768px): Appropriate layout
  [ ] Desktop (1440px): Full experience

Spacing
  [ ] Consistent padding/margins
  [ ] Elements properly aligned
  [ ] No horizontal overflow

Typography
  [ ] Font loads correctly
  [ ] Clear heading hierarchy
  [ ] Readable line length

Interactive
  [ ] All buttons have hover states
  [ ] Focus states visible
  [ ] Disabled states clear

States
  [ ] Loading indicators present
  [ ] Error messages helpful
  [ ] Empty states informative

Accessibility
  [ ] Keyboard navigable
  [ ] Focus visible
  [ ] Sufficient contrast

Polish
  [ ] Favicon present
  [ ] Page titles set
  [ ] No console errors
  [ ] Smooth transitions
```

---

## Integration with frontend-design Skill

For comprehensive UI/UX work, invoke the `frontend-design` skill:

```
Invoke: frontend-design

Context: Brownfield-polish mode, verifying UI/UX
Input: {
  "currentState": "Basic styling exists",
  "goals": [
    "Dark mode default",
    "Responsive design",
    "Polish and consistency"
  ]
}
```

The frontend-design skill provides:
- Component patterns
- Design system recommendations
- Specific fixes for common issues

---

## Quick Fixes

### Add Dark Mode Fast

```html
<!-- In <head> before any render -->
<script>
  document.documentElement.classList.add('dark');
</script>

<!-- In CSS/Tailwind -->
<body class="bg-gray-900 text-gray-100">
```

### Add Responsive Fast

```html
<!-- Container with max-width and padding -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>

<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col md:flex-row gap-4">
```

### Add Loading State Fast

```jsx
// Simple loading wrapper
function LoadingWrapper({ isLoading, children }) {
  if (isLoading) {
    return <div class="animate-pulse">Loading...</div>;
  }
  return children;
}
```

---

*Beautiful UI/UX is a feature, not a luxury. Polish mode ensures it's not forgotten.*

# Responsive Patterns

Multi-device design patterns for frontend applications.

## Breakpoints

### Standard Breakpoints
```css
/* Mobile-first approach */
/* Default: 0-639px (mobile) */

@media (min-width: 640px) {  /* sm: tablet portrait */
}

@media (min-width: 768px) {  /* md: tablet landscape */
}

@media (min-width: 1024px) { /* lg: laptop */
}

@media (min-width: 1280px) { /* xl: desktop */
}

@media (min-width: 1536px) { /* 2xl: large desktop */
}
```

### Tailwind Breakpoints
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

## Layout Patterns

### Responsive Container
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### Sidebar Layout
```
Desktop (lg+)              Tablet (md)              Mobile
┌────┬───────────┐         ┌───────────────┐        ┌───────────────┐
│    │           │         │ ☰ Header      │        │ ☰ Header      │
│ S  │  Content  │         ├───────────────┤        ├───────────────┤
│ I  │           │         │               │        │               │
│ D  │           │         │   Content     │        │   Content     │
│ E  │           │         │               │        │               │
│    │           │         │               │        │               │
└────┴───────────┘         └───────────────┘        └───────────────┘
Fixed sidebar              Collapsible sidebar      Off-canvas sidebar
```

```css
.layout {
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .layout {
    flex-direction: row;
  }

  .sidebar {
    width: 280px;
    flex-shrink: 0;
  }

  .content {
    flex: 1;
  }
}
```

### Card Grid
```
Desktop               Tablet               Mobile
┌────┬────┬────┐     ┌────┬────┐          ┌────────┐
│ 1  │ 2  │ 3  │     │ 1  │ 2  │          │   1    │
├────┼────┼────┤     ├────┼────┤          ├────────┤
│ 4  │ 5  │ 6  │     │ 3  │ 4  │          │   2    │
└────┴────┴────┘     └────┴────┘          ├────────┤
                                          │   3    │
                                          └────────┘
```

```css
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

## Navigation Patterns

### Desktop to Mobile Nav
```
Desktop                          Mobile
┌─────────────────────────┐     ┌─────────────────────────┐
│ Logo  Nav1 Nav2 Nav3 👤 │     │ Logo              ☰     │
└─────────────────────────┘     └─────────────────────────┘
                                        ↓ menu opens
                                ┌─────────────────────────┐
                                │ Nav1                    │
                                │ Nav2                    │
                                │ Nav3                    │
                                │ Profile                 │
                                └─────────────────────────┘
```

### Tab Navigation
```
Desktop: Horizontal tabs
┌─────────┬─────────┬─────────┐
│  Tab 1  │  Tab 2  │  Tab 3  │
└─────────┴─────────┴─────────┘

Mobile: Full-width or scrollable
┌─────────────────────────────┐
│ Tab 1 │ Tab 2 │ Tab 3 → → → │
└─────────────────────────────┘
```

## Typography Scaling

### Fluid Typography
```css
/* Scales between 16px (mobile) and 20px (desktop) */
html {
  font-size: clamp(1rem, 0.5rem + 1vw, 1.25rem);
}

/* Headings scale proportionally */
h1 { font-size: clamp(1.75rem, 1.5rem + 2vw, 3rem); }
h2 { font-size: clamp(1.5rem, 1.25rem + 1.5vw, 2.25rem); }
h3 { font-size: clamp(1.25rem, 1rem + 1vw, 1.75rem); }
```

## Image Patterns

### Responsive Images
```html
<picture>
  <source media="(min-width: 1024px)" srcset="large.jpg">
  <source media="(min-width: 640px)" srcset="medium.jpg">
  <img src="small.jpg" alt="...">
</picture>
```

### Art Direction
```
Desktop: Landscape hero image
Mobile: Cropped portrait version focusing on subject
```

## Touch vs Mouse

### Hover States
```css
/* Desktop: show on hover */
@media (hover: hover) {
  .card:hover .overlay {
    opacity: 1;
  }
}

/* Touch: always visible or tap to reveal */
@media (hover: none) {
  .card .overlay {
    opacity: 1;
  }
}
```

### Touch Targets
```css
/* Minimum touch target size */
.button {
  min-height: 44px;
  min-width: 44px;
}

/* Increase spacing on touch devices */
@media (pointer: coarse) {
  .button-group {
    gap: 0.75rem;
  }
}
```

## Data Tables

### Responsive Table Patterns

**Option 1: Horizontal Scroll**
```css
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

**Option 2: Stack on Mobile**
```
Desktop                    Mobile
┌────┬────┬────┐          ┌──────────────┐
│ A  │ B  │ C  │          │ A: value     │
├────┼────┼────┤          │ B: value     │
│ v1 │ v2 │ v3 │          │ C: value     │
└────┴────┴────┘          ├──────────────┤
                          │ A: value     │
                          │ B: value     │
                          │ C: value     │
                          └──────────────┘
```

**Option 3: Priority Columns**
```css
/* Show only essential columns on mobile */
.priority-low { display: none; }

@media (min-width: 768px) {
  .priority-low { display: table-cell; }
}
```

## Form Layouts

### Two-Column to Single
```css
.form-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 640px) {
  .form-row {
    flex-direction: row;
  }

  .form-row > * {
    flex: 1;
  }
}
```

## Testing Checklist

### Viewport Testing
- [ ] 320px (small mobile)
- [ ] 375px (iPhone)
- [ ] 414px (large mobile)
- [ ] 768px (tablet portrait)
- [ ] 1024px (tablet landscape / laptop)
- [ ] 1280px (desktop)
- [ ] 1920px (large desktop)

### Device Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Desktop Chrome/Firefox/Safari

### Orientation
- [ ] Portrait mobile
- [ ] Landscape mobile
- [ ] Portrait tablet
- [ ] Landscape tablet

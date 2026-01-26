# Design Tokens

Systematic approach to design values.

## What Are Design Tokens?

Design tokens are the atomic values of a design system: colors, spacing, typography, shadows, etc. They create consistency and enable theming.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN HIERARCHY                                      │
│                                                                              │
│  Global Tokens          Semantic Tokens         Component Tokens             │
│  ─────────────          ───────────────         ────────────────             │
│  blue-500: #3B82F6  →   primary: blue-500   →   button-bg: primary          │
│  gray-100: #F3F4F6  →   surface: gray-100   →   card-bg: surface            │
│  4px: 0.25rem       →   spacing-sm: 4px     →   button-padding: spacing-sm  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Color Tokens

### Palette Structure
```css
:root {
  /* Primary - brand color */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;  /* Main */
  --color-primary-600: #2563eb;  /* Hover */
  --color-primary-700: #1d4ed8;  /* Active */

  /* Neutral - grays */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-200: #e4e4e7;
  --color-neutral-500: #71717a;
  --color-neutral-900: #18181b;

  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
}
```

### Semantic Aliases
```css
:root {
  --color-text-primary: var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-inverse: var(--color-neutral-50);

  --color-bg-primary: white;
  --color-bg-secondary: var(--color-neutral-50);
  --color-bg-tertiary: var(--color-neutral-100);

  --color-border: var(--color-neutral-200);
  --color-border-focus: var(--color-primary-500);
}
```

## Spacing Tokens

### 4px Base Scale
```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
}
```

### Semantic Spacing
```css
:root {
  --spacing-xs: var(--spacing-1);   /* Tight: icons, badges */
  --spacing-sm: var(--spacing-2);   /* Compact: form fields */
  --spacing-md: var(--spacing-4);   /* Default: cards, sections */
  --spacing-lg: var(--spacing-6);   /* Loose: page sections */
  --spacing-xl: var(--spacing-10);  /* Extra: hero sections */
}
```

## Typography Tokens

### Font Families
```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Font Sizes
```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
}
```

### Line Heights
```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Font Weights
```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

## Shadow Tokens

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

## Border Radius Tokens

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.5rem;    /* 8px */
  --radius-xl: 0.75rem;   /* 12px */
  --radius-full: 9999px;  /* Pills */
}
```

## Transition Tokens

```css
:root {
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

## Z-Index Tokens

```css
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
}
```

## Dark Mode Pattern

```css
:root {
  --color-bg-primary: white;
  --color-text-primary: var(--color-neutral-900);
}

:root.dark {
  --color-bg-primary: var(--color-neutral-900);
  --color-text-primary: var(--color-neutral-50);
}
```

## Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          // ...
        },
      },
      spacing: {
        // Uses Tailwind defaults (4px base)
      },
    },
  },
};
```

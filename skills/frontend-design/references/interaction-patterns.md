# Interaction Patterns

Standard UI interaction patterns for consistent user experience.

## Form Interactions

### Input Validation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION TIMING                                                           │
│                                                                              │
│  On Blur (recommended)     On Change              On Submit                  │
│  ────────────────────     ─────────              ─────────                  │
│  • Validate when user     • Validate every       • Validate all             │
│    leaves field             keystroke              at once                  │
│  • Less intrusive         • Immediate feedback   • Batch feedback           │
│  • Good for most forms    • Good for passwords   • Good for simple forms    │
│                                                                              │
│  Pattern: Start with on-blur, switch to on-change after first error         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Form Submission

```
1. User clicks submit
2. Disable button, show spinner
3. Validate all fields
4. If errors: show inline, focus first error
5. If valid: submit to server
6. On success: redirect or show success toast
7. On error: show error banner, re-enable form
```

## Button States

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  BUTTON STATES                                                               │
│                                                                              │
│  Default       Hover         Active        Disabled      Loading            │
│  ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐            │
│  │ Save  │    │ Save  │    │ Save  │    │ Save  │    │ ◌ ... │            │
│  └───────┘    └───────┘    └───────┘    └───────┘    └───────┘            │
│  bg-primary   bg-primary   bg-primary   bg-gray-300  bg-primary            │
│               -600         -700         opacity-50   cursor-wait            │
│               cursor-ptr   scale-98                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modal Patterns

### Opening
```
1. Trigger clicked
2. Add body overflow: hidden (prevent scroll)
3. Fade in backdrop (150ms)
4. Slide/scale in modal (200ms)
5. Focus first focusable element
6. Trap focus within modal
```

### Closing
```
1. Close triggered (X, backdrop click, Escape)
2. Slide/scale out modal (150ms)
3. Fade out backdrop (150ms)
4. Restore body scroll
5. Return focus to trigger element
```

### Focus Trap
```
Tab → cycles through modal elements
Shift+Tab → reverse cycle
Escape → close modal
Click backdrop → close modal (optional)
```

## Drag and Drop

### Drag Start
```
1. User starts drag (mousedown + move, or touch)
2. Create drag preview (ghost or styled clone)
3. Add dragging class to source
4. Calculate valid drop zones
5. Hide original (opacity: 0) or show placeholder
```

### Drag Over
```
1. Track cursor position
2. Highlight valid drop zones on hover
3. Show insertion indicator
4. Auto-scroll if near edges
```

### Drop
```
1. User releases
2. Animate item to new position
3. Update data model
4. Remove drag classes
5. Announce change to screen readers
```

## Toast Notifications

### Placement
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                              ┌─────────────┐                                 │
│                              │ Toast Stack │  ← Top-right (desktop)          │
│                              ├─────────────┤                                 │
│                              │ Toast 2     │                                 │
│                              └─────────────┘                                 │
│                                                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                              Toast                                    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                              ↑ Bottom-center (mobile)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Behavior
```
Success: Auto-dismiss after 3s
Error: Persist until dismissed
Warning: Auto-dismiss after 5s
Info: Auto-dismiss after 4s

Hover: Pause auto-dismiss timer
Action button: Optional action (Undo, View, etc.)
```

## Loading Patterns

### Skeleton Screens
```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SKELETON PATTERNS                                                           │
│                                                                              │
│  Text Line:     ████████████████████░░░░░░░░                                 │
│  Avatar:        ●                                                            │
│  Card:          ┌─────────────────┐                                          │
│                 │ ░░░░░░░░░░░░░░░ │                                          │
│                 │ ░░░░░░░░░       │                                          │
│                 │ ░░░░░░░░░░░░    │                                          │
│                 └─────────────────┘                                          │
│                                                                              │
│  Use CSS animation: shimmer effect (gradient moving left-to-right)           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Progress Indicators
```
Indeterminate: Spinner (unknown duration)
Determinate: Progress bar (known progress)
Stepped: Step indicator (multi-step process)
```

## Navigation Patterns

### Breadcrumbs
```
Home > Decks > My Presentation > Edit
  ↓      ↓          ↓             ↓
Link   Link       Link        Current (no link)
```

### Tabs
```
┌─────────┬─────────┬─────────┐
│ Tab 1 ● │  Tab 2  │  Tab 3  │
├─────────┴─────────┴─────────┤
│                             │
│      Tab 1 content          │
│                             │
└─────────────────────────────┘

Keyboard: Arrow left/right to switch
ARIA: role="tablist", role="tab", role="tabpanel"
```

### Pagination
```
← Previous  1  2  [3]  4  5  ...  20  Next →

Show: First, last, current ± 2
Keyboard: Arrow keys when focused
```

## Confirmation Patterns

### Destructive Actions
```
┌─────────────────────────────────────────┐
│  Delete Deck                            │
│                                         │
│  Are you sure you want to delete        │
│  "My Presentation"? This cannot         │
│  be undone.                             │
│                                         │
│        [Cancel]  [Delete]               │
│                   ↑ Red/destructive     │
└─────────────────────────────────────────┘

For critical: Require typing confirmation text
```

### Unsaved Changes
```
┌─────────────────────────────────────────┐
│  Unsaved Changes                        │
│                                         │
│  You have unsaved changes. Do you       │
│  want to save before leaving?           │
│                                         │
│  [Don't Save]  [Cancel]  [Save]         │
└─────────────────────────────────────────┘
```

## Optimistic UI

```
1. User performs action (e.g., toggle favorite)
2. Immediately update UI (star fills in)
3. Send request to server in background
4. If success: done
5. If error: revert UI, show toast
```

## Keyboard Shortcuts

### Standard Shortcuts
```
Cmd/Ctrl + S    Save
Cmd/Ctrl + Z    Undo
Cmd/Ctrl + Y    Redo
Escape          Close modal, cancel
Enter           Submit form, confirm
```

### Discoverability
```
Show on hover: "Save (⌘S)"
Shortcut menu: "?" to show all shortcuts
```

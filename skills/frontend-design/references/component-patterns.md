# Component Patterns

Common patterns for frontend component architecture.

## Atomic Design Hierarchy

```
Atoms → Molecules → Organisms → Templates → Pages

Atoms:        Button, Input, Label, Icon
Molecules:    SearchInput (Input + Button), FormField (Label + Input + Error)
Organisms:    Header, Sidebar, Card, Modal
Templates:    PageLayout, DashboardLayout, AuthLayout
Pages:        Dashboard, Settings, ItemDetail
```

## Component Naming Conventions

| Pattern | Example | Use For |
|---------|---------|---------|
| PascalCase | `UserCard` | Component files |
| Feature prefix | `BrandCard`, `DeckCard` | Domain-specific |
| UI prefix | `UIButton`, `UIModal` | Generic/shared |
| Action suffix | `DeleteButton`, `SaveButton` | Action-specific |

## Prop Patterns

### Variant Props
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
}
```

### Compound Components
```svelte
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Render Props / Slots
```svelte
<DataTable data={items}>
  <svelte:fragment slot="row" let:item>
    <td>{item.name}</td>
    <td>{item.status}</td>
  </svelte:fragment>
</DataTable>
```

## State Patterns

### Container/Presenter
```
Container (smart)     Presenter (dumb)
├── Fetches data      ├── Receives props
├── Handles events    ├── Renders UI
├── Manages state     └── Emits events
└── Passes to presenter
```

### Controlled vs Uncontrolled
```svelte
<!-- Controlled: parent owns state -->
<Input value={email} on:change={handleChange} />

<!-- Uncontrolled: component owns state -->
<Input bind:value={email} />
```

## Common Component Structures

### List + Detail Pattern
```
/items          → ItemList
/items/:id      → ItemDetail
/items/:id/edit → ItemEdit
```

### Wizard Pattern
```
/create/step-1  → Step1
/create/step-2  → Step2
/create/review  → Review
/create/confirm → Confirm
```

### Modal Pattern
```
/items              → ItemList
/items?modal=create → ItemList + CreateModal
/items/:id?modal=delete → ItemDetail + DeleteModal
```

## File Structure

```
components/
├── ui/           # Generic, reusable
│   ├── Button.svelte
│   ├── Input.svelte
│   └── Modal.svelte
├── layout/       # App structure
│   ├── Header.svelte
│   └── Sidebar.svelte
├── [feature]/    # Domain-specific
│   ├── BrandCard.svelte
│   └── BrandUploader.svelte
└── index.ts      # Barrel exports
```

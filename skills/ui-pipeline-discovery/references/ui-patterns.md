# UI Patterns

Common UI interaction patterns to recognize.

## Chat/Agent Patterns

### Chat-to-Action
User sends message → Agent processes → Tool executes → Result displayed

```
User: "Generate a tweet about AI"
  → ChatContext.sendMessage()
    → SSE stream to agent
      → generate_tweet tool called
        → Result in ToolCallBubble
```

**Components:** ChatInput, ChatContext, ToolCallBubble

### Chat-to-Edit
User describes edit → Agent applies → Artifact updated

```
User: "Make it shorter"
  → Context has artifact_id
    → edit_artifact tool
      → Artifact re-renders
```

**Components:** ChatContext, toolHandlers, ArtifactEditor

## Selection Patterns

### Multi-Select-to-Context
User selects items → Selection stored → Actions enabled

```
User clicks checkbox
  → SelectionContext.toggle(id)
    → Selected count updates
      → Action buttons enable
```

**Components:** SelectionProvider, ItemCheckbox, ActionBar

### Selection-to-Detail
User clicks item → Detail view loads

```
User clicks source
  → Router navigates
    → Detail component mounts
      → Data fetched
```

**Components:** ListView, Router, DetailView

## Modal Patterns

### Modal-to-Create
User opens modal → Fills form → Submits → Item created

```
User clicks "New Source"
  → Modal opens
    → Form filled
      → Submit creates source
        → Modal closes, list updates
```

**Components:** CreateButton, Modal, Form, ListView

### Modal-to-Configure
User opens settings → Changes values → Saves

```
User clicks gear icon
  → Settings modal opens
    → Values changed
      → Save updates preferences
```

**Components:** SettingsButton, SettingsModal, usePreferences

## Form Patterns

### Inline Edit
User clicks text → Input appears → User edits → Blur saves

```
User clicks title
  → Span becomes input
    → User types
      → Blur triggers save
        → Input becomes span
```

**Components:** EditableText, useInlineEdit

### Form Wizard
User progresses through steps → Validates each → Submits at end

```
Step 1: Basic info
  → Next validates
    → Step 2: Details
      → Next validates
        → Submit all data
```

**Components:** Wizard, WizardStep, WizardNavigation

## Real-time Patterns

### Subscription-to-Update
Data changes elsewhere → Subscription receives → UI updates

```
Another user edits
  → Supabase channel receives
    → Local state updates
      → Component re-renders
```

**Components:** SubscriptionProvider, useSubscription

### Optimistic Update
User acts → UI updates immediately → Server confirms/reverts

```
User clicks like
  → Count increments immediately
    → API call made
      → Success: keep change
      → Failure: revert
```

**Components:** useMutation with optimistic option

## Drag-and-Drop Patterns

### Reorder
User drags item → Drops in new position → Order saved

```
User drags card
  → Drop zone highlights
    → Drop triggers reorder
      → API saves new order
```

**Components:** DragProvider, DraggableItem, DropZone

### Transfer
User drags item → Drops in different container → Item moves

```
User drags source
  → Drops in folder
    → Source moved to folder
```

**Components:** DragSource, DropTarget, useTransfer

## Pattern Indicators

| Pattern | Code Indicators |
|---------|----------------|
| Chat-to-Action | sendMessage(), tool handlers |
| Selection | useState<Set>(), toggle(), isSelected |
| Modal | isOpen state, onClose, Dialog component |
| Inline Edit | contentEditable, onBlur save |
| Real-time | useSubscription, channel.on() |
| Drag-and-Drop | useDrag, useDrop, DndContext |

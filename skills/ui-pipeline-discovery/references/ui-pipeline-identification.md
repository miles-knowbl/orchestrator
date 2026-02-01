# UI Pipeline Identification

How to find UI pipelines in a codebase.

## What Qualifies as a UI Pipeline

A UI pipeline must have:

1. **User Trigger** — Interaction that starts the flow
2. **State Changes** — Context or component state updates
3. **User Outcome** — Visible result to the user

## Discovery Strategy

### 1. Start with User Entry Points

Look for:
- onClick handlers
- onSubmit handlers
- Chat send functions
- Selection change handlers

### 2. Trace State Flow

Follow the state through:
```
User Action → Context Update → API Call → Response → UI Update
```

### 3. Identify Feedback Points

Where does the user see results?
- Toast notifications
- Inline updates
- New elements appearing
- Loading/success states

## Code Patterns to Search

### Event Handlers
```typescript
onClick={() => handleEdit()}
onSubmit={handleSubmit}
onChange={(e) => setSelection(e.target.value)}
```

### Context Actions
```typescript
const { sendMessage, setArtifact } = useChat()
context.updateSelection()
dispatch({ type: 'SET_ACTIVE' })
```

### API Mutations
```typescript
const mutation = useMutation(...)
await supabase.functions.invoke()
fetch('/api/...', { method: 'POST' })
```

### Subscriptions
```typescript
supabase.channel('changes').on('*', handler)
const { data } = useSubscription(query)
new EventSource('/api/stream')
```

## UI-Specific Indicators

### Chat/Agent Flows
```typescript
// Look for message handling
sendMessage()
handleToolCall()
parseToolResult()
```

### Context Synchronization
```typescript
// Look for context consumers
const { artifact_id } = useContext(ChatContext)
if (!artifact_id) return null
```

### Real-time Updates
```typescript
// Look for subscriptions
useEffect(() => {
  const channel = supabase.channel('updates')
  return () => channel.unsubscribe()
}, [])
```

## Non-Pipeline Patterns

Don't document these as UI pipelines:

| Pattern | Why Not |
|---------|---------|
| Pure display | No state change |
| Styling logic | Visual only |
| Route guards | Access control |
| Error boundaries | Error handling |
| Lazy loading | Performance |

## UI Pipeline Naming Convention

```
U{N}: {Noun}-to-{Action}

U1: Chat-to-Edit
U2: Chat-to-Generate
U3: Selection-to-Context
U4: Modal-to-Create
U5: Drag-to-Reorder
```

## Minimum Documentation

Each UI pipeline needs at minimum:
1. ID (U1, U2, etc.)
2. Name (descriptive)
3. Trigger (user action)
4. Context required (what state is needed)
5. Outcome (what user sees)
6. Key files (main components)

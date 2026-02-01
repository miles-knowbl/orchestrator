# UI Pipeline Template

Standard format for documenting a UI pipeline.

## Full Template

```markdown
### U{N}: {Pipeline Name}

**Trigger:** {User action that starts this pipeline}
**Context Required:** {State that must exist for this to work}

**Steps:**
1. {User action} (`{component}:{line}`)
2. {State change} (`{file}:{line}`)
3. {API call if any} (`{file}:{line}`)
4. {Response handling} (`{file}:{line}`)
5. {UI update} (`{component}:{line}`)

**Outcome:**
- {What user sees}
- {What state changed}

**Key Files:**
- `{primary component}`
- `{context/hook file}`
- `{handler file}`

**Feedback Points:**
- Loading: {how loading is shown}
- Success: {how success is shown}
- Error: {how error is shown}

**Notes:**
- {Any important context}
```

## Example: Chat-to-Edit

```markdown
### U1: Chat-to-Edit

**Trigger:** User types edit instruction while artifact is open in editor
**Context Required:** artifact_id, artifact title in ChatContext

**Steps:**
1. User opens artifact via sidebar click (`Sidebar.tsx:45`)
2. Canvas.tsx mounts, sets context.artifact_id (`Canvas.tsx:120`)
3. ChatPanel shows "Editing: {title}" badge (`ChatPanel.tsx:34`)
4. User types "make it more casual" and presses Enter
5. ChatInput calls sendMessage() (`ChatInput.tsx:67`)
6. ChatContext initiates SSE stream to /api/chat (`ChatContext.tsx:89`)
7. Agent responds with edit_artifact tool call
8. toolHandlers.edit_artifact invokes Supabase function (`toolHandlers.ts:145`)
9. Function returns { success: true, version: 2, change_summary: "..." }
10. queryClient.invalidateQueries(['artifact', id]) (`toolHandlers.ts:152`)
11. ToolCallBubble renders with change_summary (`ToolCallBubble.tsx:23`)
12. Artifact component re-fetches and re-renders

**Outcome:**
- Artifact content updated with edit
- Version incremented (1 → 2)
- Change summary shown in chat bubble
- Editor shows new content without refresh

**Key Files:**
- `components/chat/ChatContext.tsx` — State management
- `lib/toolHandlers.ts` — Tool execution
- `components/artifacts/Canvas.tsx` — Editor mount
- `components/chat/ToolCallBubble.tsx` — Result display

**Feedback Points:**
- Loading: Typing indicator in chat, spinner in bubble
- Success: Green checkmark, change summary displayed
- Error: Red error bubble with message

**Notes:**
- Edit requires artifact to be open (context.artifact_id set)
- SSE stream may timeout after 30s
- Version conflict possible if concurrent edits
```

## Minimal Template

For quick documentation:

```markdown
### U{N}: {Name}

**Trigger:** {User action}
**Context:** {Required state}
**Outcome:** {What happens}
**Entry:** `{main component}`
```

## Step Documentation

Each step should include:
- Actor (User, Component, Context)
- Action (opens, clicks, calls, renders)
- Target (artifact, message, modal)
- Location (Component:line)

**Good:**
```
5. ChatInput calls sendMessage() (`ChatInput.tsx:67`)
```

**Bad:**
```
5. Message sent
```

## Context Requirements

Document what state must exist:

**Good:**
```
**Context Required:**
- artifact_id must be set in ChatContext
- User must be authenticated
- Artifact must not be archived
```

**Bad:**
```
**Context Required:** Some state
```

## Feedback Points

Document how the user knows what's happening:

| State | Example |
|-------|---------|
| Loading | Spinner, skeleton, typing indicator |
| Success | Toast, checkmark, updated content |
| Error | Error message, red highlight, retry button |

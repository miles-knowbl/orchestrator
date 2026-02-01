---
name: ui-pipeline-discovery
description: "Identify client-side UI pipelines (U-series) in the codebase. Discovers interaction flows involving chat, tool handlers, context synchronization, and real-time updates. Foundation for UI-specific failure mode analysis."
phase: INIT
category: core
version: "1.0.0"
depends_on: [requirements]
tags: [audit, pipeline, discovery, ui, frontend, interaction]
---

# UI Pipeline Discovery

Identify client-side UI pipelines (U-series).

## When to Use

- **Starting an audit** — Runs in INIT phase to map UI flows
- **Understanding user interactions** — Document how users interact with the system
- **Preparing for UI failure mode analysis** — Identify what can break in the UI
- When you say: "find the UI flows", "map the frontend", "what interactions exist?"

## Reference Requirements

**MUST read before applying this skill:**

| Reference | Why Required |
|-----------|--------------|
| `ui-pipeline-identification.md` | How to find UI pipelines in code |
| `ui-pipeline-template.md` | How to document each UI pipeline |

**Read if applicable:**

| Reference | When Needed |
|-----------|-------------|
| `ui-patterns.md` | Recognize common UI interaction patterns |

**Verification:** All major user interaction flows are documented with triggers and outcomes.

## Required Deliverables

| Deliverable | Location | Condition |
|-------------|----------|-----------|
| UI pipeline inventory | `AUDIT-SCOPE.md` | Always (U-series section) |
| State update | `audit-state.json` | Always (ui_pipelines array) |

## Core Concept

UI Pipeline Discovery answers: **"What are the major user interaction flows?"**

A UI pipeline is:
- **Triggered** by user interaction (click, type, gesture)
- **Involves** state changes, API calls, or visual updates
- **Produces** a user-visible outcome

Examples:
- U1: Chat-to-Edit (user describes edit → artifact updated)
- U2: Chat-to-Generate (user requests in chat → new artifact appears)
- U3: Selection-to-Context (user selects sources → context updated)

## UI Pipeline vs Backend Pipeline

| Aspect | Backend (P-series) | UI (U-series) |
|--------|-------------------|---------------|
| Location | Server | Client/Browser |
| Trigger | API call, job | User interaction |
| Focus | Data transformation | User experience |
| Failures | Data, logic, infra | State, feedback, interaction |

## Discovery Process

```
┌─────────────────────────────────────────────────────────────┐
│             UI PIPELINE DISCOVERY PROCESS                   │
│                                                             │
│  1. FIND INTERACTION ENTRY POINTS                           │
│     ├─→ Chat/agent interfaces                              │
│     ├─→ Form submissions                                   │
│     ├─→ Button clicks                                      │
│     └─→ Gesture handlers                                   │
│                                                             │
│  2. TRACE STATE FLOW                                        │
│     ├─→ Context updates                                    │
│     ├─→ API calls triggered                                │
│     ├─→ Response handling                                  │
│     └─→ UI updates                                         │
│                                                             │
│  3. DOCUMENT EACH PIPELINE                                  │
│     ├─→ Trigger (user action)                              │
│     ├─→ Context required                                   │
│     ├─→ Steps (what happens)                               │
│     └─→ Outcome (what user sees)                           │
│                                                             │
│  4. ASSIGN U-SERIES IDS                                     │
│     └─→ U1, U2, U3... in order of discovery                │
└─────────────────────────────────────────────────────────────┘
```

## Where to Look

### Chat/Agent Interfaces
```typescript
// Chat components
components/chat/*.tsx
ChatPanel.tsx
ChatInput.tsx
ChatContext.tsx
```

### Tool Handlers
```typescript
// Tool execution
lib/tools/*.ts
toolHandlers.ts
useToolExecution.ts
```

### Context Providers
```typescript
// State management
context/*.tsx
providers/*.tsx
*Context.tsx
```

### Real-time Subscriptions
```typescript
// Supabase channels, WebSocket, SSE
supabase.channel()
useSubscription()
EventSource
```

### Modal/Form Flows
```typescript
// Modal components
components/modals/*.tsx
*Modal.tsx
*Dialog.tsx
```

## UI Pipeline Documentation Format

```markdown
### U1: Chat-to-Edit

**Trigger:** User types edit instruction in chat while artifact is open
**Context Required:** artifact_id must be set in ChatContext

**Steps:**
1. User opens artifact in artifact-editor view
2. Canvas.tsx sets context.artifact_id (`Canvas.tsx:120-122`)
3. ChatPanel displays "Editing: [artifact title]"
4. User types edit instruction and submits
5. ChatContext.sendMessage() initiates SSE stream (`ChatContext.tsx:89`)
6. Agent invokes edit_artifact tool
7. toolHandlers.ts:edit_artifact calls Supabase function (`toolHandlers.ts:145`)
8. Function returns { success, version, change_summary }
9. React Query cache invalidated (`hooks/useArtifact.ts:34`)
10. ToolCallBubble displays change_summary
11. Artifact re-renders with new content

**Outcome:**
- Artifact content updated
- Version incremented
- Change summary displayed in chat
- UI reflects new content

**Key Files:**
- `components/chat/ChatContext.tsx`
- `lib/toolHandlers.ts`
- `components/artifacts/Canvas.tsx`
```

## Output Format

### In AUDIT-SCOPE.md

```markdown
## UI Pipelines (U-series)

| ID | Name | Trigger | Outcome |
|----|------|---------|---------|
| U1 | Chat-to-Edit | Edit instruction in chat | Artifact updated |
| U2 | Chat-to-Generate | Generate request in chat | New artifact created |
| U3 | Selection-to-Context | Source selection | Context updated |

### U1: Chat-to-Edit
[detailed documentation]

### U2: Chat-to-Generate
[detailed documentation]
```

### In audit-state.json

```json
{
  "ui_pipelines": [
    {
      "id": "U1",
      "name": "Chat-to-Edit",
      "trigger": "Edit instruction in chat while artifact open",
      "context_required": ["artifact_id"],
      "outcome": "Artifact updated, change summary shown",
      "key_files": ["ChatContext.tsx", "toolHandlers.ts"],
      "step_count": 11
    }
  ]
}
```

## Common UI Pipeline Patterns

| Pattern | Example | Key Components |
|---------|---------|----------------|
| Chat-to-Action | "Generate a tweet" | Chat → Tool → Result |
| Selection-to-Context | Click sources | List → Context → Sidebar |
| Modal Flow | Create new source | Button → Modal → Form → Submit |
| Inline Edit | Edit title | Click → Input → Save |
| Real-time Sync | New message appears | Subscription → State → Render |
| Drag-and-Drop | Reorder items | Drag → Drop → Reorder → Save |

## Discovery Checklist

- [ ] Chat/agent interaction flows mapped
- [ ] Tool handler flows documented
- [ ] Context provider flows traced
- [ ] Modal/form flows identified
- [ ] Real-time subscription flows documented
- [ ] Each pipeline has trigger, steps, outcome
- [ ] U-series IDs assigned consistently

## Validation

Before completing, verify:

- [ ] All major user interactions are documented
- [ ] Each pipeline has a unique U-series ID
- [ ] Triggers are user-observable actions
- [ ] Context requirements are specified
- [ ] Outcomes are user-visible results
- [ ] Key files are identified for each pipeline

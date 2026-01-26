---
name: conversation-state-management
description: >-
  Implement flexible conversation state handling supporting both stateful and
  stateless interaction patterns.
version: 1.0.0
phase: IMPLEMENT
category: custom
---
# Conversation State Management

## Overview
Implement flexible state management for multi-turn conversations with both server-side and client-side options.

## Stateful Pattern
Server maintains conversation context automatically:

```python
# First interaction
interaction1 = client.interactions.create(
    model="model-name",
    input="Hi, my name is Phil."
)

# Continue conversation using previous interaction ID
interaction2 = client.interactions.create(
    model="model-name",
    input="What is my name?",
    previous_interaction_id=interaction1.id
)
```

## Stateless Pattern
Client manages conversation history:

```python
conversation_history = [
    {"role": "user", "content": "Initial message"}
]

# First turn
response = client.interactions.create(
    model="model-name",
    input=conversation_history
)

# Update history and continue
conversation_history.append({"role": "model", "content": response.outputs})
conversation_history.append({"role": "user", "content": "Follow-up message"})
```

## State Retrieval
```python
# Retrieve previous interactions
previous = client.interactions.get("interaction_id")
```

## Best Practices
- Use stateful for simple applications
- Use stateless for custom logic or distributed systems
- Implement proper cleanup for stored interactions
- Consider data retention policies

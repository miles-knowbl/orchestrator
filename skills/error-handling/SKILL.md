---
name: error-handling
description: >-
  Implements robust error handling strategies for applications with proper
  exception management and recovery mechanisms.
version: 1.0.0
phase: IMPLEMENT
category: custom
---
# Error Handling

## Async Operations
- Always wrap async operations in try-catch blocks
- Handle both Promise rejections and thrown exceptions
- Use proper error propagation patterns

## Custom Error Classes
- Create domain-specific error classes that extend base Error
- Include relevant context and error codes
- Provide meaningful error messages for debugging

## Error Recovery Strategy
- **Fail Fast**: Detect and report errors immediately when they occur
- **Graceful Recovery**: Implement fallback mechanisms where appropriate
- **Error Boundaries**: Isolate error impacts to prevent system-wide failures

## Implementation Pattern
```javascript
class DomainError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = this.constructor.name;
  }
}

async function handleOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    if (error instanceof DomainError) {
      // Handle domain-specific errors
      throw error;
    }
    // Transform unknown errors
    throw new DomainError('Operation failed', 'OP_FAILED', { originalError: error });
  }
}
```

## Best Practices
- Log errors with sufficient context for debugging
- Don't swallow errors silently
- Provide user-friendly error messages
- Implement proper error monitoring and alerting

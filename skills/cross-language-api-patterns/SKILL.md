---
name: cross-language-api-patterns
description: >-
  Create consistent API integration patterns across multiple programming
  languages while respecting language-specific idioms.
version: 1.0.0
phase: SCAFFOLD
category: custom
---
# Cross-Language API Patterns

## Overview
Develop consistent API integration approaches across different programming languages while maintaining language-specific best practices.

## Universal Patterns

### 1. Client Initialization
- **Python**: `client = genai.Client()`
- **JavaScript**: `const ai = new GoogleGenAI({})`
- **Go**: `client, err := genai.NewClient(ctx, nil)`
- **Java**: `try (Client client = new Client())`

### 2. Error Handling Approaches
- **Python**: Exception handling with try/catch
- **JavaScript**: Promise-based with async/await
- **Go**: Explicit error return values
- **Java**: Try-with-resources for cleanup

### 3. File Operations
- **Python**: PIL/Pillow for image handling
- **JavaScript**: fs module with Buffer operations
- **Go**: os package with explicit byte handling
- **Java**: NIO Files API for modern file operations

### 4. Response Processing
- Iterate through response parts consistently
- Handle multiple content types (text, binary)
- Apply same validation logic across languages
- Maintain similar output file naming

## Language-Specific Adaptations

### Python
- Use context managers for resource handling
- Leverage PIL for image processing
- Apply Pythonic naming conventions

### JavaScript
- Embrace async/await patterns
- Use Buffer for binary data
- Follow npm package conventions

### Go
- Handle errors explicitly
- Use context for cancellation
- Follow Go naming conventions

### Java
- Use try-with-resources for cleanup
- Apply Optional patterns for null safety
- Follow Java naming conventions

## Consistency Guidelines
- Maintain similar function/method names
- Use equivalent data structures
- Apply consistent error messaging
- Standardize configuration approaches

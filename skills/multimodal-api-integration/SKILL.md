---
name: multimodal-api-integration
description: >-
  Integrate APIs that handle multiple input/output types including text, images,
  and structured data with proper response parsing.
version: 1.0.0
phase: IMPLEMENT
category: custom
---
# Multimodal API Integration

## Overview
Integrate APIs that accept and return multiple data modalities (text, images, audio, etc.) with proper handling of different content types.

## Implementation Steps

### 1. Client Setup
- Initialize API client with proper authentication
- Configure for multimodal capabilities
- Set up error handling for connection issues

### 2. Content Preparation
- Support multiple input types (text prompts, image files, base64 data)
- Handle file reading and encoding (base64 for images)
- Structure content arrays with proper MIME types

### 3. API Request
- Send requests with mixed content types
- Specify response modalities (TEXT, IMAGE, etc.)
- Handle async operations appropriately

### 4. Response Processing
- Iterate through response parts
- Handle different output types (text, inline data, images)
- Convert and save binary data (images) to files
- Extract and display text responses

### 5. Error Handling
- Validate file paths and permissions
- Handle API rate limits and authentication errors
- Manage malformed responses gracefully

## Best Practices
- Always check content rights before processing
- Implement proper file I/O error handling
- Use appropriate data encoding (base64 for binary)
- Structure requests with clear content boundaries

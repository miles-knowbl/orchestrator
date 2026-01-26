---
name: binary-data-handling
description: >-
  Handle binary data encoding, decoding, and file operations for API responses
  containing images or other binary content.
version: 1.0.0
phase: IMPLEMENT
category: custom
---
# Binary Data Handling

## Overview
Properly handle binary data in API responses, including encoding, decoding, and file operations.

## Core Operations

### 1. Data Encoding
- Convert binary files to base64 for API transmission
- Handle different file formats (PNG, JPEG, etc.)
- Manage encoding errors and corruption

```python
# Example encoding
with open('image.png', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')
```

### 2. Data Decoding
- Parse base64 strings from API responses
- Convert back to binary format
- Validate data integrity

```python
# Example decoding
image_bytes = base64.b64decode(base64_string)
with open('output.png', 'wb') as f:
    f.write(image_bytes)
```

### 3. File Operations
- Create output directories if needed
- Handle file naming conflicts
- Set appropriate file permissions (e.g., 0644)
- Validate write permissions

### 4. MIME Type Management
- Specify correct MIME types for uploads
- Validate content types in responses
- Handle type mismatches gracefully

### 5. Memory Management
- Handle large binary files efficiently
- Stream data when possible
- Clean up temporary files
- Monitor memory usage for large operations

## Error Handling
- Catch and handle base64 decode errors
- Validate file system permissions
- Handle disk space limitations
- Manage network timeout issues

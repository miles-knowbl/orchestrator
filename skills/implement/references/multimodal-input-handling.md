# Multimodal Input Handling

## Overview
Design APIs that seamlessly handle multiple input modalities through a unified interface.

## Input Type Flexibility
Support multiple input formats:

```python
# String input
interaction = client.interactions.create(
    model="model-name",
    input="Simple text prompt"
)

# Content object input
interaction = client.interactions.create(
    model="model-name",
    input=[
        {"type": "text", "content": "Analyze this image:"},
        {"type": "image", "content": image_data}
    ]
)

# Conversation turns input
interaction = client.interactions.create(
    model="model-name",
    input=[
        {"role": "user", "content": "Message 1"},
        {"role": "model", "content": "Response 1"},
        {"role": "user", "content": "Message 2"}
    ]
)
```

## Implementation Strategy
1. **Type Detection**: Automatically detect input format
2. **Normalization**: Convert all inputs to internal format
3. **Validation**: Ensure input compatibility with model
4. **Processing**: Handle each modality appropriately

## Supported Modalities
- Text (string, markdown, structured)
- Images (base64, URLs, binary)
- Audio (various formats)
- Video (streaming, files)
- Documents (PDFs, structured data)

## Error Handling
- Validate input format before processing
- Provide clear error messages for unsupported types
- Graceful fallbacks when possible

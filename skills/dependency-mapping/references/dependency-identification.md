# Dependency Identification

How to find cross-pipeline dependencies.

## Analysis Approach

### Step 1: List Pipeline Inputs/Outputs

For each pipeline, document:

**P1: Source Ingestion**
- Inputs: file, user_id
- Outputs: source record, source_schema, embeddings

**P2: Content Generation**
- Inputs: source_ids, prompt, artifact_type
- Outputs: artifact record, content

**U1: Chat-to-Edit**
- Inputs: artifact_id, edit_instruction
- Outputs: updated artifact, change_summary

### Step 2: Find Overlaps

Look for where one pipeline's output is another's input:

```
P1.outputs.source_schema ──► P2.inputs.source_schema
P2.outputs.artifact_id ──► U1.inputs.artifact_id
```

### Step 3: Identify Shared State

Find tables/state accessed by multiple pipelines:

```
Table: artifacts
  - P2: creates
  - U1: updates
  - P3: reads for publish
  = Shared state, potential conflicts
```

### Step 4: Map Timing Requirements

Identify what must exist before a pipeline runs:

```
P2 requires:
  - source exists (from P1)
  - source_schema populated (from P1)
  - user authenticated

U1 requires:
  - artifact exists (from P2)
  - artifact_id in context
  - SSE stream available
```

## Code Patterns to Search

### Data Dependencies
```typescript
// One pipeline reading another's output
const sourceSchema = await getSourceSchema(sourceId);
const artifact = await getArtifact(artifactId);
```

### Shared State Access
```typescript
// Multiple writes to same entity
await updateArtifact(id, { content });  // In P2
await updateArtifact(id, { content });  // In U1
```

### Event Publishing
```typescript
// Events that trigger other pipelines
channel.send('artifact_created', { id });
eventEmitter.emit('publish_complete', { postId });
```

### Context Reading
```typescript
// UI pipelines reading shared context
const { artifactId } = useContext(ChatContext);
const { selectedSources } = useContext(SelectionContext);
```

## Dependency Classification

### Direct Dependencies
Pipeline B cannot run without Pipeline A's output.

**Indicator:** B throws error if A's output missing.

### Soft Dependencies
Pipeline B works without A's output but with degraded behavior.

**Indicator:** B has fallback logic for missing data.

### Timing Dependencies
Pipeline B must wait for A to complete.

**Indicator:** B checks status or waits for event.

### Inverse Dependencies
Pipeline B cleans up after A fails.

**Indicator:** B is error handler or compensation flow.

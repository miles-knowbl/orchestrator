# 18-Section Template

Detailed guidance for each section of a compiled FeatureSpec.

## Section 1: Header

```markdown
# [Feature Name] FeatureSpec v1.1

| Property | Value |
|----------|-------|
| **Spec ID** | SPEC-### |
| **Version** | 1.1 (Compiled) |
| **Status** | Ready for Implementation |
| **Target Project** | [Project Name] |
| **Dependencies** | [List of dependent specs/systems] |
| **Part Of** | [System Name] (X of Y) |
| **Compilation Date** | [Date] |
| **Compilation** | Pass 1 ✅ | Pass 2 ✅ | Pass 3 ✅ | Pass 4 ✅ |
```

**Required elements:**
- Spec ID (SPEC-001, SPEC-002, etc.)
- Version (v1.0 = original, v1.1+ = compiled)
- Dependencies on other specs
- Pass indicators showing compilation stages

---

## Section 2: Feature Overview

```markdown
## Feature Overview

**What this feature does:** [Comprehensive description of functionality]

**Core value proposition:** [Business value and user benefit]

**Key user stories:**
1. As a [user type], I can [action] so that [benefit]
2. As a [user type], I can [action] so that [benefit]
3. As the system, I [automated action] so that [outcome]
```

**Include:**
- Clear problem statement
- Business justification
- 5-10 user stories covering main scenarios
- System-initiated actions (automations)

---

## Section 3: Architecture Overview

```markdown
## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    [FEATURE NAME] ARCHITECTURE v1.X                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  UI LAYER                                                                   │
│  ────────                                                                   │
│  [Component boxes with responsibilities]                                    │
│                                                                             │
│  SERVICE LAYER                                                              │
│  ─────────────                                                              │
│  [Hook/service boxes with data flow arrows]                                 │
│                                                                             │
│  DATA LAYER                                                                 │
│  ──────────                                                                 │
│  [Entity boxes with relationships]                                          │
│                                                                             │
│  EXECUTION LAYER (if applicable)                                            │
│  ───────────────                                                            │
│  [Cron jobs, background tasks, edge functions]                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
```

**Include:**
- ASCII diagram showing all layers
- Data flow arrows
- Component responsibilities
- State machine diagrams (if applicable)

---

## Section 4: Feedback Timing Requirements

```markdown
## Feedback Timing Requirements

### Timing Bands

| Band | Target | Use For |
|------|--------|---------|
| 0ms | At input | Haptic, press state |
| <50ms | Instant | Optimistic updates |
| <150ms | Animated | Transitions |
| <300ms | Spring | Physics-based settle |
| Background | Never blocks | Network calls |

### Interaction Patterns

| Action | 0ms | <50ms | <150ms | <300ms |
|--------|-----|-------|--------|--------|
| [Action 1] | [Feedback] | [Feedback] | — | — |
| [Action 2] | [Feedback] | [Feedback] | [Feedback] | — |
```

**Include:**
- Timing bands for this feature
- Haptic patterns
- Animation specifications
- Optimistic UI strategies

---

## Section 5: Entities

```markdown
## Entities

### EXISTING Entities (Referenced)

```yaml
entity: [EntityName]  # EXISTS
table_name: [table_name]
relevant_attributes:
  - id: uuid (PK)
  - [other relevant fields]
```

### NEW Entities

```yaml
entity: [EntityName]  # NEW
description: [Purpose of this entity]
table_name: [table_name]
attributes:
  # ─── Identity ───
  - id: uuid (PK) DEFAULT gen_random_uuid()
  - business_id: uuid (→ businesses) NOT NULL ON DELETE CASCADE
  
  # ─── Core Fields ───
  - [field]: [type] [constraints]
  
  # ─── Soft Delete ───
  - deleted_at: timestamptz?
  - deleted_by: uuid? (→ profiles)
  
  # ─── Audit ───
  - created_by: uuid? (→ profiles)
  - created_at: timestamptz DEFAULT NOW()
  - updated_at: timestamptz DEFAULT NOW()

indexes:
  - idx_[name]: ([columns]) WHERE [condition]

constraints:
  - CHECK: [constraint]
  - UNIQUE: [constraint]
```
```

**Include:**
- EXISTING entities with only relevant attributes
- NEW entities with full schema
- All indexes
- All constraints
- Foreign key relationships

---

## Section 6: Capabilities

```markdown
## Capabilities

### CAP-001: [Capability Name]

```yaml
capability: [capability_name]
id: CAP-001
description: [What it does]
actor: [Who triggers it]
trigger: [What triggers it]

input:
  [field]: [type]

output:
  [field]: [type]

validation:
  - [Rule 1]
  - [Rule 2]

side_effects:
  - [Effect 1]
  - [Effect 2]

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms
    server_confirm: background
  haptic:
    on_action: light_impact
    on_error: error_pattern
  visual:
    pending: [Description]
    success: [Description]
    error: [Description]
  optimistic:
    strategy: [How to show success before confirm]
    rollback: [How to revert on failure]

error_handling:
  [ERROR_CODE]: "[User message]"
```
```

**Every capability must have:**
- Unique ID (CAP-###)
- Complete input/output specification
- Validation rules
- Side effects
- Full feedback block
- Error handling with user messages

---

## Section 7: Service Layer

```markdown
## Service Layer

### use[FeatureName].ts

```typescript
// Full implementation - no placeholders
export function use[FeatureName]() {
  // Query with proper error handling
  const query = useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      // Complete implementation
    },
  });

  // Mutation with optimistic UI
  const mutation = useMutation({
    mutationFn: async (input: InputType) => {
      // Complete implementation
    },
    onMutate: async (input) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => /* update */);
      return { previous };
    },
    onError: (err, _, context) => {
      // Rollback
      queryClient.setQueryData(queryKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { query, mutation };
}
```
```

**Requirements:**
- Full TypeScript types
- Complete error handling
- Optimistic UI pattern
- No TODOs or placeholders

---

## Section 8: UI Components

```markdown
## UI Components

### [ComponentName].tsx

```tsx
interface [ComponentName]Props {
  // Full prop types
}

export function [ComponentName]({ props }: [ComponentName]Props) {
  // State
  const [state, setState] = useState();
  
  // Hooks
  const { query, mutation } = use[Feature]();
  
  // Loading state
  if (query.isLoading) {
    return <Skeleton />;
  }
  
  // Error state
  if (query.isError) {
    return <ErrorState error={query.error} />;
  }
  
  // Empty state
  if (!query.data?.length) {
    return <EmptyState />;
  }
  
  // Main render
  return (
    // Complete JSX
  );
}
```
```

**Requirements:**
- All state variations (loading, error, empty, populated)
- Full TypeScript props
- Responsive design
- Accessibility attributes
- Complete animations

---

## Section 9: Database Migrations

```markdown
## Database Migrations

### Migration: [YYYYMMDD]_create_[feature]_tables.sql

```sql
-- Create tables
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- All columns with types and constraints
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_[name] ON [table]([columns]) WHERE [condition];

-- Triggers
CREATE TRIGGER [trigger_name]
  BEFORE UPDATE ON [table]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
```
```

**Requirements:**
- Complete CREATE TABLE statements
- All indexes
- All triggers
- RLS enablement

---

## Section 10: API Layer

```markdown
## API Layer

### [function-name]/index.ts

```typescript
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication
    const authHeader = req.headers.get('Authorization');
    // ... validation

    // Business logic
    const result = await processRequest(body);

    // Structured logging
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'request_processed',
      // ... context
    }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Error handling with logging
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
```
```

**Requirements:**
- Full implementation
- Authentication handling
- Structured logging
- Error handling
- CORS handling

---

## Section 11: Authorization

```markdown
## Authorization

### RLS Policies

```sql
-- SELECT: Business users (respecting soft delete)
CREATE POLICY "[table]_select" ON [table] FOR SELECT
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND deleted_at IS NULL
);

-- INSERT: Role-restricted
CREATE POLICY "[table]_insert" ON [table] FOR INSERT
WITH CHECK (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- UPDATE: Author or elevated role
CREATE POLICY "[table]_update" ON [table] FOR UPDATE
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND deleted_at IS NULL
  AND (
    created_by = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
);

-- DELETE: Admin/owner only
CREATE POLICY "[table]_delete" ON [table] FOR DELETE
USING (
  business_id IN (SELECT business_id FROM profiles WHERE id = auth.uid())
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'owner'
  )
);
```
```

**Requirements:**
- Granular policies (not "FOR ALL")
- Soft delete filtering
- Role-based access
- Business isolation

---

## Section 12: Observability

```markdown
## Observability

### Metrics

| Metric | Type | Description |
|--------|------|-------------|
| [feature]_created_total | Counter | Total items created |
| [feature]_operation_duration_ms | Histogram | Operation latency |
| [feature]_errors_total | Counter | Error count by type |

### Log Events

| Event | Level | Context |
|-------|-------|---------|
| [feature]_created | info | id, user_id, business_id |
| [feature]_failed | error | error, context |

### Alerts

```yaml
alerts:
  - name: [Feature]HighErrorRate
    condition: |
      rate([feature]_errors_total[5m]) > 0.1
    severity: warning
    runbook: |
      1. Check function logs
      2. Review recent deployments
      3. Check database connectivity
```
```

---

## Section 13: Feature Flags

```markdown
## Feature Flags

| Flag | Description | Default | Scope |
|------|-------------|---------|-------|
| [FEATURE]_ENABLED | Master kill switch | true | global |
| [FEATURE]_NEW_UI | New UI variant | false | business |
| [FEATURE]_BETA | Beta features | false | user |
```

---

## Section 14: Test Scenarios

```markdown
## Test Scenarios

### Security Tests
1. Unauthorized user cannot access [resource]
2. Cross-tenant data isolation verified
3. Input sanitization prevents injection

### Concurrency Tests
1. Simultaneous creates don't cause duplicates
2. Optimistic locking prevents lost updates
3. Distributed lock prevents race conditions

### Failure Mode Tests
1. Database timeout handled gracefully
2. Partial failure rolls back correctly
3. Network error shows user-friendly message

### Load Tests
1. System handles 1000 concurrent operations
2. Response time < 200ms at p95 under load
3. No memory leaks over extended operation
```

---

## Section 15: Verification Checklist

```markdown
## Verification Checklist

### Pre-Implementation
- [ ] Schema review completed
- [ ] RLS policies reviewed
- [ ] API contracts agreed

### Implementation
- [ ] All entities created
- [ ] All hooks implemented
- [ ] All components built
- [ ] All tests passing

### Pre-Release
- [ ] Security audit passed
- [ ] Performance validated
- [ ] Feature flags configured
- [ ] Monitoring in place
```

---

## Section 16: Implementation Priority

```markdown
## Implementation Priority

### Phase 1: Foundation (Day 1-2)
1. Database migrations
2. Core entities
3. Basic CRUD hooks

### Phase 2: Features (Day 3-5)
4. Full capability implementation
5. UI components
6. API endpoints

### Phase 3: Polish (Day 6-7)
7. Optimistic UI
8. Error handling
9. Observability
10. Testing
```

---

## Section 17: Files to Create/Modify

```markdown
## Files to Create/Modify

### New Files
```
src/
├── hooks/
│   └── use[Feature].ts
├── components/
│   └── [Feature]/
│       ├── [Component1].tsx
│       └── [Component2].tsx
└── types/
    └── [feature].ts

supabase/
├── migrations/
│   └── [timestamp]_create_[feature].sql
└── functions/
    └── [function-name]/
        └── index.ts
```

### Modified Files
- `src/types/database.ts` - Add new table types
- `src/lib/constants.ts` - Add feature flags
```

---

## Section 18: Compilation Summary

```markdown
## Compilation Summary

| Pass | Focus | Key Additions |
|------|-------|---------------|
| 1 | Structure | 18 sections, entity schemas, capability specs |
| 2 | Feedback | Timing bands, haptics, optimistic UI |
| 3 | Production | Security, concurrency, observability |
| 4 | Process Map | Entity registry, coverage update |

### Senior Engineer Audit Results

| Category | Issues Found | Issues Resolved | Status |
|----------|--------------|-----------------|--------|
| Security | X | X | ✅ |
| Concurrency | X | X | ✅ |
| Reliability | X | X | ✅ |
| Scalability | X | X | ✅ |
| **Total** | **Y** | **Y** | ✅ |

### Critical Fixes Applied

| # | Category | Issue | Resolution |
|---|----------|-------|------------|
| 1 | [Category] | [Issue description] | [How it was fixed] |
```

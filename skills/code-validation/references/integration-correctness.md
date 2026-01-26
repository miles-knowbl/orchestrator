# Integration Correctness

Verifying code works correctly with the rest of the system.

## Why This Matters

Code doesn't exist in isolation. It calls other services, gets called by others, shares data, publishes events. Integration bugs are the most common production issues—code works in isolation but fails when connected.

## Integration Points

### 1. API Contracts (Calling Others)

**Does your code call external APIs correctly?**

| Check | What Could Go Wrong |
|-------|---------------------|
| Request format | Missing fields, wrong types, wrong encoding |
| Authentication | Wrong credentials, expired tokens |
| Headers | Missing Content-Type, wrong Accept header |
| URL construction | Wrong path, wrong query params |
| Error handling | Not handling all error codes |

**Verification:**
```markdown
For each external API call:
- [ ] Request matches API documentation
- [ ] All required fields present
- [ ] Types match expected (string vs number)
- [ ] Authentication method correct
- [ ] Error codes handled (4xx, 5xx)
- [ ] Rate limits respected
```

### 2. API Contracts (Being Called)

**Does your API behave as documented?**

| Check | What Could Go Wrong |
|-------|---------------------|
| Response format | Missing fields, wrong types |
| Status codes | Wrong code for situation |
| Error format | Inconsistent error responses |
| Pagination | Wrong cursor format, off-by-one |
| Versioning | Breaking changes without version bump |

**Verification:**
```markdown
For each endpoint:
- [ ] Response matches OpenAPI/schema
- [ ] Status codes match REST conventions
- [ ] Error responses are consistent
- [ ] Backward compatible with existing clients
- [ ] Contract test exists (if critical)
```

### 3. Data Contracts

**Does your code read/write data correctly?**

| Check | What Could Go Wrong |
|-------|---------------------|
| Schema match | Writing fields that don't exist |
| Type coercion | String IDs vs numeric IDs |
| Nullability | Null where required expected |
| Encoding | UTF-8 vs Latin-1, timezone handling |
| Constraints | Unique violations, FK violations |

**Verification:**
```markdown
For each data store interaction:
- [ ] Schema matches model
- [ ] Types match database column types
- [ ] Required fields always provided
- [ ] Unique constraints respected
- [ ] Foreign keys valid
- [ ] Indexes exist for query patterns
```

### 4. Event/Message Contracts

**Do your events match what consumers expect?**

| Check | What Could Go Wrong |
|-------|---------------------|
| Topic/queue name | Wrong destination |
| Message format | Schema mismatch |
| Ordering | Events out of expected order |
| Idempotency | Consumer can't handle duplicates |
| Versioning | Breaking schema change |

**Verification:**
```markdown
For each event published:
- [ ] Topic/queue correct
- [ ] Schema matches consumer expectations
- [ ] Includes all required fields
- [ ] Version field if schema can change
- [ ] Consumers can handle duplicates

For each event consumed:
- [ ] Handles all expected event types
- [ ] Validates event schema
- [ ] Idempotent processing
- [ ] Handles out-of-order events
```

### 5. State Interactions

**How does this code interact with shared state?**

| Check | What Could Go Wrong |
|-------|---------------------|
| Race conditions | Concurrent modification |
| Stale reads | Cache invalidation issues |
| Lock contention | Deadlocks, timeouts |
| Transaction scope | Too broad, too narrow |
| Isolation level | Read anomalies |

**Verification:**
```markdown
For shared state:
- [ ] Concurrent access is safe
- [ ] Transactions have appropriate scope
- [ ] Cache invalidation is correct
- [ ] Optimistic locking if needed
- [ ] No deadlock potential
```

## Breaking Change Detection

### What Constitutes a Breaking Change?

**API Breaking Changes:**
- Removing an endpoint
- Removing a field from response
- Adding a required field to request
- Changing a field's type
- Changing URL structure
- Changing authentication method

**Data Breaking Changes:**
- Removing a column
- Changing column type
- Adding NOT NULL without default
- Changing enum values

**Event Breaking Changes:**
- Removing a field
- Changing field type
- Changing topic/routing

### Safe Changes (Usually)

- Adding optional fields to request
- Adding fields to response
- Adding new endpoints
- Adding new event types
- Adding database columns with defaults

### Compatibility Matrix

When old and new versions must coexist:

```
                    New Schema
                 Can Read | Can Write
Old Code           ?           ?
New Code           ✓           ✓
```

Both must be true for safe deployment.

## Contract Testing

### Types of Contract Tests

| Type | What It Tests | When to Use |
|------|---------------|-------------|
| **Consumer-driven** | Consumer's expectations against provider | Critical dependencies |
| **Schema validation** | Response matches schema | All APIs |
| **Smoke tests** | Basic connectivity and response | All integrations |

### Example Contract Test

```javascript
// Consumer-driven contract test
describe('User Service Contract', () => {
  it('returns user with expected fields', async () => {
    const user = await userService.getUser(123);

    // Contract: these fields must exist with these types
    expect(user).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      createdAt: expect.any(String),  // ISO date
    });

    // Contract: these fields must NOT exist (privacy)
    expect(user).not.toHaveProperty('passwordHash');
    expect(user).not.toHaveProperty('ssn');
  });
});
```

## Integration Verification Questions

For each integration point:

```markdown
### [Integration Point Name]

**Contract:**
- What is the agreed interface?
- Is it documented? Where?
- Is there a contract test?

**Direction:**
- Are we calling or being called?
- What's on the other side?

**Changes:**
- Did we change the contract?
- Is the change backward compatible?
- Do consumers need to update?

**Error handling:**
- What errors can the other side return?
- Do we handle all of them?
- What do we return on failure?

**Performance:**
- What's the expected latency?
- What's the expected throughput?
- Any rate limits?
```

## Output Format

When documenting integration correctness:

```markdown
## Integration Correctness Assessment

### External APIs Called

**Stripe API:**
- Contract: ✅ Request matches Stripe docs
- Auth: ✅ API key in header
- Errors: ⚠️ Only handling 402, need to handle 429
- Rate limits: ❌ Not implemented

**User Service:**
- Contract: ✅ Request/response match schema
- Auth: ✅ Internal auth token
- Errors: ✅ All codes handled

### APIs Exposed

**POST /orders:**
- Contract: ✅ Matches OpenAPI spec
- Backward compat: ✅ No breaking changes
- Error format: ✅ Consistent with other endpoints

### Events Published

**order.created:**
- Schema: ✅ Matches documented schema
- Topic: ✅ Correct topic
- Versioning: ⚠️ No version field, add before schema changes

### Data Contracts

**orders table:**
- Schema match: ✅
- Types: ✅
- Constraints: ✅
- Migration: N/A (no schema changes)

### Blockers

1. Need to handle Stripe rate limit (429) responses

### Recommendations

1. Add version field to events
2. Add contract test for User Service integration
```

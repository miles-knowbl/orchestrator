# Reproduction Techniques

How to make bugs happen reliably.

## Why This Matters

You can't fix what you can't reproduce. Intermittent bugs that "just happen sometimes" are impossible to debug systematically. Getting reliable reproduction is often the hardest and most important part of debugging.

## Reproduction Levels

| Level | Description | Debuggability |
|-------|-------------|---------------|
| **On-demand** | Bug happens every time you try | Best |
| **High-frequency** | Bug happens most attempts | Good |
| **Low-frequency** | Bug happens occasionally | Hard |
| **Environment-specific** | Only in certain environments | Medium |
| **One-time** | Happened once, can't recreate | Hardest |

## From Unreliable to Reliable

### Step 1: Gather Information

For an unreliable bug, collect:
- When did it happen? (timestamps)
- What was the user doing?
- What was the system state?
- What were the inputs?
- What were concurrent operations?
- What was different from times it worked?

### Step 2: Identify Variables

List everything that varies:
- Input data
- User/account
- Time of day
- System load
- Concurrent operations
- Environment (browser, OS, config)
- Network conditions
- Database state

### Step 3: Control Variables

Fix variables one by one:
```markdown
Test 1: Original (unreliable)
- Any user, any data, any time
- Result: Sometimes fails

Test 2: Fix the user
- User: testuser@example.com
- Result: Still sometimes fails

Test 3: Fix the data
- User: testuser@example.com
- Data: Order #12345
- Result: Always fails! ← Found it
```

### Step 4: Simplify

Once reproducible, remove unnecessary elements:
- Remove unrelated code
- Hardcode values that don't affect bug
- Remove network calls with mocks
- Remove database with fixtures

**Goal:** Minimal reproduction—the smallest code/input that still fails.

## Techniques by Bug Type

### Timing-Dependent Bugs

**Symptoms:** Works sometimes, fails other times.

**Techniques:**
- Add delays to slow down operations
- Use debugger to pause at critical points
- Log timestamps to see ordering
- Increase concurrency to trigger races

```javascript
// Force timing issue to manifest
await sleep(100); // Add delay before critical section
```

### Data-Dependent Bugs

**Symptoms:** Works for some inputs, fails for others.

**Techniques:**
- Compare working vs failing inputs
- Use property-based testing to find edge cases
- Test boundary values
- Test with production data samples

```javascript
// Test with exact failing input
const failingInput = { items: [{ qty: 0 }] }; // Captured from production
processOrder(failingInput);
```

### Environment-Dependent Bugs

**Symptoms:** Works locally, fails in production (or vice versa).

**Techniques:**
- Compare environment configurations
- Use same versions (Node, database, etc.)
- Check environment variables
- Use production data locally
- Test in staging that mirrors production

```bash
# Get production environment
heroku config --app myapp

# Compare to local
diff <(heroku config) <(cat .env)
```

### Load-Dependent Bugs

**Symptoms:** Works at low load, fails at high load.

**Techniques:**
- Use load testing tools (k6, artillery, ab)
- Gradually increase load until failure
- Monitor resources during load test
- Check connection pool behavior

```bash
# Load test with increasing concurrency
ab -n 10000 -c 100 http://localhost:3000/api/endpoint
```

### Memory-Dependent Bugs

**Symptoms:** Works initially, fails after running for a while.

**Techniques:**
- Monitor memory over time
- Reduce available memory
- Run operations in a loop
- Take heap snapshots at intervals

```javascript
// Accelerate memory issues
for (let i = 0; i < 10000; i++) {
  await processRequest(); // Run many times
}
```

## Creating Minimal Reproductions

### The Reduction Process

```
Full Application (10,000 lines)
        ↓ Remove unrelated features
Relevant Module (1,000 lines)
        ↓ Remove unrelated functions
Single File (200 lines)
        ↓ Remove unrelated logic
Minimal Case (20 lines)
```

### Minimal Reproduction Template

```javascript
// Minimal reproduction for: [Bug description]
// Environment: Node 18, PostgreSQL 14

const setup = async () => {
  // Minimal setup required
};

const reproduce = async () => {
  // Exact steps that trigger the bug
};

const expected = "This should happen";
const actual = await reproduce();

console.log('Expected:', expected);
console.log('Actual:', actual);
console.log('Bug reproduced:', actual !== expected);
```

### Sharing Reproductions

Good reproduction reports include:

```markdown
## Reproduction Steps

### Environment
- Node: 18.17.0
- OS: macOS 14.0
- Database: PostgreSQL 14.1

### Setup
1. Clone repository
2. `npm install`
3. Set `DATABASE_URL=...`
4. Run `npm run seed`

### Steps
1. Start server: `npm start`
2. Run: `curl -X POST localhost:3000/api/orders -d '{"userId": 1, "items": []}'`
3. Observe: 500 error with "Cannot read property 'length' of undefined"

### Expected
400 error with "items cannot be empty"

### Frequency
100% reproducible with these steps
```

## When You Can't Reproduce

### Strategies for One-Time Bugs

1. **Log analysis:** Look for clues in logs around the failure
2. **State reconstruction:** Try to recreate the exact state
3. **Hypothesis testing:** Test likely causes even without reproduction
4. **Add logging:** Prepare to catch it next time
5. **Monitoring:** Set up alerts for the symptom

### Improving Logging for Future Reproduction

Add logging that captures:
```javascript
// Before risky operation
logger.info('Starting order processing', {
  orderId: order.id,
  userId: user.id,
  items: order.items.map(i => i.id),
  timestamp: Date.now(),
  requestId: req.id
});

// After failure
logger.error('Order processing failed', {
  orderId: order.id,
  error: error.message,
  stack: error.stack,
  state: JSON.stringify(currentState),
  requestId: req.id
});
```

### When to Give Up (Temporarily)

If you can't reproduce after significant effort:
1. Document everything learned
2. Add monitoring/logging to catch it next time
3. Set a time limit ("revisit if it happens again")
4. Move on, but don't forget

## Output Format

When documenting reproduction:

```markdown
## Reproduction Status

**Bug:** [Description]

**Reproduction Level:** On-demand / High-frequency / Low-frequency / Cannot reproduce

### Reproduction Steps
1. [Step]
2. [Step]
3. [Bug occurs]

### Minimal Code
```javascript
// [Minimal reproduction code]
```

### Key Variables
| Variable | Required Value | Notes |
|----------|---------------|-------|
| User | ID 12345 | Bug only occurs for this user |
| Data | Empty array | Bug is related to empty input handling |

### What Doesn't Affect Reproduction
- Time of day (tested at multiple times)
- Browser (happens in all browsers)
- Server load (happens even under no load)

### Confidence
[High/Medium/Low] - [Why]
```

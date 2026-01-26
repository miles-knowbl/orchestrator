# Scenario Templates

Templates for common integration test scenarios.

## API Integration Scenarios

### Happy Path - Create Resource

```markdown
## Scenario: Create [Resource] - Success

**Type:** API Integration
**Systems:** [Consumer] → [Provider]
**Priority:** High

### Setup
- Valid authentication token exists
- Required dependencies are available

### Steps
1. Send POST request to /[resources]
2. Include valid request body
3. Include Authorization header

### Expected Results
- Response status: 201 Created
- Response body contains created resource
- Resource exists in database
- Any triggered events are published

### Test Code
```javascript
it('creates [resource] successfully', async () => {
  const response = await request(app)
    .post('/[resources]')
    .set('Authorization', `Bearer ${token}`)
    .send({
      field1: 'value1',
      field2: 'value2'
    });
  
  expect(response.status).toBe(201);
  expect(response.body.id).toBeDefined();
  expect(response.body.field1).toBe('value1');
  
  // Verify persistence
  const record = await db.[resources].findById(response.body.id);
  expect(record).toBeDefined();
});
```
```

### Validation Error

```markdown
## Scenario: Create [Resource] - Validation Error

**Type:** API Integration
**Systems:** [Consumer] → [Provider]
**Priority:** High

### Setup
- Valid authentication token exists

### Steps
1. Send POST request with invalid data
2. Missing required field OR invalid format

### Expected Results
- Response status: 400 Bad Request
- Response body contains error details
- No resource created

### Test Code
```javascript
it('rejects invalid [resource] data', async () => {
  const response = await request(app)
    .post('/[resources]')
    .set('Authorization', `Bearer ${token}`)
    .send({
      // Missing required field
      field2: 'value2'
    });
  
  expect(response.status).toBe(400);
  expect(response.body.error).toBeDefined();
  expect(response.body.details).toContain('field1');
});
```
```

### Authentication Required

```markdown
## Scenario: Access [Resource] - No Token

**Type:** API Integration
**Systems:** [Consumer] → [Provider]
**Priority:** High

### Setup
- No authentication token provided

### Steps
1. Send request without Authorization header

### Expected Results
- Response status: 401 Unauthorized
- Response body contains error message

### Test Code
```javascript
it('rejects request without token', async () => {
  const response = await request(app)
    .get('/[resources]/123');
  
  expect(response.status).toBe(401);
  expect(response.body.error).toBe('Authentication required');
});
```
```

### Authorization Denied

```markdown
## Scenario: Access [Resource] - Forbidden

**Type:** API Integration
**Systems:** [Consumer] → [Provider]
**Priority:** High

### Setup
- Valid token exists but lacks permission

### Steps
1. Send request with token lacking required role/permission

### Expected Results
- Response status: 403 Forbidden
- Response body contains error message

### Test Code
```javascript
it('forbids access without required role', async () => {
  const userToken = await getTokenForRole('user'); // not admin
  
  const response = await request(app)
    .delete('/[resources]/123')
    .set('Authorization', `Bearer ${userToken}`);
  
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Insufficient permissions');
});
```
```

### Service Unavailable

```markdown
## Scenario: [Resource] - Dependency Down

**Type:** API Integration
**Systems:** [Service] → [Dependency]
**Priority:** Medium

### Setup
- Dependency service is unavailable

### Steps
1. Send request that requires dependency
2. Dependency times out or connection refused

### Expected Results
- Response status: 503 Service Unavailable
- Response contains meaningful error
- No partial state left

### Test Code
```javascript
it('handles dependency failure gracefully', async () => {
  // Make dependency unavailable
  await dependencyMock.setUnavailable();
  
  const response = await request(app)
    .post('/[resources]')
    .set('Authorization', `Bearer ${token}`)
    .send({ field1: 'value1' });
  
  expect(response.status).toBe(503);
  expect(response.body.error).toContain('temporarily unavailable');
  
  // Verify no partial record created
  const records = await db.[resources].findAll();
  expect(records.length).toBe(0);
});
```
```

## Event Integration Scenarios

### Event Published

```markdown
## Scenario: [Event] Published on [Action]

**Type:** Event Integration
**Systems:** [Publisher] → Message Broker
**Priority:** High

### Setup
- Message broker is running
- Event subscriber is listening

### Steps
1. Trigger action that should publish event
2. Capture published event

### Expected Results
- Event published to correct channel
- Event contains expected data
- Event matches schema

### Test Code
```javascript
it('publishes [Event] on [action]', async () => {
  const eventCapture = await broker.subscribe('[channel]');
  
  // Trigger action
  await service.[action]({ id: '123', data: 'value' });
  
  // Wait for event
  const event = await eventCapture.waitForEvent(5000);
  
  expect(event.type).toBe('[EventType]');
  expect(event.data.id).toBe('123');
  expect(event.timestamp).toBeDefined();
  
  // Validate against schema
  expect(validateSchema(event, '[EventType]Schema')).toBe(true);
});
```
```

### Event Consumed

```markdown
## Scenario: [Event] Consumed Successfully

**Type:** Event Integration
**Systems:** Message Broker → [Consumer]
**Priority:** High

### Setup
- Consumer is running and subscribed

### Steps
1. Publish event to channel
2. Verify consumer processed it

### Expected Results
- Consumer receives event
- Consumer performs expected action
- No error logged

### Test Code
```javascript
it('processes [Event] correctly', async () => {
  // Publish event
  await broker.publish('[channel]', {
    type: '[EventType]',
    data: { id: '123', value: 'test' }
  });
  
  // Wait for processing
  await waitFor(async () => {
    const record = await db.[table].findById('123');
    return record !== null;
  }, 5000);
  
  // Verify result
  const record = await db.[table].findById('123');
  expect(record.value).toBe('test');
});
```
```

### Duplicate Event Handling

```markdown
## Scenario: Duplicate [Event] Handled Idempotently

**Type:** Event Integration
**Systems:** Message Broker → [Consumer]
**Priority:** High

### Setup
- Consumer is running

### Steps
1. Publish same event twice
2. Verify only one action taken

### Expected Results
- Event processed once
- No duplicate records/actions
- No errors

### Test Code
```javascript
it('handles duplicate [Event] idempotently', async () => {
  const event = {
    eventId: 'evt-123',
    type: '[EventType]',
    data: { id: '456' }
  };
  
  // Publish twice
  await broker.publish('[channel]', event);
  await broker.publish('[channel]', event);
  
  // Wait for processing
  await sleep(2000);
  
  // Verify single record
  const records = await db.[table].findByField('externalId', '456');
  expect(records.length).toBe(1);
});
```
```

## E2E Workflow Scenarios

### Complete Workflow

```markdown
## Scenario: [Workflow Name] - Happy Path

**Type:** End-to-End
**Systems:** [List all systems involved]
**Priority:** High

### Setup
- All services running
- Test data created
- Test users exist

### Steps
1. [User A] performs [Action 1]
2. System [X] processes and triggers [Y]
3. [User B] receives notification
4. [User B] performs [Action 2]
5. System [Z] finalizes

### Expected Results
- Each step completes successfully
- Data consistent across all systems
- Notifications delivered
- Final state correct

### Test Code
```javascript
it('completes [workflow] successfully', async () => {
  // Step 1
  const step1Result = await userA.perform[Action1]({...});
  expect(step1Result.status).toBe('success');
  
  // Step 2 - verify system processing
  await waitFor(async () => {
    const state = await systemX.getState(step1Result.id);
    return state.processed === true;
  }, 10000);
  
  // Step 3 - verify notification
  const notifications = await userB.getNotifications();
  expect(notifications).toContainEqual(
    expect.objectContaining({ type: '[NotificationType]' })
  );
  
  // Step 4
  const step4Result = await userB.perform[Action2]({...});
  expect(step4Result.status).toBe('success');
  
  // Step 5 - verify final state
  const finalState = await systemZ.getFinalState(step1Result.id);
  expect(finalState.status).toBe('completed');
  expect(finalState.allSystemsConsistent).toBe(true);
});
```
```

### Workflow with Failure Recovery

```markdown
## Scenario: [Workflow] - Recovery from Failure

**Type:** End-to-End
**Systems:** [List all systems involved]
**Priority:** Medium

### Setup
- All services running
- Failure injection capability

### Steps
1. Start workflow normally
2. Inject failure at [step]
3. Verify system detects failure
4. Trigger retry/recovery
5. Verify workflow completes

### Expected Results
- Failure detected
- No data corruption
- Recovery successful
- Final state correct

### Test Code
```javascript
it('recovers from [failure type]', async () => {
  // Start workflow
  const workflowId = await workflow.start({...});
  
  // Inject failure
  await failureInjector.fail('[service]', '[failure-type]');
  
  // Wait for failure detection
  await waitFor(async () => {
    const state = await workflow.getState(workflowId);
    return state.status === 'failed';
  }, 10000);
  
  // Restore service
  await failureInjector.restore('[service]');
  
  // Trigger recovery
  await workflow.retry(workflowId);
  
  // Verify completion
  await waitFor(async () => {
    const state = await workflow.getState(workflowId);
    return state.status === 'completed';
  }, 30000);
  
  // Verify data consistency
  const data = await verifyConsistency(workflowId);
  expect(data.consistent).toBe(true);
});
```
```

## Contract Test Scenarios

### Provider Contract

```markdown
## Scenario: [Provider] Contract Verification

**Type:** Contract (Provider side)
**Systems:** [Provider]
**Priority:** High

### Setup
- Provider service running
- Contract file loaded

### Steps
1. Load contract expectations
2. For each interaction:
   - Send specified request
   - Verify response matches contract

### Expected Results
- All interactions pass
- Response format matches
- Response values match matchers

### Test Code
```javascript
describe('[Provider] Contract', () => {
  const contracts = loadContracts('[provider]-contracts.json');
  
  contracts.forEach(contract => {
    it(`satisfies: ${contract.description}`, async () => {
      // Set up provider state
      await providerStates.setup(contract.providerState);
      
      // Send request per contract
      const response = await request(app)
        .request(contract.request.method, contract.request.path)
        .set(contract.request.headers)
        .send(contract.request.body);
      
      // Verify response
      expect(response.status).toBe(contract.response.status);
      expect(response.body).toMatchObject(contract.response.body);
      
      // Clean up
      await providerStates.cleanup(contract.providerState);
    });
  });
});
```
```

### Consumer Contract

```markdown
## Scenario: [Consumer] Expectations of [Provider]

**Type:** Contract (Consumer side)
**Systems:** [Consumer] → [Provider]
**Priority:** High

### Setup
- Mock provider running
- Consumer service running

### Steps
1. Define expected interactions
2. Consumer makes calls
3. Verify interactions match

### Expected Results
- Consumer handles responses correctly
- Interactions recorded match expectations
- Contract can be shared with provider

### Test Code
```javascript
describe('[Consumer] Expectations', () => {
  let mockProvider;
  
  beforeAll(async () => {
    mockProvider = await Pact({
      consumer: '[Consumer]',
      provider: '[Provider]'
    });
  });
  
  it('expects [interaction description]', async () => {
    // Define expectation
    await mockProvider.addInteraction({
      state: '[provider state]',
      uponReceiving: '[description]',
      withRequest: {
        method: 'GET',
        path: '/resource/123'
      },
      willRespondWith: {
        status: 200,
        body: {
          id: Matchers.string('123'),
          name: Matchers.string()
        }
      }
    });
    
    // Consumer makes call
    const result = await consumer.getResource('123');
    
    // Verify consumer handled it
    expect(result.id).toBe('123');
    
    // Verify interaction occurred
    await mockProvider.verify();
  });
  
  afterAll(async () => {
    // Write contract file
    await mockProvider.finalize();
  });
});
```
```

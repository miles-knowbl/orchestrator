# Capability Format

How to write complete capability specifications.

## Why Capabilities Matter

Capabilities are the atomic units of functionality. Each capability is a complete specification of one thing the system can do. Well-specified capabilities make implementation straightforward and testing obvious.

## Capability Structure

Every capability MUST include all of these sections:

```yaml
capability: [snake_case_name]
id: CAP-###
description: [One sentence: what it does]
actor: [Who/what triggers this]
trigger: [What event triggers this]

input:
  [field]: [type]
  [field]: [type]

output:
  [field]: [type]

preconditions:
  - [Condition that must be true before]

validation:
  - [Rule that input must satisfy]

side_effects:
  - [State change or external effect]

feedback:
  timing:
    input_acknowledgment: [timing]
    local_render: [timing]
    server_confirm: [timing]
  haptic:
    on_action: [pattern]
    on_success: [pattern]
    on_error: [pattern]
  visual:
    pending: [description]
    success: [description]
    error: [description]
  optimistic:
    strategy: [how to show success before confirm]
    rollback: [how to revert on failure]

error_handling:
  [ERROR_CODE]: "[User-facing message]"
```

## Section Details

### Identity

```yaml
capability: create_subscription
id: CAP-003
description: Create a new subscription for a customer
actor: Admin user
trigger: Submit subscription form
```

- **capability**: Snake case, verb-first (`create_`, `update_`, `delete_`, `list_`, `get_`)
- **id**: Sequential within spec (CAP-001, CAP-002, ...)
- **description**: One sentence, no jargon
- **actor**: Who performs this (Admin, Customer, System, API)
- **trigger**: What initiates it (click, submit, cron, webhook)

### Input/Output

```yaml
input:
  customer_id: uuid (required)
  plan_id: uuid (required)
  start_date: date (optional, default: today)
  assigned_to: uuid? (optional)
  notes: string? (optional, max: 1000 chars)

output:
  subscription: Subscription
  subscription_number: string (format: SUB-YYYY-NNNN)
  first_job_date: date
```

- Use types: `uuid`, `string`, `number`, `boolean`, `date`, `datetime`, `json`
- Mark required vs optional explicitly
- Include constraints (max length, format, range)
- Output should match what the UI needs

### Preconditions

```yaml
preconditions:
  - User is authenticated
  - User has 'admin' or 'owner' role
  - Customer exists and is not deleted
  - Plan exists and is active
  - Customer does not have existing active subscription for this plan
```

Things that must be true BEFORE the capability can execute. These are checked at the start and result in immediate failure if not met.

### Validation

```yaml
validation:
  - customer_id must reference existing customer in same business
  - plan_id must reference active service plan
  - start_date cannot be in the past
  - start_date cannot be more than 1 year in future
  - assigned_to must be profile in same business with technician role
```

Rules that the input must satisfy. Different from preconditions: validation is about the input data, preconditions are about system state.

### Side Effects

```yaml
side_effects:
  - Subscription record created in database
  - Subscription number sequence incremented
  - First job scheduled based on plan frequency
  - subscription_created event recorded
  - Notification sent to assigned technician (if assigned)
  - Customer portal access enabled for this subscription
```

Everything that changes as a result of this capability. Be exhaustive — this is the contract.

### Feedback Block

```yaml
feedback:
  timing:
    input_acknowledgment: 0ms    # Button press state
    local_render: <50ms          # Optimistic subscription appears in list
    server_confirm: background   # Actual database write
    
  haptic:
    on_action: light_impact      # When submit clicked
    on_success: none             # Silent on success
    on_error: error_pattern      # Vibrate on failure
    
  visual:
    pending: |
      Submit button shows spinner.
      Form fields disabled.
      New subscription row appears in list with pending indicator.
    success: |
      Modal closes.
      Subscription row shows confirmed state.
      Toast: "Subscription created successfully"
    error: |
      Submit button returns to normal.
      Form fields re-enabled.
      Error message appears below form.
      Specific field errors highlighted.
      
  optimistic:
    strategy: |
      Immediately add subscription to list with temp ID.
      Show pending state (opacity, spinner).
      Disable edit/delete until confirmed.
    rollback: |
      Remove temp subscription from list.
      Re-open form with previous values.
      Show error message.
```

This is the UX contract. Frontend developers should be able to implement the interaction purely from this spec.

### Error Handling

```yaml
error_handling:
  CUSTOMER_NOT_FOUND: "Customer not found. Please refresh and try again."
  PLAN_NOT_FOUND: "Service plan no longer available."
  PLAN_INACTIVE: "This service plan is no longer active."
  DUPLICATE_SUBSCRIPTION: "Customer already has an active subscription for this plan."
  INVALID_START_DATE: "Start date must be today or in the future."
  ASSIGNMENT_INVALID: "Selected technician is not available."
  SUBSCRIPTION_LIMIT_REACHED: "Maximum subscription limit reached for this customer."
```

- Use SCREAMING_SNAKE_CASE for error codes
- Messages should be user-friendly, not technical
- Include recovery guidance where possible

## Complete Example

```yaml
capability: skip_subscription_visit
id: CAP-007
description: Skip the next scheduled visit for a subscription
actor: Customer (via portal) or Admin
trigger: Click "Skip Next Visit" button

input:
  subscription_id: uuid (required)
  schedule_id: uuid (required)
  reason: string? (optional, max: 500 chars)

output:
  schedule: SubscriptionSchedule (with status: 'skipped')
  next_schedule: SubscriptionSchedule (the new next visit)
  skip_count: number (total skips this year)

preconditions:
  - User is authenticated
  - User is customer who owns subscription OR admin in same business
  - Subscription is active (not paused, cancelled, or expired)
  - Schedule exists and status is 'scheduled'
  - Schedule date is at least 24 hours in future

validation:
  - subscription_id must reference subscription user has access to
  - schedule_id must belong to specified subscription
  - Cannot skip if already at max skips for period (default: 2 per quarter)
  - Cannot skip if would result in 3+ consecutive skips

side_effects:
  - Schedule status updated to 'skipped'
  - Schedule.skipped_at set to NOW()
  - Schedule.skipped_by set to auth.uid()
  - Schedule.skip_reason set if provided
  - Schedule.version incremented
  - subscription_visit_skipped event recorded
  - Next visit recalculated if needed
  - Notification sent to assigned technician
  - Notification sent to business admin (if configured)

feedback:
  timing:
    input_acknowledgment: 0ms
    local_render: <50ms
    server_confirm: background
    
  haptic:
    on_action: light_impact
    on_success: success_pattern
    on_error: error_pattern
    
  visual:
    pending: |
      Skip button shows spinner.
      Schedule row shows pending state.
    success: |
      Schedule row updates to show "Skipped" badge.
      Next visit date updates to show new date.
      Toast: "Visit skipped. Next visit: [date]"
      Skip count badge increments.
    error: |
      Skip button returns to normal.
      Error toast with specific message.
      Schedule row unchanged.
      
  optimistic:
    strategy: |
      Immediately update schedule to 'skipped' state.
      Immediately calculate and show new next visit.
      Mark both as pending.
    rollback: |
      Revert schedule to 'scheduled' state.
      Revert next visit display.
      Show error message.

error_handling:
  SUBSCRIPTION_NOT_FOUND: "Subscription not found."
  SCHEDULE_NOT_FOUND: "This visit is no longer available."
  ALREADY_SKIPPED: "This visit has already been skipped."
  TOO_LATE_TO_SKIP: "Cannot skip within 24 hours of scheduled visit. Please contact us."
  MAX_SKIPS_REACHED: "Maximum skips reached for this period. Please contact us to discuss options."
  CONSECUTIVE_SKIP_LIMIT: "Cannot skip 3 or more visits in a row. Please contact us."
  SUBSCRIPTION_NOT_ACTIVE: "Cannot skip visits for inactive subscriptions."
  CONCURRENT_MODIFICATION: "This schedule was modified. Please refresh and try again."
```

## Capability Naming Conventions

| Pattern | Use For | Examples |
|---------|---------|----------|
| `create_[entity]` | Creating new records | `create_subscription`, `create_job` |
| `update_[entity]` | Modifying existing records | `update_subscription`, `update_profile` |
| `delete_[entity]` | Removing records (soft or hard) | `delete_subscription`, `delete_comment` |
| `list_[entities]` | Fetching multiple records | `list_subscriptions`, `list_customers` |
| `get_[entity]` | Fetching single record | `get_subscription`, `get_customer` |
| `[verb]_[entity]` | Domain-specific actions | `skip_visit`, `pause_subscription`, `approve_quote` |
| `[verb]_[entity]_[detail]` | Specific operations | `update_subscription_status`, `generate_subscription_jobs` |

## Capability Checklist

Before finalizing a capability:

```markdown
- [ ] Unique ID assigned (CAP-###)
- [ ] Name follows conventions (verb_noun)
- [ ] Description is one clear sentence
- [ ] Actor and trigger specified
- [ ] All input fields documented with types
- [ ] Required vs optional clearly marked
- [ ] Output matches what UI needs
- [ ] Preconditions are system state checks
- [ ] Validation rules cover all input
- [ ] Side effects are exhaustive
- [ ] Feedback block has all four sections (timing, haptic, visual, optimistic)
- [ ] Error codes are SCREAMING_SNAKE_CASE
- [ ] Error messages are user-friendly
```

## Common Mistakes

### Vague Side Effects

❌ "Updates the database"
✅ "Subscription.status updated to 'paused'. Subscription.paused_at set to NOW(). subscription_paused event recorded."

### Missing Optimistic Strategy

❌ No optimistic block
✅ Full strategy and rollback plan

### Technical Error Messages

❌ "FOREIGN_KEY_CONSTRAINT_VIOLATION"
✅ "The selected customer no longer exists. Please refresh and try again."

### Incomplete Feedback

❌ Just timing, no visual/haptic
✅ All four feedback sections complete

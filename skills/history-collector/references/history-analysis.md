# History Analysis

How to analyze execution history for async context.

## Execution Categories

### Completed

Successfully finished executions:
- All phases completed
- All gates approved
- Deliverables produced

### Incomplete

Started but not finished:
- Paused executions
- Abandoned mid-phase
- Waiting on gate approval

### Failed

Terminated with errors:
- Gate rejections (not auto-recoverable)
- System errors
- User aborts

## Key Metrics

### Success Rate

```
success_rate = completed_count / (completed_count + failed_count)
```

Excludes incomplete (still in progress).

### Average Duration

```
avg_duration = sum(completed.duration) / completed.count
```

Per loop type for accuracy.

### Gate Wait Time

```
avg_gate_wait = sum(gate_approval_time - gate_triggered_time) / gate_count
```

Identifies if gates are bottleneck.

## Momentum Indicators

### Streak

Consecutive successful completions:
- Positive momentum: streak > 3
- Neutral: streak 1-2
- Recovering: streak after failure

### Recency

Days since last activity:
- Active: 0-1 days
- Recent: 2-7 days
- Dormant: 7+ days

### Velocity

Executions per week:
- High velocity: 5+ per week
- Normal: 2-4 per week
- Low: <2 per week

## Patterns to Surface

### Loop Sequences

Common loop chains:
- engineering → bugfix → distribution
- learning → engineering
- bugfix → engineering

### Time-of-Day

When work typically happens:
- Morning (6am-12pm)
- Afternoon (12pm-6pm)
- Evening (6pm-12am)

### Day-of-Week

Which days are productive:
- Weekday patterns
- Weekend patterns

## Action Items from History

### Resume Candidates

Incomplete executions that can be resumed:
- State preserved
- No blocking errors
- Within reasonable timeframe

### Retry Candidates

Failed executions that might succeed:
- Transient failures
- External dependencies now available
- Fixed underlying issues

### Archive Candidates

Old incomplete executions to clean up:
- >7 days old
- Superseded by newer work
- Context no longer relevant

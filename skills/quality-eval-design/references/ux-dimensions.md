# UX Dimensions

Quality dimensions for evaluating user experience.

## Core Dimensions

### responsiveness
**What it measures:** Does the UI respond quickly to actions?

**Weight:** 25%
**Floor:** 3.0

**Scoring:**
- 5: Instant (<100ms)
- 4: Quick (<500ms)
- 3: Noticeable (<2s)
- 2: Slow (2-5s)
- 1: Hanging (>5s)

**What to check:**
- Button click response
- Page load time
- Form submission
- Data fetching

### feedback_clarity
**What it measures:** Are loading, success, and error states clear?

**Weight:** 25%
**Floor:** 3.0

**Scoring:**
- 5: Every action has clear, helpful feedback
- 4: Most actions have feedback
- 3: Basic feedback present
- 2: Feedback often missing or confusing
- 1: No feedback, user guesses state

**What to check:**
- Loading indicators present?
- Success confirmation shown?
- Error messages helpful?
- Progress visible for long operations?

### error_recovery
**What it measures:** Can users recover from errors easily?

**Weight:** 20%
**Floor:** 2.5

**Scoring:**
- 5: Errors rare, recovery effortless
- 4: Clear recovery path
- 3: Can recover with effort
- 2: Recovery difficult
- 1: Stuck, must refresh/restart

**What to check:**
- Retry buttons present?
- Error messages actionable?
- Form data preserved on error?
- Undo available?

### state_consistency
**What it measures:** Does the UI show current, accurate state?

**Weight:** 20%
**Floor:** 2.5

**Scoring:**
- 5: Always accurate, real-time
- 4: Accurate, minor delays
- 3: Usually accurate
- 2: Often stale
- 1: Frequently wrong

**What to check:**
- Cache invalidation working?
- Real-time updates arriving?
- Optimistic updates correct?
- Navigation preserves state?

### accessibility
**What it measures:** Is the UI usable by everyone?

**Weight:** 10%
**Floor:** 3.0

**Scoring:**
- 5: WCAG AA compliant, excellent a11y
- 4: Good keyboard/screen reader support
- 3: Basic accessibility
- 2: Some issues
- 1: Major barriers

**What to check:**
- Keyboard navigation works?
- Screen reader announces correctly?
- Color contrast sufficient?
- Focus indicators visible?

## Additional Dimensions

### intuitiveness
**What it measures:** Can users figure it out without help?

**Applies to:** New or complex features

### efficiency
**What it measures:** Can tasks be completed quickly?

**Applies to:** Productivity apps, frequent actions

### discoverability
**What it measures:** Can users find features?

**Applies to:** Feature-rich applications

### satisfaction
**What it measures:** Do users enjoy using it?

**Applies to:** Consumer apps, optional usage

## Weight Adjustment

Adjust weights based on context:

| Context | Emphasize |
|---------|-----------|
| Real-time app | responsiveness, state_consistency |
| Form-heavy | feedback_clarity, error_recovery |
| Public-facing | accessibility |
| Power users | efficiency, shortcuts |

## Evaluation Method

1. **Walk through each U-series pipeline**
2. **At each step, check each dimension:**
   - Is it responsive here?
   - Is feedback clear here?
   - Can user recover from errors here?
   - Is state accurate here?
   - Is it accessible here?
3. **Score overall dimension 1-5**
4. **Note specific issues as evidence**

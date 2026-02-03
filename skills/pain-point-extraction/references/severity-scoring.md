# Severity Scoring Reference

How to assess pain point severity.

## Severity Levels

### High Severity

**Definition:** Critical problem that demands immediate attention.

**Indicators:**
- Executive-level concern (CEO, CFO, VP mentioned it)
- Quantified, significant impact (300% increase, $2M cost)
- Urgent language ("critical", "drowning", "must fix")
- Mentioned multiple times (3+ mentions)
- Has deadline attached ("by Q2 or else")
- Affects revenue or customer retention
- Board or investor pressure

**Scoring Threshold:** 3+ indicators = High

**Examples:**
- "Our CEO is asking about this weekly" → Executive concern
- "Ticket volume up 300%, team at breaking point" → Quantified + urgent
- "If we don't fix this by June, we'll lose our biggest customer" → Deadline + revenue

---

### Medium Severity

**Definition:** Acknowledged problem that needs addressing but isn't urgent.

**Indicators:**
- Department-level concern (Director, Manager)
- Some quantification but moderate impact
- Acknowledged problem, not crisis
- Mentioned 2 times
- Would be nice to fix
- Affects efficiency, not survival

**Scoring Threshold:** 1-2 indicators from High, or pattern of Medium indicators

**Examples:**
- "Our support team struggles with this" → Department concern
- "Response times have slipped a bit" → Acknowledged, not urgent
- "We'd like to improve this area" → Nice to have

---

### Low Severity

**Definition:** Minor concern, mentioned in passing, not a priority.

**Indicators:**
- Individual contributor mentioned it
- No quantification
- Mentioned once, in passing
- "Someday" language
- Doesn't affect core operations
- No stakeholder pressure

**Scoring Threshold:** Few or no severity indicators

**Examples:**
- "It would be cool if we could also..." → Nice to have
- "Some people have mentioned..." → Passing mention
- "Maybe eventually we'd want to..." → Someday

---

## Severity Scoring Matrix

| Factor | High | Medium | Low |
|--------|------|--------|-----|
| **Who mentioned** | Executive | Director/Manager | Individual |
| **Quantified impact** | Significant ($1M+, 200%+) | Moderate | None |
| **Language** | Urgent, critical | Acknowledged | Passing |
| **Mention count** | 3+ times | 2 times | 1 time |
| **Timeline** | Has deadline | General timeline | No timeline |
| **Business impact** | Revenue/customers | Efficiency | Minor |

## Scoring Process

### Step 1: Count Indicators

For each pain point, check each factor:

```
Pain: "Support ticket volume up 300%, CEO asking weekly"

✓ Executive mentioned (CEO) → High indicator
✓ Quantified (300%) → High indicator
✓ Implied urgency (asking weekly) → High indicator
□ Mention count: Check sources
□ Timeline: Not mentioned
□ Business impact: Implied (CEO attention)

Result: 3+ High indicators → HIGH SEVERITY
```

### Step 2: Verify with Context

Cross-check against deal context:
- Is this pain related to their buying motivation?
- Would solving this make the deal happen?
- Does the champion emphasize this?

### Step 3: Assign and Document

```json
{
  "severity": "high",
  "severityReason": "Executive-level concern (CEO asking weekly), quantified impact (300% increase), implied urgency"
}
```

## Severity Changes Over Time

Pain severity can change:

| Change | Likely Cause |
|--------|--------------|
| Low → High | New information, escalation, deadline added |
| High → Medium | Partially addressed, urgency decreased |
| High → Low | Solved another way, priority shifted |

**Rule:** Re-assess severity when new communications parsed.

## Common Mistakes

### Over-rating

| Mistake | Correction |
|---------|------------|
| Any mention = High | Need multiple indicators |
| Assuming urgency | Look for explicit urgency signals |
| Technical = High | Technical ≠ business critical |

### Under-rating

| Mistake | Correction |
|---------|------------|
| No numbers = Low | Qualitative can still be high |
| Not repeated = Low | One strong executive mention = High |
| Polite language = Low | Some execs are understated |

## Confidence in Severity Assessment

| Confidence | When to Use |
|------------|-------------|
| High | Multiple clear indicators, explicit statements |
| Medium | Some indicators, some inference |
| Low | Limited data, mostly inference |

Always note confidence:

```json
{
  "severity": "high",
  "severityConfidence": "medium",
  "severityReason": "Quantified impact clear, executive concern inferred from meeting attendance"
}
```

# Tracing Methodology

How to link taste gaps to technical failure modes.

## The Tracing Question

For each gap, ask: **"What technical failure could cause this symptom?"**

## Evidence-Based Tracing

Start with gap evidence, work backward to technical causes:

```
Gap Evidence                    Technical Cause
─────────────                   ───────────────
"Content repetitive"      →     Limited template pool
"Loading unclear"         →     Missing loading state
"Errors confusing"        →     Generic error messages
"Feels slow"              →     No optimistic updates
```

## Tracing Techniques

### 1. Code Path Analysis
Trace the code path that produces the gap symptom:

```
User sees repetitive content
  ← Content rendered in ArticleCard
    ← Content returned from generate endpoint
      ← Content produced by template_select()
        ← template_select() uses hardcoded list of 3
          = P2-007: Limited template selection
```

### 2. Failure Mode Scanning
Review failure modes and check if they could cause the gap:

```
Gap: TG-001 (engagement low)

Scan P2 failure modes:
  P2-001: Input validation fails      → No, wouldn't affect engagement
  P2-002: API timeout                 → No, different symptom
  P2-003: Weak hook generation        → YES, contributes to engagement
  P2-007: Limited templates           → YES, causes repetition
```

### 3. Symptom Matching
Match gap symptoms to failure mode impacts:

| Symptom | Failure Mode Pattern |
|---------|---------------------|
| "Repetitive" | T4-Quality, limited variety |
| "Slow" | T3-Infrastructure, performance |
| "Confusing" | T5-UX, feedback issues |
| "Wrong" | T1-Data or T2-Logic |

## Relationship Types

### Direct Cause
**Definition:** The failure mode is the primary cause of the gap.

**Test:**
- If we fix ONLY this failure mode, does the gap significantly improve?
- Is there a clear code path from failure to symptom?

**Example:**
```
P2-007 (3 templates) → TG-001 (repetitive)
Direct: Yes, limited templates directly cause repetition
```

### Contributing Cause
**Definition:** The failure mode contributes to but doesn't fully explain the gap.

**Test:**
- Fixing this helps but doesn't resolve the gap alone
- Multiple failure modes combine to create the gap

**Example:**
```
P2-003 (weak hooks) → TG-001 (low engagement)
Contributing: Hooks are one factor, but templates also matter
```

### Correlated
**Definition:** The failure mode and gap appear together but aren't causally linked.

**Test:**
- They share a common cause
- They affect similar areas but independently

**Example:**
```
P1-002 (slow ingestion) ~ TG-002 (responsiveness)
Correlated: Both related to performance, but ingestion doesn't affect UI responsiveness
```

## Confidence Assessment

| Confidence | Criteria |
|------------|----------|
| High | Code path verified, causal mechanism clear |
| Medium | Evidence suggests link, mechanism plausible |
| Low | Possible connection, needs investigation |

## When No Trace Exists

Some gaps have no technical cause:

1. **Content/Prompt Issues:** System works correctly but produces wrong content
2. **Design Issues:** UX is technically correct but poorly designed
3. **Requirements Issues:** Feature works as specified but spec was wrong

Document these as "No technical cause" with explanation.

# Ship Decision Matrix

How overall taste score and technical coverage combine to determine ship readiness.

## Ship Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| SHIP | Ready to launch | Proceed to distribution |
| POLISH_THEN_SHIP | Minor improvements needed | Address gaps, then ship |
| FIX_FIRST | Significant issues | Must improve before ship consideration |
| BLOCKED | Cannot ship | Critical issues prevent launch |

## Primary Decision: Taste Score

| Overall Score | Base Status |
|---------------|-------------|
| >= 4.0 | SHIP |
| 3.0 - 4.0 | POLISH_THEN_SHIP |
| < 3.0 | FIX_FIRST |

## Override Rules

### Critical Gap Override
If ANY critical gap exists (score < floor where floor >= 3.0):
- Status cannot be SHIP
- Minimum status: POLISH_THEN_SHIP

### Multiple Gap Override
If >= 3 gaps exist (any severity):
- Status downgrades one level
- SHIP → POLISH_THEN_SHIP
- POLISH_THEN_SHIP → FIX_FIRST

### Severe Gap Override
If ANY dimension scores < 2.0:
- Status: BLOCKED
- Message: "Critical quality failure in [dimension]"

## Combined Matrix (Taste + Coverage)

| Taste Score | Tech Coverage | Decision |
|-------------|---------------|----------|
| >= 4.0 | >= 70% | SHIP |
| >= 4.0 | < 70% | SHIP (fix coverage post-launch) |
| 3.0 - 4.0 | >= 70% | POLISH_THEN_SHIP |
| 3.0 - 4.0 | < 70% | POLISH_THEN_SHIP (fix both) |
| < 3.0 | Any | FIX_FIRST (taste blocks) |

**Key insight:** Taste < 3.0 always blocks ship, regardless of technical coverage.

## Decision Output Format

```
═══════════════════════════════════════════════════════════════
║  SHIP DECISION                                              ║
║                                                             ║
║  Taste Score: 3.38                                          ║
║  Status: POLISH_THEN_SHIP                                   ║
║                                                             ║
║  Factors:                                                   ║
║    ✓ Score above fix threshold (3.0)                        ║
║    ✗ 1 critical gap (engagement)                            ║
║    ✗ Score below ship threshold (4.0)                       ║
║                                                             ║
║  Recommendation:                                            ║
║    Address TG-001 (engagement) before launch                ║
║    Target score: 3.8+ for confident ship                    ║
═══════════════════════════════════════════════════════════════
```

## Quality Gate Customization

Projects can customize thresholds in `.claude/taste-manifest.json`:

```json
{
  "quality_gates": {
    "ship": 4.0,    // Default: 3.5
    "polish": 3.0,  // Default: 2.5
    "fix": 2.5      // Default: 2.5
  }
}
```

Higher thresholds = stricter quality bar.

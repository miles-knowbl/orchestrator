# ESTIMATE.md Template

## Estimate: {{system-name}}

**Domain:** {{domain}}
**Created:** {{date}}
**Confidence:** {{confidence}}%

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Hours** | {{total}}h |
| **Complexity** | {{S/M/L/XL}} |
| **Capabilities** | {{count}} |
| **Risk Level** | {{Low/Medium/High}} |

---

## Phase Breakdown

| Phase | Hours | Confidence | Notes |
|-------|-------|------------|-------|
| SPEC | {{h}} | {{%}} | |
| ARCHITECT | {{h}} | {{%}} | |
| SCAFFOLD | {{h}} | {{%}} | |
| IMPLEMENT | {{h}} | {{%}} | |
| TEST | {{h}} | {{%}} | |
| VERIFY | {{h}} | {{%}} | |
| VALIDATE | {{h}} | {{%}} | |
| DOCUMENT | {{h}} | {{%}} | |
| DEPLOY | {{h}} | {{%}} | |
| **Total** | **{{h}}** | **{{%}}** | |

---

## Capability Breakdown

| ID | Capability | Complexity | Hours |
|----|------------|------------|-------|
| C1 | {{name}} | {{S/M/L}} | {{h}} |
| C2 | {{name}} | {{S/M/L}} | {{h}} |

---

## Assumptions

- {{assumption-1}}
- {{assumption-2}}

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| {{risk}} | +{{h}}h | {{mitigation}} |

---

## Calibration Applied

| Factor | Multiplier | Reason |
|--------|------------|--------|
| Global | {{x}} | Historical variance |
| Complexity | {{x}} | {{complexity}} items |
| Domain | {{x}} | {{familiarity}} |

**Pre-calibration:** {{h}}h
**Post-calibration:** {{h}}h

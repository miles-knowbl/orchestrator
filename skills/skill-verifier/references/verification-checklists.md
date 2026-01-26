# Verification Checklists

Skill-specific verification checklists for quick self-audit.

## Quick Verification (All Skills)

Before marking any skill complete:

```
□ Deliverable exists at expected location
□ Deliverable is not empty
□ No TODO/FIXME/placeholder content
□ Follows expected format/template
□ Would pass quick senior review
```

---

## entry-portal

```markdown
## entry-portal Verification

### Process
- [ ] Received and documented raw input
- [ ] Asked clarifying questions (or documented why not needed)
- [ ] Classified as domain/system/feature
- [ ] Decomposed into systems (or confirmed single system)
- [ ] Generated FeatureSpec using spec skill
- [ ] Added to system queue
- [ ] Published to GitHub (or documented why skipped)

### References Consulted
- [ ] clarifying-questions.md
- [ ] system-decomposition.md (if decomposing)
- [ ] dream-state-template.md

### Deliverables
- [ ] dream-state.md exists
- [ ] system-queue.json exists and valid
- [ ] FEATURESPEC.md exists (via spec skill)

### Quality
- [ ] Dream state is inspiring and clear
- [ ] Systems are MECE
- [ ] Dependencies are identified
- [ ] Queue is properly ordered
```

---

## spec

```markdown
## spec Verification

### Process
- [ ] Structured against 18-section template
- [ ] Assigned Spec ID
- [ ] Numbered all capabilities (CAP-###)
- [ ] Applied feedback framework (if applicable)
- [ ] Senior engineer audit completed
- [ ] All audit issues resolved in spec

### References Consulted
- [ ] 18-section-template.md
- [ ] capability-format.md
- [ ] feedback-framework.md (for UI features)

### Deliverables
- [ ] FEATURESPEC.md exists
- [ ] Minimum 1500 lines (target 2000+)
- [ ] All 18 sections present (or marked N/A with reason)

### Quality
- [ ] No placeholder code
- [ ] Full implementations, not pseudocode
- [ ] All capabilities have complete definitions
- [ ] Compilation summary shows issues resolved
```

---

## architect

```markdown
## architect Verification

### Process
- [ ] Understood requirements and NFRs
- [ ] Identified components/services
- [ ] Defined interfaces between components
- [ ] Chose appropriate patterns
- [ ] Documented key decisions as ADRs

### References Consulted
- [ ] architecture-patterns.md
- [ ] architectural-drivers.md
- [ ] adr-template.md

### Deliverables
- [ ] ARCHITECTURE.md or architecture section exists
- [ ] At least 1 ADR for key decision
- [ ] System diagram included

### Quality
- [ ] Components have clear boundaries
- [ ] Interfaces are well-defined
- [ ] Pattern choices are justified
- [ ] Trade-offs are documented
```

---

## architecture-review

```markdown
## architecture-review Verification

### Process
- [ ] Step 1: Established context
- [ ] Step 2: Mapped current state
- [ ] Step 3: Identified architectural drivers
- [ ] Step 4: Evaluated against drivers
- [ ] Step 5: Identified issues
- [ ] Step 6: Prioritized findings
- [ ] Step 7: Recommended actions

### References Consulted
- [ ] assessment-template.md
- [ ] evaluation-dimensions.md
- [ ] common-architecture-issues.md
- [ ] red-flags-checklist.md

### Deliverables
- [ ] ARCHITECTURE-REVIEW.md exists
- [ ] All 7 steps documented
- [ ] Clear verdict (APPROVED/CONDITIONAL/REJECTED)

### Quality
- [ ] System diagram accurate
- [ ] Driver evaluation has evidence
- [ ] Issues have severity and remediation
- [ ] Recommendations are actionable
```

---

## implement

```markdown
## implement Verification

### Process
- [ ] Followed FEATURESPEC capability by capability
- [ ] Wrote production-ready code (not stubs)
- [ ] Included error handling
- [ ] Wrote tests alongside (or immediately after)
- [ ] Made incremental commits

### References Consulted
- [ ] service-layer-patterns.md
- [ ] error-handling-patterns.md
- [ ] testing-patterns.md

### Deliverables
- [ ] Source files exist in src/
- [ ] All capabilities implemented
- [ ] Tests exist in tests/

### Quality
- [ ] Code follows patterns from references
- [ ] Error handling is comprehensive
- [ ] No TODO/FIXME in production code
- [ ] Types are complete (for typed languages)
```

---

## test-generation

```markdown
## test-generation Verification

### Process
- [ ] Identified what to test (units, integrations, e2e)
- [ ] Designed test cases for each level
- [ ] Wrote tests covering happy paths
- [ ] Wrote tests covering edge cases
- [ ] Wrote tests covering error conditions

### References Consulted
- [ ] unit-test-patterns.md
- [ ] integration-test-patterns.md (if applicable)
- [ ] mocking-patterns.md (if using mocks)

### Deliverables
- [ ] Test files exist
- [ ] Tests are runnable
- [ ] Minimum coverage: 1 test per public function

### Quality
- [ ] Tests are fast and reliable
- [ ] Tests are independent
- [ ] Tests are readable (serve as documentation)
- [ ] Edge cases covered
```

---

## code-verification

```markdown
## code-verification Verification

### Process
- [ ] Checked complexity (O(n²) patterns)
- [ ] Checked security (injection, traversal)
- [ ] Checked error handling
- [ ] Checked resource management
- [ ] Checked state management
- [ ] Checked concurrency (if applicable)

### References Consulted
- [ ] complexity-patterns.md
- [ ] error-handling-patterns.md
- [ ] Relevant patterns for code type

### Deliverables
- [ ] VERIFICATION.md exists
- [ ] All categories assessed
- [ ] Clear PASS/PARTIAL/FAIL verdict

### Quality
- [ ] Evidence provided for each assessment
- [ ] Issues have severity ratings
- [ ] Accepted risks documented with rationale
```

---

## code-validation

```markdown
## code-validation Verification

### Process
- [ ] Verified requirements coverage
- [ ] Verified edge cases handled
- [ ] Verified failure modes handled
- [ ] Verified integration points

### References Consulted
- [ ] requirements-alignment.md
- [ ] edge-cases.md
- [ ] failure-modes.md

### Deliverables
- [ ] VALIDATION.md exists
- [ ] All capabilities mapped to implementation
- [ ] Coverage percentage documented

### Quality
- [ ] 100% capability coverage (or gaps explained)
- [ ] Edge cases explicitly addressed
- [ ] Failure modes have graceful handling
```

---

## security-audit

```markdown
## security-audit Verification

### Process
- [ ] Reviewed OWASP Top 10
- [ ] Identified attack surface
- [ ] Threat modeled key flows
- [ ] Tested for common vulnerabilities

### References Consulted
- [ ] owasp-top-10.md (ALWAYS)
- [ ] vulnerability-patterns.md
- [ ] remediation-patterns.md (if issues found)

### Deliverables
- [ ] Security section in VALIDATION.md
- [ ] All OWASP categories addressed
- [ ] Vulnerabilities documented with remediation

### Quality
- [ ] No critical vulnerabilities
- [ ] All high vulnerabilities addressed
- [ ] Security controls documented
```

---

## code-review

```markdown
## code-review Verification

### Process
- [ ] Pass 1: Verification (structural)
- [ ] Pass 2: Validation (semantic)
- [ ] Pass 3: PR hygiene
- [ ] Pass 4: Maintainability

### References Consulted
- [ ] maintainability-checklist.md
- [ ] diff-analysis.md
- [ ] feedback-formatting.md

### Deliverables
- [ ] CODE-REVIEW.md exists
- [ ] All 4 passes documented
- [ ] Clear verdict (APPROVE/REQUEST_CHANGES/COMMENT)

### Quality
- [ ] Issues categorized as blocking/non-blocking
- [ ] Feedback is actionable
- [ ] Positive aspects noted, not just issues
```

---

## document

```markdown
## document Verification

### Process
- [ ] Identified audience
- [ ] Determined document types needed
- [ ] Wrote/updated README
- [ ] Wrote/updated API docs
- [ ] Wrote/updated other docs as needed

### References Consulted
- [ ] readme-templates.md
- [ ] api-documentation.md
- [ ] architecture-docs.md (if applicable)

### Deliverables
- [ ] README.md exists and is complete
- [ ] API documentation exists (if applicable)
- [ ] Other docs as identified

### Quality
- [ ] Docs are accurate (match code)
- [ ] Quick start actually works
- [ ] Examples are runnable
```

---

## deploy

```markdown
## deploy Verification

### Process
- [ ] Selected deployment strategy
- [ ] Created build artifacts
- [ ] Wrote deployment documentation
- [ ] Defined rollback procedure
- [ ] Defined validation checklist

### References Consulted
- [ ] rollback-procedures.md

### Deliverables
- [ ] DEPLOY.md exists
- [ ] Build artifacts created (or instructions to create)
- [ ] Deployment verified working

### Quality
- [ ] Actually deployed/installed successfully
- [ ] Validation checklist passes
- [ ] Rollback tested or documented
```

---

## memory-manager (Handoff)

```markdown
## memory-manager Handoff Verification

### Process
- [ ] Created handoff document
- [ ] Included session metadata
- [ ] Documented completed work
- [ ] Documented current state
- [ ] Listed decisions made
- [ ] Identified blockers/issues
- [ ] Defined next steps

### References Consulted
- [ ] handoff-template.md

### Deliverables
- [ ] sessions/{date}-{system}.md exists
- [ ] All handoff sections complete

### Quality
- [ ] Another agent could resume from this
- [ ] No assumed context
- [ ] Commands to run are specific
```

---

## Aggregate Verification

When verifying multiple skills at a stage gate:

```markdown
## Stage Gate Verification: [Stage Name]

### Skills Applied in Stage
| Skill | Deliverable | Status |
|-------|-------------|--------|
| | | |

### Overall Assessment
- [ ] All required skills applied
- [ ] All deliverables exist
- [ ] All verifications pass
- [ ] Ready to proceed to next stage

### Gaps Requiring Remediation
| Skill | Gap | Action |
|-------|-----|--------|
| | | |
```

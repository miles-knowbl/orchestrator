# Content Dimensions

Quality dimensions for evaluating generated content.

## Core Dimensions

### voice_fidelity
**What it measures:** Does the output match the intended voice/persona?

**Applies to:** Any system with a defined voice or persona

**Indicators:**
- Vocabulary matches target
- Tone is appropriate
- Personality markers present
- Consistency across outputs

### topic_relevance
**What it measures:** Does the content address the intended topic?

**Applies to:** All generated text

**Indicators:**
- On-topic throughout
- Key points covered
- No off-topic tangents
- Appropriate depth

### engagement
**What it measures:** Is the content interesting and attention-holding?

**Applies to:** Social media, marketing, entertainment

**Indicators:**
- Compelling hooks
- Varied structure
- Emotional resonance
- Call to action effective

### accuracy
**What it measures:** Is the content factually correct?

**Applies to:** Informational, educational, news

**Indicators:**
- Facts verifiable
- No hallucinations
- Sources credited
- Claims supported

### clarity
**What it measures:** Is the content easy to understand?

**Applies to:** Documentation, instructions, explanations

**Indicators:**
- Simple language
- Logical structure
- Terms defined
- No ambiguity

### coherence
**What it measures:** Does the content flow logically?

**Applies to:** Long-form content, articles

**Indicators:**
- Smooth transitions
- Consistent thread
- No contradictions
- Clear progression

### originality
**What it measures:** Is the content fresh and unique?

**Applies to:** Creative content

**Indicators:**
- Novel angles
- Unique phrasing
- Not templated
- Avoids clichés

## Domain-Specific Dimensions

### For Social Media
- **shareability:** Would people share this?
- **platform_fit:** Optimized for the platform?
- **timing_relevance:** Timely/current?

### For Marketing
- **brand_alignment:** Matches brand guidelines?
- **cta_effectiveness:** Clear call to action?
- **value_proposition:** Benefit clear?

### For Technical
- **completeness:** All necessary info included?
- **actionability:** Reader can act on it?
- **code_correctness:** Examples work?

## Weight Guidelines

| Use Case | Primary Dimensions |
|----------|-------------------|
| Social Media | engagement (40%), voice (30%), relevance (30%) |
| Documentation | clarity (40%), accuracy (30%), completeness (30%) |
| Marketing | engagement (35%), brand (35%), cta (30%) |
| News/Info | accuracy (50%), clarity (30%), relevance (20%) |

## Dimension Selection

Choose dimensions based on:
1. What the system produces
2. Who consumes it
3. What success looks like
4. What failures would be

**Rule:** 3-5 dimensions per category is ideal.

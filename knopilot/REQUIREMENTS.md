# KnoPilot Requirements

## Overview

KnoPilot is an AI-powered sales intelligence system that runs on the orchestrator infrastructure. It leverages the existing 24 sales skills and 7 sales loops to provide deal management, intelligence extraction, scoring, and next-best-action recommendations.

## Functional Requirements

### FR-1: Deal Management
- FR-1.1: Create deals with company, contacts, value, and stage
- FR-1.2: Progress deals through 5 stages: Lead → Target → Discovery → Contracting → Production
- FR-1.3: Store deal data in file-based structure: `deals/{deal-id}/`
- FR-1.4: Support deal listing, filtering by stage, and search

### FR-2: Communication Capture
- FR-2.1: Capture communications (emails, meeting notes) to deal profiles
- FR-2.2: Store in `deals/{deal-id}/communications/`
- FR-2.3: Support manual text/markdown input
- FR-2.4: Parse communications via existing `communication-parse` skill

### FR-3: Intelligence Extraction
- FR-3.1: Extract 7 intelligence categories from communications:
  - Pain points
  - AI maturity signals
  - Budget/timeline indicators
  - Stakeholder intelligence
  - Technical requirements
  - Use case clarity
  - Competitive landscape
- FR-3.2: Store extracted intelligence in `deals/{deal-id}/intelligence/`
- FR-3.3: Update intelligence incrementally as new communications arrive

### FR-4: Deal Scoring (9 Custom Properties)
- FR-4.1: AI Readiness Score (0-100) — composite of mandate, capability, use case, budget
- FR-4.2: Champion Strength (weak/moderate/strong/executive-sponsor)
- FR-4.3: Use Case Clarity (exploring/defined/scoped)
- FR-4.4: Decision Timeline (immediate/this-quarter/next-quarter/long-term/unknown)
- FR-4.5: Budget Range (<$100K/$100K-$500K/$500K-$1M/$1M+/unknown)
- FR-4.6: Primary Pain Point (volume/cost/cx/compliance/innovation/other)
- FR-4.7: Technical Complexity (low/medium/high)
- FR-4.8: Competitive Threat (none/low/medium/high)
- FR-4.9: Deal Confidence (0-100%) — composite win probability

### FR-5: Stakeholder Management
- FR-5.1: Add stakeholders to deals with name, title, role, sentiment
- FR-5.2: Roles: champion, decision-maker, influencer, blocker
- FR-5.3: Sentiment: supportive, neutral, skeptical
- FR-5.4: Track last interaction date per stakeholder

### FR-6: Next Best Action Engine
- FR-6.1: Generate ranked actions based on deal state and intelligence
- FR-6.2: Score actions using NBA formula: `NBA = Likelihood×0.4 + Effort×0.3 + ChampionValue×0.3`
- FR-6.3: Effort factor: Low=100, Medium=60, High=30
- FR-6.4: Return top 5 actions with scores, reasoning, and stakeholder impact
- FR-6.5: Actions are stage-aware (different suggestions per pipeline stage)

### FR-7: Deal View
- FR-7.1: Display deal summary card (name, company, stage, confidence, value)
- FR-7.2: Display intelligence dashboard with all 9 properties
- FR-7.3: Display stakeholder map
- FR-7.4: Display communication timeline with extracted insights
- FR-7.5: Display top 5 next best actions
- FR-7.6: Display risk factors

### FR-8: Pipeline Dashboard
- FR-8.1: Display total pipeline value (weighted by confidence)
- FR-8.2: Display deals by stage counts
- FR-8.3: Display average deal confidence with trend
- FR-8.4: Display prioritized deal list (sorted by composite priority)
- FR-8.5: Display "This Week's Focus" — top 3 high-priority actions

### FR-9: Skill Integration
- FR-9.1: Wire existing skills to deal operations:
  - `deal-create` → FR-1.1
  - `communication-capture` → FR-2.1
  - `communication-parse` → FR-2.4
  - `stakeholder-add` → FR-5.1
  - `pain-point-extraction` → FR-3.1
  - `budget-timeline-extraction` → FR-3.1
  - `stakeholder-sentiment` → FR-5.3
  - `ai-maturity-assessment` → FR-4.1
  - `competitive-intel` → FR-3.1
  - `deal-scoring` → FR-4
  - `champion-scoring` → FR-4.2
  - `use-case-clarity` → FR-4.3
  - `risk-assessment` → FR-7.6
  - `next-best-action` → FR-6

### FR-10: Loop Integration
- FR-10.1: Support invoking sales loops on deals:
  - `deal-intake-loop` — new deal creation
  - `discovery-loop` — meeting workflows
  - `intelligence-loop` — communication processing
  - `champion-loop` — champion enablement
  - `deal-review-loop` — single deal review
  - `pipeline-loop` — weekly pipeline review
  - `close-prep-loop` — close preparation

## Non-Functional Requirements

### NFR-1: Storage
- File-based JSON storage in `deals/` directory
- No external database required for MVP

### NFR-2: Integration
- Runs within orchestrator infrastructure
- Uses existing MCP tools and services
- Dashboard extends existing `apps/dashboard`

### NFR-3: Performance
- Deal operations complete in <2s
- Intelligence extraction via Claude completes in <10s
- Pipeline dashboard loads in <1s

## Success Metrics

| Metric | Target |
|--------|--------|
| Deal creation to first NBA | <30 seconds |
| Intelligence extraction accuracy | >85% relevant signals captured |
| NBA relevance | >70% of suggested actions rated useful |
| Sales cycle compression | 6mo → <4mo (future measurement) |
| Win rate improvement | +15-20% (future measurement) |

## Out of Scope (MVP)

- Gmail integration (manual capture only)
- Meeting tool integrations (Limitless, Granola, Gemini)
- Email sending from KnoPilot
- Mobile app
- Team collaboration features
- Demo agent integration
- Contracting agent integration

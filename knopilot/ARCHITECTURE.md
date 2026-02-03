# KnoPilot Architecture

## Overview

KnoPilot is a sales intelligence module that runs within the orchestrator infrastructure. It provides deal management, intelligence extraction, scoring, and next-best-action recommendations.

## System Context

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORCHESTRATOR                                       │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │   Existing   │    │   KnoPilot   │    │  Dashboard   │                  │
│  │   Services   │◄───│   Service    │───►│   (Next.js)  │                  │
│  │              │    │              │    │              │                  │
│  │ • SkillReg   │    │ • Deals      │    │ • /knopilot  │                  │
│  │ • Execution  │    │ • Intel      │    │ • /deals/:id │                  │
│  │ • Memory     │    │ • Scoring    │    │              │                  │
│  └──────────────┘    │ • NBA        │    └──────────────┘                  │
│                      └──────────────┘                                       │
│                             │                                               │
│                             ▼                                               │
│                      ┌──────────────┐                                       │
│                      │    deals/    │                                       │
│                      │  (file sys)  │                                       │
│                      └──────────────┘                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
orchestrator/
├── src/
│   └── services/
│       └── knopilot/
│           ├── KnoPilotService.ts      # Main service
│           ├── DealManager.ts          # Deal CRUD operations
│           ├── IntelligenceExtractor.ts # Claude-powered extraction
│           ├── ScoringEngine.ts        # Score calculations
│           ├── NBAEngine.ts            # Next-best-action generation
│           ├── types.ts                # TypeScript interfaces
│           └── index.ts                # Exports
│   └── tools/
│       └── knopilotTools.ts            # MCP tool handlers
│   └── server/
│       └── routes/
│           └── knopilot.ts             # API routes
├── deals/                              # Deal data storage
│   ├── index.json                      # Deal index
│   └── {deal-id}/
│       ├── deal.json
│       ├── stakeholders.json
│       ├── scores.json
│       ├── nba.json
│       ├── communications/
│       │   ├── index.json
│       │   └── {comm-id}.json
│       └── intelligence/
│           ├── pain-points.json
│           ├── ai-maturity.json
│           ├── budget-timeline.json
│           ├── stakeholder-intel.json
│           ├── technical-reqs.json
│           ├── use-case.json
│           └── competitive.json
├── apps/
│   └── dashboard/
│       └── app/
│           └── knopilot/
│               ├── page.tsx            # Pipeline dashboard
│               └── deals/
│                   └── [id]/
│                       └── page.tsx    # Deal view
└── knopilot/
    ├── REQUIREMENTS.md
    ├── FEATURESPEC.md
    └── ARCHITECTURE.md
```

## Component Architecture

### 1. KnoPilotService

Main orchestration service that coordinates all operations.

```typescript
class KnoPilotService {
  private dealManager: DealManager;
  private intelligenceExtractor: IntelligenceExtractor;
  private scoringEngine: ScoringEngine;
  private nbaEngine: NBAEngine;

  // Initialization
  async initialize(): Promise<void>;

  // Deal operations
  async createDeal(input: CreateDealInput): Promise<Deal>;
  async getDeal(dealId: string): Promise<DealView>;
  async listDeals(filter?: DealFilter): Promise<Deal[]>;
  async updateDeal(dealId: string, update: Partial<Deal>): Promise<Deal>;
  async advanceStage(dealId: string, reason?: string): Promise<Deal>;

  // Communication
  async addCommunication(dealId: string, comm: CommunicationInput): Promise<Communication>;
  async processCommunication(dealId: string, commId: string): Promise<void>;

  // Intelligence & Scoring
  async computeScores(dealId: string): Promise<DealScores>;
  async generateNBA(dealId: string): Promise<DealNBA>;

  // Pipeline
  async getPipelineSummary(): Promise<PipelineSummary>;
  async getWeeklyFocus(): Promise<WeeklyFocus>;
}
```

### 2. DealManager

Handles CRUD operations for deals and related entities.

```typescript
class DealManager {
  private dealsDir: string = 'deals';

  async create(input: CreateDealInput): Promise<Deal>;
  async get(dealId: string): Promise<Deal | null>;
  async list(filter?: DealFilter): Promise<Deal[]>;
  async update(dealId: string, update: Partial<Deal>): Promise<Deal>;
  async delete(dealId: string): Promise<void>;

  // Stakeholders
  async addStakeholder(dealId: string, stakeholder: StakeholderInput): Promise<Stakeholder>;
  async updateStakeholder(dealId: string, stakeholderId: string, update: Partial<Stakeholder>): Promise<Stakeholder>;

  // Communications
  async addCommunication(dealId: string, comm: CommunicationInput): Promise<Communication>;
  async getCommunications(dealId: string): Promise<Communication[]>;

  // Index management
  async rebuildIndex(): Promise<void>;
}
```

### 3. IntelligenceExtractor

Uses Claude to extract structured intelligence from communications.

```typescript
class IntelligenceExtractor {
  async extract(dealId: string, communication: Communication): Promise<ExtractedIntelligence>;

  // Individual extractors
  private extractPainPoints(content: string): Promise<PainPoint[]>;
  private extractAIMaturity(content: string): Promise<AIMaturitySignals>;
  private extractBudgetTimeline(content: string): Promise<BudgetTimelineSignals>;
  private extractStakeholderIntel(content: string): Promise<StakeholderIntelligence[]>;
  private extractTechnicalReqs(content: string): Promise<TechnicalRequirement[]>;
  private extractUseCaseClarity(content: string): Promise<UseCaseSignals>;
  private extractCompetitiveIntel(content: string): Promise<CompetitiveSignals>;

  // Merge with existing intelligence
  private mergeIntelligence(existing: DealIntelligence, extracted: ExtractedIntelligence): DealIntelligence;
}
```

### 4. ScoringEngine

Computes the 9 custom properties using formulas from the KnoPilot framework.

```typescript
class ScoringEngine {
  computeAll(deal: Deal, intelligence: DealIntelligence, stakeholders: Stakeholder[]): DealScores;

  // Individual score calculations
  computeAIReadiness(intelligence: DealIntelligence): AIReadinessScore;
  computeChampionStrength(stakeholders: Stakeholder[]): ChampionStrength;
  computeUseCaseClarity(intelligence: DealIntelligence): UseCaseClarity;
  computeDecisionTimeline(intelligence: DealIntelligence): DecisionTimeline;
  computeBudgetRange(intelligence: DealIntelligence): BudgetRange;
  computePrimaryPainPoint(intelligence: DealIntelligence): PrimaryPainPoint;
  computeTechnicalComplexity(intelligence: DealIntelligence): TechnicalComplexity;
  computeCompetitiveThreat(intelligence: DealIntelligence): CompetitiveThreat;
  computeDealConfidence(scores: Partial<DealScores>, intelligence: DealIntelligence): number;
}
```

### 5. NBAEngine

Generates and ranks next-best-actions.

```typescript
class NBAEngine {
  async generate(deal: Deal, scores: DealScores, intelligence: DealIntelligence, stakeholders: Stakeholder[]): Promise<DealNBA>;

  // Action generation by stage
  private getActionsForStage(stage: DealStage): ActionTemplate[];

  // Scoring
  private scoreAction(action: ActionCandidate, context: DealContext): NextBestAction;

  // Formula: NBA = Likelihood×0.4 + EffortFactor×0.3 + ChampionValue×0.3
  private calculateNBAScore(likelihood: number, effort: Effort, championValue: number): number;

  // Risk detection
  private detectRisks(deal: Deal, scores: DealScores, stakeholders: Stakeholder[]): string[];
}
```

## Data Flow

### Deal Creation Flow

```
POST /api/knopilot/deals
        │
        ▼
┌─────────────────┐
│  DealManager    │
│  .create()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ deals/{id}/     │
│ deal.json       │
│ stakeholders.json (empty)
│ scores.json (initial)
│ nba.json (initial)
└─────────────────┘
```

### Intelligence Extraction Flow

```
POST /api/knopilot/deals/:id/communications/:commId/process
        │
        ▼
┌─────────────────┐
│ Intelligence    │
│ Extractor       │◄──── Claude API
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌─────────────────┐
│ intelligence/   │      │  Scoring        │
│ *.json files    │─────►│  Engine         │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ scores.json     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  NBA Engine     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ nba.json        │
                         └─────────────────┘
```

### Pipeline Query Flow

```
GET /api/knopilot/pipeline
        │
        ▼
┌─────────────────┐
│  DealManager    │
│  .list()        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aggregate:      │
│ • Total value   │
│ • By stage      │
│ • Avg confidence│
│ • Priority sort │
└─────────────────┘
```

## API Design

### RESTful Endpoints

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/knopilot/deals` | `listDeals` |
| POST | `/api/knopilot/deals` | `createDeal` |
| GET | `/api/knopilot/deals/:id` | `getDeal` |
| PATCH | `/api/knopilot/deals/:id` | `updateDeal` |
| POST | `/api/knopilot/deals/:id/advance` | `advanceStage` |
| GET | `/api/knopilot/deals/:id/communications` | `listCommunications` |
| POST | `/api/knopilot/deals/:id/communications` | `addCommunication` |
| POST | `/api/knopilot/deals/:id/communications/:commId/process` | `processCommunication` |
| GET | `/api/knopilot/deals/:id/stakeholders` | `listStakeholders` |
| POST | `/api/knopilot/deals/:id/stakeholders` | `addStakeholder` |
| PATCH | `/api/knopilot/deals/:id/stakeholders/:sid` | `updateStakeholder` |
| GET | `/api/knopilot/deals/:id/intelligence` | `getIntelligence` |
| GET | `/api/knopilot/deals/:id/scores` | `getScores` |
| POST | `/api/knopilot/deals/:id/scores/compute` | `computeScores` |
| GET | `/api/knopilot/deals/:id/nba` | `getNBA` |
| POST | `/api/knopilot/deals/:id/nba/generate` | `generateNBA` |
| GET | `/api/knopilot/pipeline` | `getPipelineSummary` |
| GET | `/api/knopilot/pipeline/focus` | `getWeeklyFocus` |

### MCP Tools

| Tool | Description |
|------|-------------|
| `knopilot_create_deal` | Create a new deal |
| `knopilot_get_deal` | Get deal with full view |
| `knopilot_list_deals` | List deals with filtering |
| `knopilot_update_deal` | Update deal properties |
| `knopilot_advance_stage` | Move deal to next stage |
| `knopilot_add_communication` | Add email/meeting notes |
| `knopilot_process_communication` | Extract intelligence |
| `knopilot_add_stakeholder` | Add stakeholder to deal |
| `knopilot_update_stakeholder` | Update stakeholder |
| `knopilot_get_intelligence` | Get all extracted intelligence |
| `knopilot_compute_scores` | Recompute deal scores |
| `knopilot_generate_nba` | Generate next-best-actions |
| `knopilot_get_pipeline` | Get pipeline summary |
| `knopilot_get_weekly_focus` | Get this week's focus |
| `knopilot_run_loop` | Run a sales loop on a deal |

## Scoring Formulas

### AI Readiness Score (0-100)

```typescript
aiReadiness = executiveMandate + technicalCapability + useCaseClarity + budgetTimeline;

// Each component: 0-25 points
executiveMandate:
  - Board mandate / C-level backing: 25
  - VP-level sponsorship: 20
  - Manager interest: 10
  - Just exploring: 5

technicalCapability:
  - Strong internal AI team: 25
  - Some internal capability: 15
  - No internal capability but open: 10
  - Resistant to external: 5

useCaseClarity:
  - Scoped with requirements: 25
  - Defined use case: 15
  - Exploring AI generally: 5

budgetTimeline:
  - Budget confirmed + timeline set: 25
  - Budget approved, timeline unclear: 15
  - Exploring budget: 5
```

### Deal Confidence (0-100%)

```typescript
dealConfidence =
  championStrength +      // 0-20
  budgetConfirmed +       // 0-15
  technicalFit +          // 0-15
  stakeholderEngagement + // 0-20
  competitivePosition +   // 0-15
  decisionClarity;        // 0-15

championStrength:
  - Executive Sponsor: 20
  - Strong: 15
  - Moderate: 10
  - Weak: 5

budgetConfirmed:
  - Yes: 15
  - Partially: 10
  - No: 5

technicalFit:
  - Low complexity: 15
  - Medium complexity: 10
  - High complexity: 5

stakeholderEngagement:
  - Multiple engaged: 20
  - Champion engaged: 15
  - Single contact: 10
  - Unresponsive: 5

competitivePosition:
  - No competition: 15
  - Low threat: 12
  - Medium threat: 8
  - High threat: 5

decisionClarity:
  - Immediate: 15
  - This quarter: 12
  - Next quarter: 8
  - Long-term/unknown: 5
```

### NBA Score

```typescript
nbaScore = (likelihood * 0.4) + (effortFactor * 0.3) + (championValue * 0.3);

effortFactor:
  - Low: 100
  - Medium: 60
  - High: 30
```

## Dashboard Pages

### Pipeline Page (`/knopilot`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KnoPilot Pipeline                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Total Value │  │ Deals       │  │ Avg Conf    │  │ At Risk     │        │
│  │ $2.4M       │  │ 33          │  │ 64%         │  │ 3           │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Stage Distribution                                                         │
│  ┌────────┬────────┬────────┬────────┬────────┐                            │
│  │ Lead   │ Target │ Disc.  │ Contr. │ Prod.  │                            │
│  │  12    │   8    │   6    │   3    │   4    │                            │
│  └────────┴────────┴────────┴────────┴────────┘                            │
│                                                                             │
│  This Week's Focus                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 1. ShopCo: Create CFO one-pager (before budget review Friday)       │   │
│  │ 2. BigBank: Complete security questionnaire                         │   │
│  │ 3. RetailMart: Re-engage CTO (14 days since contact)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Prioritized Deals                                                          │
│  ┌──────────────────┬──────────┬───────────┬────────┬─────────┬─────────┐  │
│  │ Deal             │ Company  │ Stage     │ Conf.  │ Value   │ Action  │  │
│  ├──────────────────┼──────────┼───────────┼────────┼─────────┼─────────┤  │
│  │ E-commerce Ret.  │ ShopCo   │ Discovery │ 68%    │ $350K   │ CFO... │  │
│  │ Contact Center   │ BigBank  │ Contract. │ 82%    │ $500K   │ Legal..│  │
│  │ Tier 1 Bot       │ RetailM. │ Discovery │ 54%    │ $200K   │ Re-eng.│  │
│  └──────────────────┴──────────┴───────────┴────────┴─────────┴─────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Deal Page (`/knopilot/deals/:id`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ShopCo: E-commerce Returns Automation                                      │
│  Discovery • $350K • 68% Confidence                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Intelligence ───────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  AI Readiness: 72/100    Champion: Strong    Use Case: Defined         │ │
│  │  Timeline: This Quarter  Budget: $100K-$500K Pain: Volume/Capacity     │ │
│  │  Tech Complexity: Medium Competitive: Low                              │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─── Stakeholders ───────────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  Sarah Chen       VP Customer Experience   Champion    Supportive      │ │
│  │  Michael Torres   CTO                      Decision    Neutral         │ │
│  │  Lisa Park        CFO                      Decision    Skeptical       │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─── Next Best Actions ──────────────────────────────────────────────────┐ │
│  │                                                                         │ │
│  │  1. Create executive one-pager for CFO Lisa Park          NBA: 92     │ │
│  │     → Addresses ROI concerns, enables Sarah to sell up                 │ │
│  │                                                                         │ │
│  │  2. Schedule technical call with CTO Michael Torres       NBA: 88     │ │
│  │     → Address integration concerns early                               │ │
│  │                                                                         │ │
│  │  3. Send Shopify + Okta integration case study            NBA: 84     │ │
│  │     → Proves we've solved their exact tech stack                       │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─── Risk Factors ───────────────────────────────────────────────────────┐ │
│  │  ⚠️ CTO not yet engaged — Technical decision-maker still unaware       │ │
│  │  ⚠️ CFO skeptical on ROI — Budget approval at risk                     │ │
│  │  ⚠️ Tight timeline (Q2) — Only 4 months to deploy                      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage | File-based JSON | Simple, no DB setup, works for MVP scale |
| Service Layer | TypeScript classes | Matches existing orchestrator patterns |
| API | Express routes | Extends existing HTTP server |
| Dashboard | Next.js pages | Extends existing dashboard app |
| Intelligence | Claude API | Already integrated in orchestrator |

## Security Considerations

- Deal data stored locally (file system)
- No external API keys stored in deal files
- Claude API calls use existing orchestrator credentials
- Dashboard follows existing auth patterns (if any)

## Performance Considerations

- Deal index for fast lookups without scanning all deal directories
- Intelligence extraction is async (don't block on Claude calls)
- Scores computed on-demand with caching in scores.json
- NBA regenerated when scores change

## Future Extensibility

- Gmail integration: Add email webhook handler
- Meeting tools: Add transcript upload endpoint
- Demo agent: Trigger via skill invocation
- CRM sync: Export deals to external CRM

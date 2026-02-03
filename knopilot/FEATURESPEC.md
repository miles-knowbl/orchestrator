# KnoPilot Feature Specification

## 1. Overview

KnoPilot is an AI-powered sales intelligence system built on the orchestrator infrastructure. It provides deal management, intelligence extraction, scoring, and next-best-action recommendations using the existing 24 sales skills and 7 sales loops.

## 2. Goals

1. **Working Demo**: Functional sales intelligence system demonstrating KnoPilot concepts
2. **Skill Integration**: Wire existing 24 sales skills to real deal operations
3. **Loop Integration**: Enable 7 sales loops to execute against deal data
4. **Dashboard**: Extend orchestrator dashboard with deal and pipeline views

## 3. User Stories

### US-1: Deal Management
As a sales rep, I want to create and manage deals so I can track my pipeline.

### US-2: Intelligence Capture
As a sales rep, I want to capture communications and have intelligence extracted automatically so I don't have to manually track deal signals.

### US-3: Scoring
As a sales rep, I want to see computed scores (AI readiness, champion strength, deal confidence) so I can prioritize my time.

### US-4: Next Best Actions
As a sales rep, I want ranked action recommendations so I know exactly what to do next on each deal.

### US-5: Pipeline View
As a sales manager, I want to see pipeline health and prioritized deals so I can coach my team effectively.

## 4. Architecture

### 4.1 Data Model

```
deals/
├── {deal-id}/
│   ├── deal.json           # Core deal record
│   ├── stakeholders.json   # Stakeholder map
│   ├── scores.json         # Computed scores (9 properties)
│   ├── nba.json            # Current next-best-actions
│   ├── communications/
│   │   ├── {comm-id}.json  # Individual communications
│   │   └── index.json      # Communication index
│   └── intelligence/
│       ├── pain-points.json
│       ├── ai-maturity.json
│       ├── budget-timeline.json
│       ├── stakeholder-intel.json
│       ├── technical-reqs.json
│       ├── use-case.json
│       └── competitive.json
└── index.json              # Deal index for fast lookups
```

### 4.2 Deal Schema

```typescript
interface Deal {
  id: string;
  name: string;
  company: string;
  industry?: string;
  stage: 'lead' | 'target' | 'discovery' | 'contracting' | 'production';
  value?: number;
  createdAt: string;
  updatedAt: string;
  lastInteractionDate?: string;
  daysInStage: number;
  stageHistory: StageTransition[];
}

interface StageTransition {
  from: string;
  to: string;
  at: string;
  reason?: string;
}
```

### 4.3 Scores Schema

```typescript
interface DealScores {
  dealId: string;
  updatedAt: string;

  // 9 Custom Properties from KnoPilot Framework
  aiReadinessScore: number;           // 0-100
  championStrength: 'weak' | 'moderate' | 'strong' | 'executive-sponsor';
  useCaseClarity: 'exploring' | 'defined' | 'scoped';
  decisionTimeline: 'immediate' | 'this-quarter' | 'next-quarter' | 'long-term' | 'unknown';
  budgetRange: '<100k' | '100k-500k' | '500k-1m' | '1m+' | 'unknown';
  primaryPainPoint: 'volume' | 'cost' | 'cx' | 'compliance' | 'innovation' | 'other';
  technicalComplexity: 'low' | 'medium' | 'high';
  competitiveThreat: 'none' | 'low' | 'medium' | 'high';
  dealConfidence: number;             // 0-100%

  // Breakdown for AI Readiness
  aiReadinessBreakdown: {
    executiveMandate: number;         // 0-25
    technicalCapability: number;      // 0-25
    useCaseClarity: number;           // 0-25
    budgetTimeline: number;           // 0-25
  };

  // Breakdown for Deal Confidence
  confidenceFactors: {
    championStrength: number;
    budgetConfirmed: number;
    technicalFit: number;
    stakeholderEngagement: number;
    competitivePosition: number;
    decisionClarity: number;
  };
}
```

### 4.4 Stakeholder Schema

```typescript
interface Stakeholder {
  id: string;
  name: string;
  title: string;
  email?: string;
  role: 'champion' | 'decision-maker' | 'influencer' | 'blocker';
  sentiment: 'supportive' | 'neutral' | 'skeptical';
  lastInteraction?: string;
  keyQuotes: string[];
  concerns: string[];
}
```

### 4.5 NBA Schema

```typescript
interface NextBestAction {
  id: string;
  action: string;
  nbaScore: number;               // Composite score
  likelihood: number;             // 0-100
  effort: 'low' | 'medium' | 'high';
  effortFactor: number;           // 100/60/30
  championValue: number;          // 0-100
  primaryImpact: string;          // Who benefits most
  secondaryImpact?: string;       // Who else is influenced
  timing: string;                 // When to do this
  reasoning: string;              // Why this action matters
  stageAppropriate: boolean;      // Is this right for current stage
}

interface DealNBA {
  dealId: string;
  generatedAt: string;
  stage: string;
  actions: NextBestAction[];      // Top 5, ranked by nbaScore
  risks: string[];                // Auto-detected deal risks
}
```

### 4.6 Intelligence Schema

```typescript
interface PainPoints {
  dealId: string;
  updatedAt: string;
  items: {
    category: 'volume' | 'security' | 'knowledge-base' | 'legacy' | 'compliance' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high';
    source: string;               // Which communication
    extractedAt: string;
  }[];
}

interface AIMaturity {
  dealId: string;
  updatedAt: string;
  stage: 'exploring' | 'board-mandate' | 'prior-attempts' | 'internal-team';
  priorAttempts: { vendor: string; outcome: string; }[];
  internalCapability: 'none' | 'limited' | 'strong';
  timelineUrgency: 'low' | 'medium' | 'high';
  signals: { signal: string; source: string; }[];
}

interface BudgetTimeline {
  dealId: string;
  updatedAt: string;
  budgetRange?: string;
  budgetConfirmed: boolean;
  fiscalYearEnd?: string;
  decisionDeadline?: string;
  procurementProcess?: string;
  signals: { signal: string; source: string; }[];
}
```

## 5. Service Architecture

### 5.1 KnoPilotService

Main service coordinating deal operations.

```typescript
class KnoPilotService {
  // Deal CRUD
  createDeal(input: CreateDealInput): Promise<Deal>;
  getDeal(dealId: string): Promise<DealView>;
  listDeals(filter?: DealFilter): Promise<Deal[]>;
  updateDeal(dealId: string, update: Partial<Deal>): Promise<Deal>;
  advanceStage(dealId: string, reason?: string): Promise<Deal>;

  // Communication
  addCommunication(dealId: string, comm: CommunicationInput): Promise<Communication>;
  listCommunications(dealId: string): Promise<Communication[]>;

  // Intelligence
  extractIntelligence(dealId: string, commId: string): Promise<void>;
  getIntelligence(dealId: string): Promise<DealIntelligence>;

  // Scoring
  computeScores(dealId: string): Promise<DealScores>;
  getScores(dealId: string): Promise<DealScores>;

  // Stakeholders
  addStakeholder(dealId: string, stakeholder: StakeholderInput): Promise<Stakeholder>;
  updateStakeholder(dealId: string, stakeholderId: string, update: Partial<Stakeholder>): Promise<Stakeholder>;

  // NBA
  generateNBA(dealId: string): Promise<DealNBA>;
  getNBA(dealId: string): Promise<DealNBA>;

  // Pipeline
  getPipelineSummary(): Promise<PipelineSummary>;
  getWeeklyFocus(): Promise<WeeklyFocus>;
}
```

### 5.2 Skill Wiring

Skills execute via the orchestrator's existing skill execution infrastructure. KnoPilotService orchestrates skill calls:

| Method | Skills Invoked |
|--------|----------------|
| `createDeal` | `deal-create` |
| `addCommunication` | `communication-capture` |
| `extractIntelligence` | `communication-parse`, `pain-point-extraction`, `budget-timeline-extraction`, `ai-maturity-assessment`, `competitive-intel` |
| `computeScores` | `deal-scoring`, `champion-scoring`, `use-case-clarity`, `risk-assessment` |
| `addStakeholder` | `stakeholder-add`, `stakeholder-sentiment` |
| `generateNBA` | `next-best-action` |

## 6. MCP Tools

### 6.1 Deal Tools

| Tool | Description |
|------|-------------|
| `knopilot_create_deal` | Create a new deal |
| `knopilot_get_deal` | Get deal with full view |
| `knopilot_list_deals` | List deals with filtering |
| `knopilot_update_deal` | Update deal properties |
| `knopilot_advance_stage` | Move deal to next stage |

### 6.2 Communication Tools

| Tool | Description |
|------|-------------|
| `knopilot_add_communication` | Add email/meeting notes to deal |
| `knopilot_list_communications` | List deal communications |
| `knopilot_process_communication` | Extract intelligence from communication |

### 6.3 Stakeholder Tools

| Tool | Description |
|------|-------------|
| `knopilot_add_stakeholder` | Add stakeholder to deal |
| `knopilot_update_stakeholder` | Update stakeholder sentiment/role |

### 6.4 Intelligence Tools

| Tool | Description |
|------|-------------|
| `knopilot_get_intelligence` | Get all extracted intelligence |
| `knopilot_compute_scores` | Recompute deal scores |
| `knopilot_generate_nba` | Generate next-best-actions |

### 6.5 Pipeline Tools

| Tool | Description |
|------|-------------|
| `knopilot_get_pipeline` | Get pipeline summary |
| `knopilot_get_weekly_focus` | Get this week's focus actions |

## 7. API Endpoints

### 7.1 Deal Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knopilot/deals` | List deals |
| POST | `/api/knopilot/deals` | Create deal |
| GET | `/api/knopilot/deals/:id` | Get deal view |
| PATCH | `/api/knopilot/deals/:id` | Update deal |
| POST | `/api/knopilot/deals/:id/advance` | Advance stage |

### 7.2 Communication Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knopilot/deals/:id/communications` | List communications |
| POST | `/api/knopilot/deals/:id/communications` | Add communication |
| POST | `/api/knopilot/deals/:id/communications/:commId/process` | Process/extract |

### 7.3 Stakeholder Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knopilot/deals/:id/stakeholders` | List stakeholders |
| POST | `/api/knopilot/deals/:id/stakeholders` | Add stakeholder |
| PATCH | `/api/knopilot/deals/:id/stakeholders/:stakeholderId` | Update |

### 7.4 Intelligence Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knopilot/deals/:id/intelligence` | Get intelligence |
| GET | `/api/knopilot/deals/:id/scores` | Get scores |
| POST | `/api/knopilot/deals/:id/scores/compute` | Recompute scores |
| GET | `/api/knopilot/deals/:id/nba` | Get NBA |
| POST | `/api/knopilot/deals/:id/nba/generate` | Generate NBA |

### 7.5 Pipeline Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/knopilot/pipeline` | Pipeline summary |
| GET | `/api/knopilot/pipeline/focus` | Weekly focus |

## 8. Dashboard Pages

### 8.1 Pipeline Page (`/knopilot`)

- Pipeline health metrics (total value, deal counts, avg confidence)
- Stage distribution visualization
- Prioritized deal list
- Weekly focus panel

### 8.2 Deal Page (`/knopilot/deals/:id`)

- Deal summary card
- Intelligence dashboard (9 properties)
- Stakeholder map
- Communication timeline
- NBA panel
- Risk factors

## 9. Skill Implementation Updates

The existing 24 sales skills need minor updates to read/write deal files:

### 9.1 deal-create
- Input: company, name, value, stage
- Output: writes `deals/{id}/deal.json`

### 9.2 communication-capture
- Input: dealId, type, content, metadata
- Output: writes `deals/{dealId}/communications/{id}.json`

### 9.3 communication-parse
- Input: dealId, commId
- Reads communication, extracts signals via Claude
- Output: writes to `deals/{dealId}/intelligence/*.json`

### 9.4 next-best-action
- Input: dealId
- Reads deal state, scores, intelligence
- Generates ranked actions via Claude using NBA formula
- Output: writes `deals/{dealId}/nba.json`

### 9.5 deal-scoring
- Input: dealId
- Reads all intelligence files
- Computes 9 properties using formulas from framework
- Output: writes `deals/{dealId}/scores.json`

## 10. NBA Formula Implementation

```typescript
function calculateNBAScore(action: ActionCandidate): number {
  const effortFactor = action.effort === 'low' ? 100
                     : action.effort === 'medium' ? 60
                     : 30;

  return (action.likelihood * 0.4)
       + (effortFactor * 0.3)
       + (action.championValue * 0.3);
}
```

## 11. AI Readiness Formula Implementation

```typescript
function calculateAIReadiness(intel: DealIntelligence): number {
  return (
    calculateMandateScore(intel.aiMaturity) +      // 0-25
    calculateCapabilityScore(intel.aiMaturity) +   // 0-25
    calculateUseCaseScore(intel.useCase) +         // 0-25
    calculateBudgetScore(intel.budgetTimeline)     // 0-25
  );
}
```

## 12. Deal Confidence Formula Implementation

```typescript
function calculateDealConfidence(scores: DealScores, intel: DealIntelligence): number {
  const factors = {
    championStrength: scoreChampion(scores.championStrength),    // 0-20
    budgetConfirmed: intel.budgetTimeline.budgetConfirmed ? 15 : 5,
    technicalFit: scoreTechnicalFit(scores.technicalComplexity), // 0-15
    stakeholderEngagement: scoreEngagement(intel),               // 0-20
    competitivePosition: scoreCompetitive(scores.competitiveThreat), // 0-15
    decisionClarity: scoreDecision(scores.decisionTimeline),     // 0-15
  };

  return Object.values(factors).reduce((a, b) => a + b, 0);
}
```

## 13. Sample Data

Include 2 seeded deals for demo:

### Deal 1: ShopCo E-commerce Returns
- Stage: Discovery
- Value: $350K
- Champion: Sarah Chen, VP Customer Experience
- Pain Point: 300% growth in support tickets
- AI Readiness: 72
- Deal Confidence: 68%

### Deal 2: BigBank Contact Center
- Stage: Contracting
- Value: $500K
- Champion: James Wilson, SVP Operations
- Pain Point: Cost per call too high
- AI Readiness: 85
- Deal Confidence: 82%

## 14. Implementation Phases

### Phase 1: Core (This Loop)
- [x] Data model and schemas
- [ ] KnoPilotService with file operations
- [ ] MCP tools (15 tools)
- [ ] API endpoints (15 endpoints)
- [ ] Skill wiring for deal operations
- [ ] Dashboard pages (pipeline + deal view)
- [ ] Sample data seeding

### Phase 2: Future
- Gmail integration
- Meeting tool integrations
- Demo agent integration
- Advanced analytics

## 15. Testing Strategy

- Unit tests for scoring formulas
- Integration tests for skill wiring
- E2E tests for deal lifecycle
- Dashboard component tests

## 16. Dependencies

- Existing orchestrator infrastructure
- Existing 24 sales skills
- Existing 7 sales loops
- Dashboard (Next.js)

## 17. Risks

| Risk | Mitigation |
|------|------------|
| Skill implementations incomplete | Skills write to files directly; update as needed |
| Claude latency for extraction | Cache intelligence; batch extractions |
| File system concurrency | Simple locking or accept eventual consistency |

## 18. Definition of Done

1. Can create deals via MCP tool or API
2. Can add communications and see extracted intelligence
3. Scores compute correctly per framework formulas
4. NBA generates ranked actions with proper scoring
5. Pipeline dashboard shows deal summary
6. Deal view shows full intelligence and NBA
7. 2 sample deals seeded for demo

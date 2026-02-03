/**
 * KnoPilot Types
 *
 * Type definitions for the KnoPilot sales intelligence system.
 */

// ============================================================================
// Deal Types
// ============================================================================

export type DealStage = 'lead' | 'target' | 'discovery' | 'contracting' | 'production';

export interface StageTransition {
  from: DealStage | null;
  to: DealStage;
  at: string;
  reason?: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  industry?: string;
  stage: DealStage;
  value?: number;
  createdAt: string;
  updatedAt: string;
  lastInteractionDate?: string;
  daysInStage: number;
  stageHistory: StageTransition[];
}

export interface CreateDealInput {
  name: string;
  company: string;
  industry?: string;
  stage?: DealStage;
  value?: number;
}

export interface DealFilter {
  stage?: DealStage;
  company?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
}

// ============================================================================
// Stakeholder Types
// ============================================================================

export type StakeholderRole = 'champion' | 'decision-maker' | 'influencer' | 'blocker';
export type StakeholderSentiment = 'supportive' | 'neutral' | 'skeptical';

export interface Stakeholder {
  id: string;
  name: string;
  title: string;
  email?: string;
  role: StakeholderRole;
  sentiment: StakeholderSentiment;
  lastInteraction?: string;
  keyQuotes: string[];
  concerns: string[];
}

export interface StakeholderInput {
  name: string;
  title: string;
  email?: string;
  role: StakeholderRole;
  sentiment?: StakeholderSentiment;
}

// ============================================================================
// Communication Types
// ============================================================================

export type CommunicationType = 'email' | 'meeting' | 'call' | 'note';

export interface Communication {
  id: string;
  dealId: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  participants?: string[];
  timestamp: string;
  createdAt: string;
  processed: boolean;
  extractedInsights?: string[];
}

export interface CommunicationInput {
  type: CommunicationType;
  subject?: string;
  content: string;
  participants?: string[];
  timestamp?: string;
}

// ============================================================================
// Intelligence Types
// ============================================================================

export type PainPointCategory = 'volume' | 'security' | 'knowledge-base' | 'legacy' | 'compliance' | 'other';
export type Severity = 'low' | 'medium' | 'high';

export interface PainPoint {
  category: PainPointCategory;
  description: string;
  severity: Severity;
  source: string;
  extractedAt: string;
}

export interface PainPointsIntelligence {
  dealId: string;
  updatedAt: string;
  items: PainPoint[];
}

export type AIMaturityStage = 'exploring' | 'board-mandate' | 'prior-attempts' | 'internal-team';
export type InternalCapability = 'none' | 'limited' | 'strong';

export interface AIMaturityIntelligence {
  dealId: string;
  updatedAt: string;
  stage: AIMaturityStage;
  priorAttempts: { vendor: string; outcome: string; }[];
  internalCapability: InternalCapability;
  timelineUrgency: Severity;
  signals: { signal: string; source: string; }[];
}

export interface BudgetTimelineIntelligence {
  dealId: string;
  updatedAt: string;
  budgetRange?: string;
  budgetConfirmed: boolean;
  fiscalYearEnd?: string;
  decisionDeadline?: string;
  procurementProcess?: string;
  signals: { signal: string; source: string; }[];
}

export interface StakeholderIntelItem {
  name: string;
  role?: string;
  sentiment?: string;
  influence?: string;
  source: string;
}

export interface StakeholderIntelligence {
  dealId: string;
  updatedAt: string;
  items: StakeholderIntelItem[];
}

export interface TechnicalRequirement {
  category: string;
  requirement: string;
  priority: Severity;
  source: string;
}

export interface TechnicalReqsIntelligence {
  dealId: string;
  updatedAt: string;
  items: TechnicalRequirement[];
}

export interface UseCaseIntelligence {
  dealId: string;
  updatedAt: string;
  clarity: 'exploring' | 'defined' | 'scoped';
  primaryUseCase?: string;
  secondaryUseCases: string[];
  signals: { signal: string; source: string; }[];
}

export interface CompetitiveIntelligence {
  dealId: string;
  updatedAt: string;
  competitors: { name: string; status: string; }[];
  buildVsBuy?: string;
  previousVendorFailures: string[];
  signals: { signal: string; source: string; }[];
}

export interface DealIntelligence {
  painPoints: PainPointsIntelligence;
  aiMaturity: AIMaturityIntelligence;
  budgetTimeline: BudgetTimelineIntelligence;
  stakeholderIntel: StakeholderIntelligence;
  technicalReqs: TechnicalReqsIntelligence;
  useCase: UseCaseIntelligence;
  competitive: CompetitiveIntelligence;
}

export interface ExtractedIntelligence {
  painPoints: PainPoint[];
  aiMaturity: Partial<AIMaturityIntelligence>;
  budgetTimeline: Partial<BudgetTimelineIntelligence>;
  stakeholderIntel: StakeholderIntelItem[];
  technicalReqs: TechnicalRequirement[];
  useCase: Partial<UseCaseIntelligence>;
  competitive: Partial<CompetitiveIntelligence>;
}

// ============================================================================
// Scoring Types
// ============================================================================

export type ChampionStrength = 'weak' | 'moderate' | 'strong' | 'executive-sponsor';
export type UseCaseClarity = 'exploring' | 'defined' | 'scoped';
export type DecisionTimeline = 'immediate' | 'this-quarter' | 'next-quarter' | 'long-term' | 'unknown';
export type BudgetRange = '<100k' | '100k-500k' | '500k-1m' | '1m+' | 'unknown';
export type PrimaryPainPoint = 'volume' | 'cost' | 'cx' | 'compliance' | 'innovation' | 'other';
export type TechnicalComplexity = 'low' | 'medium' | 'high';
export type CompetitiveThreat = 'none' | 'low' | 'medium' | 'high';

export interface AIReadinessBreakdown {
  executiveMandate: number;    // 0-25
  technicalCapability: number; // 0-25
  useCaseClarity: number;      // 0-25
  budgetTimeline: number;      // 0-25
}

export interface ConfidenceFactors {
  championStrength: number;      // 0-20
  budgetConfirmed: number;       // 0-15
  technicalFit: number;          // 0-15
  stakeholderEngagement: number; // 0-20
  competitivePosition: number;   // 0-15
  decisionClarity: number;       // 0-15
}

export interface DealScores {
  dealId: string;
  updatedAt: string;

  // 9 Custom Properties
  aiReadinessScore: number;              // 0-100
  championStrength: ChampionStrength;
  useCaseClarity: UseCaseClarity;
  decisionTimeline: DecisionTimeline;
  budgetRange: BudgetRange;
  primaryPainPoint: PrimaryPainPoint;
  technicalComplexity: TechnicalComplexity;
  competitiveThreat: CompetitiveThreat;
  dealConfidence: number;                // 0-100

  // Breakdowns
  aiReadinessBreakdown: AIReadinessBreakdown;
  confidenceFactors: ConfidenceFactors;
}

// ============================================================================
// NBA Types
// ============================================================================

export type Effort = 'low' | 'medium' | 'high';

export interface NextBestAction {
  id: string;
  action: string;
  nbaScore: number;
  likelihood: number;           // 0-100
  effort: Effort;
  effortFactor: number;         // 100/60/30
  championValue: number;        // 0-100
  primaryImpact: string;
  secondaryImpact?: string;
  timing: string;
  reasoning: string;
  stageAppropriate: boolean;
}

export interface DealNBA {
  dealId: string;
  generatedAt: string;
  stage: DealStage;
  actions: NextBestAction[];
  risks: string[];
}

// ============================================================================
// View Types (Aggregated)
// ============================================================================

export interface DealView {
  deal: Deal;
  stakeholders: Stakeholder[];
  scores: DealScores;
  nba: DealNBA;
  intelligence: DealIntelligence;
  recentCommunications: Communication[];
}

export interface PipelineMetrics {
  totalValue: number;
  weightedValue: number;
  dealCount: number;
  avgConfidence: number;
  confidenceTrend: number;
  byStage: Record<DealStage, { count: number; value: number; }>;
  highConfidenceDeals: number;
  atRiskDeals: number;
}

export interface PrioritizedDeal {
  deal: Deal;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  topAction: string;
}

export interface PipelineSummary {
  metrics: PipelineMetrics;
  prioritizedDeals: PrioritizedDeal[];
  stageDistribution: { stage: DealStage; count: number; value: number; }[];
}

export interface FocusAction {
  dealId: string;
  dealName: string;
  company: string;
  stage: DealStage;
  action: string;
  reason: string;
  urgency: 'immediate' | 'this-week' | 'soon';
}

export interface WeeklyFocus {
  generatedAt: string;
  actions: FocusAction[];
}

// ============================================================================
// Index Types
// ============================================================================

export interface DealIndexEntry {
  id: string;
  name: string;
  company: string;
  stage: DealStage;
  value?: number;
  confidence?: number;
  updatedAt: string;
}

export interface DealsIndex {
  version: string;
  updatedAt: string;
  deals: DealIndexEntry[];
}

/**
 * KnoPilotService
 *
 * Main orchestration service for the KnoPilot sales intelligence system.
 * Coordinates deal management, intelligence extraction, scoring, and NBA generation.
 */

import { DealManager } from './DealManager.js';
import { ScoringEngine } from './ScoringEngine.js';
import { NBAEngine } from './NBAEngine.js';
import {
  Deal,
  CreateDealInput,
  DealFilter,
  DealView,
  Stakeholder,
  StakeholderInput,
  Communication,
  CommunicationInput,
  DealScores,
  DealNBA,
  DealIntelligence,
  PipelineSummary,
  PipelineMetrics,
  PrioritizedDeal,
  WeeklyFocus,
  FocusAction,
  DealStage,
} from './types.js';

export class KnoPilotService {
  private dealManager: DealManager;
  private scoringEngine: ScoringEngine;
  private nbaEngine: NBAEngine;
  private initialized: boolean = false;

  constructor(baseDir?: string) {
    this.dealManager = new DealManager(baseDir);
    this.scoringEngine = new ScoringEngine();
    this.nbaEngine = new NBAEngine();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.dealManager.initialize();
    this.initialized = true;
  }

  // ============================================================================
  // Deal Operations
  // ============================================================================

  async createDeal(input: CreateDealInput): Promise<Deal> {
    await this.initialize();
    return this.dealManager.create(input);
  }

  async getDeal(dealId: string): Promise<DealView | null> {
    await this.initialize();

    const deal = await this.dealManager.get(dealId);
    if (!deal) return null;

    const [stakeholders, scores, nba, intelligence, communications] = await Promise.all([
      this.dealManager.getStakeholders(dealId),
      this.dealManager.getScores(dealId),
      this.dealManager.getNBA(dealId),
      this.dealManager.getIntelligence(dealId),
      this.dealManager.getCommunications(dealId),
    ]);

    return {
      deal,
      stakeholders,
      scores,
      nba,
      intelligence,
      recentCommunications: communications.slice(0, 10),
    };
  }

  async listDeals(filter?: DealFilter): Promise<Deal[]> {
    await this.initialize();
    return this.dealManager.list(filter);
  }

  async updateDeal(dealId: string, update: Partial<Deal>): Promise<Deal> {
    await this.initialize();
    return this.dealManager.update(dealId, update);
  }

  async advanceStage(dealId: string, reason?: string): Promise<Deal> {
    await this.initialize();
    const deal = await this.dealManager.advanceStage(dealId, reason);

    // Regenerate NBA for new stage
    await this.generateNBA(dealId);

    return deal;
  }

  // ============================================================================
  // Communication Operations
  // ============================================================================

  async addCommunication(dealId: string, input: CommunicationInput): Promise<Communication> {
    await this.initialize();
    return this.dealManager.addCommunication(dealId, input);
  }

  async listCommunications(dealId: string): Promise<Communication[]> {
    await this.initialize();
    return this.dealManager.getCommunications(dealId);
  }

  async processCommunication(dealId: string, commId: string): Promise<void> {
    await this.initialize();

    // Get communications
    const communications = await this.dealManager.getCommunications(dealId);
    const comm = communications.find(c => c.id === commId);
    if (!comm) {
      throw new Error(`Communication not found: ${commId}`);
    }

    // For MVP, we'll do simple keyword-based extraction
    // In production, this would call Claude for intelligent extraction
    const insights = this.extractInsightsSimple(comm.content);

    // Mark as processed
    await this.dealManager.markCommunicationProcessed(dealId, commId, insights);

    // Update intelligence based on extracted insights
    const intelligence = await this.dealManager.getIntelligence(dealId);
    const updatedIntelligence = this.updateIntelligenceFromInsights(intelligence, insights, commId);
    await this.dealManager.saveIntelligence(dealId, updatedIntelligence);

    // Recompute scores and NBA
    await this.computeScores(dealId);
    await this.generateNBA(dealId);
  }

  // ============================================================================
  // Stakeholder Operations
  // ============================================================================

  async addStakeholder(dealId: string, input: StakeholderInput): Promise<Stakeholder> {
    await this.initialize();
    const stakeholder = await this.dealManager.addStakeholder(dealId, input);

    // Recompute scores (champion strength may change)
    await this.computeScores(dealId);
    await this.generateNBA(dealId);

    return stakeholder;
  }

  async updateStakeholder(
    dealId: string,
    stakeholderId: string,
    update: Partial<Stakeholder>
  ): Promise<Stakeholder> {
    await this.initialize();
    const stakeholder = await this.dealManager.updateStakeholder(dealId, stakeholderId, update);

    // Recompute scores
    await this.computeScores(dealId);
    await this.generateNBA(dealId);

    return stakeholder;
  }

  async listStakeholders(dealId: string): Promise<Stakeholder[]> {
    await this.initialize();
    return this.dealManager.getStakeholders(dealId);
  }

  // ============================================================================
  // Intelligence & Scoring
  // ============================================================================

  async getIntelligence(dealId: string): Promise<DealIntelligence> {
    await this.initialize();
    return this.dealManager.getIntelligence(dealId);
  }

  async getScores(dealId: string): Promise<DealScores> {
    await this.initialize();
    return this.dealManager.getScores(dealId);
  }

  async computeScores(dealId: string): Promise<DealScores> {
    await this.initialize();

    const [deal, intelligence, stakeholders] = await Promise.all([
      this.dealManager.get(dealId),
      this.dealManager.getIntelligence(dealId),
      this.dealManager.getStakeholders(dealId),
    ]);

    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const scores = this.scoringEngine.computeAll(deal, intelligence, stakeholders);
    await this.dealManager.saveScores(dealId, scores);

    return scores;
  }

  async getNBA(dealId: string): Promise<DealNBA> {
    await this.initialize();
    return this.dealManager.getNBA(dealId);
  }

  async generateNBA(dealId: string): Promise<DealNBA> {
    await this.initialize();

    const [deal, scores, intelligence, stakeholders] = await Promise.all([
      this.dealManager.get(dealId),
      this.dealManager.getScores(dealId),
      this.dealManager.getIntelligence(dealId),
      this.dealManager.getStakeholders(dealId),
    ]);

    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const nba = this.nbaEngine.generate(deal, scores, intelligence, stakeholders);
    await this.dealManager.saveNBA(dealId, nba);

    return nba;
  }

  // ============================================================================
  // Pipeline Operations
  // ============================================================================

  async getPipelineSummary(): Promise<PipelineSummary> {
    await this.initialize();

    const deals = await this.dealManager.list();

    // Compute metrics
    const metrics = await this.computePipelineMetrics(deals);

    // Get prioritized deals
    const prioritizedDeals = await this.getPrioritizedDeals(deals);

    // Stage distribution
    const stageDistribution = this.computeStageDistribution(deals);

    return {
      metrics,
      prioritizedDeals,
      stageDistribution,
    };
  }

  async getWeeklyFocus(): Promise<WeeklyFocus> {
    await this.initialize();

    const deals = await this.dealManager.list();
    const focusActions: FocusAction[] = [];

    for (const deal of deals) {
      const nba = await this.dealManager.getNBA(deal.id);

      if (nba.actions.length > 0) {
        const topAction = nba.actions[0];

        // Determine urgency
        let urgency: 'immediate' | 'this-week' | 'soon' = 'soon';
        if (topAction.timing.toLowerCase().includes('immediately') ||
            topAction.timing.toLowerCase().includes('now')) {
          urgency = 'immediate';
        } else if (topAction.timing.toLowerCase().includes('this week') ||
                   topAction.timing.toLowerCase().includes('before')) {
          urgency = 'this-week';
        }

        // Add high-priority actions
        if (topAction.nbaScore >= 75) {
          focusActions.push({
            dealId: deal.id,
            dealName: deal.name,
            company: deal.company,
            stage: deal.stage,
            action: topAction.action,
            reason: topAction.reasoning,
            urgency,
          });
        }
      }

      // Check for risk-based actions
      if (nba.risks.length > 0) {
        const coldRisk = nba.risks.find(r => r.includes('No contact') || r.includes('going cold'));
        if (coldRisk) {
          focusActions.push({
            dealId: deal.id,
            dealName: deal.name,
            company: deal.company,
            stage: deal.stage,
            action: 'Re-engage — deal showing signs of going cold',
            reason: coldRisk,
            urgency: 'immediate',
          });
        }
      }
    }

    // Sort by urgency and return top 5
    const sorted = focusActions.sort((a, b) => {
      const urgencyOrder = { 'immediate': 0, 'this-week': 1, 'soon': 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    return {
      generatedAt: new Date().toISOString(),
      actions: sorted.slice(0, 5),
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async computePipelineMetrics(deals: Deal[]): Promise<PipelineMetrics> {
    let totalValue = 0;
    let weightedValue = 0;
    let totalConfidence = 0;
    let highConfidenceCount = 0;
    let atRiskCount = 0;

    const byStage: Record<DealStage, { count: number; value: number }> = {
      lead: { count: 0, value: 0 },
      target: { count: 0, value: 0 },
      discovery: { count: 0, value: 0 },
      contracting: { count: 0, value: 0 },
      production: { count: 0, value: 0 },
    };

    for (const deal of deals) {
      const value = deal.value || 0;
      totalValue += value;

      const scores = await this.dealManager.getScores(deal.id);
      const confidence = scores.dealConfidence || 0;
      weightedValue += value * (confidence / 100);
      totalConfidence += confidence;

      if (confidence >= 75) highConfidenceCount++;

      // Check for at-risk deals
      const nba = await this.dealManager.getNBA(deal.id);
      if (nba.risks.length >= 2 || confidence < 40) {
        atRiskCount++;
      }

      byStage[deal.stage].count++;
      byStage[deal.stage].value += value;
    }

    return {
      totalValue,
      weightedValue,
      dealCount: deals.length,
      avgConfidence: deals.length > 0 ? Math.round(totalConfidence / deals.length) : 0,
      confidenceTrend: 0, // Would need historical data
      byStage,
      highConfidenceDeals: highConfidenceCount,
      atRiskDeals: atRiskCount,
    };
  }

  private async getPrioritizedDeals(deals: Deal[]): Promise<PrioritizedDeal[]> {
    const prioritized: PrioritizedDeal[] = [];

    for (const deal of deals) {
      const scores = await this.dealManager.getScores(deal.id);
      const nba = await this.dealManager.getNBA(deal.id);

      // Calculate priority based on value, confidence, and stage
      const value = deal.value || 0;
      const confidence = scores.dealConfidence || 0;
      const stageWeight = this.getStageWeight(deal.stage);

      const priorityScore = (value / 100000) * 0.3 + confidence * 0.4 + stageWeight * 0.3;

      let priority: 'high' | 'medium' | 'low' = 'low';
      if (priorityScore >= 70) priority = 'high';
      else if (priorityScore >= 40) priority = 'medium';

      prioritized.push({
        deal,
        confidence,
        priority,
        topAction: nba.actions.length > 0 ? nba.actions[0].action : 'No actions generated',
      });
    }

    // Sort by priority (high first) then by confidence
    return prioritized.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.confidence - a.confidence;
    });
  }

  private getStageWeight(stage: DealStage): number {
    const weights: Record<DealStage, number> = {
      production: 100,
      contracting: 80,
      discovery: 60,
      target: 40,
      lead: 20,
    };
    return weights[stage];
  }

  private computeStageDistribution(deals: Deal[]): { stage: DealStage; count: number; value: number }[] {
    const stages: DealStage[] = ['lead', 'target', 'discovery', 'contracting', 'production'];
    return stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      };
    });
  }

  /**
   * Simple keyword-based insight extraction for MVP
   * Production would use Claude for intelligent extraction
   */
  private extractInsightsSimple(content: string): string[] {
    const insights: string[] = [];
    const lower = content.toLowerCase();

    // Pain points
    if (lower.includes('volume') || lower.includes('overwhelm') || lower.includes('tickets')) {
      insights.push('Pain point: Volume/capacity issues detected');
    }
    if (lower.includes('security') || lower.includes('compliance') || lower.includes('soc')) {
      insights.push('Pain point: Security/compliance concerns');
    }

    // Budget signals
    if (lower.includes('budget') || lower.includes('$') || lower.includes('approved')) {
      insights.push('Budget signal detected');
    }

    // Timeline signals
    if (lower.includes('deadline') || lower.includes('by q') || lower.includes('this quarter')) {
      insights.push('Timeline urgency signal');
    }

    // Stakeholder signals
    if (lower.includes('cto') || lower.includes('ceo') || lower.includes('vp')) {
      insights.push('Executive stakeholder mentioned');
    }

    // Technical signals
    if (lower.includes('integration') || lower.includes('api') || lower.includes('shopify')) {
      insights.push('Technical requirement: Integration needs');
    }

    // Competitive signals
    if (lower.includes('competitor') || lower.includes('evaluating') || lower.includes('alternative')) {
      insights.push('Competitive evaluation signal');
    }

    return insights;
  }

  /**
   * Update intelligence based on extracted insights
   */
  private updateIntelligenceFromInsights(
    intelligence: DealIntelligence,
    insights: string[],
    source: string
  ): DealIntelligence {
    const now = new Date().toISOString();

    for (const insight of insights) {
      if (insight.includes('Pain point: Volume')) {
        intelligence.painPoints.items.push({
          category: 'volume',
          description: 'Volume/capacity issues mentioned',
          severity: 'medium',
          source,
          extractedAt: now,
        });
        intelligence.painPoints.updatedAt = now;
      }

      if (insight.includes('Pain point: Security')) {
        intelligence.painPoints.items.push({
          category: 'security',
          description: 'Security/compliance concerns mentioned',
          severity: 'medium',
          source,
          extractedAt: now,
        });
        intelligence.painPoints.updatedAt = now;
      }

      if (insight.includes('Budget signal')) {
        intelligence.budgetTimeline.signals.push({ signal: 'Budget mentioned', source });
        intelligence.budgetTimeline.updatedAt = now;
      }

      if (insight.includes('Timeline urgency')) {
        intelligence.aiMaturity.timelineUrgency = 'high';
        intelligence.aiMaturity.signals.push({ signal: 'Timeline urgency mentioned', source });
        intelligence.aiMaturity.updatedAt = now;
      }

      if (insight.includes('Executive stakeholder')) {
        intelligence.stakeholderIntel.items.push({
          name: 'Executive',
          role: 'Decision-maker',
          source,
        });
        intelligence.stakeholderIntel.updatedAt = now;
      }

      if (insight.includes('Technical requirement')) {
        intelligence.technicalReqs.items.push({
          category: 'integration',
          requirement: 'Integration mentioned',
          priority: 'medium',
          source,
        });
        intelligence.technicalReqs.updatedAt = now;
      }

      if (insight.includes('Competitive')) {
        intelligence.competitive.signals.push({ signal: 'Competitive evaluation', source });
        intelligence.competitive.updatedAt = now;
      }
    }

    return intelligence;
  }
}

// Singleton instance
let serviceInstance: KnoPilotService | null = null;

export function getKnoPilotService(baseDir?: string): KnoPilotService {
  if (!serviceInstance) {
    serviceInstance = new KnoPilotService(baseDir);
  }
  return serviceInstance;
}

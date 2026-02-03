/**
 * ScoringEngine
 *
 * Computes the 9 custom deal properties using formulas from the KnoPilot framework.
 */

import {
  Deal,
  DealScores,
  DealIntelligence,
  Stakeholder,
  ChampionStrength,
  UseCaseClarity,
  DecisionTimeline,
  BudgetRange,
  PrimaryPainPoint,
  TechnicalComplexity,
  CompetitiveThreat,
  AIReadinessBreakdown,
  ConfidenceFactors,
} from './types.js';

export class ScoringEngine {
  /**
   * Compute all 9 custom properties for a deal
   */
  computeAll(
    deal: Deal,
    intelligence: DealIntelligence,
    stakeholders: Stakeholder[]
  ): DealScores {
    const now = new Date().toISOString();

    // Compute individual scores
    const aiReadinessBreakdown = this.computeAIReadinessBreakdown(intelligence);
    const aiReadinessScore = Object.values(aiReadinessBreakdown).reduce((a, b) => a + b, 0);

    const championStrength = this.computeChampionStrength(stakeholders);
    const useCaseClarity = this.computeUseCaseClarity(intelligence);
    const decisionTimeline = this.computeDecisionTimeline(intelligence);
    const budgetRange = this.computeBudgetRange(intelligence);
    const primaryPainPoint = this.computePrimaryPainPoint(intelligence);
    const technicalComplexity = this.computeTechnicalComplexity(intelligence);
    const competitiveThreat = this.computeCompetitiveThreat(intelligence);

    // Compute confidence factors and deal confidence
    const confidenceFactors = this.computeConfidenceFactors(
      championStrength,
      intelligence,
      stakeholders,
      technicalComplexity,
      competitiveThreat,
      decisionTimeline
    );
    const dealConfidence = Object.values(confidenceFactors).reduce((a, b) => a + b, 0);

    return {
      dealId: deal.id,
      updatedAt: now,
      aiReadinessScore,
      championStrength,
      useCaseClarity,
      decisionTimeline,
      budgetRange,
      primaryPainPoint,
      technicalComplexity,
      competitiveThreat,
      dealConfidence,
      aiReadinessBreakdown,
      confidenceFactors,
    };
  }

  // ============================================================================
  // AI Readiness Score (0-100)
  // ============================================================================

  private computeAIReadinessBreakdown(intelligence: DealIntelligence): AIReadinessBreakdown {
    return {
      executiveMandate: this.scoreExecutiveMandate(intelligence),
      technicalCapability: this.scoreTechnicalCapability(intelligence),
      useCaseClarity: this.scoreUseCaseClarity(intelligence),
      budgetTimeline: this.scoreBudgetTimeline(intelligence),
    };
  }

  private scoreExecutiveMandate(intelligence: DealIntelligence): number {
    // 0-25 points based on AI maturity stage
    const { aiMaturity } = intelligence;

    if (aiMaturity.stage === 'board-mandate') return 25;
    if (aiMaturity.stage === 'internal-team') return 20;
    if (aiMaturity.stage === 'prior-attempts') return 15;
    if (aiMaturity.timelineUrgency === 'high') return 15;
    if (aiMaturity.timelineUrgency === 'medium') return 10;
    return 5; // exploring
  }

  private scoreTechnicalCapability(intelligence: DealIntelligence): number {
    // 0-25 points based on internal capability
    const { aiMaturity } = intelligence;

    switch (aiMaturity.internalCapability) {
      case 'strong': return 25;
      case 'limited': return 15;
      case 'none': return 10;
      default: return 5;
    }
  }

  private scoreUseCaseClarity(intelligence: DealIntelligence): number {
    // 0-25 points based on use case clarity
    const { useCase } = intelligence;

    switch (useCase.clarity) {
      case 'scoped': return 25;
      case 'defined': return 15;
      case 'exploring': return 5;
      default: return 5;
    }
  }

  private scoreBudgetTimeline(intelligence: DealIntelligence): number {
    // 0-25 points based on budget and timeline confirmation
    const { budgetTimeline } = intelligence;

    let score = 0;

    if (budgetTimeline.budgetConfirmed) {
      score += 15;
    } else if (budgetTimeline.budgetRange) {
      score += 8;
    }

    if (budgetTimeline.decisionDeadline) {
      score += 10;
    } else if (budgetTimeline.signals.length > 0) {
      score += 5;
    }

    return Math.min(25, score);
  }

  // ============================================================================
  // Champion Strength
  // ============================================================================

  computeChampionStrength(stakeholders: Stakeholder[]): ChampionStrength {
    const champions = stakeholders.filter(s => s.role === 'champion');

    if (champions.length === 0) return 'weak';

    // Check for executive sponsor
    const hasExecutive = champions.some(c =>
      c.title.toLowerCase().includes('ceo') ||
      c.title.toLowerCase().includes('cto') ||
      c.title.toLowerCase().includes('cfo') ||
      c.title.toLowerCase().includes('coo') ||
      c.title.toLowerCase().includes('chief') ||
      c.title.toLowerCase().includes('c-level')
    );

    if (hasExecutive) return 'executive-sponsor';

    // Check for senior champions
    const hasSenior = champions.some(c =>
      c.title.toLowerCase().includes('vp') ||
      c.title.toLowerCase().includes('vice president') ||
      c.title.toLowerCase().includes('director') ||
      c.title.toLowerCase().includes('head of')
    );

    if (hasSenior && champions.some(c => c.sentiment === 'supportive')) {
      return 'strong';
    }

    // Check sentiment
    const supportiveChampions = champions.filter(c => c.sentiment === 'supportive');
    if (supportiveChampions.length > 0) {
      return 'moderate';
    }

    return 'weak';
  }

  // ============================================================================
  // Use Case Clarity
  // ============================================================================

  computeUseCaseClarity(intelligence: DealIntelligence): UseCaseClarity {
    const { useCase } = intelligence;

    if (useCase.clarity === 'scoped') return 'scoped';
    if (useCase.clarity === 'defined') return 'defined';

    // Infer from signals
    if (useCase.primaryUseCase && useCase.signals.length >= 3) {
      return 'defined';
    }

    return 'exploring';
  }

  // ============================================================================
  // Decision Timeline
  // ============================================================================

  computeDecisionTimeline(intelligence: DealIntelligence): DecisionTimeline {
    const { budgetTimeline, aiMaturity } = intelligence;

    // Check explicit deadline
    if (budgetTimeline.decisionDeadline) {
      const deadline = new Date(budgetTimeline.decisionDeadline);
      const now = new Date();
      const daysUntil = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil <= 30) return 'immediate';
      if (daysUntil <= 90) return 'this-quarter';
      if (daysUntil <= 180) return 'next-quarter';
      return 'long-term';
    }

    // Infer from urgency
    if (aiMaturity.timelineUrgency === 'high') return 'this-quarter';
    if (aiMaturity.timelineUrgency === 'medium') return 'next-quarter';

    return 'unknown';
  }

  // ============================================================================
  // Budget Range
  // ============================================================================

  computeBudgetRange(intelligence: DealIntelligence): BudgetRange {
    const { budgetTimeline } = intelligence;

    if (!budgetTimeline.budgetRange) return 'unknown';

    const range = budgetTimeline.budgetRange.toLowerCase();

    if (range.includes('1m') || range.includes('million')) return '1m+';
    if (range.includes('500k') || range.includes('500,000')) return '500k-1m';
    if (range.includes('100k') || range.includes('100,000')) return '100k-500k';
    if (range.includes('$') && !range.includes('00k')) return '<100k';

    // Try to parse numeric range
    const numbers = range.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const maxValue = Math.max(...numbers.map(n => parseInt(n, 10)));
      if (maxValue >= 1000000) return '1m+';
      if (maxValue >= 500000) return '500k-1m';
      if (maxValue >= 100000) return '100k-500k';
      return '<100k';
    }

    return 'unknown';
  }

  // ============================================================================
  // Primary Pain Point
  // ============================================================================

  computePrimaryPainPoint(intelligence: DealIntelligence): PrimaryPainPoint {
    const { painPoints } = intelligence;

    if (painPoints.items.length === 0) return 'other';

    // Count by category
    const counts: Record<string, number> = {};
    for (const item of painPoints.items) {
      const cat = item.category;
      counts[cat] = (counts[cat] || 0) + (item.severity === 'high' ? 3 : item.severity === 'medium' ? 2 : 1);
    }

    // Map to PrimaryPainPoint categories
    const mapping: Record<string, PrimaryPainPoint> = {
      'volume': 'volume',
      'security': 'compliance',
      'knowledge-base': 'cx',
      'legacy': 'cost',
      'compliance': 'compliance',
      'other': 'other',
    };

    let maxCategory = 'other';
    let maxCount = 0;

    for (const [cat, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = cat;
      }
    }

    return mapping[maxCategory] || 'other';
  }

  // ============================================================================
  // Technical Complexity
  // ============================================================================

  computeTechnicalComplexity(intelligence: DealIntelligence): TechnicalComplexity {
    const { technicalReqs } = intelligence;

    if (technicalReqs.items.length === 0) return 'medium';

    // Count high priority requirements
    const highPriority = technicalReqs.items.filter(r => r.priority === 'high').length;
    const total = technicalReqs.items.length;

    // Check for complex indicators
    const hasLegacyIntegration = technicalReqs.items.some(r =>
      r.requirement.toLowerCase().includes('legacy') ||
      r.requirement.toLowerCase().includes('mainframe') ||
      r.requirement.toLowerCase().includes('custom')
    );

    const hasMultipleIntegrations = technicalReqs.items.filter(r =>
      r.category.toLowerCase().includes('integration')
    ).length >= 3;

    if (highPriority >= 3 || hasLegacyIntegration || hasMultipleIntegrations) {
      return 'high';
    }

    if (total <= 2 && highPriority === 0) {
      return 'low';
    }

    return 'medium';
  }

  // ============================================================================
  // Competitive Threat
  // ============================================================================

  computeCompetitiveThreat(intelligence: DealIntelligence): CompetitiveThreat {
    const { competitive } = intelligence;

    // No competitors mentioned
    if (competitive.competitors.length === 0 && !competitive.buildVsBuy) {
      return 'none';
    }

    // Check for active evaluations
    const activeCompetitors = competitive.competitors.filter(c =>
      c.status.toLowerCase().includes('evaluating') ||
      c.status.toLowerCase().includes('active') ||
      c.status.toLowerCase().includes('considering')
    );

    if (activeCompetitors.length >= 2) return 'high';
    if (activeCompetitors.length === 1) return 'medium';

    // Check for build vs buy
    if (competitive.buildVsBuy?.toLowerCase().includes('build')) {
      return 'medium';
    }

    // Previous vendor failures could be positive
    if (competitive.previousVendorFailures.length > 0) {
      return 'low';
    }

    return 'low';
  }

  // ============================================================================
  // Deal Confidence (0-100%)
  // ============================================================================

  private computeConfidenceFactors(
    championStrength: ChampionStrength,
    intelligence: DealIntelligence,
    stakeholders: Stakeholder[],
    technicalComplexity: TechnicalComplexity,
    competitiveThreat: CompetitiveThreat,
    decisionTimeline: DecisionTimeline
  ): ConfidenceFactors {
    return {
      championStrength: this.scoreChampionFactor(championStrength),
      budgetConfirmed: this.scoreBudgetFactor(intelligence.budgetTimeline.budgetConfirmed),
      technicalFit: this.scoreTechnicalFit(technicalComplexity),
      stakeholderEngagement: this.scoreStakeholderEngagement(stakeholders),
      competitivePosition: this.scoreCompetitivePosition(competitiveThreat),
      decisionClarity: this.scoreDecisionClarity(decisionTimeline),
    };
  }

  private scoreChampionFactor(strength: ChampionStrength): number {
    // 0-20 points
    switch (strength) {
      case 'executive-sponsor': return 20;
      case 'strong': return 15;
      case 'moderate': return 10;
      case 'weak': return 5;
      default: return 5;
    }
  }

  private scoreBudgetFactor(confirmed: boolean): number {
    // 0-15 points
    return confirmed ? 15 : 5;
  }

  private scoreTechnicalFit(complexity: TechnicalComplexity): number {
    // 0-15 points (inverse - low complexity = high fit)
    switch (complexity) {
      case 'low': return 15;
      case 'medium': return 10;
      case 'high': return 5;
      default: return 10;
    }
  }

  private scoreStakeholderEngagement(stakeholders: Stakeholder[]): number {
    // 0-20 points
    const supportive = stakeholders.filter(s => s.sentiment === 'supportive').length;
    const engaged = stakeholders.filter(s => s.lastInteraction).length;

    if (supportive >= 3 || engaged >= 4) return 20;
    if (supportive >= 2 || engaged >= 2) return 15;
    if (supportive >= 1 || engaged >= 1) return 10;
    return 5;
  }

  private scoreCompetitivePosition(threat: CompetitiveThreat): number {
    // 0-15 points
    switch (threat) {
      case 'none': return 15;
      case 'low': return 12;
      case 'medium': return 8;
      case 'high': return 5;
      default: return 10;
    }
  }

  private scoreDecisionClarity(timeline: DecisionTimeline): number {
    // 0-15 points
    switch (timeline) {
      case 'immediate': return 15;
      case 'this-quarter': return 12;
      case 'next-quarter': return 8;
      case 'long-term': return 5;
      case 'unknown': return 5;
      default: return 5;
    }
  }
}

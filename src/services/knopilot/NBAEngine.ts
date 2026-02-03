/**
 * NBAEngine
 *
 * Generates and ranks Next Best Actions for deals.
 * Uses the NBA formula: NBA = Likelihood×0.4 + EffortFactor×0.3 + ChampionValue×0.3
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Deal,
  DealScores,
  DealIntelligence,
  Stakeholder,
  DealNBA,
  NextBestAction,
  DealStage,
  Effort,
} from './types.js';

interface ActionTemplate {
  action: string;
  baseLikelihood: number;
  effort: Effort;
  baseChampionValue: number;
  primaryImpact: string;
  secondaryImpact?: string;
  timing: string;
  reasoning: string;
  conditions?: (context: ActionContext) => boolean;
  likelihoodModifier?: (context: ActionContext) => number;
  championValueModifier?: (context: ActionContext) => number;
}

interface ActionContext {
  deal: Deal;
  scores: DealScores;
  intelligence: DealIntelligence;
  stakeholders: Stakeholder[];
}

export class NBAEngine {
  /**
   * Generate ranked next-best-actions for a deal
   */
  generate(
    deal: Deal,
    scores: DealScores,
    intelligence: DealIntelligence,
    stakeholders: Stakeholder[]
  ): DealNBA {
    const context: ActionContext = { deal, scores, intelligence, stakeholders };

    // Get action templates for current stage
    const templates = this.getActionsForStage(deal.stage);

    // Score and filter actions
    const scoredActions: NextBestAction[] = templates
      .filter(t => !t.conditions || t.conditions(context))
      .map(t => this.scoreAction(t, context))
      .sort((a, b) => b.nbaScore - a.nbaScore);

    // Take top 5
    const topActions = scoredActions.slice(0, 5);

    // Detect risks
    const risks = this.detectRisks(deal, scores, stakeholders, intelligence);

    return {
      dealId: deal.id,
      generatedAt: new Date().toISOString(),
      stage: deal.stage,
      actions: topActions,
      risks,
    };
  }

  /**
   * Calculate NBA score using the formula
   */
  private calculateNBAScore(likelihood: number, effort: Effort, championValue: number): number {
    const effortFactor = this.getEffortFactor(effort);
    return Math.round((likelihood * 0.4) + (effortFactor * 0.3) + (championValue * 0.3));
  }

  private getEffortFactor(effort: Effort): number {
    switch (effort) {
      case 'low': return 100;
      case 'medium': return 60;
      case 'high': return 30;
      default: return 60;
    }
  }

  /**
   * Score an action template given the deal context
   */
  private scoreAction(template: ActionTemplate, context: ActionContext): NextBestAction {
    let likelihood = template.baseLikelihood;
    let championValue = template.baseChampionValue;

    // Apply modifiers if present
    if (template.likelihoodModifier) {
      likelihood = Math.min(100, Math.max(0, likelihood + template.likelihoodModifier(context)));
    }
    if (template.championValueModifier) {
      championValue = Math.min(100, Math.max(0, championValue + template.championValueModifier(context)));
    }

    const effortFactor = this.getEffortFactor(template.effort);
    const nbaScore = this.calculateNBAScore(likelihood, template.effort, championValue);

    return {
      id: uuidv4(),
      action: template.action,
      nbaScore,
      likelihood,
      effort: template.effort,
      effortFactor,
      championValue,
      primaryImpact: template.primaryImpact,
      secondaryImpact: template.secondaryImpact,
      timing: template.timing,
      reasoning: template.reasoning,
      stageAppropriate: true,
    };
  }

  /**
   * Detect risks based on deal state
   */
  private detectRisks(
    deal: Deal,
    scores: DealScores,
    stakeholders: Stakeholder[],
    intelligence: DealIntelligence
  ): string[] {
    const risks: string[] = [];

    // Champion-related risks
    const champions = stakeholders.filter(s => s.role === 'champion');
    if (champions.length === 0) {
      risks.push('No champion identified — deal lacks internal advocate');
    } else if (scores.championStrength === 'weak') {
      risks.push('Weak champion — may not have influence to drive decision');
    }

    // Decision-maker engagement
    const decisionMakers = stakeholders.filter(s => s.role === 'decision-maker');
    const engagedDMs = decisionMakers.filter(s => s.lastInteraction);
    if (decisionMakers.length > 0 && engagedDMs.length === 0) {
      risks.push('Decision-makers not yet engaged — deal may stall');
    }

    // Skeptical stakeholders
    const skeptics = stakeholders.filter(s => s.sentiment === 'skeptical');
    if (skeptics.length > 0) {
      const names = skeptics.map(s => s.name).join(', ');
      risks.push(`Skeptical stakeholder(s): ${names} — objections need addressing`);
    }

    // Budget/timeline risks
    if (!intelligence.budgetTimeline.budgetConfirmed && deal.stage === 'discovery') {
      risks.push('Budget not confirmed — risk of deal stalling at contracting');
    }

    if (scores.decisionTimeline === 'unknown') {
      risks.push('Timeline unknown — no urgency driving the deal forward');
    }

    // Competitive risks
    if (scores.competitiveThreat === 'high') {
      risks.push('High competitive threat — actively evaluating alternatives');
    }

    // Engagement risks
    if (deal.lastInteractionDate) {
      const lastInteraction = new Date(deal.lastInteractionDate);
      const daysSince = Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince > 14) {
        risks.push(`No contact in ${daysSince} days — deal may be going cold`);
      }
    }

    // Stage-specific risks
    if (deal.stage === 'contracting' && scores.dealConfidence < 70) {
      risks.push('In contracting with low confidence — deal may not close');
    }

    // Technical risks
    if (scores.technicalComplexity === 'high') {
      risks.push('High technical complexity — may require additional resources');
    }

    return risks;
  }

  /**
   * Get action templates for a given stage
   */
  private getActionsForStage(stage: DealStage): ActionTemplate[] {
    const commonActions = this.getCommonActions();
    const stageActions = this.getStageSpecificActions(stage);
    return [...stageActions, ...commonActions];
  }

  private getCommonActions(): ActionTemplate[] {
    return [
      {
        action: 'Update stakeholder map with recent interactions',
        baseLikelihood: 60,
        effort: 'low',
        baseChampionValue: 40,
        primaryImpact: 'Internal tracking',
        timing: 'Ongoing',
        reasoning: 'Accurate stakeholder data improves all other actions',
      },
      {
        action: 'Review and update deal intelligence',
        baseLikelihood: 50,
        effort: 'low',
        baseChampionValue: 30,
        primaryImpact: 'Internal tracking',
        timing: 'Ongoing',
        reasoning: 'Keeping intelligence current ensures accurate scoring',
      },
    ];
  }

  private getStageSpecificActions(stage: DealStage): ActionTemplate[] {
    switch (stage) {
      case 'lead':
        return this.getLeadActions();
      case 'target':
        return this.getTargetActions();
      case 'discovery':
        return this.getDiscoveryActions();
      case 'contracting':
        return this.getContractingActions();
      case 'production':
        return this.getProductionActions();
      default:
        return [];
    }
  }

  private getLeadActions(): ActionTemplate[] {
    return [
      {
        action: 'Research company\'s recent AI announcements and initiatives',
        baseLikelihood: 70,
        effort: 'low',
        baseChampionValue: 60,
        primaryImpact: 'Self (better positioning)',
        timing: 'Before first outreach',
        reasoning: 'Understanding their AI journey enables personalized outreach',
      },
      {
        action: 'Identify mutual connections on LinkedIn',
        baseLikelihood: 75,
        effort: 'low',
        baseChampionValue: 50,
        primaryImpact: 'Warm intro path',
        timing: 'Before first outreach',
        reasoning: 'Warm introductions significantly increase response rates',
      },
      {
        action: 'Craft personalized outreach referencing specific pain point',
        baseLikelihood: 80,
        effort: 'medium',
        baseChampionValue: 70,
        primaryImpact: 'Prospect',
        timing: 'Now',
        reasoning: 'Specific, relevant outreach captures attention and demonstrates value',
        likelihoodModifier: (ctx) => ctx.intelligence.painPoints.items.length > 0 ? 10 : -10,
      },
      {
        action: 'Identify potential champion based on role and responsibility',
        baseLikelihood: 65,
        effort: 'low',
        baseChampionValue: 55,
        primaryImpact: 'Internal strategy',
        timing: 'Before first outreach',
        reasoning: 'Knowing who to target increases chances of engaging right person',
      },
    ];
  }

  private getTargetActions(): ActionTemplate[] {
    return [
      {
        action: 'Send pre-meeting brief with Knowbl positioning',
        baseLikelihood: 65,
        effort: 'low',
        baseChampionValue: 70,
        primaryImpact: 'Champion',
        timing: 'Before discovery call',
        reasoning: 'Primes the conversation and demonstrates preparation',
      },
      {
        action: 'Research their current customer support stack',
        baseLikelihood: 75,
        effort: 'medium',
        baseChampionValue: 65,
        primaryImpact: 'Self (better discovery)',
        timing: 'Before discovery call',
        reasoning: 'Understanding their tech stack enables better discovery questions',
      },
      {
        action: 'Share case study from their industry',
        baseLikelihood: 70,
        effort: 'low',
        baseChampionValue: 80,
        primaryImpact: 'Champion',
        timing: 'Before or during discovery',
        reasoning: 'Industry-relevant proof points build credibility',
      },
      {
        action: 'Prepare discovery questions focused on pain points',
        baseLikelihood: 70,
        effort: 'low',
        baseChampionValue: 60,
        primaryImpact: 'Self',
        timing: 'Before discovery call',
        reasoning: 'Structured discovery uncovers key buying signals',
      },
    ];
  }

  private getDiscoveryActions(): ActionTemplate[] {
    return [
      {
        action: 'Create executive one-pager for senior stakeholders',
        baseLikelihood: 80,
        effort: 'low',
        baseChampionValue: 95,
        primaryImpact: 'Champion (enables upward sell)',
        timing: 'This week',
        reasoning: 'Gives champion ammunition to sell internally to leadership',
        likelihoodModifier: (ctx) => {
          const hasSkepticalDM = ctx.stakeholders.some(
            s => s.role === 'decision-maker' && s.sentiment === 'skeptical'
          );
          return hasSkepticalDM ? 10 : 0;
        },
      },
      {
        action: 'Schedule technical deep-dive with engineering team',
        baseLikelihood: 85,
        effort: 'medium',
        baseChampionValue: 75,
        primaryImpact: 'Technical evaluators',
        timing: 'Next week',
        reasoning: 'Address integration concerns early and get technical buy-in',
        conditions: (ctx) => ctx.scores.technicalComplexity !== 'low',
      },
      {
        action: 'Propose free custom prototype',
        baseLikelihood: 95,
        effort: 'high',
        baseChampionValue: 90,
        primaryImpact: 'Buying committee',
        timing: 'After use case scoped',
        reasoning: 'Tangible proof of value is most compelling for closing',
        conditions: (ctx) => ctx.scores.useCaseClarity === 'scoped' || ctx.scores.useCaseClarity === 'defined',
      },
      {
        action: 'Send relevant integration case study',
        baseLikelihood: 80,
        effort: 'low',
        baseChampionValue: 85,
        primaryImpact: 'Technical stakeholders',
        timing: 'Before technical call',
        reasoning: 'Proves we\'ve solved their exact technical challenges before',
        likelihoodModifier: (ctx) => ctx.intelligence.technicalReqs.items.length > 0 ? 10 : 0,
      },
      {
        action: 'Share ROI calculator tailored to their metrics',
        baseLikelihood: 75,
        effort: 'medium',
        baseChampionValue: 90,
        primaryImpact: 'Champion and CFO',
        timing: 'After pain points quantified',
        reasoning: 'Quantified value helps champion justify budget internally',
        conditions: (ctx) => ctx.intelligence.painPoints.items.length > 0,
      },
    ];
  }

  private getContractingActions(): ActionTemplate[] {
    return [
      {
        action: 'Address security/compliance questions with Trust Center docs',
        baseLikelihood: 90,
        effort: 'low',
        baseChampionValue: 85,
        primaryImpact: 'Legal/Security team',
        timing: 'Immediately',
        reasoning: 'Remove security objections that could block deal',
      },
      {
        action: 'Build custom pricing scenario showing phased approach',
        baseLikelihood: 85,
        effort: 'medium',
        baseChampionValue: 90,
        primaryImpact: 'CFO/Procurement',
        timing: 'This week',
        reasoning: 'Flexible pricing options address budget constraints',
        conditions: (ctx) => ctx.intelligence.budgetTimeline.budgetRange !== undefined,
      },
      {
        action: 'Offer customer reference call',
        baseLikelihood: 80,
        effort: 'low',
        baseChampionValue: 80,
        primaryImpact: 'Decision-maker',
        timing: 'When hesitation detected',
        reasoning: 'Peer validation builds confidence for final commitment',
      },
      {
        action: 'Create risk mitigation document for legal review',
        baseLikelihood: 75,
        effort: 'medium',
        baseChampionValue: 75,
        primaryImpact: 'Legal team',
        timing: 'If legal concerns raised',
        reasoning: 'Proactively addressing legal concerns accelerates contract process',
      },
      {
        action: 'Schedule final alignment call with all stakeholders',
        baseLikelihood: 85,
        effort: 'medium',
        baseChampionValue: 70,
        primaryImpact: 'Buying committee',
        timing: 'Before contract finalization',
        reasoning: 'Final alignment ensures no surprises at signature',
        likelihoodModifier: (ctx) => ctx.stakeholders.length >= 3 ? 10 : 0,
      },
    ];
  }

  private getProductionActions(): ActionTemplate[] {
    return [
      {
        action: 'Schedule kickoff meeting with implementation team',
        baseLikelihood: 95,
        effort: 'low',
        baseChampionValue: 70,
        primaryImpact: 'Customer success',
        timing: 'Within 1 week of signing',
        reasoning: 'Fast kickoff maintains momentum and sets positive tone',
      },
      {
        action: 'Introduce customer success manager',
        baseLikelihood: 90,
        effort: 'low',
        baseChampionValue: 75,
        primaryImpact: 'Champion',
        timing: 'At contract signing',
        reasoning: 'Smooth handoff ensures customer feels supported',
      },
      {
        action: 'Document expansion opportunities',
        baseLikelihood: 70,
        effort: 'low',
        baseChampionValue: 60,
        primaryImpact: 'Internal (account growth)',
        timing: 'Ongoing',
        reasoning: 'Track opportunities for future upsell',
      },
      {
        action: 'Request case study participation',
        baseLikelihood: 60,
        effort: 'low',
        baseChampionValue: 85,
        primaryImpact: 'Champion (recognition)',
        timing: 'After initial success',
        reasoning: 'Success stories enable more deals and validate champion',
      },
    ];
  }
}

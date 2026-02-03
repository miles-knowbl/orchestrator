/**
 * DealManager
 *
 * Handles CRUD operations for deals and related entities.
 * Uses file-based storage in the deals/ directory.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  Deal,
  CreateDealInput,
  DealFilter,
  Stakeholder,
  StakeholderInput,
  Communication,
  CommunicationInput,
  DealScores,
  DealNBA,
  DealIntelligence,
  DealsIndex,
  DealIndexEntry,
  DealStage,
  PainPointsIntelligence,
  AIMaturityIntelligence,
  BudgetTimelineIntelligence,
  StakeholderIntelligence,
  TechnicalReqsIntelligence,
  UseCaseIntelligence,
  CompetitiveIntelligence,
} from './types.js';

export class DealManager {
  private dealsDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.dealsDir = path.join(baseDir, 'deals');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.dealsDir, { recursive: true });

    // Ensure index exists
    const indexPath = path.join(this.dealsDir, 'index.json');
    try {
      await fs.access(indexPath);
    } catch {
      const initialIndex: DealsIndex = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        deals: [],
      };
      await fs.writeFile(indexPath, JSON.stringify(initialIndex, null, 2));
    }
  }

  // ============================================================================
  // Deal CRUD
  // ============================================================================

  async create(input: CreateDealInput): Promise<Deal> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const deal: Deal = {
      id,
      name: input.name,
      company: input.company,
      industry: input.industry,
      stage: input.stage || 'lead',
      value: input.value,
      createdAt: now,
      updatedAt: now,
      daysInStage: 0,
      stageHistory: [{
        from: null,
        to: input.stage || 'lead',
        at: now,
      }],
    };

    // Create deal directory structure
    const dealDir = path.join(this.dealsDir, id);
    await fs.mkdir(dealDir, { recursive: true });
    await fs.mkdir(path.join(dealDir, 'communications'), { recursive: true });
    await fs.mkdir(path.join(dealDir, 'intelligence'), { recursive: true });

    // Write deal file
    await fs.writeFile(
      path.join(dealDir, 'deal.json'),
      JSON.stringify(deal, null, 2)
    );

    // Initialize stakeholders
    await fs.writeFile(
      path.join(dealDir, 'stakeholders.json'),
      JSON.stringify([], null, 2)
    );

    // Initialize scores
    const initialScores = this.getInitialScores(id);
    await fs.writeFile(
      path.join(dealDir, 'scores.json'),
      JSON.stringify(initialScores, null, 2)
    );

    // Initialize NBA
    const initialNBA = this.getInitialNBA(id, deal.stage);
    await fs.writeFile(
      path.join(dealDir, 'nba.json'),
      JSON.stringify(initialNBA, null, 2)
    );

    // Initialize communications index
    await fs.writeFile(
      path.join(dealDir, 'communications', 'index.json'),
      JSON.stringify({ communications: [] }, null, 2)
    );

    // Initialize intelligence files
    await this.initializeIntelligence(id);

    // Update index
    await this.updateIndex(deal);

    return deal;
  }

  async get(dealId: string): Promise<Deal | null> {
    const dealPath = path.join(this.dealsDir, dealId, 'deal.json');
    try {
      const content = await fs.readFile(dealPath, 'utf-8');
      const deal = JSON.parse(content) as Deal;

      // Calculate days in stage
      const lastTransition = deal.stageHistory[deal.stageHistory.length - 1];
      if (lastTransition) {
        const stageStart = new Date(lastTransition.at);
        const now = new Date();
        deal.daysInStage = Math.floor((now.getTime() - stageStart.getTime()) / (1000 * 60 * 60 * 24));
      }

      return deal;
    } catch {
      return null;
    }
  }

  async list(filter?: DealFilter): Promise<Deal[]> {
    const index = await this.getIndex();
    let deals: Deal[] = [];

    for (const entry of index.deals) {
      const deal = await this.get(entry.id);
      if (deal) {
        deals.push(deal);
      }
    }

    // Apply filters
    if (filter) {
      if (filter.stage) {
        deals = deals.filter(d => d.stage === filter.stage);
      }
      if (filter.company) {
        deals = deals.filter(d =>
          d.company.toLowerCase().includes(filter.company!.toLowerCase())
        );
      }
      if (filter.minValue !== undefined) {
        deals = deals.filter(d => (d.value || 0) >= filter.minValue!);
      }
      if (filter.maxValue !== undefined) {
        deals = deals.filter(d => (d.value || 0) <= filter.maxValue!);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        deals = deals.filter(d =>
          d.name.toLowerCase().includes(search) ||
          d.company.toLowerCase().includes(search)
        );
      }
    }

    return deals;
  }

  async update(dealId: string, update: Partial<Deal>): Promise<Deal> {
    const deal = await this.get(dealId);
    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const updated: Deal = {
      ...deal,
      ...update,
      id: deal.id, // Prevent ID change
      createdAt: deal.createdAt, // Prevent creation date change
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'deal.json'),
      JSON.stringify(updated, null, 2)
    );

    await this.updateIndex(updated);

    return updated;
  }

  async advanceStage(dealId: string, reason?: string): Promise<Deal> {
    const deal = await this.get(dealId);
    if (!deal) {
      throw new Error(`Deal not found: ${dealId}`);
    }

    const stageOrder: DealStage[] = ['lead', 'target', 'discovery', 'contracting', 'production'];
    const currentIndex = stageOrder.indexOf(deal.stage);

    if (currentIndex === stageOrder.length - 1) {
      throw new Error(`Deal already at final stage: ${deal.stage}`);
    }

    const nextStage = stageOrder[currentIndex + 1];
    const now = new Date().toISOString();

    const updated: Deal = {
      ...deal,
      stage: nextStage,
      updatedAt: now,
      daysInStage: 0,
      stageHistory: [
        ...deal.stageHistory,
        {
          from: deal.stage,
          to: nextStage,
          at: now,
          reason,
        },
      ],
    };

    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'deal.json'),
      JSON.stringify(updated, null, 2)
    );

    await this.updateIndex(updated);

    return updated;
  }

  async delete(dealId: string): Promise<void> {
    const dealDir = path.join(this.dealsDir, dealId);
    await fs.rm(dealDir, { recursive: true, force: true });
    await this.removeFromIndex(dealId);
  }

  // ============================================================================
  // Stakeholders
  // ============================================================================

  async getStakeholders(dealId: string): Promise<Stakeholder[]> {
    const stakeholdersPath = path.join(this.dealsDir, dealId, 'stakeholders.json');
    try {
      const content = await fs.readFile(stakeholdersPath, 'utf-8');
      return JSON.parse(content) as Stakeholder[];
    } catch {
      return [];
    }
  }

  async addStakeholder(dealId: string, input: StakeholderInput): Promise<Stakeholder> {
    const stakeholders = await this.getStakeholders(dealId);

    const stakeholder: Stakeholder = {
      id: uuidv4(),
      name: input.name,
      title: input.title,
      email: input.email,
      role: input.role,
      sentiment: input.sentiment || 'neutral',
      keyQuotes: [],
      concerns: [],
    };

    stakeholders.push(stakeholder);

    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'stakeholders.json'),
      JSON.stringify(stakeholders, null, 2)
    );

    return stakeholder;
  }

  async updateStakeholder(
    dealId: string,
    stakeholderId: string,
    update: Partial<Stakeholder>
  ): Promise<Stakeholder> {
    const stakeholders = await this.getStakeholders(dealId);
    const index = stakeholders.findIndex(s => s.id === stakeholderId);

    if (index === -1) {
      throw new Error(`Stakeholder not found: ${stakeholderId}`);
    }

    stakeholders[index] = {
      ...stakeholders[index],
      ...update,
      id: stakeholders[index].id, // Prevent ID change
    };

    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'stakeholders.json'),
      JSON.stringify(stakeholders, null, 2)
    );

    return stakeholders[index];
  }

  // ============================================================================
  // Communications
  // ============================================================================

  async getCommunications(dealId: string): Promise<Communication[]> {
    const commDir = path.join(this.dealsDir, dealId, 'communications');
    const indexPath = path.join(commDir, 'index.json');

    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexContent) as { communications: string[] };

      const communications: Communication[] = [];
      for (const commId of index.communications) {
        const commPath = path.join(commDir, `${commId}.json`);
        try {
          const content = await fs.readFile(commPath, 'utf-8');
          communications.push(JSON.parse(content) as Communication);
        } catch {
          // Skip missing files
        }
      }

      // Sort by timestamp descending
      return communications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch {
      return [];
    }
  }

  async addCommunication(dealId: string, input: CommunicationInput): Promise<Communication> {
    const commId = uuidv4();
    const now = new Date().toISOString();

    const communication: Communication = {
      id: commId,
      dealId,
      type: input.type,
      subject: input.subject,
      content: input.content,
      participants: input.participants,
      timestamp: input.timestamp || now,
      createdAt: now,
      processed: false,
    };

    const commDir = path.join(this.dealsDir, dealId, 'communications');

    // Write communication file
    await fs.writeFile(
      path.join(commDir, `${commId}.json`),
      JSON.stringify(communication, null, 2)
    );

    // Update index
    const indexPath = path.join(commDir, 'index.json');
    let index = { communications: [] as string[] };
    try {
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      index = JSON.parse(indexContent);
    } catch {
      // Use empty index
    }

    index.communications.push(commId);
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));

    // Update deal's last interaction date
    await this.update(dealId, { lastInteractionDate: communication.timestamp });

    return communication;
  }

  async markCommunicationProcessed(
    dealId: string,
    commId: string,
    insights: string[]
  ): Promise<void> {
    const commPath = path.join(this.dealsDir, dealId, 'communications', `${commId}.json`);
    const content = await fs.readFile(commPath, 'utf-8');
    const comm = JSON.parse(content) as Communication;

    comm.processed = true;
    comm.extractedInsights = insights;

    await fs.writeFile(commPath, JSON.stringify(comm, null, 2));
  }

  // ============================================================================
  // Scores
  // ============================================================================

  async getScores(dealId: string): Promise<DealScores> {
    const scoresPath = path.join(this.dealsDir, dealId, 'scores.json');
    const content = await fs.readFile(scoresPath, 'utf-8');
    return JSON.parse(content) as DealScores;
  }

  async saveScores(dealId: string, scores: DealScores): Promise<void> {
    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'scores.json'),
      JSON.stringify(scores, null, 2)
    );

    // Update index with confidence
    const deal = await this.get(dealId);
    if (deal) {
      await this.updateIndex(deal, scores.dealConfidence);
    }
  }

  // ============================================================================
  // NBA
  // ============================================================================

  async getNBA(dealId: string): Promise<DealNBA> {
    const nbaPath = path.join(this.dealsDir, dealId, 'nba.json');
    const content = await fs.readFile(nbaPath, 'utf-8');
    return JSON.parse(content) as DealNBA;
  }

  async saveNBA(dealId: string, nba: DealNBA): Promise<void> {
    await fs.writeFile(
      path.join(this.dealsDir, dealId, 'nba.json'),
      JSON.stringify(nba, null, 2)
    );
  }

  // ============================================================================
  // Intelligence
  // ============================================================================

  async getIntelligence(dealId: string): Promise<DealIntelligence> {
    const intelDir = path.join(this.dealsDir, dealId, 'intelligence');

    const readIntelFile = async <T>(filename: string, defaultVal: T): Promise<T> => {
      try {
        const content = await fs.readFile(path.join(intelDir, filename), 'utf-8');
        return JSON.parse(content) as T;
      } catch {
        return defaultVal;
      }
    };

    return {
      painPoints: await readIntelFile<PainPointsIntelligence>('pain-points.json', this.getEmptyPainPoints(dealId)),
      aiMaturity: await readIntelFile<AIMaturityIntelligence>('ai-maturity.json', this.getEmptyAIMaturity(dealId)),
      budgetTimeline: await readIntelFile<BudgetTimelineIntelligence>('budget-timeline.json', this.getEmptyBudgetTimeline(dealId)),
      stakeholderIntel: await readIntelFile<StakeholderIntelligence>('stakeholder-intel.json', this.getEmptyStakeholderIntel(dealId)),
      technicalReqs: await readIntelFile<TechnicalReqsIntelligence>('technical-reqs.json', this.getEmptyTechnicalReqs(dealId)),
      useCase: await readIntelFile<UseCaseIntelligence>('use-case.json', this.getEmptyUseCase(dealId)),
      competitive: await readIntelFile<CompetitiveIntelligence>('competitive.json', this.getEmptyCompetitive(dealId)),
    };
  }

  async saveIntelligence(dealId: string, intelligence: DealIntelligence): Promise<void> {
    const intelDir = path.join(this.dealsDir, dealId, 'intelligence');

    await fs.writeFile(path.join(intelDir, 'pain-points.json'), JSON.stringify(intelligence.painPoints, null, 2));
    await fs.writeFile(path.join(intelDir, 'ai-maturity.json'), JSON.stringify(intelligence.aiMaturity, null, 2));
    await fs.writeFile(path.join(intelDir, 'budget-timeline.json'), JSON.stringify(intelligence.budgetTimeline, null, 2));
    await fs.writeFile(path.join(intelDir, 'stakeholder-intel.json'), JSON.stringify(intelligence.stakeholderIntel, null, 2));
    await fs.writeFile(path.join(intelDir, 'technical-reqs.json'), JSON.stringify(intelligence.technicalReqs, null, 2));
    await fs.writeFile(path.join(intelDir, 'use-case.json'), JSON.stringify(intelligence.useCase, null, 2));
    await fs.writeFile(path.join(intelDir, 'competitive.json'), JSON.stringify(intelligence.competitive, null, 2));
  }

  // ============================================================================
  // Index Management
  // ============================================================================

  private async getIndex(): Promise<DealsIndex> {
    const indexPath = path.join(this.dealsDir, 'index.json');
    try {
      const content = await fs.readFile(indexPath, 'utf-8');
      return JSON.parse(content) as DealsIndex;
    } catch {
      return { version: '1.0.0', updatedAt: new Date().toISOString(), deals: [] };
    }
  }

  private async updateIndex(deal: Deal, confidence?: number): Promise<void> {
    const index = await this.getIndex();

    const entry: DealIndexEntry = {
      id: deal.id,
      name: deal.name,
      company: deal.company,
      stage: deal.stage,
      value: deal.value,
      confidence,
      updatedAt: deal.updatedAt,
    };

    const existingIndex = index.deals.findIndex(d => d.id === deal.id);
    if (existingIndex >= 0) {
      index.deals[existingIndex] = entry;
    } else {
      index.deals.push(entry);
    }

    index.updatedAt = new Date().toISOString();

    await fs.writeFile(
      path.join(this.dealsDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
  }

  private async removeFromIndex(dealId: string): Promise<void> {
    const index = await this.getIndex();
    index.deals = index.deals.filter(d => d.id !== dealId);
    index.updatedAt = new Date().toISOString();

    await fs.writeFile(
      path.join(this.dealsDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
  }

  async rebuildIndex(): Promise<void> {
    const entries = await fs.readdir(this.dealsDir);
    const deals: DealIndexEntry[] = [];

    for (const entry of entries) {
      if (entry === 'index.json') continue;

      const dealPath = path.join(this.dealsDir, entry, 'deal.json');
      try {
        const content = await fs.readFile(dealPath, 'utf-8');
        const deal = JSON.parse(content) as Deal;

        let confidence: number | undefined;
        try {
          const scoresPath = path.join(this.dealsDir, entry, 'scores.json');
          const scoresContent = await fs.readFile(scoresPath, 'utf-8');
          const scores = JSON.parse(scoresContent) as DealScores;
          confidence = scores.dealConfidence;
        } catch {
          // No scores yet
        }

        deals.push({
          id: deal.id,
          name: deal.name,
          company: deal.company,
          stage: deal.stage,
          value: deal.value,
          confidence,
          updatedAt: deal.updatedAt,
        });
      } catch {
        // Skip invalid entries
      }
    }

    const index: DealsIndex = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      deals,
    };

    await fs.writeFile(
      path.join(this.dealsDir, 'index.json'),
      JSON.stringify(index, null, 2)
    );
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private getInitialScores(dealId: string): DealScores {
    return {
      dealId,
      updatedAt: new Date().toISOString(),
      aiReadinessScore: 0,
      championStrength: 'weak',
      useCaseClarity: 'exploring',
      decisionTimeline: 'unknown',
      budgetRange: 'unknown',
      primaryPainPoint: 'other',
      technicalComplexity: 'medium',
      competitiveThreat: 'low',
      dealConfidence: 0,
      aiReadinessBreakdown: {
        executiveMandate: 0,
        technicalCapability: 0,
        useCaseClarity: 0,
        budgetTimeline: 0,
      },
      confidenceFactors: {
        championStrength: 0,
        budgetConfirmed: 0,
        technicalFit: 0,
        stakeholderEngagement: 0,
        competitivePosition: 0,
        decisionClarity: 0,
      },
    };
  }

  private getInitialNBA(dealId: string, stage: DealStage): DealNBA {
    return {
      dealId,
      generatedAt: new Date().toISOString(),
      stage,
      actions: [],
      risks: [],
    };
  }

  private async initializeIntelligence(dealId: string): Promise<void> {
    const intelDir = path.join(this.dealsDir, dealId, 'intelligence');

    await fs.writeFile(path.join(intelDir, 'pain-points.json'), JSON.stringify(this.getEmptyPainPoints(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'ai-maturity.json'), JSON.stringify(this.getEmptyAIMaturity(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'budget-timeline.json'), JSON.stringify(this.getEmptyBudgetTimeline(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'stakeholder-intel.json'), JSON.stringify(this.getEmptyStakeholderIntel(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'technical-reqs.json'), JSON.stringify(this.getEmptyTechnicalReqs(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'use-case.json'), JSON.stringify(this.getEmptyUseCase(dealId), null, 2));
    await fs.writeFile(path.join(intelDir, 'competitive.json'), JSON.stringify(this.getEmptyCompetitive(dealId), null, 2));
  }

  private getEmptyPainPoints(dealId: string): PainPointsIntelligence {
    return { dealId, updatedAt: new Date().toISOString(), items: [] };
  }

  private getEmptyAIMaturity(dealId: string): AIMaturityIntelligence {
    return {
      dealId,
      updatedAt: new Date().toISOString(),
      stage: 'exploring',
      priorAttempts: [],
      internalCapability: 'none',
      timelineUrgency: 'low',
      signals: [],
    };
  }

  private getEmptyBudgetTimeline(dealId: string): BudgetTimelineIntelligence {
    return {
      dealId,
      updatedAt: new Date().toISOString(),
      budgetConfirmed: false,
      signals: [],
    };
  }

  private getEmptyStakeholderIntel(dealId: string): StakeholderIntelligence {
    return { dealId, updatedAt: new Date().toISOString(), items: [] };
  }

  private getEmptyTechnicalReqs(dealId: string): TechnicalReqsIntelligence {
    return { dealId, updatedAt: new Date().toISOString(), items: [] };
  }

  private getEmptyUseCase(dealId: string): UseCaseIntelligence {
    return {
      dealId,
      updatedAt: new Date().toISOString(),
      clarity: 'exploring',
      secondaryUseCases: [],
      signals: [],
    };
  }

  private getEmptyCompetitive(dealId: string): CompetitiveIntelligence {
    return {
      dealId,
      updatedAt: new Date().toISOString(),
      competitors: [],
      previousVendorFailures: [],
      signals: [],
    };
  }
}

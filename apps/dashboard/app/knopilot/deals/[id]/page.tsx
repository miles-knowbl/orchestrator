'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Clock,
  Users,
  MessageSquare,
  Target,
  TrendingUp,
  AlertTriangle,
  Zap,
  ChevronRight,
  User,
  Mail,
  Shield,
  Brain,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Deal {
  id: string;
  name: string;
  company: string;
  industry?: string;
  stage: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
  daysInStage: number;
  stageHistory: { from: string | null; to: string; at: string; reason?: string }[];
}

interface Stakeholder {
  id: string;
  name: string;
  title: string;
  email?: string;
  role: 'champion' | 'decision-maker' | 'influencer' | 'blocker';
  sentiment: 'supportive' | 'neutral' | 'skeptical';
  keyQuotes: string[];
  concerns: string[];
}

interface DealScores {
  aiReadinessScore: number;
  championStrength: string;
  useCaseClarity: string;
  decisionTimeline: string;
  budgetRange: string;
  primaryPainPoint: string;
  technicalComplexity: string;
  competitiveThreat: string;
  dealConfidence: number;
  aiReadinessBreakdown: {
    executiveMandate: number;
    technicalCapability: number;
    useCaseClarity: number;
    budgetTimeline: number;
  };
  confidenceFactors: {
    championStrength: number;
    budgetConfirmed: number;
    technicalFit: number;
    stakeholderEngagement: number;
    competitivePosition: number;
    decisionClarity: number;
  };
}

interface NextBestAction {
  id: string;
  action: string;
  nbaScore: number;
  likelihood: number;
  effort: string;
  primaryImpact: string;
  timing: string;
  reasoning: string;
}

interface DealNBA {
  dealId: string;
  generatedAt: string;
  stage: string;
  actions: NextBestAction[];
  risks: string[];
}

interface Communication {
  id: string;
  type: string;
  subject?: string;
  content: string;
  timestamp: string;
  processed: boolean;
}

interface DealView {
  deal: Deal;
  stakeholders: Stakeholder[];
  scores: DealScores;
  nba: DealNBA;
  recentCommunications: Communication[];
}

const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-gray-500',
  target: 'bg-blue-500',
  discovery: 'bg-purple-500',
  contracting: 'bg-amber-500',
  production: 'bg-orch-500',
};

const ROLE_STYLES: Record<string, string> = {
  champion: 'bg-orch-500/10 text-orch-400 border-orch-500/20',
  'decision-maker': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  influencer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  blocker: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const SENTIMENT_STYLES: Record<string, string> = {
  supportive: 'text-orch-400',
  neutral: 'text-gray-400',
  skeptical: 'text-amber-400',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ScoreBar({ label, value, max, color = 'bg-orch-500' }: { label: string; value: number; max: number; color?: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-xs text-gray-400">{label}</span>
      <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-gray-500 text-right">{value}</span>
    </div>
  );
}

function PropertyBadge({ label, value, variant = 'default' }: { label: string; value: string; variant?: 'default' | 'good' | 'warn' | 'bad' }) {
  const colors = {
    default: 'bg-[#1a1a1a] text-gray-300 border-[#333]',
    good: 'bg-orch-500/10 text-orch-400 border-orch-500/20',
    warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    bad: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <div className={`px-3 py-2 rounded-lg border ${colors[variant]}`}>
      <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium capitalize">{value.replace(/-/g, ' ')}</p>
    </div>
  );
}

function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  return (
    <div className="bg-[#0a0a0a] rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <User className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{stakeholder.name}</p>
            <p className="text-xs text-gray-500">{stakeholder.title}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded border ${ROLE_STYLES[stakeholder.role]}`}>
          {stakeholder.role}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className={SENTIMENT_STYLES[stakeholder.sentiment]}>{stakeholder.sentiment}</span>
        {stakeholder.email && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {stakeholder.email}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function NBACard({ action, rank }: { action: NextBestAction; rank: number }) {
  const effortColor = action.effort === 'low' ? 'text-orch-400' :
                      action.effort === 'medium' ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="bg-[#0a0a0a] rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-orch-500/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-orch-400">{rank}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white mb-1">{action.action}</p>
          <p className="text-xs text-gray-500 mb-2">{action.reasoning}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">
              Score: <span className="text-white font-medium">{action.nbaScore}</span>
            </span>
            <span className="text-gray-400">
              Likelihood: <span className="text-white">{action.likelihood}%</span>
            </span>
            <span className="text-gray-400">
              Effort: <span className={effortColor}>{action.effort}</span>
            </span>
            <span className="text-gray-400">
              Timing: <span className="text-white">{action.timing}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as string;

  const [dealView, setDealView] = useState<DealView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const res = await fetchApi(`/api/knopilot/deals/${dealId}`);
        if (res.ok) {
          setDealView(await res.json());
          setError(null);
        } else {
          setError('Deal not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deal');
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [dealId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-[#222] rounded" />
          <div className="h-32 bg-[#111] rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#111] rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !dealView) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="/knopilot" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </a>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error || 'Deal not found'}</p>
        </div>
      </div>
    );
  }

  const { deal, stakeholders, scores, nba, recentCommunications } = dealView;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Link */}
      <a href="/knopilot" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Pipeline
      </a>

      {/* Header */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[deal.stage]}`} />
              <span className="text-sm text-gray-400 capitalize">{deal.stage}</span>
              <span className="text-gray-600">·</span>
              <span className="text-sm text-gray-500">{deal.daysInStage} days in stage</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{deal.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {deal.company}
              </span>
              {deal.industry && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {deal.industry}
                </span>
              )}
              {deal.value && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(deal.value)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">{scores.dealConfidence}%</p>
            <p className="text-xs text-gray-500">Deal Confidence</p>
          </div>
        </div>

        {/* Stage Timeline */}
        <div className="flex items-center gap-1 mt-4">
          {['lead', 'target', 'discovery', 'contracting', 'production'].map((stage, i) => {
            const isComplete = ['lead', 'target', 'discovery', 'contracting', 'production'].indexOf(deal.stage) >= i;
            const isCurrent = deal.stage === stage;
            return (
              <div key={stage} className="flex items-center flex-1">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    isComplete ? STAGE_COLORS[stage] : 'bg-[#1a1a1a]'
                  } ${isCurrent ? 'ring-2 ring-white/20' : ''}`}
                />
                {i < 4 && <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Scores */}
        <div className="space-y-6">
          {/* AI Readiness */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">AI Readiness Score</h3>
              <span className="ml-auto text-2xl font-bold text-white">{scores.aiReadinessScore}</span>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Executive Mandate" value={scores.aiReadinessBreakdown.executiveMandate} max={25} color="bg-purple-500" />
              <ScoreBar label="Technical Capability" value={scores.aiReadinessBreakdown.technicalCapability} max={25} color="bg-blue-500" />
              <ScoreBar label="Use Case Clarity" value={scores.aiReadinessBreakdown.useCaseClarity} max={25} color="bg-orch-500" />
              <ScoreBar label="Budget/Timeline" value={scores.aiReadinessBreakdown.budgetTimeline} max={25} color="bg-amber-500" />
            </div>
          </div>

          {/* Confidence Factors */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-orch-400" />
              <h3 className="text-sm font-medium text-gray-400">Confidence Factors</h3>
            </div>
            <div className="space-y-2">
              <ScoreBar label="Champion Strength" value={scores.confidenceFactors.championStrength} max={20} />
              <ScoreBar label="Budget Confirmed" value={scores.confidenceFactors.budgetConfirmed} max={15} />
              <ScoreBar label="Technical Fit" value={scores.confidenceFactors.technicalFit} max={15} />
              <ScoreBar label="Stakeholder Engagement" value={scores.confidenceFactors.stakeholderEngagement} max={20} />
              <ScoreBar label="Competitive Position" value={scores.confidenceFactors.competitivePosition} max={15} />
              <ScoreBar label="Decision Clarity" value={scores.confidenceFactors.decisionClarity} max={15} />
            </div>
          </div>

          {/* 9 Properties */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Deal Properties</h3>
            <div className="grid grid-cols-2 gap-2">
              <PropertyBadge
                label="Champion"
                value={scores.championStrength}
                variant={scores.championStrength === 'executive-sponsor' ? 'good' : scores.championStrength === 'weak' ? 'bad' : 'default'}
              />
              <PropertyBadge
                label="Use Case"
                value={scores.useCaseClarity}
                variant={scores.useCaseClarity === 'scoped' ? 'good' : 'default'}
              />
              <PropertyBadge label="Timeline" value={scores.decisionTimeline} />
              <PropertyBadge label="Budget" value={scores.budgetRange} />
              <PropertyBadge label="Pain Point" value={scores.primaryPainPoint} />
              <PropertyBadge
                label="Complexity"
                value={scores.technicalComplexity}
                variant={scores.technicalComplexity === 'high' ? 'warn' : 'default'}
              />
              <PropertyBadge
                label="Competition"
                value={scores.competitiveThreat}
                variant={scores.competitiveThreat === 'high' ? 'bad' : scores.competitiveThreat === 'none' ? 'good' : 'default'}
              />
            </div>
          </div>
        </div>

        {/* Middle Column - NBA & Risks */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-orch-400" />
              <h3 className="text-sm font-medium text-gray-400">Next Best Actions</h3>
            </div>
            {nba.actions.length > 0 ? (
              <div className="space-y-3">
                {nba.actions.slice(0, 5).map((action, i) => (
                  <NBACard key={action.id} action={action} rank={i + 1} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No actions generated</p>
            )}
          </div>

          {nba.risks.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-medium text-gray-400">Risks</h3>
              </div>
              <div className="space-y-2">
                {nba.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Stakeholders & Comms */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-medium text-gray-400">Stakeholders</h3>
              <span className="text-xs text-gray-500 ml-auto">{stakeholders.length}</span>
            </div>
            {stakeholders.length > 0 ? (
              <div className="space-y-2">
                {stakeholders.map((s) => (
                  <StakeholderCard key={s.id} stakeholder={s} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No stakeholders added</p>
            )}
          </div>

          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-medium text-gray-400">Recent Communications</h3>
              <span className="text-xs text-gray-500 ml-auto">{recentCommunications.length}</span>
            </div>
            {recentCommunications.length > 0 ? (
              <div className="space-y-2">
                {recentCommunications.slice(0, 5).map((comm) => (
                  <div key={comm.id} className="p-3 bg-[#0a0a0a] rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 capitalize">{comm.type}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{formatDate(comm.timestamp)}</span>
                      {comm.processed && (
                        <span className="text-xs text-orch-400 ml-auto">Processed</span>
                      )}
                    </div>
                    {comm.subject && (
                      <p className="text-sm font-medium text-white mb-1">{comm.subject}</p>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-2">{comm.content.slice(0, 150)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No communications captured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

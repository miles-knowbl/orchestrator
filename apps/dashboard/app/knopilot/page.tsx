'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Building2,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Deal {
  id: string;
  name: string;
  company: string;
  industry?: string;
  stage: string;
  value?: number;
  daysInStage: number;
}

interface PrioritizedDeal {
  deal: Deal;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  topAction: string;
}

interface StageData {
  stage: string;
  count: number;
  value: number;
}

interface PipelineMetrics {
  totalValue: number;
  weightedValue: number;
  dealCount: number;
  avgConfidence: number;
  highConfidenceDeals: number;
  atRiskDeals: number;
  byStage: Record<string, { count: number; value: number }>;
}

interface PipelineSummary {
  metrics: PipelineMetrics;
  prioritizedDeals: PrioritizedDeal[];
  stageDistribution: StageData[];
}

interface FocusAction {
  dealId: string;
  dealName: string;
  company: string;
  stage: string;
  action: string;
  reason: string;
  urgency: 'immediate' | 'this-week' | 'soon';
}

interface WeeklyFocus {
  generatedAt: string;
  actions: FocusAction[];
}

const STAGES = ['lead', 'target', 'discovery', 'contracting', 'production'];
const STAGE_COLORS: Record<string, string> = {
  lead: 'bg-gray-500',
  target: 'bg-blue-500',
  discovery: 'bg-purple-500',
  contracting: 'bg-amber-500',
  production: 'bg-orch-500',
};

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  target: 'Target',
  discovery: 'Discovery',
  contracting: 'Contracting',
  production: 'Production',
};

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color = confidence >= 75 ? 'text-orch-400 bg-orch-500/10 border-orch-500/20' :
                confidence >= 50 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${color}`}>
      {confidence}%
    </span>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const styles = {
    high: 'bg-red-500/10 text-red-400 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function UrgencyBadge({ urgency }: { urgency: 'immediate' | 'this-week' | 'soon' }) {
  const styles = {
    immediate: 'bg-red-500/10 text-red-400 border-red-500/20',
    'this-week': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    soon: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  const labels = {
    immediate: 'Now',
    'this-week': 'This Week',
    soon: 'Soon',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${styles[urgency]}`}>
      {labels[urgency]}
    </span>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, color = 'text-white' }: {
  icon: any;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}

function StageFunnel({ distribution }: { distribution: StageData[] }) {
  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Pipeline Stages</h3>
      <div className="space-y-3">
        {STAGES.map((stage) => {
          const data = distribution.find(d => d.stage === stage) || { count: 0, value: 0 };
          const width = (data.count / maxCount) * 100;
          return (
            <div key={stage} className="flex items-center gap-3">
              <span className="w-24 text-xs text-gray-400">{STAGE_LABELS[stage]}</span>
              <div className="flex-1 h-6 bg-[#1a1a1a] rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${STAGE_COLORS[stage]} transition-all duration-500`}
                  style={{ width: `${Math.max(width, data.count > 0 ? 10 : 0)}%` }}
                />
                {data.count > 0 && (
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                    {data.count} · {formatCurrency(data.value)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ deal, confidence, priority, topAction }: PrioritizedDeal) {
  return (
    <a
      href={`/knopilot/deals/${deal.id}`}
      className="block bg-[#111] border border-[#222] rounded-xl p-4 hover:border-blue-500/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${STAGE_COLORS[deal.stage]}`} />
          <span className="text-xs text-gray-500 capitalize">{deal.stage}</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence={confidence} />
          <PriorityBadge priority={priority} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
        {deal.name}
      </h3>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          {deal.company}
        </span>
        {deal.value && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {formatCurrency(deal.value)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {deal.daysInStage}d in stage
        </span>
      </div>

      <div className="flex items-center gap-2 p-2 bg-[#0a0a0a] rounded-lg">
        <Zap className="w-4 h-4 text-orch-400 shrink-0" />
        <p className="text-xs text-gray-300 line-clamp-1">{topAction}</p>
        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 ml-auto" />
      </div>
    </a>
  );
}

function WeeklyFocusCard({ action }: { action: FocusAction }) {
  return (
    <a
      href={`/knopilot/deals/${action.dealId}`}
      className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#111] transition-colors group"
    >
      <div className={`w-2 h-2 mt-1.5 rounded-full ${STAGE_COLORS[action.stage]}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{action.dealName}</span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-500">{action.company}</span>
          <UrgencyBadge urgency={action.urgency} />
        </div>
        <p className="text-sm text-gray-400">{action.action}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
    </a>
  );
}

export default function KnoPilotPage() {
  const [pipeline, setPipeline] = useState<PipelineSummary | null>(null);
  const [focus, setFocus] = useState<WeeklyFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pipelineRes, focusRes] = await Promise.all([
          fetchApi('/api/knopilot/pipeline'),
          fetchApi('/api/knopilot/weekly-focus'),
        ]);

        if (pipelineRes.ok) {
          setPipeline(await pipelineRes.json());
        }
        if (focusRes.ok) {
          setFocus(await focusRes.json());
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-[#222] rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-[#111] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <p className="text-gray-500 text-sm mt-2">Make sure the orchestrator server is running on localhost:3002</p>
        </div>
      </div>
    );
  }

  const metrics = pipeline?.metrics;
  const deals = pipeline?.prioritizedDeals || [];
  const distribution = pipeline?.stageDistribution || [];
  const actions = focus?.actions || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-orch-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">KnoPilot</h1>
            <p className="text-sm text-gray-500">Sales Intelligence Dashboard</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={DollarSign}
          label="Total Pipeline"
          value={formatCurrency(metrics?.totalValue || 0)}
          subValue={`${formatCurrency(metrics?.weightedValue || 0)} weighted`}
        />
        <MetricCard
          icon={Users}
          label="Active Deals"
          value={metrics?.dealCount || 0}
          subValue={`${metrics?.highConfidenceDeals || 0} high confidence`}
          color="text-blue-400"
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg Confidence"
          value={`${metrics?.avgConfidence || 0}%`}
          color={metrics && metrics.avgConfidence >= 70 ? 'text-orch-400' : 'text-amber-400'}
        />
        <MetricCard
          icon={AlertTriangle}
          label="At Risk"
          value={metrics?.atRiskDeals || 0}
          subValue="deals need attention"
          color={metrics && metrics.atRiskDeals > 0 ? 'text-red-400' : 'text-gray-400'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stage Funnel */}
        <div className="lg:col-span-1">
          <StageFunnel distribution={distribution} />
        </div>

        {/* Weekly Focus */}
        <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400">Weekly Focus</h3>
            <span className="text-xs text-gray-500">{actions.length} actions</span>
          </div>
          {actions.length > 0 ? (
            <div className="space-y-2">
              {actions.map((action, i) => (
                <WeeklyFocusCard key={i} action={action} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No focus actions generated</p>
          )}
        </div>
      </div>

      {/* Deal Cards */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Prioritized Deals</h3>
      </div>
      {deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((d) => (
            <DealCard key={d.deal.id} {...d} />
          ))}
        </div>
      ) : (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No deals in pipeline</p>
          <p className="text-gray-600 text-sm mt-2">
            Use the MCP tools to create deals
          </p>
        </div>
      )}
    </div>
  );
}

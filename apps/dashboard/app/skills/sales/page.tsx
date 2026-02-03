'use client';

import { useEffect, useState } from 'react';
import {
  Target,
  Brain,
  BarChart3,
  Zap,
  Calendar,
  TrendingUp,
  ChevronRight,
  Tag,
  RefreshCw,
  Users,
  MessageSquare,
  Search,
  DollarSign,
  Shield,
  Sparkles,
  FileText,
  Clock,
  CheckCircle2,
  WifiOff
} from 'lucide-react';
import { fetchWithFallback } from '@/lib/api';

interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
}

interface Loop {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  phases: { id: string; name: string; skills: string[] }[];
}

// Layer definitions for organizing skills
const layers = [
  {
    id: 1,
    name: 'Data Foundation',
    description: 'Core data capture and structure',
    icon: FileText,
    color: 'purple',
    skills: ['deal-create', 'communication-capture', 'stakeholder-add', 'communication-parse']
  },
  {
    id: 2,
    name: 'Intelligence Extraction',
    description: 'Extract signals from communications',
    icon: Brain,
    color: 'blue',
    skills: ['pain-point-extraction', 'budget-timeline-extraction', 'stakeholder-sentiment', 'ai-maturity-assessment', 'competitive-intel']
  },
  {
    id: 3,
    name: 'Scoring',
    description: 'Quantify deal health and risks',
    icon: BarChart3,
    color: 'green',
    skills: ['deal-scoring', 'champion-scoring', 'use-case-clarity', 'risk-assessment']
  },
  {
    id: 4,
    name: 'Action Generation',
    description: 'Recommend next best actions',
    icon: Zap,
    color: 'yellow',
    skills: ['next-best-action', 'action-impact-analysis', 'champion-enablement-asset']
  },
  {
    id: 5,
    name: 'Stage-Specific',
    description: 'Specialized skills by deal stage',
    icon: Calendar,
    color: 'orange',
    skills: ['lead-research', 'discovery-prep', 'discovery-debrief', 'prototype-scoping', 'contract-support']
  },
  {
    id: 6,
    name: 'Pipeline',
    description: 'Portfolio-level management',
    icon: TrendingUp,
    color: 'red',
    skills: ['pipeline-snapshot', 'deal-prioritization', 'weekly-focus']
  }
];

const loopDescriptions: Record<string, { icon: typeof Target; purpose: string }> = {
  'deal-intake-loop': { icon: Target, purpose: 'New deal pipeline entry' },
  'intelligence-loop': { icon: Brain, purpose: 'Process communications for signals' },
  'discovery-loop': { icon: MessageSquare, purpose: 'Full meeting workflow' },
  'deal-review-loop': { icon: Search, purpose: 'Single deal health check' },
  'champion-loop': { icon: Users, purpose: 'Champion enablement' },
  'pipeline-loop': { icon: TrendingUp, purpose: 'Weekly pipeline review' },
  'close-prep-loop': { icon: CheckCircle2, purpose: 'Pilot and contract support' }
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' }
};

function SkillCard({ skill, color }: { skill: Skill; color: string }) {
  const colors = colorClasses[color];
  return (
    <a
      href={`/skills/${skill.id}`}
      className={`block p-3 rounded-lg border ${colors.border} ${colors.bg} hover:bg-opacity-20 transition-all group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{skill.name}</span>
        <ChevronRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
      </div>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{skill.description}</p>
    </a>
  );
}

function LoopCard({ loop }: { loop: Loop }) {
  const config = loopDescriptions[loop.id] || { icon: RefreshCw, purpose: loop.description };
  const Icon = config.icon;
  const phaseCount = loop.phases?.length || 0;
  const skillCount = loop.phases?.reduce((acc, p) => acc + (p.skills?.length || 0), 0) || 0;

  return (
    <a
      href={`/loops/${loop.id}`}
      className="block p-4 bg-[#111] border border-[#222] rounded-xl hover:border-orch-500/50 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orch-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-orch-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-white">{loop.name}</span>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </div>
          <p className="text-sm text-gray-400 mt-1">{config.purpose}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>{phaseCount} phases</span>
            <span>{skillCount} skills</span>
          </div>
        </div>
      </div>
    </a>
  );
}

export default function SalesSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStatic, setIsStatic] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch skills
        const { data: skillsData, isStatic: staticMode } = await fetchWithFallback('/api/skills');
        const salesSkills = (skillsData.skills || []).filter((s: Skill) => s.category === 'sales');
        setSkills(salesSkills);
        setIsStatic(staticMode);

        // Fetch loops
        const { data: loopsData } = await fetchWithFallback('/api/loops');
        const salesLoops = (loopsData.loops || []).filter((l: Loop) => l.category === 'sales');
        setLoops(salesLoops);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSkillsByLayer = (layerSkillIds: string[]) => {
    return skills.filter(s => layerSkillIds.includes(s.id));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[#222] rounded w-1/3"></div>
          <div className="h-4 bg-[#222] rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-[#111] rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {isStatic && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2 text-sm text-yellow-400">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Viewing static catalog. Start the orchestrator server for live features.</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orch-500/10 rounded-lg">
            <Target className="w-6 h-6 text-orch-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">KnoPilot Sales Framework</h1>
            <p className="text-sm text-gray-500">AI-Powered Sales Intelligence System</p>
          </div>
        </div>
        <p className="text-gray-400 mt-4 max-w-3xl">
          A complete skill suite for relationship-driven sales built on the &quot;Give to Grow&quot; philosophy.
          24 skills across 6 layers power 7 specialized loops for every stage of the sales process.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{skills.length}</div>
          <div className="text-sm text-gray-500">Skills</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{loops.length}</div>
          <div className="text-sm text-gray-500">Loops</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-2xl font-bold text-white">6</div>
          <div className="text-sm text-gray-500">Layers</div>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="text-2xl font-bold text-white">6</div>
          <div className="text-sm text-gray-500">Pipeline Stages</div>
        </div>
      </div>

      {/* Pipeline Stages Visual */}
      <div className="mb-8 p-4 bg-[#111] border border-[#222] rounded-xl">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Pipeline Stages</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {['Lead', 'Target', 'Discovery', 'Contracting', 'Production', 'Closed'].map((stage, i) => (
            <div key={stage} className="flex items-center">
              <div className="px-4 py-2 bg-[#0a0a0a] rounded-lg text-sm text-white whitespace-nowrap">
                {stage}
              </div>
              {i < 5 && <ChevronRight className="w-4 h-4 text-gray-600 mx-1 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Skills by Layer */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Skills by Layer</h2>
        <div className="space-y-6">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const colors = colorClasses[layer.color];
            const layerSkills = getSkillsByLayer(layer.skills);

            return (
              <div key={layer.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 ${colors.bg} rounded-lg`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">
                      Layer {layer.id}: {layer.name}
                    </h3>
                    <p className="text-sm text-gray-500">{layer.description}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-1 rounded ${colors.bg} ${colors.text}`}>
                    {layerSkills.length} skills
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {layerSkills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} color={layer.color} />
                  ))}
                  {layerSkills.length === 0 && layer.skills.map((skillId) => (
                    <div key={skillId} className={`p-3 rounded-lg border ${colors.border} ${colors.bg} opacity-50`}>
                      <span className="text-sm text-gray-500">{skillId}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loops */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Loops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loops.map((loop) => (
            <LoopCard key={loop.id} loop={loop} />
          ))}
          {loops.length === 0 && (
            <div className="col-span-full bg-[#111] border border-[#222] rounded-xl p-8 text-center">
              <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No sales loops found</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Concepts */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h4 className="text-sm font-medium text-white">Deal Intelligence</h4>
          </div>
          <p className="text-xs text-gray-500">
            AI Readiness, Champion Strength, Use Case Clarity, Deal Confidence — all scored 0-100.
          </p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h4 className="text-sm font-medium text-white">NBA Engine</h4>
          </div>
          <p className="text-xs text-gray-500">
            Next Best Action scoring: Likelihood (40%) + Effort Factor (30%) + Champion Value (30%).
          </p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-medium text-white">Risk Categories</h4>
          </div>
          <p className="text-xs text-gray-500">
            Champion, Competition, Budget, Timeline, Technical, Organizational, Fit risks tracked.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-[#222] text-center">
        <p className="text-sm text-gray-500">
          Built on the KnoPilot methodology — relationship-driven sales powered by AI intelligence.
        </p>
        <a href="/skills" className="inline-flex items-center gap-1 text-sm text-orch-400 hover:text-orch-300 mt-2">
          View all skills <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

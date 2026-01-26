'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Zap, Tag, BookOpen, Clock, BarChart2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Prose } from '@/components/Prose';
import { fetchApi } from '@/lib/api';

const phaseColors: Record<string, string> = {
  INIT: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  SCAFFOLD: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  IMPLEMENT: 'bg-orch-500/10 text-orch-400 border-orch-500/30',
  TEST: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  VERIFY: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  VALIDATE: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  DOCUMENT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  REVIEW: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  SHIP: 'bg-red-500/10 text-red-400 border-red-500/30',
  COMPLETE: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

interface SkillReference {
  name: string;
  path: string;
  content?: string;
}

interface SkillDetail {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
  content: string;
  references: SkillReference[];
  learning?: {
    executionCount: number;
    successRate: number;
    lastExecuted?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  author?: string;
}

function ReferenceItem({ reference }: { reference: SkillReference }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#222] rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 bg-[#111] hover:bg-[#161616] transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
        <FileText className="w-4 h-4 text-purple-400" />
        <span className="text-sm text-white">{reference.name}</span>
      </button>
      {expanded && reference.content && (
        <div className="p-4 bg-[#0a0a0a] border-t border-[#222]">
          <Prose size="xs">{reference.content}</Prose>
        </div>
      )}
    </div>
  );
}

export default function SkillDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await fetchApi(`/api/skills/${id}?includeReferences=true`);
        if (!res.ok) throw new Error('Skill not found');
        const data = await res.json();
        setSkill(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchSkill();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <a href="/skills" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Skills
        </a>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <a href="/skills" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Skills
        </a>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{skill.name}</h1>
              <span className="text-sm text-gray-500 bg-[#1a1a1a] px-2 py-0.5 rounded">
                v{skill.version}
              </span>
            </div>
            <p className="text-gray-400 mb-3">{skill.description}</p>
            <div className="flex items-center gap-3">
              {skill.phase && (
                <span className={`text-xs font-medium px-2 py-1 rounded border ${phaseColors[skill.phase] || 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                  {skill.phase}
                </span>
              )}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {skill.category}
              </span>
              {skill.author && (
                <span className="text-xs text-gray-500">
                  by {skill.author}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {skill.learning && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-orch-400" />
              <span className="text-xs text-gray-500">Executions</span>
            </div>
            <p className="text-2xl font-bold text-white">{skill.learning.executionCount}</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-500">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(skill.learning.successRate * 100)}%</p>
          </div>
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-500">Last Executed</span>
            </div>
            <p className="text-sm font-medium text-white">
              {skill.learning.lastExecuted
                ? new Date(skill.learning.lastExecuted).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - SKILL.md */}
        <div className="lg:col-span-2">
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-white">SKILL.md</span>
            </div>
            <div className="p-6">
              <Prose>{skill.content}</Prose>
            </div>
          </div>
        </div>

        {/* Sidebar - References */}
        <div className="space-y-4">
          {skill.references && skill.references.length > 0 && (
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#222] bg-[#0d0d0d] flex items-center justify-between">
                <span className="text-sm font-medium text-white">References</span>
                <span className="text-xs text-gray-500">{skill.references.length} files</span>
              </div>
              <div className="p-3 space-y-2">
                {skill.references.map((ref, idx) => (
                  <ReferenceItem key={idx} reference={ref} />
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Metadata</h3>
            <div className="space-y-2 text-xs">
              {skill.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-400">{new Date(skill.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              {skill.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-gray-400">{new Date(skill.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">ID</span>
                <span className="text-gray-400 font-mono">{skill.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

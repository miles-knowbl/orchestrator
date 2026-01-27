'use client';

import { useEffect, useState } from 'react';
import { Zap, Search, ChevronRight, Tag } from 'lucide-react';
import { fetchApi } from '@/lib/api';

interface Skill {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
}

const phaseColors: Record<string, string> = {
  INIT: 'bg-purple-500/10 text-purple-400',
  SCAFFOLD: 'bg-blue-500/10 text-blue-400',
  IMPLEMENT: 'bg-orch-500/10 text-orch-400',
  TEST: 'bg-yellow-500/10 text-yellow-400',
  VERIFY: 'bg-orange-500/10 text-orange-400',
  VALIDATE: 'bg-pink-500/10 text-pink-400',
  DOCUMENT: 'bg-cyan-500/10 text-cyan-400',
  REVIEW: 'bg-indigo-500/10 text-indigo-400',
  SHIP: 'bg-red-500/10 text-red-400',
  COMPLETE: 'bg-gray-500/10 text-gray-400',
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const params = new URLSearchParams();
        if (search) params.set('query', search);
        if (phaseFilter) params.set('phase', phaseFilter);

        const res = await fetchApi(`/api/skills?${params}`);
        if (!res.ok) throw new Error('Failed to fetch skills');
        const data = await res.json();
        setSkills(data.skills);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchSkills();
  }, [search, phaseFilter]);

  const phases = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Skills</h1>
            <p className="text-sm text-gray-500">{skills.length} skills available</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-orch-500 focus:outline-none"
          />
        </div>

        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="bg-[#111] border border-[#222] rounded-lg px-4 py-2 text-sm text-white focus:border-orch-500 focus:outline-none"
        >
          <option value="">All Phases</option>
          {phases.map((phase) => (
            <option key={phase} value={phase}>{phase}</option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <a
            key={skill.id}
            href={`/skills/${skill.id}`}
            className="block bg-[#111] border border-[#222] rounded-xl p-4 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium text-white">{skill.name}</span>
                <span className="text-xs text-gray-500">v{skill.version}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>

            <p className="text-sm text-gray-400 line-clamp-2 mb-3">{skill.description}</p>

            <div className="flex items-center gap-2">
              {skill.phase && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${phaseColors[skill.phase] || 'bg-gray-500/10 text-gray-400'}`}>
                  {skill.phase}
                </span>
              )}
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {skill.category}
              </span>
            </div>
          </a>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
          <p className="text-gray-500">No skills found</p>
        </div>
      )}
    </div>
  );
}

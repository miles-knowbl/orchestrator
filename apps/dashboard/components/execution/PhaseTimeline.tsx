'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Clock, ChevronRight, X } from 'lucide-react';
import type { Execution } from './types';

export function PhaseTimeline({
  phases,
  currentPhase,
  executionStatus,
  onCompletePhase,
  onAdvancePhase,
  onCompleteSkill,
  onSkipSkill,
  actionLoading,
}: {
  phases: Execution['phases'];
  currentPhase: string;
  executionStatus: string;
  onCompletePhase: () => void;
  onAdvancePhase: () => void;
  onCompleteSkill: (skillId: string) => void;
  onSkipSkill: (skillId: string, reason: string) => void;
  actionLoading: string | null;
}) {
  const [skipInputs, setSkipInputs] = useState<Record<string, string>>({});
  const [showSkip, setShowSkip] = useState<string | null>(null);

  const isActive = executionStatus === 'active';

  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-orch-500" />;
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'skipped':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-4">Phase Progress</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#222]" />

        <div className="space-y-3">
          {phases.map((phase) => {
            const isCurrent = phase.phase === currentPhase;
            const allSkillsDone = phase.skills.every(
              s => s.status === 'completed' || s.status === 'skipped'
            );

            return (
              <div key={phase.phase} className="relative">
                <div className="flex items-start gap-3">
                  <div className={`relative z-10 w-4 h-4 flex items-center justify-center rounded-full ${
                    phase.status === 'in-progress' ? 'bg-blue-500/20' :
                    phase.status === 'completed' ? 'bg-orch-500/20' : 'bg-[#1a1a1a]'
                  }`}>
                    {getPhaseIcon(phase.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-white' : 'text-gray-400'
                      }`}>
                        {phase.phase}
                      </span>
                      {phase.status === 'in-progress' && (
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Skills list for current phase */}
                    {isCurrent && isActive ? (
                      <div className="mt-2 space-y-1.5">
                        {phase.skills.map((skill) => {
                          const canAct = skill.status === 'pending' || skill.status === 'in-progress';
                          return (
                            <div key={skill.skillId} className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                skill.status === 'completed' ? 'bg-orch-500' :
                                skill.status === 'in-progress' ? 'bg-blue-400' :
                                skill.status === 'skipped' ? 'bg-gray-500' :
                                skill.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
                              }`} />
                              <span className="text-xs text-gray-300 flex-1 truncate">{skill.skillId}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                skill.status === 'completed' ? 'bg-orch-500/10 text-orch-400' :
                                skill.status === 'skipped' ? 'bg-gray-500/10 text-gray-400' :
                                'bg-[#1a1a1a] text-gray-500'
                              }`}>
                                {skill.status}
                              </span>
                              {canAct && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => onCompleteSkill(skill.skillId)}
                                    disabled={actionLoading !== null}
                                    className="text-xs px-2 py-0.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded disabled:opacity-50 transition-colors"
                                  >
                                    Complete
                                  </button>
                                  {showSkip === skill.skillId ? (
                                    <div className="flex gap-1">
                                      <input
                                        type="text"
                                        value={skipInputs[skill.skillId] || ''}
                                        onChange={(e) => setSkipInputs(prev => ({ ...prev, [skill.skillId]: e.target.value }))}
                                        placeholder="Reason..."
                                        className="text-xs bg-[#0a0a0a] border border-[#333] rounded px-2 py-0.5 text-white w-28 focus:border-yellow-500 focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && skipInputs[skill.skillId]?.trim()) {
                                            onSkipSkill(skill.skillId, skipInputs[skill.skillId].trim());
                                            setShowSkip(null);
                                            setSkipInputs(prev => ({ ...prev, [skill.skillId]: '' }));
                                          }
                                          if (e.key === 'Escape') setShowSkip(null);
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          if (skipInputs[skill.skillId]?.trim()) {
                                            onSkipSkill(skill.skillId, skipInputs[skill.skillId].trim());
                                            setShowSkip(null);
                                            setSkipInputs(prev => ({ ...prev, [skill.skillId]: '' }));
                                          }
                                        }}
                                        disabled={!skipInputs[skill.skillId]?.trim() || actionLoading !== null}
                                        className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded disabled:opacity-50 transition-colors"
                                      >
                                        Go
                                      </button>
                                      <button
                                        onClick={() => setShowSkip(null)}
                                        className="text-xs px-1 py-0.5 text-gray-500 hover:text-gray-300"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowSkip(skill.skillId)}
                                      disabled={actionLoading !== null}
                                      className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded disabled:opacity-50 transition-colors"
                                    >
                                      Skip
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Phase-level actions */}
                        {phase.status === 'in-progress' && allSkillsDone && (
                          <button
                            onClick={onCompletePhase}
                            disabled={actionLoading !== null}
                            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-orch-500/20 text-orch-400 hover:bg-orch-500/30 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Complete Phase
                          </button>
                        )}
                        {phase.status === 'completed' && (
                          <button
                            onClick={onAdvancePhase}
                            disabled={actionLoading !== null}
                            className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg disabled:opacity-50 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" />
                            Advance to Next Phase
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Compact dot view for non-current phases */
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {phase.skills.map((skill) => (
                            <div
                              key={skill.skillId}
                              className={`w-1.5 h-1.5 rounded-full ${
                                skill.status === 'completed' ? 'bg-orch-500' :
                                skill.status === 'in-progress' ? 'bg-blue-400' :
                                skill.status === 'failed' ? 'bg-red-500' : 'bg-gray-600'
                              }`}
                              title={skill.skillId}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {phase.skills.filter(s => s.status === 'completed').length}/{phase.skills.length} skills
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface Phase {
  name: string;
  order: number;
  skills: { skillId: string; required: boolean }[];
  required: boolean;
}

interface PhaseTimelineProps {
  phases: Phase[];
  currentPhase: string;
  onPhaseClick: (phase: string) => void;
}

export function PhaseTimeline({ phases, currentPhase, onPhaseClick }: PhaseTimelineProps) {
  const currentIndex = phases.findIndex(p => p.name === currentPhase);

  return (
    <div className="flex-1 overflow-y-auto">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Phases
      </h2>
      <div className="space-y-1">
        {phases.map((phase, index) => {
          const isComplete = index < currentIndex;
          const isCurrent = phase.name === currentPhase;
          const isFuture = index > currentIndex;

          return (
            <button
              key={phase.name}
              onClick={() => onPhaseClick(phase.name)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                isCurrent && "bg-gray-800 ring-1 ring-blue-500",
                isComplete && "hover:bg-gray-800/50",
                isFuture && "opacity-50 hover:opacity-75"
              )}
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  isComplete && "bg-green-600 text-white",
                  isCurrent && "bg-blue-600 text-white",
                  isFuture && "bg-gray-700 text-gray-400"
                )}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Phase info */}
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "text-sm font-medium truncate",
                  isCurrent && "text-white",
                  isComplete && "text-gray-300",
                  isFuture && "text-gray-500"
                )}>
                  {phase.name}
                </div>
                <div className="text-xs text-gray-500">
                  {phase.skills.length} skill{phase.skills.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Arrow for current */}
              {isCurrent && (
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

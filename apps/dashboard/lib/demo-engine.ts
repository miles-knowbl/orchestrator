import { useState, useEffect, useCallback, useRef } from 'react';
import type { Execution, LogEntry } from '@/components/execution/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LoopForDemo {
  id: string;
  name: string;
  version: string;
  phases: { name: string; order: number; skills: { skillId: string; required: boolean }[] }[];
  gates: { id: string; name: string; afterPhase: string; required: boolean; approvalType: string }[];
}

export interface DemoConfig {
  project: string;
  mode: string;
  autonomy: 'supervised' | 'autonomous';
}

type DemoAction =
  | { type: 'start_skill'; phaseIndex: number; skillIndex: number }
  | { type: 'complete_skill'; phaseIndex: number; skillIndex: number }
  | { type: 'complete_phase'; phaseIndex: number }
  | { type: 'approve_gate'; gateId: string }
  | { type: 'wait_for_gate'; gateId: string }
  | { type: 'advance_phase'; nextPhaseIndex: number }
  | { type: 'execution_complete' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let logCounter = 0;

function makeLog(
  category: LogEntry['category'],
  level: LogEntry['level'],
  message: string,
  phase?: string,
  skillId?: string,
  gateId?: string,
): LogEntry {
  return {
    id: `demo-log-${++logCounter}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    phase,
    skillId,
    gateId,
  };
}

function buildInitialExecution(loop: LoopForDemo, config: DemoConfig): Execution {
  const sortedPhases = [...loop.phases].sort((a, b) => a.order - b.order);
  return {
    id: `demo-${loop.id}-${Date.now()}`,
    loopId: loop.id,
    loopVersion: loop.version,
    project: config.project,
    mode: config.mode,
    autonomy: config.autonomy,
    currentPhase: sortedPhases[0]?.name || '',
    status: 'active',
    phases: sortedPhases.map((p, i) => ({
      phase: p.name,
      status: i === 0 ? 'in-progress' : 'pending',
      startedAt: i === 0 ? new Date().toISOString() : undefined,
      skills: p.skills.map(s => ({ skillId: s.skillId, status: 'pending' as string })),
    })),
    gates: loop.gates.map(g => ({ gateId: g.id, status: 'pending' as string })),
    logs: [
      makeLog('system', 'info', `Demo execution started for ${loop.name}`),
      makeLog('phase', 'info', `Starting phase ${sortedPhases[0]?.name}`, sortedPhases[0]?.name),
    ],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildGatesByPhase(loop: LoopForDemo): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const gate of loop.gates) {
    const list = map.get(gate.afterPhase) || [];
    list.push(gate.id);
    map.set(gate.afterPhase, list);
  }
  return map;
}

/** Determine the next auto-play action based on current execution state. */
function getNextAction(
  exec: Execution,
  gatesByPhase: Map<string, string[]>,
  autonomy: string,
): DemoAction | null {
  if (exec.status !== 'active') return null;

  const currentPhaseIdx = exec.phases.findIndex(p => p.phase === exec.currentPhase);
  if (currentPhaseIdx === -1) return null;
  const phase = exec.phases[currentPhaseIdx];

  if (phase.status === 'in-progress') {
    // Find first pending skill → start it
    const pendingIdx = phase.skills.findIndex(s => s.status === 'pending');
    if (pendingIdx >= 0) {
      return { type: 'start_skill', phaseIndex: currentPhaseIdx, skillIndex: pendingIdx };
    }

    // Find first in-progress skill → complete it
    const inProgressIdx = phase.skills.findIndex(s => s.status === 'in-progress');
    if (inProgressIdx >= 0) {
      return { type: 'complete_skill', phaseIndex: currentPhaseIdx, skillIndex: inProgressIdx };
    }

    // All skills done → complete phase
    const allDone = phase.skills.every(s => s.status === 'completed' || s.status === 'skipped');
    if (allDone) {
      return { type: 'complete_phase', phaseIndex: currentPhaseIdx };
    }
  }

  if (phase.status === 'completed') {
    // Check for pending gates after this phase
    const gateIds = gatesByPhase.get(phase.phase) || [];
    const pendingGate = exec.gates.find(g => gateIds.includes(g.gateId) && g.status === 'pending');
    if (pendingGate) {
      if (autonomy === 'autonomous') {
        return { type: 'approve_gate', gateId: pendingGate.gateId };
      }
      return { type: 'wait_for_gate', gateId: pendingGate.gateId };
    }

    // All gates approved — advance to next phase or complete
    const nextPhaseIdx = currentPhaseIdx + 1;
    if (nextPhaseIdx < exec.phases.length) {
      return { type: 'advance_phase', nextPhaseIndex: nextPhaseIdx };
    }
    return { type: 'execution_complete' };
  }

  return null;
}

/** Apply a DemoAction to an execution, returning a new Execution with the action applied. */
function applyAction(exec: Execution, action: DemoAction): Execution {
  const now = new Date().toISOString();
  // Deep-clone the mutable parts
  const next: Execution = {
    ...exec,
    phases: exec.phases.map(p => ({
      ...p,
      skills: p.skills.map(s => ({ ...s })),
    })),
    gates: exec.gates.map(g => ({ ...g })),
    logs: [...exec.logs],
    updatedAt: now,
  };

  switch (action.type) {
    case 'start_skill': {
      const skill = next.phases[action.phaseIndex].skills[action.skillIndex];
      skill.status = 'in-progress';
      next.logs.push(makeLog(
        'skill', 'info',
        `Executing skill: ${skill.skillId}`,
        next.phases[action.phaseIndex].phase,
        skill.skillId,
      ));
      break;
    }
    case 'complete_skill': {
      const skill = next.phases[action.phaseIndex].skills[action.skillIndex];
      skill.status = 'completed';
      next.logs.push(makeLog(
        'skill', 'info',
        `Skill completed: ${skill.skillId}`,
        next.phases[action.phaseIndex].phase,
        skill.skillId,
      ));
      break;
    }
    case 'complete_phase': {
      const phase = next.phases[action.phaseIndex];
      phase.status = 'completed';
      phase.completedAt = now;
      next.logs.push(makeLog(
        'phase', 'info',
        `Phase ${phase.phase} completed`,
        phase.phase,
      ));
      break;
    }
    case 'approve_gate': {
      const gate = next.gates.find(g => g.gateId === action.gateId)!;
      gate.status = 'approved';
      gate.approvedBy = 'demo';
      gate.approvedAt = now;
      next.logs.push(makeLog(
        'gate', 'info',
        `Gate approved: ${gate.gateId}`,
        undefined,
        undefined,
        gate.gateId,
      ));
      break;
    }
    case 'advance_phase': {
      const nextPhase = next.phases[action.nextPhaseIndex];
      nextPhase.status = 'in-progress';
      nextPhase.startedAt = now;
      next.currentPhase = nextPhase.phase;
      next.logs.push(makeLog(
        'phase', 'info',
        `Advancing to phase ${nextPhase.phase}`,
        nextPhase.phase,
      ));
      break;
    }
    case 'execution_complete': {
      next.status = 'completed';
      next.completedAt = now;
      next.logs.push(makeLog(
        'system', 'info',
        'Execution completed successfully',
      ));
      break;
    }
    // wait_for_gate is handled externally (sets waitingForGate)
  }

  return next;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDemoExecution(loop: LoopForDemo, config: DemoConfig) {
  const [execution, setExecution] = useState<Execution>(() => buildInitialExecution(loop, config));
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(800);
  const [waitingForGate, setWaitingForGate] = useState<string | null>(null);

  const gatesByPhaseRef = useRef(buildGatesByPhase(loop));

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || waitingForGate || execution.status !== 'active') return;

    const timer = setTimeout(() => {
      const action = getNextAction(execution, gatesByPhaseRef.current, config.autonomy);
      if (!action) return;

      if (action.type === 'wait_for_gate') {
        setWaitingForGate(action.gateId);
        // Add a log entry for the gate check
        setExecution(prev => ({
          ...prev,
          logs: [...prev.logs, makeLog('gate', 'warn', `Waiting for gate approval: ${action.gateId}`, undefined, undefined, action.gateId)],
          updatedAt: new Date().toISOString(),
        }));
        return;
      }

      setExecution(prev => applyAction(prev, action));
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, speed, waitingForGate, execution, config.autonomy]);

  // Manual actions
  const completeSkill = useCallback((skillId: string) => {
    setExecution(prev => {
      const phaseIdx = prev.phases.findIndex(p => p.phase === prev.currentPhase);
      if (phaseIdx === -1) return prev;
      const skillIdx = prev.phases[phaseIdx].skills.findIndex(s => s.skillId === skillId);
      if (skillIdx === -1) return prev;
      const skill = prev.phases[phaseIdx].skills[skillIdx];
      if (skill.status === 'completed' || skill.status === 'skipped') return prev;

      let next = prev;
      // If pending, start it first then complete
      if (skill.status === 'pending') {
        next = applyAction(next, { type: 'start_skill', phaseIndex: phaseIdx, skillIndex: skillIdx });
      }
      return applyAction(next, { type: 'complete_skill', phaseIndex: phaseIdx, skillIndex: skillIdx });
    });
  }, []);

  const skipSkill = useCallback((skillId: string, reason: string) => {
    setExecution(prev => {
      const phaseIdx = prev.phases.findIndex(p => p.phase === prev.currentPhase);
      if (phaseIdx === -1) return prev;
      const skillIdx = prev.phases[phaseIdx].skills.findIndex(s => s.skillId === skillId);
      if (skillIdx === -1) return prev;

      const next: Execution = {
        ...prev,
        phases: prev.phases.map(p => ({ ...p, skills: p.skills.map(s => ({ ...s })) })),
        gates: prev.gates.map(g => ({ ...g })),
        logs: [...prev.logs],
        updatedAt: new Date().toISOString(),
      };
      next.phases[phaseIdx].skills[skillIdx].status = 'skipped';
      next.logs.push(makeLog('skill', 'warn', `Skill skipped: ${skillId} (${reason})`, prev.currentPhase, skillId));
      return next;
    });
  }, []);

  const completePhase = useCallback(() => {
    setExecution(prev => {
      const phaseIdx = prev.phases.findIndex(p => p.phase === prev.currentPhase);
      if (phaseIdx === -1 || prev.phases[phaseIdx].status !== 'in-progress') return prev;
      return applyAction(prev, { type: 'complete_phase', phaseIndex: phaseIdx });
    });
  }, []);

  const advancePhase = useCallback(() => {
    setExecution(prev => {
      const phaseIdx = prev.phases.findIndex(p => p.phase === prev.currentPhase);
      if (phaseIdx === -1) return prev;
      const nextIdx = phaseIdx + 1;
      if (nextIdx >= prev.phases.length) {
        return applyAction(prev, { type: 'execution_complete' });
      }
      return applyAction(prev, { type: 'advance_phase', nextPhaseIndex: nextIdx });
    });
  }, []);

  const approveGate = useCallback((gateId: string) => {
    setExecution(prev => applyAction(prev, { type: 'approve_gate', gateId }));
    setWaitingForGate(null);
  }, []);

  const rejectGate = useCallback((gateId: string, feedback: string) => {
    setExecution(prev => {
      const next: Execution = {
        ...prev,
        gates: prev.gates.map(g => g.gateId === gateId ? { ...g, status: 'rejected' } : { ...g }),
        logs: [...prev.logs, makeLog('gate', 'error', `Gate rejected: ${gateId} — ${feedback}`, undefined, undefined, gateId)],
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
    setWaitingForGate(null);
  }, []);

  const reset = useCallback(() => {
    logCounter = 0;
    setExecution(buildInitialExecution(loop, config));
    setWaitingForGate(null);
    setIsPlaying(true);
  }, [loop, config]);

  return {
    execution,
    isPlaying,
    speed,
    waitingForGate,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    setSpeed,
    completeSkill,
    skipSkill,
    completePhase,
    advancePhase,
    approveGate,
    rejectGate,
    reset,
  };
}

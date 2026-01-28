export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'phase' | 'skill' | 'gate' | 'system';
  phase?: string;
  skillId?: string;
  gateId?: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface GateDefinition {
  id: string;
  name: string;
  afterPhase: string;
  required: boolean;
  approvalType: 'human' | 'auto' | 'conditional';
  deliverables?: string[];
}

export interface Execution {
  id: string;
  loopId: string;
  loopVersion: string;
  project: string;
  mode: string;
  autonomy: string;
  currentPhase: string;
  status: string;
  phases: {
    phase: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    skills: { skillId: string; status: string }[];
  }[];
  gates: { gateId: string; status: string; approvedBy?: string; approvedAt?: string }[];
  logs: LogEntry[];
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

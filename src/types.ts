/**
 * Orchestrator v2 - Core Type Definitions
 *
 * Skills are the atomic primitive. Everything else composes from skills.
 */

// =============================================================================
// PHASE & CATEGORY ENUMS
// =============================================================================

export const PHASES = [
  'INIT',
  'SCAFFOLD',
  'IMPLEMENT',
  'TEST',
  'VERIFY',
  'VALIDATE',
  'DOCUMENT',
  'REVIEW',
  'SHIP',
  'COMPLETE'
] as const;

export type Phase = typeof PHASES[number];

export const SKILL_CATEGORIES = [
  'core',
  'infra',
  'meta',
  'specialized',
  'custom'
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

// =============================================================================
// SKILL TYPES
// =============================================================================

export interface Skill {
  id: string;                    // e.g., "implement"
  version: string;               // semver: "2.1.0"
  description: string;
  phase?: Phase;                 // Primary phase affinity
  category: SkillCategory;

  // Content
  content: string;               // Markdown from SKILL.md
  references: SkillReference[];  // Supporting docs

  // MECE support
  tags?: string[];               // e.g., ["data-layer", "validation", "api"]
  dependsOn?: string[];          // Skills this skill depends on

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  author?: string;

  // Learning metadata
  learning: SkillLearning;
}

export interface SkillReference {
  name: string;                  // e.g., "pattern-matching.md"
  path: string;
  content?: string;              // Lazy-loaded
}

export interface SkillLearning {
  executionCount: number;
  successRate: number;           // 0-1
  lastExecuted?: Date;
  improvementHistory: ImprovementRecord[];
}

export interface ImprovementRecord {
  id: string;                    // e.g., "IMP-042"
  version: string;               // Version after improvement
  timestamp: Date;
  source: string;                // e.g., "project-x IMPLEMENT phase"
  category: ImprovementCategory;
  feedback: string;
  diff?: string;                 // Git diff of change
}

export type ImprovementCategory = 'bug' | 'enhancement' | 'clarification' | 'new-feature';

// Skill UI configuration for app generation
export interface SkillUIConfig {
  displayName?: string;
  icon?: string;
  inputForm?: FormField[];
  outputDisplay?: 'markdown' | 'code' | 'diff' | 'artifact' | 'json';
  autoExecute?: boolean;
}

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'json';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

// =============================================================================
// LOOP TYPES
// =============================================================================

export interface Loop {
  id: string;                    // e.g., "engineering-loop"
  name: string;
  description: string;
  version: string;               // semver
  content?: string;              // LOOP.md content for rendering

  // Structure
  phases: LoopPhase[];
  gates: Gate[];

  // Execution defaults
  defaultMode: LoopMode;
  defaultAutonomy: AutonomyLevel;

  // UI generation config
  ui: LoopUIConfig;
  skillUI: Record<string, SkillUIConfig>;

  // Metadata
  skillCount: number;
  category: string;
  author?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoopPhase {
  name: Phase;
  order: number;
  skills: PhaseSkill[];
  required: boolean;
  parallel?: boolean;
  ui?: {
    color?: string;
    icon?: string;
    collapsible?: boolean;
  };
}

export interface PhaseSkill {
  skillId: string;
  required: boolean;
  condition?: string;            // e.g., "mode === 'greenfield'"
  order?: number;
}

export interface Gate {
  id: string;                    // e.g., "spec-gate"
  name: string;
  afterPhase: Phase;
  required: boolean;
  approvalType: 'human' | 'auto' | 'conditional';
  deliverables: string[];
  ui?: {
    title: string;
    approvalPrompt: string;
    feedbackRequired: boolean;
    artifactsToShow: string[];
  };
}

export type LoopMode = 'greenfield' | 'brownfield-polish' | 'brownfield-enterprise';
export type AutonomyLevel = 'full' | 'supervised' | 'manual';

export interface LoopUIConfig {
  theme: 'engineering' | 'proposal' | 'review' | 'custom';
  branding?: {
    title: string;
    subtitle?: string;
    logo?: string;
    primaryColor?: string;
  };
  layout: 'chat-focused' | 'dashboard' | 'timeline';
  features: {
    skillBrowser: boolean;
    deliverableViewer: boolean;
    gateApprovalUI: boolean;
    progressTimeline: boolean;
    metricsPanel: boolean;
  };
}

// =============================================================================
// EXECUTION TYPES
// =============================================================================

export interface LoopExecution {
  id: string;                    // UUID
  loopId: string;
  loopVersion: string;

  // Context
  project: string;
  mode: LoopMode;
  autonomy: AutonomyLevel;

  // State machine
  currentPhase: Phase;
  status: ExecutionStatus;

  // Progress
  phases: PhaseExecutionState[];
  gates: GateState[];
  skillExecutions: SkillExecution[];

  // Timing
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Logs
  logs: ExecutionLogEntry[];

  // Memory link
  memoryId: string;
}

export type ExecutionStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'blocked'
  | 'completed'
  | 'failed';

export interface PhaseExecutionState {
  phase: Phase;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  skills: {
    skillId: string;
    status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
  }[];
}

export interface GateState {
  gateId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  feedback?: string;
}

export interface SkillExecution {
  id: string;                    // UUID
  skillId: string;
  skillVersion: string;
  phase: Phase;

  // Execution
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;

  // Results
  deliverables: string[];
  referencesRead: string[];
  error?: string;

  // Outcome scoring for learning
  outcome?: {
    success: boolean;
    score: number;               // 0-1
    signals: string[];
  };

  // Nesting
  parentExecutionId?: string;
  children?: SkillExecution[];
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'phase' | 'skill' | 'gate' | 'system';

  // Context
  phase?: Phase;
  skillId?: string;
  gateId?: string;

  // Content
  message: string;
  details?: Record<string, unknown>;

  // Metrics
  durationMs?: number;
  tokenUsage?: {
    input: number;
    output: number;
  };
}

// =============================================================================
// MEMORY TYPES
// =============================================================================

export interface Memory {
  id: string;
  level: MemoryLevel;
  parentId?: string;

  // Context
  project?: string;
  loopId?: string;
  skillId?: string;

  // Content
  summary?: string;
  decisions: Decision[];
  patterns: Pattern[];
  calibration: CalibrationData;

  // Session continuity
  handoff?: Handoff;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export type MemoryLevel = 'orchestrator' | 'loop' | 'skill';

export interface Decision {
  id: string;                    // ADR-style ID
  title: string;
  context: string;
  decision: string;
  consequences: string;
  timestamp: Date;
  supersedes?: string;           // ID of decision this supersedes
}

export interface Pattern {
  id: string;
  name: string;
  context: string;               // When to use
  solution: string;
  example?: string;
  uses: number;
  confidence: 'low' | 'medium' | 'high';
  createdAt: Date;
  lastUsed?: Date;
}

export interface CalibrationData {
  estimates: EstimateRecord[];
  adjustments: {
    global: CalibrationAdjustment;
    byMode?: Record<LoopMode, CalibrationAdjustment>;
    byPhase?: Record<Phase, CalibrationAdjustment>;
    bySkill?: Record<string, CalibrationAdjustment>;
  };
}

export interface CalibrationAdjustment {
  multiplier: number;
  samples: number;
}

export interface EstimateRecord {
  id: string;
  estimated: { hours: number; complexity: string };
  actual: { hours: number };
  ratio: number;
  factors: Record<string, boolean>;
  timestamp: Date;
}

export interface Handoff {
  id: string;
  sessionDate: Date;
  summary: string;
  completed: string[];
  inProgress: string[];
  blocked: string[];
  nextSteps: string[];
  openQuestions: string[];
}

// =============================================================================
// INBOX TYPES (Second Brain)
// =============================================================================

export interface InboxItem {
  id: string;
  source: InboxSource;
  url?: string;
  content: string;

  // Processing state
  status: 'pending' | 'processing' | 'extracted' | 'rejected';

  // Extraction results
  extractedSkills?: ExtractedSkill[];
  extractedPatterns?: Pattern[];
  classifiedExtractions?: ClassifiedExtraction[];

  createdAt: Date;
  processedAt?: Date;
}

export interface InboxSource {
  type: 'url' | 'file' | 'paste' | 'conversation';
  name: string;
}

export interface ExtractedSkill {
  name: string;
  description: string;
  content: string;
  phase?: Phase;
  confidence: number;            // 0-1
  needsReview: boolean;
}

// =============================================================================
// CLASSIFIED EXTRACTION TYPES
// =============================================================================

export type ExtractionType = 'standalone_skill' | 'skill_enhancement' | 'reference_doc';

export interface ClassifiedExtraction {
  type: ExtractionType;
  confidence: number;            // 0-1
  reasoning: string;

  // For standalone_skill
  skill?: ExtractedSkill;

  // For skill_enhancement
  targetSkill?: string;
  enhancement?: {
    section: string;
    content: string;
    description: string;
  };

  // For reference_doc
  parentSkill?: string;
  reference?: {
    name: string;
    content: string;
    description: string;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface SkillSummary {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: Phase;
  category: SkillCategory;
}

export interface LoopSummary {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  phaseCount: number;
  skillCount: number;
}

export interface ExecutionSummary {
  id: string;
  loopId: string;
  project: string;
  status: ExecutionStatus;
  currentPhase: Phase;
  progress: {
    phasesCompleted: number;
    phasesTotal: number;
    skillsCompleted: number;
    skillsTotal: number;
  };
  startedAt: Date;
  updatedAt: Date;
}

// =============================================================================
// MCP TOOL TYPES
// =============================================================================

export interface ListSkillsParams {
  phase?: Phase;
  category?: SkillCategory;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface ListSkillsResult {
  skills: SkillSummary[];
  total: number;
  hasMore: boolean;
}

export interface GetSkillParams {
  name: string;
  includeReferences?: boolean;
  version?: string;
}

export interface CreateSkillParams {
  name: string;
  description: string;
  phase?: Phase;
  category?: SkillCategory;
  content: string;
}

export interface UpdateSkillParams {
  name: string;
  content?: string;
  description?: string;
  versionBump: 'patch' | 'minor' | 'major';
  changeDescription: string;
}

export interface CaptureImprovementParams {
  feedback: string;
  source?: string;
  category?: ImprovementCategory;
  skill?: string;
  section?: string;
}

export interface CaptureImprovementResult {
  id: string;
  skill: string;
  message: string;
}

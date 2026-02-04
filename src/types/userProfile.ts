/**
 * User Profile Types
 *
 * User-level context that travels with the user across projects.
 * Stored in ~/.claude/orchestrator/
 *
 * Three-layer architecture:
 * 1. Orchestrator Core (immutable) - skills/, loops/, src/
 * 2. User Context (this layer) - ~/.claude/orchestrator/
 * 3. Project Context - {project}/.orchestra/
 */

// =============================================================================
// PROFILE STRUCTURE
// =============================================================================

/**
 * Root user profile
 * Stored at ~/.claude/orchestrator/profile.json
 */
export interface UserProfile {
  version: '1.0.0';
  userId?: string;  // Optional identifier

  // Preferences
  preferences: UserPreferences;

  // Learning data
  calibration: UserCalibration;

  // Cross-project patterns
  patterns: UserPatterns;

  // Active project tracking
  activeProjects: ActiveProject[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// PREFERENCES
// =============================================================================

export interface UserPreferences {
  // Default loop settings
  defaultLoop: string;  // e.g., 'engineering-loop'
  defaultGateApproval: 'human' | 'auto' | 'conditional';

  // Notification preferences
  notifications: {
    enabled: boolean;
    channels: ('slack' | 'voice' | 'system')[];
    quietHours?: {
      start: string;  // e.g., '22:00'
      end: string;    // e.g., '08:00'
      timezone: string;
    };
  };

  // Autonomy level
  autonomyLevel: 'supervised' | 'semi-autonomous' | 'autonomous';

  // Display preferences
  verbosity: 'minimal' | 'normal' | 'verbose';

  // Custom overrides per loop
  loopOverrides?: Record<string, LoopOverride>;
}

export interface LoopOverride {
  defaultGateApproval?: 'human' | 'auto' | 'conditional';
  skipPhases?: string[];
  autoSkipSkills?: string[];
}

// =============================================================================
// CALIBRATION
// =============================================================================

export interface UserCalibration {
  // Effort estimation multipliers by complexity
  effortMultipliers: {
    trivial: number;   // Default 1.0
    simple: number;    // Default 1.2
    moderate: number;  // Default 1.5
    complex: number;   // Default 2.0
    epic: number;      // Default 3.0
  };

  // Success rate tracking
  successRates: {
    overall: number;  // 0-1
    byLoop: Record<string, number>;
    bySkill: Record<string, number>;
  };

  // Time tracking
  averageDurations: {
    byLoop: Record<string, number>;   // Average ms per loop
    byPhase: Record<string, number>;  // Average ms per phase
    bySkill: Record<string, number>;  // Average ms per skill
  };

  // Confidence scores
  confidenceScores: {
    bySkill: Record<string, number>;  // 0-1
    byLoop: Record<string, number>;
  };
}

// =============================================================================
// PATTERNS
// =============================================================================

export interface UserPatterns {
  // Patterns learned across projects
  learned: LearnedPattern[];

  // Frequent decisions
  decisionPatterns: DecisionPattern[];

  // Common mistakes to avoid
  antiPatterns: AntiPattern[];
}

export interface LearnedPattern {
  id: string;
  name: string;
  description: string;
  context: string[];  // When to apply
  source: {
    project: string;
    loopId: string;
    executionId: string;
    learnedAt: Date;
  };
  applications: number;  // How many times applied
  lastAppliedAt?: Date;
}

export interface DecisionPattern {
  id: string;
  scenario: string;  // Description of the decision scenario
  decision: string;  // What was decided
  reasoning: string;
  frequency: number;
  lastOccurred: Date;
}

export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  avoidanceStrategy: string;
  occurrences: number;
  lastOccurred?: Date;
}

// =============================================================================
// PROJECT TRACKING
// =============================================================================

export interface ActiveProject {
  path: string;           // Absolute path to project
  name: string;           // Display name
  lastAccessed: Date;
  currentExecution?: {
    executionId: string;
    loopId: string;
    phase: string;
  };
  totalExecutions: number;
  successfulExecutions: number;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export function createDefaultUserProfile(): UserProfile {
  return {
    version: '1.0.0',
    preferences: {
      defaultLoop: 'engineering-loop',
      defaultGateApproval: 'human',
      notifications: {
        enabled: true,
        channels: ['slack'],
      },
      autonomyLevel: 'supervised',
      verbosity: 'normal',
    },
    calibration: {
      effortMultipliers: {
        trivial: 1.0,
        simple: 1.2,
        moderate: 1.5,
        complex: 2.0,
        epic: 3.0,
      },
      successRates: {
        overall: 0.8,
        byLoop: {},
        bySkill: {},
      },
      averageDurations: {
        byLoop: {},
        byPhase: {},
        bySkill: {},
      },
      confidenceScores: {
        bySkill: {},
        byLoop: {},
      },
    },
    patterns: {
      learned: [],
      decisionPatterns: [],
      antiPatterns: [],
    },
    activeProjects: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

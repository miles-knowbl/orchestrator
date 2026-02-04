/**
 * UserProfileService
 *
 * Manages user-level context that travels with the user across projects.
 * Stored in ~/.claude/orchestrator/
 *
 * Responsibilities:
 * - Load/save user profile
 * - Track active projects
 * - Persist cross-project patterns
 * - Manage user preferences
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type {
  UserProfile,
  UserPreferences,
  UserCalibration,
  LearnedPattern,
  ActiveProject,
} from '../types/userProfile.js';
import { createDefaultUserProfile } from '../types/userProfile.js';

export interface UserProfileServiceOptions {
  /** Override the default user directory (useful for testing) */
  userDir?: string;
}

const DEFAULT_USER_DIR = join(homedir(), '.claude', 'orchestrator');
const PROFILE_FILE = 'profile.json';

export class UserProfileService {
  private userDir: string;
  private profile: UserProfile | null = null;

  constructor(options: UserProfileServiceOptions = {}) {
    this.userDir = options.userDir ?? DEFAULT_USER_DIR;
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  async initialize(): Promise<void> {
    await mkdir(this.userDir, { recursive: true });
    await this.load();
    this.log('info', 'User profile service initialized');
  }

  // ==========================================================================
  // PROFILE MANAGEMENT
  // ==========================================================================

  async load(): Promise<UserProfile> {
    const profilePath = join(this.userDir, PROFILE_FILE);
    try {
      const content = await readFile(profilePath, 'utf-8');
      const data = JSON.parse(content);
      // Restore dates
      data.createdAt = new Date(data.createdAt);
      data.updatedAt = new Date(data.updatedAt);
      data.activeProjects = data.activeProjects.map((p: ActiveProject) => ({
        ...p,
        lastAccessed: new Date(p.lastAccessed),
      }));
      this.profile = data as UserProfile;
      return this.profile;
    } catch {
      // Create default profile
      const defaultProfile = createDefaultUserProfile();
      this.profile = defaultProfile;
      await this.save();
      return defaultProfile;
    }
  }

  async save(): Promise<void> {
    if (!this.profile) return;
    this.profile.updatedAt = new Date();
    const profilePath = join(this.userDir, PROFILE_FILE);
    await writeFile(profilePath, JSON.stringify(this.profile, null, 2));
  }

  getProfile(): UserProfile {
    if (!this.profile) {
      throw new Error('Profile not loaded. Call initialize() first.');
    }
    return this.profile;
  }

  // ==========================================================================
  // PREFERENCES
  // ==========================================================================

  getPreferences(): UserPreferences {
    return this.getProfile().preferences;
  }

  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const profile = this.getProfile();
    profile.preferences = { ...profile.preferences, ...updates };
    await this.save();
    return profile.preferences;
  }

  // ==========================================================================
  // CALIBRATION
  // ==========================================================================

  getCalibration(): UserCalibration {
    return this.getProfile().calibration;
  }

  async updateCalibration(updates: Partial<UserCalibration>): Promise<UserCalibration> {
    const profile = this.getProfile();
    profile.calibration = { ...profile.calibration, ...updates };
    await this.save();
    return profile.calibration;
  }

  /**
   * Record a skill execution outcome for calibration
   */
  async recordSkillOutcome(params: {
    skillId: string;
    loopId: string;
    durationMs: number;
    success: boolean;
  }): Promise<void> {
    const { skillId, loopId, durationMs, success } = params;
    const calibration = this.getCalibration();

    // Update success rates
    const currentSkillRate = calibration.successRates.bySkill[skillId] ?? 0.8;
    calibration.successRates.bySkill[skillId] =
      currentSkillRate * 0.9 + (success ? 0.1 : 0);  // Exponential moving average

    const currentLoopRate = calibration.successRates.byLoop[loopId] ?? 0.8;
    calibration.successRates.byLoop[loopId] =
      currentLoopRate * 0.9 + (success ? 0.1 : 0);

    // Update average durations
    const currentSkillDuration = calibration.averageDurations.bySkill[skillId] ?? durationMs;
    calibration.averageDurations.bySkill[skillId] =
      currentSkillDuration * 0.8 + durationMs * 0.2;

    await this.save();
  }

  // ==========================================================================
  // PATTERNS
  // ==========================================================================

  /**
   * Add a learned pattern
   */
  async addLearnedPattern(pattern: Omit<LearnedPattern, 'id' | 'applications'>): Promise<LearnedPattern> {
    const profile = this.getProfile();
    const newPattern: LearnedPattern = {
      ...pattern,
      id: `pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      applications: 0,
    };
    profile.patterns.learned.push(newPattern);
    await this.save();
    return newPattern;
  }

  /**
   * Record pattern application
   */
  async recordPatternApplication(patternId: string): Promise<void> {
    const profile = this.getProfile();
    const pattern = profile.patterns.learned.find(p => p.id === patternId);
    if (pattern) {
      pattern.applications++;
      pattern.lastAppliedAt = new Date();
      await this.save();
    }
  }

  /**
   * Get relevant patterns for a context
   */
  getRelevantPatterns(context: string[]): LearnedPattern[] {
    const profile = this.getProfile();
    return profile.patterns.learned.filter(pattern =>
      pattern.context.some(c => context.includes(c))
    );
  }

  // ==========================================================================
  // PROJECT TRACKING
  // ==========================================================================

  /**
   * Record project access
   */
  async recordProjectAccess(params: {
    path: string;
    name: string;
    executionId?: string;
    loopId?: string;
    phase?: string;
  }): Promise<void> {
    const profile = this.getProfile();
    const { path, name, executionId, loopId, phase } = params;

    const existing = profile.activeProjects.find(p => p.path === path);
    if (existing) {
      existing.lastAccessed = new Date();
      existing.name = name;
      if (executionId && loopId && phase) {
        existing.currentExecution = { executionId, loopId, phase };
      }
    } else {
      profile.activeProjects.push({
        path,
        name,
        lastAccessed: new Date(),
        currentExecution: executionId && loopId && phase
          ? { executionId, loopId, phase }
          : undefined,
        totalExecutions: 0,
        successfulExecutions: 0,
      });
    }

    // Keep only last 20 projects
    profile.activeProjects.sort((a, b) =>
      b.lastAccessed.getTime() - a.lastAccessed.getTime()
    );
    profile.activeProjects = profile.activeProjects.slice(0, 20);

    await this.save();
  }

  /**
   * Record execution completion for a project
   */
  async recordProjectExecution(path: string, success: boolean): Promise<void> {
    const profile = this.getProfile();
    const project = profile.activeProjects.find(p => p.path === path);
    if (project) {
      project.totalExecutions++;
      if (success) {
        project.successfulExecutions++;
      }
      project.currentExecution = undefined;  // Clear active execution
      await this.save();
    }
  }

  /**
   * Get recent projects
   */
  getRecentProjects(limit = 10): ActiveProject[] {
    const profile = this.getProfile();
    return profile.activeProjects
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, limit);
  }

  // ==========================================================================
  // UTILITIES
  // ==========================================================================

  /**
   * Export profile for backup
   */
  async exportProfile(): Promise<string> {
    return JSON.stringify(this.getProfile(), null, 2);
  }

  /**
   * Import profile from backup
   */
  async importProfile(data: string): Promise<void> {
    const parsed = JSON.parse(data);
    // Validate version
    if (parsed.version !== '1.0.0') {
      throw new Error(`Unsupported profile version: ${parsed.version}`);
    }
    // Restore dates
    parsed.createdAt = new Date(parsed.createdAt);
    parsed.updatedAt = new Date();
    this.profile = parsed;
    await this.save();
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'UserProfileService',
      message,
    }));
  }
}

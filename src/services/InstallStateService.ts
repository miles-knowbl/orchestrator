/**
 * Install State Service
 *
 * Tracks installation state, version info, and daily interaction status.
 * Used to show appropriate welcome messages on first MCP call of day.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface InstallState {
  // Installation info
  installedAt: string;
  installedVersion: string;
  installType: 'git' | 'tarball' | 'unknown';
  installPath: string;

  // MCP registration
  mcpRegisteredAt?: string;

  // Interaction tracking
  lastInteractionDate?: string; // YYYY-MM-DD format
  lastInteractionAt?: string;   // Full ISO timestamp
  totalInteractions: number;

  // Update tracking
  lastUpdateCheck?: string;
  lastKnownLatestVersion?: string;

  // Auto-update config
  autoUpdate?: {
    enabled: boolean;
    channel: 'stable' | 'beta';
    checkInterval: 'daily' | 'weekly' | 'manual';
  };
}

const DEFAULT_STATE: InstallState = {
  installedAt: new Date().toISOString(),
  installedVersion: '0.0.0',
  installType: 'unknown',
  installPath: '',
  totalInteractions: 0,
};

export interface InstallStateServiceOptions {
  dataPath: string;
  currentVersion: string;
  installPath: string;
}

export class InstallStateService {
  private dataPath: string;
  private statePath: string;
  private state: InstallState;
  private currentVersion: string;
  private installPath: string;
  private initialized = false;

  constructor(options: InstallStateServiceOptions) {
    this.dataPath = options.dataPath;
    this.statePath = path.join(options.dataPath, 'install-state.json');
    this.currentVersion = options.currentVersion;
    this.installPath = options.installPath;
    this.state = { ...DEFAULT_STATE };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    await fs.mkdir(this.dataPath, { recursive: true });

    try {
      const data = await fs.readFile(this.statePath, 'utf-8');
      this.state = { ...DEFAULT_STATE, ...JSON.parse(data) };
    } catch {
      // Fresh install - create initial state
      this.state = {
        ...DEFAULT_STATE,
        installedAt: new Date().toISOString(),
        installedVersion: this.currentVersion,
        installPath: this.installPath,
        installType: await this.detectInstallType(),
      };
      await this.save();
    }

    // Update version if changed (after an update)
    if (this.state.installedVersion !== this.currentVersion) {
      this.state.installedVersion = this.currentVersion;
      await this.save();
    }

    this.initialized = true;
  }

  private async detectInstallType(): Promise<'git' | 'tarball' | 'unknown'> {
    try {
      await fs.access(path.join(this.installPath, '.git'));
      return 'git';
    } catch {
      // Check for tarball indicator (no .git but has package.json)
      try {
        await fs.access(path.join(this.installPath, 'package.json'));
        return 'tarball';
      } catch {
        return 'unknown';
      }
    }
  }

  private async save(): Promise<void> {
    await fs.writeFile(this.statePath, JSON.stringify(this.state, null, 2));
  }

  /**
   * Check if this is the first interaction of the day
   */
  isFirstInteractionOfDay(): boolean {
    const today = new Date().toISOString().split('T')[0];
    return this.state.lastInteractionDate !== today;
  }

  /**
   * Check if this is a fresh install (no prior interactions)
   */
  isFreshInstall(): boolean {
    return this.state.totalInteractions === 0;
  }

  /**
   * Record an interaction (call this on MCP tool calls)
   */
  async recordInteraction(): Promise<{ isFirstOfDay: boolean; isFreshInstall: boolean }> {
    const wasFirstOfDay = this.isFirstInteractionOfDay();
    const wasFreshInstall = this.isFreshInstall();

    const now = new Date();
    this.state.lastInteractionDate = now.toISOString().split('T')[0];
    this.state.lastInteractionAt = now.toISOString();
    this.state.totalInteractions++;

    await this.save();

    return {
      isFirstOfDay: wasFirstOfDay,
      isFreshInstall: wasFreshInstall,
    };
  }

  /**
   * Record MCP registration
   */
  async recordMcpRegistration(): Promise<void> {
    this.state.mcpRegisteredAt = new Date().toISOString();
    await this.save();
  }

  /**
   * Record update check result
   */
  async recordUpdateCheck(latestVersion: string): Promise<void> {
    this.state.lastUpdateCheck = new Date().toISOString();
    this.state.lastKnownLatestVersion = latestVersion;
    await this.save();
  }

  /**
   * Check if an update is available
   */
  isUpdateAvailable(): boolean {
    if (!this.state.lastKnownLatestVersion) return false;
    return this.compareVersions(this.state.lastKnownLatestVersion, this.currentVersion) > 0;
  }

  /**
   * Simple semver comparison (returns >0 if a > b, <0 if a < b, 0 if equal)
   */
  private compareVersions(a: string, b: string): number {
    const partsA = a.replace(/^v/, '').split('.').map(Number);
    const partsB = b.replace(/^v/, '').split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      const diff = (partsA[i] || 0) - (partsB[i] || 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  /**
   * Get current state
   */
  getState(): InstallState {
    return { ...this.state };
  }

  /**
   * Get greeting based on time of day
   */
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
  }

  /**
   * Get version status
   */
  getVersionStatus(): { status: 'current' | 'update_available' | 'unknown'; latestVersion?: string } {
    if (!this.state.lastKnownLatestVersion) {
      return { status: 'unknown' };
    }
    if (this.isUpdateAvailable()) {
      return { status: 'update_available', latestVersion: this.state.lastKnownLatestVersion };
    }
    return { status: 'current' };
  }

  /**
   * Configure auto-update settings
   */
  async configureAutoUpdate(config: InstallState['autoUpdate']): Promise<void> {
    this.state.autoUpdate = config;
    await this.save();
  }
}

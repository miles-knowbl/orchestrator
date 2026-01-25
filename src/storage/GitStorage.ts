/**
 * Git Storage - Handle skill versioning via Git tags
 */

import { simpleGit, SimpleGit, TagResult } from 'simple-git';
import { join } from 'path';

export interface SkillVersion {
  version: string;
  commit: string;
  tag: string;
  date: Date;
  message?: string;
}

export interface VersionBump {
  from: string;
  to: string;
  type: 'patch' | 'minor' | 'major';
}

export class GitStorage {
  private git: SimpleGit;
  private initialized = false;

  constructor(private repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  /**
   * Initialize and verify git repo
   */
  async initialize(): Promise<void> {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        throw new Error(`Not a git repository: ${this.repoPath}`);
      }
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize git storage: ${error}`);
    }
  }

  /**
   * Get all versions for a skill
   */
  async getSkillVersions(skillName: string): Promise<SkillVersion[]> {
    this.ensureInitialized();

    const tagResult: TagResult = await this.git.tags([`skill/${skillName}@*`]);
    const versions: SkillVersion[] = [];

    for (const tag of tagResult.all) {
      const versionMatch = tag.match(/skill\/(.+)@(\d+\.\d+\.\d+)/);
      if (versionMatch && versionMatch[1] === skillName) {
        try {
          const show = await this.git.show([tag, '--format=%H%n%aI%n%s', '-s']);
          const [commit, dateStr, message] = show.trim().split('\n');

          versions.push({
            version: versionMatch[2],
            commit,
            tag,
            date: new Date(dateStr),
            message,
          });
        } catch {
          // Tag exists but can't get details
          versions.push({
            version: versionMatch[2],
            commit: '',
            tag,
            date: new Date(),
          });
        }
      }
    }

    // Sort by version descending
    versions.sort((a, b) => this.compareVersions(b.version, a.version));
    return versions;
  }

  /**
   * Get the latest version for a skill
   */
  async getLatestVersion(skillName: string): Promise<string | null> {
    const versions = await this.getSkillVersions(skillName);
    return versions.length > 0 ? versions[0].version : null;
  }

  /**
   * Create a new version tag for a skill
   */
  async createVersion(
    skillName: string,
    version: string,
    message: string
  ): Promise<SkillVersion> {
    this.ensureInitialized();

    const tag = `skill/${skillName}@${version}`;

    // Verify tag doesn't exist
    const existing = await this.git.tags([tag]);
    if (existing.all.includes(tag)) {
      throw new Error(`Version ${version} already exists for skill ${skillName}`);
    }

    // Create annotated tag
    await this.git.addAnnotatedTag(tag, message);

    // Get the commit info
    const show = await this.git.show([tag, '--format=%H%n%aI', '-s']);
    const [commit, dateStr] = show.trim().split('\n');

    return {
      version,
      commit,
      tag,
      date: new Date(dateStr),
      message,
    };
  }

  /**
   * Calculate the next version based on bump type
   */
  calculateNextVersion(
    current: string | null,
    bump: 'patch' | 'minor' | 'major'
  ): VersionBump {
    const from = current || '0.0.0';
    const [major, minor, patch] = from.split('.').map(Number);

    let to: string;
    switch (bump) {
      case 'major':
        to = `${major + 1}.0.0`;
        break;
      case 'minor':
        to = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
        to = `${major}.${minor}.${patch + 1}`;
        break;
    }

    return { from, to, type: bump };
  }

  /**
   * Stage skill files for commit
   */
  async stageSkillFiles(skillName: string): Promise<void> {
    this.ensureInitialized();
    await this.git.add([`skills/${skillName}/*`]);
  }

  /**
   * Commit skill changes
   */
  async commitSkillChanges(
    skillName: string,
    version: string,
    message: string
  ): Promise<string> {
    this.ensureInitialized();

    const fullMessage = `skill(${skillName}): ${message}\n\nVersion: ${version}`;
    const result = await this.git.commit(fullMessage);
    return result.commit;
  }

  /**
   * Get file content at a specific version
   */
  async getFileAtVersion(
    skillName: string,
    version: string,
    filename: string
  ): Promise<string | null> {
    this.ensureInitialized();

    const tag = `skill/${skillName}@${version}`;
    const path = `skills/${skillName}/${filename}`;

    try {
      const content = await this.git.show([`${tag}:${path}`]);
      return content;
    } catch {
      return null;
    }
  }

  /**
   * Get diff between two versions
   */
  async getVersionDiff(
    skillName: string,
    fromVersion: string,
    toVersion: string
  ): Promise<string> {
    this.ensureInitialized();

    const fromTag = `skill/${skillName}@${fromVersion}`;
    const toTag = `skill/${skillName}@${toVersion}`;

    try {
      const diff = await this.git.diff([fromTag, toTag, '--', `skills/${skillName}/`]);
      return diff;
    } catch (error) {
      throw new Error(`Failed to get diff: ${error}`);
    }
  }

  /**
   * Check if there are uncommitted changes for a skill
   */
  async hasUncommittedChanges(skillName: string): Promise<boolean> {
    this.ensureInitialized();

    const status = await this.git.status([`skills/${skillName}/`]);
    return status.files.length > 0;
  }

  /**
   * Compare two version strings
   * Returns: negative if a < b, positive if a > b, 0 if equal
   */
  private compareVersions(a: string, b: string): number {
    const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
    const [bMajor, bMinor, bPatch] = b.split('.').map(Number);

    if (aMajor !== bMajor) return aMajor - bMajor;
    if (aMinor !== bMinor) return aMinor - bMinor;
    return aPatch - bPatch;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('GitStorage not initialized. Call initialize() first.');
    }
  }
}

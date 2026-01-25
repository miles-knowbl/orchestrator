/**
 * Configuration loader for Orchestrator
 */

import { join } from 'path';

export interface OrchestratorConfig {
  port: number;
  host: string;
  skillsPath: string;
  repoPath: string;
  apiKey?: string;
  watchEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Load configuration from environment and CLI args
 */
export function loadConfig(args: string[] = process.argv.slice(2)): OrchestratorConfig {
  // Default paths - look for skills in current directory
  const cwd = process.cwd();

  // Parse CLI positional arg for custom skills path
  let skillsPath = join(cwd, 'skills');
  if (args.length > 0 && !args[0].startsWith('-')) {
    skillsPath = args[0];
  }

  // Environment overrides
  skillsPath = process.env.SKILLS_PATH || skillsPath;
  const repoPath = process.env.REPO_PATH || cwd;

  return {
    port: parseInt(process.env.PORT || '3002', 10),
    host: process.env.HOST || '0.0.0.0',
    skillsPath,
    repoPath,
    apiKey: process.env.API_KEY,
    watchEnabled: process.env.WATCH_ENABLED !== 'false',
    logLevel: (process.env.LOG_LEVEL || 'info') as OrchestratorConfig['logLevel'],
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: OrchestratorConfig): void {
  if (config.port < 1 || config.port > 65535) {
    throw new Error(`Invalid port: ${config.port}`);
  }
}

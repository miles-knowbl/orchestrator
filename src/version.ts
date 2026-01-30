/**
 * Version utility - single source of truth
 *
 * Reads version from package.json at runtime, avoiding stale fallbacks.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

let cachedVersion: string | undefined;

/**
 * Get the current version from package.json
 * Caches the result for performance
 */
export function getVersion(): string {
  if (cachedVersion !== undefined) {
    return cachedVersion;
  }

  try {
    // Try npm_package_version first (works when run via npm scripts)
    if (process.env.npm_package_version) {
      cachedVersion = process.env.npm_package_version;
      return cachedVersion;
    }

    // Otherwise read from package.json directly
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Navigate from src/ or dist/ to project root
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));

    const version = packageJson.version || '0.0.0';
    cachedVersion = version;
    return version;
  } catch (error) {
    // Fallback if all else fails
    console.warn('Could not read version from package.json:', error);
    return '0.0.0';
  }
}

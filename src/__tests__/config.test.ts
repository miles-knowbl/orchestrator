import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig, validateConfig } from '../config.js';

describe('loadConfig', () => {
  const envBackup: Record<string, string | undefined> = {};

  beforeEach(() => {
    // Save env vars that loadConfig reads
    for (const key of ['PORT', 'HOST', 'API_KEY', 'ALLOWED_ORIGINS', 'SKILLS_PATH', 'REPO_PATH', 'WATCH_ENABLED', 'LOG_LEVEL']) {
      envBackup[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    // Restore env vars
    for (const [key, value] of Object.entries(envBackup)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('returns correct defaults', () => {
    const config = loadConfig([]);
    expect(config.port).toBe(3002);
    expect(config.host).toBe('0.0.0.0');
    expect(config.apiKey).toBeUndefined();
    expect(config.allowedOrigins).toEqual(['http://localhost:3003']);
    expect(config.watchEnabled).toBe(true);
    expect(config.logLevel).toBe('info');
  });

  it('overrides port from env', () => {
    process.env.PORT = '4000';
    const config = loadConfig([]);
    expect(config.port).toBe(4000);
  });

  it('overrides host from env', () => {
    process.env.HOST = '127.0.0.1';
    const config = loadConfig([]);
    expect(config.host).toBe('127.0.0.1');
  });

  it('reads API_KEY from env', () => {
    process.env.API_KEY = 'my-secret';
    const config = loadConfig([]);
    expect(config.apiKey).toBe('my-secret');
  });

  it('parses ALLOWED_ORIGINS as comma-separated list', () => {
    process.env.ALLOWED_ORIGINS = 'http://a.com, http://b.com, http://c.com';
    const config = loadConfig([]);
    expect(config.allowedOrigins).toEqual([
      'http://a.com',
      'http://b.com',
      'http://c.com',
    ]);
  });

  it('supports wildcard ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = '*';
    const config = loadConfig([]);
    expect(config.allowedOrigins).toEqual(['*']);
  });

  it('disables watch when WATCH_ENABLED=false', () => {
    process.env.WATCH_ENABLED = 'false';
    const config = loadConfig([]);
    expect(config.watchEnabled).toBe(false);
  });
});

describe('validateConfig', () => {
  it('accepts valid port', () => {
    const config = loadConfig([]);
    expect(() => validateConfig(config)).not.toThrow();
  });

  it('rejects port 0', () => {
    const config = loadConfig([]);
    config.port = 0;
    expect(() => validateConfig(config)).toThrow('Invalid port');
  });

  it('rejects port above 65535', () => {
    const config = loadConfig([]);
    config.port = 99999;
    expect(() => validateConfig(config)).toThrow('Invalid port');
  });
});

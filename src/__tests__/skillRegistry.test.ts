import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SkillRegistry } from '../services/SkillRegistry.js';

describe('SkillRegistry', () => {
  let tmpDir: string;
  let skillsPath: string;

  beforeAll(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'orch-test-'));
    skillsPath = join(tmpDir, 'skills');
    mkdirSync(skillsPath);

    // Create a test skill
    const testSkillDir = join(skillsPath, 'test-skill');
    mkdirSync(testSkillDir);
    writeFileSync(
      join(testSkillDir, 'SKILL.md'),
      [
        '---',
        'name: Test Skill',
        'version: 1.0.0',
        'description: A test skill for unit tests',
        'phase: IMPLEMENT',
        'category: core',
        '---',
        '',
        '# Test Skill',
        '',
        'This is a test skill.',
      ].join('\n')
    );

    // Create a second skill
    const anotherDir = join(skillsPath, 'another-skill');
    mkdirSync(anotherDir);
    writeFileSync(
      join(anotherDir, 'SKILL.md'),
      [
        '---',
        'name: Another Skill',
        'version: 0.1.0',
        'description: Another test skill',
        'phase: TEST',
        'category: quality',
        '---',
        '',
        '# Another Skill',
        '',
        'Another test skill body.',
      ].join('\n')
    );
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads skills from directory', async () => {
    const registry = new SkillRegistry({
      skillsPath,
      repoPath: tmpDir,
      watchEnabled: false,
    });

    await registry.initialize();

    expect(registry.skillCount).toBe(2);
  });

  it('lists skills with correct metadata', async () => {
    const registry = new SkillRegistry({
      skillsPath,
      repoPath: tmpDir,
      watchEnabled: false,
    });

    await registry.initialize();

    const result = registry.listSkills({});
    expect(result.total).toBe(2);
    expect(result.skills.length).toBe(2);

    const ids = result.skills.map((s: any) => s.id || s.name);
    expect(ids).toContain('test-skill');
    expect(ids).toContain('another-skill');
  });

  it('filters by phase', async () => {
    const registry = new SkillRegistry({
      skillsPath,
      repoPath: tmpDir,
      watchEnabled: false,
    });

    await registry.initialize();

    const result = registry.listSkills({ phase: 'IMPLEMENT' as any });
    expect(result.skills.length).toBe(1);
    expect(result.skills[0].id || result.skills[0].name).toBe('test-skill');
  });

  it('handles empty skills directory', async () => {
    const emptyDir = join(tmpDir, 'empty-skills');
    mkdirSync(emptyDir);

    const registry = new SkillRegistry({
      skillsPath: emptyDir,
      repoPath: tmpDir,
      watchEnabled: false,
    });

    await registry.initialize();
    expect(registry.skillCount).toBe(0);
  });

  it('handles missing skills directory gracefully', async () => {
    const registry = new SkillRegistry({
      skillsPath: join(tmpDir, 'nonexistent'),
      repoPath: tmpDir,
      watchEnabled: false,
    });

    // Should not throw
    await registry.initialize();
    expect(registry.skillCount).toBe(0);
  });
});

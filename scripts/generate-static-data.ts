#!/usr/bin/env npx ts-node

/**
 * Generate static JSON data files for the dashboard.
 * These serve as fallbacks when the orchestrator server isn't running.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const LOOPS_DIR = path.join(__dirname, '..', 'loops');
const OUTPUT_DIR = path.join(__dirname, '..', 'apps', 'dashboard', 'public', 'data');

interface SkillMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  phase?: string;
  category: string;
}

interface LoopMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  phases: { id: string; name: string; skills: string[] }[];
}

function parseSkillFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter: Record<string, any> = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

function loadSkills(): SkillMeta[] {
  const skills: SkillMeta[] = [];

  const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    const skillPath = path.join(SKILLS_DIR, dir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;

    const content = fs.readFileSync(skillPath, 'utf-8');
    const meta = parseSkillFrontmatter(content);

    skills.push({
      id: dir,
      name: meta.name || dir,
      version: meta.version || '1.0.0',
      description: meta.description || '',
      phase: meta.phase,
      category: meta.category || 'general'
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function loadLoops(): LoopMeta[] {
  const loops: LoopMeta[] = [];

  const dirs = fs.readdirSync(LOOPS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const dir of dirs) {
    const loopPath = path.join(LOOPS_DIR, dir, 'loop.json');
    if (!fs.existsSync(loopPath)) continue;

    try {
      const content = fs.readFileSync(loopPath, 'utf-8');
      const data = JSON.parse(content);

      loops.push({
        id: data.id || dir,
        name: data.name || dir,
        description: data.description || '',
        version: data.version || '1.0.0',
        category: data.category || 'general',
        phases: data.phases || []
      });
    } catch (err) {
      console.error(`Failed to parse ${loopPath}:`, err);
    }
  }

  return loops.sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate skills.json
  const skills = loadSkills();
  const skillsOutput = { skills, generatedAt: new Date().toISOString() };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'skills.json'),
    JSON.stringify(skillsOutput, null, 2)
  );
  console.log(`Generated skills.json with ${skills.length} skills`);

  // Generate loops.json
  const loops = loadLoops();
  const loopsOutput = { loops, generatedAt: new Date().toISOString() };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'loops.json'),
    JSON.stringify(loopsOutput, null, 2)
  );
  console.log(`Generated loops.json with ${loops.length} loops`);

  // Summary by category
  const skillsByCategory = skills.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const loopsByCategory = loops.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nSkills by category:');
  for (const [cat, count] of Object.entries(skillsByCategory)) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nLoops by category:');
  for (const [cat, count] of Object.entries(loopsByCategory)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main();

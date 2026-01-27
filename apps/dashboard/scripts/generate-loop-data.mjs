#!/usr/bin/env node
/**
 * Prebuild script: Generate static data for serverless deployment.
 *
 * Loops:
 *   Reads ../../loops/{id}/loop.json (+ optional LOOP.md) and writes:
 *     public/data/loops.json           (list summary)
 *     public/data/loops/{id}.json      (detail per loop)
 *
 * Skills:
 *   Reads ../../skills/{id}/SKILL.md (+ optional references/) and writes:
 *     public/data/skills.json          (list summary)
 *     public/data/skills/{id}.json     (detail per skill)
 */
import { readdir, readFile, stat, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOOPS_DIR = join(__dirname, '..', '..', '..', 'loops');
const SKILLS_DIR = join(__dirname, '..', '..', '..', 'skills');
const OUT_DIR = join(__dirname, '..', 'public', 'data', 'loops');
const OUT_SKILLS_DIR = join(__dirname, '..', 'public', 'data', 'skills');
const OUT_LIST = join(__dirname, '..', 'public', 'data', 'loops.json');
const OUT_SKILLS_LIST = join(__dirname, '..', 'public', 'data', 'skills.json');

/**
 * Parse YAML frontmatter from a SKILL.md file.
 * Returns { meta: {name, description, phase, category, version, ...}, content: string }
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const yaml = match[1];
  const content = match[2].trim();
  const meta = {};

  for (const line of yaml.split('\n')) {
    const kv = line.match(/^(\w[\w_]*)\s*:\s*(.+)$/);
    if (!kv) continue;
    const [, key, val] = kv;
    const trimmed = val.trim();
    // Array value: [a, b, c] or ["a", "b"]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      meta[key] = trimmed.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    // Quoted string
    else if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      meta[key] = trimmed.slice(1, -1);
    }
    // Bare value
    else {
      meta[key] = trimmed;
    }
  }

  return { meta, content };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(LOOPS_DIR, { withFileTypes: true });
  const summaries = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const loopDir = join(LOOPS_DIR, entry.name);
    const jsonPath = join(loopDir, 'loop.json');

    try {
      const s = await stat(jsonPath);
      if (!s.isFile()) continue;
    } catch {
      continue;
    }

    const raw = JSON.parse(await readFile(jsonPath, 'utf-8'));

    // Load optional LOOP.md
    let content;
    try {
      content = await readFile(join(loopDir, 'LOOP.md'), 'utf-8');
    } catch {
      // No LOOP.md
    }

    // Transform phases: string[] -> {skillId, required, order}[]
    const phases = (raw.phases || []).map((p, idx) => ({
      name: p.name,
      order: idx,
      skills: (p.skills || []).map((skillId, sIdx) => ({
        skillId,
        required: true,
        order: sIdx,
      })),
      required: p.required !== false,
    }));

    // Transform gates
    const gates = (raw.gates || []).map((g) => ({
      id: g.id,
      name: g.name,
      afterPhase: g.afterPhase,
      required: g.required !== false,
      approvalType: g.approvalType || 'human',
      deliverables: g.deliverables || [],
    }));

    const skillCount = phases.reduce((sum, p) => sum + p.skills.length, 0);

    const detail = {
      id: raw.id,
      name: raw.name,
      version: raw.version || '1.0.0',
      description: raw.description || '',
      content,
      phases,
      gates,
      defaultMode: raw.defaults?.mode || 'greenfield',
      defaultAutonomy: raw.defaults?.autonomy || 'supervised',
      skillCount,
      phaseCount: phases.length,
      author: raw.metadata?.author,
    };

    await writeFile(join(OUT_DIR, `${raw.id}.json`), JSON.stringify(detail, null, 2));

    summaries.push({
      id: raw.id,
      name: raw.name,
      version: raw.version || '1.0.0',
      description: (raw.description || '').slice(0, 200),
      phaseCount: phases.length,
      skillCount,
    });
  }

  summaries.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(OUT_LIST, JSON.stringify({ loops: summaries }, null, 2));

  console.log(`Generated static data for ${summaries.length} loops`);

  // --- Skills ---
  await mkdir(OUT_SKILLS_DIR, { recursive: true });

  const skillEntries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skillSummaries = [];

  for (const entry of skillEntries) {
    if (!entry.isDirectory()) continue;

    const skillDir = join(SKILLS_DIR, entry.name);
    const mdPath = join(skillDir, 'SKILL.md');

    try {
      const s = await stat(mdPath);
      if (!s.isFile()) continue;
    } catch {
      continue;
    }

    const raw = await readFile(mdPath, 'utf-8');
    const { meta, content } = parseFrontmatter(raw);

    if (!meta.name) continue;

    // Load references
    const references = [];
    const refsDir = join(skillDir, 'references');
    try {
      const refEntries = await readdir(refsDir);
      for (const refFile of refEntries) {
        if (!refFile.endsWith('.md')) continue;
        const refContent = await readFile(join(refsDir, refFile), 'utf-8');
        references.push({ name: refFile, path: `references/${refFile}`, content: refContent });
      }
    } catch {
      // No references directory
    }

    const detail = {
      id: meta.name,
      name: meta.name,
      version: meta.version || '1.0.0',
      description: meta.description || '',
      phase: meta.phase || undefined,
      category: meta.category || 'core',
      content,
      references,
      tags: meta.tags || [],
      dependsOn: meta.depends_on || [],
      author: meta.author || undefined,
    };

    await writeFile(join(OUT_SKILLS_DIR, `${meta.name}.json`), JSON.stringify(detail, null, 2));

    skillSummaries.push({
      id: meta.name,
      name: meta.name,
      version: meta.version || '1.0.0',
      description: (meta.description || '').slice(0, 200),
      phase: meta.phase || undefined,
      category: meta.category || 'core',
    });
  }

  skillSummaries.sort((a, b) => a.name.localeCompare(b.name));
  await writeFile(OUT_SKILLS_LIST, JSON.stringify({ skills: skillSummaries }, null, 2));

  console.log(`Generated static data for ${skillSummaries.length} skills`);
}

main().catch((err) => {
  console.error('Failed to generate static data:', err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Prebuild script: Generate static loop data for serverless deployment.
 * Reads ../../loops/{id}/loop.json (+ optional LOOP.md) and writes:
 *   public/data/loops.json           (list summary)
 *   public/data/loops/{id}.json      (detail per loop)
 */
import { readdir, readFile, stat, mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOOPS_DIR = join(__dirname, '..', '..', '..', 'loops');
const OUT_DIR = join(__dirname, '..', 'public', 'data', 'loops');
const OUT_LIST = join(__dirname, '..', 'public', 'data', 'loops.json');

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
}

main().catch((err) => {
  console.error('Failed to generate loop data:', err);
  process.exit(1);
});

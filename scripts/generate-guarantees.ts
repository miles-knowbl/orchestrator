#!/usr/bin/env npx ts-node
/**
 * Guarantee Generator
 *
 * Parses SKILL.md files and generates guarantee definitions based on:
 * - Deliverables mentioned (files produced)
 * - Required sections (for content validation)
 * - Phase assignment (for categorization)
 * - Verification patterns (for quality thresholds)
 *
 * Usage: npx ts-node scripts/generate-guarantees.ts > config/guarantees-generated.json
 */

import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

interface SkillInfo {
  id: string;
  name: string;
  description: string;
  phase?: string;
  category: string;
  deliverables: string[];
  sections: string[];
  isVerifier: boolean;
  isInfra: boolean;
  isMeta: boolean;
}

interface Guarantee {
  id: string;
  name: string;
  type: 'deliverable' | 'content' | 'quality' | 'step_proof';
  required: boolean;
  validation: Record<string, unknown>;
}

interface SkillGuarantees {
  skillId: string;
  guarantees: Guarantee[];
}

// Common deliverable patterns to detect
const DELIVERABLE_PATTERNS = [
  // Explicit file references
  /(?:creates?|produces?|generates?|outputs?|writes?)\s+(?:a\s+)?[`"]?([A-Z][A-Z0-9_-]*\.(?:md|json|yaml|yml|ts|js|sh))[`"]?/gi,
  // Markdown file patterns
  /([A-Z][A-Z0-9_-]+\.md)/g,
  // Common deliverable names
  /\b(REQUIREMENTS|FEATURESPEC|ARCHITECTURE|VERIFICATION|VALIDATION|SECURITY-AUDIT|CODE-REVIEW|CHANGELOG|README|RELEASE-NOTES|POSTMORTEM|MIGRATION-PLAN|ROLLBACK|BUG-REPRODUCTION|ROOT-CAUSE|CULTIVATED-CONTEXT|PATTERNS|STACK-MAP|COMPATIBILITY|PROPOSAL)\.md\b/gi,
];

// Verifier skill indicators
const VERIFIER_INDICATORS = [
  /pass(?:es)?|fail(?:s)?/i,
  /verification/i,
  /validation/i,
  /audit/i,
  /check(?:s|ing)?/i,
  /review/i,
  /test(?:s|ing)?/i,
  /smoke/i,
  /integration.test/i,
];

// Infrastructure skill indicators
const INFRA_INDICATORS = [
  /docker/i,
  /database/i,
  /deploy/i,
  /infrastructure/i,
  /environment/i,
  /setup/i,
  /git.workflow/i,
  /ci.?cd/i,
];

// Meta skill indicators
const META_INDICATORS = [
  /orchestrat/i,
  /loop.controller/i,
  /memory.manager/i,
  /coordination/i,
  /manifest/i,
  /retrospec/i,
  /calibration/i,
  /portability/i,
];

async function parseSkillMd(skillPath: string): Promise<SkillInfo | null> {
  try {
    const content = await readFile(join(skillPath, 'SKILL.md'), 'utf-8');
    const id = skillPath.split('/').pop()!;

    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';

    // Extract fields from frontmatter
    const nameMatch = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/);
    const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
    const phaseMatch = frontmatter.match(/phase:\s*["']?([^"'\n]+)["']?/);
    const categoryMatch = frontmatter.match(/category:\s*["']?([^"'\n]+)["']?/);

    // Extract deliverables
    const deliverables = new Set<string>();
    for (const pattern of DELIVERABLE_PATTERNS) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          deliverables.add(match[1].toUpperCase().replace(/\.MD$/i, '.md'));
        }
      }
    }

    // Extract section headers (## or ### headers)
    const sections: string[] = [];
    const sectionMatches = content.matchAll(/^#{2,3}\s+(.+)$/gm);
    for (const match of sectionMatches) {
      sections.push(match[1].trim());
    }

    // Detect skill type
    const isVerifier = VERIFIER_INDICATORS.some(p => p.test(content));
    const isInfra = INFRA_INDICATORS.some(p => p.test(id) || p.test(content.slice(0, 500)));
    const isMeta = META_INDICATORS.some(p => p.test(id) || p.test(content.slice(0, 500)));

    return {
      id,
      name: nameMatch?.[1] || id,
      description: descMatch?.[1] || '',
      phase: phaseMatch?.[1]?.toUpperCase(),
      category: categoryMatch?.[1] || 'core',
      deliverables: [...deliverables],
      sections: sections.slice(0, 20), // Limit to first 20 sections
      isVerifier,
      isInfra,
      isMeta,
    };
  } catch {
    return null;
  }
}

function generateGuarantees(skill: SkillInfo): SkillGuarantees {
  const guarantees: Guarantee[] = [];
  let guaranteeIndex = 1;

  const prefix = `GUA-${skill.id.toUpperCase().replace(/-/g, '').slice(0, 8)}`;

  // Generate deliverable guarantees
  for (const deliverable of skill.deliverables) {
    guarantees.push({
      id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
      name: `${deliverable} created`,
      type: 'deliverable',
      required: true,
      validation: {
        files: [{ pattern: deliverable, minCount: 1 }],
      },
    });
  }

  // If no deliverables found but it's a deliverable-type skill, add generic guarantee
  if (skill.deliverables.length === 0 && !skill.isMeta && !skill.isVerifier) {
    // Look for common patterns based on skill name
    const commonDeliverables: Record<string, string> = {
      'requirements': 'REQUIREMENTS.md',
      'spec': 'FEATURESPEC.md',
      'architect': 'ARCHITECTURE.md',
      'scaffold': 'package.json',
      'implement': 'src/**/*.ts',
      'test-generation': '**/*.test.ts',
      'document': 'README.md',
      'changelog-generator': 'CHANGELOG.md',
      'release-notes': 'RELEASE-NOTES.md',
      'postmortem': 'POSTMORTEM.md',
      'migration-planner': 'MIGRATION-PLAN.md',
      'release-planner': 'RELEASE-PLAN.md',
      'compatibility-checker': 'COMPATIBILITY.md',
      'rollback-validator': 'ROLLBACK-VALIDATION.md',
      'bug-reproducer': 'BUG-REPRODUCTION.md',
      'root-cause-analysis': 'ROOT-CAUSE.md',
      'context-cultivation': 'CULTIVATED-CONTEXT.md',
      'context-ingestion': 'CONTEXT-SOURCES.md',
      'architecture-extractor': 'ARCHITECTURE.md',
      'stack-analyzer': 'STACK-MAP.md',
      'frontend-design': 'DESIGN-SPEC.md',
      'proposal-builder': 'PROPOSAL.md',
      'estimation': 'ESTIMATE.md',
      'triage': 'TRIAGE.md',
      'priority-matrix': 'PRIORITY-MATRIX.md',
      'incident-triage': 'INCIDENT-TRIAGE.md',
      'error-handling': 'ERROR-HANDLING.md',
      'journey-tracer': 'JOURNEY-LOG.md',
      'roadmap-tracker': 'ROADMAP.md',
    };

    if (commonDeliverables[skill.id]) {
      guarantees.push({
        id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
        name: `${commonDeliverables[skill.id]} created`,
        type: 'deliverable',
        required: true,
        validation: {
          files: [{ pattern: commonDeliverables[skill.id], minCount: 1 }],
        },
      });
    }
  }

  // Generate content guarantees for documentation skills
  if (skill.deliverables.some(d => d.endsWith('.md'))) {
    const mdDeliverables = skill.deliverables.filter(d => d.endsWith('.md'));
    for (const md of mdDeliverables.slice(0, 2)) { // Limit to first 2
      guarantees.push({
        id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
        name: `${md} has required content`,
        type: 'content',
        required: true,
        validation: {
          contentChecks: [{
            file: md,
            minLines: 50,
          }],
        },
      });
    }
  }

  // Generate quality guarantees for verifier skills
  if (skill.isVerifier) {
    guarantees.push({
      id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
      name: `${skill.name} passes verification`,
      type: 'quality',
      required: true,
      validation: {
        qualityThresholds: [{
          metric: 'verification_pass_rate',
          operator: 'eq',
          value: 1.0,
          source: 'file',
          path: skill.deliverables[0] || `${skill.id.toUpperCase()}.md`,
        }],
      },
    });
  }

  // Generate step proof guarantees for infrastructure skills
  if (skill.isInfra) {
    guarantees.push({
      id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
      name: `${skill.name} steps executed`,
      type: 'step_proof',
      required: true,
      validation: {
        proofType: 'artifact',
        proofPattern: `${skill.id}-PROOF.json`,
      },
    });
  }

  // Meta skills get minimal guarantees (optional)
  if (skill.isMeta && guarantees.length === 0) {
    guarantees.push({
      id: `${prefix}-${String(guaranteeIndex++).padStart(3, '0')}`,
      name: `${skill.name} completed`,
      type: 'step_proof',
      required: false, // Optional for meta skills
      validation: {
        proofType: 'artifact',
        proofPattern: `${skill.id}-PROOF.json`,
      },
    });
  }

  return {
    skillId: skill.id,
    guarantees,
  };
}

async function main() {
  const skillsPath = join(process.cwd(), 'skills');

  // Get all skill directories
  const entries = await readdir(skillsPath, { withFileTypes: true });
  const skillDirs = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(name => !name.startsWith('.'));

  const allSkillGuarantees: Record<string, SkillGuarantees> = {};
  const stats = {
    total: 0,
    withDeliverables: 0,
    verifiers: 0,
    infra: 0,
    meta: 0,
    totalGuarantees: 0,
  };

  for (const skillDir of skillDirs) {
    const skillPath = join(skillsPath, skillDir);
    const skillStat = await stat(skillPath);
    if (!skillStat.isDirectory()) continue;

    const skill = await parseSkillMd(skillPath);
    if (!skill) continue;

    stats.total++;
    if (skill.deliverables.length > 0) stats.withDeliverables++;
    if (skill.isVerifier) stats.verifiers++;
    if (skill.isInfra) stats.infra++;
    if (skill.isMeta) stats.meta++;

    const guarantees = generateGuarantees(skill);
    if (guarantees.guarantees.length > 0) {
      allSkillGuarantees[skill.id] = guarantees;
      stats.totalGuarantees += guarantees.guarantees.length;
    }
  }

  // Generate the registry
  const registry = {
    version: '2.0.0',
    generated: new Date().toISOString(),
    stats,
    skills: allSkillGuarantees,
    loops: {}, // Will be populated from existing or manually
    phases: {},
  };

  console.log(JSON.stringify(registry, null, 2));

  // Also output stats to stderr
  console.error('\n=== Generation Stats ===');
  console.error(`Skills analyzed: ${stats.total}`);
  console.error(`With deliverables: ${stats.withDeliverables}`);
  console.error(`Verifiers: ${stats.verifiers}`);
  console.error(`Infrastructure: ${stats.infra}`);
  console.error(`Meta: ${stats.meta}`);
  console.error(`Total guarantees generated: ${stats.totalGuarantees}`);
}

main().catch(console.error);

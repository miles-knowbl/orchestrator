/**
 * Loop Parser - Parse loop.json and LOOP.md files
 */

import matter from 'gray-matter';
import type { Loop, LoopPhase, Gate, Phase, LoopUIConfig, SkillUIConfig } from '../types.js';

export interface LoopConfig {
  id: string;
  name: string;
  version: string;
  description: string;

  phases: {
    name: Phase;
    skills: string[];
    required?: boolean;
    parallel?: boolean;
  }[];

  gates?: {
    id: string;
    name: string;
    afterPhase: Phase;
    required?: boolean;
    approvalType?: 'human' | 'auto' | 'conditional';
    deliverables?: string[];
  }[];

  defaults?: {
    mode?: 'greenfield' | 'brownfield-polish' | 'brownfield-enterprise';
    autonomy?: 'full' | 'supervised' | 'manual';
  };

  ui?: Partial<LoopUIConfig>;
  skillUI?: Record<string, SkillUIConfig>;

  metadata?: {
    author?: string;
    tags?: string[];
  };
}

/**
 * Parse loop.json configuration
 */
export function parseLoopConfig(jsonContent: string): LoopConfig {
  const config = JSON.parse(jsonContent) as LoopConfig;

  // Validate required fields
  if (!config.id) throw new Error('Loop config missing id');
  if (!config.name) throw new Error('Loop config missing name');
  if (!config.phases || config.phases.length === 0) {
    throw new Error('Loop config missing phases');
  }

  // Validate phases
  for (const phase of config.phases) {
    if (!phase.name) throw new Error('Phase missing name');
    if (!phase.skills || phase.skills.length === 0) {
      throw new Error(`Phase ${phase.name} has no skills`);
    }
  }

  return config;
}

/**
 * Parse LOOP.md for human-readable description
 */
export function parseLoopMarkdown(mdContent: string): {
  description?: string;
  content: string;
} {
  const { data, content } = matter(mdContent);

  return {
    description: data.description,
    content: content.trim(),
  };
}

/**
 * Convert LoopConfig to full Loop entity
 */
export function configToLoop(config: LoopConfig, markdownContent?: string): Loop {
  // Build phases with order
  const phases: LoopPhase[] = config.phases.map((p, index) => ({
    name: p.name,
    order: index,
    skills: p.skills.map((skillId, skillOrder) => ({
      skillId,
      required: true,
      order: skillOrder,
    })),
    required: p.required !== false,
    parallel: p.parallel,
  }));

  // Build gates
  const gates: Gate[] = (config.gates || []).map(g => ({
    id: g.id,
    name: g.name,
    afterPhase: g.afterPhase,
    required: g.required !== false,
    approvalType: g.approvalType || 'human',
    deliverables: g.deliverables || [],
  }));

  // Default UI config
  const defaultUI: LoopUIConfig = {
    theme: 'engineering',
    layout: 'chat-focused',
    features: {
      skillBrowser: true,
      deliverableViewer: true,
      gateApprovalUI: true,
      progressTimeline: true,
      metricsPanel: true,
    },
  };

  // Count total skills
  const skillCount = phases.reduce(
    (sum, p) => sum + p.skills.length,
    0
  );

  return {
    id: config.id,
    name: config.name,
    description: config.description || '',
    version: config.version || '1.0.0',
    content: markdownContent,
    phases,
    gates,
    defaultMode: config.defaults?.mode || 'greenfield',
    defaultAutonomy: config.defaults?.autonomy || 'supervised',
    ui: { ...defaultUI, ...config.ui },
    skillUI: config.skillUI || {},
    skillCount,
    author: config.metadata?.author,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Validate that all skills in a loop exist
 */
export function validateLoopSkills(
  loop: Loop,
  availableSkills: Set<string>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const phase of loop.phases) {
    for (const skill of phase.skills) {
      if (!availableSkills.has(skill.skillId)) {
        missing.push(skill.skillId);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

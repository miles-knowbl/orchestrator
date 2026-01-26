/**
 * Loop App Generator
 *
 * Generates a Next.js app from a loop definition.
 */

import { readFile, writeFile, readdir, stat, mkdir, copyFile } from 'fs/promises';
import { join, relative, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Loop {
  id: string;
  name: string;
  description: string;
  version: string;
  phases: LoopPhase[];
  gates: Gate[];
  defaultMode: string;
  defaultAutonomy: string;
  ui: LoopUIConfig;
  skillUI: Record<string, any>;
  skillCount: number;
}

export interface LoopPhase {
  name: string;
  order: number;
  skills: { skillId: string; required: boolean }[];
  required: boolean;
}

export interface Gate {
  id: string;
  name: string;
  afterPhase: string;
  required: boolean;
  approvalType: string;
  deliverables: string[];
  ui?: {
    title: string;
    approvalPrompt: string;
    feedbackRequired: boolean;
  };
}

export interface LoopUIConfig {
  theme: string;
  branding?: {
    title: string;
    subtitle?: string;
    primaryColor?: string;
  };
  layout: string;
  features: {
    skillBrowser: boolean;
    deliverableViewer: boolean;
    gateApprovalUI: boolean;
    progressTimeline: boolean;
    metricsPanel: boolean;
  };
}

export interface GeneratorOptions {
  loop: Loop;
  outputPath: string;
  templatePath?: string;
}

const DEFAULT_PRIMARY_COLOR = '#3b82f6';

/**
 * Generate a loop app
 */
export async function generateLoopApp(options: GeneratorOptions): Promise<{
  success: boolean;
  outputPath: string;
  filesGenerated: number;
}> {
  const { loop, outputPath } = options;
  const templatePath = options.templatePath || join(__dirname, 'templates', 'loop-app');

  console.log(`Generating app for loop: ${loop.name}`);
  console.log(`Template: ${templatePath}`);
  console.log(`Output: ${outputPath}`);

  // Create output directory
  await mkdir(outputPath, { recursive: true });

  // Build replacement map
  const replacements = buildReplacementMap(loop);

  // Copy and process template files
  const filesGenerated = await copyTemplateDirectory(templatePath, outputPath, replacements);

  // Generate loop-config.ts
  await generateLoopConfig(loop, outputPath);

  console.log(`Generated ${filesGenerated} files`);

  return {
    success: true,
    outputPath,
    filesGenerated,
  };
}

/**
 * Build replacement map for template variables
 */
function buildReplacementMap(loop: Loop): Record<string, string> {
  const primaryColor = loop.ui.branding?.primaryColor || DEFAULT_PRIMARY_COLOR;

  return {
    '{{LOOP_ID}}': loop.id,
    '{{LOOP_NAME}}': loop.name,
    '{{LOOP_DESCRIPTION}}': loop.description,
    '{{LOOP_VERSION}}': loop.version,
    '{{PRIMARY_COLOR}}': primaryColor,
    '{{THEME}}': loop.ui.theme,
    '{{LAYOUT}}': loop.ui.layout,
  };
}

/**
 * Recursively copy template directory with replacements
 */
async function copyTemplateDirectory(
  srcDir: string,
  destDir: string,
  replacements: Record<string, string>
): Promise<number> {
  let count = 0;
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    let destName = entry.name;

    // Remove .template suffix
    if (destName.endsWith('.template')) {
      destName = destName.slice(0, -9);
    }

    const destPath = join(destDir, destName);

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      count += await copyTemplateDirectory(srcPath, destPath, replacements);
    } else {
      // Skip loop-config template (we generate it separately)
      if (entry.name === 'loop-config.ts.template') {
        continue;
      }

      // Check if file needs processing
      const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.mjs'];
      const ext = entry.name.includes('.') ? '.' + entry.name.split('.').pop() : '';
      const isText = textExtensions.some(e => entry.name.endsWith(e) || entry.name.endsWith(e + '.template'));

      if (isText) {
        // Read, replace, and write
        let content = await readFile(srcPath, 'utf-8');

        for (const [placeholder, value] of Object.entries(replacements)) {
          content = content.replaceAll(placeholder, value);
        }

        await mkdir(dirname(destPath), { recursive: true });
        await writeFile(destPath, content);
      } else {
        // Binary file - just copy
        await mkdir(dirname(destPath), { recursive: true });
        await copyFile(srcPath, destPath);
      }

      count++;
    }
  }

  return count;
}

/**
 * Generate loop-config.ts from loop definition
 */
async function generateLoopConfig(loop: Loop, outputPath: string): Promise<void> {
  const configPath = join(outputPath, 'lib', 'loop-config.ts');

  // Prepare config object
  const config = {
    id: loop.id,
    name: loop.name,
    description: loop.description,
    version: loop.version,
    phases: loop.phases.map(p => ({
      name: p.name,
      order: p.order,
      skills: p.skills,
      required: p.required,
    })),
    gates: loop.gates.map(g => ({
      id: g.id,
      name: g.name,
      afterPhase: g.afterPhase,
      required: g.required,
      deliverables: g.deliverables,
      ui: g.ui,
    })),
    ui: {
      theme: loop.ui.theme,
      layout: loop.ui.layout,
      primaryColor: loop.ui.branding?.primaryColor || DEFAULT_PRIMARY_COLOR,
    },
  };

  const content = `// Auto-generated from loop definition
// Do not edit directly - regenerate from orchestrator

export interface LoopConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  phases: Phase[];
  gates: Gate[];
  ui: {
    theme: string;
    layout: string;
    primaryColor: string;
  };
}

export interface Phase {
  name: string;
  order: number;
  skills: { skillId: string; required: boolean }[];
  required: boolean;
}

export interface Gate {
  id: string;
  name: string;
  afterPhase: string;
  required: boolean;
  deliverables: string[];
  ui?: {
    title: string;
    approvalPrompt: string;
    feedbackRequired: boolean;
  };
}

export const loopConfig: LoopConfig = ${JSON.stringify(config, null, 2)};
`;

  await mkdir(dirname(configPath), { recursive: true });
  await writeFile(configPath, content);
}

/**
 * Validate a loop for app generation
 */
export function validateLoopForGeneration(loop: Loop): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!loop.id) errors.push('Loop ID is required');
  if (!loop.name) errors.push('Loop name is required');
  if (!loop.phases || loop.phases.length === 0) errors.push('Loop must have at least one phase');

  // UI config
  if (!loop.ui) {
    warnings.push('No UI config specified, using defaults');
  }

  // Skills
  const totalSkills = loop.phases.reduce((sum, p) => sum + p.skills.length, 0);
  if (totalSkills === 0) {
    warnings.push('Loop has no skills defined');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

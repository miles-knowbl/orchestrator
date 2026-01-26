#!/usr/bin/env node

/**
 * create-loop-app CLI
 *
 * Generate a Next.js app from a loop definition.
 *
 * Usage:
 *   npx create-loop-app <loop-id> --output <path>
 *   npx create-loop-app engineering-loop --output ./apps/engineering
 */

import { readFile } from 'fs/promises';
import { join, resolve } from 'path';
import { spawn } from 'child_process';
import { generateLoopApp, validateLoopForGeneration, type Loop } from './index.js';

interface CLIOptions {
  loopId: string;
  output: string;
  orchestratorUrl?: string;
  skipInstall?: boolean;
  verbose?: boolean;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  const options = parseArgs(args);

  if (!options.loopId) {
    console.error('Error: Loop ID is required');
    printHelp();
    process.exit(1);
  }

  if (!options.output) {
    console.error('Error: Output path is required (--output <path>)');
    printHelp();
    process.exit(1);
  }

  console.log('');
  console.log('  create-loop-app');
  console.log('  ───────────────');
  console.log('');

  try {
    // Load loop definition
    console.log(`  Loading loop: ${options.loopId}`);
    const loop = await loadLoop(options.loopId, options.orchestratorUrl);

    // Validate
    const validation = validateLoopForGeneration(loop);
    if (!validation.valid) {
      console.error('');
      console.error('  Validation errors:');
      validation.errors.forEach(e => console.error(`    - ${e}`));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.log('');
      console.log('  Warnings:');
      validation.warnings.forEach(w => console.log(`    - ${w}`));
    }

    // Generate
    console.log('');
    console.log(`  Generating app...`);

    const result = await generateLoopApp({
      loop,
      outputPath: resolve(options.output),
    });

    console.log(`  Generated ${result.filesGenerated} files`);

    // Install dependencies
    if (!options.skipInstall) {
      console.log('');
      console.log('  Installing dependencies...');
      await runCommand('npm', ['install'], result.outputPath);
    }

    // Success message
    console.log('');
    console.log('  ✓ App generated successfully!');
    console.log('');
    console.log('  Next steps:');
    console.log(`    cd ${options.output}`);
    console.log('    cp .env.example .env.local');
    console.log('    # Add your ANTHROPIC_API_KEY to .env.local');
    console.log('    npm run dev');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('  Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    loopId: '',
    output: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      options.output = args[++i] || '';
    } else if (arg === '--orchestrator' || arg === '-u') {
      options.orchestratorUrl = args[++i];
    } else if (arg === '--skip-install') {
      options.skipInstall = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (!arg.startsWith('-')) {
      options.loopId = arg;
    }
  }

  return options;
}

async function loadLoop(loopId: string, orchestratorUrl?: string): Promise<Loop> {
  // Try to load from orchestrator server
  if (orchestratorUrl) {
    try {
      const response = await fetch(`${orchestratorUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'get_loop',
            arguments: { id: loopId },
          },
          id: 1,
        }),
      });

      const text = await response.text();
      // Parse SSE response
      const match = text.match(/data: ({.*})/);
      if (match) {
        const data = JSON.parse(match[1]);
        if (data.result?.content?.[0]?.text) {
          return JSON.parse(data.result.content[0].text);
        }
      }
    } catch (error) {
      console.log('  Could not fetch from orchestrator, trying local file...');
    }
  }

  // Try to load from local loops directory
  const loopsDir = join(process.cwd(), 'loops');
  const loopJsonPath = join(loopsDir, loopId, 'loop.json');

  try {
    const content = await readFile(loopJsonPath, 'utf-8');
    const config = JSON.parse(content);

    // Convert to Loop format
    return {
      id: config.id,
      name: config.name,
      description: config.description || '',
      version: config.version || '1.0.0',
      phases: config.phases.map((p: any, i: number) => ({
        name: p.name,
        order: i,
        skills: p.skills.map((s: string) => ({ skillId: s, required: true })),
        required: true,
      })),
      gates: (config.gates || []).map((g: any) => ({
        id: g.id,
        name: g.name || g.id,
        afterPhase: g.afterPhase,
        required: g.required ?? true,
        approvalType: g.approvalType || 'human',
        deliverables: g.deliverables || [],
        ui: g.ui,
      })),
      defaultMode: config.defaultMode || 'greenfield',
      defaultAutonomy: config.defaultAutonomy || 'supervised',
      ui: config.ui || {
        theme: 'engineering',
        layout: 'chat-focused',
        features: {
          skillBrowser: true,
          deliverableViewer: true,
          gateApprovalUI: true,
          progressTimeline: true,
          metricsPanel: false,
        },
      },
      skillUI: config.skillUI || {},
      skillCount: config.phases.reduce((sum: number, p: any) => sum + p.skills.length, 0),
    };
  } catch (error) {
    throw new Error(`Loop not found: ${loopId}. Make sure the loop exists in ./loops/${loopId}/loop.json`);
  }
}

function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

function printHelp() {
  console.log(`
  create-loop-app - Generate a Next.js app from a loop definition

  Usage:
    npx create-loop-app <loop-id> --output <path> [options]

  Arguments:
    loop-id         The ID of the loop to generate an app for

  Options:
    -o, --output    Output directory for the generated app (required)
    -u, --orchestrator  URL of the orchestrator server
    --skip-install  Skip npm install after generation
    -v, --verbose   Verbose output
    -h, --help      Show this help message

  Examples:
    npx create-loop-app engineering-loop --output ./apps/engineering
    npx create-loop-app proposal-loop -o ./apps/proposal --skip-install
    npx create-loop-app my-loop -o ./my-app --orchestrator http://localhost:3002
`);
}

main();

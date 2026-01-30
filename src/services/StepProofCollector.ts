/**
 * StepProofCollector
 *
 * Collects evidence during skill execution to prove that steps were executed.
 * Generates proof artifacts that can be validated by GuaranteeService.
 */

import { createHash } from 'crypto';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import type {
  StepProof,
  StepProofEntry,
  StepProofType,
  StepEvidence,
  StepProofArtifact,
} from '../types/guarantee.js';

export interface StepProofCollectorOptions {
  executionId: string;
  skillId: string;
  proofsPath: string;  // Base path for proof artifacts
}

export class StepProofCollector {
  private steps: StepProofEntry[] = [];
  private currentStep: number = 0;
  private currentStepName: string = '';
  private startTime: Date;

  constructor(private options: StepProofCollectorOptions) {
    this.startTime = new Date();
  }

  /**
   * Mark the start of a new step
   */
  startStep(stepNumber: number, stepName: string): void {
    this.currentStep = stepNumber;
    this.currentStepName = stepName;
    this.log('info', `Starting step ${stepNumber}: ${stepName}`);
  }

  /**
   * Record that a file was created
   */
  async recordFileCreated(filePath: string): Promise<void> {
    const hash = await this.hashFile(filePath);

    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || `Created ${filePath}`,
      proofType: 'file_created',
      evidence: {
        type: 'file_created',
        filePath,
        fileHash: hash,
      },
    });

    this.log('debug', `Recorded file creation: ${filePath}`);
  }

  /**
   * Record that a file was modified
   */
  async recordFileModified(filePath: string, beforeHash?: string): Promise<void> {
    const afterHash = await this.hashFile(filePath);

    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || `Modified ${filePath}`,
      proofType: 'file_modified',
      evidence: {
        type: 'file_modified',
        filePath,
        beforeHash: beforeHash || 'unknown',
        fileHash: afterHash,
      },
    });

    this.log('debug', `Recorded file modification: ${filePath}`);
  }

  /**
   * Record that a command was executed
   */
  recordCommandExecuted(
    command: string,
    exitCode: number,
    output: string
  ): void {
    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || `Executed: ${command.slice(0, 50)}`,
      proofType: 'command_executed',
      evidence: {
        type: 'command_executed',
        command,
        exitCode,
        outputSnippet: output.slice(0, 1000),  // Limit output size
      },
    });

    this.log('debug', `Recorded command execution: ${command.slice(0, 50)}...`);
  }

  /**
   * Record that tests passed
   */
  recordTestsPassed(
    testSuite: string,
    testsRun: number,
    testsPassed: number
  ): void {
    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || `Tests passed: ${testSuite}`,
      proofType: 'test_passed',
      evidence: {
        type: 'test_passed',
        testSuite,
        testsRun,
        testsPassed,
      },
    });

    this.log('debug', `Recorded test results: ${testsPassed}/${testsRun} passed`);
  }

  /**
   * Record human verification
   */
  recordHumanVerified(verifiedBy: string, note?: string): void {
    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || 'Human verification',
      proofType: 'human_verified',
      evidence: {
        type: 'human_verified',
        verifiedBy,
        verificationNote: note,
      },
    });

    this.log('debug', `Recorded human verification by: ${verifiedBy}`);
  }

  /**
   * Record an artifact generation
   */
  recordArtifactGenerated(artifactPath: string, artifactType: string): void {
    this.steps.push({
      stepNumber: this.currentStep,
      stepName: this.currentStepName || `Generated: ${artifactPath}`,
      proofType: 'artifact_generated',
      evidence: {
        type: 'artifact_generated',
        artifactPath,
        artifactType,
      },
    });

    this.log('debug', `Recorded artifact generation: ${artifactPath}`);
  }

  /**
   * Get all collected steps
   */
  getSteps(): StepProofEntry[] {
    return [...this.steps];
  }

  /**
   * Get the count of steps collected
   */
  getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Convert steps to proof records
   */
  toProofs(): StepProof[] {
    return this.steps.map((step, index) => ({
      id: `PROOF-${this.options.executionId.slice(0, 8)}-${this.options.skillId}-${index}`,
      executionId: this.options.executionId,
      skillId: this.options.skillId,
      step,
      timestamp: new Date(),
    }));
  }

  /**
   * Generate the proof artifact and save to disk
   */
  async finalize(): Promise<StepProofArtifact> {
    const artifact: StepProofArtifact = {
      executionId: this.options.executionId,
      skillId: this.options.skillId,
      steps: this.steps,
      createdAt: this.startTime,
      completedAt: new Date(),
    };

    // Save to disk
    const artifactPath = this.getArtifactPath();
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, JSON.stringify(artifact, null, 2));

    this.log('info', `Proof artifact saved: ${artifactPath}`);
    return artifact;
  }

  /**
   * Get the path where the proof artifact will be saved
   */
  getArtifactPath(): string {
    return join(
      this.options.proofsPath,
      this.options.executionId,
      'proofs',
      `${this.options.skillId}-PROOF.json`
    );
  }

  /**
   * Static method to load an existing proof artifact
   */
  static async loadArtifact(artifactPath: string): Promise<StepProofArtifact | null> {
    try {
      const content = await readFile(artifactPath, 'utf-8');
      const artifact = JSON.parse(content) as StepProofArtifact;

      // Restore dates
      artifact.createdAt = new Date(artifact.createdAt);
      if (artifact.completedAt) {
        artifact.completedAt = new Date(artifact.completedAt);
      }

      return artifact;
    } catch {
      return null;
    }
  }

  /**
   * Static method to check if a proof artifact exists
   */
  static async artifactExists(artifactPath: string): Promise<boolean> {
    try {
      await stat(artifactPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compute SHA-256 hash of a file
   */
  private async hashFile(filePath: string): Promise<string> {
    try {
      const content = await readFile(filePath);
      const hash = createHash('sha256').update(content).digest('hex');
      return `sha256:${hash}`;
    } catch {
      return 'hash:unavailable';
    }
  }

  /**
   * Log a message
   */
  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'StepProofCollector',
      executionId: this.options.executionId,
      skillId: this.options.skillId,
      message,
    }));
  }
}

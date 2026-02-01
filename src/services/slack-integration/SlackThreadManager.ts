/**
 * Slack Thread Manager
 * 
 * Manages thread-per-execution model for Slack conversations.
 * Each loop execution gets its own thread for context continuity.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { ExecutionThread, ThreadContext } from './types.js';

export interface SlackThreadManagerOptions {
  dataPath: string;
}

export class SlackThreadManager {
  private threads: Map<string, ExecutionThread> = new Map();
  private executionToThread: Map<string, string> = new Map(); // executionId -> threadTs

  constructor(private options: SlackThreadManagerOptions) {}

  async initialize(): Promise<void> {
    await mkdir(this.options.dataPath, { recursive: true });
    await this.loadThreads();
  }

  private async loadThreads(): Promise<void> {
    const filePath = join(this.options.dataPath, 'slack-threads.json');
    try {
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content) as ExecutionThread[];
      for (const thread of data) {
        this.threads.set(thread.threadTs, thread);
        this.executionToThread.set(thread.executionId, thread.threadTs);
      }
    } catch {
      // No existing data
    }
  }

  private async saveThreads(): Promise<void> {
    const filePath = join(this.options.dataPath, 'slack-threads.json');
    const data = [...this.threads.values()];
    await writeFile(filePath, JSON.stringify(data, null, 2));
  }

  /**
   * Create a new thread for an execution
   */
  async createThread(params: {
    threadTs: string;
    channelId: string;
    executionId: string;
    loopId: string;
    target: string;
    branch: string;
    engineer: string;
  }): Promise<ExecutionThread> {
    const thread: ExecutionThread = {
      ...params,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };

    this.threads.set(params.threadTs, thread);
    this.executionToThread.set(params.executionId, params.threadTs);
    await this.saveThreads();

    return thread;
  }

  /**
   * Get thread by timestamp
   */
  getThread(threadTs: string): ExecutionThread | null {
    return this.threads.get(threadTs) || null;
  }

  /**
   * Get thread by execution ID
   */
  getThreadByExecution(executionId: string): ExecutionThread | null {
    const threadTs = this.executionToThread.get(executionId);
    if (!threadTs) return null;
    return this.threads.get(threadTs) || null;
  }

  /**
   * Get thread context for a message
   */
  getThreadContext(threadTs: string): ThreadContext | null {
    const thread = this.threads.get(threadTs);
    if (!thread) return null;

    return {
      thread,
      // pendingGate and currentPhase would be populated from ExecutionEngine
    };
  }

  /**
   * Update thread status
   */
  async updateThreadStatus(
    threadTs: string, 
    status: ExecutionThread['status']
  ): Promise<void> {
    const thread = this.threads.get(threadTs);
    if (thread) {
      thread.status = status;
      thread.lastMessageAt = new Date().toISOString();
      await this.saveThreads();
    }
  }

  /**
   * Update last message time
   */
  async touchThread(threadTs: string): Promise<void> {
    const thread = this.threads.get(threadTs);
    if (thread) {
      thread.lastMessageAt = new Date().toISOString();
      await this.saveThreads();
    }
  }

  /**
   * Get all active threads for a channel
   */
  getActiveThreads(channelId: string): ExecutionThread[] {
    return [...this.threads.values()]
      .filter(t => t.channelId === channelId && t.status === 'active')
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  /**
   * Get all threads for an engineer
   */
  getEngineerThreads(engineer: string): ExecutionThread[] {
    return [...this.threads.values()]
      .filter(t => t.engineer === engineer)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Generate thread title for loop start message
   */
  generateThreadTitle(loopId: string, target: string, branch: string): string {
    const loopName = loopId.replace(/-loop$/, '');
    return `${loopName}: ${target} (${branch})`;
  }

  /**
   * Clean up old completed threads (older than 30 days)
   */
  async cleanupOldThreads(maxAgeDays: number = 30): Promise<number> {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    let removed = 0;

    for (const [threadTs, thread] of this.threads.entries()) {
      if (thread.status !== 'active') {
        const lastActivity = new Date(thread.lastMessageAt).getTime();
        if (lastActivity < cutoff) {
          this.threads.delete(threadTs);
          this.executionToThread.delete(thread.executionId);
          removed++;
        }
      }
    }

    if (removed > 0) {
      await this.saveThreads();
    }

    return removed;
  }

  /**
   * List all threads with optional filtering
   */
  listThreads(filter?: {
    channelId?: string;
    engineer?: string;
    status?: ExecutionThread['status'];
    limit?: number;
  }): ExecutionThread[] {
    let results = [...this.threads.values()];

    if (filter?.channelId) {
      results = results.filter(t => t.channelId === filter.channelId);
    }
    if (filter?.engineer) {
      results = results.filter(t => t.engineer === filter.engineer);
    }
    if (filter?.status) {
      results = results.filter(t => t.status === filter.status);
    }

    results.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    if (filter?.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }
}

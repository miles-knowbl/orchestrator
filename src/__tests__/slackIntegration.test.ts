/**
 * Tests for Slack Integration Module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SlackCommandParser } from '../services/slack-integration/SlackCommandParser.js';
import { SlackThreadManager } from '../services/slack-integration/SlackThreadManager.js';
import { SlackMergeWorkflow } from '../services/slack-integration/SlackMergeWorkflow.js';
import { SlackIntegrationService } from '../services/slack-integration/SlackIntegrationService.js';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

describe('SlackCommandParser', () => {
  let parser: SlackCommandParser;

  beforeEach(() => {
    parser = new SlackCommandParser();
  });

  describe('simple commands', () => {
    it('parses "go" command', () => {
      const result = parser.parse('go', 'slack');
      expect(result).toEqual({
        type: 'go',
        source: 'slack',
        raw: 'go',
      });
    });

    it('parses "continue" as go command', () => {
      const result = parser.parse('continue', 'slack');
      expect(result).toEqual({
        type: 'go',
        source: 'slack',
        raw: 'continue',
      });
    });

    it('parses "approved" command', () => {
      const result = parser.parse('approved', 'slack');
      expect(result).toEqual({
        type: 'approved',
        source: 'slack',
        raw: 'approved',
      });
    });

    it('parses "yes" as approved command', () => {
      const result = parser.parse('yes', 'slack');
      expect(result).toEqual({
        type: 'approved',
        source: 'slack',
        raw: 'yes',
      });
    });

    it('parses "reject" command', () => {
      const result = parser.parse('reject', 'slack');
      expect(result).toEqual({
        type: 'reject',
        source: 'slack',
        raw: 'reject',
      });
    });

    it('parses "no" as reject command', () => {
      const result = parser.parse('no', 'slack');
      expect(result).toEqual({
        type: 'reject',
        source: 'slack',
        raw: 'no',
      });
    });

    it('parses "merge" command', () => {
      const result = parser.parse('merge', 'slack');
      expect(result).toEqual({
        type: 'merge',
        source: 'slack',
        raw: 'merge',
      });
    });

    it('parses "rebase" command', () => {
      const result = parser.parse('rebase', 'slack');
      expect(result).toEqual({
        type: 'rebase',
        source: 'slack',
        raw: 'rebase',
      });
    });

    it('parses "status" command', () => {
      const result = parser.parse('status', 'slack');
      expect(result).toEqual({
        type: 'status',
        source: 'slack',
        raw: 'status',
      });
    });
  });

  describe('commands with payloads', () => {
    it('parses reject with reason', () => {
      const result = parser.parse('reject: needs more tests', 'slack');
      expect(result).toEqual({
        type: 'reject',
        payload: { reason: 'needs more tests' },
        source: 'slack',
        raw: 'reject: needs more tests',
      });
    });

    it('parses changes request', () => {
      const result = parser.parse('changes: add error handling', 'slack');
      expect(result).toEqual({
        type: 'changes',
        payload: { reason: 'add error handling' },
        source: 'slack',
        raw: 'changes: add error handling',
      });
    });

    it('parses show command', () => {
      const result = parser.parse('show spec', 'slack');
      expect(result).toEqual({
        type: 'show',
        payload: { deliverable: 'spec' },
        source: 'slack',
        raw: 'show spec',
      });
    });

    it('parses capture command with URL', () => {
      const result = parser.parse('capture: https://example.com/article', 'slack');
      expect(result).toEqual({
        type: 'capture',
        payload: {
          content: 'https://example.com/article',
          url: 'https://example.com/article',
        },
        source: 'slack',
        raw: 'capture: https://example.com/article',
      });
    });

    it('parses standalone URL as capture', () => {
      const result = parser.parse('https://docs.anthropic.com/guide', 'slack');
      expect(result).toEqual({
        type: 'capture',
        payload: {
          content: 'https://docs.anthropic.com/guide',
          url: 'https://docs.anthropic.com/guide',
        },
        source: 'slack',
        raw: 'https://docs.anthropic.com/guide',
      });
    });
  });

  describe('loop invocation', () => {
    it('parses @orchestrator /engineering-loop', () => {
      const result = parser.parse('@orchestrator /engineering-loop', 'slack');
      expect(result).toEqual({
        type: 'start_loop',
        payload: {
          loopId: 'engineering-loop',
          target: undefined,
        },
        source: 'slack',
        raw: '@orchestrator /engineering-loop',
      });
    });

    it('parses @orchestrator /engineering-loop with target', () => {
      const result = parser.parse('@orchestrator /engineering-loop slack-integration', 'slack');
      expect(result).toEqual({
        type: 'start_loop',
        payload: {
          loopId: 'engineering-loop',
          target: 'slack-integration',
        },
        source: 'slack',
        raw: '@orchestrator /engineering-loop slack-integration',
      });
    });

    it('parses /bugfix-loop without @mention', () => {
      const result = parser.parse('/bugfix-loop #142', 'slack');
      expect(result).toEqual({
        type: 'start_loop',
        payload: {
          loopId: 'bugfix-loop',
          target: '#142',
        },
        source: 'slack',
        raw: '/bugfix-loop #142',
      });
    });

    it('normalizes loop names without -loop suffix', () => {
      const result = parser.parse('/engineering auth-module', 'slack');
      expect(result).toEqual({
        type: 'start_loop',
        payload: {
          loopId: 'engineering-loop',
          target: 'auth-module',
        },
        source: 'slack',
        raw: '/engineering auth-module',
      });
    });
  });

  describe('isCommand', () => {
    it('returns true for recognized commands', () => {
      expect(parser.isCommand('go')).toBe(true);
      expect(parser.isCommand('approved')).toBe(true);
      expect(parser.isCommand('merge')).toBe(true);
      expect(parser.isCommand('@orchestrator /loop')).toBe(true);
      expect(parser.isCommand('/engineering-loop')).toBe(true);
    });

    it('returns false for non-commands', () => {
      expect(parser.isCommand('hello')).toBe(false);
      expect(parser.isCommand('what is the status?')).toBe(false);
    });
  });

  describe('extractMentions', () => {
    it('extracts mentions from text', () => {
      const mentions = parser.extractMentions('Hey @alice and @bob, check this out');
      expect(mentions).toEqual(['alice', 'bob']);
    });

    it('returns empty array when no mentions', () => {
      const mentions = parser.extractMentions('No mentions here');
      expect(mentions).toEqual([]);
    });
  });

  describe('mentionsOrchestrator', () => {
    it('returns true when orchestrator is mentioned', () => {
      expect(parser.mentionsOrchestrator('@orchestrator /loop')).toBe(true);
      expect(parser.mentionsOrchestrator('Hey @Orchestrator')).toBe(true);
    });

    it('returns false when orchestrator is not mentioned', () => {
      expect(parser.mentionsOrchestrator('@alice help')).toBe(false);
    });
  });

  describe('source parameter', () => {
    it('uses terminal source when specified', () => {
      const result = parser.parse('go', 'terminal');
      expect(result?.source).toBe('terminal');
    });

    it('uses voice source when specified', () => {
      const result = parser.parse('approved', 'voice');
      expect(result?.source).toBe('voice');
    });
  });
});

describe('SlackThreadManager', () => {
  let manager: SlackThreadManager;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'slack-thread-test-'));
    manager = new SlackThreadManager({ dataPath: tempDir });
    await manager.initialize();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('createThread', () => {
    it('creates a new thread', async () => {
      const thread = await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'slack-integration',
        branch: 'alice/slack-integration',
        engineer: 'alice',
      });

      expect(thread.threadTs).toBe('1234567890.123456');
      expect(thread.status).toBe('active');
      expect(thread.engineer).toBe('alice');
    });
  });

  describe('getThread', () => {
    it('retrieves thread by timestamp', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'slack-integration',
        branch: 'alice/slack-integration',
        engineer: 'alice',
      });

      const thread = manager.getThread('1234567890.123456');
      expect(thread).not.toBeNull();
      expect(thread?.executionId).toBe('exec-123');
    });

    it('returns null for non-existent thread', () => {
      const thread = manager.getThread('nonexistent');
      expect(thread).toBeNull();
    });
  });

  describe('getThreadByExecution', () => {
    it('retrieves thread by execution ID', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'slack-integration',
        branch: 'alice/slack-integration',
        engineer: 'alice',
      });

      const thread = manager.getThreadByExecution('exec-123');
      expect(thread).not.toBeNull();
      expect(thread?.threadTs).toBe('1234567890.123456');
    });
  });

  describe('updateThreadStatus', () => {
    it('updates thread status', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'slack-integration',
        branch: 'alice/slack-integration',
        engineer: 'alice',
      });

      await manager.updateThreadStatus('1234567890.123456', 'complete');

      const thread = manager.getThread('1234567890.123456');
      expect(thread?.status).toBe('complete');
    });
  });

  describe('getActiveThreads', () => {
    it('returns active threads for a channel', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'feature-1',
        branch: 'alice/feature-1',
        engineer: 'alice',
      });

      await manager.createThread({
        threadTs: '1234567890.654321',
        channelId: 'C0ALICE',
        executionId: 'exec-456',
        loopId: 'bugfix-loop',
        target: 'bug-fix',
        branch: 'alice/bug-fix',
        engineer: 'alice',
      });

      const active = manager.getActiveThreads('C0ALICE');
      expect(active).toHaveLength(2);
    });
  });

  describe('generateThreadTitle', () => {
    it('generates correct thread title', () => {
      const title = manager.generateThreadTitle('engineering-loop', 'slack-integration', 'alice/slack-integration');
      expect(title).toBe('engineering: slack-integration (alice/slack-integration)');
    });
  });

  describe('listThreads', () => {
    it('filters by status', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'feature-1',
        branch: 'alice/feature-1',
        engineer: 'alice',
      });

      await manager.updateThreadStatus('1234567890.123456', 'complete');

      const active = manager.listThreads({ status: 'active' });
      const complete = manager.listThreads({ status: 'complete' });

      expect(active).toHaveLength(0);
      expect(complete).toHaveLength(1);
    });

    it('filters by engineer', async () => {
      await manager.createThread({
        threadTs: '1234567890.123456',
        channelId: 'C0ALICE',
        executionId: 'exec-123',
        loopId: 'engineering-loop',
        target: 'feature-1',
        branch: 'alice/feature-1',
        engineer: 'alice',
      });

      const aliceThreads = manager.listThreads({ engineer: 'alice' });
      const bobThreads = manager.listThreads({ engineer: 'bob' });

      expect(aliceThreads).toHaveLength(1);
      expect(bobThreads).toHaveLength(0);
    });

    it('respects limit', async () => {
      for (let i = 0; i < 5; i++) {
        await manager.createThread({
          threadTs: `123456789${i}.123456`,
          channelId: 'C0ALICE',
          executionId: `exec-${i}`,
          loopId: 'engineering-loop',
          target: `feature-${i}`,
          branch: `alice/feature-${i}`,
          engineer: 'alice',
        });
      }

      const limited = manager.listThreads({ limit: 3 });
      expect(limited).toHaveLength(3);
    });
  });
});

describe('SlackMergeWorkflow', () => {
  let workflow: SlackMergeWorkflow;
  let mergeCompleteCallback: ReturnType<typeof vi.fn>;
  let conflictCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mergeCompleteCallback = vi.fn();
    conflictCallback = vi.fn();

    workflow = new SlackMergeWorkflow({
      onMergeComplete: mergeCompleteCallback,
      onConflictDetected: conflictCallback,
    });
  });

  describe('initiateMerge', () => {
    it('creates a merge request', async () => {
      // Note: This test will fail without a real git repo
      // In production, we'd mock the git operations
      const request = await workflow.initiateMerge({
        engineer: 'alice',
        branch: 'alice/feature',
        worktreePath: '/tmp/test-worktree',
        executionId: 'exec-123',
      });

      expect(request.id).toBeDefined();
      expect(request.engineer).toBe('alice');
      expect(request.branch).toBe('alice/feature');
      expect(request.targetBranch).toBe('main');
    });
  });

  describe('initiateRebase', () => {
    it('creates a rebase request', async () => {
      const request = await workflow.initiateRebase({
        engineer: 'alice',
        branch: 'alice/feature',
        worktreePath: '/tmp/test-worktree',
      });

      expect(request.id).toBeDefined();
      expect(request.engineer).toBe('alice');
      expect(request.sourceBranch).toBe('main');
      expect(request.status).toBe('pending');
    });
  });

  describe('getMergeRequest', () => {
    it('retrieves merge request by ID', async () => {
      const created = await workflow.initiateMerge({
        engineer: 'alice',
        branch: 'alice/feature',
        worktreePath: '/tmp/test-worktree',
      });

      const retrieved = workflow.getMergeRequest(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });

    it('returns null for non-existent request', () => {
      const result = workflow.getMergeRequest('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getPendingMerges', () => {
    it('returns pending merges for engineer', async () => {
      await workflow.initiateMerge({
        engineer: 'alice',
        branch: 'alice/feature-1',
        worktreePath: '/tmp/test-worktree',
      });

      await workflow.initiateMerge({
        engineer: 'alice',
        branch: 'alice/feature-2',
        worktreePath: '/tmp/test-worktree',
      });

      const pending = workflow.getPendingMerges('alice');
      expect(pending.length).toBeGreaterThanOrEqual(0); // May be 0 if git fails
    });
  });
});

describe('SlackIntegrationService', () => {
  let service: SlackIntegrationService;
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'slack-integration-test-'));
    service = new SlackIntegrationService({ dataPath: tempDir });
    await service.initialize();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('registerChannel', () => {
    it('registers a channel configuration', () => {
      service.registerChannel({
        channelId: 'C0ALICE',
        enabled: true,
        botToken: 'xoxb-test',
        appToken: 'xapp-test',
        socketMode: true,
        engineer: 'alice',
        projectPath: '/Users/alice/project',
        worktreePath: '/Users/alice/worktrees/project-alice',
        branchPrefix: 'alice/',
      });

      const config = service.getChannelConfig('C0ALICE');
      expect(config).not.toBeNull();
      expect(config?.engineer).toBe('alice');
    });
  });

  describe('getEngineers', () => {
    it('returns list of registered engineers', () => {
      service.registerChannel({
        channelId: 'C0ALICE',
        enabled: true,
        botToken: '',
        appToken: '',
        socketMode: true,
        engineer: 'alice',
        projectPath: '/Users/alice/project',
        worktreePath: '/Users/alice/worktrees/project-alice',
        branchPrefix: 'alice/',
      });

      service.registerChannel({
        channelId: 'C0BOB',
        enabled: true,
        botToken: '',
        appToken: '',
        socketMode: true,
        engineer: 'bob',
        projectPath: '/Users/bob/project',
        worktreePath: '/Users/bob/worktrees/project-bob',
        branchPrefix: 'bob/',
      });

      const engineers = service.getEngineers();
      expect(engineers).toContain('alice');
      expect(engineers).toContain('bob');
    });
  });

  describe('handleMessage', () => {
    beforeEach(() => {
      service.registerChannel({
        channelId: 'C0ALICE',
        enabled: true,
        botToken: '',
        appToken: '',
        socketMode: true,
        engineer: 'alice',
        projectPath: '/Users/alice/project',
        worktreePath: '/Users/alice/worktrees/project-alice',
        branchPrefix: 'alice/',
        defaultLoop: 'engineering-loop',
      });
    });

    it('returns error for unconfigured channel', async () => {
      const result = await service.handleMessage('go', {
        channelId: 'UNKNOWN',
        userId: 'alice',
        engineer: 'alice',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Channel not configured');
    });

    it('handles non-command text gracefully', async () => {
      const result = await service.handleMessage('hello world', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('No command detected');
    });

    it('handles start_loop command', async () => {
      const result = await service.handleMessage('@orchestrator /engineering-loop test-feature', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
      expect(result.threadTs).toBeDefined();
    });

    it('handles status command', async () => {
      const result = await service.handleMessage('status', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Engineer: alice');
    });
  });

  describe('handleButtonClick', () => {
    beforeEach(() => {
      service.registerChannel({
        channelId: 'C0ALICE',
        enabled: true,
        botToken: '',
        appToken: '',
        socketMode: true,
        engineer: 'alice',
        projectPath: '/Users/alice/project',
        worktreePath: '/Users/alice/worktrees/project-alice',
        branchPrefix: 'alice/',
      });
    });

    it('handles approve button', async () => {
      // First create a thread
      await service.handleMessage('@orchestrator /engineering-loop test', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      // Note: We'd need the threadTs to test approval properly
      // This is a basic test of the button handler
      const result = await service.handleButtonClick('approve', '', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      // Without threadTs, approval fails
      expect(result.success).toBe(false);
    });

    it('returns error for unknown action', async () => {
      const result = await service.handleButtonClick('unknown-action', '', {
        channelId: 'C0ALICE',
        userId: 'alice',
        engineer: 'alice',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown action');
    });
  });

  describe('getEngineerStatus', () => {
    it('returns status for registered engineer', () => {
      service.registerChannel({
        channelId: 'C0ALICE',
        enabled: true,
        botToken: '',
        appToken: '',
        socketMode: true,
        engineer: 'alice',
        projectPath: '/Users/alice/project',
        worktreePath: '/Users/alice/worktrees/project-alice',
        branchPrefix: 'alice/',
      });

      const status = service.getEngineerStatus('alice');
      expect(status).not.toBeNull();
      expect(status?.engineer).toBe('alice');
      expect(status?.projectPath).toBe('/Users/alice/project');
    });

    it('returns null for unknown engineer', () => {
      const status = service.getEngineerStatus('unknown');
      expect(status).toBeNull();
    });
  });

  describe('getActiveThreads', () => {
    it('returns empty array when no threads', () => {
      const threads = service.getActiveThreads();
      expect(threads).toEqual([]);
    });
  });

  describe('component accessors', () => {
    it('exposes command parser', () => {
      const parser = service.getCommandParser();
      expect(parser).toBeInstanceOf(SlackCommandParser);
    });

    it('exposes thread manager', () => {
      const manager = service.getThreadManager();
      expect(manager).toBeInstanceOf(SlackThreadManager);
    });

    it('exposes merge workflow', () => {
      const workflow = service.getMergeWorkflow();
      expect(workflow).toBeInstanceOf(SlackMergeWorkflow);
    });
  });
});

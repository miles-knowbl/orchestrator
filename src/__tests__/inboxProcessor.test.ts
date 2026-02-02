/**
 * Tests for InboxProcessor - Second Brain Skill Harvesting Pipeline
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InboxProcessor } from '../services/InboxProcessor.js';
import { SkillRegistry } from '../services/SkillRegistry.js';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn(),
    };
  },
}));

describe('InboxProcessor', () => {
  let processor: InboxProcessor;
  let skillRegistry: SkillRegistry;
  let tempDir: string;
  let inboxPath: string;
  let dataPath: string;
  let skillsPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'inbox-test-'));
    inboxPath = join(tempDir, 'inbox');
    dataPath = join(tempDir, 'data');
    skillsPath = join(tempDir, 'skills');

    await mkdir(inboxPath, { recursive: true });
    await mkdir(dataPath, { recursive: true });
    await mkdir(skillsPath, { recursive: true });

    // Create a sample skill for enhancement/reference tests
    const sampleSkillDir = join(skillsPath, 'implement');
    await mkdir(sampleSkillDir, { recursive: true });
    await mkdir(join(sampleSkillDir, 'references'), { recursive: true });
    await writeFile(
      join(sampleSkillDir, 'SKILL.md'),
      `---
name: implement
description: Implementation skill
version: 1.0.0
phase: IMPLEMENT
---

# Implement

Implementation details here.
`
    );
    await writeFile(join(sampleSkillDir, 'CHANGELOG.md'), '# Changelog\n\n## [1.0.0]\n\n- Initial\n');

    skillRegistry = new SkillRegistry({
      skillsPath,
      repoPath: tempDir,
      watchEnabled: false,
    });
    await skillRegistry.initialize();

    processor = new InboxProcessor(
      { inboxPath, dataPath },
      skillRegistry
    );
    await processor.initialize();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  // Helper to add items with correct format
  const addTestItem = (content: string, type: 'paste' | 'conversation' | 'file' = 'paste', name = 'test') => {
    return processor.addItem({
      content,
      source: { type, name },
    });
  };

  describe('initialization', () => {
    it('creates required directories on initialize', async () => {
      const newInboxPath = join(tempDir, 'new-inbox');
      const newDataPath = join(tempDir, 'new-data');

      const newProcessor = new InboxProcessor(
        { inboxPath: newInboxPath, dataPath: newDataPath },
        skillRegistry
      );
      await newProcessor.initialize();

      const stats = newProcessor.getStats();
      expect(stats).toBeDefined();
    });

    it('starts with empty items', () => {
      const stats = processor.getStats();
      expect(stats.total).toBe(0);
      expect(stats.pending).toBe(0);
    });
  });

  describe('addItem', () => {
    it('adds a paste item', async () => {
      const result = await addTestItem('Test content for skill extraction', 'paste', 'test-paste');

      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.content).toBe('Test content for skill extraction');
      expect(result.source.type).toBe('paste');
    });

    it('adds a conversation item', async () => {
      const result = await addTestItem(
        'User: How do I implement X?\nAssistant: Here is how...',
        'conversation',
        'learning-conversation'
      );

      expect(result.id).toBeDefined();
      expect(result.source.type).toBe('conversation');
    });

    it('persists items after add', async () => {
      await addTestItem('Persisted content', 'paste', 'persist-test');

      // Create new processor and verify item persisted
      const newProcessor = new InboxProcessor(
        { inboxPath, dataPath },
        skillRegistry
      );
      await newProcessor.initialize();

      const stats = newProcessor.getStats();
      expect(stats.total).toBe(1);
    });
  });

  describe('listItems', () => {
    beforeEach(async () => {
      await addTestItem('Item 1', 'paste', 'item-1');
      await addTestItem('Item 2', 'paste', 'item-2');
      await addTestItem('Item 3', 'paste', 'item-3');
    });

    it('lists all items', () => {
      const items = processor.listItems();
      expect(items.length).toBe(3);
    });

    it('filters by status', () => {
      const pending = processor.listItems({ status: 'pending' });
      expect(pending.length).toBe(3);

      const extracted = processor.listItems({ status: 'extracted' });
      expect(extracted.length).toBe(0);
    });

    it('filters by source type', () => {
      const pastes = processor.listItems({ sourceType: 'paste' });
      expect(pastes.length).toBe(3);

      const files = processor.listItems({ sourceType: 'file' });
      expect(files.length).toBe(0);
    });
  });

  describe('getItem', () => {
    it('returns item by id', async () => {
      const added = await addTestItem('Get this item', 'paste', 'get-test');

      const item = processor.getItem(added.id);
      expect(item).toBeDefined();
      expect(item!.content).toBe('Get this item');
    });

    it('returns null for unknown id', () => {
      const item = processor.getItem('unknown-id');
      expect(item).toBeNull();
    });
  });

  describe('processItem', () => {
    it('throws for unknown item', async () => {
      await expect(processor.processItem('unknown-id')).rejects.toThrow('Inbox item not found');
    });

    it('throws for already processed item', async () => {
      const item = await addTestItem('Already processed', 'paste', 'already-processed');
      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      await (processor as any).saveItems();

      await expect(processor.processItem(item.id)).rejects.toThrow(/already/);
    });
  });

  describe('approveSkill (legacy extractedSkills)', () => {
    it('creates skill from extracted skill', async () => {
      const item = await addTestItem('Test content', 'paste', 'approve-test');

      // Set up item with mock extraction using legacy extractedSkills
      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.extractedSkills = [
        {
          name: 'new-skill',
          description: 'A new skill',
          phase: 'IMPLEMENT',
          content: '# New Skill\n\nSkill content here.',
          confidence: 0.9,
          needsReview: true,
        },
      ];

      // Save updated item
      await (processor as any).saveItems();

      const result = await processor.approveSkill(item.id, 0);

      expect(result.skillId).toBe('new-skill');
      expect(result.version).toBe('1.0.0');

      // Verify skill was created
      const skill = await skillRegistry.getSkill('new-skill');
      expect(skill).toBeDefined();
      expect(skill!.description).toBe('A new skill');
    });

    it('prevents duplicate skill creation', async () => {
      const item = await addTestItem('Test content', 'paste', 'duplicate-test');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.extractedSkills = [
        {
          name: 'implement', // Already exists
          description: 'Duplicate',
          phase: 'IMPLEMENT',
          content: '# Duplicate',
          confidence: 0.9,
          needsReview: true,
        },
      ];
      await (processor as any).saveItems();

      await expect(processor.approveSkill(item.id, 0)).rejects.toThrow(/already exists/);
    });
  });

  describe('approveEnhancement', () => {
    it('throws for non-existent parent skill', async () => {
      const item = await addTestItem('Enhancement for missing skill', 'paste', 'missing-parent-test');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.classifiedExtractions = [
        {
          type: 'skill_enhancement',
          confidence: 0.85,
          reasoning: 'Enhances nonexistent skill',
          targetSkill: 'nonexistent-skill',
          enhancement: {
            section: 'New Section',
            content: 'New content',
            description: 'Adding section',
          },
        },
      ];
      await (processor as any).saveItems();

      await expect(processor.approveEnhancement(item.id, 0)).rejects.toThrow(/not found/);
    });

    it('throws for wrong extraction type', async () => {
      const item = await addTestItem('Wrong type', 'paste', 'wrong-type-test');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.classifiedExtractions = [
        {
          type: 'reference_doc',
          confidence: 0.85,
          reasoning: 'This is a reference',
          parentSkill: 'implement',
          reference: { name: 'ref', content: 'content', description: 'desc' },
        },
      ];
      await (processor as any).saveItems();

      await expect(processor.approveEnhancement(item.id, 0)).rejects.toThrow(/not a skill_enhancement/);
    });
  });

  describe('approveReference', () => {
    it('throws for wrong extraction type', async () => {
      const item = await addTestItem('Wrong type', 'paste', 'wrong-type-ref');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.classifiedExtractions = [
        {
          type: 'skill_enhancement',
          confidence: 0.9,
          reasoning: 'This is an enhancement not a ref',
          targetSkill: 'implement',
          enhancement: { section: 'Test', content: 'test', description: 'test' },
        },
      ];
      await (processor as any).saveItems();

      await expect(processor.approveReference(item.id, 0)).rejects.toThrow(/not a reference_doc/);
    });

    it('throws for missing extraction data', async () => {
      const item = await addTestItem('Missing ref data', 'paste', 'missing-ref');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.classifiedExtractions = [
        {
          type: 'reference_doc',
          confidence: 0.9,
          reasoning: 'Missing reference data',
          // parentSkill and reference are missing
        },
      ];
      await (processor as any).saveItems();

      await expect(processor.approveReference(item.id, 0)).rejects.toThrow(/incomplete/);
    });
  });

  describe('rejectExtraction', () => {
    it('removes extraction from list', async () => {
      const item = await addTestItem('Content to reject', 'paste', 'reject-test');

      const mockItem = processor.getItem(item.id);
      mockItem!.status = 'extracted';
      mockItem!.classifiedExtractions = [
        {
          type: 'standalone_skill',
          confidence: 0.5,
          reasoning: 'Not useful extraction',
          skill: {
            name: 'bad-skill',
            description: 'Not useful',
            phase: 'IMPLEMENT',
            content: '# Bad Skill',
            confidence: 0.5,
            needsReview: true,
          },
        },
      ];
      await (processor as any).saveItems();

      await processor.rejectExtraction(item.id, 0, 'Not relevant');

      const updated = processor.getItem(item.id);
      // Extraction should be removed (spliced out)
      expect(updated!.classifiedExtractions!.length).toBe(0);
    });
  });

  describe('deleteItem', () => {
    it('removes item from inbox', async () => {
      const item = await addTestItem('Delete me', 'paste', 'delete-test');

      await processor.deleteItem(item.id);

      const deleted = processor.getItem(item.id);
      expect(deleted).toBeNull();

      const stats = processor.getStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('getStats', () => {
    it('returns correct statistics', async () => {
      // Add items with different statuses
      await addTestItem('Pending 1', 'paste', 'p1');
      await addTestItem('Pending 2', 'paste', 'p2');

      const item3 = await addTestItem('Extracted', 'paste', 'e1');
      const mockItem = processor.getItem(item3.id);
      mockItem!.status = 'extracted';
      mockItem!.extractedSkills = [
        { name: 'x', description: 'x', content: 'x', confidence: 0.9, needsReview: true },
      ];
      await (processor as any).saveItems();

      const stats = processor.getStats();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(2);
      expect(stats.extracted).toBe(1);
      expect(stats.skillsExtracted).toBe(1);
    });
  });
});

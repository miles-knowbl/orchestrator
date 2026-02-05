/**
 * Inbox Processor - Second Brain for harvesting skills from external resources
 *
 * Processes:
 * - URLs (documentation, blog posts, tutorials)
 * - Files (markdown, code samples)
 * - Pastes (conversation excerpts, code snippets)
 * - Conversation excerpts (learnings from chat sessions)
 *
 * Extracts potential skills and patterns using AI analysis.
 */

import { readFile, writeFile, readdir, mkdir, unlink } from 'fs/promises';
import { join, basename, extname } from 'path';
import { randomUUID } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import type { SkillRegistry } from './SkillRegistry.js';
import type {
  InboxItem,
  InboxSource,
  ExtractedSkill,
  ClassifiedExtraction,
  Pattern,
  Phase,
  PHASES,
} from '../types.js';

export interface InboxProcessorOptions {
  inboxPath: string;    // Path to inbox/ directory
  dataPath: string;     // Path for processed items storage
}

export interface ProcessingResult {
  item: InboxItem;
  extractedSkills: ExtractedSkill[];
  extractedPatterns: Pattern[];
  classifiedExtractions: ClassifiedExtraction[];
  confidence: number;
}

export class InboxProcessor {
  private items: Map<string, InboxItem> = new Map();
  private anthropic: Anthropic;

  constructor(
    private options: InboxProcessorOptions,
    private skillRegistry: SkillRegistry
  ) {
    this.anthropic = new Anthropic();
  }

  /**
   * Initialize by loading existing inbox items
   */
  async initialize(): Promise<void> {
    await mkdir(this.options.inboxPath, { recursive: true });
    await mkdir(this.options.dataPath, { recursive: true });

    // Load processed items
    await this.loadProcessedItems();

    // Scan inbox for new files
    await this.scanInbox();

    this.log('info', `Loaded ${this.items.size} inbox items`);
  }

  /**
   * Load previously processed items from data storage
   */
  private async loadProcessedItems(): Promise<void> {
    const itemsPath = join(this.options.dataPath, 'inbox-items.json');
    try {
      const content = await readFile(itemsPath, 'utf-8');
      const data = JSON.parse(content) as InboxItem[];
      for (const item of data) {
        item.createdAt = new Date(item.createdAt);
        if (item.processedAt) {
          item.processedAt = new Date(item.processedAt);
        }
        this.items.set(item.id, item);
      }
    } catch {
      // No items file yet
    }
  }

  /**
   * Scan inbox directory for new files
   */
  private async scanInbox(): Promise<void> {
    try {
      const files = await readdir(this.options.inboxPath);

      for (const file of files) {
        // Skip hidden files and already processed
        if (file.startsWith('.')) continue;

        const filePath = join(this.options.inboxPath, file);
        const existingItem = [...this.items.values()].find(
          i => i.source.name === file
        );

        if (!existingItem) {
          // Create new inbox item for this file
          const content = await readFile(filePath, 'utf-8');
          const source: InboxSource = {
            type: this.detectSourceType(file, content),
            name: file,
          };

          const item: InboxItem = {
            id: randomUUID(),
            source,
            content,
            status: 'pending',
            createdAt: new Date(),
          };

          // Check if content contains a URL
          const urlMatch = content.match(/^https?:\/\/[^\s]+$/m);
          if (urlMatch) {
            item.url = urlMatch[0];
          }

          this.items.set(item.id, item);
        }
      }
    } catch (error) {
      this.log('warn', `Failed to scan inbox: ${error}`);
    }
  }

  /**
   * Detect source type from file name and content
   */
  private detectSourceType(filename: string, content: string): InboxSource['type'] {
    const ext = extname(filename).toLowerCase();

    if (content.trim().startsWith('http://') || content.trim().startsWith('https://')) {
      return 'url';
    }

    if (['.md', '.txt', '.json', '.ts', '.js', '.py'].includes(ext)) {
      return 'file';
    }

    if (content.includes('Human:') || content.includes('Assistant:')) {
      return 'conversation';
    }

    return 'paste';
  }

  /**
   * Save items to persistent storage
   */
  private async saveItems(): Promise<void> {
    const itemsPath = join(this.options.dataPath, 'inbox-items.json');
    const data = [...this.items.values()];
    await writeFile(itemsPath, JSON.stringify(data, null, 2));
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Add a new item to the inbox
   */
  async addItem(params: {
    content: string;
    source: InboxSource;
    url?: string;
  }): Promise<InboxItem> {
    const item: InboxItem = {
      id: randomUUID(),
      source: params.source,
      url: params.url,
      content: params.content,
      status: 'pending',
      createdAt: new Date(),
    };

    this.items.set(item.id, item);
    await this.saveItems();

    this.log('info', `Added inbox item ${item.id} from ${params.source.type}`);
    return item;
  }

  /**
   * Add a URL to the inbox (fetches content)
   * Note: For YouTube videos, paste the transcript directly using "Paste Content" mode
   */
  async addUrl(url: string): Promise<InboxItem> {
    // Fetch URL content
    let content: string;
    try {
      const response = await fetch(url);
      const html = await response.text();
      content = this.extractTextFromHtml(html);
    } catch (error) {
      throw new Error(`Failed to fetch URL: ${error}`);
    }

    return this.addItem({
      content,
      source: { type: 'url', name: new URL(url).hostname },
      url,
    });
  }

  /**
   * Basic HTML to text extraction
   */
  private extractTextFromHtml(html: string): string {
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');

    // Normalize whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * List all inbox items
   */
  listItems(filter?: {
    status?: InboxItem['status'];
    sourceType?: InboxSource['type'];
  }): InboxItem[] {
    let results = [...this.items.values()];

    if (filter?.status) {
      results = results.filter(i => i.status === filter.status);
    }
    if (filter?.sourceType) {
      results = results.filter(i => i.source.type === filter.sourceType);
    }

    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get a specific inbox item
   */
  getItem(id: string): InboxItem | null {
    return this.items.get(id) || null;
  }

  /**
   * Process an inbox item to extract skills and patterns
   */
  async processItem(id: string): Promise<ProcessingResult> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Inbox item not found: ${id}`);
    }

    if (item.status !== 'pending') {
      throw new Error(`Item ${id} is already ${item.status}`);
    }

    item.status = 'processing';
    await this.saveItems();

    try {
      // Get existing skills for context (with descriptions)
      const existingSkills = this.skillRegistry.listSkills({ limit: 200 });

      // Use AI to classify and extract skills, enhancements, and references
      const extraction = await this.extractWithAI(item, existingSkills.skills);

      item.extractedSkills = extraction.skills;
      item.extractedPatterns = extraction.patterns;
      item.classifiedExtractions = extraction.classifiedExtractions;
      item.status = 'extracted';
      item.processedAt = new Date();

      await this.saveItems();

      const counts = {
        standalone: extraction.classifiedExtractions.filter(e => e.type === 'standalone_skill').length,
        enhancements: extraction.classifiedExtractions.filter(e => e.type === 'skill_enhancement').length,
        references: extraction.classifiedExtractions.filter(e => e.type === 'reference_doc').length,
      };
      this.log('info', `Processed item ${id}: ${counts.standalone} skills, ${counts.enhancements} enhancements, ${counts.references} references, ${extraction.patterns.length} patterns`);

      return {
        item,
        extractedSkills: extraction.skills,
        extractedPatterns: extraction.patterns,
        classifiedExtractions: extraction.classifiedExtractions,
        confidence: extraction.confidence,
      };
    } catch (error) {
      item.status = 'pending'; // Reset on failure
      await this.saveItems();
      throw error;
    }
  }

  /**
   * Extract skills and patterns using AI with classification-first approach
   */
  private async extractWithAI(
    item: InboxItem,
    existingSkills: { id: string; description: string; phase?: Phase }[]
  ): Promise<{
    skills: ExtractedSkill[];
    patterns: Pattern[];
    classifiedExtractions: ClassifiedExtraction[];
    confidence: number;
  }> {
    const skillContext = existingSkills
      .map(s => `- ${s.id}: ${s.description} [phase: ${s.phase || 'none'}]`)
      .join('\n');

    const prompt = `You are a skill librarian for an AI orchestration system. Analyze this content and determine what reusable knowledge can be extracted.

CONTENT SOURCE: ${item.source.type}
${item.url ? `URL: ${item.url}` : ''}

CONTENT:
${item.content.slice(0, 12000)}

EXISTING SKILLS IN THE LIBRARY:
${skillContext}

VALID PHASES: INIT, SCAFFOLD, IMPLEMENT, TEST, VERIFY, VALIDATE, DOCUMENT, REVIEW, SHIP, COMPLETE

## Your Task

For each piece of extractable knowledge, CLASSIFY it into one of three types:

### 1. standalone_skill
A genuinely new, distinct capability NOT covered by any existing skill. Must be substantial enough to warrant its own skill. Standalone skills MUST follow this comprehensive template:

\`\`\`markdown
# [Skill Name]
[One-line description]

## When to Use
[Bullet list of situations when this skill applies]

## Reference Requirements
### MUST read before applying
| Reference | Why Required |
|-----------|--------------|
[table rows]

### Read if applicable
| Reference | When Needed |
|-----------|-------------|
[table rows]

## Required Deliverables
| Deliverable | Location | Condition |
|-------------|----------|-----------|
[table rows]

## Core Concept
[2-3 paragraphs explaining the fundamental idea]

## The [Process Name] Process
[ASCII diagram of the process flow]

### Step 1: [Name]
[Detailed instructions with code examples]

### Step 2: [Name]
[Continue for all steps...]

## [Skill Name] Quality Standards
### Checklist
[Markdown checklist]

### Common Mistakes
| Mistake | Problem | Solution |
|---------|---------|----------|
[table rows]

## Relationship to Other Skills
| Skill | Relationship |
|-------|--------------|
[How this connects to existing skills]

## Key Principles
[5-7 bold-titled principles with one-sentence explanations]
\`\`\`

### 2. skill_enhancement
Content that improves or expands an EXISTING skill: adding new sections, better examples, edge case handling, or improved checklists.

### 3. reference_doc
A focused implementation pattern or technique that belongs as a reference document under an existing skill (e.g., "binary-data-handling.md" under implement).

## Classification Guidelines
- PREFER enhancement or reference_doc over standalone_skill. Most content enhances existing skills.
- Only use standalone_skill if the content represents a genuinely distinct capability no existing skill covers.
- If it teaches a specific technique within an existing skill's domain, it's a reference_doc.
- If it broadens an existing skill's coverage, it's a skill_enhancement.
- Each extraction should have high value. Don't extract trivial patterns.

Respond in JSON format:
{
  "classifiedExtractions": [
    {
      "type": "standalone_skill" | "skill_enhancement" | "reference_doc",
      "confidence": 0.0-1.0,
      "reasoning": "Why this classification",
      "skill": { "name": "lowercase-hyphens", "description": "One sentence", "content": "Full markdown following template (500+ lines)", "phase": "PHASE", "confidence": 0.0-1.0 },
      "targetSkill": "existing-skill-id",
      "enhancement": { "section": "Section Name", "content": "Markdown to add", "description": "What this does" },
      "parentSkill": "existing-skill-id",
      "reference": { "name": "reference-name.md", "content": "Full markdown", "description": "What this covers" }
    }
  ],
  "patterns": [
    { "name": "Name", "context": "When to use", "solution": "How to apply", "example": "Optional" }
  ],
  "overallConfidence": 0.0-1.0,
  "reasoning": "Overall assessment"
}

Include ONLY the fields relevant to each type (skill for standalone_skill, targetSkill+enhancement for skill_enhancement, parentSkill+reference for reference_doc).`;

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI extraction response');
    }

    const extracted = JSON.parse(jsonMatch[0]);

    // Build classified extractions
    const classifiedExtractions: ClassifiedExtraction[] = (extracted.classifiedExtractions || []).map((ce: any) => {
      const base: ClassifiedExtraction = {
        type: ce.type,
        confidence: Math.min(1, Math.max(0, ce.confidence || 0.5)),
        reasoning: ce.reasoning || '',
      };

      if (ce.type === 'standalone_skill' && ce.skill) {
        base.skill = {
          name: this.normalizeSkillName(ce.skill.name),
          description: ce.skill.description || '',
          content: ce.skill.content || '',
          phase: this.validatePhase(ce.skill.phase),
          confidence: Math.min(1, Math.max(0, ce.skill.confidence || 0.5)),
          needsReview: true,
        };
      }

      if (ce.type === 'skill_enhancement' && ce.enhancement) {
        base.targetSkill = ce.targetSkill;
        base.enhancement = {
          section: ce.enhancement.section || '',
          content: ce.enhancement.content || '',
          description: ce.enhancement.description || '',
        };
      }

      if (ce.type === 'reference_doc' && ce.reference) {
        base.parentSkill = ce.parentSkill;
        base.reference = {
          name: ce.reference.name || '',
          content: ce.reference.content || '',
          description: ce.reference.description || '',
        };
      }

      return base;
    });

    // Build legacy extractedSkills from standalone_skill extractions
    const skills: ExtractedSkill[] = classifiedExtractions
      .filter(ce => ce.type === 'standalone_skill' && ce.skill)
      .map(ce => ce.skill!);

    // Validate and normalize patterns
    const patterns: Pattern[] = (extracted.patterns || []).map((p: any, i: number) => ({
      id: `PAT-${Date.now().toString(36)}-${i}`,
      name: p.name || 'Unnamed Pattern',
      context: p.context || '',
      solution: p.solution || '',
      example: p.example,
      uses: 0,
      confidence: 'low' as const,
      createdAt: new Date(),
    }));

    return {
      skills,
      patterns,
      classifiedExtractions,
      confidence: extracted.overallConfidence || 0.5,
    };
  }

  /**
   * Normalize skill name to lowercase-with-hyphens
   */
  private normalizeSkillName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Validate phase name
   */
  private validatePhase(phase: string | undefined): Phase | undefined {
    if (!phase) return undefined;
    const upper = phase.toUpperCase();
    const validPhases = ['INIT', 'SCAFFOLD', 'IMPLEMENT', 'TEST', 'VERIFY', 'VALIDATE', 'DOCUMENT', 'REVIEW', 'SHIP', 'COMPLETE'];
    return validPhases.includes(upper) ? upper as Phase : undefined;
  }

  /**
   * Approve an extracted skill and create it
   */
  async approveSkill(
    itemId: string,
    skillIndex: number,
    modifications?: Partial<ExtractedSkill>
  ): Promise<{ skillId: string; version: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Inbox item not found: ${itemId}`);
    }

    if (!item.extractedSkills || skillIndex >= item.extractedSkills.length) {
      throw new Error(`Skill index ${skillIndex} not found`);
    }

    const extracted = item.extractedSkills[skillIndex];
    const skill = { ...extracted, ...modifications };

    // Check if skill already exists (provide friendly error message)
    const existingSkill = await this.skillRegistry.getSkill(skill.name);
    if (existingSkill) {
      throw new Error(
        `Cannot create skill '${skill.name}' - already exists (v${existingSkill.version}). ` +
        `Consider using 'improve:' feedback to enhance the existing skill instead.`
      );
    }

    // Check for similar skills
    const similar = this.skillRegistry.findSimilarSkills(skill.name);
    if (similar.length > 0) {
      const matches = similar.map(s => `'${s.skill.id}'`).join(', ');
      throw new Error(
        `Cannot create skill '${skill.name}' - similar skills exist: ${matches}. ` +
        `Consider enhancing an existing skill or using a more distinct name.`
      );
    }

    // Create the skill via registry
    const created = await this.skillRegistry.createSkill({
      name: skill.name,
      description: skill.description,
      content: skill.content,
      phase: skill.phase,
      category: 'engineering', // default for user-created skills
    });

    // Mark as approved
    item.extractedSkills[skillIndex].needsReview = false;
    await this.saveItems();

    this.log('info', `Approved and created skill '${created.id}' from inbox item ${itemId}`);

    return {
      skillId: created.id,
      version: created.version,
    };
  }

  /**
   * Reject an extracted skill
   */
  async rejectSkill(itemId: string, skillIndex: number, reason?: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Inbox item not found: ${itemId}`);
    }

    if (!item.extractedSkills || skillIndex >= item.extractedSkills.length) {
      throw new Error(`Skill index ${skillIndex} not found`);
    }

    // Remove the skill from extractions
    item.extractedSkills.splice(skillIndex, 1);
    await this.saveItems();

    this.log('info', `Rejected skill ${skillIndex} from inbox item ${itemId}: ${reason || 'No reason'}`);
  }

  /**
   * Approve an enhancement extraction and apply it to an existing skill
   */
  async approveEnhancement(
    itemId: string,
    extractionIndex: number,
    modifications?: { content?: string; section?: string }
  ): Promise<{ skillId: string; version: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Inbox item not found: ${itemId}`);
    }

    if (!item.classifiedExtractions || extractionIndex >= item.classifiedExtractions.length) {
      throw new Error(`Extraction index ${extractionIndex} not found`);
    }

    const extraction = item.classifiedExtractions[extractionIndex];
    if (extraction.type !== 'skill_enhancement') {
      throw new Error(`Extraction ${extractionIndex} is not a skill_enhancement (is ${extraction.type})`);
    }

    if (!extraction.targetSkill || !extraction.enhancement) {
      throw new Error(`Enhancement data incomplete for extraction ${extractionIndex}`);
    }

    const targetSkill = await this.skillRegistry.getSkill(extraction.targetSkill);
    if (!targetSkill) {
      throw new Error(`Target skill not found: ${extraction.targetSkill}`);
    }

    const section = modifications?.section || extraction.enhancement.section;
    const content = modifications?.content || extraction.enhancement.content;
    const enhancedContent = this.applyEnhancement(targetSkill.content, section, content);

    const updated = await this.skillRegistry.updateSkill({
      name: extraction.targetSkill,
      content: enhancedContent,
      versionBump: 'minor',
      changeDescription: `Enhancement: ${extraction.enhancement.description}`,
    });

    // Mark as applied
    item.classifiedExtractions[extractionIndex].confidence = -1;
    await this.saveItems();

    this.log('info', `Applied enhancement to skill '${updated.id}' from inbox item ${itemId}`);
    return { skillId: updated.id, version: updated.version };
  }

  /**
   * Apply enhancement content to a skill's markdown
   */
  private applyEnhancement(skillContent: string, sectionName: string, newContent: string): string {
    const sectionRegex = new RegExp(`^## ${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
    const match = skillContent.match(sectionRegex);

    if (match && match.index !== undefined) {
      // Append to existing section (before next ## heading or end)
      const afterSection = skillContent.slice(match.index + match[0].length);
      const nextSectionMatch = afterSection.match(/\n## /);
      const insertPoint = nextSectionMatch && nextSectionMatch.index !== undefined
        ? match.index + match[0].length + nextSectionMatch.index
        : skillContent.length;

      return (
        skillContent.slice(0, insertPoint) +
        '\n\n' + newContent +
        skillContent.slice(insertPoint)
      );
    }

    // Add as new section before Key Principles or References
    for (const pattern of [/\n## Key Principles/m, /\n## References/m]) {
      const insertMatch = skillContent.match(pattern);
      if (insertMatch && insertMatch.index !== undefined) {
        return (
          skillContent.slice(0, insertMatch.index) +
          `\n\n## ${sectionName}\n\n${newContent}` +
          skillContent.slice(insertMatch.index)
        );
      }
    }

    // Fallback: append at end
    return skillContent + `\n\n## ${sectionName}\n\n${newContent}`;
  }

  /**
   * Approve a reference doc extraction and add it to an existing skill
   */
  async approveReference(
    itemId: string,
    extractionIndex: number,
    modifications?: { name?: string; content?: string }
  ): Promise<{ skillId: string; version: string; referenceName: string }> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Inbox item not found: ${itemId}`);
    }

    if (!item.classifiedExtractions || extractionIndex >= item.classifiedExtractions.length) {
      throw new Error(`Extraction index ${extractionIndex} not found`);
    }

    const extraction = item.classifiedExtractions[extractionIndex];
    if (extraction.type !== 'reference_doc') {
      throw new Error(`Extraction ${extractionIndex} is not a reference_doc (is ${extraction.type})`);
    }

    if (!extraction.parentSkill || !extraction.reference) {
      throw new Error(`Reference data incomplete for extraction ${extractionIndex}`);
    }

    const refName = modifications?.name || extraction.reference.name;
    const refContent = modifications?.content || extraction.reference.content;

    const updated = await this.skillRegistry.addReference({
      skillName: extraction.parentSkill,
      referenceName: refName,
      content: refContent,
      description: extraction.reference.description,
    });

    // Mark as applied
    item.classifiedExtractions[extractionIndex].confidence = -1;
    await this.saveItems();

    this.log('info', `Added reference '${refName}' to skill '${updated.id}' from inbox item ${itemId}`);
    return { skillId: updated.id, version: updated.version, referenceName: refName };
  }

  /**
   * Reject a classified extraction
   */
  async rejectExtraction(itemId: string, extractionIndex: number, reason?: string): Promise<void> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Inbox item not found: ${itemId}`);
    }

    if (!item.classifiedExtractions || extractionIndex >= item.classifiedExtractions.length) {
      throw new Error(`Extraction index ${extractionIndex} not found`);
    }

    item.classifiedExtractions.splice(extractionIndex, 1);
    await this.saveItems();
    this.log('info', `Rejected extraction ${extractionIndex} from inbox item ${itemId}: ${reason || 'No reason'}`);
  }

  /**
   * Reject an entire inbox item
   */
  async rejectItem(id: string, reason?: string): Promise<void> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Inbox item not found: ${id}`);
    }

    item.status = 'rejected';
    item.processedAt = new Date();
    await this.saveItems();

    this.log('info', `Rejected inbox item ${id}: ${reason || 'No reason'}`);
  }

  /**
   * Delete an inbox item completely
   */
  async deleteItem(id: string): Promise<void> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Inbox item not found: ${id}`);
    }

    // Try to delete source file if it's in the inbox directory
    try {
      const filePath = join(this.options.inboxPath, item.source.name);
      await unlink(filePath);
    } catch {
      // File may not exist or was already deleted
    }

    this.items.delete(id);
    await this.saveItems();

    this.log('info', `Deleted inbox item ${id}`);
  }

  /**
   * Get inbox statistics
   */
  getStats(): {
    total: number;
    pending: number;
    processing: number;
    extracted: number;
    rejected: number;
    skillsExtracted: number;
    patternsExtracted: number;
  } {
    const items = [...this.items.values()];
    const extracted = items.filter(i => i.status === 'extracted');

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      extracted: extracted.length,
      rejected: items.filter(i => i.status === 'rejected').length,
      skillsExtracted: extracted.reduce((sum, i) => sum + (i.extractedSkills?.length || 0), 0),
      patternsExtracted: extracted.reduce((sum, i) => sum + (i.extractedPatterns?.length || 0), 0),
    };
  }

  /**
   * Refresh by scanning inbox for new files
   */
  async refresh(): Promise<{ newItems: number }> {
    const before = this.items.size;
    await this.scanInbox();
    await this.saveItems();
    return { newItems: this.items.size - before };
  }

  private log(level: string, message: string): void {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      service: 'InboxProcessor',
      message,
    }));
  }
}

/**
 * Slack Command Parser
 * 
 * Parses text input into semantic commands.
 * Works across all channels - same parsing for terminal, Slack, and voice.
 */

import type { SemanticCommand, SemanticCommandType } from './types.js';

export class SlackCommandParser {
  private readonly loopPatterns = [
    /^@?orchestrator\s+\/(\w+(?:-\w+)*(?:-loop)?)\s*(.*)$/i,
    /^\/(\w+(?:-\w+)*(?:-loop)?)\s*(.*)$/i,
  ];

  private readonly simpleCommands: Record<string, SemanticCommandType> = {
    'go': 'go',
    'continue': 'go',
    'approved': 'approved',
    'approve': 'approved',
    'yes': 'approved',
    'reject': 'reject',
    'no': 'reject',
    'merge': 'merge',
    'merge to main': 'merge',
    'rebase': 'rebase',
    'rebase from main': 'rebase',
    'status': 'status',
  };

  /**
   * Parse text into a semantic command
   */
  parse(text: string, source: 'terminal' | 'slack' | 'voice' = 'slack'): SemanticCommand | null {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const lower = trimmed.toLowerCase();

    // Check for simple commands first
    for (const [pattern, type] of Object.entries(this.simpleCommands)) {
      if (lower === pattern) {
        return {
          type,
          source,
          raw: trimmed,
        };
      }
    }

    // Check for reject with reason
    const rejectMatch = lower.match(/^reject[:\s]+(.+)$/i);
    if (rejectMatch) {
      return {
        type: 'reject',
        payload: { reason: rejectMatch[1].trim() },
        source,
        raw: trimmed,
      };
    }

    // Check for changes request
    const changesMatch = lower.match(/^changes?[:\s]+(.+)$/i);
    if (changesMatch) {
      return {
        type: 'changes',
        payload: { reason: changesMatch[1].trim() },
        source,
        raw: trimmed,
      };
    }

    // Check for show command
    const showMatch = lower.match(/^show\s+(.+)$/i);
    if (showMatch) {
      return {
        type: 'show',
        payload: { deliverable: showMatch[1].trim() },
        source,
        raw: trimmed,
      };
    }

    // Check for capture command (inbox)
    const captureMatch = lower.match(/^capture[:\s]+(.+)$/i);
    if (captureMatch) {
      const content = captureMatch[1].trim();
      const url = this.extractUrl(content);
      return {
        type: 'capture',
        payload: {
          content,
          url,
        },
        source,
        raw: trimmed,
      };
    }

    // Check for URL-only message (implicit capture)
    const urlOnly = this.extractUrl(trimmed);
    if (urlOnly && trimmed === urlOnly) {
      return {
        type: 'capture',
        payload: {
          content: trimmed,
          url: urlOnly,
        },
        source,
        raw: trimmed,
      };
    }

    // Check for loop invocation
    for (const pattern of this.loopPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        let loopId = match[1].toLowerCase();
        // Normalize loop name
        if (!loopId.endsWith('-loop')) {
          loopId = `${loopId}-loop`;
        }
        
        const target = match[2]?.trim() || undefined;
        
        return {
          type: 'start_loop',
          payload: {
            loopId,
            target,
          },
          source,
          raw: trimmed,
        };
      }
    }

    return null;
  }

  /**
   * Check if text looks like a command (for filtering)
   */
  isCommand(text: string): boolean {
    const trimmed = text.trim().toLowerCase();
    
    // Starts with known command words
    const commandStarts = [
      'go', 'continue', 'approved', 'approve', 'yes',
      'reject', 'no', 'merge', 'rebase', 'status', 'show',
      'changes', 'capture', '@orchestrator', '/',
    ];

    // Check if it's a URL (implicit capture)
    if (this.extractUrl(trimmed)) {
      return true;
    }

    return commandStarts.some(start => trimmed.startsWith(start));
  }

  /**
   * Get help text for available commands
   */
  getCommandHelp(): string {
    return `
Available Commands:
  go, continue     - Continue/resume execution
  approved, yes    - Approve current gate
  reject [reason]  - Reject with optional reason
  changes: [text]  - Request modifications
  merge            - Merge branch to main
  rebase           - Rebase from main
  status           - Show current state
  show [item]      - Display deliverable
  capture: [url]   - Capture URL to inbox

Loop Commands:
  @Orchestrator /engineering-loop [target]
  @Orchestrator /learning-loop
  @Orchestrator /bugfix-loop [issue]

Inbox Capture:
  capture: https://... - Capture URL content
  https://...          - Auto-capture URLs
`.trim();
  }

  /**
   * Extract mentions from text
   */
  extractMentions(text: string): string[] {
    const mentions = text.match(/@[\w-]+/g) || [];
    return mentions.map(m => m.slice(1).toLowerCase());
  }

  /**
   * Check if message mentions the orchestrator
   */
  mentionsOrchestrator(text: string): boolean {
    const mentions = this.extractMentions(text);
    return mentions.includes('orchestrator');
  }

  /**
   * Extract URL from text
   */
  extractUrl(text: string): string | undefined {
    // Match URLs (http, https)
    const urlMatch = text.match(/https?:\/\/[^\s<>]+/i);
    return urlMatch ? urlMatch[0] : undefined;
  }
}

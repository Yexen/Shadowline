import type { BibleEntry } from '@/hooks/use-bible';

interface CodexNode {
  id: string;
  path: string;
  title: string;
  content: string;
  type: 'document' | 'character' | 'location' | 'concept' | 'event';
  lastModified: Date;
}

interface SyncUpdate {
  type: 'codex-to-bible' | 'bible-to-codex';
  sourceId: string;
  targetId: string;
  data: any;
  timestamp: Date;
}

export class SyncManager {
  private syncQueue: SyncUpdate[] = [];
  private syncing = false;

  constructor(
    private updateCodexNode: (nodeId: string, updates: Partial<CodexNode>) => void,
    private updateBibleEntry: (category: string, entryTitle: string, updates: Partial<BibleEntry>) => void,
    private addBibleEntry: (category: string, entry: BibleEntry) => void
  ) {}

  // Sync Codex changes to Bible
  syncCodexToBible(node: CodexNode): void {
    if (node.type !== 'character') return; // Only sync characters for now

    const bibleEntry = this.convertCodexNodeToBibleEntry(node);

    // Add to sync queue
    this.syncQueue.push({
      type: 'codex-to-bible',
      sourceId: node.id,
      targetId: node.title,
      data: bibleEntry,
      timestamp: new Date()
    });

    this.processSyncQueue();
  }

  // Sync Bible changes to Codex
  syncBibleToCodex(category: string, entry: BibleEntry): void {
    if (category !== 'Characters') return; // Only sync characters for now

    const codexNode = this.convertBibleEntryToCodexNode(entry);

    // Add to sync queue
    this.syncQueue.push({
      type: 'bible-to-codex',
      sourceId: entry.title,
      targetId: codexNode.id,
      data: codexNode,
      timestamp: new Date()
    });

    this.processSyncQueue();
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncing || this.syncQueue.length === 0) return;

    this.syncing = true;

    try {
      while (this.syncQueue.length > 0) {
        const update = this.syncQueue.shift()!;
        await this.processUpdate(update);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.syncing = false;
    }
  }

  private async processUpdate(update: SyncUpdate): Promise<void> {
    try {
      if (update.type === 'codex-to-bible') {
        this.updateBibleEntry('Characters', update.targetId, update.data);
      } else if (update.type === 'bible-to-codex') {
        this.updateCodexNode(update.targetId, update.data);
      }
    } catch (error) {
      console.error(`Failed to process sync update:`, error);
    }
  }

  private convertCodexNodeToBibleEntry(node: CodexNode): Partial<BibleEntry> {
    // Parse the markdown content to extract Bible-compatible data
    const content = node.content;
    const fields: Array<{ label: string; value: string }> = [];
    const relationships: Array<{ characterName: string; relationshipType: string; description: string }> = [];

    // Extract real name from content
    const realNameMatch = content.match(/\*\*Real Name:\*\*\s*(.+)/);
    const realName = realNameMatch ? realNameMatch[1].trim() : undefined;

    // Extract aliases
    const aliasesMatch = content.match(/\*\*Aliases:\*\*\s*(.+)/);
    const aliases = aliasesMatch ? aliasesMatch[1].trim() : undefined;

    // Extract sections and convert to fields
    const sections = content.split(/^##\s+/m);
    for (const section of sections) {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = lines[0].trim();
        const content = lines.slice(1).join('\n').trim();

        if (title && content && title !== node.title) {
          fields.push({ label: title, value: content });
        }
      }
    }

    // Extract relationships from content
    const relationshipSection = content.match(/##\s+Relationships\s*\n([\s\S]*?)(?=\n##|\n\n|$)/);
    if (relationshipSection) {
      const relationshipText = relationshipSection[1];
      const relationshipLines = relationshipText.split('\n');

      for (const line of relationshipLines) {
        const match = line.match(/^-\s*\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          relationships.push({
            characterName: match[1].trim(),
            relationshipType: 'Unknown',
            description: match[2].trim()
          });
        }
      }
    }

    return {
      title: node.title,
      fields,
      fixedFields: {
        realName,
        aliases,
      },
      relationships
    };
  }

  private convertBibleEntryToCodexNode(entry: BibleEntry): Partial<CodexNode> {
    // Generate Codex-compatible markdown content from Bible entry
    let content = `# ${entry.title}\n\n`;

    // Add fixed fields
    if (entry.fixedFields?.realName) {
      content += `**Real Name:** ${entry.fixedFields.realName}\n\n`;
    }

    if (entry.fixedFields?.aliases) {
      content += `**Aliases:** ${entry.fixedFields.aliases}\n\n`;
    }

    if (entry.fixedFields?.age) {
      content += `**Age:** ${entry.fixedFields.age}\n\n`;
    }

    if (entry.fixedFields?.nationality) {
      content += `**Nationality:** ${entry.fixedFields.nationality}\n\n`;
    }

    if (entry.fixedFields?.alignment) {
      content += `**Alignment:** ${entry.fixedFields.alignment}\n\n`;
    }

    if (entry.fixedFields?.affiliation && entry.fixedFields.affiliation.length > 0) {
      content += `**Affiliation:** ${entry.fixedFields.affiliation.join(', ')}\n\n`;
    }

    // Add relationships
    if (entry.relationships && entry.relationships.length > 0) {
      content += `## Relationships\n\n`;
      entry.relationships.forEach(rel => {
        content += `- **${rel.characterName}** (${rel.relationshipType}): ${rel.description}\n`;
      });
      content += '\n';
    }

    // Add custom fields as sections
    if (entry.fields && entry.fields.length > 0) {
      entry.fields.forEach(field => {
        if (field.label && field.value) {
          content += `## ${field.label}\n\n${field.value}\n\n`;
        }
      });
    }

    const safeName = entry.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
    const path = `/characters/${safeName}`;

    return {
      path,
      title: entry.title,
      content,
      type: 'character',
      lastModified: new Date()
    };
  }

  // Check if nodes are synchronized
  areInSync(node: CodexNode, entry: BibleEntry): boolean {
    // Basic synchronization check based on title and last modified time
    if (node.title !== entry.title) return false;

    // More sophisticated sync checking could be implemented here
    // For now, just check if both exist and have the same title
    return true;
  }

  // Get sync status
  getSyncStatus(): { syncing: boolean; queueLength: number } {
    return {
      syncing: this.syncing,
      queueLength: this.syncQueue.length
    };
  }
}

// Utility function to extract character name from path
export function extractCharacterNameFromPath(path: string): string {
  const match = path.match(/\/characters\/(.+)/);
  if (match) {
    return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  return '';
}

// Utility function to generate path from character name
export function generatePathFromName(name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
  return `/characters/${safeName}`;
}
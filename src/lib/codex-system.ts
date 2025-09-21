// Codex Universal Content Management System
// Path-based content organization with AI-powered consistency checking

export interface CodexNode {
  id: string;
  path: string;
  title: string;
  content: string;
  type: 'document' | 'reference' | 'concept' | 'character' | 'location' | 'event' | 'timeline' | 'relationship';
  tags: string[];
  mentions: string[];
  lastModified: Date;
  created: Date;
  version: number;
  parentPath?: string;
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: 'low' | 'medium' | 'high';
    completeness: number; // 0-100%
  };
  aiExtracted?: {
    summary: string;
    keyPoints: string[];
    connections: string[];
    emotions: string[];
    themes: string[];
    inconsistencies: string[];
  };
  relationships: {
    references: string[]; // Paths this node references
    referencedBy: string[]; // Paths that reference this node
    similar: string[]; // Similar content
    conflicts: string[]; // Potential conflicts
  };
}

export interface CodexSearch {
  query: string;
  filters: {
    type?: CodexNode['type'][];
    pathPattern?: string;
    tags?: string[];
    dateRange?: { start: Date; end: Date };
    hasAI?: boolean;
  };
  sortBy: 'relevance' | 'date' | 'path' | 'title';
  limit?: number;
}

export interface CodexStats {
  totalNodes: number;
  nodesByType: Record<CodexNode['type'], number>;
  pathDepth: number;
  averageConnections: number;
  consistencyScore: number;
  lastAnalysis: Date;
}

export interface ConsistencyIssue {
  id: string;
  type: 'contradiction' | 'missing-reference' | 'orphaned-node' | 'duplicate-content' | 'timeline-conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedNodes: string[];
  suggestedActions: string[];
  autoFixable: boolean;
}

class CodexService {
  private nodes: Map<string, CodexNode> = new Map();
  private pathIndex: Map<string, string[]> = new Map(); // path -> node IDs
  private tagIndex: Map<string, string[]> = new Map(); // tag -> node IDs
  private mentionIndex: Map<string, string[]> = new Map(); // mention -> node IDs
  private lastAnalysis: Date = new Date();

  // Node Management
  async createNode(data: Omit<CodexNode, 'id' | 'created' | 'lastModified' | 'version' | 'relationships' | 'metadata'>): Promise<CodexNode> {
    const id = this.generateId();
    const now = new Date();

    const node: CodexNode = {
      ...data,
      id,
      created: now,
      lastModified: now,
      version: 1,
      relationships: {
        references: [],
        referencedBy: [],
        similar: [],
        conflicts: []
      },
      metadata: {
        wordCount: data.content.split(' ').length,
        readingTime: Math.ceil(data.content.split(' ').length / 200), // ~200 WPM
        complexity: this.calculateComplexity(data.content),
        completeness: this.calculateCompleteness(data)
      }
    };

    // Extract AI insights
    if (data.content.length > 100) {
      node.aiExtracted = await this.extractAIInsights(node);
    }

    // Update indexes
    this.updateIndexes(node);
    this.nodes.set(id, node);

    // Process mentions and references
    await this.processMentions(node);
    await this.updateRelationships(node);

    return node;
  }

  async updateNode(id: string, updates: Partial<CodexNode>): Promise<CodexNode | null> {
    const existing = this.nodes.get(id);
    if (!existing) return null;

    const updated: CodexNode = {
      ...existing,
      ...updates,
      lastModified: new Date(),
      version: existing.version + 1,
      metadata: {
        ...existing.metadata,
        wordCount: updates.content ? updates.content.split(' ').length : existing.metadata.wordCount,
        readingTime: updates.content ? Math.ceil(updates.content.split(' ').length / 200) : existing.metadata.readingTime,
        complexity: updates.content ? this.calculateComplexity(updates.content) : existing.metadata.complexity,
        completeness: this.calculateCompleteness({ ...existing, ...updates })
      }
    };

    // Re-extract AI insights if content changed
    if (updates.content && updates.content !== existing.content) {
      updated.aiExtracted = await this.extractAIInsights(updated);
    }

    this.removeFromIndexes(existing);
    this.updateIndexes(updated);
    this.nodes.set(id, updated);

    await this.processMentions(updated);
    await this.updateRelationships(updated);

    return updated;
  }

  deleteNode(id: string): boolean {
    const node = this.nodes.get(id);
    if (!node) return false;

    this.removeFromIndexes(node);
    this.nodes.delete(id);

    // Update relationships
    this.cleanupRelationships(node);

    return true;
  }

  // Search and Retrieval
  search(searchParams: CodexSearch): CodexNode[] {
    let results = Array.from(this.nodes.values());

    // Apply filters
    if (searchParams.filters.type?.length) {
      results = results.filter(node => searchParams.filters.type!.includes(node.type));
    }

    if (searchParams.filters.pathPattern) {
      const pattern = searchParams.filters.pathPattern.replace('*', '.*');
      const regex = new RegExp(pattern, 'i');
      results = results.filter(node => regex.test(node.path));
    }

    if (searchParams.filters.tags?.length) {
      results = results.filter(node =>
        searchParams.filters.tags!.some(tag => node.tags.includes(tag))
      );
    }

    if (searchParams.filters.dateRange) {
      results = results.filter(node =>
        node.lastModified >= searchParams.filters.dateRange!.start &&
        node.lastModified <= searchParams.filters.dateRange!.end
      );
    }

    if (searchParams.filters.hasAI !== undefined) {
      results = results.filter(node =>
        searchParams.filters.hasAI ? !!node.aiExtracted : !node.aiExtracted
      );
    }

    // Apply text search
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      results = results.filter(node =>
        node.title.toLowerCase().includes(query) ||
        node.content.toLowerCase().includes(query) ||
        node.path.toLowerCase().includes(query) ||
        node.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (node.aiExtracted?.summary.toLowerCase().includes(query))
      );
    }

    // Sort results
    results.sort((a, b) => {
      switch (searchParams.sortBy) {
        case 'date':
          return b.lastModified.getTime() - a.lastModified.getTime();
        case 'path':
          return a.path.localeCompare(b.path);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'relevance':
        default:
          return this.calculateRelevance(b, searchParams.query) - this.calculateRelevance(a, searchParams.query);
      }
    });

    return searchParams.limit ? results.slice(0, searchParams.limit) : results;
  }

  getNodeByPath(path: string): CodexNode | null {
    const nodeIds = this.pathIndex.get(path) || [];
    return nodeIds.length > 0 ? this.nodes.get(nodeIds[0]) || null : null;
  }

  getNodesByTag(tag: string): CodexNode[] {
    const nodeIds = this.tagIndex.get(tag) || [];
    return nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as CodexNode[];
  }

  getNodesByMention(mention: string): CodexNode[] {
    const nodeIds = this.mentionIndex.get(mention) || [];
    return nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as CodexNode[];
  }

  // Path Hierarchy
  getPathHierarchy(): { path: string; children: string[]; nodeCount: number }[] {
    const hierarchy: Map<string, { children: Set<string>; nodeCount: number }> = new Map();

    // Build hierarchy from all paths
    Array.from(this.nodes.values()).forEach(node => {
      const parts = node.path.split('/').filter(Boolean);
      let currentPath = '';

      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath += '/' + part;

        if (!hierarchy.has(currentPath)) {
          hierarchy.set(currentPath, { children: new Set(), nodeCount: 0 });
        }

        if (parentPath) {
          const parent = hierarchy.get(parentPath);
          if (parent) {
            parent.children.add(currentPath);
          }
        }

        // If this is the final part (exact match), increment node count
        if (index === parts.length - 1) {
          hierarchy.get(currentPath)!.nodeCount++;
        }
      });
    });

    return Array.from(hierarchy.entries()).map(([path, data]) => ({
      path,
      children: Array.from(data.children),
      nodeCount: data.nodeCount
    }));
  }

  // AI-Powered Analysis
  async runConsistencyCheck(): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = [];
    const nodes = Array.from(this.nodes.values());

    // Check for orphaned nodes
    const orphanedNodes = nodes.filter(node =>
      node.relationships.referencedBy.length === 0 &&
      node.path !== '/root' &&
      !node.path.startsWith('/meta/')
    );

    orphanedNodes.forEach(node => {
      issues.push({
        id: `orphan_${node.id}`,
        type: 'orphaned-node',
        severity: 'medium',
        description: `Node "${node.title}" has no incoming references`,
        affectedNodes: [node.path],
        suggestedActions: ['Add references from related content', 'Consider if this content is still needed'],
        autoFixable: false
      });
    });

    // Check for missing references
    nodes.forEach(node => {
      node.mentions.forEach(mention => {
        if (!this.getNodeByPath(mention)) {
          issues.push({
            id: `missing_ref_${node.id}_${mention}`,
            type: 'missing-reference',
            severity: 'high',
            description: `Node "${node.title}" references non-existent path: ${mention}`,
            affectedNodes: [node.path],
            suggestedActions: [`Create node at ${mention}`, 'Update reference to correct path'],
            autoFixable: false
          });
        }
      });
    });

    // Check for timeline conflicts (if nodes have date information)
    const timelineConflicts = await this.detectTimelineConflicts(nodes);
    issues.push(...timelineConflicts);

    this.lastAnalysis = new Date();
    return issues;
  }

  getStats(): CodexStats {
    const nodes = Array.from(this.nodes.values());
    const nodesByType = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<CodexNode['type'], number>);

    const pathDepth = Math.max(...nodes.map(node => node.path.split('/').length));
    const totalConnections = nodes.reduce((sum, node) =>
      sum + node.relationships.references.length + node.relationships.referencedBy.length, 0
    );

    return {
      totalNodes: nodes.length,
      nodesByType,
      pathDepth,
      averageConnections: nodes.length > 0 ? totalConnections / nodes.length : 0,
      consistencyScore: this.calculateOverallConsistency(),
      lastAnalysis: this.lastAnalysis
    };
  }

  // Private Methods
  private generateId(): string {
    return `codex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateComplexity(content: string): 'low' | 'medium' | 'high' {
    const wordCount = content.split(' ').length;
    const avgWordLength = content.replace(/\s/g, '').length / wordCount;
    const sentenceCount = content.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / sentenceCount;

    if (avgWordLength > 6 || avgSentenceLength > 20) return 'high';
    if (avgWordLength > 4 || avgSentenceLength > 15) return 'medium';
    return 'low';
  }

  private calculateCompleteness(node: Partial<CodexNode>): number {
    let score = 0;
    if (node.title && node.title.length > 5) score += 20;
    if (node.content && node.content.length > 100) score += 30;
    if (node.tags && node.tags.length > 0) score += 15;
    if (node.mentions && node.mentions.length > 0) score += 15;
    if (node.aiExtracted) score += 20;
    return Math.min(score, 100);
  }

  private calculateRelevance(node: CodexNode, query: string): number {
    if (!query) return 0;

    let score = 0;
    const queryLower = query.toLowerCase();

    if (node.title.toLowerCase().includes(queryLower)) score += 10;
    if (node.path.toLowerCase().includes(queryLower)) score += 5;

    const contentMatches = (node.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
    score += contentMatches * 2;

    const tagMatches = node.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length;
    score += tagMatches * 3;

    return score;
  }

  private async extractAIInsights(node: CodexNode): Promise<CodexNode['aiExtracted']> {
    // Mock AI extraction - in production, this would call actual AI services
    const words = node.content.split(' ');
    const summary = words.slice(0, 20).join(' ') + '...';

    return {
      summary,
      keyPoints: [
        'Key aspect identified from content',
        'Important relationship or characteristic',
        'Notable detail or attribute'
      ],
      connections: ['Related concept', 'Associated character', 'Connected location'],
      emotions: ['neutral', 'mysterious'],
      themes: ['identity', 'conflict', 'resolution'],
      inconsistencies: []
    };
  }

  private updateIndexes(node: CodexNode): void {
    // Path index
    if (!this.pathIndex.has(node.path)) {
      this.pathIndex.set(node.path, []);
    }
    this.pathIndex.get(node.path)!.push(node.id);

    // Tag index
    node.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, []);
      }
      this.tagIndex.get(tag)!.push(node.id);
    });

    // Mention index
    node.mentions.forEach(mention => {
      if (!this.mentionIndex.has(mention)) {
        this.mentionIndex.set(mention, []);
      }
      this.mentionIndex.get(mention)!.push(node.id);
    });
  }

  private removeFromIndexes(node: CodexNode): void {
    // Path index
    const pathNodes = this.pathIndex.get(node.path) || [];
    this.pathIndex.set(node.path, pathNodes.filter(id => id !== node.id));

    // Tag index
    node.tags.forEach(tag => {
      const tagNodes = this.tagIndex.get(tag) || [];
      this.tagIndex.set(tag, tagNodes.filter(id => id !== node.id));
    });

    // Mention index
    node.mentions.forEach(mention => {
      const mentionNodes = this.mentionIndex.get(mention) || [];
      this.mentionIndex.set(mention, mentionNodes.filter(id => id !== node.id));
    });
  }

  private async processMentions(node: CodexNode): Promise<void> {
    // Extract @mentions from content
    const mentionRegex = /@([a-zA-Z0-9\/\-_]+)/g;
    const matches = node.content.match(mentionRegex) || [];
    const extractedMentions = matches.map(match => match.substring(1)); // Remove @

    // Merge with explicitly provided mentions
    node.mentions = [...new Set([...node.mentions, ...extractedMentions])];
  }

  private async updateRelationships(node: CodexNode): Promise<void> {
    // Update references (outgoing)
    node.relationships.references = [...node.mentions];

    // Update referencedBy (incoming) for all mentioned nodes
    node.mentions.forEach(mentionPath => {
      const mentionedNode = this.getNodeByPath(mentionPath);
      if (mentionedNode && !mentionedNode.relationships.referencedBy.includes(node.path)) {
        mentionedNode.relationships.referencedBy.push(node.path);
      }
    });

    // Find similar nodes based on tags and content
    const similarNodes = this.findSimilarNodes(node);
    node.relationships.similar = similarNodes.map(n => n.path);
  }

  private cleanupRelationships(deletedNode: CodexNode): void {
    // Remove references to deleted node from all other nodes
    Array.from(this.nodes.values()).forEach(node => {
      node.relationships.referencedBy = node.relationships.referencedBy.filter(path => path !== deletedNode.path);
      node.relationships.references = node.relationships.references.filter(path => path !== deletedNode.path);
      node.relationships.similar = node.relationships.similar.filter(path => path !== deletedNode.path);
      node.relationships.conflicts = node.relationships.conflicts.filter(path => path !== deletedNode.path);
    });
  }

  private findSimilarNodes(node: CodexNode): CodexNode[] {
    const allNodes = Array.from(this.nodes.values()).filter(n => n.id !== node.id);

    return allNodes
      .map(otherNode => ({
        node: otherNode,
        similarity: this.calculateSimilarity(node, otherNode)
      }))
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(item => item.node);
  }

  private calculateSimilarity(node1: CodexNode, node2: CodexNode): number {
    let score = 0;

    // Tag similarity
    const commonTags = node1.tags.filter(tag => node2.tags.includes(tag));
    score += commonTags.length * 0.3;

    // Type similarity
    if (node1.type === node2.type) score += 0.2;

    // Path similarity
    const path1Parts = node1.path.split('/');
    const path2Parts = node2.path.split('/');
    const commonPathParts = path1Parts.filter(part => path2Parts.includes(part));
    score += (commonPathParts.length / Math.max(path1Parts.length, path2Parts.length)) * 0.3;

    return Math.min(score, 1);
  }

  private calculateOverallConsistency(): number {
    // Mock consistency calculation - would be more sophisticated in production
    const nodes = Array.from(this.nodes.values());
    const totalReferences = nodes.reduce((sum, node) => sum + node.mentions.length, 0);
    const validReferences = nodes.reduce((sum, node) =>
      sum + node.mentions.filter(mention => this.getNodeByPath(mention)).length, 0
    );

    return totalReferences > 0 ? Math.round((validReferences / totalReferences) * 100) : 100;
  }

  private async detectTimelineConflicts(nodes: CodexNode[]): Promise<ConsistencyIssue[]> {
    // Mock timeline conflict detection
    return [];
  }

  // Export/Import
  exportData(): { nodes: CodexNode[]; metadata: { exportDate: Date; version: string } } {
    return {
      nodes: Array.from(this.nodes.values()),
      metadata: {
        exportDate: new Date(),
        version: '1.0.0'
      }
    };
  }

  importData(data: { nodes: CodexNode[] }): void {
    this.nodes.clear();
    this.pathIndex.clear();
    this.tagIndex.clear();
    this.mentionIndex.clear();

    data.nodes.forEach(node => {
      this.nodes.set(node.id, node);
      this.updateIndexes(node);
    });
  }
}

export const codexService = new CodexService();
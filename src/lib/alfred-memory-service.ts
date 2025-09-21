// Alfred Memory Service - Edge Runtime Compatible
// Simple memory system with client-side persistence and server-side access

export interface MemoryEntry {
  id: string;
  timestamp: string;
  type: 'conversation' | 'preference' | 'project_update' | 'insight';
  content: string;
  context: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface MemoryStats {
  totalMemories: number;
  conversationCount: number;
  lastSessionDate?: string;
}

class AlfredMemoryService {
  private memories: MemoryEntry[] = [];

  // Get relevant memories based on query
  getRelevantMemories(query: string, limit: number = 3): MemoryEntry[] {
    if (!query || this.memories.length === 0) return [];

    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);

    return this.memories
      .filter(memory => {
        const searchText = `${memory.content} ${memory.context.join(' ')} ${memory.tags.join(' ')}`.toLowerCase();
        return queryWords.some(word => searchText.includes(word));
      })
      .sort((a, b) => {
        // Sort by importance and recency
        const importanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aImportance = importanceWeight[a.importance];
        const bImportance = importanceWeight[b.importance];

        if (aImportance !== bImportance) {
          return bImportance - aImportance;
        }

        // If same importance, sort by recency
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      })
      .slice(0, limit);
  }

  // Add new memory
  addMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): string {
    const memory: MemoryEntry = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.memories.push(memory);

    // Keep only recent memories (last 100 entries)
    if (this.memories.length > 100) {
      this.memories = this.memories
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);
    }

    return memory.id;
  }

  // Get memory statistics
  getMemoryStats(): MemoryStats {
    const conversationMemories = this.memories.filter(m => m.type === 'conversation');
    const lastSession = this.memories.length > 0
      ? this.memories.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;

    return {
      totalMemories: this.memories.length,
      conversationCount: conversationMemories.length,
      lastSessionDate: lastSession ? new Date(lastSession.timestamp).toLocaleDateString() : undefined
    };
  }

  // Load memories (for client-side initialization)
  loadMemories(memoriesData: MemoryEntry[]): void {
    this.memories = memoriesData.map(m => ({
      ...m,
      timestamp: typeof m.timestamp === 'string' ? m.timestamp : new Date(m.timestamp).toISOString()
    }));
  }

  // Get all memories (for client-side persistence)
  getAllMemories(): MemoryEntry[] {
    return [...this.memories];
  }

  // Get recent important memories for context
  getRecentImportantMemories(limit: number = 5): MemoryEntry[] {
    return this.memories
      .filter(m => m.importance === 'high' || m.importance === 'critical')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Clear old memories (older than specified days)
  clearOldMemories(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const beforeCount = this.memories.length;
    this.memories = this.memories.filter(m =>
      new Date(m.timestamp).getTime() > cutoffDate.getTime()
    );

    return beforeCount - this.memories.length;
  }
}

// Create a global instance for server-side use
export const alfredMemoryService = new AlfredMemoryService();

// Client-side memory manager
export class ClientMemoryManager {
  private memoryService = new AlfredMemoryService();
  private storageKey = 'alfred_memories_v2';

  constructor() {
    this.loadFromStorage();
  }

  addMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): string {
    const id = this.memoryService.addMemory(entry);
    this.saveToStorage();
    return id;
  }

  getRelevantMemories(query: string, limit?: number): MemoryEntry[] {
    return this.memoryService.getRelevantMemories(query, limit);
  }

  getMemoryStats(): MemoryStats {
    return this.memoryService.getMemoryStats();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const memories: MemoryEntry[] = JSON.parse(stored);
        this.memoryService.loadMemories(memories);
      }
    } catch (e) {
      console.warn('Alfred: Could not load memories from storage:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const memories = this.memoryService.getAllMemories();
      localStorage.setItem(this.storageKey, JSON.stringify(memories));
    } catch (e) {
      console.warn('Alfred: Could not save memories to storage:', e);
    }
  }

  // Sync memories from server context (after API calls)
  syncMemoriesFromServer(serverMemories: MemoryEntry[]): void {
    // Merge server memories with client memories
    const allMemories = [...this.memoryService.getAllMemories(), ...serverMemories];

    // Remove duplicates based on content similarity
    const uniqueMemories = allMemories.filter((memory, index, arr) => {
      return !arr.slice(0, index).some(existing =>
        existing.content.includes(memory.content.substring(0, 50)) ||
        memory.content.includes(existing.content.substring(0, 50))
      );
    });

    this.memoryService.loadMemories(uniqueMemories);
    this.saveToStorage();
  }

  clearAllMemories(): void {
    this.memoryService.loadMemories([]);
    this.saveToStorage();
  }
}
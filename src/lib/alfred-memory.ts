// Alfred's Memory and Learning System
// Persistent memory that grows with each interaction

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'conversation' | 'preference' | 'project_update' | 'insight' | 'concern';
  content: string;
  context: string[];
  importance: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface ConversationContext {
  currentTopic: string;
  recentMessages: string[];
  userMood: 'neutral' | 'excited' | 'frustrated' | 'focused' | 'creative';
  sessionGoals: string[];
}

class AlfredMemory {
  private memories: MemoryEntry[] = [];
  private conversationHistory: MemoryEntry[] = [];
  private userPreferences: Map<string, any> = new Map();
  private projectUpdates: Map<string, MemoryEntry[]> = new Map();

  constructor() {
    this.loadMemoriesFromStorage();
  }

  // Core Memory Functions
  addMemory(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): string {
    const memory: MemoryEntry = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry
    };

    this.memories.push(memory);
    this.saveMemoriesToStorage();
    return memory.id;
  }

  getRelevantMemories(query: string, limit: number = 5): MemoryEntry[] {
    const queryWords = query.toLowerCase().split(' ');

    return this.memories
      .filter(memory => {
        const memoryText = (memory.content + ' ' + memory.context.join(' ')).toLowerCase();
        return queryWords.some(word => memoryText.includes(word));
      })
      .sort((a, b) => {
        // Sort by importance and recency
        const importanceWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aScore = importanceWeight[a.importance] + (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30); // Decay over 30 days
        const bScore = importanceWeight[b.importance] + (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Conversation Context Management
  updateConversationContext(message: string, context: ConversationContext): ConversationContext {
    const newContext = { ...context };

    // Update recent messages
    newContext.recentMessages = [...context.recentMessages.slice(-4), message];

    // Detect user mood from message
    newContext.userMood = this.detectUserMood(message);

    // Extract current topic
    newContext.currentTopic = this.extractTopic(message, context.recentMessages);

    // Remember this conversation
    this.addMemory({
      type: 'conversation',
      content: message,
      context: [newContext.currentTopic, newContext.userMood],
      importance: 'medium',
      tags: ['conversation', newContext.currentTopic, newContext.userMood]
    });

    return newContext;
  }

  // User Preference Learning
  learnPreference(key: string, value: any, context: string): void {
    this.userPreferences.set(key, value);

    this.addMemory({
      type: 'preference',
      content: `User prefers ${key}: ${JSON.stringify(value)}`,
      context: [context],
      importance: 'high',
      tags: ['preference', key]
    });
  }

  getPreference(key: string): any {
    return this.userPreferences.get(key);
  }

  // Project Update Tracking
  trackProjectUpdate(projectName: string, update: string, importance: MemoryEntry['importance']): void {
    const memory: MemoryEntry = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'project_update',
      content: update,
      context: [projectName],
      importance,
      tags: ['project', projectName]
    };

    if (!this.projectUpdates.has(projectName)) {
      this.projectUpdates.set(projectName, []);
    }
    this.projectUpdates.get(projectName)!.push(memory);
    this.addMemory(memory);
  }

  getProjectHistory(projectName: string): MemoryEntry[] {
    return this.projectUpdates.get(projectName) || [];
  }

  // Intelligent Response Generation
  generatePersonalizedResponse(userMessage: string, context: ConversationContext): {
    response: string;
    emotion: 'neutral' | 'happy' | 'concerned' | 'excited' | 'thoughtful';
    suggestions: string[];
  } {
    const relevantMemories = this.getRelevantMemories(userMessage);
    const userMood = this.detectUserMood(userMessage);

    let response = this.craftResponse(userMessage, relevantMemories, context, userMood);
    let emotion: 'neutral' | 'happy' | 'concerned' | 'excited' | 'thoughtful' = 'neutral';
    let suggestions: string[] = [];

    // Adjust response based on context and memories
    if (relevantMemories.some(m => m.type === 'concern')) {
      emotion = 'concerned';
      response = this.addConcernToResponse(response);
    } else if (userMood === 'excited') {
      emotion = 'excited';
      response = this.addEnthusiasmToResponse(response);
    } else if (context.currentTopic.includes('batman') || context.currentTopic.includes('codex')) {
      emotion = 'thoughtful';
      suggestions = this.generateProjectSuggestions(context.currentTopic);
    }

    return { response, emotion, suggestions };
  }

  // Private Helper Methods
  private detectUserMood(message: string): ConversationContext['userMood'] {
    const excitementWords = ['amazing', 'awesome', 'exciting', 'great', 'love', '!'];
    const frustrationWords = ['stuck', 'problem', 'issue', 'error', 'broken', 'frustrated'];
    const focusWords = ['need to', 'working on', 'building', 'implementing', 'creating'];

    const messageLower = message.toLowerCase();

    if (excitementWords.some(word => messageLower.includes(word))) return 'excited';
    if (frustrationWords.some(word => messageLower.includes(word))) return 'frustrated';
    if (focusWords.some(word => messageLower.includes(word))) return 'focused';
    if (messageLower.includes('idea') || messageLower.includes('concept')) return 'creative';

    return 'neutral';
  }

  private extractTopic(message: string, recentMessages: string[]): string {
    const topicKeywords = {
      'batman': ['batman', 'gotham', 'bruce', 'alfred', 'batcave'],
      'codex': ['codex', 'universal', 'path', '@mention', 'truth source'],
      'development': ['build', 'code', 'implement', 'create', 'develop'],
      'planning': ['plan', 'design', 'architecture', 'structure'],
      'ai': ['ai', 'assistant', 'llm', 'artificial intelligence']
    };

    const allText = (message + ' ' + recentMessages.join(' ')).toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return topic;
      }
    }

    return 'general';
  }

  private craftResponse(message: string, memories: MemoryEntry[], context: ConversationContext, mood: ConversationContext['userMood']): string {
    // Import Alfred's personality from the knowledge base
    const { alfredPersonality } = require('./alfred-knowledge');

    // Base response templates using Alfred's proper personality
    const responses = {
      greeting: alfredPersonality.greetings,
      project: [
        "Splendid progress on the {topic}, Miss Yekta! I've been keeping tabs on your developments.",
        "Ah, the {topic} project advances beautifully under your guidance. Quite impressive, Miss.",
        "The {topic} continues to flourish - your creative vision is truly remarkable, Miss Yekta."
      ],
      general: alfredPersonality.acknowledgments
    };

    // Select appropriate response based on context
    let baseResponse = '';
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      baseResponse = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    } else if (context.currentTopic !== 'general') {
      baseResponse = responses.project[Math.floor(Math.random() * responses.project.length)]
        .replace('{topic}', context.currentTopic);
    } else {
      baseResponse = responses.general[Math.floor(Math.random() * responses.general.length)];
    }

    // Add memory-based context if relevant
    if (memories.length > 0) {
      const recentMemory = memories[0];
      baseResponse += ` I recall our previous discussion about ${recentMemory.context.join(' and ')}.`;
    }

    return baseResponse;
  }

  private addConcernToResponse(response: string): string {
    const concerns = [
      " If I may express some concern about this approach, Master...",
      " Might I suggest proceeding with caution on this matter?",
      " I do hope we'll consider all implications carefully, Master."
    ];
    return response + concerns[Math.floor(Math.random() * concerns.length)];
  }

  private addEnthusiasmToResponse(response: string): string {
    const enthusiasm = [
      " Your excitement is quite infectious, Master!",
      " I share your enthusiasm for this endeavor, Master.",
      " Most excellent! I can sense your creative energy, Master."
    ];
    return response + enthusiasm[Math.floor(Math.random() * enthusiasm.length)];
  }

  private generateProjectSuggestions(topic: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'batman': [
        "Review character relationship maps",
        "Update story timeline consistency",
        "Cross-reference with established canon"
      ],
      'codex': [
        "Design @mention syntax structure",
        "Plan universal search architecture",
        "Define path hierarchy system"
      ],
      'development': [
        "Run type checking and linting",
        "Test new component functionality",
        "Update documentation"
      ]
    };

    return suggestions[topic] || [];
  }

  // Storage Management
  private saveMemoriesToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alfred_memories', JSON.stringify(this.memories));
      localStorage.setItem('alfred_preferences', JSON.stringify(Array.from(this.userPreferences.entries())));
    }
  }

  private loadMemoriesFromStorage(): void {
    if (typeof window !== 'undefined') {
      const memoriesData = localStorage.getItem('alfred_memories');
      if (memoriesData) {
        this.memories = JSON.parse(memoriesData).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }

      const preferencesData = localStorage.getItem('alfred_preferences');
      if (preferencesData) {
        this.userPreferences = new Map(JSON.parse(preferencesData));
      }
    }
  }

  // Public API for clearing memory (with Alfred's concern)
  clearMemories(type?: MemoryEntry['type']): void {
    if (type) {
      this.memories = this.memories.filter(m => m.type !== type);
    } else {
      this.memories = [];
      this.userPreferences.clear();
    }
    this.saveMemoriesToStorage();
  }

  getMemoryStats(): {
    totalMemories: number;
    conversationCount: number;
    preferencesCount: number;
    projectCount: number;
  } {
    return {
      totalMemories: this.memories.length,
      conversationCount: this.memories.filter(m => m.type === 'conversation').length,
      preferencesCount: this.userPreferences.size,
      projectCount: this.projectUpdates.size
    };
  }
}

// Export singleton instance
export const alfredMemory = new AlfredMemory();
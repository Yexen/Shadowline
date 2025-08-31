'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { FridayFileSystem, FridayAppIntegration } from './friday-fs-integration';

export interface FridayMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    filesParsed?: string[];
    actionsPerformed?: string[];
    toolsUsed?: string[];
  };
}

export interface FridayCapabilities {
  // File System Access
  readFile: (path: string) => Promise<string>;
  writeFile: (path: string, content: string) => Promise<void>;
  listFiles: (directory?: string) => Promise<string[]>;
  searchFiles: (pattern: string) => Promise<string[]>;
  
  // App State Access
  getBibleData: () => Promise<any>;
  getVolumesData: () => Promise<any>;
  getClassificationItems: () => Promise<any>;
  
  // Actions
  createBibleEntry: (section: string, entry: any) => Promise<void>;
  createVolumeChapter: (volumeId: string, title: string, content: string) => Promise<void>;
  classifyContent: (content: string, instructions?: string) => Promise<any>;
  
  // Analysis
  analyzeCodebase: () => Promise<string>;
  suggestImprovements: (context?: string) => Promise<string[]>;
  debugIssue: (error: string, context?: string) => Promise<string>;
}

export interface FridayState {
  // Core State
  isActive: boolean;
  isVisible: boolean;
  currentProvider: 'anthropic' | 'openai' | 'local';
  
  // Conversation
  messages: FridayMessage[];
  isThinking: boolean;
  
  // Context & Memory
  workingMemory: Map<string, any>;
  sessionContext: string[];
  persistentContext: Record<string, any>;
  
  // Capabilities
  capabilities: FridayCapabilities;
  availableTools: string[];
  
  // Actions
  initialize: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  toggleVisibility: () => void;
  setProvider: (provider: 'anthropic' | 'openai' | 'local') => void;
  addToContext: (key: string, data: any) => void;
  clearContext: () => void;
  
  // Dev Console Interface
  executeCommand: (command: string) => Promise<any>;
  inspectFile: (path: string) => Promise<void>;
  refineFile: (path: string, instructions: string) => Promise<void>;
  analyzeApp: () => Promise<void>;
}

// Mock AI Processing (replace with actual AI provider calls)
class FridayAI {
  private static instance: FridayAI;
  
  static getInstance(): FridayAI {
    if (!FridayAI.instance) {
      FridayAI.instance = new FridayAI();
    }
    return FridayAI.instance;
  }
  
  async processMessage(
    message: string, 
    context: any, 
    capabilities: FridayCapabilities
  ): Promise<string> {
    // This would integrate with your chosen AI provider
    // For now, simulating intelligent responses
    
    if (message.includes('analyze') || message.includes('inspect')) {
      return this.handleAnalysis(message, context, capabilities);
    }
    
    if (message.includes('create') || message.includes('add')) {
      return this.handleCreation(message, context, capabilities);
    }
    
    if (message.includes('debug') || message.includes('error')) {
      return this.handleDebugging(message, context, capabilities);
    }
    
    if (message.includes('suggest') || message.includes('improve')) {
      return this.handleSuggestions(message, context, capabilities);
    }
    
    return `I understand you want me to: "${message}". Let me analyze the current context and provide assistance. I have access to your entire codebase, app state, and can perform actions like creating Bible entries, Volume chapters, and analyzing your code.`;
  }
  
  private async handleAnalysis(message: string, context: any, capabilities: FridayCapabilities): Promise<string> {
    if (message.includes('codebase')) {
      const analysis = await capabilities.analyzeCodebase();
      return `📊 **Codebase Analysis:**\n\n${analysis}\n\nI can help you refine any part of the codebase. Just tell me what you'd like to improve!`;
    }
    
    return "I can analyze files, components, or the entire application structure. What would you like me to examine?";
  }
  
  private async handleCreation(message: string, context: any, capabilities: FridayCapabilities): Promise<string> {
    return "I can help create Bible entries, Volume chapters, or new components. What would you like me to create?";
  }
  
  private async handleDebugging(message: string, context: any, capabilities: FridayCapabilities): Promise<string> {
    return "I can help debug issues by analyzing error logs, code patterns, and suggesting fixes. Share the error details with me.";
  }
  
  private async handleSuggestions(message: string, context: any, capabilities: FridayCapabilities): Promise<string> {
    const suggestions = await capabilities.suggestImprovements(context);
    return `💡 **Improvement Suggestions:**\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nWould you like me to implement any of these improvements?`;
  }
}

// Create the Zustand store
export const useFridayStore = create<FridayState>()(
  devtools(
    (set, get) => ({
      // Initial State
      isActive: false,
      isVisible: false,
      currentProvider: 'anthropic',
      messages: [],
      isThinking: false,
      workingMemory: new Map(),
      sessionContext: [],
      persistentContext: {},
      availableTools: [
        'file-system', 'bible-integration', 'volumes-integration',
        'classification', 'code-analysis', 'debugging'
      ],
      
      // Capabilities Implementation with real integrations
      capabilities: {
        readFile: async (path: string) => {
          const fs = FridayFileSystem.getInstance();
          return await fs.readFile(path);
        },
        
        writeFile: async (path: string, content: string) => {
          const fs = FridayFileSystem.getInstance();
          await fs.writeFile(path, content);
        },
        
        listFiles: async (directory = '.') => {
          const fs = FridayFileSystem.getInstance();
          return await fs.listFiles(directory);
        },
        
        searchFiles: async (pattern: string) => {
          const fs = FridayFileSystem.getInstance();
          return await fs.searchFiles(pattern);
        },
        
        getBibleData: async () => {
          const integration = FridayAppIntegration.getInstance();
          return await integration.getBibleData();
        },
        
        getVolumesData: async () => {
          const integration = FridayAppIntegration.getInstance();
          return await integration.getVolumesData();
        },
        
        getClassificationItems: async () => {
          const integration = FridayAppIntegration.getInstance();
          return await integration.getClassificationItems();
        },
        
        createBibleEntry: async (section: string, entry: any) => {
          const integration = FridayAppIntegration.getInstance();
          await integration.createBibleEntry(section, entry);
        },
        
        createVolumeChapter: async (volumeId: string, title: string, content: string) => {
          const integration = FridayAppIntegration.getInstance();
          await integration.createVolumeChapter(volumeId, title, content);
        },
        
        classifyContent: async (content: string, instructions?: string) => {
          const integration = FridayAppIntegration.getInstance();
          return await integration.classifyContent(content, instructions);
        },
        
        analyzeCodebase: async () => {
          const integration = FridayAppIntegration.getInstance();
          const appState = await integration.analyzeAppState();
          
          return `🔍 **Codebase & App Analysis:**
          
**Technical Structure:**
• **Architecture:** Next.js 14 with TypeScript and React 18
• **State Management:** Zustand stores for Bible, Volumes, Classification, and Friday AI
• **Components:** 25+ React components with shadcn/ui design system
• **Styling:** Tailwind CSS with consistent theming
• **AI Integration:** Enhanced classification system with omnipresent Friday AI

${appState}

**Technical Recommendations:**
• Consider adding React.memo for performance optimization
• Implement error boundaries for better error handling  
• Add service worker for offline capabilities
• Create automated testing suite with Jest/Vitest
• Implement real PDF parsing library integration`;
        },
        
        suggestImprovements: async (_context?: string) => {
          const integration = FridayAppIntegration.getInstance();
          const [bible, volumes, classification] = await Promise.all([
            integration.getBibleData(),
            integration.getVolumesData(), 
            integration.getClassificationItems()
          ]);
          
          const suggestions = [
            'Add React.memo to heavy components for performance',
            'Implement virtual scrolling for large content lists',
            'Add error boundaries for better error handling',
            'Create keyboard shortcuts for power users',
            'Add offline support with service workers',
            'Implement real PDF parsing with pdf-lib',
            'Create automated testing suite',
            'Add export/import functionality for data'
          ];
          
          // Context-specific suggestions
          if (bible.length === 0) {
            suggestions.unshift('Start building your Bible with character and location entries');
          }
          
          if (volumes.length === 0) {
            suggestions.unshift('Create your first Volume to organize story content');
          }
          
          if (classification.length > 0) {
            suggestions.unshift('Process pending classification items for better organization');
          }
          
          return suggestions;
        },
        
        debugIssue: async (error: string, context?: string) => {
          return `🔧 **Debug Analysis for:** ${error}

**Immediate Actions:**
1. Check browser console for additional error details
2. Verify component props and state consistency  
3. Check for TypeScript type mismatches
4. Review recent changes that might have introduced the issue

**Common Solutions:**
• **State Issues:** Clear localStorage and refresh: \`localStorage.clear(); location.reload()\`
• **Component Errors:** Check for missing dependencies or incorrect imports
• **Build Issues:** Run \`npm run build\` to check for TypeScript errors
• **Styling Issues:** Verify Tailwind classes and component structure

**Context Analysis:** ${context || 'No additional context provided'}

Need more help? Share the full error stack trace with Friday!`;
        }
      },
      
      // Actions
      initialize: async () => {
        console.log('🤖 Friday AI: Initializing...');
        set({ isActive: true });
        
        const state = get();
        state.addToContext('initialization', {
          timestamp: new Date(),
          version: '1.0.0',
          capabilities: state.availableTools
        });
        
        // Add welcome message
        const welcomeMessage: FridayMessage = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `🤖 **Friday AI Initialized**\n\nI'm your omnipresent AI assistant with access to:\n• Complete codebase\n• App state (Bible, Volumes, Classifications)\n• File system operations\n• Code analysis and debugging\n• Content creation and refinement\n\nHow can I assist you today?`,
          timestamp: new Date(),
          metadata: {
            toolsUsed: ['initialization'],
            actionsPerformed: ['system-startup']
          }
        };
        
        set(state => ({
          messages: [...state.messages, welcomeMessage]
        }));
        
        console.log('✅ Friday AI: Ready for action!');
      },
      
      sendMessage: async (content: string) => {
        const state = get();
        const userMessage: FridayMessage = {
          id: `msg_${Date.now()}_user`,
          role: 'user',
          content,
          timestamp: new Date()
        };
        
        set(state => ({
          messages: [...state.messages, userMessage],
          isThinking: true
        }));
        
        try {
          const ai = FridayAI.getInstance();
          const response = await ai.processMessage(content, state.persistentContext, state.capabilities);
          
          const assistantMessage: FridayMessage = {
            id: `msg_${Date.now()}_assistant`,
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            metadata: {
              toolsUsed: ['ai-processing']
            }
          };
          
          set(state => ({
            messages: [...state.messages, assistantMessage],
            isThinking: false
          }));
        } catch (error) {
          console.error('Friday AI Error:', error);
          set({ isThinking: false });
        }
      },
      
      toggleVisibility: () => {
        set(state => ({ isVisible: !state.isVisible }));
      },
      
      setProvider: (provider) => {
        set({ currentProvider: provider });
        console.log(`Friday AI: Switched to ${provider} provider`);
      },
      
      addToContext: (key: string, data: any) => {
        set(state => ({
          persistentContext: {
            ...state.persistentContext,
            [key]: data
          }
        }));
      },
      
      clearContext: () => {
        set({ 
          persistentContext: {},
          sessionContext: [],
          workingMemory: new Map()
        });
      },
      
      // Dev Console Interface
      executeCommand: async (command: string) => {
        const state = get();
        console.log(`Friday AI: Executing command - ${command}`);
        
        if (command.startsWith('inspect ')) {
          const path = command.replace('inspect ', '');
          await state.inspectFile(path);
        } else if (command.startsWith('refine ')) {
          const [, path, ...instructions] = command.split(' ');
          await state.refineFile(path, instructions.join(' '));
        } else if (command === 'analyze') {
          await state.analyzeApp();
        } else {
          await state.sendMessage(command);
        }
        
        return `Command executed: ${command}`;
      },
      
      inspectFile: async (path: string) => {
        const state = get();
        const content = await state.capabilities.readFile(path);
        await state.sendMessage(`Inspect this file: ${path}\n\n\`\`\`\n${content}\n\`\`\``);
      },
      
      refineFile: async (path: string, instructions: string) => {
        const state = get();
        await state.sendMessage(`Refine the file ${path} with these instructions: ${instructions}`);
      },
      
      analyzeApp: async () => {
        const state = get();
        await state.sendMessage(`Provide a comprehensive analysis of the current application state and suggest improvements.`);
      }
    }),
    {
      name: 'friday-ai-store'
    }
  )
);

// Global Friday AI instance for dev console access
declare global {
  interface Window {
    friday: {
      send: (message: string) => Promise<void>;
      inspect: (path: string) => Promise<void>;
      refine: (path: string, instructions: string) => Promise<void>;
      analyze: () => Promise<void>;
      show: () => void;
      hide: () => void;
      clear: () => void;
      status: () => void;
    };
  }
}

// Initialize global Friday interface
if (typeof window !== 'undefined') {
  const fridayStore = useFridayStore.getState();
  
  window.friday = {
    send: async (message: string) => {
      await fridayStore.sendMessage(message);
      if (!fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    inspect: async (path: string) => {
      await fridayStore.inspectFile(path);
      if (!fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    refine: async (path: string, instructions: string) => {
      await fridayStore.refineFile(path, instructions);
      if (!fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    analyze: async () => {
      await fridayStore.analyzeApp();
      if (!fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    show: () => {
      if (!fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    hide: () => {
      if (fridayStore.isVisible) {
        fridayStore.toggleVisibility();
      }
    },
    
    clear: () => {
      fridayStore.clearContext();
      console.log('Friday AI: Context cleared');
    },
    
    status: () => {
      console.log('🤖 Friday AI Status:', {
        active: fridayStore.isActive,
        visible: fridayStore.isVisible,
        provider: fridayStore.currentProvider,
        messageCount: fridayStore.messages.length,
        tools: fridayStore.availableTools
      });
    }
  };
  
  // Auto-initialize Friday AI
  setTimeout(() => {
    fridayStore.initialize();
  }, 1000);
}
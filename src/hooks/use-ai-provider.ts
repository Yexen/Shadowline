'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AiProvider = 'openai' | 'claude' | 'gemini' | 'all';

interface AiProviderState {
  // Provider selection
  selectedProvider: AiProvider;
  setSelectedProvider: (provider: AiProvider) => void;
  
  // API keys
  openAiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
  setOpenAiApiKey: (key: string) => void;
  setClaudeApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  
  // Helper to get current API key
  getCurrentApiKey: () => string;
  
  isLoaded: boolean;
}

export const useAiProvider = create<AiProviderState>()(
  persist(
    (set, get) => ({
      // Default to OpenAI
      selectedProvider: 'openai',
      setSelectedProvider: (provider) => set({ selectedProvider: provider }),
      
      // API keys
      openAiApiKey: '',
      claudeApiKey: '',
      geminiApiKey: '',
      setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
      setClaudeApiKey: (key) => set({ claudeApiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      
      // Helper to get current key based on selected provider
      getCurrentApiKey: () => {
        const state = get();
        switch (state.selectedProvider) {
          case 'openai': return state.openAiApiKey;
          case 'claude': return state.claudeApiKey;
          case 'gemini': return state.geminiApiKey;
          case 'all': return ''; // Will use all keys when needed
          default: return '';
        }
      },
      
      isLoaded: false,
    }),
    {
      name: 'gotham-ai-provider-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state: AiProviderState | null) => {
        if (state) {
            state.isLoaded = true;
        }
      },
    }
  )
);

// Mark as loaded on initial client-side mount
if (typeof window !== 'undefined') {
    useAiProvider.setState({ isLoaded: true });
}

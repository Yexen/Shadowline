
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type AiProvider = 'gemini' | 'openai';

interface AiProviderState {
  provider: AiProvider;
  openAiApiKey: string;
  isLoaded: boolean;
  setProvider: (provider: AiProvider) => void;
  setOpenAiApiKey: (key: string) => void;
}

export const useAiProvider = create<AiProviderState>()(
  persist(
    (set) => ({
      provider: 'gemini',
      openAiApiKey: '',
      isLoaded: false,
      setProvider: (provider) => set({ provider }),
      setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
    }),
    {
      name: 'gotham-ai-provider-settings',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.isLoaded = true;
        }
      },
    }
  )
);

// Mark as loaded on initial client-side mount
useAiProvider.setState({ isLoaded: true });

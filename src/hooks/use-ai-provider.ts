'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AiProviderState {
  openAiApiKey: string;
  isLoaded: boolean;
  setOpenAiApiKey: (key: string) => void;
}

export const useAiProvider = create<AiProviderState>()(
  persist(
    (set) => ({
      openAiApiKey: '',
      isLoaded: false,
      setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
    }),
    {
      name: 'gotham-ai-provider-storage',
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

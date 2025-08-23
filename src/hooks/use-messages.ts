'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useWriters } from './use-writers';

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Thread {
  id: string;
  participants: string[]; // array of writer IDs
  messages: Message[];
  lastUpdated: string;
}

interface MessagesState {
  threads: Thread[];
  isLoaded: boolean;
  sendMessage: (content: string, recipientIds: string[]) => void;
  deleteThread: (threadId: string) => void;
}

const getThreadId = (participants: string[]) => {
    return [...participants].sort().join('-');
};

export const useMessages = create<MessagesState>()(
  persist(
    (set, get) => ({
      threads: [],
      isLoaded: false,
      sendMessage: (content, recipientIds) => {
        const activeWriterId = useWriters.getState().activeWriter?.id;
        if (!activeWriterId) {
            console.error("No active writer found. Cannot send message.");
            return;
        }

        const participants = [activeWriterId, ...recipientIds];
        const threadId = getThreadId(participants);

        const newMessage: Message = {
            id: `msg-${Date.now()}`,
            senderId: activeWriterId,
            content,
            timestamp: new Date().toISOString(),
        };

        const existingThreads = get().threads;
        const threadIndex = existingThreads.findIndex(t => t.id === threadId);

        let newThreads: Thread[];

        if (threadIndex > -1) {
            // Update existing thread
            newThreads = existingThreads.map((thread, index) => {
                if (index === threadIndex) {
                    return {
                        ...thread,
                        messages: [...thread.messages, newMessage],
                        lastUpdated: new Date().toISOString(),
                    };
                }
                return thread;
            });
        } else {
            // Create new thread
            const newThread: Thread = {
                id: threadId,
                participants,
                messages: [newMessage],
                lastUpdated: new Date().toISOString(),
            };
            newThreads = [newThread, ...existingThreads];
        }
        
        // Sort threads by most recently updated
        newThreads.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        set({ threads: newThreads });
      },
      deleteThread: (threadId) => {
        set({ threads: get().threads.filter(t => t.id !== threadId) });
      },
    }),
    {
      name: 'gotham-messages-storage',
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
useMessages.setState({ isLoaded: true });

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CouncilMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
  tokensUsed?: number;
  participants?: Array<{
    participant: string;
    content: string;
    model: string;
    tokensUsed?: number;
  }>;
  mode?: 'discussion' | 'collaborative';
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

export interface CouncilSession {
  id: string;
  title: string;
  messages: CouncilMessage[];
  createdAt: Date;
  updatedAt: Date;
  discussionMode: 'discussion' | 'collaborative';
}

interface CouncilSessionsState {
  sessions: CouncilSession[];
  currentSessionId: string | null;
  isLoaded: boolean;
  
  // Session management
  createSession: (title?: string) => string;
  deleteSession: (sessionId: string) => void;
  setCurrentSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  
  // Message management
  addMessage: (sessionId: string, message: Omit<CouncilMessage, 'id' | 'timestamp'>) => void;
  clearSession: (sessionId: string) => void;
  
  // Getters
  getCurrentSession: () => CouncilSession | null;
  getSession: (sessionId: string) => CouncilSession | null;
}

export const useCouncilSessions = create<CouncilSessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoaded: false,

      createSession: (title) => {
        const sessionId = `session_${Date.now()}`;
        const newSession: CouncilSession = {
          id: sessionId,
          title: title || `Council Session ${new Date().toLocaleDateString()}`,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          discussionMode: 'discussion'
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: sessionId
        }));
        
        return sessionId;
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        }));
      },

      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },

      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId 
              ? { ...session, title, updatedAt: new Date() }
              : session
          )
        }));
      },

      addMessage: (sessionId, messageData) => {
        const message: CouncilMessage = {
          ...messageData,
          id: `msg_${Date.now()}`,
          timestamp: new Date()
        };
        
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { 
                  ...session, 
                  messages: [...session.messages, message],
                  updatedAt: new Date()
                }
              : session
          )
        }));
      },

      clearSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId 
              ? { ...session, messages: [], updatedAt: new Date() }
              : session
          )
        }));
      },

      getCurrentSession: () => {
        const state = get();
        return state.sessions.find(s => s.id === state.currentSessionId) || null;
      },

      getSession: (sessionId) => {
        const state = get();
        return state.sessions.find(s => s.id === sessionId) || null;
      }
    }),
    {
      name: 'gotham-council-sessions-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state: CouncilSessionsState | null) => {
        if (state) {
          // Convert date strings back to Date objects
          state.sessions = state.sessions.map(session => ({
            ...session,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt),
            messages: session.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }));
          state.isLoaded = true;
        }
      },
    }
  )
);

// Mark as loaded on initial client-side mount
if (typeof window !== 'undefined') {
  useCouncilSessions.setState({ isLoaded: true });
}
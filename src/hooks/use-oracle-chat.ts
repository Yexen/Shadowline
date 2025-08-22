
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ChatMessage as OracleChatMessage } from '@/ai/types';

export interface OracleChatSession {
  id: string;
  name: string;
  timestamp: Date;
  messages: OracleChatMessage[];
}

const ORACLE_CHAT_STORAGE_KEY = 'gotham-oracle-chat-history';

export function useOracleChat() {
  const [savedSessions, setSavedSessions] = useState<OracleChatSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ORACLE_CHAT_STORAGE_KEY);
      if (storedData) {
        const parsedData: OracleChatSession[] = JSON.parse(storedData).map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp)
        }));
        setSavedSessions(parsedData);
      }
    } catch (error) {
      console.error("Failed to load oracle chat history from localStorage", error);
      setSavedSessions([]);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: OracleChatSession[]) => {
    try {
      // Sort by most recent first
      const sortedData = newData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(ORACLE_CHAT_STORAGE_KEY, JSON.stringify(sortedData));
      setSavedSessions(sortedData);
    } catch (error) {
      console.error("Failed to save oracle chat history", error);
    }
  }, []);

  const saveSession = (session: OracleChatSession) => {
    saveData([session, ...savedSessions]);
  };
  
  const deleteSession = (sessionId: string) => {
    const newSessions = savedSessions.filter(s => s.id !== sessionId);
    saveData(newSessions);
  };

  return { isLoaded, savedSessions, saveSession, deleteSession };
}

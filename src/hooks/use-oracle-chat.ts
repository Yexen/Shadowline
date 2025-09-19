
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSessions, setFilteredSessions] = useState<OracleChatSession[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ORACLE_CHAT_STORAGE_KEY);
      if (storedData) {
        const parsedData: OracleChatSession[] = JSON.parse(storedData).map((s: any) => ({
            ...s,
            timestamp: new Date(s.timestamp)
        }));
        setSavedSessions(parsedData);
        setFilteredSessions(parsedData);
      }
    } catch (error) {
      console.error("Failed to load oracle chat history from localStorage", error);
      setSavedSessions([]);
      setFilteredSessions([]);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSessions(savedSessions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = savedSessions.filter(session => {
      // Search in session name
      if (session.name.toLowerCase().includes(query)) return true;

      // Search in message content
      return session.messages.some(message =>
        message.content.toLowerCase().includes(query)
      );
    });

    setFilteredSessions(filtered);
  }, [searchQuery, savedSessions]);

  const saveData = useCallback((newData: OracleChatSession[]) => {
    try {
      // Sort by most recent first
      const sortedData = newData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(ORACLE_CHAT_STORAGE_KEY, JSON.stringify(sortedData));
      setSavedSessions(sortedData);
      setFilteredSessions(sortedData);
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

  const searchSessions = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    isLoaded,
    savedSessions,
    filteredSessions,
    searchQuery,
    saveSession,
    deleteSession,
    searchSessions,
    clearSearch
  };
}

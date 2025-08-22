
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Source {
  id: string;
  title: string;
  url: string;
}

const SOURCES_STORAGE_KEY = 'gotham-sources-list';

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(SOURCES_STORAGE_KEY);
      if (storedData) {
        setSources(JSON.parse(storedData));
      } else {
        setSources([]);
      }
    } catch (error) {
      console.error("Failed to access localStorage for sources", error);
      setSources([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: Source[]) => {
    try {
      localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(newData));
      setSources(newData);
    } catch (error) {
      console.error("Failed to save sources to localStorage", error);
    }
  }, []);

  const addSource = (title: string, url: string) => {
    const newSource: Source = {
      id: `source-${Date.now()}`,
      title,
      url,
    };
    saveData([...sources, newSource]);
  };

  const updateSource = (id: string, updates: Partial<Omit<Source, 'id'>>) => {
    const newSources = sources.map(source =>
      source.id === id ? { ...source, ...updates } : source
    );
    saveData(newSources);
  };

  const deleteSource = (id: string) => {
    const newSources = sources.filter(source => source.id !== id);
    saveData(newSources);
  };

  return { isLoaded, sources, addSource, updateSource, deleteSource };
}


'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface Draft {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
}

const DRAFTS_STORAGE_KEY = 'gotham-drafts';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        // Make sure dates are correctly parsed
        const draftsWithDates = parsedData.map((d: any) => ({ ...d, lastModified: new Date(d.lastModified) }));
        setDrafts(draftsWithDates);
      } else {
        setDrafts([]);
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse drafts data", error);
      setDrafts([]);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: Draft[]) => {
    try {
      const sortedData = newData.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(sortedData));
      setDrafts(sortedData);
    } catch (error) {
      console.error("Failed to save drafts data to localStorage", error);
    }
  }, []);

  const addDraft = (title: string, content: string): string => {
    const newDraft: Draft = {
      id: `draft-${Date.now()}`,
      title,
      content,
      lastModified: new Date(),
    };
    saveData([...drafts, newDraft]);
    return newDraft.id;
  };
  
  const updateDraft = (id: string, title: string, content: string) => {
    const newDrafts = drafts.map(draft => 
      draft.id === id 
        ? { ...draft, title, content, lastModified: new Date() } 
        : draft
    );
    saveData(newDrafts);
  };
  
  const deleteDraft = (id: string) => {
    const newDrafts = drafts.filter(draft => draft.id !== id);
    saveData(newDrafts);
  };

  const getDraft = useCallback((id: string) => {
    return drafts.find(draft => draft.id === id);
  }, [drafts]);

  return { isLoaded, drafts, addDraft, updateDraft, deleteDraft, getDraft };
}



'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface ResourcePage {
  id: string;
  title: string;
  content: string;
}

export interface Volume {
  id: string;
  title: string;
  chapters: Chapter[];
  overview?: string;
  resources?: ResourcePage[];
}

const VOLUMES_STORAGE_KEY = 'gotham-volumes-data';

const defaultVolumes: Volume[] = [{
    id: `volume-1`,
    title: `My First Volume`,
    chapters: [],
    overview: 'This is the first volume of the story.',
    resources: [],
}];

export function useVolumes() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(VOLUMES_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
            setVolumes(parsedData);
        } else {
            setVolumes(defaultVolumes);
            localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(defaultVolumes));
        }
      } else {
        setVolumes(defaultVolumes);
        localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(defaultVolumes));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse volumes data", error);
      setVolumes(defaultVolumes);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: Volume[]) => {
    try {
      localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(newData));
      setVolumes(newData);
    } catch (error) {
      console.error("Failed to save volumes data to localStorage", error);
    }
  }, []);

  const addVolume = (title: string, newId: string) => {
    const newVolume: Volume = {
      id: newId,
      title: title,
      chapters: [],
      overview: '',
      resources: [],
    };
    saveData([...volumes, newVolume]);
  };

  const updateVolume = (volumeId: string, updatedVolume: Partial<Volume>) => {
    const newVolumes = volumes.map(v => v.id === volumeId ? { ...v, ...updatedVolume } : v);
    saveData(newVolumes);
  }

  const deleteVolume = (volumeId: string) => {
    if (volumes.length <= 1) return; // Can't delete the last volume
    const newVolumes = volumes.filter(v => v.id !== volumeId);
    saveData(newVolumes);
  }
  
  const addChapter = (volumeId: string, chapterTitle: string, chapterContent: string) => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: chapterTitle,
      content: chapterContent,
    };
    const newVolumes = volumes.map(v => {
        if (v.id === volumeId) {
            return { ...v, chapters: [...v.chapters, newChapter] };
        }
        return v;
    });
    saveData(newVolumes);
  };

  const updateChapter = (volumeId: string, chapterId: string, newTitle: string, newContent: string) => {
    const newVolumes = volumes.map(v => {
        if (v.id === volumeId) {
            const newChapters = v.chapters.map(c => 
                c.id === chapterId ? { ...c, title: newTitle, content: newContent } : c
            );
            return { ...v, chapters: newChapters };
        }
        return v;
    });
    saveData(newVolumes);
  };

  const deleteChapter = (volumeId: string, chapterId: string) => {
      const newVolumes = volumes.map(v => {
          if (v.id === volumeId) {
              return { ...v, chapters: v.chapters.filter(c => c.id !== chapterId) };
          }
          return v;
      });
      saveData(newVolumes);
  };

  return { isLoaded, volumes, addVolume, updateVolume, deleteVolume, addChapter, updateChapter, deleteChapter };
}

    
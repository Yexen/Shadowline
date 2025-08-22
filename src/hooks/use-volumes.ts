
'use client';

import { useState, useEffect, useCallback } from 'react';

export type ChapterStatus = 'draft' | 'review' | 'final';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  status: ChapterStatus;
}

export interface ResourcePage {
    id: string;
    title: string;
    content: string;
}

export interface Volume {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
  resources?: ResourcePage[];
}

const VOLUMES_STORAGE_KEY = 'gotham-volumes-data';

const defaultVolumesData: Volume[] = [
  {
    id: 'volume-1',
    title: 'The Court of Owls',
    description: 'A secretive cabal that has controlled Gotham for centuries emerges from the shadows.',
    chapters: [
      { id: 'chapter-1-1', title: 'Whispers in the Walls', content: 'Bruce Wayne dismisses the Court of Owls as a myth...', status: 'final' },
      { id: 'chapter-1-2', title: 'The Talon Strikes', content: 'A deadly assassin known as the Talon attacks Bruce Wayne...', status: 'review' },
      { id: 'chapter-1-3', title: 'The Labyrinth', content: 'Trapped and drugged, Batman must navigate the Court\'s maze...', status: 'draft' },
    ],
    resources: [
        { id: 'res-1-1', title: 'Court of Owls History', content: 'Founded in the 17th century...' },
        { id: 'res-1-2', title: 'Talon Assassins', content: 'Undead warriors, highly skilled...' },
    ]
  },
   {
    id: 'volume-2',
    title: 'City of Bane',
    description: 'Bane takes control of Gotham City, forcing Batman into exile.',
    chapters: [
       { id: 'chapter-2-1', title: 'The Fall of Gotham', content: '...', status: 'draft' },
    ],
    resources: []
  },
];

export function useVolumes() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(VOLUMES_STORAGE_KEY);
      if (storedData) {
        setVolumes(JSON.parse(storedData));
      } else {
        setVolumes(defaultVolumesData);
        localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(defaultVolumesData));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse volumes data", error);
      setVolumes(defaultVolumesData);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newVolumes: Volume[]) => {
    try {
      localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(newVolumes));
      setVolumes(newVolumes);
    } catch (error) {
      console.error("Failed to save volumes data to localStorage", error);
    }
  }, []);

  const addVolume = (title: string, description: string) => {
    const newVolume: Volume = {
      id: `volume-${Date.now()}`,
      title,
      description,
      chapters: [],
      resources: [],
    };
    saveData([...volumes, newVolume]);
  };

  const updateVolume = (volumeId: string, title: string, description: string) => {
    const newVolumes = volumes.map(v => 
      v.id === volumeId ? { ...v, title, description } : v
    );
    saveData(newVolumes);
  };
  
  const deleteVolume = (volumeId: string) => {
    const newVolumes = volumes.filter(v => v.id !== volumeId);
    saveData(newVolumes);
  };

  const addChapterToVolume = (volumeId: string, chapter: Chapter) => {
    const newVolumes = volumes.map(v => {
      if (v.id === volumeId) {
        // Avoid adding duplicate chapters
        if (v.chapters.some(c => c.id === chapter.id)) {
            return v;
        }
        return { ...v, chapters: [...v.chapters, chapter] };
      }
      return v;
    });
    saveData(newVolumes);
  };

  const getChapter = useCallback((volumeId: string, chapterId: string) => {
    const volume = volumes.find(v => v.id === volumeId);
    return volume?.chapters.find(c => c.id === chapterId);
  }, [volumes]);

  const updateChapter = (volumeId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id'>>) => {
    const newVolumes = volumes.map(v => {
      if (v.id === volumeId) {
        const newChapters = v.chapters.map(c => 
          c.id === chapterId ? { ...c, ...updates } : c
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

  return { isLoaded, volumes, addVolume, updateVolume, deleteVolume, addChapterToVolume, getChapter, updateChapter, deleteChapter };
}

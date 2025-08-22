
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface VolumeResource {
    id: string;
    title: string;
    url: string;
}

export interface Volume {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  chapters: Chapter[];
  overview?: string;
  resources?: VolumeResource[];
}

const VOLUMES_STORAGE_KEY = 'gotham-volumes-data';

const defaultVolumes: Volume[] = [
    {
        id: 'vol-1',
        title: 'The Long Halloween',
        description: 'A year-long mystery involving a serial killer who strikes on holidays.',
        coverImage: 'https://placehold.co/600x800.png',
        chapters: [
            { id: 'chap-1-1', title: 'Halloween', content: 'The first murder occurs...' },
            { id: 'chap-1-2', title: 'Thanksgiving', content: 'The second victim is found...' },
        ],
        overview: 'A detailed plot outline focusing on the main story beats and character arcs.',
        resources: [
            { id: 'res-1-1', title: 'Holiday Calendar', url: 'https://example.com/holidays' },
            { id: 'res-1-2', title: 'Falcone Crime Family Tree', url: 'https://example.com/falcone' },
        ]
    },
    {
        id: 'vol-2',
        title: 'The Killing Joke',
        description: 'An exploration of the Joker\'s origin and his attempt to drive Commissioner Gordon insane.',
        coverImage: 'https://placehold.co/600x800.png',
        chapters: [],
        overview: 'Focuses on the psychological dualism between Batman and Joker.',
        resources: []
    }
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
        setVolumes(defaultVolumes);
        localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(defaultVolumes));
      }
    } catch (error) {
      console.error("Failed to access localStorage for volumes", error);
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
      console.error("Failed to save volumes to localStorage", error);
    }
  }, []);

  const addVolume = () => {
    const newVolume: Volume = {
      id: `vol-${Date.now()}`,
      title: 'New Volume',
      description: '',
      coverImage: 'https://placehold.co/600x800.png',
      chapters: [],
      overview: '',
      resources: [],
    };
    saveData([...volumes, newVolume]);
  };

  const updateVolume = (updatedVolume: Volume) => {
    const newVolumes = volumes.map(v => v.id === updatedVolume.id ? updatedVolume : v);
    saveData(newVolumes);
  };
  
  const deleteVolume = (volumeId: string) => {
    const newVolumes = volumes.filter(v => v.id !== volumeId);
    saveData(newVolumes);
  };

  const addChapterToVolume = (volumeId: string, title?: string, content?: string) => {
    const newChapter: Chapter = { 
        id: `chap-${Date.now()}`, 
        title: title || "New Chapter", 
        content: content || "" 
    };
    const newVolumes = volumes.map(v => {
      if (v.id === volumeId) {
        return { ...v, chapters: [...v.chapters, newChapter] };
      }
      return v;
    });
    saveData(newVolumes);
  };

  const updateChapter = (volumeId: string, chapterId: string, updates: Partial<Omit<Chapter, 'id'>>) => {
    const newVolumes = volumes.map(v => {
      if (v.id === volumeId) {
        const newChapters = v.chapters.map(c => c.id === chapterId ? { ...c, ...updates } : c);
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

  const updateVolumeOverview = (volumeId: string, overview: string) => {
    const newVolumes = volumes.map(v => v.id === volumeId ? { ...v, overview } : v);
    saveData(newVolumes);
  };
  
  const updateVolumeResources = (volumeId: string, resources: VolumeResource[]) => {
    const newVolumes = volumes.map(v => v.id === volumeId ? { ...v, resources } : v);
    saveData(newVolumes);
  };

  const getChapter = useCallback((volumeId: string, chapterId: string) => {
    const volume = volumes.find(v => v.id === volumeId);
    return volume?.chapters.find(c => c.id === chapterId);
  }, [volumes]);

  return { 
    isLoaded, 
    volumes, 
    addVolume, 
    updateVolume, 
    deleteVolume, 
    addChapterToVolume,
    updateChapter, 
    deleteChapter,
    getChapter,
    updateVolumeOverview,
    updateVolumeResources
  };
}

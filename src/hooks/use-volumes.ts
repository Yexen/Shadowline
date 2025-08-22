
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
  imageUrl?: string;
  chapters: Chapter[];
  overview?: string;
  resources?: ResourcePage[];
}

const VOLUMES_STORAGE_KEY = 'gotham-volumes-data';

const defaultVolumesData: Volume[] = Array.from({ length: 6 }, (_, i) => ({
    id: `volume-${i + 1}`,
    title: `Volume ${["I", "II", "III", "IV", "V", "VI"][i]}`,
    description: `An overarching story arc, yet to be written.`,
    imageUrl: '',
    chapters: [],
    overview: '',
    resources: []
}));


export function useVolumes() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(VOLUMES_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        // Ensure at least 6 volumes exist for the UI and they have the new fields
        if (parsed.length < 6 || !('overview' in parsed[0])) {
          const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];
          const updated = Array.from({ length: 6 }, (_, i) => {
             const existing = parsed.find((v: Volume) => v.id === `volume-${i + 1}`);
             return {
                 ...defaultVolumesData[i],
                 ...existing,
                 title: `Volume ${romanNumerals[i]}`, // Ensure title is correct
                 overview: existing?.overview || '',
                 resources: existing?.resources || []
             };
          });
          setVolumes(updated);
          localStorage.setItem(VOLUMES_STORAGE_KEY, JSON.stringify(updated));
        } else {
           setVolumes(parsed);
        }
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

  const addVolume = (title: string, description: string, imageUrl?: string) => {
    const newVolume: Volume = {
      id: `volume-${Date.now()}`,
      title,
      description,
      imageUrl,
      chapters: [],
      overview: '',
      resources: [],
    };
    saveData([...volumes, newVolume]);
  };

  const updateVolume = (volumeId: string, updates: Partial<Omit<Volume, 'id'>>) => {
    const newVolumes = volumes.map(v => 
      v.id === volumeId ? { ...v, ...updates } : v
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

  const updateVolumeOverview = (volumeId: string, overview: string) => {
    const newVolumes = volumes.map(v => (v.id === volumeId ? { ...v, overview } : v));
    saveData(newVolumes);
  };

  const addResourceToVolume = (volumeId: string, resource: ResourcePage) => {
      const newVolumes = volumes.map(v => {
          if (v.id === volumeId) {
              const resources = v.resources ? [...v.resources, resource] : [resource];
              return { ...v, resources };
          }
          return v;
      });
      saveData(newVolumes);
  };

  const updateResource = (volumeId: string, resource: ResourcePage) => {
      const newVolumes = volumes.map(v => {
          if (v.id === volumeId) {
              const resources = v.resources?.map(r => (r.id === resource.id ? resource : r));
              return { ...v, resources };
          }
          return v;
      });
      saveData(newVolumes);
  };
  
  const deleteResource = (volumeId: string, resourceId: string) => {
      const newVolumes = volumes.map(v => {
          if (v.id === volumeId) {
              const resources = v.resources?.filter(r => r.id !== resourceId);
              return { ...v, resources };
          }
          return v;
      });
      saveData(newVolumes);
  };

  return { isLoaded, volumes, addVolume, updateVolume, deleteVolume, addChapterToVolume, getChapter, updateChapter, deleteChapter, updateVolumeOverview, addResourceToVolume, updateResource, deleteResource };
}

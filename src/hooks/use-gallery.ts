
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  dataAiHint: string;
}

export interface GalleryFolder {
  id: string;
  name: string;
  items: GalleryItem[];
}

const GALLERY_STORAGE_KEY = 'gotham-gallery-data';

const defaultGalleryData: GalleryFolder[] = [
    {
        id: 'folder-1',
        name: 'Concept Art',
        items: [
            { id: 'img-1', type: 'image', url: 'https://placehold.co/600x400.png', caption: 'Early Batmobile Design', dataAiHint: 'concept car sketch'},
            { id: 'img-2', type: 'image', url: 'https://placehold.co/600x400.png', caption: 'Gotham City Rooftops', dataAiHint: 'gothic rooftops night'},
            { id: 'img-3', type: 'image', url: 'https://placehold.co/600x400.png', caption: 'Character sketch: Penguin', dataAiHint: 'villain character design'},
        ]
    },
    {
        id: 'folder-ai',
        name: 'AI Generated',
        items: []
    }
];

export function useGallery() {
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (storedData) {
        // Simple migration: if old data has no 'type', assume 'image'
        const parsed = JSON.parse(storedData);
        const migrated = parsed.map((folder: any) => ({
            ...folder,
            images: folder.images?.map((img: any) => ({ ...img, type: img.type || 'image' })) || [],
            items: folder.items?.map((item: any) => ({ ...item, type: item.type || 'image' })) || folder.images?.map((img: any) => ({ ...img, type: img.type || 'image' })) || [],
        }));
        setFolders(migrated);
      } else {
        setFolders(defaultGalleryData);
        localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(defaultGalleryData));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse gallery data", error);
      setFolders(defaultGalleryData);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newFolders: GalleryFolder[]) => {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(newFolders));
      setFolders(newFolders);
    } catch (error) {
      console.error("Failed to save gallery data to localStorage", error);
    }
  }, []);

  const addFolder = (name: string) => {
    if (folders.find(f => f.name === name)) return;
    const newFolder: GalleryFolder = {
      id: `folder-${Date.now()}`,
      name,
      items: [],
    };
    saveData([...folders, newFolder]);
  };

  const updateFolder = (folderId: string, newName: string) => {
    const newFolders = folders.map(f => f.id === folderId ? { ...f, name: newName } : f);
    saveData(newFolders);
  }

  const deleteFolder = (folderId: string) => {
    const newFolders = folders.filter(f => f.id !== folderId);
    saveData(newFolders);
  }

  const addItemToFolder = (folderId: string, type: 'image' | 'video', url: string, caption: string, dataAiHint: string) => {
    const newItem: GalleryItem = {
      id: `item-${Date.now()}`,
      type,
      url,
      caption,
      dataAiHint
    };
    const newFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, items: [...folder.items, newItem] };
      }
      return folder;
    });
    saveData(newFolders);
  };

  const updateItem = (folderId: string, itemId: string, newUrl: string, newCaption: string, newDataAiHint: string, newType: 'image' | 'video') => {
    const newFolders = folders.map(folder => {
        if (folder.id === folderId) {
            const newItems = folder.items.map(item => 
                item.id === itemId ? { ...item, url: newUrl, caption: newCaption, dataAiHint: newDataAiHint, type: newType } : item
            );
            return { ...folder, items: newItems };
        }
        return folder;
    });
    saveData(newFolders);
  };

  const deleteItem = (folderId: string, itemId: string) => {
    const newFolders = folders.map(folder => {
        if (folder.id === folderId) {
            return { ...folder, items: folder.items.filter(item => item.id !== itemId) };
        }
        return folder;
    });
    saveData(newFolders);
  };


  return { isLoaded, folders, addFolder, addItemToFolder, updateItem, deleteItem, updateFolder, deleteFolder };
}

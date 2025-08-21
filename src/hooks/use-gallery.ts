
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  dataAiHint: string;
}

export interface GalleryFolder {
  id: string;
  name: string;
  images: GalleryImage[];
}

const GALLERY_STORAGE_KEY = 'gotham-gallery-data';

const defaultGalleryData: GalleryFolder[] = [
    {
        id: 'folder-1',
        name: 'Concept Art',
        images: [
            { id: 'img-1', url: 'https://placehold.co/600x400.png', caption: 'Early Batmobile Design', dataAiHint: 'concept car sketch'},
            { id: 'img-2', url: 'https://placehold.co/600x400.png', caption: 'Gotham City Rooftops', dataAiHint: 'gothic rooftops night'},
            { id: 'img-3', url: 'https://placehold.co/600x400.png', caption: 'Character sketch: Penguin', dataAiHint: 'villain character design'},
        ]
    }
];

export function useGallery() {
  const [folders, setFolders] = useState<GalleryFolder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (storedData) {
        setFolders(JSON.parse(storedData));
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
      images: [],
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

  const addImageToFolder = (folderId: string, url: string, caption: string, dataAiHint: string) => {
    const newImage: GalleryImage = {
      id: `img-${Date.now()}`,
      url,
      caption,
      dataAiHint
    };
    const newFolders = folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, images: [...folder.images, newImage] };
      }
      return folder;
    });
    saveData(newFolders);
  };

  const updateImage = (folderId: string, imageId: string, newUrl: string, newCaption: string, newDataAiHint: string) => {
    const newFolders = folders.map(folder => {
        if (folder.id === folderId) {
            const newImages = folder.images.map(img => 
                img.id === imageId ? { ...img, url: newUrl, caption: newCaption, dataAiHint: newDataAiHint } : img
            );
            return { ...folder, images: newImages };
        }
        return folder;
    });
    saveData(newFolders);
  };

  const deleteImage = (folderId: string, imageId: string) => {
    const newFolders = folders.map(folder => {
        if (folder.id === folderId) {
            return { ...folder, images: folder.images.filter(img => img.id !== imageId) };
        }
        return folder;
    });
    saveData(newFolders);
  };


  return { isLoaded, folders, addFolder, addImageToFolder, updateImage, deleteImage, updateFolder, deleteFolder };
}

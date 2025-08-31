'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ClassificationItem {
  id: string;
  name: string;
  type: 'file' | 'text' | 'image' | 'video';
  content?: string;
  preview?: string;
  size?: number;
  source?: string;
  status: 'pending' | 'classifying' | 'classified' | 'rejected';
  classification?: {
    category: 'bible' | 'volumes';
    confidence: number;
    reasoning: string;
    suggestedTags?: string[];
  };
  file?: File;
  originalPath?: string; // For items moved from other sections
}

interface ClassificationState {
  items: ClassificationItem[];
  isLoaded: boolean;
}

const CLASSIFICATION_STORAGE_KEY = 'gotham-classification-data';

export function useClassification() {
  const [items, setItems] = useState<ClassificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(CLASSIFICATION_STORAGE_KEY);
      if (storedData) {
        const parsed: ClassificationItem[] = JSON.parse(storedData);
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load classification data:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever items change
  const saveData = useCallback((newItems: ClassificationItem[]) => {
    try {
      localStorage.setItem(CLASSIFICATION_STORAGE_KEY, JSON.stringify(newItems));
      setItems(newItems);
    } catch (error) {
      console.error("Failed to save classification data:", error);
    }
  }, []);

  // Add item to classification queue
  const addItem = useCallback((item: Omit<ClassificationItem, 'id'>) => {
    const newItem: ClassificationItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    saveData([...items, newItem]);
    return newItem.id;
  }, [items, saveData]);

  // Add multiple items at once
  const addItems = useCallback((newItems: Omit<ClassificationItem, 'id'>[]) => {
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    saveData([...items, ...itemsWithIds]);
    return itemsWithIds.map(item => item.id);
  }, [items, saveData]);

  // Update item
  const updateItem = useCallback((itemId: string, updates: Partial<ClassificationItem>) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    saveData(newItems);
  }, [items, saveData]);

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    const newItems = items.filter(item => item.id !== itemId);
    saveData(newItems);
  }, [items, saveData]);

  // Import from gallery
  const importFromGallery = useCallback((galleryItems: any[]) => {
    const classificationItems: Omit<ClassificationItem, 'id'>[] = galleryItems.map(item => ({
      name: item.caption || item.name || 'Untitled',
      type: item.type === 'video' ? 'video' : 'image',
      preview: item.url,
      source: 'gallery',
      status: 'pending',
      originalPath: item.url
    }));

    return addItems(classificationItems);
  }, [addItems]);

  // Import from notes/organization
  const importFromNotes = useCallback((notes: any[]) => {
    const classificationItems: Omit<ClassificationItem, 'id'>[] = notes.map(note => ({
      name: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : ''),
      type: 'text',
      content: note.text,
      source: 'notes',
      status: 'pending'
    }));

    return addItems(classificationItems);
  }, [addItems]);

  // Import from batcave archive
  const importFromBatcave = useCallback((documents: any[]) => {
    const classificationItems: Omit<ClassificationItem, 'id'>[] = documents.map(doc => ({
      name: doc.title || 'Untitled Document',
      type: 'text',
      content: doc.content,
      source: 'batcave-archive',
      status: 'pending'
    }));

    return addItems(classificationItems);
  }, [addItems]);

  // Classify item (simulate AI classification)
  const classifyItem = useCallback(async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.status !== 'pending') return;

    // Set to classifying
    updateItem(itemId, { status: 'classifying' });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Simple classification logic (in real app, this would call an AI service)
    const content = item.content || item.name || '';
    const lowerContent = content.toLowerCase();
    
    const bibleKeywords = [
      'lore', 'world', 'character', 'bible', 'backstory', 'history',
      'mythology', 'legend', 'origin', 'background', 'reference',
      'gotham', 'batman', 'wayne', 'arkham', 'villain', 'hero'
    ];
    
    const volumeKeywords = [
      'story', 'chapter', 'narrative', 'plot', 'scene', 'dialogue',
      'action', 'adventure', 'mystery', 'crime', 'investigation',
      'fight', 'chase', 'confrontation', 'resolution'
    ];

    const bibleScore = bibleKeywords.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0);
    const volumeScore = volumeKeywords.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0);

    const isBibleContent = bibleScore > volumeScore || 
                          (bibleScore === volumeScore && item.source === 'batcave-archive');

    const confidence = Math.min(95, Math.max(65, 
      ((Math.max(bibleScore, volumeScore) / Math.max(bibleKeywords.length, volumeKeywords.length)) * 100) + 
      Math.random() * 20
    ));

    const classification = {
      category: isBibleContent ? 'bible' as const : 'volumes' as const,
      confidence,
      reasoning: isBibleContent 
        ? `Content contains ${bibleScore} world-building indicators and appears to be reference material suitable for the Bible section.`
        : `Content contains ${volumeScore} narrative indicators and appears to be story material suitable for Volumes.`,
      suggestedTags: isBibleContent 
        ? ['lore', 'world-building', 'reference', 'character']
        : ['story', 'narrative', 'creative', 'content']
    };

    updateItem(itemId, { 
      status: 'classified',
      classification 
    });

    return classification;
  }, [items, updateItem]);

  // Classify all pending items
  const classifyAllPending = useCallback(async () => {
    const pendingItems = items.filter(i => i.status === 'pending');
    
    for (const item of pendingItems) {
      await classifyItem(item.id);
    }
  }, [items, classifyItem]);

  // Accept classification and move to appropriate section
  const acceptClassification = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.classification) return false;

    // In a real app, this would integrate with Bible and Volumes systems
    // For now, we just remove from classification queue
    removeItem(itemId);
    return true;
  }, [items, removeItem]);

  // Statistics
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === 'pending').length,
    classifying: items.filter(i => i.status === 'classifying').length,
    classified: items.filter(i => i.status === 'classified').length,
    rejected: items.filter(i => i.status === 'rejected').length,
    bible: items.filter(i => i.classification?.category === 'bible').length,
    volumes: items.filter(i => i.classification?.category === 'volumes').length
  };

  return {
    items,
    stats,
    isLoaded,
    addItem,
    addItems,
    updateItem,
    removeItem,
    classifyItem,
    classifyAllPending,
    acceptClassification,
    importFromGallery,
    importFromNotes,
    importFromBatcave
  };
}
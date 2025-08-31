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
    suggestedSection?: string;
    suggestedSubCategory?: string;
  };
  file?: File;
  originalPath?: string;
  userInstructions?: string;
}

interface BatchProcessingOptions {
  globalInstructions?: string;
  priorityCategories?: ('bible' | 'volumes')[];
  confidence?: number;
}

const CLASSIFICATION_STORAGE_KEY = 'gotham-classification-data';

export function useClassification() {
  const [items, setItems] = useState<ClassificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [globalInstructions, setGlobalInstructions] = useState<string>('');
  const [batchProcessing, setBatchProcessing] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(CLASSIFICATION_STORAGE_KEY);
      const storedInstructions = localStorage.getItem(CLASSIFICATION_STORAGE_KEY + '_instructions');
      if (storedData) {
        const parsed: ClassificationItem[] = JSON.parse(storedData);
        setItems(parsed);
      }
      if (storedInstructions) {
        setGlobalInstructions(storedInstructions);
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

  // Save global instructions
  const saveInstructions = useCallback((instructions: string) => {
    try {
      localStorage.setItem(CLASSIFICATION_STORAGE_KEY + '_instructions', instructions);
      setGlobalInstructions(instructions);
    } catch (error) {
      console.error("Failed to save instructions:", error);
    }
  }, []);

  // Add item to classification queue
  const addItem = useCallback((item: Omit<ClassificationItem, 'id'>) => {
    const newItem: ClassificationItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    };
    
    saveData([...items, newItem]);
    return newItem.id;
  }, [items, saveData]);

  // Add multiple items at once
  const addItems = useCallback((newItems: Omit<ClassificationItem, 'id'>[]) => {
    const itemsWithIds = newItems.map(item => ({
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
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

  // Enhanced classification with user instructions
  const classifyItem = useCallback(async (itemId: string, customInstructions?: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.status !== 'pending') return;

    // Set to classifying
    updateItem(itemId, { status: 'classifying' });

    // Simulate AI processing delay (reduced for batch processing)
    const delay = batchProcessing ? 500 + Math.random() * 1000 : 2000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Get content and instructions
    const content = item.content || item.name || '';
    const instructions = customInstructions || item.userInstructions || globalInstructions;
    const lowerContent = content.toLowerCase();
    const lowerInstructions = instructions.toLowerCase();
    
    // Enhanced classification logic with instructions
    const bibleKeywords = [
      'lore', 'world', 'character', 'bible', 'backstory', 'history',
      'mythology', 'legend', 'origin', 'background', 'reference',
      'gotham', 'batman', 'wayne', 'arkham', 'villain', 'hero',
      'encyclopedia', 'wiki', 'database', 'catalog'
    ];
    
    const volumeKeywords = [
      'story', 'chapter', 'narrative', 'plot', 'scene', 'dialogue',
      'action', 'adventure', 'mystery', 'crime', 'investigation',
      'fight', 'chase', 'confrontation', 'resolution', 'script',
      'screenplay', 'novel', 'comic', 'issue'
    ];

    // Score based on content
    const bibleScore = bibleKeywords.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0);
    const volumeScore = volumeKeywords.reduce((score, keyword) => 
      score + (lowerContent.includes(keyword) ? 1 : 0), 0);

    // Factor in user instructions
    let instructionWeight = 0;
    let instructionCategory: 'bible' | 'volumes' | null = null;
    
    if (instructions) {
      if (lowerInstructions.includes('bible') || lowerInstructions.includes('reference') || 
          lowerInstructions.includes('lore') || lowerInstructions.includes('world')) {
        instructionWeight = 3;
        instructionCategory = 'bible';
      } else if (lowerInstructions.includes('volume') || lowerInstructions.includes('story') || 
                 lowerInstructions.includes('chapter') || lowerInstructions.includes('narrative')) {
        instructionWeight = 3;
        instructionCategory = 'volumes';
      }
    }

    // Calculate final scores with instruction bias
    const finalBibleScore = bibleScore + (instructionCategory === 'bible' ? instructionWeight : 0);
    const finalVolumeScore = volumeScore + (instructionCategory === 'volumes' ? instructionWeight : 0);

    const isBibleContent = finalBibleScore > finalVolumeScore || 
                          (finalBibleScore === finalVolumeScore && item.source === 'batcave-archive');

    // Enhanced confidence calculation
    const baseConfidence = Math.max(finalBibleScore, finalVolumeScore) / Math.max(bibleKeywords.length, volumeKeywords.length) * 100;
    const instructionBonus = instructionWeight > 0 ? 15 : 0;
    const confidence = Math.min(95, Math.max(65, baseConfidence + instructionBonus + Math.random() * 15));

    // Suggest specific sections/categories
    let suggestedSection = '';
    let suggestedSubCategory = '';
    
    if (isBibleContent) {
      if (lowerContent.includes('character') || lowerContent.includes('person') || lowerContent.includes('villain') || lowerContent.includes('hero')) {
        suggestedSection = 'Characters';
      } else if (lowerContent.includes('place') || lowerContent.includes('location') || lowerContent.includes('building') || lowerContent.includes('arkham') || lowerContent.includes('wayne')) {
        suggestedSection = 'Locations';
      } else if (lowerContent.includes('gadget') || lowerContent.includes('weapon') || lowerContent.includes('technology') || lowerContent.includes('vehicle')) {
        suggestedSection = 'Gadgets';
      } else {
        suggestedSection = 'General';
      }
    } else {
      // For volumes, suggest based on content themes
      if (lowerContent.includes('mystery') || lowerContent.includes('investigation')) {
        suggestedSubCategory = 'Mystery';
      } else if (lowerContent.includes('action') || lowerContent.includes('fight') || lowerContent.includes('combat')) {
        suggestedSubCategory = 'Action';
      } else if (lowerContent.includes('origin') || lowerContent.includes('beginning')) {
        suggestedSubCategory = 'Origin Story';
      } else {
        suggestedSubCategory = 'General Story';
      }
    }

    const classification = {
      category: isBibleContent ? 'bible' as const : 'volumes' as const,
      confidence,
      reasoning: instructions 
        ? `Based on user instructions ("${instructions.substring(0, 100)}...") and content analysis: ${isBibleContent 
            ? `Content appears to be reference material with ${finalBibleScore} world-building indicators.`
            : `Content appears to be story material with ${finalVolumeScore} narrative indicators.`}`
        : `Content analysis: ${isBibleContent 
            ? `Found ${finalBibleScore} world-building indicators suggesting Bible section.`
            : `Found ${finalVolumeScore} narrative indicators suggesting Volumes section.`}`,
      suggestedTags: isBibleContent 
        ? ['lore', 'world-building', 'reference', suggestedSection.toLowerCase()].filter(Boolean)
        : ['story', 'narrative', 'creative', suggestedSubCategory.toLowerCase()].filter(Boolean),
      suggestedSection: isBibleContent ? suggestedSection : undefined,
      suggestedSubCategory: !isBibleContent ? suggestedSubCategory : undefined
    };

    updateItem(itemId, { 
      status: 'classified',
      classification 
    });

    return classification;
  }, [items, updateItem, globalInstructions, batchProcessing]);

  // Batch classify all pending items with enhanced processing
  const classifyAllPending = useCallback(async (options?: BatchProcessingOptions) => {
    const pendingItems = items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return;
    
    setBatchProcessing(true);
    
    try {
      // Apply global instructions if provided
      if (options?.globalInstructions) {
        saveInstructions(options.globalInstructions);
      }
      
      // Process in smaller batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < pendingItems.length; i += batchSize) {
        const batch = pendingItems.slice(i, i + batchSize);
        
        // Process batch items in parallel
        const promises = batch.map(item => 
          classifyItem(item.id, options?.globalInstructions)
        );
        
        await Promise.all(promises);
        
        // Small delay between batches to prevent overwhelming
        if (i + batchSize < pendingItems.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      setBatchProcessing(false);
    }
  }, [items, classifyItem, saveInstructions]);

  // Accept classification and move to appropriate section
  const acceptClassification = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.classification) return false;

    // TODO: Integrate with Bible and Volumes systems to actually move the content
    // This would involve calling useBible().addOrUpdateEntry() or useVolumes().addChapterToVolume()
    // For now, we remove from classification queue
    removeItem(itemId);
    return {
      category: item.classification.category,
      suggestedSection: item.classification.suggestedSection,
      suggestedSubCategory: item.classification.suggestedSubCategory,
      item
    };
  }, [items, removeItem]);

  // Batch accept all classified items
  const acceptAllClassified = useCallback(() => {
    const classifiedItems = items.filter(i => i.status === 'classified');
    const results = classifiedItems.map(item => acceptClassification(item.id)).filter(Boolean);
    return results;
  }, [items, acceptClassification]);

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
    globalInstructions,
    batchProcessing,
    addItem,
    addItems,
    updateItem,
    removeItem,
    classifyItem,
    classifyAllPending,
    acceptClassification,
    acceptAllClassified,
    saveInstructions,
    importFromGallery,
    importFromNotes,
    importFromBatcave
  };
}
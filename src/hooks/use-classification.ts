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
  status: 'pending' | 'extracting' | 'classifying' | 'classified' | 'rejected';
  classification?: {
    category: 'bible' | 'volumes';
    confidence: number;
    reasoning: string;
    suggestedTags?: string[];
    suggestedSection?: string;
    suggestedSubCategory?: string;
    targetVolume?: string;
    parsedContent?: {
      title?: string;
      sections?: { title: string; content: string }[];
      fields?: { label: string; value: string }[];
    };
  };
  file?: File;
  originalPath?: string;
  userInstructions?: string;
  extractedText?: string;
  error?: string;
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

  // Extract text from PDF files using server-side API
  const extractPDFText = useCallback(async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const response = await fetch('/api/pdf-extract', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`PDF extraction failed: ${response.status}`);
      }
      
      const result = await response.json();
      return result.text || `[Failed to extract text from ${file.name}]`;
    } catch (error) {
      console.error('PDF extraction error:', error);
      // Fallback to file reading for basic content
      return `[PDF Content from ${file.name}]\n\nUnable to extract text from this PDF file. Please review the content manually and classify accordingly.`;
    }
  }, []);

  // Add multiple items at once with text extraction
  const addItems = useCallback(async (newItems: Omit<ClassificationItem, 'id'>[]) => {
    const itemsWithIds: ClassificationItem[] = [];
    
    for (const item of newItems) {
      const newItem: ClassificationItem = {
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      };
      
      // Extract text from PDF files
      if (item.file && item.file.type === 'application/pdf') {
        try {
          newItem.status = 'extracting';
          itemsWithIds.push(newItem);
          saveData([...items, ...itemsWithIds]);
          
          const extractedText = await extractPDFText(item.file);
          newItem.extractedText = extractedText;
          newItem.content = extractedText;
          newItem.status = 'pending';
        } catch (error) {
          console.error('Failed to extract PDF text:', error);
          newItem.content = 'Failed to extract PDF content';
          newItem.status = 'pending';
        }
      } else {
        itemsWithIds.push(newItem);
      }
    }
    
    saveData([...items, ...itemsWithIds]);
    return itemsWithIds.map(item => item.id);
  }, [items, saveData, extractPDFText]);

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

    try {
      // Get content and instructions
      const content = item.extractedText || item.content || item.name || '';
      const instructions = customInstructions || item.userInstructions || globalInstructions;
      
      // Call the real AI classification API
      const response = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          instructions,
          fileName: item.name
        })
      });
      
      if (!response.ok) {
        throw new Error(`Classification failed: ${response.status}`);
      }
      
      const classification = await response.json();
      
      updateItem(itemId, { 
        status: 'classified',
        classification 
      });
      
      return classification;
    } catch (error) {
      console.error('Classification error:', error);
      updateItem(itemId, { 
        status: 'pending',
        error: error instanceof Error ? error.message : 'Classification failed'
      });
      throw error;
    }
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
          classifyItem(item.id, options?.globalInstructions).catch(error => {
            console.error(`Failed to classify ${item.name}:`, error);
            return null;
          })
        );
        
        await Promise.allSettled(promises);
        
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

    // Return the item data so it can be processed, but DON'T remove it yet
    // The classification page will remove it after successful save
    return {
      category: item.classification.category,
      suggestedSection: item.classification.suggestedSection,
      suggestedSubCategory: item.classification.suggestedSubCategory,
      targetVolume: item.classification.targetVolume,
      item
    };
  }, [items]);

  // Remove item after successful processing
  const removeAfterProcessing = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

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
    extracting: items.filter(i => i.status === 'extracting').length,
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
    removeAfterProcessing,
    saveInstructions,
    extractPDFText,
    importFromGallery,
    importFromNotes,
    importFromBatcave
  };
}
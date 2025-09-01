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

    // Simulate AI processing delay (reduced for batch processing)
    const delay = batchProcessing ? 500 + Math.random() * 1000 : 2000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Get content and instructions
    const content = item.extractedText || item.content || item.name || '';
    const instructions = customInstructions || item.userInstructions || globalInstructions;
    const lowerContent = content.toLowerCase();
    const lowerInstructions = instructions.toLowerCase();
    
    // Parse content for structure
    const parsedContent = parseContentStructure(content, instructions);
    
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

    // Extract target volume from instructions if specified
    let targetVolume = '';
    const volumeMatch = lowerInstructions.match(/volume\s+(\d+|[ivx]+|"[^"]+"|'[^']+')/);
    if (volumeMatch) {
      targetVolume = volumeMatch[1].replace(/"/g, '').replace(/'/g, '');
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
      suggestedSubCategory: !isBibleContent ? suggestedSubCategory : undefined,
      targetVolume: !isBibleContent && targetVolume ? targetVolume : undefined,
      parsedContent
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

// Helper function to parse content structure
function parseContentStructure(content: string, instructions: string) {
  const lines = content.split('\n').filter(line => line.trim());
  const sections: { title: string; content: string }[] = [];
  const fields: { label: string; value: string }[] = [];
  let title = '';
  
  // Extract title from first line or instructions
  const titleMatch = instructions.match(/title[:\s]+"([^"]+)"|title[:\s]+([^\n,]+)/i);
  if (titleMatch) {
    title = titleMatch[1] || titleMatch[2];
  } else if (lines.length > 0) {
    title = lines[0].replace(/^[#*\-\s]+/, '').trim();
  }
  
  // Parse content for sections (looking for headers)
  let currentSection = '';
  let currentContent = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a header (starts with #, *, -, or is in ALL CAPS)
    if (trimmedLine.match(/^[#*\-]/) || 
        (trimmedLine.length < 50 && trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3)) {
      
      // Save previous section
      if (currentSection && currentContent) {
        sections.push({ title: currentSection, content: currentContent.trim() });
      }
      
      // Start new section
      currentSection = trimmedLine.replace(/^[#*\-\s]+/, '');
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }
  
  // Save last section
  if (currentSection && currentContent) {
    sections.push({ title: currentSection, content: currentContent.trim() });
  }
  
  // Generate fields based on content analysis
  if (content.includes('character') || content.includes('person')) {
    fields.push({ label: 'Type', value: 'Character' });
    if (content.match(/age[:\s]+(\d+)/i)) {
      fields.push({ label: 'Age', value: content.match(/age[:\s]+(\d+)/i)![1] });
    }
  }
  
  if (content.includes('location') || content.includes('place')) {
    fields.push({ label: 'Type', value: 'Location' });
  }
  
  // Add source field
  fields.push({ label: 'Source', value: 'Imported from Classification' });
  fields.push({ label: 'Content', value: content.substring(0, 500) + (content.length > 500 ? '...' : '') });
  
  return {
    title: title || 'Untitled',
    sections: sections.length > 0 ? sections : undefined,
    fields
  };
}
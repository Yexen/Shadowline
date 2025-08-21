
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BibleEntry {
  title: string;
  snippet: string;
}

export interface BibleCategory {
  category: string;
  items: BibleEntry[];
}

const BIBLE_STORAGE_KEY = 'gotham-bible-entries';

const defaultBibleEntries: BibleCategory[] = [
    { category: "Characters", items: [{ title: "The Joker", snippet: "An agent of chaos..." }, { title: "Catwoman", snippet: "Selina Kyle, a cat burglar..." }] },
    { category: "Locations", items: [{ title: "Arkham Asylum", snippet: "A psychiatric hospital for the criminally insane..." }, { title: "The Batcave", snippet: "Batman's secret headquarters..." }] },
    { category: "Gadgets", items: [{ title: "Batarang", snippet: "A bat-shaped throwing weapon..." }, { title: "Grapple Gun", snippet: "A device to fire a grappling hook..." }] },
];


export function useBible() {
  const [bibleData, setBibleData] = useState<BibleCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(BIBLE_STORAGE_KEY);
      if (storedData) {
        setBibleData(JSON.parse(storedData));
      } else {
        setBibleData(defaultBibleEntries);
        localStorage.setItem(BIBLE_STORAGE_KEY, JSON.stringify(defaultBibleEntries));
      }
    } catch (error) {
      console.error("Failed to access localStorage or parse bible data", error);
      setBibleData(defaultBibleEntries);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: BibleCategory[]) => {
    try {
      localStorage.setItem(BIBLE_STORAGE_KEY, JSON.stringify(newData));
      setBibleData(newData);
    } catch (error) {
      console.error("Failed to save bible data to localStorage", error);
    }
  }, []);

  const addCategory = (categoryName: string) => {
    if (categoryName && !bibleData.some(c => c.category === categoryName)) {
      const newData = [...bibleData, { category: categoryName, items: [] }];
      saveData(newData);
    }
  };
  
  const addOrUpdateEntry = (categoryName: string, entry: BibleEntry, originalTitle?: string) => {
    const newData = bibleData.map(category => {
      if (category.category === categoryName) {
        const newItems = [...category.items];
        const itemIndex = newItems.findIndex(item => item.title === (originalTitle || entry.title));

        if (itemIndex > -1) {
          // Update existing entry
          newItems[itemIndex] = entry;
        } else {
          // Add new entry
          newItems.push(entry);
        }
        return { ...category, items: newItems };
      }
      return category;
    });
    saveData(newData);
  };

  return { isLoaded, bibleData, addCategory, addOrUpdateEntry };
}


'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BibleField {
  label: string;
  value: string;
}

export interface BiblePage {
    id: string;
    title: string;
    content: string;
}

export interface BibleEntry {
  title: string;
  fields: BibleField[];
  pages?: BiblePage[];
}

export interface BibleCategory {
  category: string;
  items: BibleEntry[];
}

const BIBLE_STORAGE_KEY = 'gotham-bible-entries';

const defaultBibleEntries: BibleCategory[] = [
    { 
        category: "Characters", 
        items: [
            { 
                title: "The Joker", 
                fields: [
                    { label: "Real Name", value: "Unknown" },
                    { label: "Occupation", value: "Super-villain, Agent of Chaos" },
                    { label: "Abilities", value: "Genius-level intellect, Expertise in chemistry and engineering, Unpredictability" },
                    { label: "Biography", value: "An agent of chaos with a twisted sense of humor, the Joker is Batman's archenemy, seeking to disrupt order in Gotham City through elaborate and deadly schemes." }
                ],
                pages: [
                    { id: 'joker-1', title: "Philosophical Rantings", content: "Detailed notes on his anarchist views..." },
                    { id: 'joker-2', title: "Chemical Formulas", content: "Recipes for Joker Venom and other toxins." },
                ]
            }, 
            { 
                title: "Catwoman", 
                fields: [
                    { label: "Real Name", value: "Selina Kyle" },
                    { label: "Occupation", value: "Professional thief, occasional vigilante" },
                    { label: "Abilities", value: "Expert burglar, gymnast, and martial artist. Wields a bullwhip with high proficiency." },
                    { label: "Biography", value: "A complex figure in Gotham's underworld, Selina Kyle operates as Catwoman, a master thief with a moral code that sometimes aligns her with Batman. Their relationship is a constant dance between law and crime." }
                ],
                pages: []
            }
        ] 
    },
    { 
        category: "Locations", 
        items: [
            { 
                title: "Arkham Asylum", 
                fields: [
                    { label: "Full Name", value: "The Elizabeth Arkham Asylum for the Criminally Insane" },
                    { label: "Location", value: "Mercey Island, on the outskirts of Gotham" },
                    { label: "Purpose", value: "A psychiatric hospital that houses many of Batman's most dangerous foes." },
                ] 
            }, 
            { 
                title: "The Batcave", 
                fields: [
                    { label: "Location", value: "Subterranean level beneath Wayne Manor" },
                    { label: "Purpose", value: "Batman's secret headquarters and command center." },
                    { label: "Key Features", value: "Batcomputer, crime lab, armory, vehicle storage (Batmobile), and memorabilia from past cases." },
                ] 
            }
        ] 
    },
    { 
        category: "Gadgets", 
        items: [
            { 
                title: "Batarang", 
                fields: [
                    { label: "Type", value: "Non-lethal throwing weapon" },
                    { label: "Variations", value: "Standard, explosive, electric, remote-controlled." },
                    { label: "Purpose", value: "Used for disarming opponents, cutting lines, or as a distraction. A key part of Batman's arsenal to avoid lethal force." }
                ] 
            }, 
            { 
                title: "Grapple Gun", 
                fields: [
                    { label: "Type", value: "Traversal and positioning tool" },
                    { label: "Function", value: "Fires a high-tensile wire with a grappling hook, allowing for rapid ascent and movement across Gotham's rooftops." }
                ] 
            }
        ] 
    },
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

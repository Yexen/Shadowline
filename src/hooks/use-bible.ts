
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

export interface BibleRelationship {
  characterName: string;
  relationshipType: string;
  description?: string;
}

export interface BibleFixedFields {
  // Character fields
  name?: string;
  alias?: string;
  position?: string[];
  groupAffiliation?: string[];
  picture?: string;
  
  // Location fields
  threatLevel?: string;
  accessLevel?: string;
  district?: string;
  status?: string;
  
  // Gadget fields
  type?: string;
  manufacturer?: string;
  effectiveness?: string;
  availability?: string;
}

export interface BibleEntry {
  title: string;
  fixedFields?: BibleFixedFields;
  fields: BibleField[];
  relationships?: BibleRelationship[];
  pages?: BiblePage[];
}

export interface BibleCategory {
  category: string;
  items: BibleEntry[];
}

const BIBLE_STORAGE_KEY = 'gotham-bible-entries';

export const POSITION_OPTIONS = [
  'Hero',
  'Villain', 
  'Anti-Hero',
  'Vigilante',
  'Civilian',
  'Law Enforcement',
  'Government Agent',
  'Criminal',
  'Scientist',
  'Journalist',
  'CEO/Business',
  'Student',
  'Other'
];

export const GROUP_AFFILIATION_OPTIONS = [
  'Justice League',
  'Batfamily',
  'Titans',
  'Young Justice',
  'Birds of Prey',
  'Outsiders',
  'League of Assassins',
  'Rogues Gallery',
  'Court of Owls',
  'GCPD',
  'Arkham Asylum',
  'Wayne Enterprises',
  'LexCorp',
  'Government',
  'Independent',
  'Deceased',
  'Unknown'
];

export const RELATIONSHIP_TYPES = [
  'Family',
  'Romantic Partner',
  'Close Friend',
  'Ally',
  'Mentor',
  'Protégé',
  'Rival',
  'Enemy',
  'Colleague',
  'Acquaintance',
  'Unknown'
];

// Location-specific options
export const THREAT_LEVEL_OPTIONS = [
  'Low',
  'Moderate', 
  'High',
  'Extreme',
  'Unknown'
];

export const ACCESS_LEVEL_OPTIONS = [
  'Public',
  'Restricted',
  'Classified',
  'Top Secret',
  'Batman Only'
];

export const DISTRICT_OPTIONS = [
  'Downtown',
  'East End',
  'Fashion District',
  'Financial District',
  'Chinatown',
  'Crime Alley',
  'Park Row',
  'Robinson Park',
  'Arkham Island',
  'Bristol',
  'Outside Gotham'
];

export const STATUS_OPTIONS = [
  'Active',
  'Inactive',
  'Under Construction',
  'Destroyed',
  'Abandoned',
  'Classified'
];

// Gadget-specific options
export const GADGET_TYPE_OPTIONS = [
  'Weapon',
  'Tool',
  'Vehicle',
  'Communication',
  'Surveillance',
  'Defense',
  'Utility',
  'Medical'
];

export const MANUFACTURER_OPTIONS = [
  'Wayne Enterprises',
  'WayneTech R&D',
  'LexCorp',
  'S.T.A.R. Labs',
  'Custom Built',
  'Military Grade',
  'Unknown'
];

export const EFFECTIVENESS_OPTIONS = [
  'Prototype',
  'Standard',
  'Enhanced',
  'Military Grade',
  'Experimental'
];

export const AVAILABILITY_OPTIONS = [
  'Active Use',
  'In Development',
  'Retired',
  'Lost/Stolen',
  'Destroyed'
];

const defaultBibleEntries: BibleCategory[] = [
    { 
        category: "Characters", 
        items: [
            { 
                title: "The Joker",
                fixedFields: {
                    name: "Unknown",
                    alias: "The Joker, Clown Prince of Crime",
                    position: ["Villain", "Criminal"],
                    groupAffiliation: ["Rogues Gallery", "Independent"]
                },
                fields: [
                    { label: "Abilities", value: "Genius-level intellect, Expertise in chemistry and engineering, Unpredictability" },
                    { label: "Biography", value: "An agent of chaos with a twisted sense of humor, the Joker is Batman's archenemy, seeking to disrupt order in Gotham City through elaborate and deadly schemes." }
                ],
                relationships: [
                    { characterName: "Batman", relationshipType: "Enemy", description: "Archenemy and obsession" },
                    { characterName: "Harley Quinn", relationshipType: "Romantic Partner", description: "Former psychiatrist turned accomplice" }
                ],
                pages: [
                    { id: 'joker-1', title: "Philosophical Rantings", content: "Detailed notes on his anarchist views..." },
                    { id: 'joker-2', title: "Chemical Formulas", content: "Recipes for Joker Venom and other toxins." },
                ]
            }, 
            { 
                title: "Catwoman",
                fixedFields: {
                    name: "Selina Kyle",
                    alias: "Catwoman, The Cat",
                    position: ["Anti-Hero", "Vigilante", "Criminal"],
                    groupAffiliation: ["Independent", "Batfamily"]
                },
                fields: [
                    { label: "Abilities", value: "Expert burglar, gymnast, and martial artist. Wields a bullwhip with high proficiency." },
                    { label: "Biography", value: "A complex figure in Gotham's underworld, Selina Kyle operates as Catwoman, a master thief with a moral code that sometimes aligns her with Batman. Their relationship is a constant dance between law and crime." }
                ],
                relationships: [
                    { characterName: "Batman", relationshipType: "Romantic Partner", description: "Complex romantic relationship mixed with professional rivalry" },
                    { characterName: "Holly Robinson", relationshipType: "Close Friend", description: "Former protégé and trusted friend" }
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
                fixedFields: {
                    threatLevel: "Extreme",
                    accessLevel: "Restricted",
                    district: "Arkham Island",
                    status: "Active"
                },
                fields: [
                    { label: "Full Name", value: "The Elizabeth Arkham Asylum for the Criminally Insane" },
                    { label: "Purpose", value: "A psychiatric hospital that houses many of Batman's most dangerous foes." },
                    { label: "Security Features", value: "Maximum security cells, electroshock therapy rooms, specialized containment units" }
                ] 
            }, 
            { 
                title: "The Batcave",
                fixedFields: {
                    threatLevel: "Low",
                    accessLevel: "Batman Only",
                    district: "Bristol",
                    status: "Active"
                },
                fields: [
                    { label: "Purpose", value: "Batman's secret headquarters and command center." },
                    { label: "Key Features", value: "Batcomputer, crime lab, armory, vehicle storage (Batmobile), and memorabilia from past cases." },
                    { label: "Access Points", value: "Hidden entrance through Wayne Manor study, vehicle tunnel, emergency exits" }
                ] 
            }
        ] 
    },
    { 
        category: "Gadgets", 
        items: [
            { 
                title: "Batarang",
                fixedFields: {
                    type: "Weapon",
                    manufacturer: "Wayne Enterprises",
                    effectiveness: "Enhanced",
                    availability: "Active Use"
                },
                fields: [
                    { label: "Variations", value: "Standard, explosive, electric, remote-controlled." },
                    { label: "Purpose", value: "Used for disarming opponents, cutting lines, or as a distraction. A key part of Batman's arsenal to avoid lethal force." },
                    { label: "Materials", value: "Titanium alloy with specialized edge coating" }
                ] 
            }, 
            { 
                title: "Grapple Gun",
                fixedFields: {
                    type: "Tool",
                    manufacturer: "WayneTech R&D",
                    effectiveness: "Military Grade",
                    availability: "Active Use"
                },
                fields: [
                    { label: "Function", value: "Fires a high-tensile wire with a grappling hook, allowing for rapid ascent and movement across Gotham's rooftops." },
                    { label: "Specifications", value: "50-meter range, 500lb weight capacity, silent operation mode" },
                    { label: "Power Source", value: "Rechargeable lithium battery, 8-hour operation" }
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


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
  realName?: string;
  aliases?: string;
  age?: string;
  nationality?: string;
  alignment?: string;
  affiliation?: string[];
  nemesis?: string;
  primaryWeapons?: string;
  baseOfOperations?: string;
  picture?: string;
  
  // Location fields
  district?: string;
  threatLevel?: string;
  control?: string;
  function?: string;
  
  // Gadget fields
  creator?: string;
  currentOwner?: string;
  gadgetType?: string;
  
  // Vehicle fields
  vehicleName?: string;
  owner?: string;
  manufacturer?: string;
  
  // Animal fields
  species?: string;
  animalAlias?: string;
  companionOf?: string;
  role?: string;
  
  // Couple fields
  members?: string;
  relationshipStatus?: string;
  volumes?: string;
  themes?: string;
  
  // Resource fields
  source?: string;
  linkedTo?: string;
  volume?: string;
  resourceStatus?: string;
  
  // Faction fields
  purpose?: string;
  factionAlignment?: string;
  strengths?: string;
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

// Character-specific options
export const ALIGNMENT_OPTIONS = [
  'Hero',
  'Villain', 
  'Anti-Hero',
  'Vigilante',
  'Neutral',
  'Civilian',
  'Law Enforcement',
  'Criminal',
  'Unknown'
];

export const AFFILIATION_OPTIONS = [
  'Bat-Family',
  'Justice League',
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
export const LOCATION_THREAT_LEVEL_OPTIONS = [
  'Safehouse',
  'Neutral',
  'Hostile', 
  'Extreme'
];

export const CONTROL_OPTIONS = [
  'Batman',
  'GCPD',
  'Wayne Enterprises',
  'Criminal Organizations',
  'Arkham Asylum',
  'Government',
  'Independent',
  'Contested',
  'Unknown'
];

export const FUNCTION_OPTIONS = [
  'Hideout',
  'Headquarters',
  'Battlefield',
  'Safe Zone',
  'Prison',
  'Hospital',
  'Residential',
  'Commercial',
  'Industrial',
  'Government',
  'Unknown'
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

// Gadget-specific options
export const GADGET_TYPE_OPTIONS = [
  'Weapon',
  'Defensive',
  'Surveillance',
  'Vehicle Enhancement',
  'Communication',
  'Medical',
  'Utility'
];

export const CREATOR_OPTIONS = [
  'WayneTech',
  'League of Assassins',
  'S.T.A.R. Labs',
  'LexCorp',
  'Custom Built',
  'Stolen/Modified',
  'Unknown'
];

// Vehicle-specific options
export const VEHICLE_MANUFACTURER_OPTIONS = [
  'WayneTech',
  'Custom',
  'Stolen',
  'Modified Civilian',
  'Military Surplus',
  'Unknown'
];

// Animal-specific options
export const ANIMAL_ROLE_OPTIONS = [
  'Combat',
  'Emotional Support',
  'Symbol',
  'Reconnaissance',
  'Transportation',
  'Companion',
  'Guard'
];

// Couple-specific options
export const RELATIONSHIP_STATUS_OPTIONS = [
  'Canon',
  'Shadows',
  'Speculative',
  'Past',
  'Complicated'
];

// Resource-specific options
export const RESOURCE_STATUS_OPTIONS = [
  'Active',
  'Destroyed',
  'Lost',
  'Classified',
  'Archived'
];

// Faction-specific options
export const FACTION_ALIGNMENT_OPTIONS = [
  'Hero',
  'Villain',
  'Neutral',
  'Anti-Hero',
  'Law Enforcement',
  'Government',
  'Criminal'
];

const defaultBibleEntries: BibleCategory[] = [
    { 
        category: "Characters", 
        items: [
            { 
                title: "The Joker",
                fixedFields: {
                    realName: "Unknown",
                    aliases: "The Joker, Clown Prince of Crime, Mr. J",
                    age: "Unknown",
                    nationality: "Unknown",
                    alignment: "Villain",
                    affiliation: ["Rogues Gallery", "Independent"],
                    nemesis: "Batman",
                    primaryWeapons: "Joker Venom, Various Gag Weapons",
                    baseOfOperations: "Ace Chemicals (former), Various abandoned buildings"
                },
                fields: [
                    { label: "Powers", value: "Genius-level intellect, Expertise in chemistry and engineering, Unpredictability, Immunity to toxins" },
                    { label: "Psychological Profile", value: "Criminally insane with a twisted sense of humor. Believes chaos is the natural order and seeks to prove that anyone can be driven to madness." }
                ],
                relationships: [
                    { characterName: "Batman", relationshipType: "Enemy", description: "Archenemy and obsession - believes Batman completes him" },
                    { characterName: "Harley Quinn", relationshipType: "Romantic Partner", description: "Former psychiatrist turned accomplice and lover" }
                ],
                pages: [
                    { id: 'joker-1', title: "Philosophical Rantings", content: "Detailed notes on his anarchist views and chaos theory..." },
                    { id: 'joker-2', title: "Chemical Formulas", content: "Recipes for Joker Venom and other toxins." },
                ]
            }, 
            { 
                title: "Catwoman",
                fixedFields: {
                    realName: "Selina Kyle",
                    aliases: "Catwoman, The Cat, Irena Dubrovna",
                    age: "32 (Volume I)",
                    nationality: "American",
                    alignment: "Anti-Hero",
                    affiliation: ["Independent", "Bat-Family"],
                    nemesis: "None (varies)",
                    primaryWeapons: "Bullwhip, Claws, Acrobatics",
                    baseOfOperations: "East End, Gotham City"
                },
                fields: [
                    { label: "Abilities", value: "Expert burglar, gymnast, and martial artist. Cat-like reflexes and stealth capabilities." },
                    { label: "Motivation", value: "Protects the East End and its people, especially women and children. Has a moral code against unnecessary killing." }
                ],
                relationships: [
                    { characterName: "Batman", relationshipType: "Romantic Partner", description: "Complex romantic relationship mixed with professional rivalry and mutual respect" },
                    { characterName: "Holly Robinson", relationshipType: "Close Friend", description: "Former protégé and trusted friend from the streets" }
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
                    district: "Arkham Island",
                    threatLevel: "Extreme",
                    control: "Government",
                    function: "Prison"
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
                    district: "Bristol",
                    threatLevel: "Safehouse",
                    control: "Batman",
                    function: "Headquarters"
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
                    creator: "WayneTech",
                    currentOwner: "Batman",
                    gadgetType: "Weapon"
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
                    creator: "WayneTech",
                    currentOwner: "Batman",
                    gadgetType: "Utility"
                },
                fields: [
                    { label: "Function", value: "Fires a high-tensile wire with a grappling hook, allowing for rapid ascent and movement across Gotham's rooftops." },
                    { label: "Specifications", value: "50-meter range, 500lb weight capacity, silent operation mode" },
                    { label: "Power Source", value: "Rechargeable lithium battery, 8-hour operation" }
                ] 
            }
        ] 
    },
    { 
        category: "Vehicles", 
        items: [
            { 
                title: "Batmobile",
                fixedFields: {
                    vehicleName: "The Batmobile",
                    owner: "Batman",
                    manufacturer: "WayneTech"
                },
                fields: [
                    { label: "Specifications", value: "Armored chassis, rocket propulsion, advanced AI navigation system" },
                    { label: "Weapons", value: "Non-lethal deterrents, EMP systems, smoke screens" },
                    { label: "Special Features", value: "Stealth mode, autopilot, remote control capabilities" }
                ] 
            }
        ] 
    },
    { 
        category: "Animals", 
        items: [
            { 
                title: "Ace the Bat-Hound",
                fixedFields: {
                    species: "German Shepherd",
                    animalAlias: "Ace the Bat-Hound",
                    companionOf: "Batman",
                    role: "Combat"
                },
                fields: [
                    { label: "Training", value: "Advanced combat and detection training" },
                    { label: "Equipment", value: "Protective suit with communication gear" },
                    { label: "Notable Appearances", value: "Rescue missions, tracking criminals" }
                ] 
            }
        ] 
    },
    { 
        category: "Couples", 
        items: [
            { 
                title: "Bruce & Selina",
                fixedFields: {
                    members: "Bruce Wayne (Batman) & Selina Kyle (Catwoman)",
                    relationshipStatus: "Shadows",
                    volumes: "I-VI",
                    themes: "Redemption, Trust, Moral Ambiguity"
                },
                fields: [
                    { label: "Notable Moments", value: "First meeting on rooftop, the heist partnership, mutual protection pacts" },
                    { label: "Challenges", value: "Different approaches to justice, trust issues, external threats" }
                ] 
            }
        ] 
    },
    { 
        category: "Resources", 
        items: [
            { 
                title: "Wayne Enterprises Files",
                fixedFields: {
                    source: "Wayne Enterprises",
                    linkedTo: "Bruce Wayne",
                    volume: "I-VI",
                    resourceStatus: "Active"
                },
                fields: [
                    { label: "Contents", value: "Corporate records, R&D projects, financial data" },
                    { label: "Access Level", value: "Board members and select employees only" }
                ] 
            }
        ] 
    },
    { 
        category: "Factions", 
        items: [
            { 
                title: "Bat-Family",
                fixedFields: {
                    purpose: "Protect Gotham City",
                    factionAlignment: "Hero",
                    strengths: "Coordination, training, resources"
                },
                fields: [
                    { label: "Core Members", value: "Batman, Robin, Batgirl, Nightwing, Red Hood" },
                    { label: "Operating Principles", value: "No killing rule, protect innocent lives, work as a team" }
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

  const deleteEntry = (categoryName: string, entryTitle: string) => {
    const newData = bibleData.map(category => {
      if (category.category === categoryName) {
        const newItems = category.items.filter(item => item.title !== entryTitle);
        return { ...category, items: newItems };
      }
      return category;
    });
    saveData(newData);
  };

  return { isLoaded, bibleData, addCategory, addOrUpdateEntry, deleteEntry };
}

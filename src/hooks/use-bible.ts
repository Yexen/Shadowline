
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
            // Financial District
            { 
                title: "Financial District",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Corporate",
                    function: "Business"
                },
                fields: [
                    { label: "Description", value: "The economic heart of Gotham City, home to Wayne Enterprises and major banks. Gleaming skyscrapers house corporate headquarters." },
                    { label: "Known For", value: "Corporate offices, Stock exchange, Banking sector" },
                    { label: "Controlled By", value: "Legitimate businesses" },
                    { label: "Active Hours", value: "9 AM - 6 PM" },
                    { label: "Security Level", value: "High corporate security" }
                ] 
            },
            // Wayne Tower
            { 
                title: "Wayne Tower",
                fixedFields: {
                    district: "Financial District",
                    threatLevel: "Low",
                    control: "Wayne Enterprises",
                    function: "Headquarters"
                },
                fields: [
                    { label: "Description", value: "The towering headquarters of Wayne Enterprises. Also serves as a secret Batman operations base." },
                    { label: "CEO", value: "Bruce Wayne" },
                    { label: "Height", value: "150 floors" },
                    { label: "Secret", value: "Advanced R&D labs" },
                    { label: "Security", value: "Wayne Tech systems" },
                    { label: "Fun Fact", value: "Penthouse connects to Batcave" }
                ] 
            },
            // GCPD Headquarters
            { 
                title: "GCPD Headquarters",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Government",
                    function: "Police Station"
                },
                fields: [
                    { label: "Description", value: "Gotham City Police Department headquarters with the iconic Bat-Signal on the rooftop." },
                    { label: "Commissioner", value: "James Gordon" },
                    { label: "Officers", value: "1200+ active duty" },
                    { label: "Units", value: "MCU, SWAT, Detectives" },
                    { label: "Allied With", value: "Batman (unofficial)" },
                    { label: "Famous For", value: "The Bat-Signal" }
                ] 
            },
            // City Hall
            { 
                title: "City Hall",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Government",
                    function: "Government"
                },
                fields: [
                    { label: "Description", value: "The seat of Gotham's government and political power." },
                    { label: "Mayor", value: "Often varies due to corruption" },
                    { label: "Services", value: "City planning, Public works" },
                    { label: "Architecture", value: "Classical with golden dome" },
                    { label: "Security", value: "Municipal police protection" }
                ] 
            },
            // Park Row
            { 
                title: "Park Row",
                fixedFields: {
                    district: "West Gotham",
                    threatLevel: "Medium",
                    control: "Mixed",
                    function: "Residential"
                },
                fields: [
                    { label: "Description", value: "A residential district in decline. Crime Alley is located nearby." },
                    { label: "Notable", value: "Crime Alley (Wayne family murder site)" },
                    { label: "Population", value: "Mixed income families" },
                    { label: "Crime Rate", value: "Moderate to high" },
                    { label: "History", value: "Former upper-class area" }
                ] 
            },
            // Industrial Zone
            { 
                title: "Industrial Zone",
                fixedFields: {
                    district: "East Gotham",
                    threatLevel: "Medium",
                    control: "Mixed",
                    function: "Industrial"
                },
                fields: [
                    { label: "Description", value: "Factories, warehouses, and docks. Often used by criminals as hideouts." },
                    { label: "Industries", value: "Manufacturing, Shipping" },
                    { label: "Employment", value: "Blue-collar workers" },
                    { label: "Crime", value: "Smuggling, gang activity" },
                    { label: "Notable", value: "Abandoned facilities" }
                ] 
            },
            // Arkham Asylum
            { 
                title: "Arkham Asylum",
                fixedFields: {
                    district: "Arkham Island",
                    threatLevel: "High",
                    control: "Government",
                    function: "Prison"
                },
                fields: [
                    { label: "Description", value: "Psychiatric hospital for Gotham's criminally insane." },
                    { label: "Current Inmates", value: "Joker, Riddler, Scarecrow, Mad Hatter" },
                    { label: "Security", value: "Maximum with specialized containment" },
                    { label: "Breakout Frequency", value: "Disturbingly high" },
                    { label: "Founded", value: "1921 by Dr. Amadeus Arkham" }
                ] 
            },
            // ACE Chemicals
            { 
                title: "ACE Chemicals",
                fixedFields: {
                    district: "Industrial Zone",
                    threatLevel: "Extreme",
                    control: "Abandoned",
                    function: "Abandoned Factory"
                },
                fields: [
                    { label: "Description", value: "Chemical plant where Red Hood fell, creating the Joker." },
                    { label: "History", value: "Birthplace of the Joker" },
                    { label: "Status", value: "Abandoned toxic site" },
                    { label: "Dangers", value: "Chemical burns, toxic exposure" },
                    { label: "Contamination", value: "Extremely hazardous - requires protective gear" }
                ] 
            },
            // Iceberg Lounge
            { 
                title: "Iceberg Lounge",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "High",
                    control: "Penguin",
                    function: "Nightclub"
                },
                fields: [
                    { label: "Description", value: "Penguin's upscale nightclub fronting a criminal empire." },
                    { label: "Owner", value: "Oswald 'Penguin' Cobblepot" },
                    { label: "Cover", value: "High-end nightclub and casino" },
                    { label: "Real Business", value: "Money laundering, arms dealing" },
                    { label: "Security", value: "Armed thugs as 'bouncers'" }
                ] 
            },
            // Poison Ivy Lair
            { 
                title: "Poison Ivy Lair",
                fixedFields: {
                    district: "South Gotham",
                    threatLevel: "High",
                    control: "Poison Ivy",
                    function: "Villain Lair"
                },
                fields: [
                    { label: "Description", value: "Botanical hideout with mutated plants and toxic air." },
                    { label: "Inhabitant", value: "Dr. Pamela Isley" },
                    { label: "Environment", value: "Overgrown greenhouse complex" },
                    { label: "Dangers", value: "Toxic spores, carnivorous plants" },
                    { label: "Required", value: "Full hazmat protection and antidotes" }
                ] 
            },
            // Two-Face Territory
            { 
                title: "Two-Face Territory",
                fixedFields: {
                    district: "Old Gotham",
                    threatLevel: "High",
                    control: "Two-Face",
                    function: "Gang Territory"
                },
                fields: [
                    { label: "Description", value: "Old courthouse district ruled by coin flips." },
                    { label: "Ruler", value: "Harvey 'Two-Face' Dent (former DA)" },
                    { label: "Theme", value: "Duality and chance" },
                    { label: "Territory", value: "Old courthouse district" },
                    { label: "Gang", value: "The 'Doubles'" },
                    { label: "Danger", value: "Unpredictable coin-flip decisions" }
                ] 
            },
            // North Docks
            { 
                title: "North Docks",
                fixedFields: {
                    district: "North Gotham",
                    threatLevel: "Low",
                    control: "Municipal",
                    function: "Docks"
                },
                fields: [
                    { label: "Description", value: "Cargo piers and warehouses along the northern riverbank." },
                    { label: "Traffic", value: "Moderate freight" },
                    { label: "Use", value: "Freight and fishing boats" },
                    { label: "Security", value: "Night patrols" },
                    { label: "Access", value: "Loading cranes operational" }
                ] 
            },
            // Central Docks
            { 
                title: "Central Docks",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Municipal",
                    function: "Docks"
                },
                fields: [
                    { label: "Description", value: "Busy midtown dock with ferries and barges." },
                    { label: "Ferry Lines", value: "3 active routes" },
                    { label: "Smuggling Risk", value: "Medium" },
                    { label: "Shore Cranes", value: "Operational" },
                    { label: "Security", value: "Regular GCPD patrols" }
                ] 
            },
            // South Docks
            { 
                title: "South Docks",
                fixedFields: {
                    district: "South Gotham",
                    threatLevel: "Medium",
                    control: "Municipal",
                    function: "Docks"
                },
                fields: [
                    { label: "Description", value: "Quieter docks near ACE Chemicals with potential contamination." },
                    { label: "Hazards", value: "Chemical runoff from ACE" },
                    { label: "Traffic", value: "Low at night" },
                    { label: "Condition", value: "Some contamination" },
                    { label: "Warning", value: "Avoid swimming" }
                ] 
            },
            // Wayne Bridge
            { 
                title: "Wayne Bridge",
                fixedFields: {
                    district: "West Gotham",
                    threatLevel: "Low",
                    control: "Municipal",
                    function: "Bridge"
                },
                fields: [
                    { label: "Description", value: "Elegant suspension bridge linking west and central districts." },
                    { label: "Design", value: "Suspension bridge" },
                    { label: "Patrols", value: "GCPD nightly" },
                    { label: "Visibility", value: "High security lighting" },
                    { label: "Status", value: "Well-maintained" }
                ] 
            },
            // Midtown Bridge
            { 
                title: "Midtown Bridge",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Municipal",
                    function: "Bridge"
                },
                fields: [
                    { label: "Description", value: "Main commuter bridge across the central channel." },
                    { label: "Lanes", value: "6 traffic lanes" },
                    { label: "Traffic", value: "Heavy during rush hour" },
                    { label: "Maintenance", value: "Regular inspections" },
                    { label: "Safety", value: "Standard guardrails" }
                ] 
            },
            // ACE Overpass
            { 
                title: "ACE Overpass",
                fixedFields: {
                    district: "Industrial Zone",
                    threatLevel: "Medium",
                    control: "Municipal",
                    function: "Bridge"
                },
                fields: [
                    { label: "Description", value: "Industrial overpass near ACE Chemicals in poor condition." },
                    { label: "Condition", value: "Rusting infrastructure" },
                    { label: "Watch", value: "Joker gang activity rumored" },
                    { label: "Hazards", value: "Structural concerns" },
                    { label: "Patrol", value: "Irregular coverage" }
                ] 
            },
            // Wayne Manor
            { 
                title: "Wayne Manor",
                fixedFields: {
                    district: "Bristol",
                    threatLevel: "Low",
                    control: "Wayne Family",
                    function: "Residence"
                },
                fields: [
                    { label: "Description", value: "The ancestral home of the Wayne family, outside Gotham proper. Secret entrance to the Batcave." },
                    { label: "Owner", value: "Bruce Wayne" },
                    { label: "Built", value: "1855 by the Wayne family" },
                    { label: "Staff", value: "Alfred Pennyworth (butler)" },
                    { label: "Secret", value: "Hidden Batcave entrance" },
                    { label: "Security", value: "Advanced Wayne Tech systems" }
                ] 
            },
            // The Batcave
            { 
                title: "The Batcave",
                fixedFields: {
                    district: "Bristol",
                    threatLevel: "Safehouse",
                    control: "Batman",
                    function: "Headquarters"
                },
                fields: [
                    { label: "Description", value: "Hidden cavern base accessible via a concealed entrance near Wayne Manor." },
                    { label: "Access", value: "Secret cliffside entrance" },
                    { label: "Vehicles", value: "Batmobile dock & turntable" },
                    { label: "Facilities", value: "Batcomputer, Armory, Lab" },
                    { label: "Security", value: "Biometric locks & failsafes" }
                ] 
            },
            // Additional Canonical Gotham Locations
            { 
                title: "Crime Alley",
                fixedFields: {
                    district: "Park Row",
                    threatLevel: "High",
                    control: "Criminal",
                    function: "Memorial Site"
                },
                fields: [
                    { label: "Description", value: "The narrow alley where Thomas and Martha Wayne were murdered. A symbol of Gotham's darkness." },
                    { label: "Historic Significance", value: "Wayne family murder site" },
                    { label: "Current State", value: "Memorial plaque installed" },
                    { label: "Crime Rate", value: "Still dangerously high" },
                    { label: "Patrol Frequency", value: "Regular but insufficient" }
                ] 
            },
            { 
                title: "Blackgate Penitentiary",
                fixedFields: {
                    district: "Blackgate Island",
                    threatLevel: "High",
                    control: "Government",
                    function: "Prison"
                },
                fields: [
                    { label: "Description", value: "Maximum security prison for Gotham's non-insane criminals on its own island." },
                    { label: "Security Level", value: "Maximum" },
                    { label: "Capacity", value: "2,500 inmates" },
                    { label: "Notable Inmates", value: "Mob bosses, gang leaders" },
                    { label: "Escape Attempts", value: "Frequent but mostly unsuccessful" }
                ] 
            },
            { 
                title: "Gotham Cathedral",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Low",
                    control: "Religious",
                    function: "Cathedral"
                },
                fields: [
                    { label: "Description", value: "Historic Gothic cathedral in the heart of Gotham, often used for major city events." },
                    { label: "Architecture", value: "Gothic Revival" },
                    { label: "Built", value: "1887" },
                    { label: "Notable Events", value: "Wayne family memorial services" },
                    { label: "Security", value: "Standard church security" }
                ] 
            },
            { 
                title: "Robinson Park",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Medium",
                    control: "Municipal",
                    function: "Park"
                },
                fields: [
                    { label: "Description", value: "Large central park, beautiful by day but dangerous after dark." },
                    { label: "Size", value: "840 acres" },
                    { label: "Features", value: "Lake, walking trails, playgrounds" },
                    { label: "Day Safety", value: "Generally safe" },
                    { label: "Night Safety", value: "High crime rate after sunset" }
                ] 
            },
            { 
                title: "Gotham University",
                fixedFields: {
                    district: "University District",
                    threatLevel: "Low",
                    control: "Academic",
                    function: "University"
                },
                fields: [
                    { label: "Description", value: "Prestigious university known for its research programs and frequent target of villain schemes." },
                    { label: "Students", value: "15,000+ enrolled" },
                    { label: "Notable Alumni", value: "Many Wayne family members" },
                    { label: "Research", value: "Advanced sciences, criminology" },
                    { label: "Security", value: "Campus police + GCPD patrols" }
                ] 
            },
            { 
                title: "Liv's Apartment",
                fixedFields: {
                    district: "Midtown",
                    threatLevel: "Low",
                    control: "Civilian",
                    function: "Residence"
                },
                fields: [
                    { label: "Description", value: "Cozy apartment in Gotham's Midtown district. Safe neighborhood with good security." },
                    { label: "Location", value: "Midtown residential district" },
                    { label: "Building", value: "Modern high-rise with doorman" },
                    { label: "Security", value: "24/7 concierge, security cameras" },
                    { label: "Neighborhood", value: "Safe, well-lit streets" }
                ] 
            },
            { 
                title: "The Narrows",
                fixedFields: {
                    district: "East Gotham",
                    threatLevel: "Extreme",
                    control: "Criminal",
                    function: "Slum"
                },
                fields: [
                    { label: "Description", value: "Gotham's most dangerous slum, a maze of decrepit buildings and criminal hideouts." },
                    { label: "Population", value: "Mostly impoverished families" },
                    { label: "Crime Rate", value: "Extremely high" },
                    { label: "Gang Presence", value: "Multiple competing factions" },
                    { label: "GCPD Response", value: "Limited, dangerous for officers" }
                ] 
            },
            { 
                title: "Gotham General Hospital",
                fixedFields: {
                    district: "Central Gotham",
                    threatLevel: "Medium",
                    control: "Medical",
                    function: "Hospital"
                },
                fields: [
                    { label: "Description", value: "Main public hospital, frequently treating victims of supervillain attacks." },
                    { label: "Capacity", value: "800 beds" },
                    { label: "Specialties", value: "Trauma, toxicology, psychiatric care" },
                    { label: "Security", value: "Enhanced due to frequent villain incidents" },
                    { label: "Staff", value: "Overworked but dedicated" }
                ] 
            },
            { 
                title: "Amusement Mile",
                fixedFields: {
                    district: "East Gotham",
                    threatLevel: "Extreme",
                    control: "Joker",
                    function: "Villain Lair"
                },
                fields: [
                    { label: "Description", value: "Abandoned amusement park, now the Joker's primary base of operations." },
                    { label: "Status", value: "Closed since 1985, now Joker's territory" },
                    { label: "Hazards", value: "Booby traps, laughing gas, unstable structures" },
                    { label: "Security", value: "Avoid at all costs" },
                    { label: "GCPD", value: "No-go zone except for SWAT operations" }
                ] 
            },
            { 
                title: "Diamond District",
                fixedFields: {
                    district: "Uptown",
                    threatLevel: "Low",
                    control: "Corporate",
                    function: "Shopping"
                },
                fields: [
                    { label: "Description", value: "Upscale shopping and business district with luxury stores and high-end restaurants." },
                    { label: "Establishments", value: "Luxury boutiques, fine dining, art galleries" },
                    { label: "Clientele", value: "Gotham's elite" },
                    { label: "Security", value: "High-end private security" },
                    { label: "Crime", value: "Occasional high-end theft" }
                ] 
            },
            { 
                title: "The East End",
                fixedFields: {
                    district: "East Gotham",
                    threatLevel: "High",
                    control: "Catwoman",
                    function: "District"
                },
                fields: [
                    { label: "Description", value: "Working-class district known for organized crime and Catwoman's territory." },
                    { label: "Population", value: "Working families, some criminal elements" },
                    { label: "Notable", value: "Catwoman's primary operating area" },
                    { label: "Crime", value: "Organized theft, protection rackets" },
                    { label: "Character", value: "Gritty but has community spirit" }
                ] 
            },
            { 
                title: "Robbinsville",
                fixedFields: {
                    district: "North Gotham",
                    threatLevel: "Low",
                    control: "Wealthy",
                    function: "Residential"
                },
                fields: [
                    { label: "Description", value: "Upscale residential area where many of Gotham's wealthy live." },
                    { label: "Demographics", value: "Upper class families" },
                    { label: "Housing", value: "Mansions, luxury condos" },
                    { label: "Security", value: "Private security firms" },
                    { label: "Crime", value: "Very low, mostly white-collar" }
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
        const existingData = JSON.parse(storedData);
        
        // Migration: Merge new default locations with existing data
        const migratedData = existingData.map((category: BibleCategory) => {
          if (category.category === 'Locations') {
            // Find the default locations category
            const defaultLocations = defaultBibleEntries.find(cat => cat.category === 'Locations');
            if (defaultLocations) {
              // Get existing location titles to avoid duplicates
              const existingTitles = category.items.map(item => item.title);
              // Add new locations that don't exist yet
              const newLocations = defaultLocations.items.filter(
                item => !existingTitles.includes(item.title)
              );
              
              console.log(`🗺️ Adding ${newLocations.length} new locations to Bible`);
              
              return {
                ...category,
                items: [...category.items, ...newLocations]
              };
            }
          }
          return category;
        });
        
        setBibleData(migratedData);
        // Save the migrated data
        localStorage.setItem(BIBLE_STORAGE_KEY, JSON.stringify(migratedData));
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

  const deleteCategory = (categoryName: string) => {
    const newData = bibleData.filter(category => category.category !== categoryName);
    saveData(newData);
  };

  return { isLoaded, bibleData, addCategory, addOrUpdateEntry, deleteEntry, deleteCategory };
}

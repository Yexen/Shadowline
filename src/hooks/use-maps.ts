
'use client';

import { useState, useEffect, useCallback } from 'react';
import { mapHtml as gothamHtml } from "@/lib/gotham-map-html";
import { dcMapHtml } from "@/lib/dc-map-html";
import { gotham3DMapHtml } from '@/lib/gotham-3d-map-html';
import { wayneManor3DMapHtml } from '@/lib/wayne-manor-3d-map-html';

export interface MapData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  mapHtml: string;
  dataAiHint: string;
}

const MAPS_STORAGE_KEY = 'gotham-maps-data';

const defaultMapsData: MapData[] = [
    {
        id: 'map-dc',
        title: 'DC Universe',
        description: 'An interactive map of the broader DC Comics universe, featuring major cities and locations.',
        imageUrl: 'https://placehold.co/600x400.png',
        mapHtml: dcMapHtml,
        dataAiHint: 'dc universe map'
    },
    {
        id: 'map-gotham',
        title: 'Gotham City (2D)',
        description: 'A detailed, canonical map of Gotham City, based on the official "No Man\'s Land" layout.',
        imageUrl: 'https://placehold.co/600x400.png',
        mapHtml: gothamHtml,
        dataAiHint: 'gotham city map'
    },
    {
        id: 'map-gotham-3d',
        title: 'Gotham City (3D)',
        description: 'An immersive, interactive 3D map of Gotham City. Explore the city from a new perspective.',
        imageUrl: 'https://placehold.co/600x400.png',
        mapHtml: gotham3DMapHtml,
        dataAiHint: 'gotham 3d map'
    },
    {
        id: 'map-wayne-manor-3d',
        title: 'Wayne Manor (3D Walkthrough)',
        description: 'Explore the halls of Wayne Manor and uncover its secrets in this interactive 3D experience.',
        imageUrl: 'https://placehold.co/600x400.png',
        mapHtml: wayneManor3DMapHtml,
        dataAiHint: 'gothic mansion interior'
    },
];

export function useMaps() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(MAPS_STORAGE_KEY);
      if (storedData) {
        const storedMaps = JSON.parse(storedData);
        
        const mapsToAdd = [];
        
        // Force update the 3D Gotham map with new locations
        const existingGotham3D = storedMaps.find((m: MapData) => m.id === 'map-gotham-3d');
        if (existingGotham3D) {
          const updatedGotham3D = defaultMapsData.find(m => m.id === 'map-gotham-3d');
          if (updatedGotham3D) {
            // Replace the existing map with updated HTML
            const mapIndex = storedMaps.findIndex((m: MapData) => m.id === 'map-gotham-3d');
            storedMaps[mapIndex] = updatedGotham3D;
            console.log('🗺️ Updated Gotham 3D map with new locations');
          }
        } else {
          const newMap = defaultMapsData.find(m => m.id === 'map-gotham-3d');
          if (newMap) mapsToAdd.push(newMap);
        }
        
        if (!storedMaps.find((m: MapData) => m.id === 'map-wayne-manor-3d')) {
            const newMap = defaultMapsData.find(m => m.id === 'map-wayne-manor-3d');
            if (newMap) mapsToAdd.push(newMap);
        }

        if (mapsToAdd.length > 0) {
            const updatedMaps = [...storedMaps, ...mapsToAdd];
            setMaps(updatedMaps);
            localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(updatedMaps));
        } else {
            setMaps(storedMaps);
            // Save the updated storedMaps (which now includes the updated Gotham 3D map)
            localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(storedMaps));
        }

      } else {
        setMaps(defaultMapsData);
        localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(defaultMapsData));
      }
    } catch (error) {
      console.error("Failed to access localStorage for maps", error);
      setMaps(defaultMapsData);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveData = useCallback((newData: MapData[]) => {
    try {
      localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(newData));
      setMaps(newData);
    } catch (error) {
      console.error("Failed to save maps data to localStorage", error);
    }
  }, []);

  const updateMap = (id: string, updates: Partial<Omit<MapData, 'id'>>) => {
    const newMaps = maps.map(map =>
      map.id === id ? { ...map, ...updates } : map
    );
    saveData(newMaps);
  };

  return { isLoaded, maps, updateMap };
}

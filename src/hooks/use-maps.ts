
'use client';

import { useState, useEffect, useCallback } from 'react';
import { mapHtml as gothamHtml } from "@/lib/gotham-map-html";
import { dcMapHtml } from "@/lib/dc-map-html";

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
        title: 'Gotham City',
        description: 'A detailed, canonical map of Gotham City, based on the official "No Man\'s Land" layout.',
        imageUrl: 'https://placehold.co/600x400.png',
        mapHtml: gothamHtml,
        dataAiHint: 'gotham city map'
    },
];

export function useMaps() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(MAPS_STORAGE_KEY);
      if (storedData) {
        setMaps(JSON.parse(storedData));
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

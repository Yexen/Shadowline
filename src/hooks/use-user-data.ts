'use client';

import { useState, useEffect } from 'react';

// Simple user data hook using localStorage
export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined') {
      setIsLoaded(true);
      return;
    }

    try {
      const stored = localStorage.getItem('user-data');
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateUserData = (data: any) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('user-data', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  const updateWatchlist = (watchlist: any[]) => {
    const newUserData = { ...userData, watchlist };
    updateUserData(newUserData);
  };

  const updateReadlist = (readlist: any[]) => {
    const newUserData = { ...userData, readlist };
    updateUserData(newUserData);
  };

  return {
    userData: userData || {},
    updateUserData,
    updateWatchlist,
    updateReadlist,
    isLoaded,
  };
}
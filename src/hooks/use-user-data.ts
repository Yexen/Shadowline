'use client';

import { useState, useEffect } from 'react';

// Simple user data hook using localStorage
export function useUserData() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
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
    try {
      localStorage.setItem('user-data', JSON.stringify(data));
      setUserData(data);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  return {
    userData,
    updateUserData,
    isLoaded,
  };
}
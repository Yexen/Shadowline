'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { getAppFirestore, getAppAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Video } from './use-watchlist';
import type { NewsArticle } from './use-readlist';

export interface UserData {
  watchlist: Video[];
  readlist: NewsArticle[];
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'fa';
    autoRefresh: boolean;
  };
  coverImage?: string;
  lastUpdated: string;
}

const defaultUserData: UserData = {
  watchlist: [],
  readlist: [],
  preferences: {
    theme: 'auto',
    language: 'en',
    autoRefresh: true,
  },
  lastUpdated: new Date().toISOString(),
};

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const db = getAppFirestore();
  const auth = getAppAuth();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // User logged out - load from localStorage as fallback
        loadFromLocalStorage();
        setIsLoaded(true);
      }
    });

    return unsubscribe;
  }, []);

  // Load data from localStorage (fallback for non-authenticated users)
  const loadFromLocalStorage = useCallback(() => {
    try {
      const watchlistData = localStorage.getItem('gotham-watchlist-storage');
      const readlistData = localStorage.getItem('gotham-readlist-storage');
      const coverData = localStorage.getItem('gotham-cover-image-storage');

      const parsedWatchlist = watchlistData ? JSON.parse(watchlistData) : null;
      const parsedReadlist = readlistData ? JSON.parse(readlistData) : null;
      const parsedCover = coverData ? JSON.parse(coverData) : null;

      setUserData({
        watchlist: parsedWatchlist?.state?.videos || [],
        readlist: parsedReadlist?.state?.articles || [],
        preferences: {
          theme: 'auto',
          language: document.documentElement.lang === 'fa' ? 'fa' : 'en',
          autoRefresh: true,
        },
        coverImage: parsedCover?.state?.coverImage || undefined,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setUserData(defaultUserData);
    }
  }, []);

  // Load and sync data for authenticated user
  const loadUserData = useCallback(async (userId: string) => {
    setIsSyncing(true);
    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      } else {
        // First time user - migrate from localStorage and create Firestore doc
        loadFromLocalStorage();
        const migrationData = { ...userData, lastUpdated: new Date().toISOString() };
        await setDoc(userDocRef, migrationData);
        setUserData(migrationData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setIsSyncing(false);
      setIsLoaded(true);
    }
  }, [db, userData]);

  // Set up real-time listener for authenticated user
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: Unsubscribe;

    const setupListener = async () => {
      await loadUserData(currentUser.uid);
      
      // Set up real-time listener
      const userDocRef = doc(db, 'userData', currentUser.uid);
      unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        }
      }, (error) => {
        console.error('Error listening to user data:', error);
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, db, loadUserData]);

  // Save data to Firestore (authenticated) or localStorage (fallback)
  const saveUserData = useCallback(async (newData: Partial<UserData>) => {
    const updatedData = {
      ...userData,
      ...newData,
      lastUpdated: new Date().toISOString(),
    };

    setUserData(updatedData);

    if (currentUser) {
      // Save to Firestore for authenticated users
      try {
        setIsSyncing(true);
        const userDocRef = doc(db, 'userData', currentUser.uid);
        await updateDoc(userDocRef, updatedData);
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Fallback to localStorage
        saveToLocalStorage(updatedData);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Save to localStorage for non-authenticated users
      saveToLocalStorage(updatedData);
    }
  }, [userData, currentUser, db]);

  // Save to localStorage (for compatibility and fallback)
  const saveToLocalStorage = useCallback((data: UserData) => {
    try {
      // Update existing localStorage format for compatibility
      localStorage.setItem('gotham-watchlist-storage', JSON.stringify({
        state: { videos: data.watchlist, isLoaded: true },
        version: 0
      }));
      
      localStorage.setItem('gotham-readlist-storage', JSON.stringify({
        state: { articles: data.readlist, isLoaded: true },
        version: 0
      }));

      if (data.coverImage) {
        localStorage.setItem('gotham-cover-image-storage', JSON.stringify({
          state: { coverImage: data.coverImage },
          version: 0
        }));
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Helper methods for specific data updates
  const updateWatchlist = useCallback((videos: Video[]) => {
    saveUserData({ watchlist: videos });
  }, [saveUserData]);

  const updateReadlist = useCallback((articles: NewsArticle[]) => {
    saveUserData({ readlist: articles });
  }, [saveUserData]);

  const updateCoverImage = useCallback((imageUrl: string) => {
    saveUserData({ coverImage: imageUrl });
  }, [saveUserData]);

  const updatePreferences = useCallback((preferences: Partial<UserData['preferences']>) => {
    saveUserData({ 
      preferences: { ...userData.preferences, ...preferences } 
    });
  }, [saveUserData, userData.preferences]);

  return {
    userData,
    isLoaded,
    isSyncing,
    isAuthenticated: !!currentUser,
    currentUser,
    updateWatchlist,
    updateReadlist,
    updateCoverImage,
    updatePreferences,
    saveUserData,
  };
}
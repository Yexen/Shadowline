
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from './use-toast';
import { useUserData } from './use-user-data';
import { useEffect } from 'react';

export interface Video {
    id: string;
    title: string;
    uploader: string;
    thumbnail: string;
    url: string;
    publishedAt: string;
}

interface WatchlistState {
  videos: Video[];
  isLoaded: boolean;
  toggleVideo: (video: Video) => void;
  removeVideo: (videoId: string) => void;
  hasVideo: (videoId: string) => boolean;
  syncFromUserData: (videos: Video[]) => void;
}

// Global type for sync functions
declare global {
  interface Window {
    syncWatchlist?: (videos: Video[]) => void;
    syncReadlist?: (articles: any[]) => void;
  }
}

// Zustand store for local state management
export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoaded: false,
      toggleVideo: (video) => {
        const existing = get().videos.find(v => v.id === video.id);
        if (existing) {
            // Remove video
            const newVideos = get().videos.filter((v) => v.id !== video.id);
            set({ videos: newVideos });
            // Sync to persistent storage
            if (typeof window !== 'undefined') {
              window.syncWatchlist?.(newVideos);
            }
            toast({
                title: "Removed from Watchlist",
                variant: "destructive"
            });
        } else {
            // Add video
            const newVideos = [video, ...get().videos];
            set({ videos: newVideos });
            // Sync to persistent storage
            if (typeof window !== 'undefined') {
              window.syncWatchlist?.(newVideos);
            }
            toast({
                title: "Added to Watchlist",
                description: `"${video.title}" has been added.`,
            });
        }
      },
      removeVideo: (videoId) => {
        const newVideos = get().videos.filter((v) => v.id !== videoId);
        set({ videos: newVideos });
        // Sync to persistent storage
        if (typeof window !== 'undefined') {
          window.syncWatchlist?.(newVideos);
        }
         toast({
            title: "Removed from Watchlist",
            variant: "destructive"
        });
      },
      hasVideo: (videoId) => {
        return get().videos.some(v => v.id === videoId);
      },
      syncFromUserData: (videos: Video[]) => {
        set({ videos, isLoaded: true });
      },
    }),
    {
      name: 'gotham-watchlist-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
            state.isLoaded = true;
        }
      },
    }
  )
);

// Hook to sync with persistent user data
export function useWatchlistSync() {
  const { userData, updateWatchlist, isLoaded: userDataLoaded } = useUserData();
  const { syncFromUserData } = useWatchlist();

  useEffect(() => {
    if (userDataLoaded && userData.watchlist) {
      // Sync from user data to local store
      syncFromUserData(userData.watchlist);
    }
  }, [userDataLoaded, userData.watchlist, syncFromUserData]);

  useEffect(() => {
    // Set up global sync function
    if (typeof window !== 'undefined') {
      window.syncWatchlist = updateWatchlist;
      return () => {
        delete window.syncWatchlist;
      };
    }
  }, [updateWatchlist]);

  return { isLoaded: userDataLoaded };
}

// Mark as loaded on initial client-side mount
if (typeof window !== 'undefined') {
    useWatchlist.setState({ isLoaded: true });
}

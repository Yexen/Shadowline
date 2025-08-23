
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useToast } from './use-toast';

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
  addVideo: (video: Video) => void;
  removeVideo: (videoId: string) => void;
  hasVideo: (videoId: string) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      videos: [],
      isLoaded: false,
      addVideo: (video) => {
        const { toast } = useToast.getState();
        const existing = get().videos.find(v => v.id === video.id);
        if (existing) {
            toast({
                title: "Already in Watchlist",
                description: "This video is already in your watchlist.",
            });
            return;
        }
        set((state) => ({ videos: [video, ...state.videos] }));
        toast({
            title: "Added to Watchlist",
            description: `"${video.title}" has been added.`,
        });
      },
      removeVideo: (videoId) => {
        set((state) => ({ videos: state.videos.filter((v) => v.id !== videoId) }));
         useToast.getState().toast({
            title: "Removed from Watchlist",
            variant: "destructive"
        });
      },
      hasVideo: (videoId) => {
        return get().videos.some(v => v.id === videoId);
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

// Mark as loaded on initial client-side mount
if (typeof window !== 'undefined') {
    useWatchlist.setState({ isLoaded: true });
}

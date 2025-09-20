
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from './use-toast';
import { useUserData } from './use-user-data';
import { useEffect } from 'react';

export interface NewsArticle {
  id: string | number;
  title: string;
  source: string;
  date: string;
  snippet: string;
  image?: string;
  url: string;
}

interface ReadlistState {
  articles: NewsArticle[];
  isLoaded: boolean;
  toggleArticle: (article: NewsArticle) => void;
  removeArticle: (articleId: string | number) => void;
  hasArticle: (articleId: string | number) => boolean;
  syncFromUserData: (articles: NewsArticle[]) => void;
}

// Zustand store for local state management
export const useReadlist = create<ReadlistState>()(
  persist(
    (set, get) => ({
      articles: [],
      isLoaded: false,
      toggleArticle: (article) => {
        const existing = get().articles.find(a => a.id === article.id);
        if (existing) {
            const newArticles = get().articles.filter((a) => a.id !== article.id);
            set({ articles: newArticles });
            // Sync to persistent storage
            if (typeof window !== 'undefined') {
              window.syncReadlist?.(newArticles);
            }
            toast({
                title: "Removed from Read List",
                variant: "destructive"
            });
        } else {
            const newArticles = [article, ...get().articles];
            set({ articles: newArticles });
            // Sync to persistent storage
            if (typeof window !== 'undefined') {
              window.syncReadlist?.(newArticles);
            }
            toast({
                title: "Added to Read List",
                description: `"${article.title}" has been added.`,
            });
        }
      },
      removeArticle: (articleId) => {
        const newArticles = get().articles.filter((a) => a.id !== articleId);
        set({ articles: newArticles });
        // Sync to persistent storage
        if (typeof window !== 'undefined') {
          window.syncReadlist?.(newArticles);
        }
         toast({
            title: "Removed from Read List",
            variant: "destructive"
        });
      },
      hasArticle: (articleId) => {
        return get().articles.some(a => a.id === articleId);
      },
      syncFromUserData: (articles: NewsArticle[]) => {
        set({ articles, isLoaded: true });
      },
    }),
    {
      name: 'gotham-readlist-storage',
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
export function useReadlistSync() {
  const { userData, updateReadlist, isLoaded: userDataLoaded } = useUserData();
  const { syncFromUserData } = useReadlist();

  useEffect(() => {
    if (userDataLoaded && userData.readlist) {
      // Sync from user data to local store
      syncFromUserData(userData.readlist);
    }
  }, [userDataLoaded, userData.readlist, syncFromUserData]);

  useEffect(() => {
    // Set up global sync function
    if (typeof window !== 'undefined') {
      window.syncReadlist = updateReadlist;
      return () => {
        delete window.syncReadlist;
      };
    }
  }, [updateReadlist]);

  return { isLoaded: userDataLoaded };
}

if (typeof window !== 'undefined') {
    useReadlist.setState({ isLoaded: true });
}

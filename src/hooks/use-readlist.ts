
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from './use-toast';

export interface NewsArticle {
  id: string | number;
  title: string;
  source: string;
  date: string;
  snippet: string;
  image: string;
  url: string;
}

interface ReadlistState {
  articles: NewsArticle[];
  isLoaded: boolean;
  toggleArticle: (article: NewsArticle) => void;
  removeArticle: (articleId: string | number) => void;
  hasArticle: (articleId: string | number) => boolean;
}

export const useReadlist = create<ReadlistState>()(
  persist(
    (set, get) => ({
      articles: [],
      isLoaded: false,
      toggleArticle: (article) => {
        const existing = get().articles.find(a => a.id === article.id);
        if (existing) {
            set((state) => ({ articles: state.articles.filter((a) => a.id !== article.id) }));
            toast({
                title: "Removed from Read List",
                variant: "destructive"
            });
        } else {
            set((state) => ({ articles: [article, ...state.articles] }));
            toast({
                title: "Added to Read List",
                description: `"${article.title}" has been added.`,
            });
        }
      },
      removeArticle: (articleId) => {
        set((state) => ({ articles: state.articles.filter((a) => a.id !== articleId) }));
         toast({
            title: "Removed from Read List",
            variant: "destructive"
        });
      },
      hasArticle: (articleId) => {
        return get().articles.some(a => a.id === articleId);
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

if (typeof window !== 'undefined') {
    useReadlist.setState({ isLoaded: true });
}

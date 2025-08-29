
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  BookOpen, 
  Image as ImageIcon, 
  SearchIcon, 
  Globe, 
  Library, 
  Clock, 
  TrendingUp,
  Filter,
  X,
  Loader2,
  Command
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useBible, BibleEntry } from '@/hooks/use-bible';
import { useDrafts } from '@/hooks/use-drafts';
import { useGallery } from '@/hooks/use-gallery';
import { useModalStore } from '@/hooks/use-modal-store';
import { useVolumes } from '@/hooks/use-volumes';

const translations = {
  en: {
    searchOptions: "Search Options",
    allContent: "All Content",
    drafts: "Drafts",
    bible: "Bible",
    gallery: "Gallery",
    volumes: "Volumes",
    searchPlaceholder: "Search all project files...",
    bibleSource: "Bible",
    volumeSource: "Volume",
    gallerySource: "Gallery",
    draftSource: "Draft",
    noResults: "No results found for",
    untitledDraft: "Untitled Draft",
    bibleEntry: "Bible Entry",
    imageInFolder: "Image in folder",
  },
  fa: {
    searchOptions: "گزینه‌های جستجو",
    allContent: "همه محتوا",
    drafts: "پیش‌نویس‌ها",
    bible: "کتاب مقدس",
    gallery: "گالری",
    volumes: "جلدها",
    searchPlaceholder: "جستجو در تمام فایل‌های پروژه...",
    bibleSource: "کتاب مقدس",
    volumeSource: "جلد",
    gallerySource: "گالری",
    draftSource: "پیش‌نویس",
    noResults: "هیچ نتیجه‌ای برای یافت نشد",
    untitledDraft: "پیش‌نویس بدون عنوان",
    bibleEntry: "ورودی کتاب مقدس",
    imageInFolder: "تصویر در پوشه",
  }
};

type SearchScope = 'all' | 'drafts' | 'bible' | 'gallery' | 'volumes';
type SortOption = 'relevance' | 'date' | 'title';

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    source: string;
    sourceType: 'draft' | 'bible' | 'gallery' | 'volume';
    url: string;
    data?: any;
    relevanceScore?: number;
    lastModified?: Date;
    highlights?: string[];
}

// Fuzzy search utility
const fuzzySearch = (text: string, query: string): { score: number; highlights: string[] } => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const highlights: string[] = [];
  
  // Exact match gets highest score
  if (lowerText.includes(lowerQuery)) {
    highlights.push(query);
    return { score: 100, highlights };
  }
  
  // Word boundary matches
  const words = lowerQuery.split(' ').filter(w => w.length > 0);
  let score = 0;
  
  words.forEach(word => {
    if (lowerText.includes(word)) {
      score += 50 / words.length;
      highlights.push(word);
    }
  });
  
  // Character similarity for typos
  if (score === 0 && query.length > 2) {
    const similarity = calculateSimilarity(lowerText, lowerQuery);
    if (similarity > 0.6) {
      score = similarity * 30;
    }
  }
  
  return { score, highlights };
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState<SearchScope>('all');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [lang, setLang] = useState<'en' | 'fa'>('en');
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>('relevance');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showRecentSearches, setShowRecentSearches] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Debounced search query
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
      if (typeof document !== 'undefined') {
        const currentLang = document.documentElement.lang;
        if (currentLang === 'fa') setLang('fa');
        else setLang('en');
        
        // Load recent searches
        const saved = localStorage.getItem('search-recent');
        if (saved) {
          try {
            setRecentSearches(JSON.parse(saved));
          } catch (e) {
            console.warn('Failed to parse recent searches');
          }
        }
      }
    }, []);
    
    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          inputRef.current?.focus();
        }
        if (e.key === 'Escape' && inputRef.current === document.activeElement) {
          setQuery('');
          setShowRecentSearches(false);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const t = translations[lang];

    const { bibleData } = useBible();
    const { drafts } = useDrafts();
    const { folders } = useGallery();
    const { volumes } = useVolumes();
    const { openModal } = useModalStore();
    
    const searchOptions = useMemo(() => {
        return [
            { id: 'all', label: t.allContent, icon: Globe },
            { id: 'drafts', label: t.drafts, icon: FileText },
            { id: 'bible', label: t.bible, icon: BookOpen },
            { id: 'gallery', label: t.gallery, icon: ImageIcon },
            { id: 'volumes', label: t.volumes, icon: Library },
        ];
    }, [t]);

    // Enhanced search with fuzzy matching
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const newResults: SearchResult[] = [];

        // Search Drafts
        if (scope === 'all' || scope === 'drafts') {
            drafts.forEach(draft => {
                const titleSearch = fuzzySearch(draft.title || t.untitledDraft, searchQuery);
                const contentSearch = fuzzySearch(draft.content, searchQuery);
                const maxScore = Math.max(titleSearch.score, contentSearch.score);
                
                if (maxScore > 20) {
                    newResults.push({
                        id: `draft-${draft.id}`,
                        title: draft.title || t.untitledDraft,
                        snippet: draft.content.substring(0, 150) + '...',
                        source: t.draftSource,
                        sourceType: 'draft',
                        url: `/editor/${draft.id}`,
                        relevanceScore: maxScore,
                        highlights: [...titleSearch.highlights, ...contentSearch.highlights],
                        lastModified: draft.updatedAt ? new Date(draft.updatedAt) : new Date()
                    });
                }
            });
        }

        // Search Bible
        if (scope === 'all' || scope === 'bible') {
            bibleData.forEach(category => {
                category.items.forEach(item => {
                    const fullText = item.title + ' ' + (item.fields || []).map(f => `${f.label} ${f.value}`).join(' ');
                    const search = fuzzySearch(fullText, searchQuery);
                    
                    if (search.score > 20) {
                        newResults.push({
                            id: `bible-${category.category}-${item.title}`,
                            title: item.title,
                            snippet: item.fields?.[0]?.value.substring(0, 150) + '...' || t.bibleEntry,
                            source: `${t.bibleSource}: ${category.category}`,
                            sourceType: 'bible',
                            url: '#',
                            data: { bible: { category: category.category, entry: item } },
                            relevanceScore: search.score,
                            highlights: search.highlights
                        });
                    }
                });
            });
        }
        
        // Search Gallery
        if (scope === 'all' || scope === 'gallery') {
            folders.forEach(folder => {
                folder.items.forEach(image => {
                    const search = fuzzySearch(image.caption, searchQuery);
                    if (search.score > 20) {
                        newResults.push({
                            id: `gallery-${image.id}`,
                            title: image.caption,
                            snippet: `${t.imageInFolder}: ${folder.name}`,
                            source: t.gallerySource,
                            sourceType: 'gallery',
                            url: '/gallery',
                            relevanceScore: search.score,
                            highlights: search.highlights
                        });
                    }
                });
            });
        }
        
        // Search Volumes
        if (scope === 'all' || scope === 'volumes') {
            volumes.forEach(volume => {
                const fullText = volume.title + ' ' + volume.description + ' ' + volume.chapters.map(c => c.title).join(' ');
                const search = fuzzySearch(fullText, searchQuery);
                
                if (search.score > 20) {
                    newResults.push({
                        id: `volume-${volume.id}`,
                        title: volume.title,
                        snippet: volume.description.substring(0, 150) + '...',
                        source: t.volumeSource,
                        sourceType: 'volume',
                        url: '#',
                        data: { volume: { id: volume.id } },
                        relevanceScore: search.score,
                        highlights: search.highlights
                    });
                }
            });
        }

        // Sort results
        newResults.sort((a, b) => {
            switch (sortBy) {
                case 'relevance':
                    return (b.relevanceScore || 0) - (a.relevanceScore || 0);
                case 'date':
                    return (b.lastModified || new Date()).getTime() - (a.lastModified || new Date()).getTime();
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setResults(newResults);
        setIsLoading(false);
        
        // Save to recent searches
        if (searchQuery && !recentSearches.includes(searchQuery)) {
            const newRecent = [searchQuery, ...recentSearches.slice(0, 4)];
            setRecentSearches(newRecent);
            localStorage.setItem('search-recent', JSON.stringify(newRecent));
        }
    }, [scope, bibleData, drafts, folders, volumes, t, sortBy, recentSearches]);

    // Trigger search on debounced query change
    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);
    
    const handleResultClick = (result: SearchResult) => {
        if (result.url !== '#') {
            router.push(result.url);
        } else if (result.data) {
            if (result.sourceType === 'bible') {
                openModal('bible', result.data.bible);
            }
            if (result.sourceType === 'volume') {
                openModal('volume', result.data.volume);
            }
        }
    }


    return (
        <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-14rem)]">
            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <h2 className="font-headline text-lg font-bold mb-4">{t.searchOptions}</h2>
                <RadioGroup value={scope} onValueChange={(value) => setScope(value as SearchScope)} className="space-y-2">
                    {searchOptions.map(option => (
                         <div key={option.id} className="flex items-center space-x-2 rtl:space-x-reverse">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                                <option.icon className="h-4 w-4 text-muted-foreground" />
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <div className="relative">
                    <SearchIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-4 text-lg h-12"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-grow mt-6">
                    <div className="space-y-4 pr-4 rtl:pl-4 rtl:pr-0">
                        {results.length > 0 ? (
                            results.map(result => (
                                <Card key={result.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleResultClick(result)}>
                                    <CardContent className="p-4">
                                        <p className="text-xs text-primary font-bold uppercase">{result.source}</p>
                                        <h3 className="font-headline font-semibold">{result.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            query && <p className="text-center text-muted-foreground py-8">{t.noResults} "{query}".</p>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}

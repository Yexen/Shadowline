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
  Loader2,
  Command,
  X
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
    recentSearches: "Recent Searches",
    sortBy: "Sort by",
    relevance: "Relevance",
    title: "Title",
    keyboardShortcut: "Press Ctrl+K to search",
    searching: "Searching..."
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
    recentSearches: "جستجوهای اخیر",
    sortBy: "مرتب‌سازی بر اساس",
    relevance: "ارتباط",
    title: "عنوان",
    keyboardShortcut: "Ctrl+K برای جستجو فشار دهید",
    searching: "در حال جستجو..."
  }
};

type SearchScope = 'all' | 'drafts' | 'bible' | 'gallery' | 'volumes';
type SortOption = 'relevance' | 'title';

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    source: string;
    sourceType: 'draft' | 'bible' | 'gallery' | 'volume';
    url: string;
    data?: any;
    relevanceScore?: number;
}

// Simple fuzzy search utility
const fuzzySearch = (text: string, query: string): number => {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Exact match gets highest score
  if (lowerText.includes(lowerQuery)) {
    return 100;
  }
  
  // Word boundary matches
  const words = lowerQuery.split(' ').filter(w => w.length > 0);
  let score = 0;
  
  words.forEach(word => {
    if (lowerText.includes(word)) {
      score += 50 / words.length;
    }
  });
  
  return score;
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
        const saved = localStorage.getItem('shadowline-search-recent');
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

    // Enhanced search with fuzzy matching and debouncing
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setIsLoading(false);
            setShowRecentSearches(false);
            return;
        }

        setIsLoading(true);
        setShowRecentSearches(false);
        const newResults: SearchResult[] = [];

        // Search Drafts
        if (scope === 'all' || scope === 'drafts') {
            drafts.forEach(draft => {
                const titleScore = fuzzySearch(draft.title || t.untitledDraft, searchQuery);
                const contentScore = fuzzySearch(draft.content, searchQuery);
                const maxScore = Math.max(titleScore, contentScore);
                
                if (maxScore > 20) {
                    newResults.push({
                        id: `draft-${draft.id}`,
                        title: draft.title || t.untitledDraft,
                        snippet: draft.content.substring(0, 150) + '...',
                        source: t.draftSource,
                        sourceType: 'draft',
                        url: `/editor/${draft.id}`,
                        relevanceScore: maxScore
                    });
                }
            });
        }

        // Search Bible
        if (scope === 'all' || scope === 'bible') {
            bibleData.forEach(category => {
                category.items.forEach(item => {
                    const fullText = item.title + ' ' + (item.fields || []).map(f => `${f.label} ${f.value}`).join(' ');
                    const score = fuzzySearch(fullText, searchQuery);
                    
                    if (score > 20) {
                        newResults.push({
                            id: `bible-${category.category}-${item.title}`,
                            title: item.title,
                            snippet: item.fields?.[0]?.value.substring(0, 150) + '...' || t.bibleEntry,
                            source: `${t.bibleSource}: ${category.category}`,
                            sourceType: 'bible',
                            url: '#',
                            data: { bible: { category: category.category, entry: item } },
                            relevanceScore: score
                        });
                    }
                });
            });
        }
        
        // Search Gallery
        if (scope === 'all' || scope === 'gallery') {
            folders.forEach(folder => {
                folder.items.forEach(image => {
                    const score = fuzzySearch(image.caption, searchQuery);
                    if (score > 20) {
                        newResults.push({
                            id: `gallery-${image.id}`,
                            title: image.caption,
                            snippet: `${t.imageInFolder}: ${folder.name}`,
                            source: t.gallerySource,
                            sourceType: 'gallery',
                            url: '/gallery',
                            relevanceScore: score
                        });
                    }
                });
            });
        }
        
        // Search Volumes
        if (scope === 'all' || scope === 'volumes') {
            volumes.forEach(volume => {
                const fullText = volume.title + ' ' + volume.description + ' ' + volume.chapters.map(c => c.title).join(' ');
                const score = fuzzySearch(fullText, searchQuery);
                
                if (score > 20) {
                    newResults.push({
                        id: `volume-${volume.id}`,
                        title: volume.title,
                        snippet: volume.description.substring(0, 150) + '...',
                        source: t.volumeSource,
                        sourceType: 'volume',
                        url: '#',
                        data: { volume: { id: volume.id } },
                        relevanceScore: score
                    });
                }
            });
        }

        // Sort results
        newResults.sort((a, b) => {
            if (sortBy === 'relevance') {
                return (b.relevanceScore || 0) - (a.relevanceScore || 0);
            }
            return a.title.localeCompare(b.title);
        });

        setResults(newResults);
        setIsLoading(false);
        
        // Save to recent searches
        if (searchQuery && !recentSearches.includes(searchQuery)) {
            const newRecent = [searchQuery, ...recentSearches.slice(0, 4)];
            setRecentSearches(newRecent);
            localStorage.setItem('shadowline-search-recent', JSON.stringify(newRecent));
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
    };

    const handleRecentSearch = (recentQuery: string) => {
        setQuery(recentQuery);
        setShowRecentSearches(false);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('shadowline-search-recent');
    };

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
                
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-headline text-sm font-bold">{t.sortBy}</h3>
                        <Badge variant="outline" className="text-xs">
                            <Command className="w-3 h-3 mr-1" />
                            K
                        </Badge>
                    </div>
                    <RadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)} className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="relevance" id="relevance" />
                            <Label htmlFor="relevance" className="text-sm cursor-pointer">{t.relevance}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="title" id="title-sort" />
                            <Label htmlFor="title-sort" className="text-sm cursor-pointer">{t.title}</Label>
                        </div>
                    </RadioGroup>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <div className="relative">
                    <SearchIcon className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        type="search"
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 rtl:pr-10 rtl:pl-4 text-lg h-12"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowRecentSearches(!query && recentSearches.length > 0)}
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
                    )}
                </div>

                {/* Recent Searches */}
                {showRecentSearches && recentSearches.length > 0 && (
                    <Card className="mt-2 p-3">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {t.recentSearches}
                            </h4>
                            <Button variant="ghost" size="sm" onClick={clearRecentSearches}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {recentSearches.map((recent, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleRecentSearch(recent)}
                                >
                                    {recent}
                                </Button>
                            ))}
                        </div>
                    </Card>
                )}

                <ScrollArea className="flex-grow mt-6">
                    <div className="space-y-4 pr-4 rtl:pl-4 rtl:pr-0">
                        {isLoading && query ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Card key={i}>
                                        <CardContent className="p-4">
                                            <Skeleton className="h-4 w-20 mb-2" />
                                            <Skeleton className="h-5 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-full" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            results.map(result => (
                                <Card key={result.id} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleResultClick(result)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs text-primary font-bold uppercase">{result.source}</p>
                                            {result.relevanceScore && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <TrendingUp className="w-3 h-3 mr-1" />
                                                    {Math.round(result.relevanceScore)}%
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="font-headline font-semibold mb-1">{result.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{result.snippet}</p>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            query && !isLoading && <p className="text-center text-muted-foreground py-8">{t.noResults} "{query}".</p>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, BookOpen, Image as ImageIcon, Library, SearchIcon, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useBible, BibleEntry } from '@/hooks/use-bible';
import { useDrafts } from '@/hooks/use-drafts';
import { useVolumes, Chapter } from '@/hooks/use-volumes';
import { useGallery } from '@/hooks/use-gallery';
import { useModalStore } from '@/hooks/use-modal-store';

type SearchScope = 'all' | 'drafts' | 'bible' | 'gallery' | string; // string for volume IDs

interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    source: string;
    sourceType: 'draft' | 'bible' | 'gallery' | 'volume';
    url: string;
    data?: BibleEntry | { volumeId: string; chapter: Chapter };
}

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState<SearchScope>('all');
    const [results, setResults] = useState<SearchResult[]>([]);

    const { bibleData } = useBible();
    const { drafts } = useDrafts();
    const { volumes } = useVolumes();
    const { folders } = useGallery();
    const { openModal } = useModalStore();
    
    const searchOptions = useMemo(() => {
        const options = [
            { id: 'all', label: 'All Content', icon: Globe },
            { id: 'drafts', label: 'Drafts', icon: FileText },
            { id: 'bible', label: 'Bible', icon: BookOpen },
            { id: 'gallery', label: 'Gallery', icon: ImageIcon },
            { id: 'all_volumes', label: 'All Volumes', icon: Library }
        ];

        volumes.forEach(volume => {
            options.push({
                id: `volume_${volume.id}`,
                label: `Volume: ${volume.title}`,
                icon: Library,
            });
        });
        
        return options;

    }, [volumes]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        let newResults: SearchResult[] = [];

        // Search Drafts
        if (scope === 'all' || scope === 'drafts') {
            drafts.forEach(draft => {
                if (draft.title.toLowerCase().includes(lowerCaseQuery) || draft.content.toLowerCase().includes(lowerCaseQuery)) {
                    newResults.push({
                        id: `draft-${draft.id}`,
                        title: draft.title || 'Untitled Draft',
                        snippet: draft.content.substring(0, 150) + '...',
                        source: 'Draft',
                        sourceType: 'draft',
                        url: `/editor/${draft.id}`
                    });
                }
            });
        }

        // Search Bible
        if (scope === 'all' || scope === 'bible') {
            bibleData.forEach(category => {
                category.items.forEach(item => {
                    const fullText = item.title + ' ' + (item.fields || []).map(f => `${f.label} ${f.value}`).join(' ');
                    if (fullText.toLowerCase().includes(lowerCaseQuery)) {
                        newResults.push({
                            id: `bible-${category.category}-${item.title}`,
                            title: item.title,
                            snippet: item.fields?.[0]?.value.substring(0, 150) + '...' || 'Bible Entry',
                            source: `Bible: ${category.category}`,
                            sourceType: 'bible',
                            url: '#',
                            data: { category: category.category, entry: item }
                        });
                    }
                });
            });
        }
        
        // Search Gallery
        if (scope === 'all' || scope === 'gallery') {
            folders.forEach(folder => {
                folder.images.forEach(image => {
                    if (image.caption.toLowerCase().includes(lowerCaseQuery)) {
                         newResults.push({
                            id: `gallery-${image.id}`,
                            title: image.caption,
                            snippet: `Image in folder: ${folder.name}`,
                            source: 'Gallery',
                            sourceType: 'gallery',
                            url: '/gallery'
                        });
                    }
                })
            })
        }
        
        // Search Volumes
        if (scope === 'all' || scope.startsWith('volume_') || scope === 'all_volumes') {
            const targetVolumes = scope.startsWith('volume_') 
                ? volumes.filter(v => `volume_${v.id}` === scope)
                : volumes;

            targetVolumes.forEach(volume => {
                volume.chapters.forEach(chapter => {
                     if (chapter.title.toLowerCase().includes(lowerCaseQuery) || chapter.content.toLowerCase().includes(lowerCaseQuery)) {
                        newResults.push({
                            id: `chapter-${chapter.id}`,
                            title: chapter.title,
                            snippet: chapter.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                            source: `Volume: ${volume.title}`,
                            sourceType: 'volume',
                            url: '#',
                            data: { volumeId: volume.id, chapter: chapter }
                        });
                    }
                });
            });
        }

        setResults(newResults);

    }, [query, scope, bibleData, drafts, volumes, folders]);
    
    const handleResultClick = (result: SearchResult) => {
        if (result.url !== '#') {
            router.push(result.url);
        } else if (result.sourceType === 'bible' && result.data) {
            const { category, entry } = result.data as { category: string; entry: BibleEntry };
            openModal('bible', { category, entry });
        } else if (result.sourceType === 'volume' && result.data) {
            const { volumeId, chapter } = result.data as { volumeId: string; chapter: Chapter };
            openModal('chapter', { volumeId, chapter });
        }
    }


    return (
        <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-14rem)]">
            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
                <h2 className="font-headline text-lg font-bold mb-4">Search Options</h2>
                <RadioGroup value={scope} onValueChange={(value) => setScope(value)} className="space-y-2">
                    {searchOptions.map(option => (
                         <div key={option.id} className="flex items-center space-x-2">
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
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search all project files..."
                        className="w-full pl-10 text-lg h-12"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-grow mt-6">
                    <div className="space-y-4 pr-4">
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
                            query && <p className="text-center text-muted-foreground py-8">No results found for "{query}".</p>
                        )}
                    </div>
                </ScrollArea>
            </main>
        </div>
    );
}

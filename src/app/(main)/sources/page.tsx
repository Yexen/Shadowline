
'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, Star, BookOpen, Calendar, User, Palette, Skull, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


export interface Comic {
  id: number;
  name: string;
  year: number;
  author: string;
  illustrator: string;
  mainVillain: string;
  mainCharacters: string[];
  description: string;
  categories: string[];
  rating: number;
  isRead: boolean;
  inReadingList: boolean;
}

const initialComicsData: Comic[] = [
  {
    id: 1,
    name: "Batman: Year One",
    year: 1987,
    author: "Frank Miller",
    illustrator: "David Mazzucchelli",
    mainVillain: "Carmine Falcone",
    mainCharacters: ["Bruce Wayne/Batman", "James Gordon", "Selina Kyle"],
    description: "The definitive origin story of Batman, chronicling Bruce Wayne's first year as the Dark Knight and Jim Gordon's rise in the GCPD. A gritty, realistic take on how Batman began his war on crime.",
    categories: ["Origin Story", "Crime Drama", "Classic"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 2,
    name: "The Dark Knight Returns",
    year: 1986,
    author: "Frank Miller",
    illustrator: "Frank Miller",
    mainVillain: "The Joker, Superman",
    mainCharacters: ["Bruce Wayne/Batman", "Carrie Kelley/Robin", "Commissioner Yindel"],
    description: "An aging Bruce Wayne comes out of retirement to clean up Gotham City one last time. Set in a dystopian future, this story redefined Batman for a new generation.",
    categories: ["Future Timeline", "Dystopian", "Classic"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 3,
    name: "The Killing Joke",
    year: 1988,
    author: "Alan Moore",
    illustrator: "Brian Bolland",
    mainVillain: "The Joker",
    mainCharacters: ["Batman", "The Joker", "Barbara Gordon/Batgirl", "James Gordon"],
    description: "The Joker's most twisted scheme yet - proving that one bad day can drive anyone insane. Features the definitive Joker origin story and the crippling of Barbara Gordon.",
    categories: ["Psychological Horror", "Classic", "Joker Story"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 4,
    name: "Batman: The Long Halloween",
    year: 1996,
    author: "Jeph Loeb",
    illustrator: "Tim Sale",
    mainVillain: "Holiday Killer, Carmine Falcone",
    mainCharacters: ["Batman", "Harvey Dent", "James Gordon", "Catwoman"],
    description: "A year-long mystery as Batman, Gordon, and DA Harvey Dent hunt the Holiday Killer. Chronicles Harvey Dent's transformation into Two-Face.",
    categories: ["Mystery", "Crime Drama", "Holiday"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 5,
    name: "Batman: Hush",
    year: 2002,
    author: "Jeph Loeb",
    illustrator: "Jim Lee",
    mainVillain: "Hush, The Joker",
    mainCharacters: ["Batman", "Catwoman", "Superman", "The Riddler"],
    description: "A mysterious bandaged villain manipulates Batman's enemies in an elaborate scheme. Features beautiful Jim Lee artwork and explores Batman's relationships.",
    categories: ["Mystery", "Romance", "Modern"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 6,
    name: "Batman: Court of Owls",
    year: 2011,
    author: "Scott Snyder",
    illustrator: "Greg Capullo",
    mainVillain: "Court of Owls, Talon",
    mainCharacters: ["Batman", "Dick Grayson", "Alfred Pennyworth"],
    description: "Batman discovers an ancient secret society that has controlled Gotham for centuries. A modern classic that introduces the sinister Court of Owls.",
    categories: ["Horror", "Secret Society", "Modern"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 7,
    name: "Batman: The Man Who Laughs",
    year: 2005,
    author: "Ed Brubaker",
    illustrator: "Doug Mahnke",
    mainVillain: "The Joker",
    mainCharacters: ["Batman", "The Joker", "James Gordon"],
    description: "The Joker's first appearance in Gotham City, serving as a sequel to Year One. Shows the first encounter between Batman and his greatest nemesis.",
    categories: ["Origin Story", "Joker Story", "Crime Drama"],
    rating: 0,
    isRead: false,
    inReadingList: false
  },
  {
    id: 8,
    name: "Batman: Arkham Asylum",
    year: 1989,
    author: "Grant Morrison",
    illustrator: "Dave McKean",
    mainVillain: "The Joker, Amadeus Arkham",
    mainCharacters: ["Batman", "The Joker", "Two-Face", "Scarecrow"],
    description: "Batman enters Arkham Asylum to stop a riot, facing his deepest fears. A psychological journey through madness with surreal artwork.",
    categories: ["Psychological Horror", "Surreal", "Classic"],
    rating: 0,
    isRead: false,
    inReadingList: false
  }
];


const StarRating = ({ rating, onRate, comicId }: { rating: number; onRate: (id: number, rating: number) => void; comicId: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        onClick={() => onRate(comicId, star)}
        className={`transition-colors ${
          star <= rating ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'
        }`}
      >
        <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : ''}`} />
      </button>
    ))}
  </div>
);

const ComicCard = ({ comic, onToggleRead, onToggleReadingList, onSetRating }: { comic: Comic, onToggleRead: (id: number) => void, onToggleReadingList: (id: number) => void, onSetRating: (id: number, rating: number) => void }) => {
  return (
    <Card className="p-6 bg-card border hover:border-primary/50 transition-colors">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between mb-3">
            <h2 className="text-2xl font-headline font-bold text-primary mb-2">{comic.name}</h2>
            <div className="flex gap-2 flex-wrap">
              {comic.categories.map(category => (
                <Badge key={category} variant="secondary">{category}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2"><Calendar /><span className="text-muted-foreground">Year: {comic.year}</span></div>
            <div className="flex items-center gap-2"><User /><span className="text-muted-foreground">Author: {comic.author}</span></div>
            <div className="flex items-center gap-2"><Palette /><span className="text-muted-foreground">Artist: {comic.illustrator}</span></div>
            <div className="flex items-center gap-2"><Skull /><span className="text-muted-foreground">Villain: {comic.mainVillain}</span></div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Users />
              <span className="font-semibold">Main Characters:</span>
            </div>
            <p className="text-muted-foreground text-sm">{comic.mainCharacters.join(', ')}</p>
          </div>

          <p className="text-foreground/80 leading-relaxed">{comic.description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 min-w-[220px]">
          <Button
            onClick={() => onToggleReadingList(comic.id)}
            variant={comic.inReadingList ? 'default' : 'secondary'}
          >
            <BookOpen />
            {comic.inReadingList ? 'In Reading List' : 'Add to Reading List'}
          </Button>

          <Button
            onClick={() => onToggleRead(comic.id)}
            variant={comic.isRead ? 'secondary' : 'outline'}
          >
            {comic.isRead ? 'Mark as Unread' : 'Mark as Read'}
          </Button>

          {comic.isRead && (
            <div className="text-center bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground mb-2">Rate this comic:</p>
              <StarRating 
                rating={comic.rating} 
                onRate={onSetRating}
                comicId={comic.id}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


export default function ComicsDatabasePage() {
  const [comics, setComics] = useState(initialComicsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'year' | 'name' | 'author'>('year');
  const [sortOrder, setSortOrder] = useState('desc');

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    initialComicsData.forEach(comic => {
      comic.categories.forEach(cat => categories.add(cat));
    });
    return ['All', ...Array.from(categories)];
  }, []);

  const filteredComics = useMemo(() => {
    let filtered = comics.filter(comic => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = comic.name.toLowerCase().includes(lowerSearch) ||
                           comic.author.toLowerCase().includes(lowerSearch) ||
                           comic.description.toLowerCase().includes(lowerSearch) ||
                           comic.mainVillain.toLowerCase().includes(lowerSearch);
      
      const matchesCategory = selectedCategory === 'All' || 
                             comic.categories.includes(selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [comics, searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleToggleReadingList = (id: number) => {
    setComics(comics.map(comic => 
      comic.id === id ? { ...comic, inReadingList: !comic.inReadingList } : comic
    ));
  };

  const handleToggleRead = (id: number) => {
    setComics(comics.map(comic => 
      comic.id === id ? { ...comic, isRead: !comic.isRead } : comic
    ));
  };

  const handleSetRating = (id: number, rating: number) => {
    setComics(comics.map(comic => 
      comic.id === id ? { ...comic, rating, isRead: true } : comic
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Browse, search, and track your reading of essential Batman comics.
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search comics, authors, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
          
          <Select onValueChange={setSelectedCategory} defaultValue="All">
            <SelectTrigger className="w-full lg:w-[200px]">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <SelectValue placeholder="Filter by category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
             <Select onValueChange={(value: 'year' | 'name' | 'author') => setSortBy(value)} defaultValue="year">
                <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                </SelectContent>
            </Select>
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              size="icon"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredComics.map(comic => (
          <ComicCard
            key={comic.id}
            comic={comic}
            onToggleRead={handleToggleRead}
            onToggleReadingList={handleToggleReadingList}
            onSetRating={handleSetRating}
          />
        ))}
      </div>

      {filteredComics.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-lg">No comics found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

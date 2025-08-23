'use client';

import React, { useState, useMemo } from 'react';
import { Search, Star, Tv, Film, Calendar, User, Users, Filter, SortAsc, SortDesc, Clock, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface MediaItem {
    id: number;
    title: string;
    type: "Movie" | "TV Show";
    year: number;
    director: string;
    mainActor: string;
    villain: string;
    rating: string;
    runtime: string;
    description: string;
    categories: string[];
    boxOffice?: string;
    rottenTomatoes?: string;
    imdbScore?: string;
    seasons?: string;
    episodes?: string;
    network?: string;
    poster: string;
    watched: boolean;
    userRating: number;
    inWatchlist: boolean;
    dataAiHint?: string;
}

const mediaData: MediaItem[] = [
  // MOVIES
  {
    id: 1,
    title: "Batman (1989)",
    type: "Movie",
    year: 1989,
    director: "Tim Burton",
    mainActor: "Michael Keaton",
    villain: "The Joker",
    rating: "PG-13",
    runtime: "126 min",
    description: "Tim Burton's dark vision of Batman brought the character back to his noir roots. Michael Keaton's brooding performance and Jack Nicholson's iconic Joker created a gothic Gotham.",
    categories: ["Classic", "Dark", "Origin"],
    boxOffice: "$411.3M",
    rottenTomatoes: "73%",
    imdbScore: "7.5",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman movie poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 2,
    title: "Batman Returns (1992)",
    type: "Movie",
    year: 1992,
    director: "Tim Burton",
    mainActor: "Michael Keaton",
    villain: "Penguin, Catwoman",
    rating: "PG-13",
    runtime: "126 min",
    description: "Burton's sequel delved deeper into gothic horror with Danny DeVito's grotesque Penguin and Michelle Pfeiffer's seductive Catwoman in a winter wonderland Gotham.",
    categories: ["Classic", "Dark", "Horror"],
    boxOffice: "$266.8M",
    rottenTomatoes: "79%",
    imdbScore: "7.0",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman returns poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 3,
    title: "Batman Forever (1995)",
    type: "Movie",
    year: 1995,
    director: "Joel Schumacher",
    mainActor: "Val Kilmer",
    villain: "Two-Face, The Riddler",
    rating: "PG-13",
    runtime: "121 min",
    description: "A lighter, more colorful take on Batman with neon-soaked Gotham. Val Kilmer's Batman faces Tommy Lee Jones's Two-Face and Jim Carrey's maniacal Riddler.",
    categories: ["Colorful", "Action", "90s"],
    boxOffice: "$336.6M",
    rottenTomatoes: "38%",
    imdbScore: "5.4",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman forever poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 4,
    title: "Batman & Robin (1997)",
    type: "Movie",
    year: 1997,
    director: "Joel Schumacher",
    mainActor: "George Clooney",
    villain: "Mr. Freeze, Poison Ivy",
    rating: "PG-13",
    runtime: "125 min",
    description: "The infamous ice-pun filled finale of the original Batman film series. Arnold Schwarzenegger's Mr. Freeze and Uma Thurman's Poison Ivy in a camp spectacular.",
    categories: ["Camp", "Action", "90s"],
    boxOffice: "$238.2M",
    rottenTomatoes: "11%",
    imdbScore: "3.8",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman robin poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 5,
    title: "Batman Begins (2005)",
    type: "Movie",
    year: 2005,
    director: "Christopher Nolan",
    mainActor: "Christian Bale",
    villain: "Ra's al Ghul, Scarecrow",
    rating: "PG-13",
    runtime: "140 min",
    description: "Nolan's realistic reboot explored Bruce Wayne's journey to becoming Batman. A grounded origin story that launched the Dark Knight trilogy.",
    categories: ["Realistic", "Origin", "Modern"],
    boxOffice: "$371.9M",
    rottenTomatoes: "85%",
    imdbScore: "8.2",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman begins poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 6,
    title: "The Dark Knight (2008)",
    type: "Movie",
    year: 2008,
    director: "Christopher Nolan",
    mainActor: "Christian Bale",
    villain: "The Joker, Two-Face",
    rating: "PG-13",
    runtime: "152 min",
    description: "Heath Ledger's legendary Joker performance in Nolan's crime epic. Widely considered one of the greatest superhero films ever made.",
    categories: ["Realistic", "Crime", "Modern", "Masterpiece"],
    boxOffice: "$1.005B",
    rottenTomatoes: "94%",
    imdbScore: "9.0",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "dark knight poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 7,
    title: "The Dark Knight Rises (2012)",
    type: "Movie",
    year: 2012,
    director: "Christopher Nolan",
    mainActor: "Christian Bale",
    villain: "Bane, Talia al Ghul",
    rating: "PG-13",
    runtime: "165 min",
    description: "The epic conclusion to Nolan's trilogy. An older Batman faces Bane's revolution in Gotham and confronts his past with the League of Shadows.",
    categories: ["Realistic", "Epic", "Modern"],
    boxOffice: "$1.081B",
    rottenTomatoes: "87%",
    imdbScore: "8.4",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "dark knight rises",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 8,
    title: "Batman v Superman: Dawn of Justice (2016)",
    type: "Movie",
    year: 2016,
    director: "Zack Snyder",
    mainActor: "Ben Affleck",
    villain: "Lex Luthor, Doomsday",
    rating: "PG-13",
    runtime: "151 min",
    description: "Batman and Superman clash in Snyder's divisive epic. Ben Affleck's older, more brutal Batman confronts Henry Cavill's Superman in a dark DC universe.",
    categories: ["DCEU", "Crossover", "Dark"],
    boxOffice: "$873.6M",
    rottenTomatoes: "29%",
    imdbScore: "6.4",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman superman poster",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 9,
    title: "Justice League (2017)",
    type: "Movie",
    year: 2017,
    director: "Zack Snyder/Joss Whedon",
    mainActor: "Ben Affleck",
    villain: "Steppenwolf",
    rating: "PG-13",
    runtime: "120 min",
    description: "Batman assembles the Justice League to face an alien threat. The troubled production resulted in a lighter tone clashing with Snyder's vision.",
    categories: ["DCEU", "Team-up", "Action"],
    boxOffice: "$657.9M",
    rottenTomatoes: "40%",
    imdbScore: "6.0",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "justice league movie",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 10,
    title: "The Batman (2022)",
    type: "Movie",
    year: 2022,
    director: "Matt Reeves",
    mainActor: "Robert Pattinson",
    villain: "The Riddler, Penguin",
    rating: "PG-13",
    runtime: "176 min",
    description: "A noir detective story featuring a younger Batman in his second year. Robert Pattinson's emo Batman investigates a series of murders by Paul Dano's Riddler.",
    categories: ["Detective", "Noir", "Modern"],
    boxOffice: "$771.0M",
    rottenTomatoes: "85%",
    imdbScore: "7.8",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "the batman movie",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },

  // TV SHOWS
  {
    id: 11,
    title: "Batman (1966-1968)",
    type: "TV Show",
    year: 1966,
    director: "Various",
    mainActor: "Adam West",
    villain: "Various",
    rating: "TV-G",
    runtime: "25 min/episode",
    description: "The campy 60s series that defined Batman for a generation. Adam West and Burt Ward's colorful adventures with comic book sound effects and celebrity villains.",
    categories: ["Classic", "Camp", "60s"],
    seasons: "3 seasons",
    episodes: "120 episodes",
    network: "ABC",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman 66 show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 12,
    title: "Batman: The Animated Series (1992-1995)",
    type: "TV Show",
    year: 1992,
    director: "Bruce Timm, Eric Radomski",
    mainActor: "Kevin Conroy (voice)",
    villain: "Various",
    rating: "TV-Y7",
    runtime: "22 min/episode",
    description: "The definitive animated Batman. Kevin Conroy's iconic voice and art deco animation created timeless stories that balanced darkness with accessibility.",
    categories: ["Animation", "Classic", "Timeless"],
    seasons: "4 seasons",
    episodes: "85 episodes",
    network: "Fox Kids",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman animated series",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 13,
    title: "Batman Beyond (1999-2001)",
    type: "TV Show",
    year: 1999,
    director: "Bruce Timm, Paul Dini",
    mainActor: "Will Friedle (voice)",
    villain: "Various",
    rating: "TV-Y7",
    runtime: "22 min/episode",
    description: "An aging Bruce Wayne mentors teenager Terry McGinnis as the new Batman in Neo-Gotham. A cyberpunk take on the Batman legacy set in 2039.",
    categories: ["Animation", "Future", "Cyberpunk"],
    seasons: "3 seasons",
    episodes: "52 episodes",
    network: "Kids' WB",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "batman beyond show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 14,
    title: "Birds of Prey (2002-2003)",
    type: "TV Show",
    year: 2002,
    director: "Various",
    mainActor: "Ashley Scott",
    villain: "Various",
    rating: "TV-14",
    runtime: "42 min/episode",
    description: "Set in a Gotham where Batman has disappeared and the Joker is dead. Helena Kyle (Huntress) and Barbara Gordon fight crime with psychic Dinah Lance.",
    categories: ["Live Action", "Female-led", "2000s"],
    seasons: "1 season",
    episodes: "13 episodes",
    network: "The WB",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "birds prey show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 15,
    title: "The Batman (2004-2008)",
    type: "TV Show",
    year: 2004,
    director: "Various",
    mainActor: "Rino Romano (voice)",
    villain: "Various",
    runtime: "22 min/episode",
    rating: "TV-Y7",
    description: "A younger Batman in his early crime-fighting years. Featured redesigned villains and a more martial arts-focused Batman with updated animation.",
    categories: ["Animation", "2000s", "Action"],
    seasons: "5 seasons",
    episodes: "65 episodes",
    network: "Kids' WB",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "the batman 2004",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 16,
    title: "Batman: The Brave and the Bold (2008-2011)",
    type: "TV Show",
    year: 2008,
    director: "Various",
    mainActor: "Diedrich Bader (voice)",
    villain: "Various",
    rating: "TV-Y7",
    runtime: "22 min/episode",
    description: "A lighter take on Batman teaming up with different heroes each episode. Embraced the fun and adventure of Silver Age comics with musical episodes.",
    categories: ["Animation", "Team-up", "Fun"],
    seasons: "3 seasons",
    episodes: "65 episodes",
    network: "Cartoon Network",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "brave bold show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 17,
    title: "Gotham (2014-2019)",
    type: "TV Show",
    year: 2014,
    director: "Various",
    mainActor: "Ben McKenzie",
    villain: "Various",
    rating: "TV-14",
    runtime: "42 min/episode",
    description: "Young James Gordon's rise in the GCPD before Batman's arrival. Featured origin stories for classic villains in a crime-ridden pre-Batman Gotham.",
    categories: ["Live Action", "Crime", "Origins"],
    seasons: "5 seasons",
    episodes: "100 episodes",
    network: "Fox",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "gotham tv show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 18,
    title: "Titans (2018-2023)",
    type: "TV Show",
    year: 2018,
    director: "Various",
    mainActor: "Brenton Thwaites",
    villain: "Various",
    rating: "TV-MA",
    runtime: "45 min/episode",
    description: "Dick Grayson leads a team of young heroes. Featured a darker, more mature take on Robin's transition to Nightwing and Batman's influence on his sidekicks.",
    categories: ["Live Action", "Mature", "Team"],
    seasons: "4 seasons",
    episodes: "49 episodes",
    network: "HBO Max",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "titans tv show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  },
  {
    id: 19,
    title: "Pennyworth (2019-2022)",
    type: "TV Show",
    year: 2019,
    director: "Various",
    mainActor: "Jack Bannon",
    villain: "Various",
    rating: "TV-MA",
    runtime: "60 min/episode",
    description: "Young Alfred Pennyworth's SAS background and early relationship with the Wayne family. Set in an alternate 1960s London with political intrigue.",
    categories: ["Live Action", "Period", "Alfred"],
    seasons: "3 seasons",
    episodes: "30 episodes",
    network: "HBO Max",
    poster: "https://placehold.co/300x450.png",
    dataAiHint: "pennyworth tv show",
    watched: false,
    userRating: 0,
    inWatchlist: false
  }
];

const StarRating = ({ rating, onRate, itemId }: { rating: number; onRate: (id: number, rating: number) => void; itemId: number; }) => (
    <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map(star => (
        <button
            key={star}
            onClick={() => onRate(itemId, star)}
            className={`transition-colors ${
            star <= rating ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'
            }`}
        >
            <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : ''}`} />
        </button>
        ))}
    </div>
);

export default function BatmanMediaDatabase() {
  const [media, setMedia] = useState(mediaData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'year' | 'title' | 'director'>('year');
  const [sortOrder, setSortOrder] = useState('desc');

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    mediaData.forEach(item => {
      item.categories.forEach(cat => categories.add(cat));
    });
    return ['All', ...Array.from(categories)];
  }, []);

  const filteredMedia = useMemo(() => {
    let filtered = media.filter(item => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(lowerSearch) ||
                           item.director.toLowerCase().includes(lowerSearch) ||
                           item.description.toLowerCase().includes(lowerSearch);
      
      const matchesType = selectedType === 'All' || item.type === selectedType;
      const matchesCategory = selectedCategory === 'All' || 
                             item.categories.includes(selectedCategory);
      
      return matchesSearch && matchesType && matchesCategory;
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
  }, [media, searchTerm, selectedType, selectedCategory, sortBy, sortOrder]);

  const toggleWatchlist = (id: number) => {
    setMedia(media.map(item => 
      item.id === id ? { ...item, inWatchlist: !item.inWatchlist } : item
    ));
  };

  const toggleWatched = (id: number) => {
    setMedia(media.map(item => 
      item.id === id ? { ...item, watched: !item.watched } : item
    ));
  };

  const setRating = (id: number, rating: number) => {
    setMedia(media.map(item => 
      item.id === id ? { ...item, userRating: rating, watched: true } : item
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground font-body">
          Explore the complete collection of Batman movies and TV shows.
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search titles, directors, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
          
          <Select onValueChange={(value) => setSelectedType(value)} defaultValue="All">
            <SelectTrigger className="w-full lg:w-[200px]">
                <div className="flex items-center gap-2"><Film className="w-5 h-5 text-muted-foreground" /><SelectValue placeholder="All Types" /></div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Movie">Movies</SelectItem>
              <SelectItem value="TV Show">TV Shows</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setSelectedCategory(value)} defaultValue="All">
            <SelectTrigger className="w-full lg:w-[200px]">
              <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-muted-foreground" /><SelectValue placeholder="Filter by category" /></div>
            </SelectTrigger>
            <SelectContent>
              {allCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
             <Select onValueChange={(value: 'year' | 'title' | 'director') => setSortBy(value)} defaultValue="year">
                <SelectTrigger className="w-full lg:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                </SelectContent>
            </Select>
            <Button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} variant="outline" size="icon">
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMedia.map(item => (
            <Card key={item.id} className="bg-card hover:border-primary/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6 p-6">
                    <div className="flex-shrink-0">
                         <Image src={item.poster} alt={`${item.title} poster`} width={200} height={300} data-ai-hint={item.dataAiHint} className="rounded-lg border-2 border-border shadow-lg" />
                    </div>
              
                    <div className="flex-1">
                        <CardHeader className="p-0 mb-4">
                             <div className="flex flex-wrap items-start justify-between">
                                <div className="flex items-center gap-3 mb-2">
                                    {item.type === 'Movie' ? <Film className="w-6 h-6 text-primary" /> : <Tv className="w-6 h-6 text-primary" />}
                                    <CardTitle className="text-2xl font-headline text-primary">{item.title}</CardTitle>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {item.categories.map(category => (<Badge key={category} variant="secondary">{category}</Badge>))}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /><span className="text-muted-foreground">YEAR: <span className="text-foreground">{item.year}</span></span></div>
                                <div className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /><span className="text-muted-foreground">DIRECTOR: <span className="text-foreground">{item.director}</span></span></div>
                                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span className="text-muted-foreground">STAR: <span className="text-foreground">{item.mainActor}</span></span></div>
                                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /><span className="text-muted-foreground">RUNTIME: <span className="text-foreground">{item.runtime}</span></span></div>
                            </div>
                            
                            {item.type === 'Movie' && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div className="flex items-center gap-2"><Award className="w-4 h-4 text-primary" /><span className="text-muted-foreground">BOX OFFICE: <span className="text-foreground">{item.boxOffice}</span></span></div><div className="text-muted-foreground">RT: <span className="text-foreground">{item.rottenTomatoes}</span></div><div className="text-muted-foreground">IMDB: <span className="text-foreground">{item.imdbScore}/10</span></div></div>)}
                            {item.type === 'TV Show' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"><div className="text-muted-foreground">SEASONS: <span className="text-foreground">{item.seasons}</span></div><div className="text-muted-foreground">EPISODES: <span className="text-foreground">{item.episodes}</span></div></div>)}
                            
                            <div className="text-sm"><span className="text-muted-foreground font-bold uppercase tracking-wide">Villain: </span><span className="text-foreground">{item.villain}</span></div>
                            <p className="text-foreground/80 leading-relaxed text-sm">{item.description}</p>
                        </CardContent>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button onClick={() => toggleWatchlist(item.id)} variant={item.inWatchlist ? 'default' : 'secondary'}>
                            {item.type === 'Movie' ? <Film className="mr-2"/> : <Tv className="mr-2" />}
                            {item.inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        </Button>
                        <Button onClick={() => toggleWatched(item.id)} variant={item.watched ? 'secondary' : 'outline'}>
                            {item.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
                        </Button>
                        {item.watched && (<Card className="text-center p-3 bg-background"><CardDescription className="text-xs mb-2 uppercase tracking-wide">Rate This {item.type}</CardDescription><StarRating rating={item.userRating} onRate={setRating} itemId={item.id} /></Card>)}
                    </div>
                </div>
            </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <p className="text-muted-foreground text-lg">No media found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

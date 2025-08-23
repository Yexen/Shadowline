'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, BookOpen, Calendar, User, Palette, Skull, Users } from 'lucide-react';

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

interface ComicCardProps {
  comic: Comic;
  onToggleReadingList: (id: number) => void;
  onToggleRead: (id: number) => void;
  onSetRating: (id: number, rating: number) => void;
}

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

export function ComicCard({ comic, onToggleRead, onToggleReadingList, onSetRating }: ComicCardProps) {
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
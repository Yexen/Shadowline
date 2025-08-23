
'use client';

import { Button } from '@/components/ui/button';
import { useWatchlist, type Video } from '@/hooks/use-watchlist';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WatchlistButtonProps {
  video: Video;
}

export function WatchlistButton({ video }: WatchlistButtonProps) {
  const { addVideo, hasVideo, isLoaded } = useWatchlist();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsBookmarked(hasVideo(video.id));
    }
  }, [isLoaded, hasVideo, video.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addVideo(video);
    setIsBookmarked(true);
  };
  
  if (!isLoaded) {
    return <Button variant="outline" size="sm" disabled>...</Button>
  }

  if (isBookmarked) {
    return (
        <Button variant="secondary" size="sm" disabled>
            <BookmarkCheck className="mr-2" />
            Added
        </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Bookmark className="mr-2" />
      Watchlist
    </Button>
  );
}

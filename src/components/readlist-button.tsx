
'use client';

import { Button } from '@/components/ui/button';
import { useReadlist, type NewsArticle } from '@/hooks/use-readlist';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReadlistButtonProps {
  article: NewsArticle;
}

export function ReadlistButton({ article }: ReadlistButtonProps) {
  const { toggleArticle, hasArticle, isLoaded } = useReadlist();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsBookmarked(hasArticle(article.id));
    }
  }, [isLoaded, hasArticle, article.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleArticle(article);
    setIsBookmarked(!isBookmarked);
  };
  
  if (!isLoaded) {
    return <Button variant="outline" size="sm" disabled>...</Button>
  }

  return (
    <Button 
        variant={isBookmarked ? "secondary" : "outline"} 
        size="sm" 
        onClick={handleClick}
        aria-label={isBookmarked ? "Remove from Read List" : "Add to Read List"}
    >
        {isBookmarked ? <BookmarkCheck className="mr-2" /> : <Bookmark className="mr-2" />}
        {isBookmarked ? 'Added' : 'Read List'}
    </Button>
  );
}


'use client';

import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RefreshButtonProps {
  onRefresh?: (data: { videos: any[], news: any[] }) => void;
  disabled?: boolean;
}

export function RefreshButton({ onRefresh, disabled = false }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      toast({ title: 'Refreshing feeds...', description: 'Loading latest videos and news' });
      
      // Fetch both videos and news in parallel
      const [videosResponse, newsResponse] = await Promise.all([
        fetch('/api/feed/videos', { cache: 'no-store' }),
        fetch('/api/feed/news', { cache: 'no-store' })
      ]);
      
      const videosData = await videosResponse.json();
      const newsData = await newsResponse.json();
      
      if (!videosResponse.ok || !newsResponse.ok) {
        throw new Error('Failed to refresh feeds');
      }
      
      // Call the parent's refresh handler if provided
      if (onRefresh) {
        onRefresh({
          videos: videosData.videos || [],
          news: newsData.news || []
        });
      }
      
      toast({ 
        title: 'Feeds refreshed!', 
        description: `Updated ${videosData.videos?.length || 0} videos and ${newsData.news?.length || 0} news articles`
      });
      
    } catch (error: any) {
      console.error('Refresh error:', error);
      toast({ 
        variant: 'destructive',
        title: 'Refresh failed', 
        description: 'Could not refresh feeds. Please try again.' 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={disabled || isRefreshing} variant="outline" size="sm">
      <RefreshCw className={isRefreshing ? 'animate-spin mr-2' : 'mr-2'} />
      {isRefreshing ? 'Refreshing...' : 'Refresh'}
    </Button>
  );
}


'use client';

import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = () => {
    setIsRefreshing(true);
    router.refresh();
    // The refresh happens very quickly, but we can add a small delay 
    // to the loading state to provide visual feedback.
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Button onClick={handleClick} disabled={isRefreshing} variant="outline" size="sm">
      <RefreshCw className={isRefreshing ? 'animate-spin mr-2' : 'mr-2'} />
      Refresh
    </Button>
  );
}


'use client';

import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = () => {
    setIsRefreshing(true);
    // Force a hard refresh of the page to reload all data
    window.location.reload();
  };

  return (
    <Button onClick={handleClick} disabled={isRefreshing} variant="outline" size="sm">
      <RefreshCw className={isRefreshing ? 'animate-spin mr-2' : 'mr-2'} />
      Refresh
    </Button>
  );
}

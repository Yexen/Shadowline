
'use client';

import { useLogo } from '@/hooks/use-logo';
import { cn } from '@/lib/utils';

export function BatLogo({ className }: { className?: string }) {
  const { isLoaded } = useLogo(); // We might not need the URL anymore but keep hook for consistency

  if (!isLoaded) {
    return <div className={cn("bg-muted/50 animate-pulse", className)} />;
  }
  
  // Render SVG inline for better control and to remove the ellipse
  return (
    <div className={cn("relative", className)}>
        <svg viewBox="0 0 512 254.3" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-contain">
            <path fill="currentColor" d="m256 12.3-37.4 39.5c-4.3 4.5-5.3 11.1-2.6 16.5l23.5 48.6-67.4 12.7c-7.1 1.3-12.4 7.6-12.4 14.9v57.8c0 5.4 4.4 9.8 9.8 9.8h172.9c5.4 0 9.8-4.4 9.8-9.8v-57.8c0-7.3-5.3-13.6-12.4-14.9l-67.4-12.7 23.5-48.6c2.7-5.5 1.7-12-2.6-16.5L256 12.3z"/>
        </svg>
    </div>
  );
}

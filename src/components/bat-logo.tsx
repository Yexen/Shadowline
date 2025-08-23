
'use client';

import { useLogo } from '@/hooks/use-logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { useState } from 'react';

export function BatLogo({ className }: { className?: string }) {
  const { logoUrl, isLoaded } = useLogo();
  const [isLoading, setIsLoading] = useState(true);

  if (!isLoaded) {
    return <Skeleton className={cn("bg-muted/50", className)} />;
  }

  return (
    <div className={cn("relative", className)}>
        {isLoading && <Skeleton className={cn("absolute inset-0 bg-muted/50", className)} />}
        <Image 
            src={logoUrl}
            alt="Logo"
            fill
            className={cn(
              "object-contain transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            unoptimized // Useful if the logo is an SVG or to avoid Next.js optimization issues
        />
    </div>
  );
}

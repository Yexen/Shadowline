
'use client';

import { useLogo } from '@/hooks/use-logo';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function BatLogo({ className }: { className?: string }) {
  const { logoUrl, isLoaded } = useLogo();

  if (!isLoaded) {
    return <div className={cn("bg-muted/50 animate-pulse", className)} />;
  }

  return (
    <div className={cn("relative", className)}>
        <Image
          src={logoUrl}
          alt="App Logo"
          fill
          className="object-contain"
          unoptimized // Required for SVG data URLs
        />
    </div>
  );
}

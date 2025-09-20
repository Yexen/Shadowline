
'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

// Direct Vercel storage URL - no localStorage complications
const LOGO_URL = 'https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/icon-512x512%20%281%29.png';

export function BatLogo({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Fallback to text if image fails
    return (
      <div className={cn("flex items-center justify-center text-primary font-bold", className)}>
        SL
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
        <Image
            src={LOGO_URL}
            alt="Shadowline Logo"
            fill
            className={cn(
              "object-contain transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            unoptimized
            priority
        />
    </div>
  );
}

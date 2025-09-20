
'use client';

import { cn } from '@/lib/utils';

// SIDEBAR TOGGLE LOGO - Acts as the sidebar expand/collapse button
export function BatLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        "transition-colors shadow-sm",
        "cursor-pointer aspect-square",
        className
      )}
      style={{ borderRadius: '20%' }}
    >
      <img
        src="https://qh7zmtvimx9i7m9w.public.blob.vercel-storage.com/apple-touch-icon.png"
        alt="Shadowline"
        className="w-full h-full object-cover"
        style={{ borderRadius: '20%' }}
        onError={(e) => {
          // Fallback to text if image fails
          e.currentTarget.style.display = 'none';
          e.currentTarget.parentElement!.innerHTML = '<div class="text-primary font-bold text-xl flex items-center justify-center w-full h-full">SL</div>';
        }}
      />
    </div>
  );
}

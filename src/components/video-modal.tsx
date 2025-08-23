
'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  videoId?: string;            // YouTube ID (e.g., "C-p32MOfn2c")
  open: boolean;
  onClose: () => void;
  title?: string;
};

export function VideoModal({ videoId, open, onClose, title }: Props) {
  // stop playback when closing
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Don’t render DOM when closed (avoids background audio)
  if (!open) return null;

  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : undefined;

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 inline-flex items-center justify-center rounded-md bg-black/50 p-2 text-white hover:bg-black/70"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {src ? (
          <iframe
            key={videoId} // reset playback per video
            src={src}
            title={title || 'Video player'}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/80">
            Unable to load video.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Gamepad2, ExternalLink } from 'lucide-react';

export function GameModalButton({
  title,
  slug,
}: {
  title: string;
  slug: string; // folder name under /public/games/<slug>/index.html
}) {
  const [open, setOpen] = useState(false);
  const href = `/games/${slug}/`;

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Gamepad2 className="w-4 h-4" />
          Play in app
        </Button>
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Open full tab
          </Button>
        </a>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl w-[96vw]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="w-full aspect-video rounded overflow-hidden">
            <iframe
              src={href}
              className="w-full h-full"
              allow="fullscreen; gamepad; accelerometer; autoplay"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

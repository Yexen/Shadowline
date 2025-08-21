
'use client';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';

interface GothamMapProps {
  isOpen: boolean;
  onClose: () => void;
  mapHtml: string;
  title: string;
}

export function GothamMap({ isOpen, onClose, mapHtml, title }: GothamMapProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-none p-0 overflow-hidden">
        <DialogHeader className="sr-only">
            <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <iframe
          srcDoc={mapHtml}
          className="w-full h-full border-0"
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}

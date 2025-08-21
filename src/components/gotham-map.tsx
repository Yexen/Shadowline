
'use client';

import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { mapHtml } from '@/lib/gotham-map-html';

interface GothamMapProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GothamMap({ isOpen, onClose }: GothamMapProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-none p-0 overflow-hidden">
        <DialogHeader className="sr-only">
            <DialogTitle>Interactive Gotham City Map</DialogTitle>
        </DialogHeader>
        <iframe
          srcDoc={mapHtml}
          className="w-full h-full border-0"
          title="Interactive Gotham City Map"
        />
      </DialogContent>
    </Dialog>
  );
}

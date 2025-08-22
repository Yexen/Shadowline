
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Volume } from '@/hooks/use-volumes';

interface OverviewEditorProps {
  volume: Volume | null | undefined;
  onSave: (volumeId: string, overview: string) => void;
  onClose: () => void;
}

export function OverviewEditor({ volume, onSave, onClose }: OverviewEditorProps) {
  const [overview, setOverview] = useState('');

  useEffect(() => {
    if (volume) {
      setOverview(volume.overview || '');
    }
  }, [volume]);

  const handleSave = () => {
    if (volume) {
      onSave(volume.id, overview);
    }
  };
  
  if (!volume) {
    return null;
  }

  return (
    <Dialog open={!!volume} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Volume Overview: {volume.title}</DialogTitle>
           <DialogDescription>
            Write a high-level summary or outline for this volume.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="min-h-[300px] resize-y"
            placeholder="Write your volume's overview here..."
          />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>
                Cancel
            </Button>
            <Button onClick={handleSave}>Save Overview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

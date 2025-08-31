
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
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col">
        <DialogHeader className="pb-6">
          <DialogTitle className="font-headline text-2xl">Volume Overview</DialogTitle>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{volume.title}</h3>
            <DialogDescription className="text-base">
              Create a comprehensive overview, outline, or summary for this volume. This will help you maintain consistency and structure throughout your writing process.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-grow flex flex-col py-4">
          <Textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            className="flex-grow resize-none border-none p-6 focus-visible:ring-0 bg-gradient-to-br from-background to-muted/10 rounded-lg text-base leading-relaxed"
            placeholder="Write your volume overview here...\n\nConsider including:\n• Main story arc and themes\n• Character development goals\n• Key plot points and turning moments\n• Setting and world-building notes\n• Tone and style guidelines"
          />
        </div>
        <DialogFooter className="justify-between pt-6 border-t border-border/30">
            <div className="flex items-center text-sm text-muted-foreground">
                <span>Characters: {overview.length.toLocaleString()}</span>
                <span className="mx-2">•</span>
                <span>Words: {overview.trim().split(/\s+/).filter(Boolean).length.toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} className="px-6">Save Overview</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

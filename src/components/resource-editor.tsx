
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { Volume } from '@/hooks/use-volumes';

interface ResourceEditorProps {
  volume: Volume | null | undefined;
  onSave: (volumeId: string, resources: string) => void;
  onClose: () => void;
}

export function ResourceEditor({ volume, onSave, onClose }: ResourceEditorProps) {
  const [resources, setResources] = useState('');

  useEffect(() => {
    if (volume) {
      setResources(volume.resources || '');
    }
  }, [volume]);

  const handleSave = () => {
    if (volume) {
      onSave(volume.id, resources);
    }
  };
  
  if (!volume) {
    return null;
  }

  return (
    <Dialog open={!!volume} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Resources: {volume.title}</DialogTitle>
          <DialogDescription>
            Manage external links and research materials for this volume.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={resources}
            onChange={(e) => setResources(e.target.value)}
            className="min-h-[300px] resize-y"
            placeholder="Write your volume's resources, notes, and links here..."
          />
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={onClose}>
                Cancel
            </Button>
            <Button onClick={handleSave}>Save Resources</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

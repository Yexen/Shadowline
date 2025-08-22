
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Link as LinkIcon } from 'lucide-react';
import type { Volume, VolumeResource } from '@/hooks/use-volumes';
import { ScrollArea } from './ui/scroll-area';

interface ResourceEditorProps {
  volume: Volume | null | undefined;
  onSave: (volumeId: string, resources: VolumeResource[]) => void;
  onClose: () => void;
}

export function ResourceEditor({ volume, onSave, onClose }: ResourceEditorProps) {
  const [resources, setResources] = useState<VolumeResource[]>([]);

  useEffect(() => {
    if (volume) {
      setResources(volume.resources || []);
    }
  }, [volume]);

  const handleSave = () => {
    if (volume) {
      const filteredResources = resources.filter(r => r.title.trim() !== '' && r.url.trim() !== '');
      onSave(volume.id, filteredResources);
    }
  };

  const addResourceField = () => {
    setResources([...resources, { id: `res-${Date.now()}`, title: '', url: '' }]);
  };
  
  const updateResource = (index: number, field: 'title' | 'url', value: string) => {
    const newResources = [...resources];
    newResources[index][field] = value;
    setResources(newResources);
  };
  
  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
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
        <ScrollArea className="max-h-[60vh]">
        <div className="space-y-4 py-4 pr-4">
          {resources.map((resource, index) => (
            <div key={resource.id} className="flex items-end gap-2">
              <div className="flex-grow space-y-1">
                <Input 
                  placeholder="Resource Title" 
                  value={resource.title} 
                  onChange={e => updateResource(index, 'title', e.target.value)}
                />
                <Input 
                  placeholder="https://example.com" 
                  value={resource.url} 
                  onChange={e => updateResource(index, 'url', e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeResource(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addResourceField}>
            <PlusCircle className="mr-2" /> Add Resource
          </Button>
        </div>
        </ScrollArea>
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

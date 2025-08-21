
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { BibleEntry } from '@/hooks/use-bible';

interface BibleEditorProps {
  entry: BibleEntry | null;
  category: string;
  onSave: (category: string, entry: BibleEntry) => void;
  onClose: () => void;
}

export function BibleEditor({ entry, category, onSave, onClose }: BibleEditorProps) {
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setSnippet(entry.snippet);
    } else {
      setTitle('');
      setSnippet('');
    }
  }, [entry]);

  const handleSave = () => {
    if (title && snippet) {
      onSave(category, { title, snippet });
      onClose();
    }
  };

  const isOpen = !!entry;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Bible Entry</DialogTitle>
          <DialogDescription>
            Update the details for this entry in the '{category}' category.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., The Batcave"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snippet">Snippet</Label>
            <Textarea
              id="snippet"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Batman's secret headquarters..."
              rows={5}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

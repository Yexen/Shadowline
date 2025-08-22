
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Chapter } from '@/hooks/use-volumes';
import { Input } from './ui/input';

interface ChapterEditorProps {
  chapter: Chapter | null | undefined;
  volumeId: string;
  onSave: (volumeId: string, chapterId: string, title: string, content: string) => void;
  onClose: () => void;
}

export function ChapterEditor({ chapter, volumeId, onSave, onClose }: ChapterEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setContent(chapter.content);
    }
  }, [chapter]);

  const handleSave = () => {
    if (chapter) {
      onSave(volumeId, chapter.id, title, content);
    }
  };
  
  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  if (!chapter) {
    return null;
  }

  return (
    <Dialog open={!!chapter} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-headline text-lg"
            placeholder="Chapter Title"
          />
        </DialogHeader>
        <div className="flex-grow flex flex-col gap-4 py-4 overflow-y-hidden">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow resize-none w-full"
            placeholder="Write chapter content here..."
          />
        </div>
         <DialogFooter className="justify-between">
            <span className="text-sm text-muted-foreground">Word Count: {wordCount}</span>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save Chapter</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

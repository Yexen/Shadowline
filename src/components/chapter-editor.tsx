
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
      <DialogContent className="sm:max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-headline text-xl font-bold border-none p-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
            placeholder="Enter chapter title..."
          />
        </DialogHeader>
        <div className="flex-grow flex flex-col gap-4 py-2 overflow-hidden">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-grow resize-none w-full border-none p-4 focus-visible:ring-0 bg-gradient-to-br from-background to-muted/10 rounded-lg text-base leading-relaxed"
            placeholder="Start writing your chapter here...\n\nTip: Use markdown formatting for better structure."
          />
        </div>
         <DialogFooter className="justify-between pt-4 border-t border-border/30">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-medium">Words: {wordCount.toLocaleString()}</span>
                <span>•</span>
                <span>~{Math.ceil(wordCount / 200)} min read</span>
                <span>•</span>
                <span>Characters: {content.length.toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} className="px-6">Save Chapter</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

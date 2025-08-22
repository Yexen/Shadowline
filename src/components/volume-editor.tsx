
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Volume, Chapter } from '@/hooks/use-volumes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Trash2, GripVertical, BookOpen, PlusCircle, Download } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useModalStore } from '@/hooks/use-modal-store';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface VolumeEditorProps {
  volume: Volume | null;
  onSave: (volume: Volume) => void;
  onClose: () => void;
  onDeleteChapter: (volumeId: string, chapterId: string) => void;
  onAddChapter: (volumeId: string) => void;
}

export function VolumeEditor({ volume, onSave, onClose, onDeleteChapter, onAddChapter }: VolumeEditorProps) {
  const [currentVolume, setCurrentVolume] = useState<Volume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { openModal } = useModalStore();

  useEffect(() => {
    if (volume) {
      setCurrentVolume(JSON.parse(JSON.stringify(volume)));
    } else {
      setCurrentVolume(null);
    }
  }, [volume]);
  
  const handleChapterClick = (chapterId: string) => {
    if (currentVolume) {
        openModal('chapter', { volumeId: currentVolume.id, chapterId: chapterId });
    }
  };

  const handleFieldChange = (field: keyof Volume, value: any) => {
    if (currentVolume) {
      setCurrentVolume({ ...currentVolume, [field]: value });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentVolume) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        handleFieldChange('coverImage', loadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (currentVolume) {
      onSave(currentVolume);
      onClose();
    }
  };
  
  const handleAddChapter = () => {
    if (currentVolume) {
        onAddChapter(currentVolume.id);
    }
  }

  const handleExport = (content: string, fileName: string, format: 'txt' | 'md') => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleExportVolume = (format: 'txt' | 'md') => {
    if (!currentVolume) return;
    const volumeContent = currentVolume.chapters
      .map(ch => `## ${ch.title}\n\n${ch.content}`)
      .join('\n\n---\n\n');
    handleExport(volumeContent, currentVolume.title, format);
  };
  
  const handleExportChapter = (chapter: Chapter, format: 'txt' | 'md') => {
    handleExport(chapter.content, chapter.title, format);
  };

  if (!currentVolume) return null;

  return (
    <Dialog open={!!volume} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Editing Volume: {volume?.title}</DialogTitle>
          <DialogDescription>
            Manage the details, chapters, and cover art for this volume.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-grow overflow-hidden">
          {/* Left Column: Details & Cover */}
          <div className="md:col-span-1 space-y-4">
            <div>
              <Label htmlFor="volume-title">Title</Label>
              <Input
                id="volume-title"
                value={currentVolume.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="font-bold"
              />
            </div>
            <div>
              <Label htmlFor="volume-description">Description</Label>
              <Textarea
                id="volume-description"
                value={currentVolume.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label>Cover Image</Label>
              <div className="aspect-w-3 aspect-h-4 bg-muted rounded-md overflow-hidden relative group">
                {currentVolume.coverImage ? (
                  <img src={currentVolume.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                     <ImagePlus className="mr-2"/> Change
                   </Button>
                   <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chapters */}
          <div className="md:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Chapters</h3>
                <Button variant="outline" size="sm" onClick={handleAddChapter}><PlusCircle className="mr-2"/> Add Chapter</Button>
            </div>
            <ScrollArea className="flex-grow border rounded-md p-2 bg-muted/50">
              {currentVolume.chapters.length > 0 ? (
                <ul className="space-y-2">
                  {currentVolume.chapters.map((chapter) => (
                    <li key={chapter.id} className="flex items-center justify-between p-2 bg-card rounded-md group">
                      <div className="flex items-center gap-2 flex-grow min-w-0">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <span className="font-medium truncate">{chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <Button variant="ghost" size="sm" onClick={() => handleChapterClick(chapter.id)}>
                            <BookOpen className="mr-2" /> Open
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">Export</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExportChapter(chapter, 'md')}>Markdown (.md)</Button>
                                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExportChapter(chapter, 'txt')}>Text (.txt)</Button>
                                <Button variant="ghost" className="w-full justify-start" disabled>PDF (.pdf)</Button>
                            </PopoverContent>
                        </Popover>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete "{chapter.title}". This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteChapter(currentVolume.id, chapter.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground py-8">No chapters yet.</p>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="justify-between">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline"><Download className="mr-2"/> Export Volume</Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExportVolume('md')}>Markdown (.md)</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => handleExportVolume('txt')}>Text (.txt)</Button>
                    <Button variant="ghost" className="w-full justify-start" disabled>PDF (.pdf)</Button>
                </PopoverContent>
            </Popover>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

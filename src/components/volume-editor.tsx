
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Volume, Chapter } from '@/hooks/use-volumes';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Trash2, BookOpen, PlusCircle, GripVertical } from 'lucide-react';
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

function ExportPopover({ onExport, disabled = false }: { onExport: (format: 'txt' | 'md') => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <div onMouseLeave={() => setOpen(false)}>
            <PopoverTrigger asChild onMouseEnter={() => setOpen(true)}>
                <Button variant="ghost" size="sm" disabled={disabled}>Export</Button>
            </PopoverTrigger>
            {open && (
                <PopoverContent className="w-48 p-2" onMouseLeave={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { onExport('md'); setOpen(false); }}>Markdown (.md)</Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { onExport('txt'); setOpen(false); }}>Text (.txt)</Button>
                    <Button variant="ghost" className="w-full justify-start" disabled>PDF (.pdf)</Button>
                </PopoverContent>
            )}
        </div>
    </Popover>
  );
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
        console.log('Opening chapter modal with:', { chapter: { volumeId: currentVolume.id, chapterId } });
        openModal('chapter', { chapter: { volumeId: currentVolume.id, chapterId: chapterId } });
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
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Editing Volume: {volume?.title}</DialogTitle>
          <DialogDescription>
            Manage the details, chapters, and cover art for this volume.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6 flex-grow overflow-hidden">
          {/* Left Column: Details & Cover */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="volume-title" className="text-sm font-medium">Volume Title</Label>
              <Input
                id="volume-title"
                value={currentVolume.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="font-bold text-lg"
                placeholder="Enter volume title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="volume-description"
                value={currentVolume.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Describe this volume"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cover Image</Label>
              <div className="aspect-[3/4] bg-gradient-to-br from-muted to-muted/60 rounded-lg overflow-hidden relative group border border-border/50">
                {currentVolume.coverImage && !currentVolume.coverImage.includes('placehold') ? (
                  <img src={currentVolume.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImagePlus className="h-12 w-12 mb-3 opacity-50" />
                    <span className="text-sm font-medium">No Cover Image</span>
                    <span className="text-xs mt-1">Click to upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                   <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                     <ImagePlus className="mr-2 h-4 w-4"/> {currentVolume.coverImage && !currentVolume.coverImage.includes('placehold') ? 'Change' : 'Upload'} Cover
                   </Button>
                   <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Chapters */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-lg">Chapters</h3>
                    <p className="text-sm text-muted-foreground">{currentVolume.chapters.length} {currentVolume.chapters.length === 1 ? 'chapter' : 'chapters'} in this volume</p>
                </div>
                <Button variant="outline" onClick={handleAddChapter}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Chapter
                </Button>
            </div>
            <ScrollArea className="flex-grow border border-border/50 rounded-lg p-4 bg-gradient-to-br from-background to-muted/20">
              {currentVolume.chapters.length > 0 ? (
                <ul className="space-y-3">
                  {currentVolume.chapters.map((chapter, index) => (
                    <li key={chapter.id} className="group">
                      <div 
                        className="flex items-start gap-4 p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/30 hover:border-border/60 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        onClick={() => handleChapterClick(chapter.id)}
                      >
                        <div className="flex items-center gap-3 flex-grow min-w-0">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-base mb-1 line-clamp-1">{chapter.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{chapter.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                              <span>•</span>
                              <span>{Math.ceil(chapter.content.trim().split(/\s+/).filter(Boolean).length / 200)} min read</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" onClick={() => handleChapterClick(chapter.id)}>
                              <BookOpen className="h-4 w-4" />
                          </Button>
                          <ExportPopover onExport={(format) => handleExportChapter(chapter, format)} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-4 w-4" />
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
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h4 className="font-semibold text-lg mb-2">No chapters yet</h4>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm">Start building your story by adding your first chapter to this volume.</p>
                  <Button onClick={handleAddChapter}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Add First Chapter
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="justify-between pt-6 border-t border-border/50">
            <ExportPopover onExport={handleExportVolume} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSaveChanges} className="px-6">Save Changes</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

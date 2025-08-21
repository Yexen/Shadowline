
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, FileText, Trash2, Edit, ListTree, Book } from 'lucide-react';
import { useVolumes, Volume, Chapter } from '@/hooks/use-volumes';
import { Skeleton } from './ui/skeleton';
import { ChapterEditor } from './chapter-editor';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle as DialogTitleVol } from './ui/dialog';


interface VolumesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type VolumesView = 'by-volume' | 'all';

export function VolumesSidebar({ isOpen, onClose }: VolumesSidebarProps) {
  const { isLoaded, volumes, addVolume, updateVolumeTitle, addChapter, deleteChapter, updateChapter } = useVolumes();
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
  const [newVolumeTitle, setNewVolumeTitle] = useState('');
  const [newVolumeName, setNewVolumeName] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingToVolumeId, setAddingToVolumeId] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<{volumeId: string, chapter: Chapter} | null>(null);
  const [view, setView] = useState<VolumesView>('by-volume');
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);

  const handleStartEditVolume = (volume: Volume) => {
    setEditingVolumeId(volume.id);
    setNewVolumeTitle(volume.title);
  };

  const handleSaveVolumeTitle = () => {
    if (editingVolumeId && newVolumeTitle.trim()) {
      updateVolumeTitle(editingVolumeId, newVolumeTitle.trim());
      setEditingVolumeId(null);
      setNewVolumeTitle('');
    }
  };

  const handleStartAddChapter = (volumeId: string) => {
    setAddingToVolumeId(volumeId);
  }

  const handleConfirmAddChapter = () => {
    if (addingToVolumeId && newChapterTitle.trim()) {
      addChapter(addingToVolumeId, newChapterTitle.trim());
      setAddingToVolumeId(null);
      setNewChapterTitle('');
    }
  }
  
  const handleSaveChapter = (chapter: Chapter) => {
    if (editingChapter) {
        updateChapter(editingChapter.volumeId, chapter.id, chapter.title, chapter.content);
        setEditingChapter(null);
    }
  }

  const handleAddNewVolume = () => {
    if (newVolumeName.trim()) {
      addVolume(newVolumeName.trim());
      setNewVolumeName('');
    }
  };


  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="flex flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-headline">VOLUMES</SheetTitle>
          </SheetHeader>
           <div className="flex gap-2 border-b pb-4">
              <Button variant={view === 'by-volume' ? 'secondary' : 'ghost'} onClick={() => setView('by-volume')} className="w-full">
                <ListTree className="mr-2"/> By Volume
              </Button>
              <Button variant={view === 'all' ? 'secondary' : 'ghost'} onClick={() => setView('all')} className="w-full">
                <Book className="mr-2"/> All Volumes
              </Button>
            </div>
          {!isLoaded ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : view === 'by-volume' ? (
            <Accordion type="multiple" className="w-full mt-4 flex-grow overflow-y-auto pr-2">
              {volumes.map(volume => (
                <AccordionItem value={volume.id} key={volume.id}>
                  <AccordionTrigger className="font-headline text-base hover:no-underline">
                    <div className="flex items-center gap-2 w-full">
                      {editingVolumeId === volume.id ? (
                        <Input
                          value={newVolumeTitle}
                          onChange={(e) => setNewVolumeTitle(e.target.value)}
                          onBlur={handleSaveVolumeTitle}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveVolumeTitle()}
                          className="flex-grow"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-grow text-left">{volume.title}</span>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleStartEditVolume(volume); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {volume.chapters.map(chapter => (
                        <li key={chapter.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                           <button className="flex items-center gap-2" onClick={() => setEditingChapter({ volumeId: volume.id, chapter })}>
                            <FileText className="h-4 w-4" />
                            <h4 className="font-medium">{chapter.title}</h4>
                          </button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                                     <Trash2 className="h-4 w-4 text-destructive" />
                                 </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the chapter "{chapter.title}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteChapter(volume.id, chapter.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </li>
                      ))}
                      {addingToVolumeId === volume.id ? (
                         <li className="flex items-center gap-2 p-2">
                             <Input 
                                placeholder="New chapter title..." 
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddChapter()}
                                autoFocus
                            />
                             <Button onClick={handleConfirmAddChapter}>Add</Button>
                             <Button variant="ghost" onClick={() => setAddingToVolumeId(null)}>Cancel</Button>
                         </li>
                      ) : (
                        <li>
                          <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleStartAddChapter(volume.id)}>
                            <PlusCircle className="mr-2" /> Add New Chapter
                          </Button>
                        </li>
                      )}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
             <ScrollArea className="flex-grow mt-4 pr-2">
                <div className="space-y-4">
                    {volumes.map(volume => (
                        <div key={volume.id}>
                            <Button variant="link" className="font-headline text-base p-0 h-auto text-foreground" onClick={() => setSelectedVolume(volume)}>
                                {volume.title}
                            </Button>
                            <ul className="space-y-1 pl-4 mt-1 border-l border-border ml-2">
                                {volume.chapters.map(chapter => (
                                     <li key={chapter.id} className="flex items-center justify-between p-1 rounded-md hover:bg-accent group text-sm">
                                        <button className="flex items-center gap-2" onClick={() => setEditingChapter({ volumeId: volume.id, chapter })}>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <h4 className="font-medium">{chapter.title}</h4>
                                        </button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7">
                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the chapter "{chapter.title}". This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteChapter(volume.id, chapter.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </li>
                                ))}
                                 {volume.chapters.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic pl-2">No chapters yet.</p>
                                 )}
                            </ul>
                        </div>
                    ))}
                </div>
            </ScrollArea>
          )}

          <div className="mt-auto border-t pt-4">
            <div className="flex gap-2">
              <Input
                placeholder="New Volume Title..."
                value={newVolumeName}
                onChange={(e) => setNewVolumeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewVolume()}
              />
              <Button onClick={handleAddNewVolume}>Add Volume</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {editingChapter && (
        <ChapterEditor 
            chapter={editingChapter.chapter}
            onSave={handleSaveChapter}
            onClose={() => setEditingChapter(null)}
        />
      )}

      {selectedVolume && (
        <Dialog open={!!selectedVolume} onOpenChange={() => setSelectedVolume(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitleVol className="font-headline">{selectedVolume.title}</DialogTitleVol>
                </DialogHeader>
                <div className="py-4 grid grid-cols-2 gap-4">
                   <Button variant="outline" onClick={() => setSelectedVolume(null)}>Overview</Button>
                   <Button variant="outline" onClick={() => setSelectedVolume(null)}>Resources</Button>
                </div>
                 <DialogFooter>
                    <Button onClick={() => setSelectedVolume(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}

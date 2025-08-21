
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


interface VolumesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type VolumesView = 'by-volume' | 'all';

export function VolumesSidebar({ isOpen, onClose }: VolumesSidebarProps) {
  const { isLoaded, volumes, updateVolumeTitle, addChapter, deleteChapter, updateChapter } = useVolumes();
  const [editingVolumeId, setEditingVolumeId] = useState<string | null>(null);
  const [newVolumeTitle, setNewVolumeTitle] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingToVolumeId, setAddingToVolumeId] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<{volumeId: string, chapter: Chapter} | null>(null);
  const [view, setView] = useState<VolumesView>('by-volume');

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
                <ul className="space-y-2">
                    {volumes.flatMap(volume => volume.chapters.map(chapter => ({ ...chapter, volumeId: volume.id }))).map(chapter => (
                        <li key={chapter.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                            <button className="flex items-center gap-2" onClick={() => setEditingChapter({ volumeId: chapter.volumeId, chapter })}>
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
                                    <AlertDialogAction onClick={() => deleteChapter(chapter.volumeId, chapter.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
      {editingChapter && (
        <ChapterEditor 
            chapter={editingChapter.chapter}
            onSave={handleSaveChapter}
            onClose={() => setEditingChapter(null)}
        />
      )}
    </>
  );
}

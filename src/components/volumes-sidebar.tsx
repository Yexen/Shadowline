

'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, FileText, Trash2, Edit, ListTree, Book, BookOpenCheck } from 'lucide-react';
import { useVolumes, Volume, Chapter } from '@/hooks/use-volumes';
import { Skeleton } from './ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { VolumeEditor } from './volume-editor';
import { useModalStore } from '@/hooks/use-modal-store';
import { SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';

type VolumesView = 'by-volume' | 'all';

export function VolumesSidebar() {
  const { isLoaded, volumes, addVolume, updateVolume, deleteVolume, addChapter, deleteChapter } = useVolumes();
  const [newVolumeName, setNewVolumeName] = useState('');
  
  const [view, setView] = useState<VolumesView>('by-volume');
  const [selectedVolume, setSelectedVolume] = useState<Volume | null>(null);
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { openModal } = useModalStore();

  // When volumes data is loaded, open the first volume by default
  useEffect(() => {
    if (isSheetOpen && isLoaded && volumes.length > 0 && openAccordions.length === 0) {
      setOpenAccordions([volumes[0].id]);
    }
  }, [isSheetOpen, isLoaded, volumes, openAccordions.length]);

  const handleAddNewVolume = () => {
    if (newVolumeName.trim()) {
      const newId = `volume-${Date.now()}`;
      addVolume(newVolumeName.trim(), newId);
      setNewVolumeName('');
      setOpenAccordions(prev => [...prev, newId]); // auto-open new volume
    }
  };

  const handleEditChapter = (volumeId: string, chapter: Chapter) => {
    openModal('chapter', { volumeId, chapter });
  }
  
  const currentSelectedVolume = volumes.find(v => v.id === selectedVolume?.id) || null;

  return (
    <>
      <SidebarMenuItem>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SidebarMenuButton asChild tooltip={{ children: "Volumes", side: "right", align: "center" }}>
            <SheetTrigger asChild>
                <button className="flex w-full items-center gap-2">
                  <BookOpenCheck />
                  <span>Volumes</span>
                </button>
            </SheetTrigger>
          </SidebarMenuButton>
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
              <ScrollArea className="flex-grow mt-4 pr-2">
              <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions} className="w-full">
                {volumes.map(volume => (
                  <AccordionItem value={volume.id} key={volume.id}>
                    <AccordionTrigger className="font-headline text-base hover:no-underline flex-grow" onClick={() => setSelectedVolume(volume)}>
                        <span className="flex-grow text-left">{volume.title}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {volume.chapters.map(chapter => (
                          <li key={chapter.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                            <button className="flex items-center gap-2" onClick={() => handleEditChapter(volume.id, chapter)}>
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
                        {volume.chapters.length === 0 && <p className="text-sm text-muted-foreground italic px-2">No chapters yet.</p>}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              </ScrollArea>
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
                                          <button className="flex items-center gap-2" onClick={() => handleEditChapter(volume.id, chapter)}>
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
      </SidebarMenuItem>
      
      {selectedVolume && (
        <VolumeEditor
          volume={currentSelectedVolume}
          onClose={() => setSelectedVolume(null)}
          onSave={updateVolume}
          onDelete={deleteVolume}
          onAddChapter={addChapter}
          onDeleteChapter={deleteChapter}
          onEditChapter={(chapter) => handleEditChapter(selectedVolume.id, chapter)}
        />
      )}
    </>
  );
}

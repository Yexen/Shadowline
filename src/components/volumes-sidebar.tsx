
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Library, FolderPlus, MoreHorizontal, Pencil, Trash2, FileText, CheckCircle, Clock, BookCopy, BookOpen } from 'lucide-react';
import { useVolumes, Volume } from '@/hooks/use-volumes';
import { Skeleton } from './ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { VolumeEditor } from './volume-editor';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useModalStore } from '@/hooks/use-modal-store';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];

export function VolumesSidebar() {
    const { isLoaded, volumes, addVolume, updateVolume, deleteVolume, deleteChapter } = useVolumes();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [editingVolume, setEditingVolume] = useState<Volume | null>(null);
    const { openModal } = useModalStore();

    const handleSaveVolume = (volumeData: Partial<Volume>) => {
        if (editingVolume) {
            updateVolume(editingVolume.id, volumeData.title!, volumeData.description!);
        } else {
            addVolume(volumeData.title!, volumeData.description!);
        }
        setEditingVolume(null);
    };

    const handleEditVolume = (volume: Volume) => {
        setEditingVolume(volume);
        setEditorOpen(true);
    };
    
    const handleAddNewVolume = () => {
        setEditingVolume(null);
        setEditorOpen(true);
    };

    const statusIcon = (status: string) => {
        switch(status) {
            case 'draft': return <Pencil className="h-3 w-3 text-muted-foreground" />;
            case 'review': return <Clock className="h-3 w-3 text-yellow-500" />;
            case 'final': return <CheckCircle className="h-3 w-3 text-green-500" />;
            default: return null;
        }
    };

    const renderVolumeList = (volumeSet: Volume[]) => (
         <Accordion type="multiple" className="w-full mt-2 flex-grow overflow-y-auto pr-2">
            {volumeSet.map((volume, index) => (
                <AccordionItem value={volume.id} key={volume.id}>
                    <AccordionTrigger className="font-headline text-base hover:no-underline">
                        <div className="flex items-center justify-between w-full group">
                            <span>Volume {romanNumerals[index]}: {volume.title}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={() => handleEditVolume(volume)}>
                                            <Pencil className="mr-2"/> Edit Volume
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 text-destructive"/> Delete Volume
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                             <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the volume "{volume.title}" and all its chapters.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteVolume(volume.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-1">
                            {volume.chapters.length > 0 ? volume.chapters.map(chapter => (
                                <li key={chapter.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => openModal('chapter', { volumeId: volume.id, chapterId: chapter.id })}>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <h4 className="font-semibold">{chapter.title}</h4>
                                            <div className="flex items-center gap-1.5">
                                                {statusIcon(chapter.status)}
                                                <span className="text-xs text-muted-foreground capitalize">{chapter.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently delete the chapter "{chapter.title}"?
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteChapter(volume.id, chapter.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            )) : <p className="text-sm text-muted-foreground text-center p-4">No chapters yet.</p>}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );

    return (
        <>
            <Sheet>
                <SidebarMenuButton asChild tooltip={{ children: "Volumes", side: "right", align: "center" }}>
                    <SheetTrigger asChild>
                        <button className="flex w-full items-center gap-2">
                            <Library />
                            <span>Volumes</span>
                        </button>
                    </SheetTrigger>
                </SidebarMenuButton>
                <SheetContent className="flex flex-col sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="font-headline">STORY VOLUMES</SheetTitle>
                    </SheetHeader>
                    {!isLoaded ? (
                        <div className="space-y-4 mt-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                    <div className="flex flex-col flex-grow mt-4 min-h-0">
                        
                        {/* Volumes Section */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <h3 className="font-headline text-lg flex items-center gap-2"><BookCopy/> Volumes</h3>
                             <div className="flex-grow overflow-y-auto">
                                {renderVolumeList(volumes.slice(0, 6))}
                            </div>
                        </div>

                        <Separator className="my-4"/>

                        {/* Outlines Section */}
                        <div className="flex-1 flex flex-col min-h-0">
                           <h3 className="font-headline text-lg flex items-center gap-2"><BookOpen/> Outlines</h3>
                           <div className="flex-grow overflow-y-auto">
                               {renderVolumeList(volumes.slice(0, 6))}
                               <div className="p-2 mt-2">
                                   <Button variant="secondary" className="w-full">All Volumes</Button>
                               </div>
                           </div>
                        </div>

                    </div>
                    )}
                    <div className="mt-auto border-t pt-4">
                        <Button variant="outline" className="w-full" onClick={handleAddNewVolume}>
                            <FolderPlus className="mr-2" /> Add New Volume
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <VolumeEditor 
                isOpen={isEditorOpen}
                onClose={() => { setEditorOpen(false); setEditingVolume(null); }}
                onSave={handleSaveVolume}
                volume={editingVolume}
            />
        </>
    );
}

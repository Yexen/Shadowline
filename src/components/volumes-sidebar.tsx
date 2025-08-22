
'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { Library, FolderPlus, MoreHorizontal, Pencil, Trash2, FileText, CheckCircle, Clock, BookCopy, BookOpen, Book } from 'lucide-react';
import { useVolumes, Volume } from '@/hooks/use-volumes';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { VolumeEditor } from './volume-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];

export function VolumesSidebar() {
    const { isLoaded, volumes, addVolume, updateVolume, deleteVolume, getChapter, updateChapter, addChapterToVolume, deleteChapter } = useVolumes();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [editingVolume, setEditingVolume] = useState<Volume | null>(null);

    const handleSaveVolume = (volumeData: Partial<Volume>) => {
        if (volumeData.id) {
            updateVolume(volumeData.id, volumeData.title!, volumeData.description!, volumeData.imageUrl);
        } else {
            addVolume(volumeData.title!, volumeData.description!, volumeData.imageUrl);
        }
        // No need to close the editor, allow for continuous editing.
        // Also refresh the specific volume being edited to see changes immediately.
        setEditingVolume(v => v ? {...v, ...volumeData} : null);
    };

    const handleEditVolume = (volume: Volume) => {
        setEditingVolume(volume);
        setEditorOpen(true);
    };

    const renderVolumeList = (volumeSet: Volume[]) => (
         <div className="w-full mt-2 flex-grow overflow-y-auto pr-2 space-y-2">
            {volumeSet.map((volume, index) => (
                <div 
                    key={volume.id}
                    className="p-3 rounded-md hover:bg-accent cursor-pointer border flex justify-between items-center"
                    onClick={() => handleEditVolume(volume)}
                >
                    <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-primary"/>
                        <div>
                            <h4 className="font-headline">{volume.title}</h4>
                            <p className="text-xs text-muted-foreground">{volume.chapters.length} Chapters</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
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
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                    <Tabs defaultValue="volumes" className="flex-grow flex flex-col mt-4 min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="volumes"><BookCopy className="mr-2"/> Volumes</TabsTrigger>
                            <TabsTrigger value="outlines"><BookOpen className="mr-2"/> Outlines</TabsTrigger>
                        </TabsList>
                        <TabsContent value="volumes" className="flex-grow flex flex-col overflow-y-auto">
                            {renderVolumeList(volumes.slice(0, 6))}
                        </TabsContent>
                        <TabsContent value="outlines" className="flex-grow flex flex-col overflow-y-auto">
                             <div className="flex-grow overflow-y-auto p-4 border rounded-md mt-2 text-center">
                                <p className="text-muted-foreground">Outline view coming soon.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                    )}
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

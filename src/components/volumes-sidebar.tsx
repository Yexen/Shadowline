
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
import { OutlinePopover } from './outline-popover';
import { OverviewEditor } from './overview-editor';
import { ResourceEditor } from './resource-editor';
import { Separator } from './ui/separator';

const romanNumerals = ["I", "II", "III", "IV", "V", "VI"];

export function VolumesSidebar() {
    const { isLoaded, volumes, addVolume, updateVolume } = useVolumes();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [editingVolume, setEditingVolume] = useState<Volume | null>(null);

    const handleSaveVolume = (volumeData: Partial<Volume>) => {
        if (volumeData.id) {
            updateVolume(volumeData.id, volumeData);
        } else {
            addVolume(volumeData.title!, volumeData.description!, volumeData.imageUrl);
        }
        setEditingVolume(v => v ? {...v, ...volumeData} : null);
    };

    const handleEditVolume = (volume: Volume) => {
        setEditingVolume(volume);
        setEditorOpen(true);
    };

    const renderVolumeList = (volumeSet: Volume[], clickHandler: (volume: Volume) => void) => (
         <div className="w-full mt-4 flex-grow overflow-y-auto pr-2">
            {volumeSet.map((volume, index) => (
                <div key={volume.id}>
                    <div 
                        className="cursor-pointer group py-3"
                        onClick={() => clickHandler(volume)}
                    >
                        <h4 className="font-headline text-lg group-hover:text-primary transition-colors">{volume.title}</h4>
                    </div>
                    {index < volumeSet.length - 1 && <Separator className="bg-border/50" />}
                </div>
            ))}
        </div>
    );
    
    const renderOutlineList = () => (
        <div className="w-full flex-grow overflow-y-auto pr-2">
            {volumes.slice(0, 6).map((volume, index) => (
                <div key={volume.id}>
                    <OutlinePopover volume={volume}>
                        <div className="cursor-pointer group py-3">
                            <h4 className="font-headline text-lg group-hover:text-primary transition-colors">{volume.title}</h4>
                        </div>
                    </OutlinePopover>
                    {index < volumes.slice(0, 6).length -1 && <Separator className="bg-border/50" />}
                </div>
            ))}
             <Separator className="my-3 bg-border/50" />
             <OutlinePopover volume={{ id: 'all', title: 'All Volumes', chapters: [], overview: '', resources: [] }}>
                 <div className="cursor-pointer group py-3">
                    <h4 className="font-headline text-lg group-hover:text-primary transition-colors">All Volumes</h4>
                </div>
            </OutlinePopover>
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
                            {renderVolumeList(volumes.slice(0, 6), handleEditVolume)}
                        </TabsContent>
                        <TabsContent value="outlines" className="flex-grow flex flex-col overflow-y-auto">
                             {renderOutlineList()}
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
            
            <OverviewEditor />
            <ResourceEditor />
        </>
    );
}

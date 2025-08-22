
'use client';

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useVolumes, type Volume, type Chapter } from "@/hooks/use-volumes";
import { useModalStore } from "@/hooks/use-modal-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BookCopy, BookOpen, Library, PlusCircle } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { VolumeEditor } from "./volume-editor";
import { OverviewEditor } from "./overview-editor";
import { ResourceEditor } from "./resource-editor";
import { OutlinePopover } from "./outline-popover";

interface VolumesSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Function to convert number to Roman numeral
const toRoman = (num: number): string => {
    const roman: { [key: string]: number } = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let str = '';
    for (let i in roman) {
        while (num >= roman[i]) {
            str += i;
            num -= roman[i];
        }
    }
    return str;
};


export function VolumesSidebar({ open, onOpenChange }: VolumesSidebarProps) {
    const { 
        volumes, 
        isLoaded, 
        addVolume, 
        updateVolume, 
        deleteChapter,
        addChapterToVolume,
        updateVolumeOverview, 
        updateVolumeResources 
    } = useVolumes();
    const { modalType, modalData, closeModal } = useModalStore();

    const [activeTab, setActiveTab] = useState("volumes");
    
    const editingVolume = volumes.find(v => v.id === modalData?.volume?.id);
    const overviewVolume = volumes.find(v => v.id === modalData?.overview?.id);
    const resourcesVolume = volumes.find(v => v.id === modalData?.resources?.id);

    const renderList = (
        items: any[], 
        renderItem: (item: any, index: number) => React.ReactNode
    ) => (
        <div className="w-full mt-4 flex-grow overflow-y-auto pr-2">
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={item.id || index}>
                        {renderItem(item, index)}
                        <Separator className="mt-2 bg-border/50" />
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderVolumeItem = (volume: Volume, index: number) => (
        <button 
            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => useModalStore.getState().openModal('volume', { id: volume.id })}
        >
            <h3 className="font-headline font-bold text-lg">VOLUME {toRoman(index + 1)}</h3>
            <p className="text-sm text-muted-foreground truncate">{volume.title}</p>
        </button>
    );

    const renderOutlineItem = (volume: Volume, index: number) => (
         <OutlinePopover volumeId={volume.id}>
             <div className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                <h3 className="font-headline font-bold text-lg">VOLUME {toRoman(index + 1)}</h3>
                <p className="text-sm text-muted-foreground truncate">{volume.title}</p>
            </div>
        </OutlinePopover>
    );
    
    const renderAllVolumesItem = () => (
         <OutlinePopover volumeId="all-volumes">
             <div className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
                <h3 className="font-headline font-bold text-lg">ALL VOLUMES</h3>
                <p className="text-sm text-muted-foreground">Aggregate View</p>
            </div>
        </OutlinePopover>
    );

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-md flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="font-headline text-2xl flex items-center gap-2">
                            <Library /> STORY VOLUMES
                        </SheetTitle>
                    </SheetHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="volumes"><BookCopy className="mr-2"/> Volumes</TabsTrigger>
                            <TabsTrigger value="outlines"><BookOpen className="mr-2"/> Outlines</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="volumes" className="flex-grow flex flex-col">
                            {!isLoaded ? (
                                <div className="space-y-4 mt-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : renderList(volumes.slice(0, 6), renderVolumeItem)}
                            <div className="mt-auto pt-4 border-t">
                                <Button className="w-full" onClick={addVolume}><PlusCircle className="mr-2"/> Add New Volume</Button>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="outlines" className="flex-grow flex flex-col">
                           {!isLoaded ? (
                                <div className="space-y-4 mt-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : (
                                <div className="w-full mt-4 flex-grow overflow-y-auto pr-2">
                                    <ul className="space-y-2">
                                        {volumes.slice(0, 6).map((vol, index) => (
                                            <li key={vol.id}>
                                                {renderOutlineItem(vol, index)}
                                                <Separator className="mt-2 bg-border/50" />
                                            </li>
                                        ))}
                                         <li>
                                            {renderAllVolumesItem()}
                                            <Separator className="mt-2 bg-border/50" />
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>
            
            {/* Modals for editing */}
            <VolumeEditor 
                volume={editingVolume || null}
                onSave={updateVolume}
                onClose={closeModal}
                onDeleteChapter={deleteChapter}
                onAddChapter={addChapterToVolume}
            />
            <OverviewEditor 
                volume={overviewVolume || null}
                onSave={updateVolumeOverview}
                onClose={closeModal}
            />
            <ResourceEditor
                volume={resourcesVolume || null}
                onSave={updateVolumeResources}
                onClose={closeModal}
            />
        </>
    );
}

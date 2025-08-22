
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
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose } from "./ui/dialog";

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
    const { modalType, modalData, closeModal, openModal } = useModalStore();
    const [outlineDialogVolume, setOutlineDialogVolume] = useState<Volume | null>(null);

    const activeTab = modalType === 'volume' ? 'volumes' : 'outlines';

    const editingVolume = volumes.find(v => v.id === modalData?.volume?.id);
    const overviewVolume = volumes.find(v => v.id === modalData?.overview?.id);
    const resourcesVolume = volumes.find(v => v.id === modalData?.resources?.id);

    const handleOpenOutlineDialog = (volume: Volume) => {
        setOutlineDialogVolume(volume);
    };

    const handleCloseOutlineDialog = () => {
        setOutlineDialogVolume(null);
    };

    const handleOpenOverview = () => {
        if (outlineDialogVolume) {
            openModal('overview', { id: outlineDialogVolume.id });
            handleCloseOutlineDialog();
        }
    };
    
    const handleOpenResources = () => {
        if (outlineDialogVolume) {
            openModal('resources', { id: outlineDialogVolume.id });
            handleCloseOutlineDialog();
        }
    };

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
        <button 
            className="w-full text-left p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => handleOpenOutlineDialog(volume)}
        >
            <h3 className="font-headline font-bold text-lg">VOLUME {toRoman(index + 1)}</h3>
            <p className="text-sm text-muted-foreground truncate">{volume.title}</p>
        </button>
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
                    <Tabs value={activeTab} className="flex-grow flex flex-col mt-4">
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
                            ) : renderList(volumes.slice(0, 6), renderOutlineItem)}
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>
            
            {/* Outline selection dialog */}
            <Dialog open={!!outlineDialogVolume} onOpenChange={handleCloseOutlineDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">{outlineDialogVolume?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-2 gap-4">
                        <Button variant="outline" size="lg" onClick={handleOpenOverview}>
                            <BookOpen className="mr-2"/> Edit Overview
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleOpenResources}>
                            <BookCopy className="mr-2"/> Edit Resources
                        </Button>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button variant="secondary">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

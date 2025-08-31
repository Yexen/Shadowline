
'use client';

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useVolumes, type Volume } from "@/hooks/use-volumes";
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
        getVolume,
        addResource,
        updateResource,
        deleteResource
    } = useVolumes();
    const { modalData, closeModal, openModal } = useModalStore();
    const [activeTab, setActiveTab] = useState<'volumes' | 'outlines'>('volumes');
    const [outlineDialogVolume, setOutlineDialogVolume] = useState<Volume | null>(null);

    const editingVolume = volumes.find(v => v.id === modalData?.volume?.id);
    const overviewVolume = volumes.find(v => v.id === modalData?.overview?.id);
    const resourcesVolume = getVolume(modalData?.resources?.id || '');

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
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Library className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-sm">No volumes yet</p>
                    <p className="text-muted-foreground text-xs mt-1">Create your first volume to get started</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((item, index) => (
                        <li key={item.id || index}>
                            {renderItem(item, index)}
                            {index < items.length - 1 && <Separator className="mt-3 bg-border/30" />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const renderVolumeItem = (volume: Volume, index: number) => (
        <button 
            className="w-full text-left p-3 rounded-lg hover:bg-accent/60 transition-all duration-200 border border-transparent hover:border-accent group"
            onClick={() => useModalStore.getState().openModal('volume', { id: volume.id })}
        >
            <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-muted/60 rounded-md flex-shrink-0 flex items-center justify-center group-hover:bg-muted">
                    <BookCopy className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-headline font-bold text-base mb-1">VOLUME {toRoman(index + 1)}</h3>
                    <p className="text-sm text-foreground font-medium line-clamp-1 mb-1">{volume.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{volume.description || 'No description'}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{volume.chapters.length} chapters</span>
                        {volume.overview && <span>• Overview</span>}
                        {volume.resources && volume.resources.length > 0 && <span>• {volume.resources.length} resources</span>}
                    </div>
                </div>
            </div>
        </button>
    );

    const renderOutlineItem = (volume: Volume, index: number) => (
        <button 
            className="w-full text-left p-3 rounded-lg hover:bg-accent/60 transition-all duration-200 border border-transparent hover:border-accent group"
            onClick={() => handleOpenOutlineDialog(volume)}
        >
            <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-muted/60 rounded-md flex-shrink-0 flex items-center justify-center group-hover:bg-muted">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="font-headline font-bold text-base mb-1">VOLUME {toRoman(index + 1)}</h3>
                    <p className="text-sm text-foreground font-medium line-clamp-1 mb-1">{volume.title}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className={`flex items-center gap-1 ${volume.overview ? 'text-green-600' : ''}}`}>
                            <BookOpen className="h-3 w-3" />
                            Overview {volume.overview ? '✓' : '○'}
                        </span>
                        <span className={`flex items-center gap-1 ${volume.resources && volume.resources.length > 0 ? 'text-blue-600' : ''}}`}>
                            <BookCopy className="h-3 w-3" />
                            Resources {volume.resources && volume.resources.length > 0 ? `(${volume.resources.length})` : '○'}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="sm:max-w-lg flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="font-headline text-2xl flex items-center gap-2">
                            <Library /> STORY VOLUMES
                        </SheetTitle>
                    </SheetHeader>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'volumes' | 'outlines')} className="flex-grow flex flex-col mt-6">
                        <TabsList className="grid w-full grid-cols-2 h-11">
                            <TabsTrigger value="volumes" className="text-sm font-medium"><BookCopy className="mr-2 h-4 w-4"/> Volumes</TabsTrigger>
                            <TabsTrigger value="outlines" className="text-sm font-medium"><BookOpen className="mr-2 h-4 w-4"/> Outlines</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="volumes" className="flex-grow flex flex-col">
                            {!isLoaded ? (
                                <div className="space-y-4 mt-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : renderList(volumes, renderVolumeItem)}
                            <div className="mt-auto pt-6 border-t border-border/50">
                                <Button className="w-full h-11 font-medium" onClick={addVolume}>
                                    <PlusCircle className="mr-2 h-5 w-5"/> Add New Volume
                                </Button>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="outlines" className="flex-grow flex flex-col">
                           {!isLoaded ? (
                                <div className="space-y-4 mt-4">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : renderList(volumes, renderOutlineItem)}
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
                onClose={closeModal}
                onAddResource={addResource}
                onUpdateResource={updateResource}
                onDeleteResource={deleteResource}
            />
        </>
    );
}


'use client';

import { useEffect, useState } from 'react';
import type { Volume, ResourcePage } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PlusCircle, FileText, Pencil, Trash2 } from 'lucide-react';
import { useVolumes } from '@/hooks/use-volumes';
import { useToast } from '@/hooks/use-toast';
import { useModalStore } from '@/hooks/use-modal-store';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


export function ResourceEditor() {
    const { isOpen, modalType, modalData, closeModal } = useModalStore();
    const { addResourceToVolume, updateResource, deleteResource } = useVolumes();
    const { toast } = useToast();

    const [editingResource, setEditingResource] = useState<ResourcePage | null>(null);
    
    const volume = modalData?.resources?.volume;

    const handleAddNewResource = () => {
        setEditingResource({ id: `resource-${Date.now()}`, title: 'New Resource', content: '' });
    };

    const handleSaveResource = () => {
        if (volume && editingResource) {
            if (volume.resources?.some(r => r.id === editingResource.id)) {
                updateResource(volume.id, editingResource);
                 toast({ title: 'Resource Updated' });
            } else {
                addResourceToVolume(volume.id, editingResource);
                toast({ title: 'Resource Added' });
            }
            setEditingResource(null);
            // We don't close the main dialog, just the editor part
        }
    };
    
    const handleDeleteResource = (resourceId: string) => {
        if (volume) {
            deleteResource(volume.id, resourceId);
            toast({ variant: 'destructive', title: 'Resource Deleted' });
        }
    };

    if (!isOpen || modalType !== 'resources' || !volume) {
        return null;
    }
    
    if (editingResource) {
        return (
            <Dialog open={true} onOpenChange={() => setEditingResource(null)}>
                <DialogContent className="sm:max-w-2xl h-[70vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Edit Resource</DialogTitle>
                    </DialogHeader>
                    <div className="flex-grow space-y-4 py-4 overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="resource-title">Title</Label>
                            <Input
                                id="resource-title"
                                value={editingResource.title}
                                onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 flex-grow flex flex-col">
                            <Label htmlFor="resource-content">Content</Label>
                            <Textarea
                                id="resource-content"
                                value={editingResource.content}
                                onChange={(e) => setEditingResource({ ...editingResource, content: e.target.value })}
                                className="flex-grow resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingResource(null)}>Cancel</Button>
                        <Button onClick={handleSaveResource}>Save Resource</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={true} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Resources for {volume.title}</DialogTitle>
                    <DialogDescription>
                        Manage supplementary materials, notes, and research for this volume.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow space-y-4 py-4 overflow-y-auto pr-2">
                     <Button variant="outline" onClick={handleAddNewResource} className="w-full">
                        <PlusCircle className="mr-2"/>
                        Add New Resource
                    </Button>
                    <div className="space-y-2 border-t pt-4">
                        {volume.resources && volume.resources.length > 0 ? (
                            volume.resources.map(resource => (
                                <div key={resource.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground"/>
                                        <p className="font-semibold">{resource.title}</p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingResource(resource)}>
                                            <Pencil className="h-4 w-4"/>
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Resource?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Permanently delete the resource "{resource.title}"?
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteResource(resource.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="text-sm text-muted-foreground text-center py-8">No resources yet. Click "Add New Resource" to start.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={closeModal}>Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

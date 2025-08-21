
'use client';

import { useEffect, useState } from 'react';
import type { Volume, ResourcePage } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { PlusCircle, Book, Library, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { ResourcePageEditor } from './resource-page-editor';

interface VolumeEditorProps {
    volume: Volume | null;
    onSave: (volumeId: string, updatedVolume: Partial<Volume>) => void;
    onClose: () => void;
}

type EditorView = 'overview' | 'resources';

export function VolumeEditor({ volume, onSave, onClose }: VolumeEditorProps) {
    const [currentVolume, setCurrentVolume] = useState<Volume | null>(null);
    const [view, setView] = useState<EditorView>('overview');
    const [editingResource, setEditingResource] = useState<ResourcePage | null>(null);

    useEffect(() => {
        if (volume) {
            setCurrentVolume(JSON.parse(JSON.stringify(volume)));
            setView('overview');
            setEditingResource(null);
        }
    }, [volume]);
    
    const handleSave = () => {
        if (currentVolume) {
            onSave(currentVolume.id, {
                title: currentVolume.title,
                overview: currentVolume.overview,
                resources: currentVolume.resources,
            });
            onClose();
        }
    };
    
    const handleTitleChange = (newTitle: string) => {
        if (currentVolume) {
            setCurrentVolume({ ...currentVolume, title: newTitle });
        }
    };

    const handleOverviewChange = (newOverview: string) => {
        if (currentVolume) {
            setCurrentVolume({ ...currentVolume, overview: newOverview });
        }
    };

    const handleResourceSave = (page: ResourcePage) => {
        if (!currentVolume) return;
        const resources = [...(currentVolume.resources || [])];
        const pageIndex = resources.findIndex(p => p.id === page.id);
        if (pageIndex > -1) {
            resources[pageIndex] = page;
        } else {
            resources.push(page);
        }
        setCurrentVolume({ ...currentVolume, resources });
        setEditingResource(null);
    };

    const handleResourceDelete = (pageId: string) => {
        if (!currentVolume) return;
        const resources = (currentVolume.resources || []).filter(p => p.id !== pageId);
        setCurrentVolume({ ...currentVolume, resources });
        setEditingResource(null);
    };

    const handleAddNewResource = () => {
        setEditingResource({ id: `resource-${Date.now()}`, title: 'New Resource', content: '' });
    };


    if (!currentVolume) return null;

    if (editingResource) {
        return <ResourcePageEditor page={editingResource} onSave={handleResourceSave} onCancel={() => setEditingResource(null)} onDelete={handleResourceDelete} />
    }

    return (
        <Dialog open={!!volume} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                     <DialogTitle className="font-headline flex justify-between items-center pr-12">
                        <Input 
                            value={currentVolume.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="text-lg font-semibold leading-none tracking-tight border-0 shadow-none focus-visible:ring-0 p-0"
                        />
                     </DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-1 border-b pb-2">
                    <Button variant={view === 'overview' ? 'secondary' : 'ghost'} onClick={() => setView('overview')}><Book className="mr-2"/> Overview</Button>
                    <Button variant={view === 'resources' ? 'secondary' : 'ghost'} onClick={() => setView('resources')}><Library className="mr-2"/> Resources</Button>
                </div>
                
                {view === 'overview' ? (
                    <div className="flex-grow flex flex-col gap-2 py-4">
                        <Label htmlFor="volume-overview">Volume Overview</Label>
                        <Textarea
                            id="volume-overview"
                            value={currentVolume.overview || ''}
                            onChange={(e) => handleOverviewChange(e.target.value)}
                            className="flex-grow resize-none"
                            placeholder="Write a high-level overview for this volume..."
                        />
                    </div>
                ) : (
                    <div className="space-y-4 py-4 flex-grow flex flex-col">
                        <ScrollArea className="flex-grow w-full pr-4">
                            <div className="space-y-2">
                                {(currentVolume.resources || []).length > 0 ? (
                                (currentVolume.resources || []).map(page => (
                                    <div key={page.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer" onClick={() => setEditingResource(page)}>
                                        <span className="font-medium">{page.title}</span>
                                    </div>
                                ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No resources yet for this volume.</p>
                                )}
                            </div>
                        </ScrollArea>
                        <Button variant="outline" size="sm" onClick={handleAddNewResource} className="mt-auto">
                            <PlusCircle className="mr-2" /> Add Resource Page
                        </Button>
                    </div>
                )}


                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

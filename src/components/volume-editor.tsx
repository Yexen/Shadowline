
'use client';

import { useEffect, useState } from 'react';
import type { Volume } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface VolumeEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (volume: Partial<Volume>) => void;
    volume?: Volume | null;
}

export function VolumeEditor({ isOpen, onClose, onSave, volume }: VolumeEditorProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const isEditing = !!volume;

    useEffect(() => {
        if (isOpen && volume) {
            setTitle(volume.title);
            setDescription(volume.description || '');
        } else if (!isOpen) {
            setTitle('');
            setDescription('');
        }
    }, [isOpen, volume]);
    
    const handleSave = () => {
        const volumeData: Partial<Volume> = { title, description };
        if (isEditing) {
            volumeData.id = volume.id;
        }
        onSave(volumeData);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-headline">{isEditing ? 'Edit Volume' : 'Create New Volume'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'Update the details for this volume.' : 'Start a new collection for your chapters.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="volume-title">Title</Label>
                        <Input
                            id="volume-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., The Long Halloween"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="volume-description">Description</Label>
                        <Textarea
                            id="volume-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A short synopsis of the volume's story arc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Volume</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


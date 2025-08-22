
'use client';

import { useEffect, useState } from 'react';
import type { Volume } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { useVolumes } from '@/hooks/use-volumes';
import { useToast } from '@/hooks/use-toast';
import { useModalStore } from '@/hooks/use-modal-store';

export function OverviewEditor() {
    const { isOpen, modalType, modalData, closeModal } = useModalStore();
    const { updateVolumeOverview } = useVolumes();
    const { toast } = useToast();

    const [overview, setOverview] = useState('');
    
    const volume = modalData?.overview?.volume;

    useEffect(() => {
        if (isOpen && modalType === 'overview' && volume) {
            setOverview(volume.overview || '');
        }
    }, [isOpen, modalType, volume]);

    const handleSave = () => {
        if (volume) {
            updateVolumeOverview(volume.id, overview);
            toast({
                title: 'Overview Saved',
                description: `The overview for "${volume.title}" has been updated.`,
            });
            closeModal();
        }
    };

    if (!isOpen || modalType !== 'overview' || !volume) {
        return null;
    }

    return (
        <Dialog open={true} onOpenChange={closeModal}>
            <DialogContent className="sm:max-w-xl h-[60vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Edit Overview: {volume.title}</DialogTitle>
                    <DialogDescription>
                        Write a high-level summary or outline for this volume.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow py-4">
                    <Textarea
                        value={overview}
                        onChange={(e) => setOverview(e.target.value)}
                        className="h-full resize-none"
                        placeholder="Enter your story overview here..."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeModal}>Cancel</Button>
                    <Button onClick={handleSave}>Save Overview</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

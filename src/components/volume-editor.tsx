
'use client';

import { useEffect, useState } from 'react';
import type { Volume, Chapter } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import Image from 'next/image';
import { ImagePlus, PlusCircle, FileText, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChapterEditor } from './chapter-editor';
import { useVolumes } from '@/hooks/use-volumes';
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

interface VolumeEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (volume: Partial<Volume>) => void;
    volume: Volume | null;
}

export function VolumeEditor({ isOpen, onClose, onSave, volume }: VolumeEditorProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isChapterEditorOpen, setChapterEditorOpen] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

    const { toast } = useToast();
    const { addChapterToVolume, updateChapter, deleteChapter } = useVolumes();
    
    useEffect(() => {
        if (isOpen && volume) {
            setTitle(volume.title);
            setDescription(volume.description || '');
            setImageUrl(volume.imageUrl || '');
        }
    }, [isOpen, volume]);
    
    const handleSave = () => {
        if (volume) {
            const volumeData: Partial<Volume> = { id: volume.id, title, description, imageUrl };
            onSave(volumeData);
        }
    };

    const handleSaveAndClose = () => {
        handleSave();
        onClose();
    }
    
    const handleImageUpload = () => {
        // This is a placeholder for file upload logic
        const newImageUrl = prompt("Enter image URL:", imageUrl);
        if (newImageUrl) {
            setImageUrl(newImageUrl);
            if (volume) {
                onSave({ ...volume, imageUrl: newImageUrl });
            }
             toast({ title: "Image Updated", description: "The volume cover image has been changed." });
        }
    }

    const handleAddNewChapter = () => {
        setEditingChapter(null);
        setChapterEditorOpen(true);
    };
    
    const handleEditChapter = (chapter: Chapter) => {
        setEditingChapter(chapter);
        setChapterEditorOpen(true);
    }
    
    const handleSaveChapter = (volumeId: string, chapterData: Chapter) => {
        if(editingChapter) {
            updateChapter(volumeId, chapterData.id, chapterData);
        } else {
            addChapterToVolume(volumeId, chapterData);
        }
        setChapterEditorOpen(false);
        setEditingChapter(null);
    };

    const handleDeleteChapter = (chapterId: string) => {
        if (volume) {
            deleteChapter(volume.id, chapterId);
            toast({
                variant: 'destructive',
                title: "Chapter Deleted",
                description: "The chapter has been permanently removed from this volume."
            })
        }
    }

    if (!isOpen || !volume) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="font-headline">Edit Volume</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-y-auto py-4 pr-4">
                        {/* Left Column: Image and Details */}
                        <div className="md:col-span-1 space-y-4">
                             <div className="space-y-2">
                                <Label>Cover Image</Label>
                                <div className="relative aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
                                    {imageUrl ? (
                                        <Image src={imageUrl} alt={title} layout="fill" className="object-cover rounded-md" />
                                    ) : (
                                         <span className="text-muted-foreground text-sm">No Image</span>
                                    )}
                                     <Button size="icon" variant="secondary" className="absolute top-2 right-2" onClick={handleImageUpload}>
                                        <ImagePlus />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="volume-title">Title</Label>
                                <Input
                                    id="volume-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleSave} // Autosave on blur
                                    placeholder="e.g., The Long Halloween"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="volume-description">Description</Label>
                                <Textarea
                                    id="volume-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={handleSave} // Autosave on blur
                                    placeholder="A short synopsis of the volume's story arc."
                                    className="min-h-[100px]"
                                />
                            </div>
                        </div>

                        {/* Right Column: Chapters */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-headline text-lg">Chapters</h3>
                                <Button variant="outline" onClick={handleAddNewChapter}>
                                    <PlusCircle className="mr-2"/>
                                    Add New Chapter
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[calc(80vh-150px)] overflow-y-auto pr-2 border-t pt-4">
                                {volume.chapters.length > 0 ? (
                                    volume.chapters.map(chapter => (
                                        <div key={chapter.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent group">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground"/>
                                                <div>
                                                    <p className="font-semibold">{chapter.title}</p>
                                                    <p className="text-xs capitalize text-muted-foreground">{chapter.status}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditChapter(chapter)}>
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
                                                        <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Permanently delete the chapter "{chapter.title}"?
                                                        </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteChapter(chapter.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No chapters yet. Click "Add New Chapter" to start.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveAndClose}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            <ChapterEditor 
                isOpen={isChapterEditorOpen}
                onClose={() => setChapterEditorOpen(false)}
                onSave={handleSaveChapter}
                volumeId={volume.id}
                chapter={editingChapter}
            />
        </>
    );
}

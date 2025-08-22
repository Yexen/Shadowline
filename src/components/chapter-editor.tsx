
'use client';

import { useEffect, useState } from 'react';
import { useVolumes, type Chapter, type ChapterStatus } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookUp, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChapterEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (volumeId: string, chapter: Chapter) => void;
    volumeId: string;
    chapter: Chapter | null; // Can be a new or existing chapter
}

export function ChapterEditor({ isOpen, onClose, onSave, volumeId, chapter }: ChapterEditorProps) {
    const { getChapter, updateChapter } = useVolumes();
    const { toast } = useToast();
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<ChapterStatus>('draft');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen) {
           if (chapter) {
                setTitle(chapter.title);
                setContent(chapter.content);
                setStatus(chapter.status);
                setIsEditing(true);
           } else {
                setTitle('New Chapter');
                setContent('');
                setStatus('draft');
                setIsEditing(false);
           }
        }
    }, [isOpen, chapter]);

    const handleSave = () => {
        const chapterData: Chapter = {
            id: isEditing ? chapter!.id : `chapter-${Date.now()}`,
            title,
            content,
            status,
        };
        onSave(volumeId, chapterData);
        onClose();
        toast({
            title: `Chapter ${isEditing ? 'Saved' : 'Created'}`,
            description: `Changes to "${title}" have been saved.`,
        });
    };
    
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">{isEditing ? `Edit Chapter: ${chapter?.title}` : 'Create New Chapter'}</DialogTitle>
                    <DialogDescription>
                        Write your chapter content and set its status.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow space-y-4 py-4 overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="chapter-title">Title</Label>
                        <Input
                            id="chapter-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 flex-grow flex flex-col">
                        <Label htmlFor="chapter-content">Content</Label>
                        <Textarea
                            id="chapter-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-grow resize-none"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="chapter-status">Status</Label>
                        <Select value={status} onValueChange={(value: ChapterStatus) => setStatus(value)}>
                            <SelectTrigger id="chapter-status">
                                <SelectValue placeholder="Set status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="review">In Review</SelectItem>
                                <SelectItem value="final">Final</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                    <div></div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}><Save className="mr-2"/> Save Chapter</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

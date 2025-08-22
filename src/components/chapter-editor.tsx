
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
import { BookUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChapterEditorProps {
    isOpen: boolean;
    onClose: () => void;
    volumeId: string;
    chapterId: string;
}

export function ChapterEditor({ isOpen, onClose, volumeId, chapterId }: ChapterEditorProps) {
    const { getChapter, updateChapter } = useVolumes();
    const { toast } = useToast();
    const router = useRouter();

    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<ChapterStatus>('draft');

    useEffect(() => {
        if (isOpen) {
            const foundChapter = getChapter(volumeId, chapterId);
            if (foundChapter) {
                setChapter(foundChapter);
                setTitle(foundChapter.title);
                setContent(foundChapter.content);
                setStatus(foundChapter.status);
            }
        }
    }, [isOpen, volumeId, chapterId, getChapter]);

    const handleSave = () => {
        if (chapter) {
            updateChapter(volumeId, chapter.id, { title, content, status });
            toast({
                title: 'Chapter Saved',
                description: `Changes to "${title}" have been saved.`,
            });
            onClose();
        }
    };

    const handleOpenInEditor = () => {
        if (chapter) {
            // This is a simplified approach. A more robust solution might involve
            // creating a temporary draft or handling this state more carefully.
            onClose();
            router.push(`/editor/${chapter.id}?from=volume`); // A query param could signify its origin
        }
    }

    if (!chapter) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Edit Chapter: {chapter.title}</DialogTitle>
                    <DialogDescription>
                        Make changes to this chapter's content and status. For major edits, open in the main editor.
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
                    <Button variant="outline" onClick={handleOpenInEditor}>
                       <BookUp className="mr-2"/> Open in Full Editor
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


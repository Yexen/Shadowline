
'use client';

import { useEffect, useState } from 'react';
import type { BiblePage } from '@/hooks/use-bible';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Trash2 } from 'lucide-react';

interface ProfilePageEditorProps {
    page: BiblePage | null;
    onSave: (page: BiblePage) => void;
    onCancel: () => void;
    onDelete: (pageId: string) => void;
}

export function ProfilePageEditor({ page, onSave, onCancel, onDelete }: ProfilePageEditorProps) {
    const [currentPage, setCurrentPage] = useState<BiblePage | null>(null);

    useEffect(() => {
        if (page) {
            setCurrentPage(JSON.parse(JSON.stringify(page)));
        }
    }, [page]);

    const handleSave = () => {
        if (currentPage) {
            onSave(currentPage);
        }
    };
    
    const handleDelete = () => {
        if (currentPage) {
            onDelete(currentPage.id);
        }
    };

    if (!currentPage) return null;

    return (
        <Dialog open={!!page} onOpenChange={(open) => !open && onCancel()}>
            <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="font-headline">Edit Profile Page</DialogTitle>
                </DialogHeader>
                <div className="flex-grow flex flex-col gap-4 py-4 overflow-y-hidden">
                    <div className="space-y-2">
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                            id="page-title"
                            value={currentPage.title}
                            onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                            className="font-bold text-lg"
                        />
                    </div>
                    <div className="space-y-2 flex-grow flex flex-col">
                        <Label htmlFor="page-content">Content</Label>
                        <Textarea
                            id="page-content"
                            value={currentPage.content}
                            onChange={(e) => setCurrentPage({ ...currentPage, content: e.target.value })}
                            className="flex-grow resize-none"
                            placeholder="Write your detailed content here..."
                        />
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><Trash2 className="mr-2"/> Delete Page</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this profile page.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save Page</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


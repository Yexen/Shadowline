
'use client';

import { useEffect, useState } from 'react';
import type { Chapter } from '@/hooks/use-volumes';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface ChapterEditorProps {
    chapter: Chapter | null;
    onSave: (chapter: Chapter) => void;
    onClose: () => void;
}

const TiptapEditor = ({ content, onChange }: { content: string, onChange: (newContent: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'The story unfolds...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-p:font-body prose-headings:font-headline focus:outline-none flex-grow min-h-full',
            },
        },
    });

    return <EditorContent editor={editor} className="flex-grow h-full" />;
};


export function ChapterEditor({ chapter, onSave, onClose }: ChapterEditorProps) {
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);

    useEffect(() => {
        if (chapter) {
            setCurrentChapter(JSON.parse(JSON.stringify(chapter)));
        }
    }, [chapter]);

    const handleSave = () => {
        if (currentChapter) {
            onSave(currentChapter);
        }
    };
    
    if (!currentChapter) return null;

    return (
        <Dialog open={!!chapter} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-none w-[90vw] h-[90vh] flex flex-col p-8">
                <DialogHeader>
                    <DialogTitle className="font-headline">Chapter Editor</DialogTitle>
                </DialogHeader>
                <div className="flex-grow flex flex-col gap-4 py-4 overflow-y-hidden">
                    <div className="space-y-2">
                        <Label htmlFor="chapter-title" className="text-base">Title</Label>
                        <Input
                            id="chapter-title"
                            value={currentChapter.title}
                            onChange={(e) => setCurrentChapter({ ...currentChapter, title: e.target.value })}
                            className="font-bold text-2xl h-12"
                        />
                    </div>
                    <div className="space-y-2 flex-grow flex flex-col border rounded-md p-4 bg-card">
                        <Label htmlFor="chapter-content">Content</Label>
                        <TiptapEditor 
                            content={currentChapter.content} 
                            onChange={(newContent) => setCurrentChapter({ ...currentChapter, content: newContent })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Chapter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

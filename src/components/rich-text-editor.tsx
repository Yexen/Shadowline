
'use client';

import { Editor } from '@tiptap/react';
import { Toolbar } from './toolbar';

interface RichTextEditorProps {
    editor: Editor | null;
}

export function RichTextEditor({ editor }: RichTextEditorProps) {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-card border rounded-md">
            <Toolbar editor={editor} />
            <div className="flex-grow p-6 overflow-y-auto">
                 <div className="prose prose-invert max-w-full">
                    <div className="tiptap" />
                </div>
            </div>
        </div>
    );
}


'use client';

import { type Editor } from '@tiptap/react';
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Quote,
    Undo,
    Redo,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Palette,
    Minus,
    Table,
    Link,
    Image,
    Type,
    Superscript,
    Subscript,
    ChevronDown,
} from 'lucide-react';
import { Toggle } from './ui/toggle';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

type Props = {
    editor: Editor | null;
};

export function Toolbar({ editor }: Props) {
    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const insertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
        <div className="p-2 border-b border-border flex items-center gap-1 flex-wrap">
            {/* Text Formatting */}
            <Toggle
                size="sm"
                pressed={editor.isActive('bold')}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('italic')}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('underline')}
                onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            >
                <Underline className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('strike')}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('superscript')}
                onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
            >
                <Superscript className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('subscript')}
                onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
            >
                <Subscript className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Headings Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Type className="h-4 w-4 mr-1" />
                        Heading
                        <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>
                        Normal Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 className="h-4 w-4 mr-2" />
                        Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="h-4 w-4 mr-2" />
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 className="h-4 w-4 mr-2" />
                        Heading 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Text Alignment */}
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'left' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <AlignLeft className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'center' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <AlignCenter className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'right' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <AlignRight className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive({ textAlign: 'justify' })}
                onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
            >
                <AlignJustify className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Lists and Quotes */}
            <Toggle
                size="sm"
                pressed={editor.isActive('bulletList')}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('orderedList')}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive('blockquote')}
                onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
            >
                <Quote className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Special Elements */}
            <Toggle
                size="sm"
                pressed={editor.isActive('codeBlock')}
                onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
            >
                <Code className="h-4 w-4" />
            </Toggle>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={addLink}
            >
                <Link className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
            >
                <Image className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={insertTable}
            >
                <Table className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Color Tools */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Highlighter className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run()}>
                        <div className="w-4 h-4 bg-yellow-300 mr-2 rounded" />
                        Yellow Highlight
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHighlight({ color: '#90EE90' }).run()}>
                        <div className="w-4 h-4 bg-green-300 mr-2 rounded" />
                        Green Highlight
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().toggleHighlight({ color: '#FFB6C1' }).run()}>
                        <div className="w-4 h-4 bg-pink-300 mr-2 rounded" />
                        Pink Highlight
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().unsetHighlight().run()}>
                        Remove Highlight
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Palette className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().setColor('#000000').run()}>
                        <div className="w-4 h-4 bg-black mr-2 rounded" />
                        Black
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().setColor('#FF0000').run()}>
                        <div className="w-4 h-4 bg-red-500 mr-2 rounded" />
                        Red
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().setColor('#0000FF').run()}>
                        <div className="w-4 h-4 bg-blue-500 mr-2 rounded" />
                        Blue
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().setColor('#d4af37').run()}>
                        <div className="w-4 h-4 bg-yellow-600 mr-2 rounded" />
                        Gotham Gold
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => editor.chain().focus().unsetColor().run()}>
                        Reset Color
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-8 mx-1" />

            {/* Undo/Redo */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
}


'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, EyeOff, Download, FileText, FileCode, Sparkles, PenLine, Library, BookPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { useDrafts, type Draft } from '@/hooks/use-drafts';
import { useVolumes } from '@/hooks/use-volumes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AskOracleDialog } from '@/components/ask-oracle-dialog';
import { SceneGenDialog } from '@/components/scene-gen-dialog';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;
  
  const { getDraft, addDraft, updateDraft } = useDrafts();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Draft');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { toast } = useToast();
  
  const { volumes, addChapterToVolume } = useVolumes();
  const [showVolumeDialog, setShowVolumeDialog] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState('');

  const [oracleOpen, setOracleOpen] = useState(false);
  const [sceneGenOpen, setSceneGenOpen] = useState(false);
  const [selection, setSelection] = useState('');

  const editor = useEditor({
    extensions: [
        StarterKit.configure({
            bulletList: { keepMarks: true, keepAttributes: true },
            orderedList: { keepMarks: true, keepAttributes: true },
        }),
        Placeholder.configure({
            placeholder: "The darkness of Gotham is a canvas. Paint your story...",
        }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
        setContent(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: "prose prose-invert prose-p:font-body prose-headings:font-headline focus:outline-none w-full max-w-full",
        },
    },
  });

  useEffect(() => {
    if (draftId === 'new') {
      setTitle('Untitled Draft');
      setContent('');
      setIsLoaded(true);
    } else {
      const draft = getDraft(draftId);
      if (draft) {
        setCurrentDraft(draft);
        setTitle(draft.title);
        setContent(draft.content);
        setLastSaved(draft.lastModified ? new Date(d.lastModified) : null);
      } else {
        router.replace('/editor/new');
      }
      setIsLoaded(true);
    }
  }, [draftId, getDraft, router]);
  
  useEffect(() => {
      if (editor && content !== editor.getHTML()) {
          editor.commands.setContent(content);
      }
  }, [content, editor]);

  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.state.doc.textContent;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [content, editor]);

  const handleSave = () => {
    setIsSaving(true);
    const savedDate = new Date();
    if (draftId === 'new') {
        const newDraftId = addDraft(title, content);
        router.replace(`/editor/${newDraftId}`);
    } else {
        updateDraft(draftId, title, content);
    }
    setLastSaved(savedDate);
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Draft Saved",
        description: "Your progress has been saved to the Batcomputer.",
      });
      if (statusRef.current) {
        statusRef.current.classList.add('autosave-flash');
        setTimeout(() => statusRef.current?.classList.remove('autosave-flash'), 1000);
      }
    }, 500);
  };
  
  const handleExport = (format: 'txt' | 'md') => {
    const textToExport = format === 'txt' ? editor?.getText() || '' : content;
    const blob = new Blob([textToExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToVolume = () => {
    if (selectedVolume) {
      addChapterToVolume(selectedVolume, title, content);
      toast({
        title: 'Chapter Saved',
        description: `"${title}" has been added to the selected volume.`,
      });
      setShowVolumeDialog(false);
      setSelectedVolume('');
    }
  };

  const handleOpenOracle = () => {
    const selectedText = editor?.state.selection.content().content.textBetween(0, editor.state.selection.content().size) || '';
    setSelection(selectedText || content);
    setOracleOpen(true);
  };

  const handleInsertText = (text: string) => {
    if (editor) {
        editor.chain().focus().insertContent(text).run();
        setSceneGenOpen(false);
    }
};

  if (!editor) return null;

  return (
    <>
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-headline text-2xl bg-transparent outline-none focus:border-b border-primary"
        />
        <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setSceneGenOpen(true)}>
              <PenLine />
              Generate Scene
            </Button>

            <Button variant="ghost" size="sm" onClick={handleOpenOracle}>
                <Sparkles />
                Ask Oracle
            </Button>
          
           <Dialog open={showVolumeDialog} onOpenChange={setShowVolumeDialog}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Library />
                  Save to Volume
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Save Draft to Volume</DialogTitle>
                    <DialogDescription>
                        Select a volume to save this draft as a new chapter.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="volume-select">Select a Volume</Label>
                    <Select onValueChange={setSelectedVolume} value={selectedVolume}>
                        <SelectTrigger id="volume-select">
                            <SelectValue placeholder="Choose a volume..." />
                        </SelectTrigger>
                        <SelectContent>
                            {volumes.map(vol => (
                                <SelectItem key={vol.id} value={vol.id}>{vol.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowVolumeDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveToVolume} disabled={!selectedVolume}>Save Chapter</Button>
                </DialogFooter>
            </DialogContent>
           </Dialog>

          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save />
            Save Draft
          </Button>
           <Button variant="ghost" size="sm" onClick={() => handleExport('md')}>
            <FileCode />
            Export .md
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('txt')}>
            <FileText />
            Export .txt
          </Button>
        </div>
      </header>

      <div className="grid gap-4 flex-1">
        <RichTextEditor editor={editor} />
      </div>

      <footer className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
        <span>Word Count: {wordCount}</span>
        <p ref={statusRef} className="transition-colors">
            {isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet.'}
        </p>
      </footer>
    </div>
    <AskOracleDialog 
        isOpen={oracleOpen}
        onClose={() => setOracleOpen(false)}
        contextText={selection}
    />
    <SceneGenDialog
        isOpen={sceneGenOpen}
        onClose={() => setSceneGenOpen(false)}
        onInsert={handleInsertText}
    />
    </>
  );
}

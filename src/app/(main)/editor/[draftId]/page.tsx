
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useBible } from '@/hooks/use-bible';
import { useDrafts, type Draft } from '@/hooks/use-drafts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGallery } from '@/hooks/use-gallery';
import { useWriters } from '@/hooks/use-writers';
import { useVolumes } from '@/hooks/use-volumes';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;
  
  const { getDraft, addDraft, updateDraft, drafts } = useDrafts();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Draft');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);

  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const { addChapterToVolume, volumes } = useVolumes();
  const [saveToVolumeOpen, setSaveToVolumeOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState('');


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
        setLastSaved(draft.lastModified ? new Date(draft.lastModified) : null);
      } else {
        // If draft not found, redirect to a new one
        router.replace('/editor/new');
      }
      setIsLoaded(true);
    }
  }, [draftId, getDraft, router]);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

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
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
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
    if (selectedVolume && currentDraft) {
      addChapterToVolume(selectedVolume, {
        id: `chapter-${Date.now()}`,
        title: currentDraft.title,
        content: currentDraft.content,
        status: 'draft',
      });
      toast({
        title: 'Chapter Added',
        description: `"${currentDraft.title}" has been added to the selected volume.`,
      });
      setSaveToVolumeOpen(false);
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: `Please select a volume.`,
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-headline text-2xl bg-transparent outline-none focus:border-b border-primary"
        />
        <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" disabled>
              <PenLine />
              Generate Scene
            </Button>

            <Button variant="ghost" size="sm" disabled>
                <Sparkles />
                Ask Oracle
            </Button>
          
          <Dialog open={saveToVolumeOpen} onOpenChange={setSaveToVolumeOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={draftId === 'new'}>
                    <Library />
                    Save to Volume
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Draft to Volume</DialogTitle>
                    <DialogDescription>
                        Select a volume to add this draft as a new chapter.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedVolume} value={selectedVolume}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a volume..." />
                        </SelectTrigger>
                        <SelectContent>
                            {volumes.map(volume => (
                                <SelectItem key={volume.id} value={volume.id}>{volume.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveToVolumeOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveToVolume}>
                        <BookPlus className="mr-2"/> Add Chapter
                    </Button>
                </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff /> : <Eye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
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

      <div className={cn("grid gap-4 flex-1", showPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
        <Textarea
          ref={textareaRef}
          placeholder="The darkness of Gotham is a canvas. Paint your story..."
          className="h-full w-full resize-none bg-card p-6 font-code text-base leading-relaxed"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          aria-label="Draft content"
          disabled={!isLoaded}
        />
        {showPreview && (
          <Card className="h-full overflow-y-auto bg-card">
            <CardContent className="p-6">
              <div className="prose prose-invert prose-p:font-body prose-headings:font-headline">
                {content.split('\n').map((line, i) => (
                    <p key={i}>{line || <>&nbsp;</>}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
        <span>Word Count: {wordCount}</span>
        <p ref={statusRef} className="transition-colors">
            {isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'Not saved yet.'}
        </p>
      </footer>
    </div>
  );
}

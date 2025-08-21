
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, EyeOff, Download, FileText, FileCode, Sparkles, PenLine, BookUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateContent, GenerateContentInput } from '@/ai/flows/ai-writing-assistant';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { useDrafts } from '@/hooks/use-drafts';
import { useVolumes } from '@/hooks/use-volumes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.draftId as string;
  
  const { getDraft, addDraft, updateDraft } = useDrafts();
  const { volumes, addChapter } = useVolumes();
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Draft');
  const [isLoaded, setIsLoaded] = useState(false);

  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { bibleData } = useBible();

  // AI Assistant State
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Scene Generator State
  const [scenePrompt, setScenePrompt] = useState('');
  const [generatedScene, setGeneratedScene] = useState('');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);
  const [sceneGeneratorOpen, setSceneGeneratorOpen] = useState(false);
  
  // Save to Volume State
  const [saveToVolumeOpen, setSaveToVolumeOpen] = useState(false);
  const [selectedVolume, setSelectedVolume] = useState<string | null>(null);


  useEffect(() => {
    if (draftId === 'new') {
      setTitle('Untitled Draft');
      setContent('');
      setIsLoaded(true);
    } else {
      const draft = getDraft(draftId);
      if (draft) {
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

  const handleAskAI = async () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.substring(start, end);

    if (!selection) {
      toast({
        variant: 'destructive',
        title: 'No Text Selected',
        description: 'Please select some text to get suggestions.',
      });
      return;
    }
    
    setSelectedText(selection);
    setIsGenerating(true);
    setSuggestions([]);
    setPopoverOpen(true);

    try {
        const input: GenerateContentInput = { 
          prompt: `Based on the following text, give me a few short, creative suggestions to continue or improve it: "${selection}"`,
          bibleData: JSON.stringify(bibleData) 
        };
        const result = await generateContent(input);
        setSuggestions(result.content.split('\n').filter(s => s.trim().length > 0));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: `Failed to get suggestions from Oracle.` });
      setPopoverOpen(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertSuggestion = (suggestion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent =
      content.substring(0, start) +
      suggestion +
      content.substring(end);

    setContent(newContent);
    setPopoverOpen(false);

    setTimeout(() => {
        textarea.focus();
        const newCursorPosition = start + suggestion.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleGenerateScene = async () => {
    if (!scenePrompt) return;
    setIsGeneratingScene(true);
    setGeneratedScene('');
    try {
      const input: GenerateContentInput = { 
        prompt: scenePrompt,
        bibleData: JSON.stringify(bibleData)
      };
      const result = await generateContent(input);
      setGeneratedScene(result.content);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate scene.' });
    } finally {
      setIsGeneratingScene(false);
    }
  };

  const handleInsertScene = () => {
    const textarea = textareaRef.current;
    if (!textarea || !generatedScene) return;

    const cursorPosition = textarea.selectionStart;
    const textToInsert = (content.length > 0 && content[cursorPosition - 1] !== '\n' ? '\n\n' : '') + generatedScene;

    const newContent = content.substring(0, cursorPosition) + textToInsert + content.substring(cursorPosition);
    setContent(newContent);
    setSceneGeneratorOpen(false);
    setGeneratedScene('');
    setScenePrompt('');
    
    setTimeout(() => {
        textarea.focus();
        const newCursorPosition = cursorPosition + textToInsert.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleSaveToVolume = () => {
    if (selectedVolume) {
        addChapter(selectedVolume, title, content);
        toast({
            title: "Saved to Volume",
            description: `"${title}" has been added as a new chapter.`
        });
        setSaveToVolumeOpen(false);
        setSelectedVolume(null);
    }
  }


  return (
    <div className="flex flex-col h-[calc(100vh-14rem)]">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-headline text-2xl bg-transparent outline-none focus:border-b border-primary"
        />
        <div className="flex items-center gap-2">
            <Dialog open={sceneGeneratorOpen} onOpenChange={setSceneGeneratorOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <PenLine />
                  Generate Scene
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Scene Generator</DialogTitle>
                  <DialogDescription>
                    Describe the scene you want to generate. Be as specific as you like.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="scene-prompt">
                      Prompt
                    </Label>
                    <Textarea 
                        id="scene-prompt" 
                        value={scenePrompt} 
                        onChange={(e) => setScenePrompt(e.target.value)} 
                        placeholder="e.g., A tense standoff in a derelict warehouse. Rain streaks down the grimy windows."
                        rows={5}
                    />
                  </div>
                  <Button onClick={handleGenerateScene} disabled={isGeneratingScene || !scenePrompt}>
                    {isGeneratingScene ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Scene</>}
                  </Button>
                   {generatedScene && (
                      <div className="space-y-2 pt-4">
                        <h4 className="font-bold font-headline">Generated Scene:</h4>
                        <div className="relative bg-accent/50 p-4 rounded-md space-y-2 prose prose-sm prose-invert max-h-60 overflow-auto">
                          <p>{generatedScene}</p>
                        </div>
                      </div>
                    )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSceneGeneratorOpen(false)}>Cancel</Button>
                  <Button onClick={handleInsertScene} disabled={!generatedScene}>
                    Insert Scene
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" onClick={handleAskAI}>
                    <Sparkles />
                    Ask Oracle
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none font-headline">Oracle Suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on: "{selectedText}"
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {isGenerating && <p>Generating insights...</p>}
                    {suggestions.length > 0 && (
                      <ul className="space-y-2">
                        {suggestions.slice(0, 5).map((suggestion, i) => (
                          <li key={i}>
                            <Button variant="link" className="p-0 h-auto text-left whitespace-normal" onClick={() => handleInsertSuggestion(suggestion)}>
                              {suggestion}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isGenerating && suggestions.length === 0 && <p>No suggestions found.</p>}
                  </div>
                </div>
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? <EyeOff /> : <Eye />}
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            <Save />
            Save Draft
          </Button>
            <Dialog open={saveToVolumeOpen} onOpenChange={setSaveToVolumeOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <BookUp />
                        Save to Volume
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Chapter to Volume</DialogTitle>
                        <DialogDescription>Select which volume you want to save this draft to as a new chapter.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label>Volume</Label>
                         <Select onValueChange={setSelectedVolume}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a volume..." />
                            </SelectTrigger>
                            <SelectContent>
                                {volumes.map(vol => (
                                    <SelectItem key={vol.id} value={vol.id}>{vol.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setSaveToVolumeOpen(false)}>Cancel</Button>
                         <Button onClick={handleSaveToVolume} disabled={!selectedVolume}>Save as Chapter</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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

    
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, EyeOff, Download, FileText, FileCode, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateContentSuggestions, GenerateContentSuggestionsInput } from '@/ai/flows/ai-writing-assistant';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function EditorPage() {
  const params = useParams<{ draftId: string }>();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('New Draft');
  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // AI Assistant State
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (params.draftId === 'new-draft') {
      setContent('');
      setTitle('Untitled Draft');
    } else {
      setTitle(`Draft: ${params.draftId}`);
      setContent(`This is the content for draft ${params.draftId}. Start writing your story here.`);
    }
  }, [params.draftId]);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
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

  const handleAskOracle = async () => {
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
      const input: GenerateContentSuggestionsInput = { prompt: selection };
      const result = await generateContentSuggestions(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to get suggestions from Oracle.' });
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
    
    // If text was selected, the end of selection should be the insertion point
    const insertionPoint = content.substring(0, start).length + selectedText.length;

    const newContent =
      content.substring(0, start) +
      suggestion +
      content.substring(end);

    setContent(newContent);
    setPopoverOpen(false);

    // Focus and set cursor position after the inserted text
    setTimeout(() => {
        textarea.focus();
        const newCursorPosition = start + suggestion.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-headline text-2xl bg-transparent outline-none focus:border-b border-primary"
        />
        <div className="flex items-center gap-2">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleAskOracle}>
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
            Save
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

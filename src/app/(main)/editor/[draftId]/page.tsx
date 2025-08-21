'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Eye, EyeOff, Download, FileText, FileCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
// A simple markdown parser can be used here. For simplicity, we'll just render the text.
// In a real app, you might use a library like 'marked' or 'react-markdown'.

export default function EditorPage({ params }: { params: { draftId: string } }) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('New Draft');
  const [showPreview, setShowPreview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const { toast } = useToast();

  // In a real app, you would fetch draft data from an API/localStorage based on draftId
  useEffect(() => {
    if (params.draftId === 'new-draft') {
      setContent('');
      setTitle('Untitled Draft');
    } else {
      // Fetch logic here
      setTitle(`Draft: ${params.draftId}`);
      setContent(`This is the content for draft ${params.draftId}. Start writing your story here.`);
    }
  }, [params.draftId]);

  const wordCount = useMemo(() => {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
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
                {/* Basic preview */}
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

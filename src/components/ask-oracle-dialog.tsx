
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { askOracle } from '@/ai/flows/oracle-flow';

interface AskOracleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
}

export function AskOracleDialog({ isOpen, onClose, contextText }: AskOracleDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    try {
      const result = await askOracle({ question, context: contextText });
      setAnswer(result);
    } catch (error) {
      console.error("Oracle error:", error);
      setAnswer("The Oracle is not responding. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Ask the Oracle</DialogTitle>
          <DialogDescription>
            Ask a question about the selected text or your entire draft. The Oracle will provide insights.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label>Context</Label>
            <ScrollArea className="h-32 w-full rounded-md border p-3 text-sm">
                {contextText ? contextText : <span className="text-muted-foreground">No text selected. The Oracle will consider the entire draft.</span>}
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oracle-question">Your Question</Label>
            <Input 
                id="oracle-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., What is the underlying theme here? Is this character's motivation clear?"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {isLoading && (
             <div className="flex items-center gap-3 p-4 justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>The Oracle is contemplating...</p>
            </div>
          )}
          {answer && (
            <div>
                <Label>The Oracle's Answer</Label>
                <div className="p-3 rounded-md bg-accent text-accent-foreground text-sm">
                    {answer}
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
            <Sparkles className="mr-2"/> Ask
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

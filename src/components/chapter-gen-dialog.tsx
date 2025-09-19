'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenLine, HelpCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { generateChapter } from '@/ai/flows/chapter-gen-flow';

interface ChapterGenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

const followUpQuestions = [
  "What is the emotional tone of this chapter? (Dark, hopeful, tense, melancholic, etc.)",
  "Which characters are involved and what are their motivations?",
  "What time of day/night does this take place?",
  "What Gotham location is the setting? (Wayne Manor, Arkham, Crime Alley, etc.)",
  "What is at stake in this chapter?",
  "How does this chapter advance the overall story arc?",
  "What secrets or revelations might be uncovered?",
  "Is there action, dialogue, or introspection focus?",
  "What themes should be explored? (Justice, redemption, fear, hope, etc.)",
  "How does Batman's dual identity as Bruce Wayne factor in?"
];

export function ChapterGenDialog({ isOpen, onClose, onInsert }: ChapterGenDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedChapter, setGeneratedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedChapter('');
    try {
      const result = await generateChapter(prompt);
      setGeneratedChapter(result);
    } catch (error) {
      console.error("Chapter generation error:", error);
      setGeneratedChapter("The shadows remain silent. The chapter could not be generated. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedChapter) {
      onInsert(generatedChapter);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedChapter('');
    setShowQuestions(false);
    onClose();
  };

  const getRandomQuestions = () => {
    const shuffled = [...followUpQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const handleQuestionClick = (question: string) => {
    const cleanQuestion = question.split('?')[0] + '?';
    if (prompt.trim()) {
      setPrompt(prompt + '\n\n' + cleanQuestion);
    } else {
      setPrompt(cleanQuestion);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Generate a Chapter</DialogTitle>
          <DialogDescription>
            Provide a prompt and let the AI ghostwriter craft a chapter for your Gotham narrative.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Chapter Prompt</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuestions(!showQuestions)}
                className="text-xs"
              >
                {showQuestions ? <HelpCircle className="mr-1 h-3 w-3" /> : <Lightbulb className="mr-1 h-3 w-3" />}
                {showQuestions ? 'Hide Questions' : 'Need Ideas?'}
              </Button>
            </div>
            <Textarea
              placeholder="e.g., 'Batman confronts the Joker in Arkham's depths' or 'Bruce Wayne attends a charity gala while tracking a lead'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={showQuestions ? 2 : 3}
              disabled={isLoading}
            />
          </div>

          {showQuestions && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                    Writing Prompts to Consider
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {getRandomQuestions().map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-left h-auto p-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleQuestionClick(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Click any question to add it to your prompt. These help the AI understand your vision.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

           <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PenLine className="mr-2" />}
            Generate Chapter
          </Button>
          {(isLoading || generatedChapter) && (
            <div className="space-y-2">
                <Textarea
                    readOnly
                    value={isLoading ? 'The shadows whisper secrets... Generating your chapter...' : generatedChapter}
                    className="h-48 bg-muted"
                />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleInsert} disabled={!generatedChapter || isLoading}>
            Insert into Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
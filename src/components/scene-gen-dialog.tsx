
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PenLine } from 'lucide-react';
import { generateScene } from '@/ai/flows/scene-gen-flow';

interface SceneGenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export function SceneGenDialog({ isOpen, onClose, onInsert }: SceneGenDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedScene, setGeneratedScene] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedScene('');
    try {
      const result = await generateScene(prompt);
      setGeneratedScene(result);
    } catch (error) {
      console.error("Scene generation error:", error);
      setGeneratedScene("The muses are silent. The scene could not be generated. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInsert = () => {
    if (generatedScene) {
      onInsert(generatedScene);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setGeneratedScene('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Generate a Scene</DialogTitle>
          <DialogDescription>
            Provide a prompt and let the AI ghostwriter draft a scene for you.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Textarea
            placeholder="e.g., 'Batman interrogates a thug on a rainy rooftop.' or 'Selina Kyle cases a museum, planning a heist.'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
           <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full">
            {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <PenLine className="mr-2" />}
            Generate
          </Button>
          {(isLoading || generatedScene) && (
            <div className="space-y-2">
                <Textarea
                    readOnly
                    value={isLoading ? 'Generating...' : generatedScene}
                    className="h-48 bg-muted"
                />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleInsert} disabled={!generatedScene || isLoading}>
            Insert into Editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

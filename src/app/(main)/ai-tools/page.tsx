
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateStoryIdea } from '@/ai/flows/idea-generator-flow';

export default function AiToolsPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedIdea, setGeneratedIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setGeneratedIdea('');
    try {
      const result = await generateStoryIdea(prompt);
      setGeneratedIdea(result);
    } catch (error) {
      console.error("Failed to generate story idea:", error);
      setGeneratedIdea('Failed to generate an idea. The Oracle is resting. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Use the Oracle's power to break through writer's block. Provide a theme, a character, or a simple phrase to generate a unique story idea.
        </p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Sparkles /> Story Idea Generator</CardTitle>
          <CardDescription>
            Enter a prompt to spark your next narrative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., 'A detective who can't forget a face', 'What if the Joker won?', 'A story about a cat in Gotham'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2" />}
            Generate Idea
          </Button>
        </CardContent>
      </Card>

      {generatedIdea && (
        <Card className="bg-card border-primary/50">
          <CardHeader>
            <CardTitle className="font-headline">Generated Idea</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert prose-p:font-body">
            <p>{generatedIdea}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

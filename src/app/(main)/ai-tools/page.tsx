
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, PenLine, Sparkles, Wand2 } from 'lucide-react';
import { generateContentSuggestions, GenerateContentSuggestionsInput } from '@/ai/flows/ai-writing-assistant';
import { generateCode, GenerateCodeInput } from '@/ai/flows/generate-code';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function AiToolsPage() {
  const [writingPrompt, setWritingPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [codeDescription, setCodeDescription] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<'CSS' | 'JavaScript'>('CSS');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const { toast } = useToast();

  const handleGenerateSuggestions = async () => {
    if (!writingPrompt) return;
    setIsGeneratingSuggestions(true);
    setSuggestions([]);
    try {
      const input: GenerateContentSuggestionsInput = { prompt: writingPrompt };
      const result = await generateContentSuggestions(input);
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate suggestions.' });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!codeDescription) return;
    setIsGeneratingCode(true);
    setGeneratedCode('');
    try {
      const input: GenerateCodeInput = { description: codeDescription, language: codeLanguage };
      const result = await generateCode(input);
      setGeneratedCode(result.code);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate code.' });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleApplyCode = () => {
    if (codeLanguage === 'CSS') {
        navigator.clipboard.writeText(generatedCode);
        toast({
          title: 'Code Copied!',
          description: (
            <div>
              <p>To make your changes permanent, paste the copied CSS at the end of the following file:</p>
              <pre className="mt-2 w-full rounded-md bg-muted p-2 font-code text-xs">src/app/globals.css</pre>
            </div>
          ),
          duration: 10000,
        });
    } else {
        toast({ variant: 'destructive', title: 'Not Supported', description: 'Applying JavaScript is not currently supported.' });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-bold uppercase tracking-wider text-foreground flex items-center gap-3">
          <BrainCircuit className="text-primary" />
          Oracle AI Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          Harness the power of the Batcomputer's AI to augment your creative process.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><PenLine/> AI Writing Assistant</CardTitle>
            <CardDescription>Overcome writer's block with AI-powered suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="writing-prompt">Your Prompt</Label>
              <Textarea
                id="writing-prompt"
                placeholder="e.g., A detective finds a mysterious object at a crime scene..."
                value={writingPrompt}
                onChange={(e) => setWritingPrompt(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateSuggestions} disabled={isGeneratingSuggestions || !writingPrompt}>
              {isGeneratingSuggestions ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Ideas</>}
            </Button>
            {suggestions.length > 0 && (
              <div className="space-y-2 pt-4">
                <h4 className="font-bold font-headline">Suggestions:</h4>
                <ul className="list-disc list-inside bg-accent/50 p-4 rounded-md space-y-2">
                  {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> AI Code Generator</CardTitle>
            <CardDescription>Generate CSS or JavaScript snippets from a description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code-description">Describe what you want to code</Label>
              <Textarea
                id="code-description"
                placeholder="e.g., A button that glows when hovered..."
                value={codeDescription}
                onChange={(e) => setCodeDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={codeLanguage} onValueChange={(v: 'CSS' | 'JavaScript') => setCodeLanguage(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="CSS">CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerateCode} disabled={isGeneratingCode || !codeDescription}>
              {isGeneratingCode ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Code</>}
            </Button>
            {generatedCode && (
              <div className="space-y-2 pt-4">
                <h4 className="font-bold font-headline">Generated Code:</h4>
                <pre className="bg-accent/50 p-4 rounded-md overflow-x-auto">
                  <code className="font-code text-sm">{generatedCode}</code>
                </pre>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleApplyCode} disabled={codeLanguage !== 'CSS'}>Apply Code</Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

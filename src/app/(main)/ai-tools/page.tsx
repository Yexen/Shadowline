'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, PenLine, Sparkles, Wand2, Copy, MessageSquareQuote } from 'lucide-react';
import { generateContent, GenerateContentInput } from '@/ai/flows/ai-writing-assistant';
import { generateCode, GenerateCodeInput } from '@/ai/flows/generate-code';
import { useToast } from '@/hooks/use-toast';
import { useBible } from '@/hooks/use-bible';

export default function AiToolsPage() {
  const [writingPrompt, setWritingPrompt] = useState('');
  const [generatedScene, setGeneratedScene] = useState('');
  const [isGeneratingScene, setIsGeneratingScene] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const [codeDescription, setCodeDescription] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<'CSS' | 'JavaScript'>('CSS');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const { toast } = useToast();
  const { bibleData } = useBible();

  const handleGenerateScene = async () => {
    if (!writingPrompt) return;
    setIsGeneratingScene(true);
    setGeneratedScene('');
    try {
      const input: GenerateContentInput = { 
        prompt: writingPrompt,
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

  const handleAskQuestion = async () => {
    if (!question) return;
    setIsAsking(true);
    setAnswer('');
    try {
      const input: GenerateContentInput = { 
        prompt: `Answer the following question: ${question}`,
        bibleData: JSON.stringify(bibleData) 
      };
      const result = await generateContent(input);
      setAnswer(result.content);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to get an answer.' });
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!codeDescription) return;
    setIsGeneratingCode(true);
    setGeneratedCode('');
    try {
      const input: GenerateCodeInput = { 
        description: codeDescription, 
        language: codeLanguage,
        bibleData: JSON.stringify(bibleData) 
      };
      const result = await generateCode(input);
      setGeneratedCode(result.code);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate code.' });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleCopy = (textToCopy: string, toastMessage: string) => {
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        toast({
          title: 'Copied to Clipboard!',
          description: toastMessage,
          duration: 5000,
        });
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><PenLine/> Scene Generator</CardTitle>
                <CardDescription>Describe a scene and Oracle will write it for you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="writing-prompt">Scene Prompt</Label>
                  <Textarea
                    id="writing-prompt"
                    placeholder="e.g., Batman corners a criminal on a rain-slicked rooftop. The criminal is surprisingly not afraid."
                    value={writingPrompt}
                    onChange={(e) => setWritingPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={handleGenerateScene} disabled={isGeneratingScene || !writingPrompt}>
                  {isGeneratingScene ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Scene</>}
                </Button>
                {generatedScene && (
                  <div className="space-y-2 pt-4">
                    <h4 className="font-bold font-headline">Generated Scene:</h4>
                    <div className="relative bg-accent/50 p-4 rounded-md space-y-2 prose prose-sm prose-invert max-h-60 overflow-auto">
                      <p>{generatedScene}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generatedScene, "Scene copied! You can now paste it in the editor.")}>
                        <Copy className="mr-2 h-4 w-4" /> Copy Scene
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><MessageSquareQuote/> Ask Oracle</CardTitle>
                <CardDescription>Ask a question and get a direct answer from the Oracle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question-prompt">Your Question</Label>
                  <Input
                    id="question-prompt"
                    placeholder="e.g., What is the history of Arkham Asylum?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>
                <Button onClick={handleAskQuestion} disabled={isAsking || !question}>
                  {isAsking ? 'Thinking...' : 'Ask Question'}
                </Button>
                {answer && (
                  <div className="space-y-2 pt-4">
                    <h4 className="font-bold font-headline">Oracle's Answer:</h4>
                    <div className="bg-accent/50 p-4 rounded-md space-y-2 prose prose-sm prose-invert">
                        <p>{answer}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

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
                    <Button variant="outline" size="sm" onClick={() => handleCopy(generatedCode, 'Great! Now, just ask me to "apply this CSS" in the chat, and I\'ll add it to your project permanently.')} disabled={codeLanguage !== 'CSS'}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </Button>
                 </div>
                  {codeLanguage === 'CSS' && 
                    <p className="text-xs text-muted-foreground pt-2">
                      After copying, ask me to "apply this CSS" in the chat to make it permanent.
                    </p>
                  }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

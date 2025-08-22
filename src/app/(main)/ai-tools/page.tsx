
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BrainCircuit, PenLine, Sparkles, Wand2, Copy, MessageSquareQuote, ImageIcon, Save, Bot } from 'lucide-react';
import { generateContent, GenerateContentInput } from '@/ai/flows/ai-writing-assistant';
import { generateCode, GenerateCodeInput } from '@/ai/flows/generate-code';
import { answerQuestion, AnswerQuestionInput, AnswerQuestionOutput } from '@/ai/flows/answer-question';
import { useToast } from '@/hooks/use-toast';
import { useBible } from '@/hooks/use-bible';
import { useGallery } from '@/hooks/use-gallery';
import Image from 'next/image';
import { useDrafts } from '@/hooks/use-drafts';
import { useVolumes } from '@/hooks/use-volumes';
import { useWriters } from '@/hooks/use-writers';
import Link from 'next/link';

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
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedGalleryFolder, setSelectedGalleryFolder] = useState<string | null>(null);


  const { toast } = useToast();
  const { bibleData } = useBible();
  const { folders, addImageToFolder } = useGallery();
  const { drafts } = useDrafts();
  const { volumes } = useVolumes();
  const { writers, activeWriter } = useWriters();
  
  const getFullContext = () => {
    return JSON.stringify({
        bible: bibleData,
        drafts,
        volumes,
        gallery: folders,
        writers,
        activeWriter,
    });
  }

  const handleGenerateScene = async () => {
    if (!writingPrompt) return;
    setIsGeneratingScene(true);
    setGeneratedScene('');
    try {
      const input: GenerateContentInput = { 
        prompt: writingPrompt,
        bibleData: getFullContext()
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
      const input: AnswerQuestionInput = {
        question: question,
        bibleData: getFullContext()
      };
      const result = await answerQuestion(input);
      setAnswer(result.answer);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get an answer from the Oracle.';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
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
        bibleData: getFullContext()
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

  const handleGenerateImage = async () => {
      if (!imagePrompt) return;
      
      setIsGeneratingImage(true);
      setGeneratedImageUrl('');
      
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: imagePrompt }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate image');
        }
        
        setGeneratedImageUrl(data.imageUrl);
        
        // Auto-select AI Generated folder
        const aiFolder = folders.find(f => f.name === "AI Generated");
        if (aiFolder) {
          setSelectedGalleryFolder(aiFolder.id);
        }
        
        toast({
          title: "Image Generated!",
          description: "Your DALL-E 3 image is ready.",
        });
        
      } catch (error: any) {
        console.error("Image generation error:", error);
        toast({
          variant: "destructive",
          title: "Image Generation Failed",
          description: error.message || "An unknown error occurred.",
        });
      } finally {
        setIsGeneratingImage(false);
      }
    };
    
   const handleSaveImageToGallery = () => {
    if (!generatedImageUrl || !selectedGalleryFolder) return;

    addImageToFolder(
        selectedGalleryFolder,
        'image',
        generatedImageUrl,
        imagePrompt,
        imagePrompt.split(" ").slice(0,2).join(" ")
    );

    toast({
        title: "Image Saved!",
        description: "The generated image has been saved to your gallery.",
    });
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
      <Card className="bg-card/50 hover:bg-card/80 transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Bot className="h-16 w-16 text-primary" />
            <div className="flex-grow text-center md:text-left">
              <h2 className="font-headline text-2xl font-bold">Nyxen is Online</h2>
              <p className="text-muted-foreground">Your dedicated AI assistant for worldbuilding, lore questions, and creative assistance.</p>
            </div>
            <Button asChild size="lg" className="font-bold">
              <Link href="/nyxen">Talk to Nyxen</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <p className="mt-2 text-muted-foreground">
          Harness the power of the Batcomputer's AI to augment your creative process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
            <CardDescription>Ask a question about your world and get an answer from the bible.</CardDescription>
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

         <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><ImageIcon/> AI Image Generator</CardTitle>
            <CardDescription>Generate an image from a text prompt using DALL-E 3.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-prompt">Image Prompt</Label>
              <Textarea
                id="image-prompt"
                placeholder="e.g., A cinematic shot of a futuristic batmobile racing through a neon-lit Gotham city in the rain."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleGenerateImage} disabled={isGeneratingImage || !imagePrompt}>
              {isGeneratingImage ? 'Generating...' : <><Sparkles className="mr-2 h-4 w-4" /> Generate Image</>}
            </Button>
            {generatedImageUrl && (
              <div className="space-y-4 pt-4">
                <h4 className="font-bold font-headline">Generated Image:</h4>
                <div className="relative aspect-square w-full rounded-md overflow-hidden border">
                    <Image src={generatedImageUrl} alt={imagePrompt} fill className="object-cover" />
                </div>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <Select onValueChange={setSelectedGalleryFolder} value={selectedGalleryFolder ?? undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select folder to save..." />
                        </SelectTrigger>
                        <SelectContent>
                            {folders.map(folder => (
                                <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSaveImageToGallery} disabled={!generatedImageUrl || !selectedGalleryFolder} className="w-full sm:w-auto">
                        <Save className="mr-2 h-4 w-4"/> Save to Gallery
                    </Button>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

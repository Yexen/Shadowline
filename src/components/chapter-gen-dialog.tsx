'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PenLine, HelpCircle, Lightbulb, BookOpen, Library, Plus, ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateChapter } from '@/ai/flows/chapter-gen-flow';
import { useBible } from '@/hooks/use-bible';
import { useVolumes } from '@/hooks/use-volumes';

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
  "How does Batman's dual identity as Bruce Wayne factor in?",
  "What weather conditions enhance the mood?",
  "Which villains or allies might appear?",
  "What internal conflicts is the protagonist facing?",
  "How does this chapter connect to previous events?",
  "What clues or foreshadowing should be included?",
  "What is the pacing - fast action or slow burn?",
  "Which POV character tells this story?",
  "What technology or gadgets are featured?",
  "How does Gotham's corruption manifest here?",
  "What civilian lives are affected by the events?",
  "What moral dilemmas arise in this chapter?",
  "How does the chapter end - cliffhanger or resolution?",
  "What sensory details bring the scene to life?",
  "Which supporting characters have important roles?",
  "What backstory information is revealed?"
];

export function ChapterGenDialog({ isOpen, onClose, onInsert }: ChapterGenDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [generatedChapter, setGeneratedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [selectedBibleEntries, setSelectedBibleEntries] = useState<string[]>([]);
  const [selectedVolumeChapters, setSelectedVolumeChapters] = useState<string[]>([]);

  const { bibleData, isLoaded: bibleLoaded } = useBible();
  const { volumes } = useVolumes();

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
    setShowResources(false);
    setSelectedBibleEntries([]);
    setSelectedVolumeChapters([]);
    onClose();
  };

  const getRandomQuestions = () => {
    const shuffled = [...followUpQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  const handleQuestionClick = (question: string) => {
    const cleanQuestion = question.split('?')[0] + '?';
    if (prompt.trim()) {
      setPrompt(prompt + '\n\n' + cleanQuestion);
    } else {
      setPrompt(cleanQuestion);
    }
  };

  const handleBibleEntryClick = (entryText: string) => {
    const contextText = `Reference from Bible: ${entryText}`;
    if (prompt.trim()) {
      setPrompt(prompt + '\n\n' + contextText);
    } else {
      setPrompt(contextText);
    }
  };

  const handleVolumeChapterClick = (chapterText: string) => {
    const contextText = `Reference from Volume: ${chapterText}`;
    if (prompt.trim()) {
      setPrompt(prompt + '\n\n' + contextText);
    } else {
      setPrompt(contextText);
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
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="text-xs"
                >
                  {showQuestions ? <HelpCircle className="mr-1 h-3 w-3" /> : <Lightbulb className="mr-1 h-3 w-3" />}
                  {showQuestions ? 'Hide Questions' : 'Need Ideas?'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResources(!showResources)}
                  className="text-xs"
                >
                  {showResources ? <BookOpen className="mr-1 h-3 w-3" /> : <Library className="mr-1 h-3 w-3" />}
                  {showResources ? 'Hide Resources' : 'Bible & Volumes'}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="e.g., 'Batman confronts the Joker in Arkham's depths' or 'Bruce Wayne attends a charity gala while tracking a lead'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={showQuestions || showResources ? 2 : 3}
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

          {showResources && (
            <Card className="border-dashed">
              <CardContent className="pt-4">
                <Tabs defaultValue="bible" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bible" className="text-xs">
                      <BookOpen className="mr-2 h-3 w-3" />
                      Bible Entries
                    </TabsTrigger>
                    <TabsTrigger value="volumes" className="text-xs">
                      <Library className="mr-2 h-3 w-3" />
                      Volume Chapters
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bible" className="space-y-2 mt-4">
                    {!bibleLoaded ? (
                      <p className="text-xs text-muted-foreground">Loading Bible entries...</p>
                    ) : bibleData.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No Bible entries available.</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {bibleData.map((category) =>
                          category.items.slice(0, 3).map((entry, index) => (
                            <Button
                              key={`${category.category}-${index}`}
                              variant="ghost"
                              size="sm"
                              className="justify-start text-left h-auto p-2 text-xs text-muted-foreground hover:text-foreground w-full"
                              onClick={() => handleBibleEntryClick(`${entry.title}: ${entry.fields?.[0]?.value || 'No description'}`)}
                            >
                              <div className="truncate">
                                <strong>{entry.title}</strong> - {entry.fields?.[0]?.value || 'No description'}
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="volumes" className="space-y-2 mt-4">
                    {volumes.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No volumes available.</p>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {volumes.map((volume) =>
                          volume.chapters.slice(0, 3).map((chapter) => (
                            <Button
                              key={`${volume.id}-${chapter.id}`}
                              variant="ghost"
                              size="sm"
                              className="justify-start text-left h-auto p-2 text-xs text-muted-foreground hover:text-foreground w-full"
                              onClick={() => handleVolumeChapterClick(`${volume.title} - ${chapter.title}: ${chapter.content?.substring(0, 100) || 'No content'}...`)}
                            >
                              <div className="truncate">
                                <strong>{volume.title} - {chapter.title}</strong>
                                {chapter.content && <span className="text-muted-foreground"> - {chapter.content.substring(0, 80)}...</span>}
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                <p className="text-xs text-muted-foreground mt-2">
                  Click any entry to add it as context to your prompt. This helps the AI maintain consistency with your established lore.
                </p>
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
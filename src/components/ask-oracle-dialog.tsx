
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, StickyNote, BookOpen, Library, Copy, ExternalLink } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { askOracle } from '@/ai/flows/oracle-flow';
import { useBible } from '@/hooks/use-bible';
import { useVolumes } from '@/hooks/use-volumes';
import { useNotes } from '@/hooks/use-notes';
import { useToast } from '@/hooks/use-toast';

interface AskOracleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contextText: string;
}

export function AskOracleDialog({ isOpen, onClose, contextText }: AskOracleDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [references, setReferences] = useState<Array<{source: string, content: string, type: 'bible' | 'volume'}>>([]);
  const [queryHistory, setQueryHistory] = useState<Array<{question: string, answer: string, timestamp: Date}>>([]);

  const { bibleData, isLoaded: bibleLoaded } = useBible();
  const { volumes } = useVolumes();
  const { addNote } = useNotes();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    setReferences([]);

    try {
      // Gather relevant references from Bible and Volumes
      const relevantRefs: Array<{source: string, content: string, type: 'bible' | 'volume'}> = [];

      // Search Bible entries for relevant content
      if (bibleLoaded) {
        bibleData.forEach(category => {
          category.items.forEach(item => {
            const searchText = (question + ' ' + contextText).toLowerCase();
            const itemText = (item.title + ' ' + (item.fields?.[0]?.value || '')).toLowerCase();
            if (itemText.includes(searchText.split(' ')[0]) ||
                searchText.split(' ').some(word => word.length > 3 && itemText.includes(word))) {
              relevantRefs.push({
                source: `${category.category}: ${item.title}`,
                content: item.fields?.[0]?.value || 'No description',
                type: 'bible'
              });
            }
          });
        });
      }

      // Search Volume chapters for relevant content
      volumes.forEach(volume => {
        volume.chapters.forEach(chapter => {
          const searchText = (question + ' ' + contextText).toLowerCase();
          const chapterText = (chapter.title + ' ' + (chapter.content || '')).toLowerCase();
          if (chapterText.includes(searchText.split(' ')[0]) ||
              searchText.split(' ').some(word => word.length > 3 && chapterText.includes(word))) {
            relevantRefs.push({
              source: `${volume.title}: ${chapter.title}`,
              content: chapter.content?.substring(0, 200) + '...' || 'No content',
              type: 'volume'
            });
          }
        });
      });

      setReferences(relevantRefs.slice(0, 5)); // Limit to 5 most relevant

      // Build enhanced context with references
      const enhancedContext = contextText +
        (relevantRefs.length > 0 ? '\n\nRelevant References:\n' +
        relevantRefs.map(ref => `${ref.source}: ${ref.content}`).join('\n') : '');

      const result = await askOracle({ question, context: enhancedContext });
      setAnswer(result);

      // Add to query history
      setQueryHistory(prev => [{
        question,
        answer: result,
        timestamp: new Date()
      }, ...prev].slice(0, 10)); // Keep last 10 queries

    } catch (error) {
      console.error("Oracle error:", error);
      setAnswer("The Oracle is not responding. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!question || !answer) return;

    const noteContent = `**Question:** ${question}\n\n**Oracle's Answer:** ${answer}\n\n**Context:** ${contextText || 'None'}\n\n**References:**\n${references.map(ref => `- ${ref.source}: ${ref.content}`).join('\n')}`;

    addNote(`Oracle Q&A: ${question.substring(0, 50)}...`, noteContent);

    toast({
      title: 'Saved to Notes',
      description: 'Oracle Q&A has been saved to your notes.',
    });
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    setReferences([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">Ask the Oracle</DialogTitle>
          <DialogDescription>
            Ask questions about your writing with intelligent references to your Bible and Volumes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ask" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ask">Ask Question</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="ask" className="space-y-4">
            <div className="space-y-2">
              <Label>Context</Label>
              <ScrollArea className="h-20 w-full rounded-md border p-3 text-sm">
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
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>The Oracle's Answer</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleSaveToNotes}>
                        <StickyNote className="h-4 w-4 mr-1" />
                        Save to Notes
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(answer)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-40 w-full rounded-md border p-3 text-sm bg-accent/50">
                    <div className="whitespace-pre-wrap">{answer}</div>
                  </ScrollArea>
                </div>

                {references.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      References Used ({references.length})
                    </Label>
                    <Card className="mt-2">
                      <CardContent className="p-3">
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {references.map((ref, index) => (
                            <div key={index} className="text-xs border-l-2 border-primary/30 pl-3">
                              <div className="font-medium flex items-center gap-1">
                                {ref.type === 'bible' ? <BookOpen className="h-3 w-3" /> : <Library className="h-3 w-3" />}
                                {ref.source}
                              </div>
                              <div className="text-muted-foreground truncate">{ref.content}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-96 w-full">
              {queryHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No questions asked yet. Start a conversation with the Oracle!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queryHistory.map((query, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Q: {query.question}</span>
                            <span className="text-xs text-muted-foreground">{query.timestamp.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="text-sm text-muted-foreground">
                            <strong>A:</strong> {query.answer.substring(0, 200)}...
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setQuestion(query.question);
                              setAnswer(query.answer);
                            }}
                          >
                            Load This Q&A
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Close</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !question.trim()}>
            <Sparkles className="mr-2"/> Ask Oracle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

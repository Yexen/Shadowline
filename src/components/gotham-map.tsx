
'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, Loader2, MapPin, Navigation, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface GothamMapProps {
  isOpen: boolean;
  onClose: () => void;
  mapHtml: string;
  title: string;
  highlightLocation?: string | null;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export function GothamMap({ isOpen, onClose, mapHtml, title, highlightLocation }: GothamMapProps) {
  const [showAssistant, setShowAssistant] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Modify mapHtml to include navigation script if location is specified
  const enhancedMapHtml = highlightLocation ? 
    mapHtml.replace(
      'init();',
      `
      init();
      
      // Auto-navigate to location
      console.log('🚀 Navigation script injected for: ${highlightLocation}');
      setTimeout(() => {
        console.log('🎯 Auto-navigating to: ${highlightLocation}');
        if (typeof camera !== 'undefined' && typeof locations !== 'undefined') {
          const searchName = '${highlightLocation}'.replace(/^(The\\s+)/i, '').toLowerCase();
          console.log('🔍 Searching for:', searchName);
          
          const location = locations.find(loc => {
            const locName = loc.name.replace(/^(The\\s+)/i, '').toLowerCase();
            console.log('  Comparing:', locName, 'vs', searchName);
            return locName.includes(searchName) || searchName.includes(locName);
          });
          
          if (location) {
            console.log('🎬 Flying to:', location.name, location.pos);
            const [x, y, z] = location.pos;
            camera.position.set(x + 50, y + 40, z + 50);
            camera.lookAt(x, y, z);
            console.log('✅ Camera navigation complete');
          } else {
            console.log('❌ Location not found. Available:', locations.map(l => l.name));
          }
        } else {
          console.log('⏳ Camera/locations not ready');
        }
      }, 500);`
    ) : mapHtml;

  // Show toast when navigating to location
  useEffect(() => {
    if (isOpen && highlightLocation) {
      toast({
        title: "Navigating to Location",
        description: `Flying to ${highlightLocation} on the map`,
      });
    }
  }, [isOpen, highlightLocation]);

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;

    setIsLoading(true);
    const question = currentQuestion;
    setCurrentQuestion('');

    try {
      // Import the AI flow
      const { askMapsAI } = await import('@/ai/flows/maps-ai-flow');
      const answer = await askMapsAI({
        question,
        mapContext: `Viewing map: ${title}`
      });

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        question,
        answer,
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev]);
    } catch (error) {
      console.error('Maps AI error:', error);
      toast({
        title: 'Error',
        description: 'The Map AI assistant is currently unavailable. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="w-[95vw] h-[90vh] max-w-none p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-full">
          {/* Map iframe */}
          <iframe
            ref={iframeRef}
            srcDoc={enhancedMapHtml}
            className="w-full h-full border-0"
            title={title}
          />

          {/* Floating AI Assistant Toggle Button */}
          <Button
            onClick={() => setShowAssistant(!showAssistant)}
            className="absolute bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-10"
            variant={showAssistant ? "default" : "secondary"}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* AI Assistant Panel */}
          {showAssistant && (
            <Card className="absolute bottom-20 right-4 w-80 h-96 shadow-xl z-20 flex flex-col">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Map AI Assistant</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAssistant(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Chat History */}
                  <ScrollArea className="flex-1 p-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Ask me about locations, routes, or anything about this map!</p>
                        <div className="mt-4 space-y-1 text-xs">
                          <p>• "Where is Wayne Manor?"</p>
                          <p>• "How far is Arkham from downtown?"</p>
                          <p>• "What's the safest route to Crime Alley?"</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="space-y-2">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <p className="text-sm font-medium">Q: {message.question}</p>
                            </div>
                            <div className="bg-accent p-2 rounded-lg">
                              <p className="text-sm">{message.answer}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                            <Separator />
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-3 border-t">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask about the map..."
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                        disabled={isLoading}
                        className="text-sm"
                      />
                      <Button
                        onClick={handleAskQuestion}
                        disabled={isLoading || !currentQuestion.trim()}
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

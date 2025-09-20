
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
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export function GothamMap({ isOpen, onClose, mapHtml, title }: GothamMapProps) {
  const [showAssistant, setShowAssistant] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Check for location to highlight when map opens
  useEffect(() => {
    if (isOpen && iframeRef.current) {
      const highlightLocation = localStorage.getItem('map-highlight-location');
      if (highlightLocation) {
        // Clear the stored location
        localStorage.removeItem('map-highlight-location');
        
        // Wait for iframe to load then highlight location
        setTimeout(() => {
          try {
            if (iframeRef.current?.contentWindow) {
              // Inject JavaScript to find and navigate to the location
              const script = `
                // Function to find and navigate to a location
                function highlightLocation(locationName) {
                  console.log('Looking for location:', locationName);
                  
                  // Wait a bit more for the map to be fully ready
                  setTimeout(() => {
                    // Find location in the locations list
                    const locationElements = document.querySelectorAll('.location');
                    let found = false;
                    
                    console.log('Found', locationElements.length, 'location elements');
                    
                    for (let element of locationElements) {
                      const text = element.textContent || '';
                      const cleanText = text.replace(/[🏰🦇🏥🏛️🌉🎭🏢⚖️🔬🏦🎪🌆🏪🏭]/g, '').trim();
                      const cleanLocationName = locationName.replace(/[🏰🦇🏥🏛️🌉🎭🏢⚖️🔬🏦🎪🌆🏪🏭]/g, '').trim();
                      
                      console.log('Checking:', cleanText, 'vs', cleanLocationName);
                      
                      if (cleanText.toLowerCase().includes(cleanLocationName.toLowerCase()) || 
                          cleanLocationName.toLowerCase().includes(cleanText.toLowerCase())) {
                        
                        // Get position from data-pos attribute
                        const posStr = element.getAttribute('data-pos');
                        if (posStr) {
                          const [x, y, z] = posStr.split(',').map(Number);
                          console.log('Found location at:', x, y, z);
                          
                          // Move camera to location with better positioning
                          if (window.camera && window.controls) {
                            // Animate camera movement
                            const startPos = window.camera.position.clone();
                            const targetPos = { x: x + 80, y: y + 60, z: z + 80 };
                            
                            let progress = 0;
                            const animate = () => {
                              progress += 0.05;
                              if (progress <= 1) {
                                window.camera.position.lerpVectors(startPos, new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z), progress);
                                window.controls.target.lerp(new THREE.Vector3(x, y, z), progress);
                                window.controls.update();
                                requestAnimationFrame(animate);
                              } else {
                                // Final position
                                window.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
                                window.controls.target.set(x, y, z);
                                window.controls.update();
                                
                                // Click the location to show details
                                setTimeout(() => element.click(), 500);
                              }
                            };
                            animate();
                            
                            found = true;
                            break;
                          }
                        }
                      }
                    }
                    
                    if (!found) {
                      console.log('Location not found. Available locations:');
                      locationElements.forEach(el => console.log('  -', el.textContent));
                    }
                  }, 1000);
                  
                  return true; // Always return true since we're doing async work
                }
                
                // Highlight the location
                highlightLocation('${highlightLocation}');
              `;
              
              iframeRef.current.contentWindow.eval(script);
              
              toast({
                title: "Location Found",
                description: `Navigated to ${highlightLocation} on the map`,
              });
            }
          } catch (error) {
            console.error('Failed to highlight location:', error);
          }
        }, 2000); // Wait for map to fully load
      }
    }
  }, [isOpen, toast]);

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
            srcDoc={mapHtml}
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

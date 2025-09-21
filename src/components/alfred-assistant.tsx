'use client';

import { useState, useRef, useEffect } from 'react';
import { alfredMemory } from '@/lib/alfred-memory';
import { getAlfredResponse, getRelevantKnowledge, personalInfo } from '@/lib/alfred-knowledge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X, Minimize2, Maximize2, Coffee, Bell, Brain, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'alfred';
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'excited' | 'thoughtful';
}

interface AlfredAssistantProps {
  className?: string;
}

export function AlfredAssistant({ className }: AlfredAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Ah, ${personalInfo.name}! Splendid to see you again. I've been keeping a watchful eye on your creative universe whilst you were away. The Batcave's systems are running smoothly, and I have ${alfredMemory.getMemoryStats().totalMemories} memories catalogued from our previous conversations. Tea's fresh, and I'm entirely at your disposal for any assistance with your Batman saga, the rather ingenious Codex system, or whatever brilliant scheme you've concocted today.`,
      sender: 'alfred',
      timestamp: new Date(),
      emotion: 'happy'
    }
  ]);
  const [conversationContext, setConversationContext] = useState({
    currentTopic: 'general',
    recentMessages: [],
    userMood: 'neutral' as const,
    sessionGoals: []
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [alfredEmotion, setAlfredEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'concerned'>('happy');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Update conversation context with memory system
    const newContext = alfredMemory.updateConversationContext(currentMessage, conversationContext);
    setConversationContext(newContext);

    setCurrentMessage('');
    setAlfredEmotion('thinking');

    // Generate intelligent response using memory and knowledge systems
    setTimeout(() => {
      const { response, emotion, suggestions } = alfredMemory.generatePersonalizedResponse(currentMessage, newContext);

      // Get relevant knowledge from your universe
      const relevantKnowledge = getRelevantKnowledge(currentMessage);
      let enhancedResponse = response;

      if (relevantKnowledge.length > 0) {
        enhancedResponse += ` Based on your ${relevantKnowledge[0].split(':')[0].toLowerCase()}, ${relevantKnowledge[0].split(':')[1]}`;
      }

      const alfredResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: enhancedResponse,
        sender: 'alfred',
        timestamp: new Date(),
        emotion: emotion
      };

      setMessages(prev => [...prev, alfredResponse]);
      setAlfredEmotion(emotion === 'thoughtful' ? 'thinking' : emotion === 'excited' ? 'happy' : emotion);

      // Add suggestions if available
      if (suggestions.length > 0) {
        setTimeout(() => {
          const suggestionMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: `If I may suggest: ${suggestions.join(', ')}. Would any of these be helpful, ${personalInfo.name}?`,
            sender: 'alfred',
            timestamp: new Date(),
            emotion: 'thoughtful'
          };
          setMessages(prev => [...prev, suggestionMessage]);
        }, 800);
      }
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 cursor-pointer transition-all duration-300 group"
          style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.15), 0 4px 20px rgba(0, 0, 0, 0.3)' }}
        >
          <Image
            src="/alfred-avatar.png"
            alt="Alfred Pennyworth"
            width={64}
            height={64}
            className="h-16 w-16 object-cover group-hover:scale-110 transition-transform duration-300"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.2))',
              borderRadius: '0'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <Card className={cn(
        "w-96 bg-gradient-to-br from-background via-card to-background border-border shadow-2xl transition-all duration-300",
        isMinimized ? "h-16" : "h-[500px]"
      )}>
        {/* Alfred's Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center space-x-3">
            {/* Alfred's Avatar with Tea Tray */}
            <div className="relative">
              {alfredEmotion === 'thinking' ? (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Brain className="h-5 w-5 text-primary animate-pulse" />
                </div>
              ) : (
                <Image
                  src="/alfred-avatar.png"
                  alt="Alfred Pennyworth"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-cover transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 12px rgba(255, 255, 255, 0.15))',
                    borderRadius: '0'
                  }}
                />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Alfred Pennyworth</h3>
              <p className="text-xs text-muted-foreground">Personal AI Butler</p>
            </div>
            {/* Status indicator */}
            <div className="flex items-center space-x-1">
              <Heart className={cn(
                "h-3 w-3 transition-colors duration-300",
                alfredEmotion === 'happy' ? "text-green-400 animate-pulse" :
                alfredEmotion === 'thinking' ? "text-blue-400" :
                alfredEmotion === 'concerned' ? "text-yellow-400" : "text-gray-400"
              )} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg text-sm",
                        message.sender === 'user'
                          ? "bg-primary text-primary-foreground ml-4"
                          : "bg-card text-card-foreground border border-border mr-4"
                      )}
                    >
                      {message.sender === 'alfred' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Image
                            src="/alfred-avatar.png"
                            alt="Alfred"
                            width={12}
                            height={12}
                            className="h-3 w-3 object-cover"
                            style={{
                              filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))',
                              borderRadius: '0'
                            }}
                          />
                          <span className="text-xs text-primary font-medium">Alfred</span>
                          {message.emotion && (
                            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground border-border">
                              {message.emotion}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="leading-relaxed">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-gradient-to-r from-accent/5 to-accent/10">
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask Alfred anything about your Batman universe..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>Press Enter to send</span>
                <span className="flex items-center space-x-1">
                  <Coffee className="h-3 w-3" />
                  <span>Powered by your personal LLM</span>
                </span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
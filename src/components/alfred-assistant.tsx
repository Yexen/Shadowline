'use client';

import { useState, useRef, useEffect } from 'react';
import { ClientMemoryManager } from '@/lib/alfred-memory-service';
import { alfredNotifications } from '@/lib/alfred-notifications';
import { AlfredBadge } from '@/components/alfred-notifications';
import { getAlfredResponse, getRelevantKnowledge, personalInfo } from '@/lib/alfred-knowledge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X, Minimize2, Maximize2, Coffee, Bell, Brain, Heart, Paperclip, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'alfred';
  timestamp: Date;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'excited' | 'thoughtful';
  attachments?: AttachmentInfo[];
}

interface AttachmentInfo {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
}

interface AlfredAssistantProps {
  className?: string;
}

export function AlfredAssistant({ className }: AlfredAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const now = new Date();
    const hour = now.getHours();
    const greetings = [
      // Time-based greetings
      hour < 6 ? `Good heavens, ${personalInfo.name}! Up rather early today, aren't we? Or perhaps late from last night's creative endeavours? Either way, I'm at your service.` :
      hour < 12 ? `Good morning, ${personalInfo.name}! The dawn brings fresh possibilities for your Batman universe. What shall we craft today?` :
      hour < 17 ? `Good afternoon, ${personalInfo.name}! I trust the day has been productive. Shall we dive into some creative work together?` :
      hour < 21 ? `Good evening, ${personalInfo.name}! Perfect time for some atmospheric Batman storytelling, wouldn't you say?` :
      `Working late again, ${personalInfo.name}? Admirable dedication. The night is when the best Batman stories come alive.`,

      // Varied general greetings
      `Ah, ${personalInfo.name}! How delightful to see you return. I've been organizing the digital Batcave in your absence.`,
      `Welcome back, ${personalInfo.name}! I do hope you're prepared for another session of brilliant creativity.`,
      `${personalInfo.name}, splendid timing! I was just pondering some intriguing possibilities for your projects.`,
      `Ah, Miss! Ready to tackle another chapter of your extraordinary Batman saga today?`,
      `Greetings, ${personalInfo.name}! The tea is fresh, my wit is sharp, and I'm entirely at your disposal.`
    ];

    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return [{
      id: '1',
      content: selectedGreeting,
      sender: 'alfred',
      timestamp: new Date(),
      emotion: 'happy'
    }];
  });
  const [conversationContext, setConversationContext] = useState({
    currentTopic: 'general',
    recentMessages: [],
    userMood: 'neutral' as const,
    sessionGoals: []
  });
  const [currentMessage, setCurrentMessage] = useState('');
  const [alfredEmotion, setAlfredEmotion] = useState<'neutral' | 'happy' | 'thinking' | 'concerned'>('happy');
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memoryManager = useRef<ClientMemoryManager>(new ClientMemoryManager());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to notification updates for badge count
    const unsubscribe = alfredNotifications.subscribe((notifications) => {
      setBadgeCount(alfredNotifications.getBadgeCount());
    });

    // Demo: Send a welcome notification after 3 seconds
    const welcomeTimer = setTimeout(() => {
      alfredNotifications.addNotification({
        type: 'toast',
        priority: 'low',
        title: 'Alfred here',
        message: 'I\'ll occasionally send helpful notifications. You can manage these in settings.',
        autoHide: true,
        hideAfter: 8000,
        tags: ['welcome', 'demo']
      });
    }, 3000);

    // Demo: Send a proactive suggestion after 15 seconds
    const suggestionTimer = setTimeout(() => {
      alfredNotifications.addNotification({
        type: 'toast',
        priority: 'medium',
        title: 'Alfred suggests',
        message: 'Would you like to explore some Batman character relationships today? I have some fascinating insights.',
        actions: [
          {
            id: 'explore',
            label: 'Tell me more',
            action: 'accept',
            style: 'primary'
          },
          {
            id: 'later',
            label: 'Maybe later',
            action: 'dismiss',
            style: 'secondary'
          }
        ],
        autoHide: true,
        hideAfter: 12000,
        tags: ['suggestion', 'batman']
      });
    }, 15000);

    return () => {
      unsubscribe();
      clearTimeout(welcomeTimer);
      clearTimeout(suggestionTimer);
    };
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const attachment: AttachmentInfo = {
            id: `${Date.now()}-${Math.random()}`,
            name: file.name,
            type: getFileType(file.type),
            url,
            size: file.size
          };
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input value
    if (event.target) {
      event.target.value = '';
    }
  };

  const getFileType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: AttachmentInfo['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const triggerContextualNotifications = (userMessage: string, alfredResponse: string) => {
    const messageLower = userMessage.toLowerCase();
    const responseLower = alfredResponse.toLowerCase();

    // Check for work completion mentions
    if (messageLower.includes('done') || messageLower.includes('finished') || messageLower.includes('completed')) {
      setTimeout(() => {
        alfredNotifications.addNotification({
          type: 'toast',
          priority: 'medium',
          title: 'Alfred commends',
          message: 'Excellent work, Miss! Shall I help you document this progress or move on to the next task?',
          actions: [
            {
              id: 'document',
              label: 'Document progress',
              action: 'accept',
              style: 'primary'
            },
            {
              id: 'next',
              label: 'Next task',
              action: 'accept',
              style: 'secondary'
            }
          ],
          autoHide: true,
          hideAfter: 10000,
          tags: ['completion', 'progress']
        });
      }, 2000);
    }

    // Check for creative blocks or struggles
    if (messageLower.includes('stuck') || messageLower.includes('blocked') || messageLower.includes('help')) {
      setTimeout(() => {
        alfredNotifications.addNotification({
          type: 'banner',
          priority: 'medium',
          title: 'Alfred offers assistance',
          message: 'I sense you might benefit from a different perspective. Would you like me to suggest some approaches?',
          actions: [
            {
              id: 'suggest',
              label: 'Yes, please',
              action: 'accept',
              style: 'primary'
            },
            {
              id: 'dismiss',
              label: 'I\'ll figure it out',
              action: 'dismiss',
              style: 'secondary'
            }
          ],
          tags: ['support', 'creativity']
        });
      }, 3000);
    }

    // Check for Batman/Codex work patterns
    if (messageLower.includes('batman') || messageLower.includes('codex') || messageLower.includes('character')) {
      // Random chance to suggest related work
      if (Math.random() < 0.3) {
        setTimeout(() => {
          alfredNotifications.addNotification({
            type: 'toast',
            priority: 'low',
            title: 'Alfred observes',
            message: 'Your creative energy seems focused today. Perhaps it\'s a good time to explore some character backstories?',
            autoHide: true,
            hideAfter: 8000,
            tags: ['observation', 'creative-flow']
          });
        }, 5000);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);

    // Store conversation context locally
    setConversationContext(prev => ({
      ...prev,
      recentMessages: [...prev.recentMessages.slice(-4), currentMessage],
      currentTopic: currentMessage.toLowerCase().includes('batman') ? 'batman' :
                   currentMessage.toLowerCase().includes('codex') ? 'codex' : 'general'
    }));

    setCurrentMessage('');
    setAttachments([]);
    setAlfredEmotion('thinking');

    // Generate intelligent response using OpenAI API
    const generateAlfredResponse = async () => {
      try {
        const response = await fetch('/api/ai/alfred', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentMessage,
            history: messages.slice(-10), // Send last 10 messages for context
            provider: 'openai',
            attachments: attachments.length > 0 ? attachments : undefined
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response from Alfred');
        }

        const alfredResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'alfred',
          timestamp: new Date(),
          emotion: data.emotion || 'neutral'
        };

        setMessages(prev => [...prev, alfredResponse]);
        setAlfredEmotion(data.emotion === 'thoughtful' ? 'thinking' : data.emotion === 'excited' ? 'happy' : data.emotion);

        // Store conversation in client memory for future sessions
        memoryManager.current.addMemory({
          type: 'conversation',
          content: `User: ${currentMessage} | Alfred: ${data.response}`,
          context: [conversationContext.currentTopic, data.emotion],
          importance: attachments.length > 0 ? 'high' : 'medium',
          tags: ['conversation', conversationContext.currentTopic, data.emotion]
        });

        // Trigger contextual notifications based on conversation
        triggerContextualNotifications(currentMessage, data.response);

      } catch (error) {
        console.error('Alfred API error:', error);

        // Fallback to local response if API fails
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I do apologize, Miss. It seems I'm having a spot of technical trouble at the moment. Perhaps we could try again shortly?",
          sender: 'alfred',
          timestamp: new Date(),
          emotion: 'concerned'
        };

        setMessages(prev => [...prev, fallbackResponse]);
        setAlfredEmotion('concerned');
      }
    };

    generateAlfredResponse();
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
          className="h-16 w-16 cursor-pointer transition-all duration-300 group relative"
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
          <AlfredBadge count={badgeCount} />
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

                      {/* Attachment Display */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {message.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 bg-background/50 rounded p-2 text-xs border border-border/50">
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{attachment.name}</p>
                                <p className="text-muted-foreground">{formatFileSize(attachment.size)}</p>
                              </div>
                              {attachment.type === 'image' && (
                                <div className="w-12 h-12 rounded overflow-hidden">
                                  <img src={attachment.url} alt={attachment.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          ))}
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
              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-2 text-xs">
                      {getFileIcon(attachment.type)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{attachment.name}</p>
                        <p className="text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask Alfred anything about your Batman universe..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() && attachments.length === 0}
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
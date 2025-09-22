'use client';

import { useState, useRef, useEffect } from 'react';
import { ClientMemoryManager } from '@/lib/alfred-memory-service';
import { alfredNotifications } from '@/lib/alfred-notifications';
import { alfredSearch } from '@/lib/alfred-search';
import { alfredReminders } from '@/lib/alfred-reminders';
import { nativeNotifications } from '@/lib/native-notifications';
import { AlfredSettings } from '@/components/alfred-settings';
import { AlfredReminders } from '@/components/alfred-reminders';
import { RemindMeLaterModal } from '@/components/remind-me-later-modal';
import { getAlfredResponse, getRelevantKnowledge, personalInfo } from '@/lib/alfred-knowledge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, X, Maximize2, Bell, Brain, Heart, Paperclip, FileText, Image as ImageIcon, Video, Music, Settings, Clock, Plus, History, Send, Trash2, Edit3 } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('alfred-current-chat') || 'default';
    }
    return 'default';
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem(`alfred-chat-${currentChatId}`);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }

    const now = new Date();
    const hour = now.getHours();
    const greetings = [
      hour < 6 ? `Good heavens, ${personalInfo.name}! Up rather early today, aren't we? Or perhaps late from last night's creative endeavours? Either way, I'm at your service.` :
      hour < 12 ? `Good morning, ${personalInfo.name}! The dawn brings fresh possibilities for your Batman universe. What shall we craft today?` :
      hour < 17 ? `Good afternoon, ${personalInfo.name}! I trust the day has been productive. Shall we dive into some creative work together?` :
      hour < 21 ? `Good evening, ${personalInfo.name}! Perfect time for some atmospheric Batman storytelling, wouldn't you say?` :
      `Working late again, ${personalInfo.name}? Admirable dedication. The night is when the best Batman stories come alive.`,
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
  const [showSettings, setShowSettings] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatList, setChatList] = useState<string[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [unseenNotifications, setUnseenNotifications] = useState<any[]>([]);
  const [showRemindLater, setShowRemindLater] = useState(false);
  const [remindLaterData, setRemindLaterData] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatName, setEditingChatName] = useState('');
  const [chatNames, setChatNames] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('alfred-chat-names');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const memoryManager = useRef<ClientMemoryManager>(new ClientMemoryManager());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat list on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const chats: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('alfred-chat-')) {
          const chatId = key.replace('alfred-chat-', '');
          if (chatId !== currentChatId) {
            chats.push(chatId);
          }
        }
      }
      chats.unshift(currentChatId);
      setChatList(chats);
    }
  }, [currentChatId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem(`alfred-chat-${currentChatId}`, JSON.stringify(messages));
        localStorage.setItem('alfred-current-chat', currentChatId);
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    const unsubscribe = alfredNotifications.subscribe((notifications) => {
      setBadgeCount(alfredNotifications.getBadgeCount());
      setUnseenNotifications(notifications.filter(n => n.type !== 'badge'));
    });

    const handleRemindLater = (event: CustomEvent) => {
      setRemindLaterData({
        title: event.detail.title,
        message: event.detail.message
      });
      setShowRemindLater(true);
    };

    window.addEventListener('alfred:remind-later', handleRemindLater as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener('alfred:remind-later', handleRemindLater as EventListener);
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

  const createNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    
    const now = new Date();
    const hour = now.getHours();
    const greetings = [
      `Ah, a fresh conversation! How delightful, ${personalInfo.name}. What shall we explore today?`,
      `New chat, new possibilities! I'm entirely at your service, Miss.`,
      `Starting anew, are we? Excellent! I do so enjoy our conversations.`,
      hour < 12 ? `A new morning chat! Perfect timing for creative endeavours.` :
      hour < 17 ? `A fresh afternoon discussion! What brings you here today?` :
      `Evening contemplations in a new chat! How atmospheric.`
    ];
    
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    setMessages([{
      id: '1',
      content: selectedGreeting,
      sender: 'alfred',
      timestamp: new Date(),
      emotion: 'happy'
    }]);
    
    // Set initial name as "New Chat" - will be updated when user sends first message
    const updatedNames = { ...chatNames, [newChatId]: 'New Chat' };
    setChatNames(updatedNames);
    localStorage.setItem('alfred-chat-names', JSON.stringify(updatedNames));
  };

  const loadChat = (chatId: string) => {
    if (chatId === currentChatId) return;
    
    setCurrentChatId(chatId);
    
    if (typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem(`alfred-chat-${chatId}`);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Failed to load chat:', error);
      }
    }
    
    setShowChatHistory(false);
  };

  const getChatPreview = (chatId: string): string => {
    if (typeof window === 'undefined') return '';
    
    try {
      const savedMessages = localStorage.getItem(`alfred-chat-${chatId}`);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        const lastUserMessage = parsed.reverse().find((msg: any) => msg.sender === 'user');
        return lastUserMessage?.content?.substring(0, 50) + '...' || 'New chat';
      }
    } catch (error) {
      console.error('Failed to get chat preview:', error);
    }
    
    return 'Chat ' + chatId;
  };

  const deleteChat = (chatId: string) => {
    if (chatId === 'default') return; // Prevent deleting default chat
    
    // Remove from localStorage
    localStorage.removeItem(`alfred-chat-${chatId}`);
    
    // Remove from chat names
    const updatedNames = { ...chatNames };
    delete updatedNames[chatId];
    setChatNames(updatedNames);
    localStorage.setItem('alfred-chat-names', JSON.stringify(updatedNames));
    
    // Update chat list
    setChatList(prev => prev.filter(id => id !== chatId));
    
    // If we're deleting the current chat, switch to default
    if (chatId === currentChatId) {
      setCurrentChatId('default');
      loadChat('default');
    }
  };

  const renameChat = (chatId: string, newName: string) => {
    const updatedNames = { ...chatNames, [chatId]: newName };
    setChatNames(updatedNames);
    localStorage.setItem('alfred-chat-names', JSON.stringify(updatedNames));
    setEditingChatId(null);
    setEditingChatName('');
  };

  const startRename = (chatId: string) => {
    setEditingChatId(chatId);
    setEditingChatName(getChatName(chatId));
  };

  const getChatName = (chatId: string): string => {
    if (chatNames[chatId]) return chatNames[chatId];
    if (chatId === 'default') return 'Main Chat';
    return `Chat ${chatId.replace('chat-', '')}`;
  };

  const generateChatNameFromMessage = (message: string): string => {
    // Take first 30 characters and clean up
    let name = message.trim().substring(0, 30);
    if (message.length > 30) name += '...';
    
    // Remove line breaks and normalize
    name = name.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    
    return name || 'New Chat';
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
    setConversationContext(prev => ({
      ...prev,
      recentMessages: [...prev.recentMessages.slice(-4), currentMessage],
      currentTopic: currentMessage.toLowerCase().includes('batman') ? 'batman' :
                   currentMessage.toLowerCase().includes('codex') ? 'codex' : 'general'
    }));

    // Auto-generate chat name from first user message
    if (messages.length === 1 && messages[0].sender === 'alfred') {
      const newName = generateChatNameFromMessage(currentMessage);
      const updatedNames = { ...chatNames, [currentChatId]: newName };
      setChatNames(updatedNames);
      localStorage.setItem('alfred-chat-names', JSON.stringify(updatedNames));
    }

    const messageToSend = currentMessage;
    setCurrentMessage('');
    setAttachments([]);
    setAlfredEmotion('thinking');

    try {
      const response = await fetch('/api/ai/alfred', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          history: messages.slice(-10),
          provider: 'openai',
          attachments: attachments.length > 0 ? attachments : undefined,
          clientMemories: memoryManager.current.getAllMemories()
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

      if (data.updatedMemories) {
        memoryManager.current.syncMemoriesFromServer(data.updatedMemories);
      }

    } catch (error) {
      console.error('Alfred API error:', error);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Minimized state - just avatar + notification badge
  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 cursor-pointer transition-all duration-300 group relative"
        >
          <Image
            src="/alfred-avatar.png"
            alt="Alfred Pennyworth"
            width={64}
            height={64}
            className="h-16 w-16 object-cover group-hover:scale-110 transition-transform duration-300 rounded-full"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 16px rgba(255, 255, 255, 0.2))'
            }}
          />
          {badgeCount > 0 && (
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {badgeCount > 9 ? '9+' : badgeCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "fixed z-50 transition-all duration-300",
        isExpanded ? "inset-4" : "bottom-6 right-6",
        className
      )}>
        <Card className={cn(
          "bg-card border-border shadow-2xl transition-all duration-300 flex backdrop-blur-sm",
          isExpanded ? "w-full h-full max-w-none rounded-none" : "w-96 h-[500px] rounded-xl"
        )}>
          {/* Sidebar with quick actions */}
          <div className="w-12 bg-muted/50 border-r border-border flex flex-col items-center py-4 space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatHistory(true)}
                  className="h-8 w-8 p-0"
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Chat History</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={createNewChat}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">New Chat</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotificationPopup(true)}
                  className="h-8 w-8 p-0 relative"
                >
                  <Bell className="h-4 w-4" />
                  {badgeCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Notifications</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReminders(true)}
                  className="h-8 w-8 p-0"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Reminders</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Attach Files</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Settings</TooltipContent>
            </Tooltip>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header with only escape and expand */}
            <div className={cn(
              "flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-primary/5",
              isExpanded ? "p-6" : "p-4"
            )}>
              <div className="flex items-center space-x-3">
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
                      className="w-10 h-10 object-cover transition-all duration-300 rounded-full"
                      style={{
                        filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))'
                      }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Alfred Pennyworth</h3>
                  <p className="text-xs text-muted-foreground">Personal AI Butler</p>
                </div>
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
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-0">
                <div className={cn(
                  "space-y-4 min-w-0",
                  isExpanded ? "p-8 max-w-4xl mx-auto" : "p-4"
                )}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start space-x-3 min-w-0",
                        message.sender === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.sender === 'alfred' && (
                        <Image
                          src="/alfred-avatar.png"
                          alt="Alfred"
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover flex-shrink-0 mt-1 rounded-full"
                          style={{
                            filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
                          }}
                        />
                      )}
                      {message.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1 text-primary-foreground font-medium text-sm">
                          Y
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "rounded-2xl transition-all duration-200 shadow-sm max-w-[75%] p-4 break-words overflow-wrap-anywhere",
                          message.sender === 'user'
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/80 border border-border text-foreground"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "text-xs font-medium",
                              message.sender === 'user' 
                                ? "text-primary-foreground/90" 
                                : "text-foreground"
                            )}>
                              {message.sender === 'user' ? 'Yekta' : 'Alfred'}
                            </span>
                            {message.emotion && (
                              <Badge 
                                variant="secondary" 
                                className={cn(
                                  "text-xs h-4 px-1.5",
                                  message.sender === 'user'
                                    ? "bg-primary-foreground/20 text-primary-foreground/80"
                                    : "bg-secondary text-secondary-foreground"
                                )}
                              >
                                {message.emotion}
                              </Badge>
                            )}
                          </div>
                          <span className={cn(
                            "text-xs opacity-70",
                            message.sender === 'user' 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          )}>
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>

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

                        <p className="whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className={cn(
                "border-t border-border bg-gradient-to-r from-accent/5 to-accent/10",
                isExpanded ? "p-6" : "p-4"
              )}>
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
                  <Textarea
                    placeholder="Ask Alfred anything... (Shift+Enter for new line)"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[50px] max-h-[120px] bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-ring resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() && attachments.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                />
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Modals */}
        {showSettings && (
          <AlfredSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showReminders && (
          <AlfredReminders
            isOpen={showReminders}
            onClose={() => setShowReminders(false)}
          />
        )}

        {showRemindLater && remindLaterData && (
          <RemindMeLaterModal
            isOpen={showRemindLater}
            onClose={() => {
              setShowRemindLater(false);
              setRemindLaterData(null);
            }}
            notificationTitle={remindLaterData.title}
            notificationMessage={remindLaterData.message}
          />
        )}

        {/* Chat History Modal */}
        {showChatHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowChatHistory(false)} />
            <Card className="relative w-full max-w-md mx-4 bg-card border-border shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/alfred-avatar.png"
                      alt="Alfred"
                      width={24}
                      height={24}
                      className="w-6 h-6 object-cover rounded-full"
                    />
                    <h3 className="text-lg font-semibold">Chat History</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatHistory(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {chatList.map((chatId) => (
                    <div key={chatId} className="group relative">
                      {editingChatId === chatId ? (
                        <div className="flex items-center space-x-2 p-3 border rounded-lg">
                          <Input
                            value={editingChatName}
                            onChange={(e) => setEditingChatName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameChat(chatId, editingChatName);
                              } else if (e.key === 'Escape') {
                                setEditingChatId(null);
                                setEditingChatName('');
                              }
                            }}
                            className="flex-1 text-sm"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => renameChat(chatId, editingChatName)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant={chatId === currentChatId ? "default" : "ghost"}
                          className="w-full justify-start text-left h-auto p-3 pr-12"
                          onClick={() => loadChat(chatId)}
                        >
                          <div className="flex flex-col items-start w-full">
                            <span className="font-medium text-sm">
                              {getChatName(chatId)}
                            </span>
                            <span className="text-xs text-muted-foreground mt-1 truncate w-full">
                              {getChatPreview(chatId)}
                            </span>
                          </div>
                        </Button>
                      )}
                      
                      {/* Action buttons */}
                      {editingChatId !== chatId && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(chatId);
                            }}
                            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                            title="Rename chat"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          {chatId !== 'default' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this chat?')) {
                                  deleteChat(chatId);
                                }
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                              title="Delete chat"
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-4 pt-4 border-t">
                  <Button
                    onClick={() => {
                      createNewChat();
                      setShowChatHistory(false);
                    }}
                    className="w-full"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification Popup */}
        {showNotificationPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={() => setShowNotificationPopup(false)} />
            <Card className="relative w-full max-w-lg mx-4 bg-card border-border shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-semibold">Notifications</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotificationPopup(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3 pr-4">
                    {unseenNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No notifications</p>
                      <p className="text-sm mt-1">Alfred will send you helpful updates here</p>
                    </div>
                  ) : (
                    unseenNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border border-border rounded-lg bg-background/50"
                      >
                        <div className="flex items-start space-x-3">
                          <Image
                            src="/alfred-avatar.png"
                            alt="Alfred"
                            width={20}
                            height={20}
                            className="w-5 h-5 object-cover flex-shrink-0 mt-0.5 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {notification.priority}
                              </Badge>
                            </div>
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex space-x-2 mt-2">
                                {notification.actions.map((action: any) => (
                                  <Button
                                    key={action.id}
                                    variant={action.style === 'primary' ? 'default' : 'outline'}
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => {
                                      action.handler?.();
                                      setUnseenNotifications(prev => prev.filter(n => n.id !== notification.id));
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              alfredNotifications.removeNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </ScrollArea>
                
                {unseenNotifications.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        alfredNotifications.clearAll();
                        setShowNotificationPopup(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Clear All Notifications
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
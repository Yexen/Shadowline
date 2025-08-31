'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2,
  RefreshCw,
  Download,
  Copy,
  Crown,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAiProvider } from '@/hooks/use-ai-provider';
import { callAiProvider, type AiMessage } from '@/lib/ai-providers';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
  tokensUsed?: number;
}

export default function CouncilChamberPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    selectedProvider, 
    openAiApiKey, 
    claudeApiKey, 
    geminiApiKey,
    isLoaded 
  } = useAiProvider();

  // Check if all API keys are available for Council Chamber mode
  const allKeysAvailable = openAiApiKey && claudeApiKey && geminiApiKey;
  const isCouncilEnabled = selectedProvider === 'all' && allKeysAvailable;

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: isCouncilEnabled 
            ? `🏛️ **Welcome to the Council Chamber** 🏛️

The Council Chamber is now in session. Here, the three great AI minds converge to deliberate on your queries:

• **Claude** - Strategic and analytical counsel
• **GPT-4** - Creative and comprehensive insights  
• **Gemini** - Multi-perspective reasoning

When you ask a question, all three models will contribute their expertise. The primary response will be highlighted, with alternative perspectives shown below.

*"In the multitude of counselors there is wisdom."* - What would you like the council to discuss?`
            : `🏛️ **Council Chamber - Setup Required** 🏛️

Welcome to the Council Chamber, where multiple AI minds collaborate to provide comprehensive insights.

${!isLoaded ? '⏳ Loading settings...' : 
  selectedProvider !== 'all' ? 
    '⚙️ **Action Required:** Please go to Settings and select "ALL (Multi-LLM Mix)" as your AI provider.' :
    '🔑 **API Keys Required:** All three API keys (OpenAI, Claude, Gemini) must be configured in Settings to enable the Council Chamber.'
}

The Council Chamber only works when ALL is selected and all API keys are present.`,
          timestamp: new Date(),
          model: 'System'
        }
      ]);
    }
  }, [isCouncilEnabled, isLoaded, selectedProvider]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isCouncilEnabled) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiMessages: AiMessage[] = [
        {
          role: 'system',
          content: 'You are participating in a Council Chamber where multiple AI models collaborate to provide comprehensive insights. Provide thoughtful, well-reasoned responses that complement other AI perspectives.'
        },
        {
          role: 'user',
          content: input.trim()
        }
      ];

      const response = await callAiProvider(
        'all',
        '',
        aiMessages,
        0.7,
        {
          openAiApiKey,
          claudeApiKey,
          geminiApiKey
        }
      );
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        model: response.model,
        tokensUsed: response.tokensUsed,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: `The Council Chamber encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API keys and try again.`,
        timestamp: new Date(),
        model: 'Error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Council Chamber Error",
        description: "Failed to process your question",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `council-chamber-session-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    setMessages(messages.slice(0, 1)); // Keep welcome message
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3">
          <Crown className="w-8 h-8 text-primary" />
          Council Chamber
        </h1>
        <p className="text-muted-foreground mt-2">
          Multi-LLM collaborative intelligence - where Claude, GPT-4, and Gemini deliberate together
        </p>
      </div>

      {!isCouncilEnabled && isLoaded && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {selectedProvider !== 'all' 
              ? 'Council Chamber requires "ALL (Multi-LLM Mix)" to be selected in Settings.'
              : 'All three API keys (OpenAI, Claude, Gemini) must be configured in Settings to use the Council Chamber.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Interface */}
      <Card className="flex flex-col h-[700px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Council Session
                {isCouncilEnabled && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Multi-LLM Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isCouncilEnabled 
                  ? 'Ask complex questions and get perspectives from multiple AI models'
                  : 'Configure all API keys and select ALL provider to begin'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearConversation}
                disabled={messages.length <= 1}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportConversation}
                disabled={messages.length <= 1}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
            <div className="space-y-6 py-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                        {message.model?.includes('Multi-LLM') ? (
                          <Crown className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] space-y-2 ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* Model info */}
                      {message.model && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{message.model}</span>
                          {message.tokensUsed && (
                            <span>{message.tokensUsed} tokens</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="bg-muted p-2 rounded-full">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => copyMessage(message.content)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                    <Crown className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">The Council is deliberating... Consulting Claude, GPT-4, and Gemini...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Input */}
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={isCouncilEnabled 
                  ? "Ask the Council a complex question requiring multiple perspectives..." 
                  : "Configure ALL provider and API keys to begin..."
                }
                disabled={!isCouncilEnabled || isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || !isCouncilEnabled || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {!isCouncilEnabled && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                Set AI Provider to "ALL" and configure all API keys in Settings to enable the Council Chamber
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
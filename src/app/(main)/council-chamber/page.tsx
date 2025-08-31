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
  AlertTriangle,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useCouncilSessions, type CouncilMessage } from '@/hooks/use-council-sessions';
import { CouncilSessionsSidebar } from '@/components/council-sessions-sidebar';
import { FileAttachments } from '@/components/file-attachments';
import { useFileAttachments } from '@/hooks/use-file-attachments';

export default function CouncilChamberPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Council sessions management
  const { 
    currentSessionId, 
    getCurrentSession, 
    createSession,
    addMessage,
    clearSession,
    setCurrentSession,
    isLoaded: sessionsLoaded
  } = useCouncilSessions();
  
  // File attachments
  const { attachments, getAttachmentsContext, clearAttachments } = useFileAttachments();
  
  // Council Chamber is now always available (server manages API keys)
  const [councilStatus, setCouncilStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');
  const [discussionMode, setDiscussionMode] = useState<'discussion' | 'collaborative'>('discussion');
  
  // Get current session data
  const currentSession = getCurrentSession();
  const messages = currentSession?.messages || [];

  // Create initial session if none exists
  useEffect(() => {
    if (sessionsLoaded && !currentSessionId) {
      createSession();
    }
  }, [sessionsLoaded, currentSessionId, createSession]);

  // Check Council Chamber availability on mount
  useEffect(() => {
    checkCouncilAvailability();
  }, []);

  const checkCouncilAvailability = async () => {
    try {
      const response = await fetch('/api/ai/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      
      if (response.status === 503) {
        const error = await response.json();
        setCouncilStatus('unavailable');
        console.log('Council Chamber unavailable:', error.details);
        toast({
          title: "Council Chamber Unavailable",
          description: `Missing API keys: ${Object.entries(error.details || {})
            .filter(([_, available]) => !available)
            .map(([service, _]) => service)
            .join(', ')}`,
          variant: "destructive"
        });
      } else if (response.ok || response.status === 400) {
        // 400 is expected for test message, but means service is available
        setCouncilStatus('available');
      } else {
        setCouncilStatus('unavailable');
      }
    } catch (error) {
      console.error('Failed to check Council availability:', error);
      setCouncilStatus('unavailable');
    }
  };

  // Add welcome message to session when it's created or when status changes
  useEffect(() => {
    if (currentSessionId && councilStatus !== 'unknown' && messages.length === 0) {
      const welcomeMessage: CouncilMessage = {
        role: 'assistant' as const,
        content: councilStatus === 'available'
          ? `🏛️ **Welcome to the Council Chamber** 🏛️

The Council Chamber is now in session. Here, the three great AI minds converge to deliberate on your queries:

• **Claude** - Strategic and analytical counsel
• **GPT-4** - Creative and comprehensive insights  
• **Gemini** - Multi-perspective reasoning

**Choose your mode:**
🔄 **Interactive Mode** - AIs respond sequentially, building on each other's ideas
📊 **Collaborative Mode** - All AIs respond in parallel with combined insights

*"In the multitude of counselors there is wisdom."* - What would you like the council to discuss?`
          : councilStatus === 'unavailable'
          ? `🏛️ **Council Chamber - Service Unavailable** 🏛️

The Council Chamber requires all three AI services to be configured on the server.

⚙️ **Server Configuration Required:** The administrator needs to set up API keys for:
• OpenAI (GPT-4)
• Claude (Anthropic)  
• Gemini (Google)

Please contact your system administrator to enable the Council Chamber.`
          : `🏛️ **Council Chamber - Checking Availability** 🏛️

⏳ Checking if the Council Chamber services are available...`,
        model: 'System'
      };

      addMessage(currentSessionId, welcomeMessage);
    }
  }, [currentSessionId, councilStatus, messages.length, addMessage]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || councilStatus !== 'available' || !currentSessionId) return;

    const currentInput = input.trim();
    const attachmentsContext = getAttachmentsContext();
    const fullInput = currentInput + attachmentsContext;

    // Add user message to session
    const userMessage: CouncilMessage = {
      role: 'user',
      content: currentInput,
      attachments: attachments.map(att => ({
        id: att.id,
        name: att.name,
        type: att.type,
        size: att.size,
        url: att.url
      }))
    };

    addMessage(currentSessionId, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.role === 'assistant' && msg.participants 
          ? msg.participants.map(p => `${p.participant}: ${p.content}`).join('\n\n')
          : msg.content
      }));

      const response = await fetch('/api/ai/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: discussionMode === 'discussion' 
                ? 'You are in a Council Chamber discussion where AI models will respond sequentially, building on each other\'s ideas.'
                : 'You are participating in a Council Chamber where multiple AI models collaborate to provide comprehensive insights.'
            },
            ...conversationHistory,
            {
              role: 'user',
              content: fullInput
            }
          ],
          temperature: 0.7,
          mode: discussionMode
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Unknown server error');
      }

      const data = await response.json();
      
      const assistantMessage: CouncilMessage = {
        role: 'assistant',
        content: data.content || '',
        model: data.model || 'Council',
        tokensUsed: data.tokensUsed || data.totalTokens,
        participants: data.participants,
        mode: data.mode
      };

      addMessage(currentSessionId, assistantMessage);
      clearAttachments(); // Clear attachments after successful send
      
    } catch (error) {
      const errorMessage: CouncilMessage = {
        role: 'assistant',
        content: `The Council Chamber encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact your administrator.`,
        model: 'Error'
      };
      
      addMessage(currentSessionId, errorMessage);
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
    if (currentSessionId) {
      clearSession(currentSessionId);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
  };

  const handleClearCurrentSession = () => {
    if (currentSessionId) {
      clearSession(currentSessionId);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4 -mt-6">
      {/* Sessions Sidebar */}
      {!sidebarCollapsed && <CouncilSessionsSidebar onSessionSelect={handleSessionSelect} />}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            <div>
              <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                Council Chamber
              </h1>
              {currentSession && (
                <p className="text-sm text-muted-foreground">
                  {currentSession.title}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {messages.length} messages
            </Badge>
          </div>
        </div>

        {/* Server Status Panel */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Council Chamber Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Server Status:</span>
              <Badge variant={councilStatus === 'available' ? 'default' : councilStatus === 'unavailable' ? 'destructive' : 'secondary'} className="ml-2">
                {councilStatus === 'available' ? '🟢 Active' : councilStatus === 'unavailable' ? '🔴 Unavailable' : '🟡 Checking...'}
              </Badge>
            </div>
          
            {councilStatus === 'available' && (
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Discussion Mode:</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Layers className="w-3 h-3" />
                    <span>Collaborative</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={discussionMode === 'discussion'}
                    onCheckedChange={(checked) => setDiscussionMode(checked ? 'discussion' : 'collaborative')}
                  />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>Interactive</span>
                    <Users className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          
            <div className="text-xs text-muted-foreground">
              {councilStatus === 'available' ? 
                discussionMode === 'discussion' 
                  ? 'AIs will respond sequentially, building on each other\'s ideas'
                  : 'All AI services configured - AIs respond in parallel' :
                councilStatus === 'unavailable' ?
                'Server-side AI services need configuration' :
                'Checking server configuration...'
              }
            </div>
          </CardContent>
        </Card>

        {councilStatus === 'unavailable' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The Council Chamber requires server-side configuration of API keys. Contact your administrator to set up OpenAI, Claude, and Gemini API access.
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
                {councilStatus === 'available' && (
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Multi-LLM Active
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {councilStatus === 'available'
                  ? 'Ask complex questions and get perspectives from multiple AI models'
                  : 'Waiting for server-side AI services to be configured'
                }
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCurrentSession}
                disabled={messages.length === 0}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportConversation}
                disabled={messages.length === 0}
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
                  {message.role === 'user' ? (
                    // User message
                    <div className="flex items-start gap-3 justify-end">
                      <div className="max-w-[85%] space-y-2 order-first">
                        <div className="p-4 rounded-lg bg-primary text-primary-foreground ml-auto">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                      <div className="bg-muted p-2 rounded-full">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  ) : message.participants && message.mode === 'discussion' ? (
                    // Discussion mode - show individual participants
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Crown className="w-4 h-4" />
                        <span>Council Discussion</span>
                        <Badge variant="outline" className="text-xs">
                          {message.participants.length} participants
                        </Badge>
                      </div>
                      {message.participants.map((participant, index) => (
                        <div key={`${message.id}-${participant.participant}`} className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-full border border-primary/20 flex-shrink-0">
                            {participant.participant === 'Claude' ? (
                              <Bot className="w-4 h-4 text-blue-600" />
                            ) : participant.participant === 'GPT-4' ? (
                              <Bot className="w-4 h-4 text-green-600" />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          
                          <div className="max-w-[85%] space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {participant.participant}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}
                              </Badge>
                            </div>
                            <div className="p-4 rounded-lg bg-muted">
                              <div className="whitespace-pre-wrap">{participant.content}</div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{participant.model}</span>
                              {participant.tokensUsed && (
                                <span>{participant.tokensUsed} tokens</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Collaborative mode - combined response
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                        {message.model?.includes('Multi-LLM') ? (
                          <Crown className="w-4 h-4 text-primary" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="max-w-[85%] space-y-2">
                        <div className="p-4 rounded-lg bg-muted">
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                        
                        {message.model && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{message.model}</span>
                            {message.tokensUsed && (
                              <span>{message.tokensUsed} tokens</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-2 text-xs text-muted-foreground ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}>
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2"
                      onClick={() => copyMessage(message.participants ? 
                        message.participants.map(p => `${p.participant}: ${p.content}`).join('\n\n') : 
                        message.content
                      )}
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
                      <span className="text-sm">
                        {discussionMode === 'discussion' 
                          ? 'The Council is in session... Claude speaks first, then GPT-4, then Gemini...'
                          : 'The Council is deliberating... Consulting Claude, GPT-4, and Gemini...'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Input */}
          <div className="p-4 space-y-4">
            {/* File Attachments */}
            <FileAttachments />
            
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={councilStatus === 'available'
                  ? "Ask the Council a complex question requiring multiple perspectives..." 
                  : "Waiting for server configuration..."
                }
                disabled={councilStatus !== 'available' || isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || councilStatus !== 'available' || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {councilStatus !== 'available' && (
              <div className="text-center text-sm text-muted-foreground">
                Council Chamber requires server-side configuration of OpenAI, Claude, and Gemini API keys
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
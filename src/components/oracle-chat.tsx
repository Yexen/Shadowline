'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  Send,
  Loader2,
  Settings,
  Terminal,
  FileText,
  Code,
  Zap,
  Brain
} from 'lucide-react';
import { useOracleStore, type OracleMessage } from '@/services/oracle-ai';
import { cn } from '@/lib/utils';

export function OracleChat() {
  const {
    isVisible,
    messages,
    isThinking,
    currentProvider,
    availableTools,
    toggleVisibility,
    sendMessage,
    setProvider,
    clearContext
  } = useOracleStore();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - 200,
          y: e.clientY - 20
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    await sendMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = async (action: string) => {
    const actions = {
      analyze: 'Analyze the current application state and suggest improvements',
      inspect: 'Show me the current file structure and recent changes',
      debug: 'Help me debug any current issues or errors',
      create: 'What can I create or add to improve the application?'
    };
    
    await sendMessage(actions[action as keyof typeof actions] || action);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded mt-2 mb-2 overflow-x-auto"><code>$1</code></pre>')
      .replace(/\n/g, '<br />');
  };

  if (!isVisible) {
    return (
      <Button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-50"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card 
      className={cn(
        "fixed z-50 shadow-2xl transition-all duration-300 border-primary/20",
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      )}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <CardHeader 
        ref={dragRef}
        className={cn(
          "pb-2 cursor-move select-none bg-gradient-to-r from-primary/10 to-primary/5",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onMouseDown={(e) => {
          setIsDragging(true);
          e.preventDefault();
        }}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary animate-pulse" />
Oracle AI
            <Badge variant="outline" className="text-xs">
              {currentProvider}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={toggleVisibility}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex items-center gap-1 mt-2">
            {availableTools.slice(0, 4).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool.replace('-', ' ')}
              </Badge>
            ))}
            <Badge variant="outline" className="text-xs">
              +{availableTools.length - 4}
            </Badge>
          </div>
        )}
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full p-0">
          {/* Quick Actions */}
          <div className="p-3 border-b bg-muted/30">
            <div className="flex gap-1 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickAction('analyze')}
              >
                <Brain className="w-3 h-3 mr-1" />
                Analyze
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickAction('inspect')}
              >
                <FileText className="w-3 h-3 mr-1" />
                Inspect
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickAction('debug')}
              >
                <Terminal className="w-3 h-3 mr-1" />
                Debug
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickAction('create')}
              >
                <Code className="w-3 h-3 mr-1" />
                Create
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bot className="w-4 h-4" />
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Oracle is thinking...
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Friday anything..."
                className="flex-1 text-sm"
                disabled={isThinking}
              />
              <Button 
                type="submit" 
                size="icon"
                className="w-8 h-8"
                disabled={isThinking || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>Type or use dev console: oracle.send("message")</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={clearContext}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function MessageBubble({ message }: { message: OracleMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={cn(
      "flex gap-2 max-w-full",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
        isUser ? "bg-primary" : isSystem ? "bg-muted" : "bg-primary/10"
      )}>
        {isUser ? (
          <User className="w-3 h-3 text-primary-foreground" />
        ) : isSystem ? (
          <Settings className="w-3 h-3" />
        ) : (
          <Bot className="w-3 h-3 text-primary" />
        )}
      </div>

      <div className={cn(
        "rounded-lg p-3 max-w-[85%] text-sm",
        isUser 
          ? "bg-primary text-primary-foreground ml-auto" 
          : isSystem
          ? "bg-muted text-muted-foreground"
          : "bg-muted"
      )}>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: formatMessage(message.content) 
          }}
        />
        
        {message.metadata && (
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="flex flex-wrap gap-1">
              {message.metadata.toolsUsed?.map((tool) => (
                <Badge key={tool} variant="outline" className="text-xs">
                  <Zap className="w-2 h-2 mr-1" />
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatMessage(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-background/50 px-1 rounded text-xs">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-background/50 p-2 rounded mt-2 mb-2 overflow-x-auto text-xs"><code>$1</code></pre>')
    .replace(/\n/g, '<br />');
}
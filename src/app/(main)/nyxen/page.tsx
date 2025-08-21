
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBible } from '@/hooks/use-bible';
import { useWriters } from '@/hooks/use-writers';
import { continueConversation, NyxenMessage } from '@/ai/flows/nyxen-chat';

export default function NyxenChatPage() {
  const [messages, setMessages] = useState<NyxenMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { bibleData } = useBible();
  const { activeWriter } = useWriters();
  
  useEffect(() => {
      if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTo({
              top: scrollAreaRef.current.scrollHeight,
              behavior: 'smooth'
          });
      }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: NyxenMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await continueConversation({
          history: [...messages, userMessage],
          bibleData: JSON.stringify(bibleData)
      });
      
      const nyxenMessage: NyxenMessage = { role: 'model', content: response.reply };
      setMessages(prev => [...prev, nyxenMessage]);
    } catch (error) {
      console.error('Nyxen chat error:', error);
      const errorMessage: NyxenMessage = { 
        role: 'model', 
        content: "I seem to be having trouble connecting to my core processors. Please try again later." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-card rounded-lg border">
      <div className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <Bot className="mx-auto h-12 w-12"/>
                    <h2 className="text-xl font-headline mt-4">Nyxen Is Online</h2>
                    <p>You can ask me anything about your project or for creative ideas.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-lg p-3 text-sm',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activeWriter?.avatarUrl} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-md rounded-lg p-3 text-sm bg-accent">
                        <div className="flex items-center gap-2">
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0ms'}}/>
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '200ms'}}/>
                           <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '400ms'}}/>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Nyxen..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || input.trim() === ''}>
            <Send />
          </Button>
        </div>
      </div>
    </div>
  );
}

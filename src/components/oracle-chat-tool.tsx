
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Save, Trash2, Sparkles, X } from 'lucide-react';
import { ChatMessage } from '@/components/chat-message';
import { runOracleChat } from '@/ai/flows/oracle-chat-flow';
import { useOracleChat, OracleChatSession } from '@/hooks/use-oracle-chat';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import type { ChatMessage as OracleChatMessage } from '@/ai/types';

export function OracleChatTool() {
  const [messages, setMessages] = useState<OracleChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { savedSessions, saveSession, deleteSession } = useOracleChat();
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: OracleChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await runOracleChat([...messages, userMessage]);
      const modelMessage: OracleChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: OracleChatMessage = { role: 'model', content: 'Sorry, the Oracle is not responding. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSession = () => {
    if (messages.length < 2) return;
    const sessionName = messages[0].content.substring(0, 40) + '...';
    saveSession({
        id: `session-${Date.now()}`,
        name: sessionName,
        messages: messages,
        timestamp: new Date()
    });
    setMessages([]);
    toast({ title: "Conversation Saved" });
  };
  
  const handleDismiss = () => {
    setMessages([]);
  };

  const handleLoadSession = (session: OracleChatSession) => {
    setMessages(session.messages);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    toast({ title: "Conversation Deleted", variant: "destructive" });
  }

  return (
    <Card className="bg-card">
        <CardHeader>
            <div className="flex items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-headline text-xl">Chat with the Oracle</CardTitle>
                <CardDescription className="mt-1">Ask questions about your world bible. The Oracle's knowledge is limited to what's in the bible.</CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent>
             <div className="flex flex-col h-[60vh] bg-background/50 rounded-lg border">
                <div className="flex-grow p-4 overflow-y-hidden">
                    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <ChatMessage key={index} message={msg} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-8">
                                <p>Ask a question about your project. For example: "What is the Joker's biography?"</p>
                            </div>
                        )}
                        {isLoading && (
                            <div className="flex items-center gap-3">
                                <div className="bg-muted p-3 rounded-lg">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                    </ScrollArea>
                </div>
                <div className="p-4 border-t">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask the Oracle..."
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="mr-2" />
                        Send
                    </Button>
                    </form>
                    {messages.length > 1 && (
                        <div className="flex gap-2 mt-2 justify-end">
                            <Button variant="outline" size="sm" onClick={handleSaveSession}><Save className="mr-2"/> Save</Button>
                            <Button variant="destructive" size="sm" onClick={handleDismiss}><X className="mr-2"/> Dismiss</Button>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
        {savedSessions.length > 0 && (
             <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="history">
                        <AccordionTrigger className="font-headline">Conversation History</AccordionTrigger>
                        <AccordionContent>
                           <ScrollArea className="h-48">
                            <div className="space-y-2 pr-4">
                                {savedSessions.map(session => (
                                    <div key={session.id} className="flex justify-between items-center p-2 rounded-md hover:bg-accent group">
                                        <button className="text-left flex-grow" onClick={() => handleLoadSession(session)}>
                                            <p className="font-semibold truncate">{session.name}</p>
                                            <p className="text-xs text-muted-foreground">{session.timestamp.toLocaleString()}</p>
                                        </button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSession(session.id)}>
                                            <Trash2 className="text-destructive h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                           </ScrollArea>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        )}
    </Card>
  );
}

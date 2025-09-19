
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Save, Trash2, Sparkles, X, FileText, GitCommit, Upload, Play, BookOpen, Zap, Layers, Search, XCircle } from 'lucide-react';
import { ChatMessage } from '@/components/chat-message';
import { runOracleChat, OracleMode } from '@/ai/flows/oracle-chat-flow';
import { useOracleChat, OracleChatSession } from '@/hooks/use-oracle-chat';
import { useBible } from '@/hooks/use-bible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import type { ChatMessage as OracleChatMessage } from '@/ai/types';

interface SuggestedAction {
  type: 'file' | 'command' | 'code';
  label: string;
  path?: string;
  content?: string;
  description?: string;
}

export function OracleChatTool() {
  const [messages, setMessages] = useState<OracleChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [contextMemory, setContextMemory] = useState<string[]>([]);
  const [currentMode, setCurrentMode] = useState<OracleMode>('shadows');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { savedSessions, filteredSessions, searchQuery, saveSession, deleteSession, searchSessions, clearSearch } = useOracleChat();
  const { bibleData, isLoaded } = useBible();
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractSuggestedActions = (response: string): SuggestedAction[] => {
    const actions: SuggestedAction[] = [];
    
    // Extract file paths
    const fileMatches = response.match(/`([^`]+\.(ts|tsx|js|jsx|css|json|md))`/g);
    if (fileMatches) {
      fileMatches.forEach(match => {
        const path = match.replace(/`/g, '');
        actions.push({
          type: 'file',
          label: `Open ${path}`,
          path: path,
          description: `Open file ${path}`
        });
      });
    }
    
    // Extract code blocks
    const codeMatches = response.match(/```[\s\S]*?```/g);
    if (codeMatches) {
      codeMatches.forEach((match, index) => {
        actions.push({
          type: 'code',
          label: `Apply Code Block ${index + 1}`,
          content: match.replace(/```[^\n]*\n?|```/g, ''),
          description: `Apply suggested code changes`
        });
      });
    }
    
    return actions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: OracleChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Add to context memory
    setContextMemory(prev => [...prev, input].slice(-10)); // Keep last 10 inputs for memory
    
    setInput('');
    setIsLoading(true);

    try {
      const response = await runOracleChat(updatedMessages, currentMode, currentMode !== 'canon' ? bibleData : undefined);
      const modelMessage: OracleChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
      
      // Extract suggested actions from response
      const actions = extractSuggestedActions(response);
      setSuggestedActions(actions);
      
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
    // Rebuild context memory from session
    const userMessages = session.messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .slice(-10);
    setContextMemory(userMessages);
  };
  
  const handleApplyAction = async (action: SuggestedAction) => {
    try {
      if (action.type === 'file' && action.path) {
        // For now, just show a toast. In a real app, you'd open the file in an editor
        toast({ title: "File Action", description: `Would open ${action.path}` });
      } else if (action.type === 'code' && action.content) {
        // Copy code to clipboard for now
        await navigator.clipboard.writeText(action.content);
        toast({ title: "Code Applied", description: "Code copied to clipboard" });
      }
    } catch (error) {
      toast({ title: "Action Failed", description: "Could not apply action", variant: "destructive" });
    }
  };
  
  const handleCommit = () => {
    toast({ title: "Commit", description: "Commit functionality to be implemented" });
  };
  
  const handleDeploy = () => {
    toast({ title: "Deploy", description: "Deploy functionality to be implemented" });
  };
  
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    toast({ title: "Conversation Deleted", variant: "destructive" });
  }

  const handleModeChange = (newMode: OracleMode) => {
    if (newMode !== currentMode) {
      setMessages([]);
      setSuggestedActions([]);
      setContextMemory([]);
      setCurrentMode(newMode);
    }
  };

  const getModeDescription = () => {
    switch (currentMode) {
      case 'shadows':
        return 'Ask questions about your Shadows of Gotham world bible. Connected to your characters, locations, and lore.';
      case 'canon':
        return 'Ask questions about canonical DC Universe and Batman lore from comics, movies, and official sources.';
      case 'all':
        return 'Ask questions combining both your world bible and canonical DC knowledge. Compare and discover connections.';
      default:
        return 'Ask questions about your world bible.';
    }
  };

  const getModeIcon = () => {
    switch (currentMode) {
      case 'shadows':
        return <BookOpen className="w-6 h-6 text-primary" />;
      case 'canon':
        return <Zap className="w-6 h-6 text-primary" />;
      case 'all':
        return <Layers className="w-6 h-6 text-primary" />;
      default:
        return <Sparkles className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <Card className="bg-card">
        <CardHeader>
            <div className="flex items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full border border-primary/20">
                 {getModeIcon()}
              </div>
              <div>
                <CardTitle className="font-headline text-xl">Chat with the Oracle</CardTitle>
                <CardDescription className="mt-1">
                  {getModeDescription()}
                  {contextMemory.length > 0 && (
                    <span className="block text-xs mt-1 text-muted-foreground">
                      Context: {contextMemory.length} recent topics remembered
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent>
          <Tabs value={currentMode} onValueChange={(value) => handleModeChange(value as OracleMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="shadows" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Shadows of Gotham
              </TabsTrigger>
              <TabsTrigger value="canon" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Canon
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                All
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shadows" className="mt-4">
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
                          <p>Ask questions about your Shadows of Gotham world bible.</p>
                          <p className="text-sm mt-2">Try: "Tell me about the Joker" or "What locations are in Gotham?"</p>
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
                      placeholder="Ask about your world bible..."
                      disabled={isLoading || !isLoaded}
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim() || !isLoaded}>
                      <Send className="mr-2" />
                      Send
                    </Button>
                  </form>
                  {!isLoaded && (
                    <p className="text-xs text-muted-foreground mt-2">Loading world bible data...</p>
                  )}
                  {messages.length > 1 && (
                    <div className="flex gap-2 mt-2 justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveSession}><Save className="mr-2"/> Save</Button>
                        <Button variant="destructive" size="sm" onClick={handleDismiss}><X className="mr-2"/> Dismiss</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleCommit}><GitCommit className="mr-2"/> Commit</Button>
                        <Button variant="default" size="sm" onClick={handleDeploy}><Upload className="mr-2"/> Deploy</Button>
                      </div>
                    </div>
                  )}
                  {suggestedActions.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyAction(action)}
                            className="text-xs"
                          >
                            {action.type === 'file' && <FileText className="mr-1 h-3 w-3" />}
                            {action.type === 'code' && <Play className="mr-1 h-3 w-3" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="canon" className="mt-4">
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
                          <p>Ask questions about canonical DC Universe and Batman lore.</p>
                          <p className="text-sm mt-2">Try: "What are Batman's main storylines?" or "Tell me about Arkham Asylum in DC Comics"</p>
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
                      placeholder="Ask about DC Canon..."
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      <Send className="mr-2" />
                      Send
                    </Button>
                  </form>
                  {messages.length > 1 && (
                    <div className="flex gap-2 mt-2 justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveSession}><Save className="mr-2"/> Save</Button>
                        <Button variant="destructive" size="sm" onClick={handleDismiss}><X className="mr-2"/> Dismiss</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleCommit}><GitCommit className="mr-2"/> Commit</Button>
                        <Button variant="default" size="sm" onClick={handleDeploy}><Upload className="mr-2"/> Deploy</Button>
                      </div>
                    </div>
                  )}
                  {suggestedActions.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyAction(action)}
                            className="text-xs"
                          >
                            {action.type === 'file' && <FileText className="mr-1 h-3 w-3" />}
                            {action.type === 'code' && <Play className="mr-1 h-3 w-3" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
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
                          <p>Ask questions combining your world bible and canonical DC knowledge.</p>
                          <p className="text-sm mt-2">Try: "Compare my Joker to DC's Joker" or "How does my Arkham differ from canon?"</p>
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
                      placeholder="Ask to compare both sources..."
                      disabled={isLoading || !isLoaded}
                      autoComplete="off"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim() || !isLoaded}>
                      <Send className="mr-2" />
                      Send
                    </Button>
                  </form>
                  {!isLoaded && (
                    <p className="text-xs text-muted-foreground mt-2">Loading world bible data...</p>
                  )}
                  {messages.length > 1 && (
                    <div className="flex gap-2 mt-2 justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSaveSession}><Save className="mr-2"/> Save</Button>
                        <Button variant="destructive" size="sm" onClick={handleDismiss}><X className="mr-2"/> Dismiss</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={handleCommit}><GitCommit className="mr-2"/> Commit</Button>
                        <Button variant="default" size="sm" onClick={handleDeploy}><Upload className="mr-2"/> Deploy</Button>
                      </div>
                    </div>
                  )}
                  {suggestedActions.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Suggested Actions:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedActions.map((action, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleApplyAction(action)}
                            className="text-xs"
                          >
                            {action.type === 'file' && <FileText className="mr-1 h-3 w-3" />}
                            {action.type === 'code' && <Play className="mr-1 h-3 w-3" />}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        {savedSessions.length > 0 && (
             <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="history">
                        <AccordionTrigger className="font-headline">
                          Conversation History
                          {searchQuery && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({filteredSessions.length} of {savedSessions.length} shown)
                            </span>
                          )}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => searchSessions(e.target.value)}
                                className="pl-8 pr-8"
                              />
                              {searchQuery && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-6 w-6"
                                  onClick={clearSearch}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <ScrollArea className="h-48">
                              <div className="space-y-2 pr-4">
                                  {filteredSessions.length > 0 ? (
                                    filteredSessions.map(session => (
                                      <div key={session.id} className="flex justify-between items-center p-2 rounded-md hover:bg-accent group">
                                          <button className="text-left flex-grow" onClick={() => handleLoadSession(session)}>
                                              <p className="font-semibold truncate">{session.name}</p>
                                              <p className="text-xs text-muted-foreground">{session.timestamp.toLocaleString()}</p>
                                          </button>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteSession(session.id)}>
                                              <Trash2 className="text-destructive h-4 w-4"/>
                                          </Button>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center text-muted-foreground py-4">
                                      <p className="text-sm">No conversations found matching "{searchQuery}"</p>
                                    </div>
                                  )}
                              </div>
                           </ScrollArea>
                          </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        )}
    </Card>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Quote,
  Loader2,
  RefreshCw,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  chunks: number;
  content?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  documentId: string;
  documentName: string;
  pageNumber?: number;
  chunkId: string;
  relevanceScore: number;
  excerpt: string;
}

interface ChatInterfaceProps {
  documents: Document[];
}

export function ChatInterface({ documents }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Sample conversation starter
  useEffect(() => {
    if (messages.length === 0 && documents.length > 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `Hello! I'm ready to help you explore and analyze your documents. I have access to ${documents.length} processed documents including character profiles, location guides, and story timelines.\n\nYou can ask me questions like:\n• "What are the key relationships between characters?"\n• "Describe the Joker's psychological profile"\n• "What locations are most important to the story?"\n• "How do themes of chaos and order play out?"`,
          timestamp: new Date()
        }
      ]);
    }
  }, [documents, messages.length]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      // Simulate API call to process question with RAG
      const response = await processQuestionWithRAG(input.trim(), selectedDocuments.length > 0 ? selectedDocuments : documents.map(d => d.id));
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: "Failed to process your question",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processQuestionWithRAG = async (question: string, documentIds: string[]) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response with sources - in real implementation this would:
    // 1. Generate embeddings for the question
    // 2. Search vector database for relevant chunks
    // 3. Rank results by relevance
    // 4. Generate response using LLM with retrieved context
    // 5. Return response with source citations
    
    const mockSources: Source[] = [
      {
        documentId: '1',
        documentName: 'Joker Character Bible.pdf',
        pageNumber: 12,
        chunkId: 'chunk_123',
        relevanceScore: 0.92,
        excerpt: 'The Joker represents pure chaos, a force of nature that exists to challenge Batman\'s sense of order and justice. His psychological profile reveals a complex individual driven by...'
      },
      {
        documentId: '2',
        documentName: 'Gotham City Locations.docx',
        pageNumber: 5,
        chunkId: 'chunk_456',
        relevanceScore: 0.85,
        excerpt: 'Arkham Asylum serves as more than just a prison; it\'s a symbol of Gotham\'s fractured psyche, housing not just criminals but the city\'s deepest fears and darkest secrets...'
      }
    ];

    // Generate contextual response based on question
    let response = '';
    
    if (question.toLowerCase().includes('joker')) {
      response = `The Joker is one of Batman's most complex and dangerous adversaries. Based on the character analysis in your documents, several key aspects define him:

**Psychological Profile:**
The Joker represents pure chaos and unpredictability. Unlike other villains with clear motives, his primary drive is to prove that anyone can be driven to madness under the right circumstances. He sees himself as Batman's philosophical opposite - where Batman represents order and justice, the Joker embodies chaos and anarchy.

**Relationship with Batman:**
The Joker views his relationship with Batman as symbiotic. He believes that without Batman, he would have no purpose, and vice versa. This creates a twisted dependency where the Joker needs Batman to validate his existence as an agent of chaos.

**Methods and Motivation:**
His crimes often involve elaborate schemes designed not just to cause mayhem, but to challenge Batman's moral code. He frequently targets innocent civilians to force Batman into impossible moral choices, attempting to prove that everyone is "one bad day" away from becoming like him.`;
    } else if (question.toLowerCase().includes('character') || question.toLowerCase().includes('relationship')) {
      response = `Based on analysis of your story documents, here are the key character relationships:

**Batman & Joker:**
The central antagonistic relationship - a psychological chess match between order and chaos. Their dynamic drives much of Gotham's conflict.

**Batman & Commissioner Gordon:**
A partnership built on mutual respect and shared dedication to justice. Gordon represents the institutional law that Batman operates alongside.

**Batman & Alfred:**
The paternal relationship that grounds Batman's humanity. Alfred serves as moral compass and emotional anchor.

**Joker & Harley Quinn:**
A toxic relationship where Harley's devotion is exploited by the Joker's manipulative nature, representing corrupted love.

**Character Networks:**
- The Bat-family forms Batman's support network
- Gotham's rogues gallery creates interlocking criminal relationships
- Civilian characters provide stakes and humanity to the conflicts`;
    } else {
      response = `I've analyzed your question against the available documents and found relevant information. The content suggests themes of duality, justice vs. chaos, and the psychological complexity of heroism and villainy.

Your story documents contain rich character development and world-building that explores deep philosophical questions about morality, justice, and human nature. The relationships between characters create a complex web of motivations and conflicts that drive compelling narratives.

Would you like me to dive deeper into any specific aspect of your story universe?`;
    }

    return {
      answer: response,
      sources: mockSources
    };
  };

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
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
    a.download = `batcave-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Document Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Document Scope</CardTitle>
          <CardDescription>
            Select specific documents to focus your queries, or leave all selected for comprehensive analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <Button
                key={doc.id}
                variant={selectedDocuments.includes(doc.id) || selectedDocuments.length === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => toggleDocumentSelection(doc.id)}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                {doc.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {doc.chunks}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Q&A Chat
              </CardTitle>
              <CardDescription>
                Ask questions about your documents and get AI-powered insights with source citations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMessages([])}
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
                  <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[70%] space-y-2 ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`p-4 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            Sources:
                          </div>
                          {message.sources.map((source, index) => (
                            <div key={index} className="text-xs bg-background border rounded p-3 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{source.documentName}</div>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(source.relevanceScore * 100)}% match
                                </Badge>
                              </div>
                              {source.pageNumber && (
                                <div className="text-muted-foreground">Page {source.pageNumber}</div>
                              )}
                              <div className="text-muted-foreground italic">"{source.excerpt}"</div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-xs"
                                onClick={() => {/* Open document to specific chunk */}}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View in context
                              </Button>
                            </div>
                          ))}
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
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing documents and generating response...</span>
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
                placeholder="Ask about character relationships, themes, plot points, or any aspect of your story..."
                disabled={isLoading || documents.length === 0}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading || documents.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {documents.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                Upload and process documents to start asking questions
              </div>
            )}
            
            {selectedDocuments.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                Searching in {selectedDocuments.length} selected document{selectedDocuments.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile } from 'lucide-react';
import { Thread } from '@/hooks/use-messages';
import { Writer } from '@/hooks/use-writers';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface MessageThreadProps {
  threadId: string | null;
  threads: Thread[];
  writers: Writer[];
  activeWriter: Writer;
  onSendMessage: (threadId: string, content: string, recipientIds: string[]) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function MessageThread({ threadId, threads, writers, activeWriter, onSendMessage }: MessageThreadProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const selectedThread = threads.find(t => t.id === threadId);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [selectedThread]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !threadId) return;

    let recipientIds: string[] = [];
    if (threadId.startsWith('new-')) {
        recipientIds = [threadId.replace('new-', '')];
    } else if (selectedThread) {
        recipientIds = selectedThread.participants.filter(pId => pId !== activeWriter.id);
    }
    
    onSendMessage(threadId, input, recipientIds);
    setInput('');
  };

  const getParticipantInfo = (participantId: string) => {
    return writers.find(w => w.id === participantId);
  };
  
  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  if (!threadId) {
    return <div className="flex-grow flex items-center justify-center text-muted-foreground"><p>Select a conversation to begin.</p></div>;
  }
  
  const otherParticipants = selectedThread?.participants.filter(pId => pId !== activeWriter.id) || [];
  const headerName = otherParticipants.length > 0
    ? getParticipantInfo(otherParticipants[0])?.name || 'Unknown'
    : 'Notes to Self';

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-3">
         <Avatar className="h-9 w-9">
            <AvatarImage src={getParticipantInfo(otherParticipants[0])?.avatarUrl} />
            <AvatarFallback>{headerName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold">{headerName}</h3>
      </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {selectedThread?.messages.map(message => {
            const sender = getParticipantInfo(message.senderId);
            const isMe = message.senderId === activeWriter.id;
            return (
              <div key={message.id} className={cn("flex items-end gap-2", isMe && "justify-end")}>
                 {!isMe && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={sender?.avatarUrl} />
                        <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                 )}
                <div className={cn(
                    "p-3 rounded-lg max-w-xs md:max-w-md",
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                 {isMe && (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={activeWriter.avatarUrl} />
                        <AvatarFallback>{activeWriter.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                 )}
              </div>
            );
          })}
           {!selectedThread && (
            <div className="text-center text-muted-foreground pt-8">
                <p>Start a new conversation with {getParticipantInfo(threadId.replace('new-', ''))?.name}.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon"><Smile/></Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="grid grid-cols-6 gap-1">
                        {EMOJIS.map(emoji => (
                            <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="p-2 text-xl rounded-md hover:bg-accent">{emoji}</button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            autoComplete="off"
          />
          <Button type="submit">
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

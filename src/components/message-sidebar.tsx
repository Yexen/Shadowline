
'use client';

import { useMemo, useState, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Thread } from '@/hooks/use-messages';
import { Writer } from '@/hooks/use-writers';
import { PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface MessageSidebarProps {
  threads: Thread[];
  writers: Writer[];
  activeWriterId: string;
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  otherWriters: Writer[];
}

const translations = {
  en: {
    conversations: 'Conversations',
    newMessage: 'New Message',
    notesToSelf: 'Notes to Self',
    unknownUser: 'Unknown User',
    andMore: 'more',
    noMessages: 'No messages yet'
  },
  fa: {
    conversations: 'گفتگوها',
    newMessage: 'پیام جدید',
    notesToSelf: 'یادداشت برای خود',
    unknownUser: 'کاربر ناشناس',
    andMore: 'بیشتر',
    noMessages: 'هنوز پیامی وجود ندارد'
  }
};

export function MessageSidebar({
  threads,
  writers,
  activeWriterId,
  selectedThreadId,
  onSelectThread,
  otherWriters,
}: MessageSidebarProps) {
  const [lang, setLang] = useState<'en' | 'fa'>('en');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  const t = translations[lang];

  const getThreadDisplayInfo = (thread: Thread) => {
    const otherParticipants = thread.participants.filter(pId => pId !== activeWriterId);
    if (otherParticipants.length === 0) {
      return { name: t.notesToSelf, avatarUrl: '' };
    }
    const otherWriter = writers.find(w => w.id === otherParticipants[0]);
    const name = otherParticipants.length > 1 
      ? `${otherWriter?.name} & ${otherParticipants.length - 1} ${t.andMore}`
      : otherWriter?.name || t.unknownUser;
    
    return { name, avatarUrl: otherWriter?.avatarUrl || '' };
  };

  return (
    <div className="w-1/3 border-r h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-headline text-xl">{t.conversations}</h2>
        <Popover>
            <PopoverTrigger asChild>
                <button className="text-muted-foreground hover:text-primary"><PlusCircle/></button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
                <p className="p-2 text-sm font-semibold">{t.newMessage}</p>
                <ScrollArea className="h-[200px]">
                   {otherWriters.map(writer => (
                     <button key={writer.id} className="w-full text-left p-2 rounded-md hover:bg-accent flex items-center gap-2" onClick={() => onSelectThread(`new-${writer.id}`)}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={writer.avatarUrl} />
                            <AvatarFallback>{writer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{writer.name}</span>
                     </button>
                   ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
      </div>
      <ScrollArea className="flex-grow">
        {threads.map(thread => {
          const { name, avatarUrl } = getThreadDisplayInfo(thread);
          const lastMessage = thread.messages[thread.messages.length - 1];
          return (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                'w-full text-left p-3 flex items-start gap-3 transition-colors',
                selectedThreadId === thread.id ? 'bg-accent' : 'hover:bg-accent/50'
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">{name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {lastMessage?.content || t.noMessages}
                </p>
              </div>
            </button>
          );
        })}
      </ScrollArea>
    </div>
  );
}

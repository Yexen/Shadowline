'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/ai/types';
import { BatLogo } from './bat-logo';
import { User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex items-start gap-3", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
            <BatLogo className="w-5 h-5" />
            <AvatarFallback>N</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "p-3 rounded-lg max-w-sm",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-muted text-muted-foreground flex items-center justify-center">
            <User className="w-5 h-5" />
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

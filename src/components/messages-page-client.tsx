
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWriters } from '@/hooks/use-writers';
import { useMessages } from '@/hooks/use-messages';
import { MessageSidebar } from '@/components/message-sidebar';
import { MessageThread } from '@/components/message-thread';
import { Writer } from '@/hooks/use-writers';
import { BatLogo } from './bat-logo';

export function MessagesPageClient() {
  const { writers, activeWriter, isLoaded: writersLoaded } = useWriters();
  const { threads, sendMessage } = useMessages();
  const searchParams = useSearchParams();
  
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (writersLoaded && activeWriter) {
      const newChatTargetId = searchParams.get('new');
      if (newChatTargetId) {
        // Find if a thread already exists with this user
        const existingThread = threads.find(t => 
            t.participants.length === 2 && 
            t.participants.includes(activeWriter.id) &&
            t.participants.includes(newChatTargetId)
        );
        if (existingThread) {
            setSelectedThreadId(existingThread.id);
        } else {
            // Create a temporary new thread ID. The hook will create a real one on first message.
            setSelectedThreadId(`new-${newChatTargetId}`);
        }
      } else if (threads.length > 0) {
        setSelectedThreadId(threads[0].id);
      }
    }
  }, [searchParams, threads, activeWriter, writersLoaded]);

  if (!writersLoaded || !activeWriter) {
    return (
        <div className="flex h-[calc(100vh-14rem)] items-center justify-center">
            <BatLogo className="w-16 h-8 animate-pulse" />
        </div>
    );
  }

  const otherWriters = writers.filter(w => w.id !== activeWriter.id);

  const handleSendMessage = (threadId: string, content: string, recipientIds: string[]) => {
    sendMessage(content, recipientIds);
    // If it was a new thread, the ID will now be updated in the store.
    // We need to find the new real thread ID to keep it selected.
    if (threadId.startsWith('new-')) {
        const newThread = threads.find(t => 
            t.participants.length === 2 &&
            t.participants.includes(recipientIds[0]) &&
            t.participants.includes(activeWriter.id)
        );
        if (newThread) {
            setSelectedThreadId(newThread.id);
        }
    }
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] border rounded-lg bg-card">
      <MessageSidebar
        threads={threads}
        writers={writers}
        activeWriterId={activeWriter.id}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
        otherWriters={otherWriters}
      />
      <MessageThread
        threadId={selectedThreadId}
        threads={threads}
        writers={writers}
        activeWriter={activeWriter}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

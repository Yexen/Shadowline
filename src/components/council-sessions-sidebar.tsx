'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  Calendar,
  Crown
} from 'lucide-react';
import { useCouncilSessions, type CouncilSession } from '@/hooks/use-council-sessions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface CouncilSessionsSidebarProps {
  onSessionSelect: (sessionId: string) => void;
}

export function CouncilSessionsSidebar({ onSessionSelect }: CouncilSessionsSidebarProps) {
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    deleteSession, 
    updateSessionTitle 
  } = useCouncilSessions();
  
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreateSession = () => {
    const sessionId = createSession();
    onSessionSelect(sessionId);
  };

  const handleEditSession = (session: CouncilSession) => {
    setEditingSession(session.id);
    setEditTitle(session.title);
  };

  const handleSaveEdit = () => {
    if (editingSession && editTitle.trim()) {
      updateSessionTitle(editingSession, editTitle.trim());
    }
    setEditingSession(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditTitle('');
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    if (currentSessionId === sessionId) {
      // Select another session or create a new one
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      if (remainingSessions.length > 0) {
        onSessionSelect(remainingSessions[0].id);
      } else {
        handleCreateSession();
      }
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 border-r bg-muted/20 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Council Sessions</h2>
          </div>
          <Button size="sm" onClick={handleCreateSession}>
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage your Council Chamber conversation history
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg border cursor-pointer transition-colors ${
                currentSessionId === session.id
                  ? 'bg-primary/10 border-primary/20'
                  : 'hover:bg-muted/50 border-transparent'
              }`}
              onClick={() => onSessionSelect(session.id)}
            >
              {editingSession === session.id ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="text-sm"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" />
                        <span>{session.messages.length} messages</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(session.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Session</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{session.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSession(session.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  
                  {session.messages.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {session.discussionMode === 'discussion' ? 'Interactive' : 'Collaborative'}
                      </Badge>
                    </div>
                  )}
                  
                  {session.messages.length > 0 && session.messages[session.messages.length - 1] && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {session.messages[session.messages.length - 1].content.substring(0, 100)}...
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Crown className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No sessions yet</p>
              <p className="text-xs">Create your first Council Chamber session</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/alert-dialog';

function extractTextFromHtml(html: string): string {
    if (typeof window === 'undefined') {
        // Fallback for SSR
        return html.replace(/<[^>]*>?/gm, '');
    }
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

export default function DraftsPage() {
  const router = useRouter();
  const { drafts, deleteDraft, isLoaded } = useDrafts();

  const handleNewDraft = () => {
    router.push('/editor/new');
  };

  if (!isLoaded) {
    return (
      <div className="space-y-8">
        <div>
          
          <p className="mt-2 text-muted-foreground">Loading your drafts from the Batcomputer...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        
        <p className="mt-2 text-muted-foreground">
          Manage your story drafts. Start a new one or continue a work in progress.
        </p>
      </div>

      <Button onClick={handleNewDraft}>
        <FilePlus className="mr-2" />
        Create New Draft
      </Button>

      {drafts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => {
            const snippet = extractTextFromHtml(draft.content).substring(0, 100) + '...';
            return (
                <Card key={draft.id} className="flex flex-col bg-card hover:border-primary/50 transition-colors">
                <CardHeader className="cursor-pointer flex-grow" onClick={() => router.push(`/editor/${draft.id}`)}>
                    <CardTitle className="font-headline">{draft.title || 'Untitled Draft'}</CardTitle>
                    <CardDescription>
                    Last modified: {new Date(draft.lastModified).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className="cursor-pointer flex-grow" onClick={() => router.push(`/editor/${draft.id}`)}>
                    <p className="text-muted-foreground line-clamp-3">
                    {snippet || 'No content yet...'}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                        <Trash2 />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the draft titled "{draft.title || 'Untitled Draft'}".
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteDraft(draft.id)}>Delete Draft</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
                </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-headline">No Drafts Found</h3>
          <p className="text-muted-foreground">Click "Create New Draft" to start your first story.</p>
        </div>
      )}
    </div>
  );
}

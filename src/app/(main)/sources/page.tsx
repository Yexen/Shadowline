
'use client';

import { useState } from 'react';
import { useSources, type Source } from '@/hooks/use-sources';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function SourcesPage() {
  const { sources, addSource, updateSource, deleteSource, isLoaded } = useSources();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleOpenDialog = (source: Source | null = null) => {
    setEditingSource(source);
    setTitle(source ? source.title : '');
    setUrl(source ? source.url : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSource(null);
    setTitle('');
    setUrl('');
  };

  const handleSave = () => {
    if (!title.trim() || !url.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide both a title and a URL.',
      });
      return;
    }

    if (editingSource) {
      updateSource(editingSource.id, { title, url });
      toast({ title: 'Source Updated' });
    } else {
      addSource(title, url);
      toast({ title: 'Source Added' });
    }

    handleCloseDialog();
  };

  return (
    <div className="space-y-8">
      <div>
        
        <p className="mt-2 text-muted-foreground">
          Manage your external links, research, and references.
        </p>
      </div>

      <Button onClick={() => handleOpenDialog()}>
        <PlusCircle className="mr-2" />
        Add Source
      </Button>

      {!isLoaded ? (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
      ) : sources.length > 0 ? (
        <div className="space-y-4">
          {sources.map(source => (
            <Card key={source.id} className="bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group flex-1 min-w-0"
                >
                  <LinkIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-semibold group-hover:text-primary transition-colors truncate">{source.title}</span>
                </a>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(source)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the source: "{source.title}". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSource(source.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-headline">No Sources Found</h3>
          <p className="text-muted-foreground">Click "Add Source" to save your first link.</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">{editingSource ? 'Edit Source' : 'Add New Source'}</DialogTitle>
            <DialogDescription>
              Enter a title and the external URL for your source.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-title">Title</Label>
              <Input
                id="source-title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Gotham City History Archive"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">URL</Label>
              <Input
                id="source-url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/gotham-history"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave}>Save Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Book, Link as LinkIcon, PlusCircle, Trash2 } from 'lucide-react';
import { useSources } from '@/hooks/use-sources';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function SourcesPage() {
  const router = useRouter();
  const { sources, addSource, deleteSource, isLoaded } = useSources();
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddSource = () => {
    if (newTitle.trim() && newUrl.trim()) {
      addSource(newTitle, newUrl);
      setNewTitle('');
      setNewUrl('');
      setDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mt-2 text-muted-foreground">
          Your central repository for research, inspiration, and canonical sources.
        </p>
      </div>

      <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => router.push('/sources/comics')}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-3"><Book /> Batman Comics Database</CardTitle>
          <CardDescription>
            Browse, search, and track your reading of essential Batman comics. An interactive library of canon.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button>Explore Database</Button>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline text-2xl font-bold">External Links & Resources</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><PlusCircle className="mr-2"/> Add New Link</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Resource</DialogTitle>
                        <DialogDescription>Save a new link for your research.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-title">Title</Label>
                            <Input id="link-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g., Gotham City History Wiki" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <Input id="link-url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSource}>Save Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {isLoaded && sources.length > 0 ? (
            <div className="space-y-3">
                {sources.map(source => (
                    <Card key={source.id} className="bg-card/50 flex items-center p-3 gap-4 group">
                       <div className="p-2 bg-muted rounded-md">
                         <LinkIcon className="w-5 h-5 text-muted-foreground" />
                       </div>
                       <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex-grow min-w-0">
                           <p className="font-semibold truncate hover:underline">{source.title}</p>
                           <p className="text-sm text-muted-foreground truncate">{source.url}</p>
                       </a>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => deleteSource(source.id)}>
                            <Trash2 />
                       </Button>
                    </Card>
                ))}
            </div>
        ) : (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No external links saved yet.</p>
            </div>
        )}
      </div>
    </div>
  );
}

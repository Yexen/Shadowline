
'use client';

import { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus } from 'lucide-react';

interface GalleryControlsProps {
  addFolder: (name: string) => void;
}

export function GalleryControls({ addFolder }: GalleryControlsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  const handleAddFolder = () => {
    if (folderName.trim()) {
      addFolder(folderName.trim());
      setFolderName('');
      setDialogOpen(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <FolderPlus className="mr-2" />
          Add New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Folder</DialogTitle>
          <DialogDescription>
            Give your new folder a name to start organizing your images.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Character Portraits"
              onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddFolder}>Create Folder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

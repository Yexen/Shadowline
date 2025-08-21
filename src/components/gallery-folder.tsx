
'use client';

import type { GalleryFolder, GalleryImage } from '@/hooks/use-gallery';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Folder, ImagePlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface GalleryFolderProps {
  folder: GalleryFolder;
  onAddImage: (folderId: string, url: string, caption: string, dataAiHint: string) => void;
  onUpdateImage: (folderId: string, imageId: string, newUrl: string, newCaption: string, newDataAiHint: string) => void;
  onDeleteImage: (folderId: string, imageId: string) => void;
  onUpdateFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function GalleryFolder({ folder, onAddImage, onUpdateImage, onDeleteImage, onUpdateFolder, onDeleteFolder }: GalleryFolderProps) {
  const [editingFolder, setEditingFolder] = useState<GalleryFolder | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageDataAiHint, setNewImageDataAiHint] = useState('');

  const [editFolderName, setEditFolderName] = useState('');
  
  const handleAddImage = () => {
    if (newImageUrl.trim() && newImageCaption.trim()) {
        onAddImage(folder.id, newImageUrl, newImageCaption, newImageDataAiHint);
        setNewImageUrl('');
        setNewImageCaption('');
        setNewImageDataAiHint('');
        setAddDialog(false);
    }
  }

  const handleStartEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setNewImageUrl(image.url);
    setNewImageCaption(image.caption);
    setNewImageDataAiHint(image.dataAiHint);
  }

  const handleUpdateImage = () => {
    if (editingImage && newImageUrl.trim() && newImageCaption.trim()) {
        onUpdateImage(folder.id, editingImage.id, newImageUrl, newImageCaption, newImageDataAiHint);
        setEditingImage(null);
        setNewImageUrl('');
        setNewImageCaption('');
        setNewImageDataAiHint('');
    }
  }
  
  const handleStartEditFolder = () => {
    setEditingFolder(folder);
    setEditFolderName(folder.name);
  }

  const handleUpdateFolder = () => {
    if (editingFolder && editFolderName.trim()) {
      onUpdateFolder(folder.id, editFolderName);
      setEditingFolder(null);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setNewImageUrl(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3">
          <Folder className="text-primary" />
          {folder.name}
        </h2>
        <div className="flex items-center gap-2">
            <Dialog open={addDialog} onOpenChange={setAddDialog}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm"><ImagePlus/> Add Image</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Add New Image</DialogTitle>
                        <DialogDescription>Enter the URL and a caption for your new image, or upload from your device.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="image-caption">Image Caption</Label>
                            <Input id="image-caption" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} placeholder="e.g., Gotham City Docks" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-hint">AI Image Hint</Label>
                            <Input id="image-hint" value={newImageDataAiHint} onChange={e => setNewImageDataAiHint(e.target.value)} placeholder="e.g., dark city" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input id="image-url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
                        </div>
                        <div className="text-center text-sm text-muted-foreground">OR</div>
                         <div className="space-y-2">
                            <Label>Upload from device</Label>
                            <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddImage}>Add Image</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="hidden md:flex"><Trash2 /> Delete Folder</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the "{folder.name}" folder and all images inside it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteFolder(folder.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleStartEditFolder}><Pencil/> Edit Name</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {folder.images.map(image => (
          <Card key={image.id} className="group relative overflow-hidden bg-card hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
              <Image src={image.url} alt={image.caption} width={600} height={400} className="aspect-video object-cover" data-ai-hint={image.dataAiHint} />
              <div className="p-4">
                <p className="font-semibold truncate">{image.caption}</p>
              </div>
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStartEditImage(image)}>
                            <Pencil className="mr-2"/> Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 text-destructive"/> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the image "{image.caption}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteImage(folder.id, image.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
         {folder.images.length === 0 && (
            <div className="col-span-full text-center py-8 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">This folder is empty.</p>
                <p className="text-sm text-muted-foreground/80">Click "Add Image" to populate it.</p>
            </div>
        )}
      </div>

       {/* Edit Folder Dialog */}
        <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle className="font-headline">Edit Folder Name</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 py-4">
                    <Label htmlFor="folder-name-edit">Folder Name</Label>
                    <Input id="folder-name-edit" value={editFolderName} onChange={e => setEditFolderName(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingFolder(null)}>Cancel</Button>
                    <Button onClick={handleUpdateFolder}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


      {/* Edit Image Dialog */}
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle className="font-headline">Edit Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-image-caption">Image Caption</Label>
                        <Input id="edit-image-caption" value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="edit-image-hint">AI Image Hint</Label>
                        <Input id="edit-image-hint" value={newImageDataAiHint} onChange={e => setNewImageDataAiHint(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-image-url">Image URL</Label>
                        <Input id="edit-image-url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
                    </div>
                     <div className="text-center text-sm text-muted-foreground">OR</div>
                     <div className="space-y-2">
                        <Label>Upload from device</Label>
                        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingImage(null)}>Cancel</Button>
                    <Button onClick={handleUpdateImage}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </section>
  );
}

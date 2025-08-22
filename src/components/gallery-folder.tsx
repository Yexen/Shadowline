
'use client';

import type { GalleryFolder, GalleryItem } from '@/hooks/use-gallery';
import type { GalleryFilter } from '@/app/(main)/gallery/page';
import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Folder, ImagePlus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Card, CardContent } from './ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';


interface GalleryFolderProps {
  folder: GalleryFolder;
  filter: GalleryFilter;
  onAddItem: (folderId: string, type: 'image' | 'video', url: string, caption: string, dataAiHint: string) => void;
  onUpdateItem: (folderId: string, itemId: string, newUrl: string, newCaption: string, newDataAiHint: string, newType: 'image' | 'video') => void;
  onDeleteItem: (folderId: string, itemId: string) => void;
  onUpdateFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function GalleryFolder({ folder, filter, onAddItem, onUpdateItem, onDeleteItem, onUpdateFolder, onDeleteFolder }: GalleryFolderProps) {
  const [editingFolder, setEditingFolder] = useState<GalleryFolder | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemCaption, setNewItemCaption] = useState('');
  const [newItemDataAiHint, setNewItemDataAiHint] = useState('');
  const [newItemType, setNewItemType] = useState<'image' | 'video'>('image');

  const [editFolderName, setEditFolderName] = useState('');
  
  const handleAddItem = () => {
    if (newItemUrl.trim() && newItemCaption.trim()) {
        onAddItem(folder.id, newItemType, newItemUrl, newItemCaption, newItemDataAiHint);
        setNewItemUrl('');
        setNewItemCaption('');
        setNewItemDataAiHint('');
        setNewItemType('image');
        setAddDialog(false);
    }
  }

  const handleStartEditItem = (item: GalleryItem) => {
    setEditingItem(item);
    setNewItemUrl(item.url);
    setNewItemCaption(item.caption);
    setNewItemDataAiHint(item.dataAiHint);
    setNewItemType(item.type);
  }

  const handleUpdateItem = () => {
    if (editingItem && newItemUrl.trim() && newItemCaption.trim()) {
        onUpdateItem(folder.id, editingItem.id, newItemUrl, newItemCaption, newItemDataAiHint, newItemType);
        setEditingItem(null);
        setNewItemUrl('');
        setNewItemCaption('');
        setNewItemDataAiHint('');
        setNewItemType('image');
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
            setNewItemUrl(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  }

  const filteredItems = useMemo(() => {
    if (filter === 'all') return folder.items;
    return folder.items.filter(item => item.type === filter);
  }, [folder.items, filter]);

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
                    <Button variant="outline" size="sm"><ImagePlus/> Add Media</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Add New Media</DialogTitle>
                        <DialogDescription>Enter the URL and a caption for your new image or video.</DialogDescription>
                    </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <RadioGroup value={newItemType} onValueChange={(v: 'image' | 'video') => setNewItemType(v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="image" id="type-image" />
                                    <Label htmlFor="type-image">Image</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="video" id="type-video" />
                                    <Label htmlFor="type-video">Video</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-caption">Caption</Label>
                            <Input id="image-caption" value={newItemCaption} onChange={e => setNewItemCaption(e.target.value)} placeholder="e.g., Gotham City Docks" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-hint">AI Image Hint</Label>
                            <Input id="image-hint" value={newItemDataAiHint} onChange={e => setNewItemDataAiHint(e.target.value)} placeholder="e.g., dark city" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-url">URL</Label>
                            <Input id="image-url" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="https://placehold.co/600x400.png" />
                        </div>
                        <div className="text-center text-sm text-muted-foreground">OR</div>
                         <div className="space-y-2">
                            <Label>Upload from device</Label>
                            <Input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddItem}>Add Item</Button>
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
                    This action cannot be undone. This will permanently delete the "{folder.name}" folder and all media inside it.
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
        {filteredItems.map(item => (
          <Card key={item.id} className="group relative overflow-hidden bg-card hover:border-primary/50 transition-colors">
            <CardContent className="p-0">
              {item.type === 'image' ? (
                <Image src={item.url} alt={item.caption} width={600} height={400} className="aspect-video object-cover" data-ai-hint={item.dataAiHint} />
              ) : (
                <video src={item.url} controls className="w-full aspect-video object-cover bg-black" />
              )}
              <div className="p-4">
                <p className="font-semibold truncate">{item.caption}</p>
              </div>
               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStartEditItem(item)}>
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
                                This will permanently delete the item "{item.caption}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteItem(folder.id, item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
         {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-8 border-2 border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">No {filter !== 'all' ? filter + 's' : 'items'} found in this folder.</p>
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


      {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle className="font-headline">Edit Media</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                   <div className="space-y-2">
                        <Label>Type</Label>
                        <RadioGroup value={newItemType} onValueChange={(v: 'image' | 'video') => setNewItemType(v)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="image" id="edit-type-image" />
                                <Label htmlFor="edit-type-image">Image</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="video" id="edit-type-video" />
                                <Label htmlFor="edit-type-video">Video</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-image-caption">Caption</Label>
                        <Input id="edit-image-caption" value={newItemCaption} onChange={e => setNewItemCaption(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="edit-image-hint">AI Image Hint</Label>
                        <Input id="edit-image-hint" value={newItemDataAiHint} onChange={e => setNewItemDataAiHint(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-image-url">URL</Label>
                        <Input id="edit-image-url" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} />
                    </div>
                     <div className="text-center text-sm text-muted-foreground">OR</div>
                     <div className="space-y-2">
                        <Label>Upload from device</Label>
                        <Input type="file" accept="image/*,video/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
                    <Button onClick={handleUpdateItem}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </section>
  );
}

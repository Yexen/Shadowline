
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateImage } from '@/ai/flows/image-gen-flow';
import { Loader2, Image as ImageIcon, Save, Trash2, Download } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGallery } from '@/hooks/use-gallery';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function ImageGenTool() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [caption, setCaption] = useState('');
  const { folders, addItemToFolder } = useGallery();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setImageUrl('');
    try {
      const result = await generateImage(prompt);
      setImageUrl(result);
    } catch (error) {
      console.error("Image generation error:", error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate the image.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGallery = () => {
    if (!selectedFolder || !caption.trim() || !imageUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a folder and enter a caption.' });
      return;
    }
    // The AI hint can be derived from the original prompt for better searchability
    const dataAiHint = prompt.split(' ').slice(0, 2).join(' ');
    addItemToFolder(selectedFolder, 'image', imageUrl, caption, dataAiHint);
    toast({ title: 'Image Saved', description: `Saved to "${folders.find(f => f.id === selectedFolder)?.name}" folder.` });
    setSaveDialogOpen(false);
    setCaption('');
    setSelectedFolder('');
  };

  const handleSaveToDevice = (format: 'png' | 'jpeg' | 'svg') => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.download = `${caption || prompt || 'generated-image'}.${format}`;
    
    if (format === 'png') {
        link.href = imageUrl;
        link.click();
    } else {
        // For JPG/SVG, conversion is needed. This is a placeholder for that logic.
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.createElement('img');
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            link.href = canvas.toDataURL(`image/${format}`);
            link.click();
        };
        img.src = imageUrl;
    }
  };

  const handleDelete = () => {
    setImageUrl('');
    setPrompt('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="e.g., 'A dark, rainy alley in Gotham'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleGenerate} disabled={isLoading || !prompt.trim()}>
          {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        </Button>
      </div>
      <div className="aspect-video w-full">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : imageUrl ? (
          <Image src={imageUrl} alt={prompt} width={512} height={512} className="w-full h-full object-contain rounded-md border" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
            <p className="text-muted-foreground text-sm">Image will appear here</p>
          </div>
        )}
      </div>

      {imageUrl && !isLoading && (
        <div className="flex justify-center gap-2">
           <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Save className="mr-2"/> Save to Gallery</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save to Gallery</DialogTitle>
                        <DialogDescription>Select a folder and add a caption for your new image.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="folder-select">Folder</Label>
                            <Select onValueChange={setSelectedFolder} value={selectedFolder}>
                                <SelectTrigger id="folder-select">
                                    <SelectValue placeholder="Choose a folder..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {folders.map(folder => (
                                        <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caption-input">Caption</Label>
                            <Input id="caption-input" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g., Batmobile final concept" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveToGallery}>Save</Button>
                    </DialogFooter>
                </DialogContent>
           </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline"><Download className="mr-2"/> Save to Device</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSaveToDevice('png')}>PNG</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSaveToDevice('jpeg')}>JPG</DropdownMenuItem>
                <DropdownMenuItem disabled>SVG (Not available)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="mr-2"/> Delete</Button>
        </div>
      )}
    </div>
  );
}

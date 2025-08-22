
'use client';

import { useState, useRef } from 'react';
import type { MapData } from '@/hooks/use-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';

interface MapCardProps {
  map: MapData;
  onOpenMap: (map: MapData) => void;
  onUpdateMap: (id: string, updates: Partial<Omit<MapData, 'id'>>) => void;
}

export function MapCard({ map, onOpenMap, onUpdateMap }: MapCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(map.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSave = () => {
    onUpdateMap(map.id, { imageUrl: newImageUrl });
    setDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setNewImageUrl(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="bg-card hover:border-primary/50 transition-colors flex flex-col group">
      <CardHeader className="flex-row justify-between items-start">
        <div>
          <CardTitle className="font-headline">{map.title}</CardTitle>
          <CardDescription>{map.description}</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ImagePlus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Map Cover</DialogTitle>
                    <DialogDescription>
                        Change the cover image for the "{map.title}" map.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="cover-url">Image URL</Label>
                        <Input 
                            id="cover-url" 
                            value={newImageUrl} 
                            onChange={(e) => setNewImageUrl(e.target.value)} 
                            placeholder="Paste image URL here"
                        />
                    </div>
                    <div className="text-center text-sm text-muted-foreground">OR</div>
                        <div className="space-y-2">
                        <Label>Upload from device</Label>
                        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                        <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Browse Device</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleImageSave}>Save Image</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="relative p-0 flex-grow cursor-pointer" onClick={() => onOpenMap(map)}>
        <div className="relative h-64 w-full">
            <Image
                src={map.imageUrl}
                alt={`Cover image for ${map.title}`}
                layout="fill"
                className="object-cover"
                data-ai-hint={map.dataAiHint}
            />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-background/80 text-foreground py-2 px-4 rounded-md border border-border backdrop-blur-sm">
              <h3 className="font-headline">Click to Explore</h3>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

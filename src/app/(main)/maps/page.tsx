
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Map as MapIcon, ImagePlus, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
import { GothamMap } from "@/components/gotham-map";
import { mapHtml } from "@/lib/gotham-map-html";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAP_COVER_STORAGE_KEY = 'gotham-map-cover-image';

export default function MapsPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCoverUrl, setMapCoverUrl] = useState('https://placehold.co/800x450.png');
  const [isLoaded, setIsLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMapUrl, setNewMapUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
      const storedImage = localStorage.getItem(MAP_COVER_STORAGE_KEY);
      if (storedImage) {
        setMapCoverUrl(storedImage);
      }
    } catch (error) {
      console.error("Failed to access localStorage for map cover", error);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const handleStartEdit = () => {
    setNewMapUrl(mapCoverUrl);
    setDialogOpen(true);
  }

  const handleSaveCover = () => {
    setMapCoverUrl(newMapUrl);
    try {
        localStorage.setItem(MAP_COVER_STORAGE_KEY, newMapUrl);
    } catch (error) {
        console.error("Failed to save map cover to localStorage", error);
    }
    setDialogOpen(false);
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            setNewMapUrl(loadEvent.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  }


  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            Explore the cartography of your universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card hover:border-primary/50 transition-colors group">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapIcon />
                DC Universe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative w-full rounded-md overflow-hidden border">
                <Image 
                  src={mapCoverUrl} 
                  alt="DC Universe Map" 
                  fill 
                  className="object-cover" 
                  data-ai-hint="dc comics universe map" 
                  key={mapCoverUrl}
                />
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm" onClick={handleStartEdit}>
                        <Pencil className="mr-2 h-4 w-4"/>
                        Edit Cover
                    </Button>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">A high-level map of the entire DC Comics multiverse, showing key planets and dimensions.</p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-card hover:border-primary/50 transition-colors group flex flex-col"
          >
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapIcon />
                    Gotham City
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0 relative">
                 <div className="w-full flex-grow relative">
                    <iframe
                      srcDoc={mapHtml}
                      className="w-full h-full border-0 absolute inset-0"
                      title="Interactive Gotham City Map Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
                        <Button onClick={() => setIsMapOpen(true)} variant="secondary">
                            Click to Explore Map
                        </Button>
                    </div>
                 </div>
            </CardContent>
          </Card>

        </div>
      </div>
      <GothamMap isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Map Cover</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="map-url">Image URL</Label>
                        <Input 
                            id="map-url" 
                            value={newMapUrl} 
                            onChange={(e) => setNewMapUrl(e.target.value)} 
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
                    <Button onClick={handleSaveCover}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}

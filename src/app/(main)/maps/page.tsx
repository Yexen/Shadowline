
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Map as MapIcon } from 'lucide-react';
import { useState } from "react";
import { GothamMap } from "@/components/gotham-map";

export default function MapsPage() {
  const [isMapOpen, setIsMapOpen] = useState(false);

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            Explore the cartography of your universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapIcon />
                DC Universe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative w-full rounded-md overflow-hidden border">
                <Image 
                  src="https://placehold.co/800x450.png" 
                  alt="DC Universe Map" 
                  fill 
                  className="object-cover" 
                  data-ai-hint="dc comics universe map" 
                />
              </div>
              <p className="mt-4 text-muted-foreground">A high-level map of the entire DC Comics multiverse, showing key planets and dimensions.</p>
            </CardContent>
          </Card>
          <Card className="bg-card hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setIsMapOpen(true)}>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapIcon />
                Gotham City
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative w-full rounded-md overflow-hidden border">
                <Image 
                  src="https://placehold.co/800x450.png" 
                  alt="Gotham City Map" 
                  fill 
                  className="object-cover" 
                  data-ai-hint="gotham city map" 
                />
              </div>
              <p className="mt-4 text-muted-foreground">A detailed street-level map of Gotham City, marking important districts and landmarks.</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <GothamMap isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </>
  );
}

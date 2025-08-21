
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon } from 'lucide-react';
import { useState } from "react";
import { GothamMap } from "@/components/gotham-map";
import { mapHtml } from "@/lib/gotham-map-html";

export default function MapsPage() {
  const [isGothamMapOpen, setIsGothamMapOpen] = useState(false);
  const [isDcMapOpen, setIsDcMapOpen] = useState(false);

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            Explore the cartography of your universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <MapIcon />
                DC Universe
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0 relative">
                <button onClick={() => setIsDcMapOpen(true)} className="absolute inset-0 bg-transparent cursor-pointer z-10 group" aria-label="Explore DC Universe Map">
                    <iframe
                        srcDoc={mapHtml}
                        className="w-full h-full border-0 pointer-events-none"
                        title="Interactive DC Universe Map Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-background/80 text-foreground py-2 px-4 rounded-md border border-border backdrop-blur-sm">
                            <h3 className="font-headline">Click to Explore</h3>
                        </div>
                    </div>
                </button>
            </CardContent>
          </Card>
          
          <Card className="bg-card hover:border-primary/50 transition-colors flex flex-col">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <MapIcon />
                    Gotham City
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0 relative">
                <button onClick={() => setIsGothamMapOpen(true)} className="absolute inset-0 bg-transparent cursor-pointer z-10 group" aria-label="Explore Gotham City Map">
                    <iframe
                        srcDoc={mapHtml}
                        className="w-full h-full border-0 pointer-events-none"
                        title="Interactive Gotham City Map Preview"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-background/80 text-foreground py-2 px-4 rounded-md border border-border backdrop-blur-sm">
                            <h3 className="font-headline">Click to Explore</h3>
                        </div>
                    </div>
                </button>
            </CardContent>
          </Card>

        </div>
      </div>
      <GothamMap isOpen={isGothamMapOpen} onClose={() => setIsGothamMapOpen(false)} />
      <GothamMap isOpen={isDcMapOpen} onClose={() => setIsDcMapOpen(false)} />
    </>
  );
}

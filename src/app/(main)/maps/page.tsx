
'use client';
import { useState } from "react";
import { useMaps } from "@/hooks/use-maps";
import { GothamMap } from "@/components/gotham-map";
import { MapCard } from "@/components/map-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapData } from "@/hooks/use-maps";

export default function MapsPage() {
  const { maps, updateMap, isLoaded } = useMaps();
  const [activeMap, setActiveMap] = useState<MapData | null>(null);

  const handleOpenMap = (map: MapData) => {
    setActiveMap(map);
  };

  const handleCloseMap = () => {
    setActiveMap(null);
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            Explore the cartography of your universe. Click a map to open the interactive version.
          </p>
        </div>
        
        {isLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {maps.map(map => (
              <MapCard 
                key={map.id} 
                map={map} 
                onOpenMap={handleOpenMap} 
                onUpdateMap={updateMap} 
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        )}
      </div>

      {activeMap && (
        <GothamMap 
          isOpen={!!activeMap} 
          onClose={handleCloseMap} 
          mapHtml={activeMap.mapHtml} 
          title={\`Interactive \${activeMap.title} Map\`} 
        />
      )}
    </>
  );
}

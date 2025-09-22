
'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMaps } from "@/hooks/use-maps";
import { GothamMap } from "@/components/gotham-map";
import { MapCard } from "@/components/map-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapData } from "@/hooks/use-maps";

const translations = {
  en: {
    description: "Explore the cartography of your universe. Click a map to open the interactive version.",
    interactiveMap: "Interactive"
  },
  fa: {
    description: "نقشه‌نگاری دنیای خود را کاوش کنید. برای باز کردن نسخه تعاملی، روی یک نقشه کلیک کنید.",
    interactiveMap: "تعاملی"
  }
};

function MapsPageContent() {
  const { maps, updateMap, isLoaded } = useMaps();
  const [activeMap, setActiveMap] = useState<MapData | null>(null);
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') setLang('fa');
      else setLang('en');
    }
  }, []);

  // Auto-open map from URL parameter
  useEffect(() => {
    if (isLoaded && maps.length > 0) {
      const mapId = searchParams.get('map');
      if (mapId && !activeMap) {
        const requestedMap = maps.find(map => map.id === mapId);
        if (requestedMap) {
          setActiveMap(requestedMap);
        }
      }
    }
  }, [isLoaded, maps, searchParams, activeMap]);

  // Get location parameter for camera navigation
  const locationParam = searchParams.get('location');

  const t = translations[lang];

  const handleOpenMap = (map: MapData) => {
    setActiveMap(map);
  };

  const handleCloseMap = () => {
    setActiveMap(null);
    // Clear URL parameter when closing
    window.history.replaceState({}, '', '/maps');
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <p className="mt-2 text-muted-foreground">
            {t.description}
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
          title={`${t.interactiveMap} ${activeMap.title} Map`}
          highlightLocation={locationParam}
        />
      )}
    </>
  );
}

export default function MapsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapsPageContent />
    </Suspense>
  );
}

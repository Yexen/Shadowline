
'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Youtube, Newspaper } from "lucide-react";
import { generateYoutubeFeed, type YoutubeFeedOutput } from "@/ai/flows/generate-youtube-feed";
import { generateLatestIntel, type LatestIntelOutput } from "@/ai/flows/generate-latest-intel";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
    const [surveillanceFootage, setSurveillanceFootage] = useState<YoutubeFeedOutput['videos']>([]);
    const [latestIntel, setLatestIntel] = useState<LatestIntelOutput['articles']>([]);
    const [isFootageLoading, setIsFootageLoading] = useState(true);
    const [isIntelLoading, setIsIntelLoading] = useState(true);

    useEffect(() => {
        const fetchFeeds = async () => {
            setIsFootageLoading(true);
            setIsIntelLoading(true);
            try {
                const [feed, intel] = await Promise.all([
                    generateYoutubeFeed(),
                    generateLatestIntel()
                ]);
                setSurveillanceFootage(feed.videos);
                setLatestIntel(intel.articles);
            } catch (error) {
                console.error("Failed to fetch dynamic feeds:", error);
            } finally {
                setIsFootageLoading(false);
                setIsIntelLoading(false);
            }
        };

        fetchFeeds();
    }, []);

  return (
    <div className="space-y-8">
      <div>
        
        <p className="mt-2 text-muted-foreground">
          Your watch has begun. Here is the latest from the shadows.
        </p>
      </div>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Youtube className="text-primary" />
            Surveillance Footage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isFootageLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden bg-card">
                    <CardContent className="p-0">
                        <Skeleton className="w-full aspect-video" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/4" />
                        </div>
                    </CardContent>
                </Card>
            ))
          ) : (
            surveillanceFootage.map(video => (
              <Card key={video.id} className="overflow-hidden bg-card hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <Image src={video.thumbnail} alt={video.title} width={600} height={400} className="aspect-video object-cover" data-ai-hint={video.dataAiHint} />
                  <div className="p-4">
                      <h3 className="font-bold font-headline truncate">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">{video.uploader}</p>
                      <p className="text-xs text-muted-foreground">{video.views} views</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Newspaper className="text-primary" />
            Latest Intel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isIntelLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="flex flex-col bg-card">
                        <CardHeader>
                             <Skeleton className="aspect-video object-cover rounded-t-lg -mt-6 -mx-6 w-[calc(100%+48px)]" />
                            <div className="pt-4 space-y-2">
                                <Skeleton className="h-6 w-5/6" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                         <div className="p-6 pt-0">
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </Card>
                ))
            ) : (
                latestIntel.map(news => (
                    <Card key={news.id} className="flex flex-col bg-card hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <Image src={news.image} alt={news.title} width={600} height={400} className="aspect-video object-cover rounded-t-lg -mt-6 -mx-6" data-ai-hint={news.dataAiHint} />
                            <CardTitle className="font-headline pt-4">{news.title}</CardTitle>
                            <CardDescription>{news.source} - {news.date}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{news.snippet}</p>
                        </CardContent>
                        <div className="p-6 pt-0">
                            <Button variant="link" className="p-0 text-primary">Read More</Button>
                        </div>
                    </Card>
                ))
            )}
        </div>
      </section>
    </div>
  );
}

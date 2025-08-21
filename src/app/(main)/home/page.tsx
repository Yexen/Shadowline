
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Youtube, Newspaper } from "lucide-react";
import { generateHomeFeed, type HomeFeedOutput } from "@/ai/flows/generate-home-feed";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const CACHE_KEY = 'home-feed-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

type CachedData = {
  timestamp: number;
  data: HomeFeedOutput;
}

export default function HomePage() {
    const [surveillanceFootage, setSurveillanceFootage] = useState<HomeFeedOutput['videos']>([]);
    const [latestIntel, setLatestIntel] = useState<HomeFeedOutput['articles']>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFeeds = useCallback(async () => {
        setIsLoading(true);

        // Try to load from cache first
        try {
            const cachedItem = localStorage.getItem(CACHE_KEY);
            if (cachedItem) {
                const { timestamp, data } = JSON.parse(cachedItem) as CachedData;
                const now = new Date().getTime();
                if (now - timestamp < CACHE_DURATION) {
                    setSurveillanceFootage(data.videos);
                    setLatestIntel(data.articles);
                    setIsLoading(false);
                    console.log("Loaded home page feed from cache.");
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to read cache, fetching new data.", error);
        }

        // If cache is invalid or missing, fetch new data
        try {
            console.log("Fetching new home page feed...");
            const feed = await generateHomeFeed();
            setSurveillanceFootage(feed.videos);
            setLatestIntel(feed.articles);

            // Save new data to cache
            const cacheData: CachedData = {
                timestamp: new Date().getTime(),
                data: feed
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.error("Failed to fetch home page feed:", error);
            // Optionally, set some error state here to show in the UI
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeeds();
    }, [fetchFeeds]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
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
              <a href={video.url} key={video.id} target="_blank" rel="noopener noreferrer" className="block overflow-hidden bg-card hover:border-primary/50 transition-colors rounded-lg">
                <Card className="border-0 shadow-none h-full">
                  <CardContent className="p-0">
                    <Image src={video.thumbnail} alt={video.title} width={600} height={400} className="aspect-video object-cover" data-ai-hint={video.dataAiHint} />
                    <div className="p-4">
                        <h3 className="font-bold font-headline truncate">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">{video.uploader}</p>
                        <p className="text-xs text-muted-foreground">{video.views} views</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
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
            {isLoading ? (
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
                    <a href={news.url} key={news.id} target="_blank" rel="noopener noreferrer" className="block bg-card hover:border-primary/50 transition-colors rounded-lg">
                      <Card className="flex flex-col border-0 shadow-none h-full">
                          <CardHeader>
                              <Image src={news.image} alt={news.title} width={600} height={400} className="aspect-video object-cover rounded-t-lg -mt-6 -mx-6" data-ai-hint={news.dataAiHint} />
                              <CardTitle className="font-headline pt-4">{news.title}</CardTitle>
                              <CardDescription>{news.source} - {news.date}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <p className="text-muted-foreground">{news.snippet}</p>
                          </CardContent>
                          <div className="p-6 pt-0">
                              <span className="text-primary font-bold">Read More &rarr;</span>
                          </div>
                      </Card>
                    </a>
                ))
            )}
        </div>
      </section>
    </div>
  );
}

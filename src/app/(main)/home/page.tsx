
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Youtube, Newspaper, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define TypeScript types for our data
interface Video {
    id: string;
    title: string;
    uploader: string;
    views: string;
    thumbnail: string;
    dataAiHint: string;
    url: string;
}

interface NewsArticle {
    id: number;
    title: string;
    source: string;
    date: string;
    snippet: string;
    image: string;
    dataAiHint: string;
    url: string;
}

export default function HomePage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (window.FirebaseHelper) {
                    const videoRes = await window.FirebaseHelper.getBatmanVideos();
                    const newsRes = await window.FirebaseHelper.getBatmanNews();

                    if (videoRes.ok) setVideos(videoRes.data);
                    if (newsRes.ok) setNews(newsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Ensure FirebaseHelper is loaded before fetching
        if (window.FirebaseHelper) {
            fetchData();
        } else {
            // If the script hasn't loaded yet, wait for it.
            window.addEventListener('load', fetchData);
            return () => window.removeEventListener('load', fetchData);
        }
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
            videos.map(video => (
              <a href={video.url} key={video.id} target="_blank" rel="noopener noreferrer" className="block group overflow-hidden bg-card hover:border-primary/50 transition-colors rounded-lg">
                <Card className="border-0 shadow-none h-full">
                  <CardContent className="p-0">
                    <div className="relative aspect-video">
                        <Image src={video.thumbnail} alt={video.title} fill className="object-cover" data-ai-hint={video.dataAiHint} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/80" />
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold font-headline truncate">{video.title}</h3>
                        <p className="text-sm text-muted-foreground">{video.uploader}</p>
                        <p className="text-xs text-muted-foreground">{video.views}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading && news.length === 0 ? (
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
                news.map(news => (
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

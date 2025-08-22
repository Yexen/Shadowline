
'use client';

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Youtube, Newspaper } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);

    const surveillanceFootage = [
        {id: 1, title: 'Top 10 Batmobile Gadgets You Never Knew!', uploader: 'Bat-Fans United', views: '2.1M', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'batmobile gadgets', url: 'https://youtube.com'},
        {id: 2, title: 'Arkham Asylum: A Deep Dive into its Architecture', uploader: 'Gotham Historian', views: '870K', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'gothic architecture asylum', url: 'https://youtube.com'},
        {id: 3, title: 'Ranking Every Robin: From Best to Worst', uploader: 'Comic Geek', views: '1.5M', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'superhero sidekick', url: 'https://youtube.com'},
    ];

    const latestIntel = [
        {id: 1, title: 'Wayne Enterprises Announces New Tech Initiative', source: 'The Gotham Gazette', date: '4 hours ago', snippet: 'Wayne Enterprises has pledged to revitalize Burnley with a new technology center, promising jobs and innovation.', image: 'https://placehold.co/600x400.png', dataAiHint: 'modern cityscape', url: 'https://google.com/news'},
        {id: 2, title: 'Riddler Strikes Again With City-Wide Puzzle', source: 'Channel 52 News', date: '1 day ago', snippet: 'The enigmatic Riddler has challenged Gotham\'s finest with a series of complex puzzles, threatening to release sensitive city data.', image: 'https://placehold.co/600x400.png', dataAiHint: 'question mark neon', url: 'https://google.com/news'},
        {id: 3, title: 'The Penguin\'s Iceberg Lounge Under Investigation', source: 'Gotham PD Press', date: '3 days ago', snippet: 'Sources confirm the GCPD is building a case against Oswald Cobblepot, owner of the popular Iceberg Lounge.', image: 'https://placehold.co/600x400.png', dataAiHint: 'crime investigation board', url: 'https://google.com/news'},
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

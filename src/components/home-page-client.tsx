
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Youtube, Newspaper, PlayCircle, AlertTriangle, BadgeHelp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/refresh-button";
import { WatchlistButton } from "@/components/watchlist-button";
import type { Video } from "@/hooks/use-watchlist";
import type { NewsArticle } from "@/hooks/use-readlist";
import { ReadlistButton } from "@/components/readlist-button";
import { VideoModal } from '@/components/video-modal';

interface HomePageClientProps {
    initialVideos: Video[],
    initialNews: NewsArticle[],
    videoError?: string,
    newsError?: string
}

// This is the Client Component. It handles state and user interactions.
export function HomePageClient({ initialVideos, initialNews, videoError, newsError }: HomePageClientProps) {
  const [videos, setVideos] = React.useState(initialVideos);
  const [news, setNews] = React.useState(initialNews);
  
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<{ id: string; title: string } | null>(null);

  const openVideo = (id: string, title: string) => {
    setActive({ id, title });
    setOpen(true);
  };

  const closeVideo = () => {
    setOpen(false);
    setActive(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <p className="mt-2 text-muted-foreground">
          Your watch has begun. Here is the latest from the shadows.
        </p>
        <RefreshButton />
      </div>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Youtube className="text-primary" />
            Surveillance Footage
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoError && (
             <Card className="col-span-full bg-destructive/10 border-destructive/50">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">Video Feed Error</CardTitle>
                        <CardDescription className="text-destructive/80">{videoError}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
          )}
          {videos.length === 0 && !videoError ? (
             Array.from({ length: 6 }).map((_, index) => (
                <Card key={`skeleton-vid-${index}`} className="overflow-hidden bg-card">
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
              <Card key={video.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                <button
                  type="button"
                  onClick={() => openVideo(video.id, video.title)}
                  className="block text-left"
                  aria-label={`Play ${video.title}`}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image 
                          src={video.thumbnail} 
                          alt={`Thumbnail for ${video.title}`} 
                          fill
                          className="object-cover w-full h-full"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={video.thumbnail.includes('ytimg.com')}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/80" />
                        </div>
                    </div>
                  </CardContent>
                </button>
                <div className="p-4 flex flex-col flex-grow">
                  <button 
                    type="button"
                    onClick={() => openVideo(video.id, video.title)}
                    className="text-left flex-grow"
                  >
                    <h3 className="font-bold font-headline line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{video.uploader}</p>
                  </button>
                    <div className="flex justify-end mt-2">
                        <WatchlistButton video={video} />
                    </div>
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsError ? (
              <Card className="col-span-full bg-destructive/10 border-destructive/50">
                  <CardHeader className="flex-row items-center gap-4">
                      <AlertTriangle className="w-10 h-10 text-destructive" />
                      <div>
                          <CardTitle className="text-destructive">Intel Feed Error</CardTitle>
                          <CardDescription className="text-destructive/80">{newsError}</CardDescription>
                      </div>
                  </CardHeader>
              </Card>
            ) : news.length > 0 ? (
            news.map((article: NewsArticle) => (
              <Card key={article.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative aspect-video">
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={`Image for ${article.title}`}
                            fill
                            className="object-cover w-full h-full"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                  </div>
                </a>
                <CardHeader>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <CardTitle className="font-headline group-hover:text-primary transition-colors">{article.title}</CardTitle>
                    <CardDescription>{article.source} — {new Date(article.date).toLocaleDateString()}</CardDescription>
                  </a>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm line-clamp-3">{article.snippet}</p>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end items-center">
                  <ReadlistButton article={article} />
                </div>
              </Card>
            ))
            ) : (
                 <Card className="col-span-full bg-card/50">
                    <CardHeader className="flex-row items-center gap-4">
                        <BadgeHelp className="w-10 h-10 text-muted-foreground" />
                        <div>
                            <CardTitle>A Quiet Night in Gotham</CardTitle>
                            <CardDescription>Could not find any recent Batman-related news. The city is quiet... too quiet.</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}
          </div>
        </section>

        <VideoModal
          open={open}
          onClose={closeVideo}
          videoId={active?.id}
          title={active?.title}
        />
    </div>
  );
}

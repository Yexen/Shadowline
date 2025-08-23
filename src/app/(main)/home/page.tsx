
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
import { GET as getNewsRoute } from '@/app/api/news/route';
import { GET as getVideosRoute } from '@/app/api/videos/route';

const fallbackVideos: Video[] = [
    {
        id: "C-p32MOfn2c",
        title: "Batman's ENTIRE History in the DC Animated Universe (DCAU)",
        uploader: "Comicstorian",
        thumbnail: "https://i.ytimg.com/vi/C-p32MOfn2c/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=C-p32MOfn2c",
        publishedAt: "2022-03-10T00:00:00Z"
    },
    {
        id: "5-a4h5x4X8U",
        title: "The Philosophy of The Joker",
        uploader: "Wisecrack",
        thumbnail: "https://i.ytimg.com/vi/5-a4h5x4X8U/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=5-a4h5x4X8U",
        publishedAt: "2017-08-01T00:00:00Z"
    },
    {
        id: "pG_NKNX0g-Q",
        title: "The Complete History of Red Hood",
        uploader: "VariantComics",
        thumbnail: "https://i.ytimg.com/vi/pG_NKNX0g-Q/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=pG_NKNX0g-Q",
        publishedAt: "2018-10-23T00:00:00Z"
    },
];

type Intel = NewsArticle & { alive: boolean; };

function HomePageClient({ initialVideos, initialNews, videoError, newsError }: { initialVideos: Video[], initialNews: Intel[], videoError?: string, newsError?: string }) {
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
          {initialVideos.length > 0 ? (
            initialVideos.map(video => (
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
          ) : (
             !videoError && Array.from({ length: 6 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="overflow-hidden bg-card">
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
          )}
        </div>
      </section>

      <section>
          <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Newspaper className="text-primary" />
            Latest Intel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsError && (
              <Card className="col-span-full bg-destructive/10 border-destructive/50">
                  <CardHeader className="flex-row items-center gap-4">
                      <AlertTriangle className="w-10 h-10 text-destructive" />
                      <div>
                          <CardTitle className="text-destructive">Intel Feed Error</CardTitle>
                          <CardDescription className="text-destructive/80">{newsError}</CardDescription>
                      </div>
                  </CardHeader>
              </Card>
            )}
            {initialNews.map((article: any) => (
              <Card key={article.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative aspect-video">
                    <Image
                      src={article.image || "https://placehold.co/800x450.png?text=Batman+News"}
                      alt={`Image for ${article.title}`}
                      fill
                      className="object-cover w-full h-full"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                     {!article.alive && (
                        <div className="absolute top-2 right-2 text-xs bg-destructive/90 text-white px-2 py-1 rounded">
                            Offline
                        </div>
                    )}
                  </div>
                </a>
                <CardHeader>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className={!article.alive ? 'pointer-events-none' : ''}>
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
            ))}
            {!newsError && initialNews.length === 0 && (
                 <Card className="col-span-full bg-card/50">
                    <CardHeader className="flex-row items-center gap-4">
                        <BadgeHelp className="w-10 h-10 text-muted-foreground" />
                        <div>
                            <CardTitle>No Intel Found</CardTitle>
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

// This is the main export, a Server Component that fetches data.
export default async function HomePage() {
  let videos: Video[] = [];
  let news: Intel[] = [];
  let videoError: string | undefined;
  let newsError: string | undefined;

  try {
    const videoResponse = await getVideosRoute();
    if (!videoResponse.ok) {
      const errorData = await videoResponse.json();
      videoError = errorData.error || "An unknown error occurred while fetching videos.";
      videos = fallbackVideos;
    } else {
      videos = await videoResponse.json();
    }
  } catch (error) {
    videoError = "The video surveillance system is currently offline.";
    videos = fallbackVideos;
  }

  try {
    const newsResponse = await getNewsRoute();
    if (!newsResponse.ok) {
      const errorData = await newsResponse.json();
      newsError = errorData.error || 'Could not fetch the latest intel from the network.';
    } else {
      news = await newsResponse.json();
    }
  } catch (error) {
    newsError = 'The intel network is currently unreachable.';
  }

  return (
    <HomePageClient 
      initialVideos={videos}
      initialNews={news}
      videoError={videoError}
      newsError={newsError}
    />
  );
}

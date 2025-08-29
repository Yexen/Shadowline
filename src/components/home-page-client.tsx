
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Youtube, Newspaper, PlayCircle, AlertTriangle, BadgeHelp, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/refresh-button";
import { WatchlistButton } from "@/components/watchlist-button";
import type { Video } from "@/hooks/use-watchlist";
import type { NewsArticle } from "@/hooks/use-readlist";
import { ReadlistButton } from "@/components/readlist-button";
import { VideoModal } from '@/components/video-modal';
import { IntelViewer } from '@/components/intel-viewer';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

interface HomePageClientProps {
    initialVideos: Video[],
    initialNews: NewsArticle[],
    videoError?: string,
    newsError?: string
}

const translations = {
  en: {
    pageDescription: "Your watch has begun. Here is the latest from the shadows.",
    surveillanceTitle: "Surveillance Footage",
    intelTitle: "Latest Intel",
    videoErrorTitle: "Video Feed Error",
    intelErrorTitle: "Intel Feed Error",
    quietNightTitle: "A Quiet Night in Gotham",
    quietNightDescription: "Could not find any recent Batman-related news. The city is quiet... too quiet.",
    openExternally: "Open Externally"
  },
  fa: {
    pageDescription: "دیده بانی شما آغاز شده است. این آخرین خبر از سایه‌ها است.",
    surveillanceTitle: "تصاویر نظارتی",
    intelTitle: "آخرین اطلاعات",
    videoErrorTitle: "خطا در فید ویدیو",
    intelErrorTitle: "خطا در فید اطلاعات",
    quietNightTitle: "یک شب آرام در گاتهام",
    quietNightDescription: "هیچ خبر جدیدی مرتبط با بتمن یافت نشد. شهر آرام است... بیش از حد آرام.",
    openExternally: "باز کردن در تب جدید"
  }
};


// This is the Client Component. It handles state and user interactions.
export function HomePageClient({ initialVideos, initialNews, videoError, newsError }: HomePageClientProps) {
  const [videos, setVideos] = React.useState(initialVideos);
  const [news, setNews] = React.useState(initialNews);
  
  const [activeVideo, setActiveVideo] = React.useState<{ id: string; title: string } | null>(null);
  const [activeArticle, setActiveArticle] = React.useState<{ url: string; title: string } | null>(null);
  const [lang, setLang] = React.useState<'en' | 'fa'>('en');
  const [lastRefresh, setLastRefresh] = React.useState<number>(Date.now());
  const router = useRouter();

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const currentLang = document.documentElement.lang;
      if (currentLang === 'fa') {
        setLang('fa');
      } else {
        setLang('en');
      }
    }
  }, []);

  // Auto-refresh every 6 hours
  React.useEffect(() => {
    const checkForRefresh = () => {
      const now = Date.now();
      const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
      
      if (now - lastRefresh >= sixHours) {
        console.log('Auto-refreshing homepage after 6 hours');
        setLastRefresh(now);
        router.refresh();
      }
    };

    // Check every minute if we need to refresh
    const interval = setInterval(checkForRefresh, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastRefresh, router]);

  const t = translations[lang];

  const openVideo = (id: string, title: string) => setActiveVideo({ id, title });
  const openArticle = (url: string, title: string) => setActiveArticle({ url, title });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <p className="mt-2 text-muted-foreground">
          {t.pageDescription}
        </p>
        <RefreshButton />
      </div>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Youtube className="text-primary" />
            {t.surveillanceTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoError && (
             <Card className="col-span-full bg-destructive/10 border-destructive/50">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">{t.videoErrorTitle}</CardTitle>
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
                  className="block text-left cursor-pointer"
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
                    className="text-left flex-grow cursor-pointer"
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
            {t.intelTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsError ? (
              <Card className="col-span-full bg-destructive/10 border-destructive/50">
                  <CardHeader className="flex-row items-center gap-4">
                      <AlertTriangle className="w-10 h-10 text-destructive" />
                      <div>
                          <CardTitle className="text-destructive">{t.intelErrorTitle}</CardTitle>
                          <CardDescription className="text-destructive/80">{newsError}</CardDescription>
                      </div>
                  </CardHeader>
              </Card>
            ) : news.length > 0 ? (
            news.map((article: NewsArticle) => (
              <Card key={article.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                <button onClick={() => openArticle(article.url, article.title)} className="block text-left cursor-pointer w-full">
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
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/80" />
                    </div>
                  </div>
                </button>
                <CardHeader>
                    <button onClick={() => openArticle(article.url, article.title)} className="block text-left cursor-pointer w-full">
                        <CardTitle className="font-headline group-hover:text-primary transition-colors">{article.title}</CardTitle>
                        <CardDescription>{article.source} — {new Date(article.date).toLocaleDateString()}</CardDescription>
                    </button>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm line-clamp-3">{article.snippet}</p>
                </CardContent>
                <div className="p-4 pt-0 flex justify-between items-center">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        <ExternalLink className="mr-2"/> {t.openExternally}
                    </a>
                  </Button>
                  <ReadlistButton article={article} />
                </div>
              </Card>
            ))
            ) : (
                 <Card className="col-span-full bg-card/50">
                    <CardHeader className="flex-row items-center gap-4">
                        <BadgeHelp className="w-10 h-10 text-muted-foreground" />
                        <div>
                            <CardTitle>{t.quietNightTitle}</CardTitle>
                            <CardDescription>{t.quietNightDescription}</CardDescription>
                        </div>
                    </CardHeader>
                </Card>
            )}
          </div>
        </section>

        <VideoModal
          open={!!activeVideo}
          onClose={() => setActiveVideo(null)}
          videoId={activeVideo?.id}
          title={activeVideo?.title}
        />

        <IntelViewer
          open={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          url={activeArticle?.url}
          title={activeArticle?.title}
        />
    </div>
  );
}

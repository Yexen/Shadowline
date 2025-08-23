
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Youtube, Newspaper, PlayCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/refresh-button";
import { WatchlistButton } from "@/components/watchlist-button";
import type { Video } from "@/hooks/use-watchlist";
import { ReadlistButton } from "@/components/readlist-button";
import type { NewsArticle } from "@/hooks/use-readlist";
import Link from 'next/link';

async function getBatmanVideos(): Promise<{ videos: Video[], error?: string }> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_API_KEY_HERE") {
    return { videos: [], error: "YouTube API Key is not configured." };
  }
  
  const searchQuery = 'batman lore deep dive';

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=medium&maxResults=10&key=${YOUTUBE_API_KEY}`, {
        next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
        const err = await response.json();
        const errorMessage = err.error.message || "An unknown error occurred with the YouTube API.";
        console.error(`YouTube API Error for query "${searchQuery}":`, errorMessage);
        return { videos: [], error: errorMessage };
    }

    const result = await response.json();

    const finalVideos: Video[] = (result.items || [])
        .map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            uploader: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || 'https://placehold.co/480x360.png',
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
        }))
        .filter((video: Video) => video.id && video.title && video.thumbnail)
        .slice(0, 6);
        
    return { videos: finalVideos };

  } catch (error) {
    console.error("Failed to fetch videos due to an unhandled error:", error);
    return { videos: [], error: "An unexpected error occurred while fetching videos." };
  }
}

function getBatmanNews(): NewsArticle[] {
  return [
    {
      id: 1,
      title: "The Future of Batman in DC's Film Universe",
      source: "DC Comics",
      date: new Date().toLocaleDateString(),
      snippet: "With new leadership at DC Studios, fans are eagerly anticipating the next chapter for the Dark Knight on the big screen.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'comic news article',
      url: "https://www.dc.com/blog/2023/01/31/dc-studios-unveils-its-first-chapter-gods-and-monsters",
    },
    {
      id: 2,
      title: "Classic 'The Long Halloween' Story Arc to Get Animated Adaptation",
      source: "Warner Bros",
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
      snippet: "The iconic mystery that plagued Gotham for a year is finally getting a faithful animated two-part film adaptation.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'comic book panel',
      url: "https://www.warnerbros.com/movies/batman-long-halloween-part-one",
    },
    {
      id: 3,
      title: "Analysis: The Psychology of the Bat-Family",
      source: "IGN",
      date: new Date(Date.now() - 172800000).toLocaleDateString(),
      snippet: "A deep dive into the complex relationships and shared trauma that bind Batman and the vigilantes of Gotham.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'gotham city characters',
      url: "https://www.ign.com/articles/the-bat-familys-most-messed-up-moments",
    },
    {
      id: 4,
      title: "New 'Arkham' Game Rumored to be in Development",
      source: "GameSpot",
      date: new Date(Date.now() - 259200000).toLocaleDateString(),
      snippet: "Leaks suggest a new entry in the acclaimed Arkham series is in early stages, focusing on a younger Batman.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'video game art',
      url: "https://www.gamespot.com/articles/new-batman-arkham-game-reportedly-in-development/1100-6466657/",
    },
    {
      id: 5,
      title: "Top 10 Most Underrated Batman Villains",
      source: "ScreenRant",
      date: new Date(Date.now() - 345600000).toLocaleDateString(),
      snippet: "Beyond the Joker and Penguin lies a rich gallery of rogues. We explore the villains who deserve more spotlight.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'gotham villains comic',
      url: "https://screenrant.com/underrated-batman-villains-comics/",
    },
    {
      id: 6,
      title: "The Architectural History of Gotham City",
      source: "ArchDaily",
      date: new Date(Date.now() - 432000000).toLocaleDateString(),
      snippet: "From its gothic spires to its art deco skyscrapers, an in-depth look at the architectural styles that define Gotham.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'gothic architecture city',
      url: "https://www.archdaily.com/985538/the-urban-evolution-of-gotham-city-a-story-of-dark-architecture-and-the-grit-of-new-york",
    },
  ];
}

export default async function HomePage() {
    const { videos, error: videoError } = await getBatmanVideos();
    const news = getBatmanNews();
    const isExternal = (url?: string) => !!url && /^https?:\/\//i.test(url);

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
          {videoError ? (
             <Card className="col-span-full bg-destructive/10 border-destructive/50">
                <CardHeader className="flex-row items-center gap-4">
                    <AlertTriangle className="w-10 h-10 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">YouTube Feed Error</CardTitle>
                        <CardDescription className="text-destructive/80">{videoError} Please add your key to the .env file.</CardDescription>
                    </div>
                </CardHeader>
            </Card>
          ) : videos.length > 0 ? (
            videos.map(video => (
              <Card key={video.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                <a 
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  aria-label={`Watch ${video.title} by ${video.uploader}`}
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image 
                          src={video.thumbnail} 
                          alt={`Thumbnail for ${video.title}`} 
                          fill
                          className="object-cover w-full h-full"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={video.thumbnail.includes('ytimg.com')} // YouTube thumbnails don't need Next.js optimization
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <PlayCircle className="w-16 h-16 text-white/80" />
                        </div>
                    </div>
                  </CardContent>
                </a>
                <div className="p-4 flex flex-col flex-grow">
                  <a 
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow"
                  >
                    <h3 className="font-bold font-headline line-clamp-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{video.uploader}</p>
                  </a>
                    <div className="flex justify-end mt-2">
                        <WatchlistButton video={video} />
                    </div>
                </div>
              </Card>
            ))
          ) : (
             Array.from({ length: 6 }).map((_, index) => (
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
            {news.map(article => (
                <Card key={article.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                  {isExternal(article.url) ? (
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Read ${article.title}`}>
                      <div className="relative aspect-video">
                          <Image src={article.image} alt={`Image for ${article.title}`} fill className="object-cover w-full h-full" data-ai-hint={article.dataAiHint} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      </div>
                    </a>
                  ) : (
                    <div className="relative aspect-video pointer-events-none opacity-90">
                       <Image src={article.image} alt={`Image for ${article.title}`} fill className="object-cover w-full h-full" data-ai-hint={article.dataAiHint} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                  )}

                  <CardHeader>
                    {isExternal(article.url) ? (
                       <a href={article.url} target="_blank" rel="noopener noreferrer">
                         <CardTitle className="font-headline">{article.title}</CardTitle>
                         <CardDescription>{article.source} - {article.date}</CardDescription>
                       </a>
                    ) : (
                       <div>
                         <CardTitle className="font-headline">{article.title}</CardTitle>
                         <CardDescription>{article.source} - {article.date}</CardDescription>
                       </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{article.snippet}</p>
                  </CardContent>
                  <div className="p-6 pt-0 flex justify-between items-center">
                    {isExternal(article.url) ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">
                        Read More &rarr;
                      </a>
                    ) : <span />}
                      <ReadlistButton article={article} />
                  </div>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
}


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Youtube, Newspaper, PlayCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/refresh-button";
import { WatchlistButton } from "@/components/watchlist-button";
import type { Video } from "@/hooks/use-watchlist";
import { ReadlistButton } from "@/components/readlist-button";
import type { NewsArticle } from "@/hooks/use-readlist";
import { checkUrl, type UrlStatus } from "@/lib/checkUrl";

type Intel = NewsArticle & { status: UrlStatus };

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
    {
        id: "9MFJk4Xm3A4",
        title: "What You Never Knew About The Batcave",
        uploader: "CBR",
        thumbnail: "https://i.ytimg.com/vi/9MFJk4Xm3A4/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=9MFJk4Xm3A4",
        publishedAt: "2021-05-15T00:00:00Z"
    },
    {
        id: "D8eS2gY2i_w",
        title: "How Batman's Villains Represent Stages of Grief",
        uploader: "The Imaginary Axis",
        thumbnail: "https://i.ytimg.com/vi/D8eS2gY2i_w/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=D8eS2gY2i_w",
        publishedAt: "2020-09-20T00:00:00Z"
    },
    {
        id: "T7d64R2n4d4",
        title: "The Long Halloween: A Complete History",
        uploader: "Comics Explained",
        thumbnail: "https://i.ytimg.com/vi/T7d64R2n4d4/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=T7d64R2n4d4",
        publishedAt: "2021-06-25T00:00:00Z"
    },
];

async function getBatmanVideos(): Promise<{ videos: Video[], error?: string }> {
  // Use a placeholder for the base URL which will work in both development and production.
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/videos`, {
      next: { revalidate: 3600 } // This revalidates the fetch from our *own* API route
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "An unknown error occurred while fetching videos from the internal API.";
        console.error("Internal video API Error:", errorMessage);
        return { videos: fallbackVideos, error: errorMessage };
    }

    const videos = await response.json();
    
    // If the API returns an empty array for some reason, use the fallback.
    if (!videos || videos.length === 0) {
        return { videos: fallbackVideos, error: "The video feed is currently empty. Showing fallback content." };
    }
        
    return { videos };

  } catch (error) {
    console.error("Failed to fetch videos due to an unhandled error:", error);
    return { videos: fallbackVideos, error: "The video surveillance system is currently offline. Displaying archived footage." };
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
    const baseNews = getBatmanNews();
    
    const news: Intel[] = await Promise.all(
      baseNews.map(async (a) => ({ ...a, status: await checkUrl(a.url) }))
    );

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
          {videos.length > 0 ? (
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
            {news.map(article => (
                <Card key={article.id} className="group overflow-hidden bg-card hover:border-primary/50 transition-colors flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-video">
                    <Image
                      src={article.image}
                      alt={`Image for ${article.title}`}
                      fill
                      className="object-cover w-full h-full"
                      data-ai-hint={article.dataAiHint}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {!article.status.ok && (
                      <div className="absolute top-2 right-2 text-xs bg-destructive/90 text-white px-2 py-1 rounded">
                        Offline
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    {article.status.ok ? (
                      <a href={article.status.finalUrl ?? article.url} target="_blank" rel="noopener noreferrer">
                        <CardTitle className="font-headline">{article.title}</CardTitle>
                        <CardDescription>{article.source} — {article.date}</CardDescription>
                      </a>
                    ) : (
                      <div title={article.status.reason ?? "Unavailable"}>
                        <CardTitle className="font-headline">{article.title}</CardTitle>
                        <CardDescription>{article.source} — {article.date}</CardDescription>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{article.snippet}</p>
                  </CardContent>

                  <div className="p-6 pt-0 flex justify-between items-center">
                    {article.status.ok ? (
                      <a
                        href={article.status.finalUrl ?? article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline"
                      >
                        Read More →
                      </a>
                    ) : (
                      article.status.archiveUrl ? (
                        <a
                          href={article.status.archiveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:underline"
                        >
                          View on Web Archive →
                        </a>
                      ) : <span />
                    )}
                    <ReadlistButton article={article} />
                  </div>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
}

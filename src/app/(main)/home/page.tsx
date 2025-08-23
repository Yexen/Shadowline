
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

async function getBatmanVideos(): Promise<Video[]> {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key is not configured.");
    return [];
  }

  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=batman&type=video&order=viewCount&maxResults=6&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(YOUTUBE_API_URL, {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API Error:", errorData);
        return [];
    }
    
    const data = await response.json();

    const mappedVideos: Video[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      uploader: item.snippet.channelTitle,
      views: 'Trending',
      thumbnail: item.snippet.thumbnails.high.url,
      dataAiHint: 'batman video game',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return mappedVideos;

  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return [];
  }
}

function getBatmanNews(): NewsArticle[] {
  // Static data to prevent build failures from unreliable RSS services.
  return [
    {
      id: 1,
      title: "The Future of Batman in DC's Film Universe",
      source: "Gotham Gazette",
      date: new Date().toLocaleDateString(),
      snippet: "With new leadership at DC Studios, fans are eagerly anticipating the next chapter for the Dark Knight on the big screen. What could the future hold?",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'comic news article',
      url: "#",
    },
    {
      id: 2,
      title: "Classic 'The Long Halloween' Story Arc to Get Animated Adaptation",
      source: "CBR",
      date: new Date(Date.now() - 86400000).toLocaleDateString(), // Yesterday
      snippet: "The iconic mystery that plagued Gotham for a year is finally getting a faithful animated two-part film adaptation, sources confirm.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'comic book panel',
      url: "#",
    },
    {
      id: 3,
      title: "Analysis: The Psychology of the Bat-Family",
      source: "IGN",
      date: new Date(Date.now() - 172800000).toLocaleDateString(), // Two days ago
      snippet: "A deep dive into the complex relationships and shared trauma that bind Batman, Robin, Batgirl, and the other vigilantes of Gotham.",
      image: 'https://placehold.co/600x400.png',
      dataAiHint: 'gotham city characters',
      url: "#",
    },
  ];
}


export default async function HomePage() {
    const videos = await getBatmanVideos();
    const news = getBatmanNews();
    const isLoading = false; // Data is pre-fetched on the server

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
          {videos.length > 0 ? (
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
          ) : (
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
          )}
        </div>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-bold uppercase flex items-center gap-3 mb-4">
            <Newspaper className="text-primary" />
            Latest Intel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.length > 0 ? (
                news.map(article => (
                    <a href={article.url} key={article.id} target="_blank" rel="noopener noreferrer" className="block bg-card hover:border-primary/50 transition-colors rounded-lg">
                      <Card className="flex flex-col border-0 shadow-none h-full">
                          <CardHeader>
                              <Image src={article.image} alt={article.title} width={600} height={400} className="aspect-video object-cover rounded-t-lg -mt-6 -mx-6 w-[calc(100%+48px)]" data-ai-hint={article.dataAiHint} />
                              <CardTitle className="font-headline pt-4">{article.title}</CardTitle>
                              <CardDescription>{article.source} - {article.date}</CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                              <p className="text-muted-foreground">{article.snippet}</p>
                          </CardContent>
                          <div className="p-6 pt-0">
                              <span className="text-primary font-bold">Read More &rarr;</span>
                          </div>
                      </Card>
                    </a>
                ))
            ) : (
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
            )}
        </div>
      </section>
    </div>
  );
}

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

async function getBatmanNews(): Promise<NewsArticle[]> {
  const RSS_URL = 'https://www.cbr.com/feed/category/dc/';
  const RSS2JSON_API = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

  try {
    const response = await fetch(RSS2JSON_API, {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
        console.error("Failed to fetch RSS feed");
        return [];
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
        console.error("RSS to JSON API error:", data.message);
        return [];
    }

    // A simple function to strip HTML tags for a clean snippet
    const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

    const mappedNews: NewsArticle[] = data.items.slice(0, 6).map((item: any, index: number) => ({
      id: index,
      title: item.title,
      source: data.feed.title,
      date: new Date(item.pubDate).toLocaleDateString(),
      snippet: stripHtml(item.description).substring(0, 150) + '...',
      image: item.thumbnail || `https://placehold.co/600x400.png`,
      dataAiHint: 'comic news article',
      url: item.link,
    }));

    return mappedNews;

  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}


export default async function HomePage() {
    const videos = await getBatmanVideos();
    const news = await getBatmanNews();
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

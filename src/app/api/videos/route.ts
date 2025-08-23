
import { NextResponse } from 'next/server';

interface YouTubeVideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
  };
}

interface MappedVideo {
  id: string;
  title: string;
  uploader: string;
  views: string; // YouTube search API doesn't provide view count easily, so we'll use a placeholder.
  thumbnail: string;
  dataAiHint: string;
  url: string;
}

export async function GET() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API Key is not configured in .env.local");
    return NextResponse.json(
        { error: "YouTube API key not configured" },
        { status: 500 }
    );
  }

  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=batman&type=video&order=viewCount&maxResults=6&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(YOUTUBE_API_URL, {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API Error:", errorData);
        return NextResponse.json(
            { error: `YouTube API error: ${errorData.error.message}` },
            { status: response.status }
        );
    }
    
    const data = await response.json();

    const mappedVideos: MappedVideo[] = data.items.map((item: YouTubeVideoItem) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      uploader: item.snippet.channelTitle,
      views: 'Trending', // Placeholder, as view count requires another API call.
      thumbnail: item.snippet.thumbnails.high.url,
      dataAiHint: 'batman video game', // Generic hint for AI
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json(mappedVideos);

  } catch (error) {
    console.error("Failed to fetch videos:", error);
    return NextResponse.json(
        { error: "Failed to fetch videos from YouTube" },
        { status: 500 }
    );
  }
}

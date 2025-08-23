
import { NextResponse } from 'next/server';

interface YouTubeVideoItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high: {
        url: string;
      };
      default: {
        url: string;
      }
    };
  };
}

interface MappedVideo {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export async function GET() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error("YouTube API Key is not configured.");
    return NextResponse.json(
        { error: "YouTube API key not configured on the server." },
        { status: 500 }
    );
  }

  const searchQuery = 'batman lore deep dive';
  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=medium&maxResults=10&key=${YOUTUBE_API_KEY}`;
  
  try {
    const response = await fetch(YOUTUBE_API_URL, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("YouTube API Error:", errorData.error.message);
        return NextResponse.json(
            { error: `YouTube API error: ${errorData.error.message}` },
            { status: response.status }
        );
    }
    
    const data = await response.json();

    const mappedVideos: MappedVideo[] = (data.items || [])
        .map((item: YouTubeVideoItem) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            uploader: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || 'https://placehold.co/480x360.png',
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            publishedAt: item.snippet.publishedAt,
        }))
        .filter((video: MappedVideo) => video.id && video.title && video.thumbnail)
        .slice(0, 6);


    return NextResponse.json(mappedVideos);

  } catch (error) {
    console.error("Failed to fetch videos from internal API route:", error);
    return NextResponse.json(
        { error: "Failed to fetch videos from YouTube via proxy." },
        { status: 500 }
    );
  }
}

// Ensure this route is dynamically rendered and not statically built
export const dynamic = 'force-dynamic';

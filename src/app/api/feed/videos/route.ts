import { NextRequest, NextResponse } from 'next/server';
import type { Video } from "@/hooks/use-watchlist";

export async function GET(req: NextRequest) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    return NextResponse.json({ 
      error: "YouTube API key not configured on the server.",
      videos: []
    });
  }

  try {
    const searchQuery = 'batman lore deep dive';
    const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=medium&maxResults=6&key=${YOUTUBE_API_KEY}`;
    
    const response = await fetch(YOUTUBE_API_URL, { 
      next: { revalidate: 21600 }, // 6 hours
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`YouTube API error: ${errorData.error.message}`);
    }
    
    const data = await response.json();
    const videos: Video[] = (data.items || [])
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        uploader: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || 'https://placehold.co/480x360.png',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        publishedAt: item.snippet.publishedAt,
      }))
      .filter((video: Video) => video.id && video.title && video.thumbnail);

    return NextResponse.json({ 
      videos, 
      success: true,
      timestamp: new Date().toISOString()
    });
    
  } catch (e: any) {
    console.error("Video fetching error:", e);
    return NextResponse.json({ 
      error: e.message || "Failed to load videos from YouTube.",
      videos: []
    }, { status: 500 });
  }
}
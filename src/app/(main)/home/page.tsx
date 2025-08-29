export const dynamic = 'force-dynamic';
export const revalidate = 21600; // 6 hours in seconds (6 * 60 * 60)
export const fetchCache = 'default-no-store';

import React from 'react';
import type { Video } from "@/hooks/use-watchlist";
import type { NewsArticle } from "@/hooks/use-readlist";
import { HomePageClient } from '@/components/home-page-client'; 
import { getIntel } from '@/lib/intel';

// This is the Server Component. It's async and handles data fetching.
export default async function HomePage() {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  let videos: Video[] = [];
  let videoError: string | undefined;
  let news: NewsArticle[] = [];
  let newsError: string | undefined;

  // Fetch Videos
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
    videoError = "YouTube API key not configured on the server.";
    videos = []; // You could add fallback videos here if you want
  } else {
    try {
      const searchQuery = 'batman lore deep dive';
      const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoDuration=medium&maxResults=6&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(YOUTUBE_API_URL, { next: { revalidate: 21600 } }); // 6 hours
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`YouTube API error: ${errorData.error.message}`);
      }
      const data = await response.json();
      videos = (data.items || [])
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          uploader: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || 'https://placehold.co/480x360.png',
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          publishedAt: item.snippet.publishedAt,
        }))
        .filter((video: Video) => video.id && video.title && video.thumbnail);
    } catch (e: any) {
      console.error("Video fetching error:", e);
      videoError = e.message || "Failed to load videos from YouTube.";
    }
  }

  // Fetch News using the lib helper
  try {
    news = await getIntel({ limit: 9 });
  } catch (e: any) {
    console.error("News fetching error:", e);
    newsError = "Failed to load news feed.";
    news = [];
  }

  // Pass data as props to the Client Component
  return (
    <HomePageClient 
        initialVideos={videos} 
        initialNews={news} 
        videoError={videoError} 
        newsError={newsError}
    />
  );
}

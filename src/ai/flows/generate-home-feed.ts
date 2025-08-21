
'use server';

/**
 * @fileOverview A flow for generating all dynamic content for the home page.
 *
 * - generateHomeFeed - A function that returns trending videos and news articles.
 * - HomeFeedOutput - The return type for the generateHomeFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generate } from 'genkit';

const HomeFeedOutputSchema = z.object({
  videos: z.array(z.object({
    id: z.number(),
    title: z.string().describe("The title of the YouTube video. Should be plausible and engaging."),
    uploader: z.string().describe("The name of the YouTube channel that uploaded the video."),
    views: z.string().describe("The view count, formatted as a string (e.g., '1.2M', '450K')."),
    thumbnail: z.string().describe("A placeholder image URL for the video thumbnail. Use 'https://placehold.co/600x400.png'."),
    dataAiHint: z.string().describe("A 1-2 word hint for a relevant image (e.g., 'dark knight movie', 'batmobile retro').")
  })).describe("An array of 3 trending Batman-related YouTube videos."),
  articles: z.array(z.object({
    id: z.number(),
    title: z.string().describe("The headline of the news article. Should be plausible and engaging."),
    source: z.string().describe("The name of the news source (e.g., 'Gotham Gazette', 'Metropolis Times')."),
    date: z.string().describe("A relative date for the article (e.g., '2 hours ago', '1 day ago')."),
    snippet: z.string().describe("A short, one-sentence summary of the news article."),
    image: z.string().describe("A placeholder image URL. Use 'https://placehold.co/600x400.png'."),
    dataAiHint: z.string().describe("A 1-2 word hint for a relevant image (e.g., 'gotham city', 'batman movie').")
  })).describe("An array of 3 trending Batman-related news articles.")
});

export type HomeFeedOutput = z.infer<typeof HomeFeedOutputSchema>;

const staticFallbackData: HomeFeedOutput = {
    videos: [
        { id: 1, title: "The Philosophy of The Dark Knight", uploader: "FilmThink", views: "2.1M", thumbnail: "https://placehold.co/600x400.png", dataAiHint: "dark knight movie" },
        { id: 2, title: "Building a Real-Life Grapple Gun", uploader: "Hacksmith", views: "12M", thumbnail: "https://placehold.co/600x400.png", dataAiHint: "grapple gun tech" },
        { id: 3, title: "Batman: Arkham Knight - Full Story Movie", uploader: "GameCin", views: "8.9M", thumbnail: "https://placehold.co/600x400.png", dataAiHint: "arkham knight game" },
    ],
    articles: [
        { id: 1, title: "Wayne Enterprises Announces New Tech Grant", source: "Gotham Gazette", date: "4 hours ago", snippet: "Wayne Enterprises continues its commitment to Gotham's future with a new grant for tech startups.", image: "https://placehold.co/600x400.png", dataAiHint: "wayne tower" },
        { id: 2, title: "Unusual Seismic Activity Detected Beneath Arkham", source: "GCN News", date: "1 day ago", snippet: "Geologists are baffled by strange readings from beneath the asylum, sparking wild theories.", image: "https://placehold.co/600x400.png", dataAiHint: "arkham asylum" },
        { id: 3, title: "New Bat-Signal Unveiled at GCPD Headquarters", source: "Channel 8 News", date: "2 days ago", snippet: "Commissioner Gordon demonstrated the new, more powerful Bat-Signal last night.", image: "https://placehold.co/600x400.png", dataAiHint: "bat signal" },
    ]
}

export async function generateHomeFeed(): Promise<HomeFeedOutput> {
  return await generateHomeFeedFlow();
}

const generateHomeFeedFlow = ai.defineFlow(
  {
    name: 'generateHomeFeedFlow',
    inputSchema: z.void(),
    outputSchema: HomeFeedOutputSchema,
  },
  async () => {
    try {
        const { output } = await generate({
          prompt: `You are a content aggregator for a private intelligence dashboard about the Batman universe.
Your task is to generate a plausible list of trending content: 3 YouTube videos and 3 news articles.

For YouTube videos, think about what's currently popular: new movie theories, video game analyses, retrospective essays, or fan-made content. Create realistic titles, channel names, and view counts.
For news articles, think about what would be trending in that world: new villain activities, Wayne Enterprises announcements, movie or game news from our world, etc. Create realistic headlines, sources, and snippets.

For each item, provide all the necessary fields as defined in the output schema.
- Use "https://placehold.co/600x400.png" for all image and thumbnail URLs.
- Provide a 1-2 word AI hint for a relevant thumbnail image for each item.

Return your response as a single JSON object matching the required schema.`,
          model: 'googleai/gemini-1.5-flash-latest',
          output: {
            schema: HomeFeedOutputSchema,
            format: 'json',
          },
        });
        return output!;
    } catch (error) {
        console.warn("AI call failed for home feed, returning static data. Error:", error);
        return staticFallbackData;
    }
  }
);

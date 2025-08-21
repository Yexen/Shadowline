
'use server';

/**
 * @fileOverview A flow for generating all dynamic content for the home page.
 *
 * - generateHomeFeed - A function that returns trending videos and news articles.
 * - HomeFeedOutput - The return type for the generateHomeFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    const { output } = await ai.generate({
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
  }
);

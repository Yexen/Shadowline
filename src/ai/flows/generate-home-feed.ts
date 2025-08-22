
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
    title: z.string().describe("The title of the YouTube video. Should be plausible and engaging, referencing real-world topics like film analysis, fan theories, or tech builds."),
    uploader: z.string().describe("The name of a plausible YouTube channel."),
    views: z.string().describe("The view count, formatted as a string (e.g., '1.2M', '450K')."),
    thumbnail: z.string().describe("A placeholder image URL for the video thumbnail. Use 'https://placehold.co/600x400.png'."),
    dataAiHint: z.string().describe("A 1-2 word hint for a relevant image (e.g., 'dark knight movie', 'batmobile retro')."),
    url: z.string().url().describe("A plausible YouTube video URL (e.g., https://www.youtube.com/watch?v=...).")
  })).describe("An array of 3 trending Batman-related YouTube videos from the real internet."),
  articles: z.array(z.object({
    id: z.number(),
    title: z.string().describe("The headline of the news article. Should be plausible and engaging, like a real article from a pop culture or news website."),
    source: z.string().describe("The name of a plausible news source or website (e.g., 'IGN', 'Variety', 'The Gotham Times')."),
    date: z.string().describe("A relative date for the article (e.g., '2 hours ago', '1 day ago')."),
    snippet: z.string().describe("A short, one-sentence summary of the news article, as if it were a real news report."),
    image: z.string().describe("A placeholder image URL. Use 'https://placehold.co/600x400.png'."),
    dataAiHint: z.string().describe("A 1-2 word hint for a relevant image (e.g., 'gotham city', 'batman movie')."),
    url: z.string().url().describe("A plausible news article URL from a site like IGN, Variety, etc.")
  })).describe("An array of 3 trending Batman-related news articles from the real internet.")
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
      prompt: `You are a content curator for a Batman fan dashboard. Your task is to generate a list of 3 trending YouTube videos and 3 trending news articles that a real fan would find on the internet.

For YouTube videos, invent realistic titles, channel names, view counts, and a plausible YouTube URL.
For news articles, invent realistic headlines, sources (like IGN, Variety, ScreenRant, or in-universe papers like the Gotham Gazette), snippets, and a plausible URL for the article.

For all items, provide all fields as defined in the output schema.
- Use "https://placehold.co/600x400.png" for all image and thumbnail URLs.
- Provide a 1-2 word AI hint for a relevant thumbnail image for each item.

Return your response as a single JSON object matching the required schema.`,
      model: 'gpt-4o',
      output: {
        schema: HomeFeedOutputSchema,
      },
    });
    return output!;
    
  }
);

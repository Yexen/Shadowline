
'use server';

/**
 * @fileOverview A flow for generating a fake news feed of Batman-related intel.
 *
 * - generateLatestIntel - A function that returns a list of trending news articles.
 * - LatestIntelOutput - The return type for the generateLatestIntel function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LatestIntelOutputSchema = z.object({
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

export type LatestIntelOutput = z.infer<typeof LatestIntelOutputSchema>;

export async function generateLatestIntel(): Promise<LatestIntelOutput> {
  return await generateLatestIntelFlow();
}

const generateLatestIntelFlow = ai.defineFlow(
  {
    name: 'generateLatestIntelFlow',
    inputSchema: z.void(),
    outputSchema: LatestIntelOutputSchema,
  },
  async () => {
    const { output } = await ai.generate({
      prompt: `You are a news aggregator for the Batman universe. Your task is to generate a list of 3 plausible, trending news articles related to Batman, his allies, or Gotham City.

Think about what would be trending in that world: new villain activities, Wayne Enterprises announcements, movie or game news from our world, etc. Create realistic headlines, sources, and snippets.

For each article, provide:
- A unique numeric id.
- A catchy headline.
- A believable news source name.
- A relative date string (e.g., "5 hours ago", "2 days ago").
- A short snippet summarizing the article.
- Use "https://placehold.co/600x400.png" for the image URL.
- A 1-2 word AI hint for a relevant thumbnail image.

Return your response as a JSON object matching the required schema.`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: LatestIntelOutputSchema,
        format: 'json',
      },
    });
    return output!;
  }
);

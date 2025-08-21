
'use server';

/**
 * @fileOverview A flow for generating a fake YouTube feed of Batman-related videos.
 *
 * - generateYoutubeFeed - A function that returns a list of trending videos.
 * - YoutubeFeedOutput - The return type for the generateYoutubeFeed function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YoutubeFeedOutputSchema = z.object({
  videos: z.array(z.object({
    id: z.number(),
    title: z.string().describe("The title of the YouTube video. Should be plausible and engaging."),
    uploader: z.string().describe("The name of the YouTube channel that uploaded the video."),
    views: z.string().describe("The view count, formatted as a string (e.g., '1.2M', '450K')."),
    thumbnail: z.string().describe("A placeholder image URL for the video thumbnail. Use 'https://placehold.co/600x400'."),
    dataAiHint: z.string().describe("A 1-2 word hint for a relevant image (e.g., 'dark knight movie', 'batmobile retro').")
  })).describe("An array of 4 trending Batman-related YouTube videos.")
});

export type YoutubeFeedOutput = z.infer<typeof YoutubeFeedOutputSchema>;

export async function generateYoutubeFeed(): Promise<YoutubeFeedOutput> {
  return await generateYoutubeFeedFlow();
}

const generateYoutubeFeedFlow = ai.defineFlow(
  {
    name: 'generateYoutubeFeedFlow',
    inputSchema: z.void(),
    outputSchema: YoutubeFeedOutputSchema,
  },
  async () => {
    const { output } = await ai.generate({
      prompt: `You are a YouTube algorithm expert specializing in superhero content. Your task is to generate a list of 4 plausible, trending YouTube videos related to Batman.

Think about what's currently popular: new movie theories, video game analyses, retrospective essays, or fan-made content. Create realistic titles, channel names, and view counts.

For each video, provide:
- A unique numeric id.
- A catchy title.
- A believable uploader/channel name.
- A view count as a string (e.g., "2.1M", "780K").
- Use "https://placehold.co/600x400" for the thumbnail URL.
- A 1-2 word AI hint for a relevant thumbnail image.

Return your response as a JSON object matching the required schema.`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: YoutubeFeedOutputSchema,
        format: 'json',
      },
    });
    return output!;
  }
);

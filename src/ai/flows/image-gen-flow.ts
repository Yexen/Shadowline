
'use server';
/**
 * @fileOverview A Genkit flow for generating images using Gemini.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string().describe('A text prompt describing the image to generate.'),
    outputSchema: z.string().describe('The data URI of the generated image.'),
  },
  async (prompt) => {
    console.log(`Image generation requested for prompt: ${prompt}`);
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (media?.url) {
      return media.url;
    }
    
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // 1x1 transparent pixel
  }
);

export async function generateImage(prompt: string): Promise<string> {
    return generateImageFlow(prompt);
}

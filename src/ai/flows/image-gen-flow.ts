
'use server';
/**
 * @fileOverview A Genkit flow for generating images.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: z.string().describe('A text prompt describing the image to generate.'),
    outputSchema: z.string().describe('The data URI of the generated image.'),
  },
  async (prompt) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return media?.url || 'No image could be generated.';
  }
);

export async function generateImage(prompt: string): Promise<string> {
    return generateImageFlow(prompt);
}

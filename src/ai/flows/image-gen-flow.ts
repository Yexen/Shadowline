
'use server';
/**
 * @fileOverview A Genkit flow for generating images using DALL-E.
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
    const { media } = await ai.generate({
      model: 'openai/dall-e-3',
      prompt,
    });

    return media?.url || 'No image could be generated.';
  }
);

export async function generateImage(prompt: string): Promise<string> {
    return generateImageFlow(prompt);
}

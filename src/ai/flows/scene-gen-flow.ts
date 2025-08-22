
'use server';
/**
 * @fileOverview A Genkit flow for generating a story scene based on a prompt.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const generateSceneFlow = ai.defineFlow(
  {
    name: 'generateSceneFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `You are an expert storyteller and ghostwriter for a dark, noir-themed story set in a city like Gotham. The user will provide a prompt, and you must generate a compelling, well-written scene based on it. The scene should be atmospheric and fit the gritty, mysterious tone of the world.

User's Prompt: "${prompt}"

Generated Scene:
`,
        config: {
            temperature: 0.8,
            maxOutputTokens: 1024,
        }
    });

    return output ?? 'The muses are silent. The scene could not be generated.';
  }
);

export async function generateScene(prompt: string): Promise<string> {
    return generateSceneFlow(prompt);
}

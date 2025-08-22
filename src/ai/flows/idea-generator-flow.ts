'use server';
/**
 * @fileOverview A Genkit flow for generating story ideas.
 */
import { ai, GEMINI_MODEL } from '@/ai/genkit';
import { z } from 'zod';

const ideaGeneratorFlow = ai.defineFlow(
  {
    name: 'ideaGeneratorFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const { output } = await ai.generate({
        model: GEMINI_MODEL,
        prompt: `You are an AI idea generator for a writer working on a dark, noir story set in a city like Gotham. Based on the user's prompt, generate a single, compelling story concept or "what if" scenario. It should be a short paragraph.

User's Prompt: "${prompt}"

Generated Idea:
`,
        config: {
            temperature: 0.9,
            maxOutputTokens: 256,
        }
    });

    return output ?? 'No ideas came to mind. Try a different prompt.';
  }
);

export async function generateStoryIdea(prompt: string): Promise<string> {
    return ideaGeneratorFlow(prompt);
}

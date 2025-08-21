'use server';

/**
 * @fileOverview A flow for AI-assisted writing and content generation.
 *
 * - generateContent - A function that generates content based on a prompt.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  prompt: z.string().describe('The writing prompt to generate content for.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().describe('The AI-generated content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return generateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateContentInputSchema},
  output: {schema: GenerateContentOutputSchema},
  prompt: `You are a creative writing assistant. Your task is to write a compelling piece of content based on the user's prompt. This could be a scene, a character description, or a plot point.

Prompt: {{{prompt}}}

Write the content as requested.`,
});

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
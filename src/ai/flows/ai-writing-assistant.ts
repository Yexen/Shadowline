'use server';

/**
 * @fileOverview A flow for AI-assisted writing and content generation.
 *
 * - generateContent - A function that generates content based on a prompt.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContent- The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContentInputSchema = z.object({
  prompt: z.string().describe('The writing prompt to generate content for.'),
  bibleData: z.any().optional().describe("A JSON string representing the user's world bible for context."),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  content: z.string().describe('The AI-generated content.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  return await generateContentFlow(input);
}

const generateContentFlow = ai.defineFlow(
  {
    name: 'generateContentFlow',
    inputSchema: GenerateContentInputSchema,
    outputSchema: GenerateContentOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a creative writing assistant for a user writing stories set in a Gotham City-like universe.
Your task is to write a compelling piece of content based on the user's prompt. This could be a scene, a character description, or a plot point.

{{#if bibleData}}
You have been provided with the user's "Gotham Bible" which contains their custom worldbuilding details. This is your primary source of truth. The bible is structured into categories, with each entry having key-value 'fields' and detailed 'pages' for deeper lore. You MUST consider content from both 'fields' and 'pages'.

GOTHAM BIBLE CONTEXT:
{{{bibleData}}}
{{/if}}

USER PROMPT:
"{{{prompt}}}"

Write the content as requested, ensuring it is consistent with the provided bible if it exists.`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: GenerateContentOutputSchema,
      },
      input,
    });
    return output!;
  }
);

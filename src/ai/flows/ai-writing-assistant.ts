
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
  bibleData: z.any().optional().describe("A JSON string representing all of the user's project data for context. This includes the bible, drafts, volumes, gallery, and writers."),
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
  async ({ prompt, bibleData }) => {
    
    const { output } = await ai.generate({
      prompt: `You are a creative writing assistant for a user writing stories set in a Gotham City-like universe.
Your task is to write a compelling piece of content based on the user's prompt. This could be a scene, a character description, or a plot point.

You have been provided with the user's project data which contains their custom worldbuilding details (bible, drafts, volumes, etc). This is your primary source of truth.

PROJECT CONTEXT:
${bibleData}

PROMPT: "${prompt}"

Generate the content now.`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: GenerateContentOutputSchema,
      },
       config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
        ],
      }
    });

    return output || { content: "I'm sorry, I couldn't generate any content for that prompt." };
  }
);

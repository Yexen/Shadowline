'use server';

/**
 * @fileOverview A flow for generating suggested fields for a bible entry.
 *
 * - generateBibleFields - A function that suggests fields for a bible entry.
 * - GenerateBibleFieldsInput - The input type for the generateBibleFields function.
 * - GenerateBibleFieldsOutput - The return type for the generateBibleFields function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBibleFieldsInputSchema = z.object({
  category: z.string().describe('The category of the bible entry (e.g., Character, Location).'),
  title: z.string().describe('The title of the bible entry (e.g., Batman).'),
});
export type GenerateBibleFieldsInput = z.infer<typeof GenerateBibleFieldsInputSchema>;

const GenerateBibleFieldsOutputSchema = z.object({
  fields: z.array(z.string()).describe('An array of suggested field labels.'),
});
export type GenerateBibleFieldsOutput = z.infer<typeof GenerateBibleFieldsOutputSchema>;


export async function generateBibleFields(input: GenerateBibleFieldsInput): Promise<GenerateBibleFieldsOutput> {
  return await generateBibleFieldsFlow(input);
}


const generateBibleFieldsFlow = ai.defineFlow(
  {
    name: 'generateBibleFieldsFlow',
    inputSchema: GenerateBibleFieldsInputSchema,
    outputSchema: GenerateBibleFieldsOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are a creative writing assistant helping a user build their world bible for a story.
The user wants suggestions for what fields to include for a new entry.
Based on the category and title, generate a list of 5-10 relevant fields a writer would want to track.

Category: "${input.category}"
Title: "${input.title}"

Return your response as a JSON object with a single key "fields" containing an array of the suggested field labels. For example: { "fields": ["Real Name", "Alias", "Abilities"] }`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: GenerateBibleFieldsOutputSchema,
        format: 'json',
      },
    });
    return output!;
  }
);

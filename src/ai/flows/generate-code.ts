'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating code (CSS or Javascript) from a text description.
 *
 * - generateCode - A function that takes a text description and generates code.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  description: z.string().describe('A text description of the desired code snippet.'),
  language: z.enum(['CSS', 'JavaScript']).describe('The programming language for the code snippet.'),
  bibleData: z.any().optional().describe("A JSON string representing the user's world bible for context."),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are a helpful assistant that generates code snippets based on user descriptions.

The user will provide a description of the desired code and the programming language.
You should generate a code snippet that matches the description and language.
  
{{#if bibleData}}
You have been provided with the user's "Gotham Bible" which contains their custom worldbuilding details. If the user's request seems to be related to their project's theme, use the bible as context. For example, if they ask for a "dark button," you can infer the color scheme from the bible's tone.
GOTHAM BIBLE CONTEXT:
{{{bibleData}}}
{{/if}}

Description: {{{description}}}
Language: {{{language}}}

Make sure that the output is valid, runnable code.`,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

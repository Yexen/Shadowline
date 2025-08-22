
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
  bibleData: z.any().optional().describe("A JSON string representing all of the user's project data for context. This includes the bible, drafts, volumes, gallery, and writers."),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return await generateCodeFlow(input);
}

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async ({ description, language, bibleData }) => {
    
    const { output } = await ai.generate({
      prompt: `You are a helpful assistant that generates code snippets based on user descriptions.
The user will provide a description of the desired code and the programming language.
You should generate a code snippet that matches the description and language.
The output should only be the raw code, without any markdown formatting or explanations.

${bibleData ? `
You have been provided with the user's project data which contains their custom worldbuilding details (bible, drafts, volumes, etc). If the user's request seems to be related to their project's theme, use this data as context. For example, if they ask for a "dark button," you can infer the color scheme from the project's overall tone.

PROJECT CONTEXT:
${bibleData}` : ''}

Description: "${description}"
Language: ${language}

Generate the code now.`,
      model: 'gpt-4o',
      output: {
        schema: GenerateCodeOutputSchema
      }
    });

    return output || { code: `// Failed to generate ${language} code.` };
  }
);

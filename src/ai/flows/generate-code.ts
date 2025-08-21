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
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  return await generateCodeFlow(input);
}

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async ({ description, language, bibleData }) => {
    const prompt = `You are a helpful assistant that generates code snippets based on user descriptions.
The user will provide a description of the desired code and the programming language.
You should generate a code snippet that matches the description and language.
The output should only be the raw code, without any markdown formatting or explanations.

${bibleData ? `
You have been provided with the user's "Gotham Bible" which contains their custom worldbuilding details. If the user's request seems to be related to their project's theme, use the bible as context. For example, if they ask for a "dark button," you can infer the color scheme from the bible's tone. The bible is structured into categories, with each entry having key-value 'fields' and detailed 'pages' for deeper lore. You MUST consider content from both 'fields' and 'pages' for context.

GOTHAM BIBLE CONTEXT:
${bibleData}` : ''}

Description: "${description}"
Language: ${language}

Generate the code now.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
      });
      const code = response.choices[0].message.content || `// Failed to generate ${language} code.`;
      // The prompt now asks for a single JSON key, which we can parse.
      return { code };
    } catch (error: any) {
      console.error("OpenAI API error in generateCode flow:", error);
      return { code: `/* Error generating code: ${error.message} */` };
    }
  }
);

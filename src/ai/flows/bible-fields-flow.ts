'use server';
/**
 * @fileOverview A Genkit flow for suggesting fields for a Bible entry.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BibleFieldsInputSchema = z.object({
  entryTitle: z.string().describe("The title of the Bible entry (e.g., 'The Joker', 'Batcave')."),
  entryCategory: z.string().describe("The category of the entry (e.g., 'Characters', 'Locations')."),
});

export type BibleFieldsInput = z.infer<typeof BibleFieldsInputSchema>;

const suggestBibleFieldsFlow = ai.defineFlow(
  {
    name: 'suggestBibleFieldsFlow',
    inputSchema: BibleFieldsInputSchema,
    outputSchema: z.array(z.string()),
  },
  async ({ entryTitle, entryCategory }) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `You are an AI assistant for a writer building a world bible for a story set in a dark, noir city like Gotham. Your task is to suggest relevant field labels for a new Bible entry. Based on the entry's title and category, provide a list of useful fields.

        Entry Title: "${entryTitle}"
        Entry Category: "${entryCategory}"

        Suggest 5 to 7 relevant field labels. For example, for a 'Character', you might suggest 'Real Name', 'Abilities', 'First Appearance'. For a 'Location', you might suggest 'Description', 'Key Features', 'Known Inhabitants'. Do not provide values, only the labels.
        `,
        output: {
            schema: z.object({
                fields: z.array(z.string()).describe("An array of suggested field labels."),
            }),
        },
        config: {
            temperature: 0.3,
        }
    });
    
    return output?.fields ?? [];
  }
);

export async function suggestBibleFields(input: BibleFieldsInput): Promise<string[]> {
    return suggestBibleFieldsFlow(input);
}

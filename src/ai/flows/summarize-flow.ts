
'use server';
/**
 * @fileOverview A Genkit flow for summarizing content from the Bible.
 */
import { ai, getModel } from '@/ai/genkit';
import { z } from 'zod';
import { useBible } from '@/hooks/use-bible';

// Note: This is a bit of a hack since we can't use hooks directly in server components like this.
// In a real app, this data would be fetched from a database. For this prototype,
// we'll re-read from localStorage on the server-side, which is not a recommended practice.
import { promises as fs } from 'fs';
import path from 'path';

// Helper to get bible data on the server
async function getBibleData() {
  // This is a placeholder for actual data fetching.
  // We can't use the hook directly, so we simulate getting data.
  // This is NOT how you would do this in a real application.
  return [
    { 
        category: "Characters", 
        items: [
            { title: "The Joker", fields: [{ label: "Biography", value: "An agent of chaos with a twisted sense of humor, the Joker is Batman's archenemy, seeking to disrupt order in Gotham City through elaborate and deadly schemes." }] }, 
            { title: "Catwoman", fields: [{ label: "Biography", value: "A complex figure in Gotham's underworld, Selina Kyle operates as Catwoman, a master thief with a moral code that sometimes aligns her with Batman." }] }
        ] 
    },
    { category: "Locations", items: [ { title: "Arkham Asylum", fields: [ { label: "Purpose", value: "A psychiatric hospital that houses many of Batman's most dangerous foes." } ] } ] }
  ];
}


const SummarizeInputSchema = z.object({
  topic: z.string().describe("The topic to summarize, e.g., 'The Joker'."),
});

export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    const bibleData = await getBibleData();
    let context = `Could not find any information on "${topic}".`;

    for (const category of bibleData) {
        const item = category.items.find(i => i.title.toLowerCase() === topic.toLowerCase());
        if (item) {
            context = `Information about ${item.title}:\n` +
                item.fields.map(f => `${f.label}: ${f.value}`).join('\n');
            break;
        }
    }
    
    const model = await getModel();
    const { output } = await ai.generate({
        model,
        prompt: `Based on the following context, provide a one-paragraph summary for the user. If no context is available, say so.

        Context:
        """
        ${context}
        """

        Summary:
        `,
        config: {
            temperature: 0.3,
            maxOutputTokens: 256,
        }
    });

    return output ?? 'I am unable to provide a summary at this moment.';
  }
);

export async function summarizeTopic(topic: string): Promise<string> {
    return summarizeFlow({ topic });
}

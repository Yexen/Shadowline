'use server';
/**
 * @fileOverview The Oracle AI flow for answering questions about a given text.
 */
import { ai, GEMINI_MODEL } from '@/ai/genkit';
import { z } from 'zod';
import { useBible } from '@/hooks/use-bible';

// This is a placeholder for a real database lookup.
async function getFullBibleText() {
    // In a real app, this would be a database call.
    // For now, we'll just simulate getting all the text.
    const { bibleData } = useBible();
    return JSON.stringify(bibleData);
}

export const OracleChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type OracleChatMessage = z.infer<typeof OracleChatMessageSchema>;


const OracleChatInputSchema = z.array(OracleChatMessageSchema);

const oracleChatFlow = ai.defineFlow(
  {
    name: 'oracleChatFlow',
    inputSchema: OracleChatInputSchema,
    outputSchema: z.string(),
  },
  async (messages) => {
    // This is not efficient, but for the prototype it demonstrates the concept.
    const bibleContext = await getFullBibleText();

    const { output } = await ai.generate({
        model: GEMINI_MODEL,
        history: messages.slice(0, -1),
        prompt: messages[messages.length - 1].content,
        system: `You are the Oracle, an AI assistant for a writer. Your task is to answer questions based on the provided "Bible" of world-building information. The writer may ask you about characters, locations, lore, or plot points. Use ONLY the provided Bible context to answer. Be concise and insightful. If the information is not in the Bible, say so. Do not invent information.

        Your entire knowledge base is this Bible:
        """
        ${bibleContext}
        """
        `,
        config: {
            temperature: 0.3,
        },
    });
    
    return output ?? 'The Oracle is silent. No answer could be generated.';
  }
);

export async function runOracleChat(messages: OracleChatMessage[]): Promise<string> {
    return oracleChatFlow(messages);
}

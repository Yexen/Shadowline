'use server';
/**
 * @fileOverview The Oracle AI flow for answering questions about a given text.
 */
import { ai, TEXT_MODEL } from '@/ai/genkit';
import { z } from 'zod';
import { ChatMessageSchema, type ChatMessage } from '@/ai/types';

// This is a placeholder for a real database lookup.
// In a real app, this would be a database call.
async function getFullBibleText() {
    // This is a placeholder for actual data fetching.
    // We can't use the hook directly, so we simulate getting data.
    // This is NOT how you would do this in a real application.
    return JSON.stringify([
      { 
          category: "Characters", 
          items: [
              { title: "The Joker", fields: [{ label: "Biography", value: "An agent of chaos with a twisted sense of humor, the Joker is Batman's archenemy, seeking to disrupt order in Gotham City through elaborate and deadly schemes." }] }, 
              { title: "Catwoman", fields: [{ label: "Biography", value: "A complex figure in Gotham's underworld, Selina Kyle operates as Catwoman, a master thief with a moral code that sometimes aligns her with Batman." }] }
          ] 
      },
      { category: "Locations", items: [ { title: "Arkham Asylum", fields: [ { label: "Purpose", value: "A psychiatric hospital that houses many of Batman's most dangerous foes." } ] } ] }
    ]);
}

const OracleChatInputSchema = z.array(ChatMessageSchema);

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
        model: TEXT_MODEL,
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

export async function runOracleChat(messages: ChatMessage[]): Promise<string> {
    return oracleChatFlow(messages);
}

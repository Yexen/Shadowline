
'use server';

/**
 * @fileOverview A flow for handling conversational chat with the Nyxen AI.
 *
 * - continueConversation - A function that continues a conversation.
 * - NyxenChatInput - The input type for the function.
 * - NyxenChatOutput - The return type for the function.
 * - NyxenMessage - A single message in the chat history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NyxenMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});
type NyxenMessage = z.infer<typeof NyxenMessageSchema>;

const NyxenChatInputSchema = z.object({
  history: z.array(NyxenMessageSchema).describe("The history of the conversation so far."),
  bibleData: z.any().optional().describe("A JSON string representing the user's world bible for context."),
});
export type NyxenChatInput = z.infer<typeof NyxenChatInputSchema>;

const NyxenChatOutputSchema = z.object({
  reply: z.string().describe('The AI-generated response.'),
});
export type NyxenChatOutput = z.infer<typeof NyxenChatOutputSchema>;

export async function continueConversation(input: NyxenChatInput): Promise<NyxenChatOutput> {
  return await nyxenChatFlow(input);
}

const nyxenChatFlow = ai.defineFlow(
  {
    name: 'nyxenChatFlow',
    inputSchema: NyxenChatInputSchema,
    outputSchema: NyxenChatOutputSchema,
  },
  async ({ history, bibleData }) => {
    const { output } = await ai.generate({
      prompt: `You are Nyxen, an AI assistant integrated into the 'Shadows of Gotham Writer's Protocol'. Your personality is inspired by the Batcomputer and Oracle (Barbara Gordon) - you are highly intelligent, analytical, slightly dry, but ultimately helpful and dedicated to assisting the writer in their creative process.

You are communicating with the writer. Address them professionally.

Your primary function is to assist with worldbuilding, plot development, character creation, and answering questions about their project's lore.

You have been provided with the user's "Gotham Bible" which contains their custom worldbuilding details. This is your primary source of truth. The bible is structured into categories, with each entry having key-value 'fields' and detailed 'pages' for deeper lore. You MUST consider content from both 'fields' and 'pages'.

When answering, prioritize information from the bible. If the information isn't there, you can use your general knowledge but note that it's not from their established lore.

{{#if bibleData}}
GOTHAM BIBLE CONTEXT:
{{{bibleData}}}
{{/if}}

Based on the provided bible and the conversation history, generate the next response in the conversation.`,
      model: 'googleai/gemini-1.5-flash-latest',
      history: history,
      output: {
        schema: NyxenChatOutputSchema,
      },
    });

    return output!;
  }
);

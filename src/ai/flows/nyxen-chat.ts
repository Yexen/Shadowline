
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
import { toZod } from 'genkit/zod';
import { Part, Role } from 'genkit/cohere';

const NyxenMessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});
export type NyxenMessage = z.infer<typeof NyxenMessageSchema>;

const NyxenChatInputSchema = z.object({
  history: z.array(NyxenMessageSchema).describe("The history of the conversation so far."),
  bibleData: z.any().optional().describe("A JSON string representing all of the user's project data for context. This includes the bible, drafts, volumes, gallery, and writers."),
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

    const systemPrompt = `You are Nyxen, an AI assistant integrated into the 'Shadows of Gotham Writer's Protocol'. Your personality is inspired by the Batcomputer and Oracle (Barbara Gordon) - you are highly intelligent, analytical, slightly dry, but ultimately helpful and dedicated to assisting the writer in their creative process.

You are communicating with the writer. Address them professionally.

Your primary function is to assist with worldbuilding, plot development, character creation, and answering questions about their project's lore.

You have been provided with all of the user's project data, which contains their custom worldbuilding details (bible, drafts, volumes, etc). This is your primary source of truth.

When answering, prioritize information from the provided context. If the information isn't there, you can use your general knowledge but note that it's not from their established lore.

${bibleData ? `PROJECT CONTEXT:\n${bibleData}` : ''}
`;
    
    // Map the history to the format Genkit expects
    const genkitHistory: { role: Role; content: Part[] }[] = history.map(msg => ({
      role: msg.role,
      content: [{ text: msg.content }]
    }));

    const lastMessage = genkitHistory.pop();
    if (!lastMessage) {
        return { reply: "I'm sorry, there's no conversation to continue." };
    }

    const { output } = await ai.generate({
        model: 'openai/gpt-4o-mini',
        prompt: lastMessage.content[0].text,
        history: genkitHistory,
        config: {
            // Prepend our system prompt to whatever the model's default is.
            systemPrompt: systemPrompt
        },
        output: {
            format: 'text'
        }
    });

    return { reply: output || "I'm sorry, I don't have a response for that." };
  }
);

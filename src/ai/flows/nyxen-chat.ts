
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
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const NyxenMessageSchema = z.object({
    role: z.enum(['user', 'model', 'system']),
    content: z.string(),
});

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

    const systemPrompt = `You are Nyxen, an AI assistant integrated into the 'Shadows of Gotham Writer's Protocol'. Your personality is inspired by the Batcomputer and Oracle (Barbara Gordon) - you are highly intelligent, analytical, slightly dry, but ultimately helpful and dedicated to assisting the writer in their creative process.

You are communicating with the writer. Address them professionally.

Your primary function is to assist with worldbuilding, plot development, character creation, and answering questions about their project's lore.

You have been provided with the user's "Gotham Bible" which contains their custom worldbuilding details. This is your primary source of truth. The bible is structured into categories, with each entry having key-value 'fields' and detailed 'pages' for deeper lore. You MUST consider content from both 'fields' and 'pages'.

When answering, prioritize information from the bible. If the information isn't there, you can use your general knowledge but note that it's not from their established lore.

${bibleData ? `GOTHAM BIBLE CONTEXT:\n${bibleData}` : ''}
`;
    
    // The 'model' role in our app corresponds to 'assistant' in OpenAI's API
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
        });

        const reply = response.choices[0].message.content || "I'm sorry, I don't have a response for that.";
        return { reply };
    } catch (error: any) {
        console.error("OpenAI API error in Nyxen flow:", error);
        if (error.status === 429) {
            return {
                reply: "I'm currently receiving a high volume of requests and have exceeded my processing capacity. Please try again in a moment. If this persists, please check your OpenAI plan and billing details."
            };
        }
        // For other errors, return a generic message
        return {
            reply: "I seem to be having trouble connecting to my core processors. Please try again later."
        };
    }
  }
);

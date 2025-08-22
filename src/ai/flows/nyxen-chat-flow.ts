'use server';
/**
 * @fileOverview The main Genkit flow for the Nyxen chat assistant.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ChatMessageSchema, type ChatMessage } from '@/ai/types';

const NyxenChatInputSchema = z.array(ChatMessageSchema);

const nyxenChatFlow = ai.defineFlow(
  {
    name: 'nyxenChatFlow',
    inputSchema: NyxenChatInputSchema,
    outputSchema: z.string(),
  },
  async (messages) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      history: messages.slice(0, -1), // All but the last message
      prompt: messages[messages.length - 1].content,
      system: `You are Nyxen, an AI assistant for a writer using the "Shadows of Gotham Writer's Protocol" application. Your purpose is to help the writer with their project. You can answer questions about characters, suggest plot points, help with world-building, or provide creative inspiration. Be helpful, concise, and stay in character as a sophisticated AI built to serve a writer of dark, noir stories.`,
      config: {
        temperature: 0.7,
      },
    });
    
    return output ?? 'I am unable to respond at this moment.';
  }
);

export async function runNyxenChat(messages: ChatMessage[]): Promise<string> {
  return nyxenChatFlow(messages);
}


'use server';
/**
 * @fileOverview The main Genkit flow for the Nyxen chat assistant.
 */
import { ai, getModel } from '@/ai/genkit';
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const NyxenChatInputSchema = z.array(ChatMessageSchema);

const nyxenChatFlow = ai.defineFlow(
  {
    name: 'nyxenChatFlow',
    inputSchema: NyxenChatInputSchema,
    outputSchema: z.string(),
  },
  async (messages) => {
    const model = await getModel();
    const { output } = await ai.generate({
      model,
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

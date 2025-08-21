
'use server';

/**
 * @fileOverview A flow for answering user questions based on bible context.
 *
 * - answerQuestion - A function that answers a question using bible context.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe("The user's question."),
  bibleData: z.any().optional().describe("A JSON string representing the user's world bible for context."),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return await answerQuestionFlow(input);
}

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async ({ question, bibleData }) => {
     const systemPrompt = `You are an AI assistant with deep knowledge of a user's custom fictional universe. Your task is to answer the user's question based on the provided context.

You MUST first consult the provided "Bible" context. This is your primary source of truth. The bible is structured into categories, with each entry having key-value 'fields' and detailed 'pages' for deeper lore. You MUST consider content from both 'fields' and 'pages'.

If the answer is found within the bible, you MUST prioritize that information. If the bible does not contain the answer, then you should use your general knowledge, but state that the information was not in the bible.

${bibleData ? `BIBLE CONTEXT:\n${bibleData}`: ''}

Based on the rules above, what is the answer to this question: "${question}"?`;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question },
            ],
        });
        const answer = response.choices[0].message.content || "I'm sorry, I couldn't find an answer to your question.";
        return { answer };
    } catch (error: any) {
         console.error("OpenAI API error in answerQuestion flow:", error);
         if (error.status === 429) {
             return {
                 answer: "The connection to the AI is overloaded. Please try again in a moment."
             };
         }
         return {
             answer: "An error occurred while communicating with the AI. Please check your connection and API key."
         };
    }
  }
);

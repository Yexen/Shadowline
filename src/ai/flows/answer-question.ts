
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

const AnswerQuestionInputSchema = z.object({
  question: z.string().describe("The user's question."),
  bibleData: z.any().optional().describe("A JSON string representing all of the user's project data for context. This includes the bible, drafts, volumes, gallery, and writers."),
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
    
    const { output } = await ai.generate({
      prompt: `You are an AI assistant with deep knowledge of a user's custom fictional universe. Your task is to answer the user's question based on the provided context.

You MUST first consult the provided project context. This is your primary source of truth. It contains the "Bible", drafts, volumes, and other lore.

If the answer is found within the provided context, you MUST prioritize that information. If the context does not contain the answer, then you should use your general knowledge, but state that the information was not in the provided materials.

${bibleData ? `PROJECT CONTEXT:\n${bibleData}`: ''}

Based on the rules above, what is the answer to this question: "${question}"?`,
      model: 'gpt-4o',
      output: {
        schema: AnswerQuestionOutputSchema,
      }
    });

    return output || { answer: "I'm sorry, I couldn't find an answer to your question." };
  }
);

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
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are an AI assistant with deep knowledge of a user's custom fictional universe. Your task is to answer the user's question.

You should first consult the provided "Bible" context. If the answer is found within the bible, you should prioritize that information. If the bible does not contain the answer, then you should use your general knowledge.

{{#if bibleData}}
BIBLE CONTEXT:
{{{bibleData}}}
{{/if}}

USER'S QUESTION:
"{{{question}}}"

Based on the rules above, what is the answer? Your output must be a JSON object with a single key "answer".`,
      model: 'googleai/gemini-1.5-flash-latest',
      output: {
        schema: AnswerQuestionOutputSchema,
        format: 'json',
      },
    });
    return output!;
  }
);

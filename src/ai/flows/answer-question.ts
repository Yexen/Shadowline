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
  question: z.string().describe('The user\'s question.'),
  bibleData: z.string().optional().describe("A JSON string representing the user's world bible for context."),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: {schema: AnswerQuestionInputSchema},
  output: {schema: AnswerQuestionOutputSchema},
  prompt: `You are an AI assistant with deep knowledge of a user's custom fictional universe. Your task is to answer the user's question based *only* on the provided "Bible" context.

If the answer is in the bible, provide it directly. If the answer cannot be found in the bible, state that the information is not available in the provided context.

{{#if bibleData}}
BIBLE CONTEXT:
{{{bibleData}}}
{{/if}}

USER'S QUESTION:
"{{{question}}}"

Based on the bible, what is the answer?`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

'use server';
/**
 * @fileOverview The Oracle AI flow for answering questions about a given text.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OracleInputSchema = z.object({
  question: z.string().describe('The user\'s question about the text.'),
  context: z.string().describe('The text content to analyze.'),
});

export type OracleInput = z.infer<typeof OracleInputSchema>;

const askOracleFlow = ai.defineFlow(
  {
    name: 'askOracleFlow',
    inputSchema: OracleInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `You are the Oracle, an AI assistant for a writer. Your task is to answer questions about the provided text. The writer may have selected a specific portion of their draft or provided the entire document. Analyze the context and answer the user's question concisely and insightfully.

Context Text:
"""
${input.context}
"""

User's Question: "${input.question}"

Your Answer:
`,
        config: {
            temperature: 0.5,
        },
    });
    
    return output ?? 'The Oracle is silent. No answer could be generated.';
  }
);

export async function askOracle(input: OracleInput): Promise<string> {
    return askOracleFlow(input);
}

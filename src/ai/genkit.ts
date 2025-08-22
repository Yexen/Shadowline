'use server';
/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 * It sets up the AI provider and exports the necessary objects for use in flows.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { openai } from 'genkit/openai';
import { useAiProvider } from '@/hooks/use-ai-provider';

// Statically initialize Genkit with all possible plugins.
// The actual model used will be determined in each flow.
export const ai = genkit({
  plugins: [
    googleAI(),
    openai({
      apiKey: process.env.OPENAI_API_KEY || useAiProvider.getState().openAiApiKey,
    })
  ],
});

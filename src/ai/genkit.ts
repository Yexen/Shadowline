/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 * It sets up the AI provider and exports the necessary objects for use in flows.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Statically initialize Genkit with all possible plugins.
// The actual model used will be determined in each flow.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

export const TEXT_MODEL = 'googleai/gemini-1.5-flash';

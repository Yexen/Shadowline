'use server';
/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 * It sets up the AI provider and exports the necessary objects for use in flows.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Statically initialize Genkit with the Google AI plugin.
// This ensures server-side flows have access without relying on client-side hooks.
export const ai = genkit({
  plugins: [googleAI()],
});

// Define the default model for consistency across flows.
const GEMINI_MODEL = 'googleai/gemini-1.5-flash';

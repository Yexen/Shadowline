
'use server';
/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 */
import { genkit } from 'genkit';
import { googleAI } from 'genkit/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // In a real app, you would likely use process.env.GEMINI_API_KEY
      // The Firebase Hosting backend is configured to use the Gemini API with a project-level API key.
      // Therefore, you do not need to specify an API key here.
    }),
  ],
});

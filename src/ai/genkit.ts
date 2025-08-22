
'use server';
/**
 * @fileOverview This file configures and initializes the Genkit AI instance.
 * It dynamically selects the AI provider (Google Gemini or OpenAI) based on
 * user settings.
 */
import { genkit, Model } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { useAiProvider } from '@/hooks/use-ai-provider';

// Define available models for type safety.
// Note: We use gpt-4o-mini as it is a cost-effective and capable model.
const GEMINI_MODEL = 'googleai/gemini-1.5-flash';

/**
 * The globally accessible AI configuration object.
 * Its initialization is deferred until a request is made, allowing it
 * to adapt to the user's chosen AI provider.
 */
export const ai = genkit({
  plugins: [
    // The googleAI and openAI plugins are configured dynamically
    // based on the user's selection stored in localStorage.
    // The specific initialization logic is handled within each flow
    // that calls the AI service.
  ],
});

/**
 * Gets the currently configured AI model based on user settings.
 * This function is called by individual flows to determine which
 * model to use for generation.
 * @returns {Model} The configured Genkit model object.
 */
export async function getModel(): Promise<Model> {
  const { provider, openAiApiKey } = useAiProvider.getState();

  // For now, we are defaulting to Google Gemini.
  genkit({
    plugins: [googleAI()]
  });
  return GEMINI_MODEL;
}

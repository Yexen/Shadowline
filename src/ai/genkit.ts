import {genkit, type ModelReference} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI, gpt4oMini} from '@genkit-ai/openai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

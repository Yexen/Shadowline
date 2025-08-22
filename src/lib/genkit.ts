
import { genkit } from 'genkit';
import { openai } from 'genkit/plugins/openai';
import { config } from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    openai({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  ],
  enableTracingAndMetrics: true,
});

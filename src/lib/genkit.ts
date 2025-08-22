
import {genkit} from 'genkit';
import {config} from 'dotenv';
import {googleAI} from '@genkit-ai/google-ai';

config();

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

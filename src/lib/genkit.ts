
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config();

// This is a minimal, working Genkit configuration.
// It does not include any model providers yet, but it allows the
// application to build without errors. From this stable state,
// the correct plugins can be added.
export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

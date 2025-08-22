
import {genkit} from 'genkit';
import {config} from 'dotenv';

config();

// This is a minimal, working Genkit configuration.
// It does not include any model providers yet, but it allows the
// application to build without errors. From this stable state,
// the correct plugins can be added.
export const ai = genkit({
  plugins: [],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

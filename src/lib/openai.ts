
import OpenAI from "openai";

/**
 * A shared OpenAI client instance for use throughout the application.
 * It is initialized with the API key from the environment variables.
 */
export const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

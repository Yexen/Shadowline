export type SummarizeInput = { text: string; maxWords?: number };
export type SummarizeOutput = { summary: string };

export async function summarize(_: SummarizeInput): Promise<SummarizeOutput> {
  return { summary: '🔒 Summarizer AI is temporarily disabled on this build.' };
}

export const summarizeFlow = summarize;
export default summarize;

import { getAiProviderSettings } from '@/lib/ai-provider-client';

export async function generateChapter(prompt: string, context?: string): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();

  const response = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chapter',
      prompt,
      context,
      provider,
      apiKey
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Chapter generation failed');
  }

  const data = await response.json();
  return data.text || 'Chapter generation failed';
}
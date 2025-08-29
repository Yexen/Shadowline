import { getAiProviderSettings } from '@/lib/ai-provider-client';

export async function generateImage(prompt: string): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();

  const response = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      mode: 'image',
      imagePrompt: prompt,
      provider,
      apiKey
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Image generation failed');
  }

  const data = await response.json();
  if (!data.url) {
    throw new Error('No image URL returned from API');
  }

  return data.url;
}

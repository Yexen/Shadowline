import { getAiProviderSettings } from '@/lib/ai-provider-client';

export async function summarizeTopic(text: string, length: 'short'|'medium'|'long' = 'short'): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();
  
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'summary', text, length, provider, apiKey }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'summarize failed');
  return String(j.summary || '');
}

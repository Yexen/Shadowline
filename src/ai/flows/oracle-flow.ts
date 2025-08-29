import { getAiProviderSettings } from '@/lib/ai-provider-client';

export async function askOracle(question: string): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();
  
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'oracle', question, provider, apiKey }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'oracle failed');
  return String(j.answer || '');
}


export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

import { getAiProviderSettings } from '@/lib/ai-provider-client';

export async function runOracleChat(history: ChatMsg[]): Promise<string> {
  const { provider, apiKey } = getAiProviderSettings();
  
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      system: 'You are The Oracle (Gotham). Be concise, helpful, a little mysterious.',
      history,
      provider,
      apiKey
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'oracle chat failed');
  return String(j.reply || '');
}


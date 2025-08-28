export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

export async function runOracleChat(history: ChatMsg[]): Promise<string> {
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      system: 'You are The Oracle (Gotham). Be concise, helpful, a little mysterious.',
      history,
    }),
  });

  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'oracle chat failed');
  return String(j.reply || '');
}

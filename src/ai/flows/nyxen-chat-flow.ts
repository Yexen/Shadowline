export type ChatMsg = { role: 'system' | 'user' | 'assistant'; content: string };

export async function runNyxenChat(history: ChatMsg[]): Promise<string> {
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      system: 'You are Nyxen, a creative writing companion for Shadowline. Keep replies tight and practical.',
      history,
    }),
  });

  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'nyxen chat failed');
  return String(j.reply || '');
}



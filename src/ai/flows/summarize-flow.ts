export async function summarizeTopic(text: string, length: 'short'|'medium'|'long' = 'short'): Promise<string> {
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'summary', text, length }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'summarize failed');
  return String(j.summary || '');
}

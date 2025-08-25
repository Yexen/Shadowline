export async function askOracle(question: string): Promise<string> {
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'oracle', question }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'oracle failed');
  return String(j.answer || '');
}


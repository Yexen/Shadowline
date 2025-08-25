
export type BibleField = { label: string; value: string };

export async function suggestBibleFields(input: string): Promise<{ title?: string; fields: BibleField[] }> {
  const r = await fetch('/api/ai/simple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'bible', input }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'bible-fields failed');
  const fields = Array.isArray(j.fields) ? j.fields : [];
  const clean = fields
    .map((f: any) => ({ label: String(f.label || '').slice(0, 32), value: String(f.value || '') }))
    .filter((f: any) => f.label && f.value);
  return { title: j.title || undefined, fields: clean };
}

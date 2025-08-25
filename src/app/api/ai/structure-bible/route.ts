import { NextResponse } from 'next/server';

type Field = { label: string; value: string };
type BibleItem = { title: string; fields: Field[] };
type BibleCategory = { category: string; items: BibleItem[] };
type BibleDoc = BibleCategory[];

const SYS = `
You convert raw "world bible" text into strict JSON with this TypeScript type:

type Field = { label: string; value: string };
type BibleItem = { title: string; fields: Field[] };
type BibleCategory = { category: string; items: BibleItem[] };
type BibleDoc = BibleCategory[];

Rules:
- Output ONLY valid JSON, no comments, no trailing commas, no markdown fences.
- Choose sensible categories (Characters, Locations, Organizations, Artifacts, Lore, Timeline, Technology, Misc).
- Each item MUST have a 'title' and a 'fields' array of label/value pairs.
- Merge repeated facts into fields (e.g., "Aliases", "Affiliations", "Description", "Notes").
- Keep it concise but complete; no hallucinations.
`;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    // If text is huge, truncate per-call; client can chunk if needed.
    const MAX_CHARS = 20000;
    const chunk = text.slice(0, MAX_CHARS);

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYS },
          { role: 'user', content: chunk }
        ]
      }),
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ error: await r.text() }, { status: 500 });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content;
    let parsed: BibleDoc;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Model did not return valid JSON' }, { status: 500 });
    }

    return NextResponse.json({ doc: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI structuring error' }, { status: 500 });
  }
}

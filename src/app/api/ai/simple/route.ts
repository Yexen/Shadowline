// src/app/api/ai/simple/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'default-no-store';
export const runtime = 'nodejs';

type Msg = { role: 'system'|'user'|'assistant'; content: string };

async function openaiJSON(messages: Msg[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages,
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OpenAI ${r.status}: ${t}`);
  }

  const data = await r.json();
  const raw = data?.choices?.[0]?.message?.content ?? '{}';
  try { return JSON.parse(raw); }
  catch { return {}; }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mode = String(body.mode || 'oracle') as
      | 'oracle' | 'bible' | 'summary' | 'chat' | 'scene' | 'image';

    let messages: Msg[] = [];

    if (mode === 'oracle') {
      const q = String(body.question || '');
      messages = [
        { role: 'system', content: `You are "The Oracle" of Gotham. Reply concisely.
Return a JSON object: {"answer": string}` },
        { role: 'user', content: q },
      ];
    }

    if (mode === 'bible') {
      const input = String(body.input || '');
      messages = [
        { role: 'system', content:
          `You extract structured fields for a fictional world "Bible".
Return JSON: {"title": string, "fields": [{"label": string, "value": string}, ...]}
Only include 3-8 fields; keep labels short (max 3 words).`
        },
        { role: 'user', content: input },
      ];
    }

    if (mode === 'summary') {
      const text = String(body.text || '');
      const length = String(body.length || 'short'); // 'short'|'medium'|'long'
      messages = [
        { role: 'system', content:
          `Summarize the user's text. Output JSON: {"summary": string}.
Style = ${length}.` },
        { role: 'user', content: text },
      ];
    }

    if (mode === 'chat') {
      const sys = String(body.system || 'Helpful dev assistant for a Next.js/TS app.');
      const history = Array.isArray(body.history) ? body.history as Msg[] : [];
      messages = [{ role: 'system', content: `${sys}\nReturn JSON: {"reply": string}` }, ...history];
    }

    if (mode === 'scene') {
      const desc = String(body.description || '');
      messages = [
        { role: 'system', content:
          `Write a short scene (<= 400 words). Return JSON: {"scene": string}` },
        { role: 'user', content: desc },
      ];
    }

    if (mode === 'image') {
      const topic = String(body.topic || '');
      messages = [
        { role: 'system', content:
          `Suggest 3 vivid image prompts for a generative model.
Return JSON: {"prompts": [string, string, string]}` },
        { role: 'user', content: topic },
      ];
    }

    const json = await openaiJSON(messages);
    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}

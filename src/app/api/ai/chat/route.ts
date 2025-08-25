import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a helpful coding assistant for a writing app called Shadowline. Keep answers short and practical. If asked to create code, output minimal, working TypeScript/TSX.' },
          ...(Array.isArray(messages) ? messages : []),
        ],
      }),
      cache: 'no-store',
    });

    if (!r.ok) {
      const errTxt = await r.text();
      return NextResponse.json({ error: errTxt || 'OpenAI error' }, { status: 500 });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { prompt, targetPath } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const sys = `You are an expert Next.js/TypeScript engineer.
Given a prompt, output clean code for a SINGLE file that belongs at targetPath.
Only output raw code, no backticks, no explanations.`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: `targetPath: ${targetPath}\n\n${prompt}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!r.ok) return NextResponse.json({ error: await r.text() }, { status: 500 });

    const data = await r.json();
    const code = data.choices?.[0]?.message?.content ?? '';
    return NextResponse.json({ code });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}

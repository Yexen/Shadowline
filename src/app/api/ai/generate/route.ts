import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { prompt, targetPath } = await req.json();

  const sys = `You are an expert Next.js/TypeScript engineer.
Given a prompt, output clean code for a SINGLE file that belongs at targetPath.
Only output raw code, no backticks, no explanations.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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

  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 500 });
  }
  const data = await res.json();
  const code = data.choices?.[0]?.message?.content ?? '';

  return NextResponse.json({ code });
}

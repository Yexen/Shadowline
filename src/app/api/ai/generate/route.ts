import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, targetPath, mode } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    // Two behaviors:
    // - mode === 'multi' -> return JSON array: [{ path, content }]
    // - otherwise -> return single file code string
    const system =
      mode === 'multi'
        ? `You are an expert Next.js/TypeScript engineer.
Given a prompt, output ONLY a valid JSON array of objects like:
[
  { "path": "src/components/Foo.tsx", "content": "<TSX CODE HERE>" },
  { "path": "src/app/about/page.tsx", "content": "<TSX CODE HERE>" }
]
Do not include backticks, comments, or extra text.`
        : `You are an expert Next.js/TypeScript engineer.
Given a prompt and targetPath, output ONLY the raw file content for that SINGLE file.
No backticks. No explanations.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content:
              mode === 'multi'
                ? `Prompt:\n${prompt}\n\nNote: Prefer placing pages under src/app/ and components under src/components/.`
                : `targetPath: ${targetPath}\n\n${prompt}`,
          },
        ],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data?.error?.message || 'AI error' }, { status: 500 });
    }

    const raw = data.choices?.[0]?.message?.content ?? '';

    if (mode === 'multi') {
      // Expect strict JSON array, no code fences
      let files: { path: string; content: string }[] = [];
      try {
        files = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          { error: 'AI did not return valid JSON array', raw },
          { status: 500 }
        );
      }
      return NextResponse.json({ files });
    }

    // single-file: strip accidental ``` fences if any
    const code = raw.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '');
    return NextResponse.json({ code });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'AI error' }, { status: 500 });
  }
}


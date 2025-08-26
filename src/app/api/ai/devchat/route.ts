
import { NextResponse } from 'next/server';
import { RULES } from '@/lib/pathPolicy';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const system = [
      'You are an expert Next.js + TypeScript assistant.',
      'Return a JSON object ONLY with keys: summary, reasoning, files, ops.',
      'Each op is one of:',
      '- { "type":"write",  "path":"...", "content":"...", "message":"..."}',
      '- { "type":"mkdir",  "path":"...", "message":"..."}',
      '- { "type":"delete", "path":"...", "message":"..."}',
      'Path policy (hard rules):',
      `- Pages go under "${RULES.pagesPrefix}<route>/page.tsx"`,
      `- Components go under "${RULES.componentsPrefix}<Name>.tsx"`,
      `- Static assets go under "${RULES.publicPrefix}"`,
      'Never write outside these prefixes.',
      'If user gives a bare route (e.g. "about"), convert to pages path automatically.',
      'If a file uses React hooks, add "use client"; otherwise omit it.',
      'For new page files, export default React component.',
      'Respond with RAW JSON only (no markdown, no code fences).',
    ].join('\n');

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          ...messages,
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';
    // content should already be JSON
    let plan: any;
    try {
      plan = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 });
    }

    // small explainer text for UI
    const explainer = `Plan prepared: ${plan?.files?.length || 0} files, ${plan?.ops?.length || 0} ops.`;
    return NextResponse.json({ plan, explainer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'devchat error' }, { status: 500 });
  }
}

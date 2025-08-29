import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const { message, context } = await req.json();
  if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 });

  // Always fetch the tree first so the model knows the project
  const treeRes = await fetch(new URL('/api/repo/tree', req.url), { cache: 'no-store' });
  const treeJson = await treeRes.json();
  const files: string[] = Array.isArray(treeJson?.files) ? treeJson.files : [];
  const head = files.slice(0, 500).join('\n');

  const system = [
    `You are Batcomputer, a Next.js repo assistant.`,
    `You ALWAYS read the repository tree before answering.`,
    `Propose precise diffs (path + unified patch) and short reasoning.`,
    `When asked to apply, return JSON: {"changes":[{"path":"...","patch":"---\\n+++\\n..."}]}.`,
  ].join('\n');

  const repoCtx = [
    `--- REPO TREE (first 500) ---`,
    head || '(empty)',
    `--- CURRENT FILE ---`,
    context?.openPath ? `${context.openPath}\n\n${context.openContent ?? ''}` : '(none)',
  ].join('\n');

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' }, { status: 503 });
  }

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: `${message}\n\n${repoCtx}` },
      ],
    }),
  });

  if (!r.ok) {
    const err = await r.text().catch(() => '');
    return NextResponse.json({ error: `OpenAI ${r.status}: ${err}` }, { status: 500 });
  }

  const json = await r.json();
  const reply = json?.choices?.[0]?.message?.content ?? '(no reply)';
  return NextResponse.json({ reply, saw: files.length });
}

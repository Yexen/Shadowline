import { NextResponse } from 'next/server';
import { list, readFile } from '@/lib/github';

type Plan = {
  targetPath: string;              // e.g. "src/components/Cover.tsx"
  action: 'create' | 'edit';
  reason: string;                  // short explanation
  relatedFiles?: string[];         // files to consider if editing
};

async function snapshotRepo() {
  // very light repo snapshot (only the folders we care about, depth 1)
  const roots = ['src/app', 'src/components', 'src/hooks', 'src/lib', 'public'];
  const out: Record<string, string[]> = {};
  for (const root of roots) {
    try {
      const items = await list(root);
      out[root] = items.map(i => i.name);
    } catch {
      out[root] = [];
    }
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const repo = await snapshotRepo();

    const sys = `You are a Next.js 15 (App Router) architect.
Given the user's prompt and a shallow repo snapshot, decide the SINGLE best file path to create or edit.
Prefer:
- pages under src/app/<route>/page.tsx
- UI components under src/components/*
- utilities under src/lib/*
- assets under public/*
Return STRICT JSON only.`;

    const user = [
      `User prompt:\n${prompt}`,
      `\nRepo snapshot (depth 1):\n${JSON.stringify(repo, null, 2)}`,
      `\nOutput JSON with keys: targetPath, action ("create"|"edit"), reason, relatedFiles (optional array).`,
      `Do not wrap in backticks. Output JSON only.`,
    ].join('\n');

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
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }, // ask for strict JSON
      }),
    });

    if (!r.ok) {
      return NextResponse.json({ error: await r.text() }, { status: 500 });
    }

    const data = await r.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const plan: Plan = JSON.parse(raw);

    // (Optional) if action = edit, try to fetch current file for extra context
    let currentContent: string | null = null;
    if (plan.action === 'edit') {
      try {
        currentContent = await readFile(plan.targetPath);
      } catch { /* ignore */ }
    }

    return NextResponse.json({ plan, currentContent });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Plan error' }, { status: 500 });
  }
}

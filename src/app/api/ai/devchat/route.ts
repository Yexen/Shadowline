// src/app/api/ai/devchat/route.ts
import { NextResponse } from 'next/server';

type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string };
type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

type Plan = {
  summary: string;
  reasoning?: string;
  files?: string[];
  ops: Op[];
};

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function onlySafePath(p: string) {
  // Restrict where the AI can touch
  return /^src\/|^public\//.test(p);
}

export async function POST(req: Request) {
  // simple server-side lock: require x-dev-key to match NEXT_PUBLIC_DEV_CONSOLE_KEY
  const key = req.headers.get('x-dev-key') || '';
  if (!process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || key !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
    return unauthorized();
  }

  const { messages } = await req.json() as { messages: ChatMsg[] };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
  }

  // System prompt + JSON schema for the plan
  const sys = `
You are an expert Next.js/TypeScript code assistant for a repo that only allows edits under:
- src/
- public/

Given the conversation, propose a minimal plan as STRICT JSON with this TypeScript type:

type Op =
  | { type: "write"; path: string; content: string; message?: string }
  | { type: "mkdir"; path: string; message?: string }
  | { type: "delete"; path: string; message?: string };

type Plan = {
  summary: string;
  reasoning?: string;
  files?: string[];
  ops: Op[];
};

Rules:
- Output ONLY JSON. No backticks, no prose.
- Use paths only under src/ or public/.
- Prefer small, isolated changes.
- For "write", the "content" must be complete file content.
- If the user asks for a page, use App Router conventions (e.g., src/app/about/page.tsx).
- If unsure, create a tiny placeholder component and mention TODOs in comments.
`;

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
        { role: 'system', content: sys },
        ...(messages || []),
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const data = await r.json();
  if (!r.ok) {
    return NextResponse.json({ error: data?.error?.message || 'OpenAI error' }, { status: 500 });
  }

  let plan: Plan | null = null;
  try {
    plan = JSON.parse(data.choices?.[0]?.message?.content || '{}') as Plan;
  } catch {
    return NextResponse.json({ error: 'AI did not return valid JSON.' }, { status: 500 });
  }

  // sanitize/validate
  if (!plan || !Array.isArray(plan.ops)) {
    return NextResponse.json({ error: 'Malformed plan from AI.' }, { status: 500 });
  }
  plan.ops = plan.ops.filter((op) => {
    if (op.type === 'write' || op.type === 'mkdir' || op.type === 'delete') {
      return typeof (op as any).path === 'string' && onlySafePath((op as any).path);
    }
    return false;
  });

  // friendly explainer for the UI chat stream
  const explainer =
    `Plan ready. ${plan.ops.length} change${plan.ops.length === 1 ? '' : 's'}:\n` +
    (plan.files?.length ? `Files: ${plan.files.join(', ')}` : '');

  return NextResponse.json({ plan, explainer });
}


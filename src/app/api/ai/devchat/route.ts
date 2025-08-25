import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // avoid edge for larger JSON

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

const SYSTEM_PROMPT = `
You are an expert Next.js/TypeScript engineer acting as a *planner*.
Given the chat history, propose a minimal, safe change set to the repo.

Return ONLY a JSON object with:
{
  "plan": {
    "summary": "one-paragraph explanation (plain text)",
    "reasoning": "brief optional notes",
    "files": ["list of affected file paths"],
    "ops": [
      // operations to apply
      { "type":"mkdir",  "path":"src/components" },
      { "type":"write",  "path":"src/components/Hero.tsx", "content":"<TSX CODE>", "message":"feat: add hero" },
      { "type":"delete", "path":"src/old/Dead.tsx", "message":"chore: remove dead code" }
    ]
  }
}

Rules:
- Prefer *editing/creating specific files* under 'src/' and 'public/'.
- Do NOT modify environment files.
- Keep ops minimal but complete.
- For TSX/TS/JSON, return the full file content (no backticks).
- For small binary assets, skip; ask user to upload separately.
- If uncertain, include TODO comments in content instead of guessing secrets.
`;

function isAllowed(key?: string) {
  const lock = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY;
  if (!lock) return true; // unlocked if no key set
  return key === lock;
}

export async function POST(req: Request) {
  try {
    const key = req.headers.get('x-dev-key') || '';
    if (!isAllowed(key)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const { messages } = await req.json();
    const userMsgs = (messages || []).map((m: any) => ({ role: m.role, content: m.content }));

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...userMsgs,
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data?.error?.message || 'AI error' }, { status: 500 });
    }

    // Expect a JSON object with { plan: { ... } }
    let parsed: any;
    try {
      parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    } catch {
      return NextResponse.json({ error: 'AI did not return valid JSON' }, { status: 500 });
    }

    if (!parsed?.plan?.ops) {
      return NextResponse.json({ error: 'No plan.ops returned' }, { status: 500 });
    }

    // short explainer for chat stream
    const explainer =
      'Plan prepared:\n- ' +
      (parsed.plan.files?.join('\n- ') || 'no files listed') +
      '\nReview and click Apply to commit to GitHub.';

    return NextResponse.json({ plan: parsed.plan, explainer });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'devchat error' }, { status: 500 });
  }
}

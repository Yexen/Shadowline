'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;              // number, not a function
export const fetchCache = 'default-no-store';


import { useEffect, useRef, useState } from 'react';

// ------------ Types ------------
type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string };
type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };

type PlanResponse = {
  summary: string;
  reasoning?: string;
  files?: string[];
  ops: Op[];
};

// ------------ Gate (reads ?key only on client) ------------
function useGate() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    // run only on client
    if (typeof window === 'undefined') return;
    const want = new URLSearchParams(window.location.search).get('key');
    const have = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
    setOk(Boolean(have) && want === have);
    if (!have) console.warn('NEXT_PUBLIC_DEV_CONSOLE_KEY not set');
  }, []);

  return ok;
}

// ------------ Tiny API helper ------------
async function api(path: string, body: any, key?: string) {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-dev-key': key } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `API ${path} failed`);
  return json;
}

export default function DevStudio() {
  const gateOk = useGate();

  // read ?key only on client
  const [devKey, setDevKey] = useState('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDevKey(new URLSearchParams(window.location.search).get('key') || '');
  }, []);

  // chat + plan state
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'system',
      content:
        'You are an AI code assistant for a Next.js + TypeScript repo. When the user asks for a change, propose a minimal plan and return a JSON with file operations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [applyLog, setApplyLog] = useState<string>('');

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo(0, 9e9);
  }, [applyLog]);

  async function ask() {
    const msg = input.trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    setThinking(true);
    try {
      const payload = { messages: [...messages, { role: 'user', content: msg }] };
      const res = await api('/api/ai/devchat', payload, devKey);
      setPlan(res.plan as PlanResponse);
      setMessages(m => [
        ...m,
        { role: 'assistant', content: res.explainer || 'I prepared a plan. Review and Apply when ready.' },
      ]);
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ ' + (e?.message || 'AI error') }]);
    } finally {
      setThinking(false);
    }
  }

  async function applyOps() {
    if (!plan?.ops?.length) return;
    setApplyLog('Applying changes…\n');
    try {
      const res = await api('/api/repo/apply', { ops: plan.ops }, devKey);
      setApplyLog(s => s + (res?.log || 'Committed changes.\n'));
      if (res?.deployTriggered) {
        setApplyLog(s => s + '\nTriggered Vercel deploy hook.');
      }
    } catch (e: any) {
      setApplyLog(s => s + '\n❌ ' + (e?.message || 'apply failed'));
    }
  }

  if (!gateOk) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Dev Studio Locked</h1>
        <p className="opacity-70 mt-2">
          Open with <code>/dev/console/studio?key=YOUR_KEY</code> and set <code>NEXT_PUBLIC_DEV_CONSOLE_KEY</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 grid gap-6">
      <h1 className="text-2xl font-bold">AI Dev Studio</h1>

      {/* Chat */}
      <section className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
        <div className="space-y-2 max-h-[320px] overflow-auto">
          {messages
            .filter(m => m.role !== 'system')
            .map((m, i) => (
              <div key={i} className="text-sm">
                <span className="opacity-60">{m.role === 'user' ? 'You' : 'AI'}:</span>{' '}
                <span>{m.content}</span>
              </div>
            ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            className="border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Create a new /about page with dark hero and add a Card component…"
            onKeyDown={e => e.key === 'Enter' && ask()}
          />
          <button
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={thinking}
            onClick={ask}
          >
            {thinking ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </section>

      {/* Plan + Ops */}
      <section className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
        <h2 className="font-semibold">Plan</h2>
        {!plan ? (
          <p className="opacity-70 text-sm">Ask for a change. The AI will propose files and operations.</p>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{plan.summary}</p>

            {plan.reasoning && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm opacity-80">More details</summary>
                <pre className="text-xs opacity-80 whitespace-pre-wrap mt-1">{plan.reasoning}</pre>
              </details>
            )}

            {plan.files?.length ? (
              <div className="mt-3">
                <h3 className="font-semibold text-sm">Files:</h3>
                <ul className="text-sm list-disc pl-5">
                  {plan.files.map(f => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-3">
              <h3 className="font-semibold text-sm">Operations:</h3>
              {!plan.ops.length ? (
                <p className="opacity-70 text-sm">No ops proposed.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {plan.ops.map((op, i) => (
                    <li key={i} className="rounded border border-neutral-800 p-2">
                      <code className="text-xs">{JSON.stringify(op, null, 2)}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-2 rounded bg-black text-white"
                disabled={!plan.ops.length}
                onClick={applyOps}
              >
                Apply {plan.ops.length} change{plan.ops.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        )}
      </section>

      {/* Apply log */}
      <section className="rounded border border-neutral-800 bg-neutral-950/60 p-3">
        <h2 className="font-semibold">Apply Log</h2>
        <div
          ref={logRef}
          className="border border-neutral-800 rounded p-3 min-h-[120px] max-h-[240px] overflow-auto whitespace-pre-wrap font-mono text-xs bg-neutral-950 text-neutral-100"
        >
          {applyLog || '—'}
        </div>
      </section>
    </main>
  );
}

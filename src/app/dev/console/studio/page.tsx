'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* ---------- types ---------- */
type ChatMsg = { role: 'user'|'assistant'|'system'; content: string };
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

/* ---------- helpers ---------- */
async function api(path: string, body?: any) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || `API ${path} failed`);
  return j;
}

async function ls(path = ''): Promise<{name:string; type:'file'|'dir'}[]> {
  const j = await api('/api/repo/ls', { path });
  return j.items || [];
}
async function cat(path: string): Promise<string|null> {
  const j = await api('/api/repo/read', { path });
  return j.content ?? null;
}

/* ---------- gate ---------- */
function useGate() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const want = new URLSearchParams(window.location.search).get('key');
    const have = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
    setOk(Boolean(have) && want === have);
    if (!have) console.warn('NEXT_PUBLIC_DEV_CONSOLE_KEY not set');
  }, []);
  return ok;
}

/* ---------- UI ---------- */
const pane = 'rounded border border-neutral-800 bg-neutral-950/60 backdrop-blur p-3';
const btn = 'px-3 py-2 rounded bg-black text-white hover:bg-neutral-800 disabled:opacity-50';
const btnGhost = 'px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900 disabled:opacity-50';
const input = 'border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800';

export default function Studio() {
  const gateOk = useGate();

  // Chat state
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [thinking, setThinking] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  // Apply log + undo
  const [applyLog, setApplyLog] = useState('');
  const commitsRef = useRef<string[]>([]);

  // Explorer state
  const [cwd, setCwd] = useState('');
  const [items, setItems] = useState<{name:string; type:'file'|'dir'}[]>([]);
  const [previewCode, setPreviewCode] = useState('');
  const [previewPath, setPreviewPath] = useState('');

  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo(0, 1e9); }, [applyLog]);

  useEffect(() => { refresh(''); }, []);
  async function refresh(dir: string) {
    try {
      const list = await ls(dir);
      setItems(list);
      setCwd(dir);
    } catch (e:any) {
      console.error(e);
    }
  }

  async function openNode(full: string, isDir: boolean) {
    if (isDir) return refresh(full);
    const txt = await cat(full);
    setPreviewPath(full);
    setPreviewCode(txt || '');
  }

  async function send() {
    const m = text.trim();
    if (!m) return;
    setText('');
    setMsgs((v)=>[...v, { role:'user', content: m }]);
    setThinking(true);
    try {
      const r = await api('/api/ai/devchat', { messages: msgs.concat({ role:'user', content:m }) });
      setPlan(r.plan);
      setMsgs((v)=>[...v, { role:'assistant', content: r.explainer || 'Plan ready.' }]);
    } catch (e:any) {
      setMsgs((v)=>[...v, { role:'assistant', content: '❌ ' + (e?.message || 'AI error') }]);
    } finally {
      setThinking(false);
    }
  }

  async function apply() {
    if (!plan?.ops?.length) return;
    setApplyLog('Applying changes…\n');
    try {
      const r = await api('/api/repo/apply', { ops: plan.ops });
      setApplyLog(s => s + (r.log || '') + '\n');
      commitsRef.current = r.commits || [];
      // refresh visible dir if a file we were viewing changed
      if (previewPath) {
        const parent = previewPath.split('/').slice(0,-1).join('/');
        refresh(parent);
      }
    } catch (e:any) {
      setApplyLog(s => s + '❌ ' + (e?.message || 'apply failed'));
    }
  }

  const routeHint = useMemo(() => {
    if (previewPath.startsWith('src/app/(main)/')) {
      const route = previewPath
        .replace(/^src\/app\/\(main\)\//,'')
        .replace(/\/page\.tsx$/,'')
        .replace(/\/index\.tsx$/,'');
      return `/${route || ''}`;
    }
    if (previewPath.startsWith('public/')) {
      return '/' + previewPath.replace(/^public\/+/,'');
    }
    return '';
  }, [previewPath]);

  if (!gateOk) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Dev Studio Locked</h1>
        <p className="opacity-70 mt-2">Open with <code>/dev/console/studio?key=YOUR_KEY</code>.</p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-[280px_1fr] gap-4 p-4 md:p-6">
      {/* Explorer */}
      <aside className="space-y-4">
        <div className={pane}>
          <h2 className="font-semibold mb-2">Explorer</h2>
          <div className="flex gap-2 mb-2">
            <button className={btnGhost} onClick={()=>refresh('')}>root</button>
            <button className={btnGhost} onClick={()=>refresh('src')}>src</button>
            <button className={btnGhost} onClick={()=>refresh('public')}>public</button>
          </div>
          <div className="text-xs opacity-70 mb-2 truncate">cwd: {cwd || '/'}</div>
          <div className="max-h-[50vh] overflow-auto rounded border border-neutral-800">
            {items.map(n=>{
              const isDir = n.type==='dir';
              return (
                <div
                  key={n.name}
                  className="flex items-center justify-between px-2 py-1 hover:bg-neutral-900 cursor-pointer"
                  onClick={()=>openNode(n.name, isDir)}
                  title={n.name}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-neutral-400">{isDir?'📁':'📄'}</span>
                    <span className="truncate">{n.name.split('/').slice(-1)[0]}</span>
                  </div>
                  <span className="text-xs opacity-50">{isDir?'dir':'file'}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={pane}>
          <h2 className="font-semibold mb-2">Preview</h2>
          <div className="text-xs opacity-70 mb-2 break-words">{previewPath || '—'}</div>
          {routeHint ? (
            <a href={routeHint} target="_blank" className="text-xs underline">
              Open {routeHint} ↗
            </a>
          ) : (
            <div className="text-xs opacity-60">Open route hint appears for pages/public files.</div>
          )}
          <pre className="mt-2 text-xs whitespace-pre-wrap bg-neutral-950 border border-neutral-800 rounded p-2 max-h-[220px] overflow-auto">
{previewCode || '—'}
          </pre>
        </div>
      </aside>

      {/* Right column */}
      <section className="grid grid-rows-[auto_auto_1fr] gap-4">
        {/* Chat */}
        <div className={pane}>
          <h2 className="font-semibold mb-2">Chat</h2>
          <div className="space-y-2 max-h-[220px] overflow-auto">
            {msgs.map((m,i)=>(
              <div key={i} className="text-sm">
                <span className="opacity-60">{m.role==='user'?'You':'AI'}:</span>{' '}
                <span>{m.content}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className={`${input} flex-1`}
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="Describe the change you want…"
              onKeyDown={e=>{ if (e.key==='Enter') send(); }}
            />
            <button className={btn} disabled={thinking} onClick={send}>{thinking?'Thinking…':'Send'}</button>
          </div>
        </div>

        {/* Plan */}
        <div className={pane}>
          <h2 className="font-semibold mb-2">Plan</h2>
          {!plan ? (
            <p className="text-sm opacity-70">Ask for a change. The AI will propose files & safe ops.</p>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{plan.summary}</p>
              {plan.reasoning && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm opacity-80">details</summary>
                  <pre className="text-xs opacity-80 whitespace-pre-wrap mt-1">{plan.reasoning}</pre>
                </details>
              )}
              {plan.files?.length ? (
                <div className="mt-3">
                  <h3 className="font-semibold text-sm">Files</h3>
                  <ul className="list-disc pl-5 text-sm">
                    {plan.files.map(f=><li key={f}>{f}</li>)}
                  </ul>
                </div>
              ):null}
              <div className="mt-3">
                <h3 className="font-semibold text-sm">Ops</h3>
                {!plan.ops.length ? (
                  <p className="text-sm opacity-70">No operations.</p>
                ) : (
                  <ul className="text-xs space-y-1">
                    {plan.ops.map((op,i)=>(
                      <li key={i} className="border border-neutral-800 rounded p-2">
                        <code>{JSON.stringify(op)}</code>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button className={btn} disabled={!plan.ops.length} onClick={apply}>Apply {plan.ops.length}</button>
                {/* TODO: Undo using commitsRef.current */}
                <button className={btnGhost} disabled={!commitsRef.current.length} onClick={()=>alert('Undo coming soon')}>
                  Undo (coming soon)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Apply log */}
        <div className={pane}>
          <h2 className="font-semibold mb-2">Apply Log</h2>
          <div ref={logRef} className="border border-neutral-800 rounded p-3 min-h-[120px] max-h-[240px] overflow-auto whitespace-pre-wrap font-mono text-xs bg-neutral-950 text-neutral-100">
            {applyLog || '—'}
          </div>
        </div>
      </section>
    </main>
  );
}


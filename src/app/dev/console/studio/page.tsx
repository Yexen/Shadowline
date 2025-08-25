'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* ---------------- Types ---------------- */
type ChatMsg = { role: 'user' | 'assistant'; content: string };

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

type UndoPayload = { ops: Op[] } | null;

type FsItem = { name: string; type: 'file' | 'dir' };

const pane = 'rounded border border-neutral-800 bg-neutral-950/60 backdrop-blur p-3';
const inputCls = 'border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800';
const btn = 'px-3 py-2 rounded bg-black text-white hover:bg-neutral-800 disabled:opacity-50';
const ghost = 'px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900 disabled:opacity-50';

/* ---------------- Helpers ---------------- */
function useDevKeyGate() {
  const [ok, setOk] = useState(false);
  const [devKey, setDevKey] = useState('');
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const want = new URLSearchParams(window.location.search).get('key') || '';
    const have = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
    setOk(Boolean(have) && want === have);
    setDevKey(want);
    if (!have) console.warn('NEXT_PUBLIC_DEV_CONSOLE_KEY not set');
  }, []);
  return { ok, devKey };
}

async function api<T = any>(path: string, body: any, key?: string): Promise<T> {
  const r = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-dev-key': key } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || `API ${path} failed`);
  return j as T;
}

async function repoLs(path = '', key?: string): Promise<FsItem[]> {
  const j = await api<{ items: FsItem[] }>('/api/repo/ls', { path }, key);
  return j.items || [];
}
async function repoRead(path: string, key?: string): Promise<string | null> {
  const j = await api<{ content: string | null }>('/api/repo/read', { path }, key);
  return j.content ?? null;
}

/* ---------------- File Explorer ---------------- */
function Explorer({
  devKey,
  onOpenFile,
}: {
  devKey: string;
  onOpenFile: (path: string, content: string | null) => void;
}) {
  const [cwd, setCwd] = useState<string>('');
  const [items, setItems] = useState<FsItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (dir: string) => {
    setLoading(true);
    try {
      const list = await repoLs(dir, devKey);
      // normalize names to show dir prefix
      const normalized = list.map((x) => ({
        name: dir ? `${dir}/${x.name.split('/').slice(-1)[0]}` : x.name.split('/').slice(-1)[0],
        type: x.type,
      }));
      // stable sort: dirs first
      normalized.sort((a, b) =>
        a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1,
      );
      setItems(normalized);
      setCwd(dir);
    } finally {
      setLoading(false);
    }
  }, [devKey]);

  useEffect(() => {
    load('src').catch(() => load('')); // prefer src; fall back to repo root
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function open(node: FsItem) {
    const full = node.name;
    if (node.type === 'dir') {
      await load(full);
    } else {
      const txt = await repoRead(full, devKey);
      onOpenFile(full, txt);
    }
  }

  return (
    <aside className={pane}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Explorer</h2>
        <div className="flex gap-2">
          <button className={ghost} onClick={() => load('')}>/</button>
          <button className={ghost} onClick={() => load('src')}>src</button>
          <button className={ghost} onClick={() => load('public')}>public</button>
        </div>
      </div>
      <div className="text-xs opacity-70 mb-2 truncate">cwd: {cwd || '/'}</div>
      <div className="max-h-[50vh] overflow-auto rounded border border-neutral-800">
        {loading ? (
          <div className="p-3 text-sm opacity-70">Loading…</div>
        ) : items.length ? (
          items.map((n) => (
            <div
              key={`${cwd}/${n.name}`}
              onClick={() => open(n)}
              className="flex items-center justify-between px-2 py-1 hover:bg-neutral-900 cursor-pointer"
              title={n.name}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-4 text-neutral-400">{n.type === 'dir' ? '📁' : '📄'}</span>
                <span className="truncate">{n.name.split('/').slice(-1)[0]}</span>
              </div>
              <span className="text-xs opacity-50">{n.type}</span>
            </div>
          ))
        ) : (
          <div className="p-3 text-sm opacity-70">(empty)</div>
        )}
      </div>
    </aside>
  );
}

/* ---------------- Main Page ---------------- */
export default function DevStudio() {
  const { ok, devKey } = useDevKeyGate();

  // Chat state
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  // Plan + apply/undo
  const [plan, setPlan] = useState<Plan | null>(null);
  const [applyLog, setApplyLog] = useState('');
  const [lastUndo, setLastUndo] = useState<UndoPayload>(null);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo(0, 9e9); }, [applyLog]);

  // File preview
  const [openedPath, setOpenedPath] = useState<string>('');
  const [openedText, setOpenedText] = useState<string>('');

  // Attachments
  const [uploadBusy, setUploadBusy] = useState(false);

  const appendMsg = (m: ChatMsg) => setMsgs((x) => [...x, m]);

  async function ask() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    appendMsg({ role: 'user', content: text });
    setThinking(true);
    try {
      const res = await api<{ plan: Plan; explainer: string }>('/api/ai/devchat', {
        messages: msgs.length ? msgs : [{ role: 'assistant', content: 'Ready.' }],
      }, devKey);
      setPlan(res.plan);
      appendMsg({ role: 'assistant', content: res.explainer || 'Plan prepared.' });
    } catch (e: any) {
      appendMsg({ role: 'assistant', content: '❌ ' + (e?.message || 'AI error') });
    } finally {
      setThinking(false);
    }
  }

  async function apply() {
    if (!plan?.ops?.length) return;
    setApplyLog('Applying changes…\n');
    try {
      const res = await api<{ ok: true; log: string; undo: UndoPayload; deployTriggered?: boolean }>(
        '/api/repo/apply',
        { ops: plan.ops },
        devKey,
      );
      setApplyLog((s) => s + (res.log || 'Committed.\n'));
      setLastUndo(res.undo || null);
      if (res.deployTriggered) setApplyLog((s) => s + '\nTriggered Vercel deploy hook.');
    } catch (e: any) {
      setApplyLog((s) => s + '\n❌ ' + (e?.message || 'apply failed'));
    }
  }

  async function undo() {
    if (!lastUndo?.ops?.length) return;
    setApplyLog((s) => s + '\nUndoing last change…\n');
    try {
      const res = await api<{ ok: true; log: string }>(
        '/api/repo/apply',
        { ops: lastUndo.ops },
        devKey,
      );
      setApplyLog((s) => s + (res.log || 'Undo committed.\n'));
      setLastUndo(null);
    } catch (e: any) {
      setApplyLog((s) => s + '\n❌ ' + (e?.message || 'undo failed'));
    }
  }

  function onOpenFile(path: string, content: string | null) {
    setOpenedPath(path);
    setOpenedText(content ?? '(binary or empty)');
  }

  // Upload to public/uploads/<timestamp>-<filename>
  async function onAttachFile(f: File) {
    const path = `public/uploads/${Date.now()}-${f.name.replace(/\s+/g, '_')}`;
    setUploadBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      // Prefer write-binary; fall back with error if not present
      const r = await fetch('/api/repo/write-binary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(devKey ? { 'x-dev-key': devKey } : {}),
        },
        body: JSON.stringify({
          path,
          content: Array.from(bytes),
          message: `asset: ${path}`,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'upload failed');
      appendMsg({
        role: 'assistant',
        content: `✅ Uploaded asset to **/${path.replace(/^public\//, '')}**.\nYou can reference it in code with \`/${path.replace(/^public\//, '')}\`.`,
      });
    } catch (e: any) {
      appendMsg({ role: 'assistant', content: '❌ upload error: ' + (e?.message || e) });
    } finally {
      setUploadBusy(false);
    }
  }

  // Shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'Enter') { e.preventDefault(); ask(); }
      if (meta && e.key.toLowerCase() === 's') { e.preventDefault(); apply(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, plan]);

  if (!ok) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Dev Studio Locked</h1>
        <p className="opacity-70 mt-2">
          Open with <code>?key=YOUR_KEY</code> and set <code>NEXT_PUBLIC_DEV_CONSOLE_KEY</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-[280px_1fr_360px] gap-4 p-4 md:p-6">
      {/* Explorer */}
      <Explorer devKey={devKey} onOpenFile={onOpenFile} />

      {/* Center: Chat + Preview + Console */}
      <section className="grid grid-rows-[auto_1fr_auto] gap-4">
        {/* Chat */}
        <div className={pane}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Chat</h2>
            <div className="flex gap-2 items-center">
              <label className={ghost + ' cursor-pointer'}>
                Attach
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onAttachFile(e.target.files[0])}
                  disabled={uploadBusy}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-[38vh] overflow-auto">
            {msgs.length === 0 && (
              <p className="text-sm opacity-70">
                Tell the AI what you want (e.g., “Add an About page and a Card component”).  
                It will propose a **plan** in the right panel.
              </p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="opacity-60">{m.role === 'user' ? 'You' : 'AI'}:</span>{' '}
                <span className="whitespace-pre-wrap">{m.content}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              className={inputCls + ' flex-1'}
              placeholder="Describe a change…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && ask()}
            />
            <button className={btn} onClick={ask} disabled={thinking}>
              {thinking ? 'Thinking…' : 'Ask'}
            </button>
          </div>
        </div>

        {/* Quick preview of opened file */}
        <div className={pane}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">File Preview</h2>
            <span className="text-xs opacity-70 truncate max-w-[60%]">{openedPath || '—'}</span>
          </div>
          <div className="rounded border border-neutral-800 overflow-auto min-h-[220px] max-h-[40vh]">
            <pre className="p-3 text-xs whitespace-pre-wrap">{openedText || 'Open a file from Explorer.'}</pre>
          </div>
        </div>

        {/* Console log */}
        <div className={pane}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Log</h2>
            <div className="flex gap-2">
              <button className={ghost} onClick={() => setApplyLog('')}>Clear</button>
            </div>
          </div>
          <div
            ref={logRef}
            className="border border-neutral-800 rounded p-3 min-h-[100px] max-h-[140px] overflow-auto whitespace-pre-wrap font-mono text-xs bg-neutral-950 text-neutral-100"
          >
            {applyLog || '—'}
          </div>
        </div>
      </section>

      {/* Right: Plan + Apply/Undo */}
      <aside className={pane}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">Plan</h2>
          <div className="flex gap-2">
            <button className={btn} onClick={apply} disabled={!plan?.ops?.length}>Apply</button>
            <button className={ghost} onClick={undo} disabled={!lastUndo}>Undo</button>
          </div>
        </div>

        {!plan ? (
          <p className="text-sm opacity-70">No plan yet. Ask the AI on the left.</p>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{plan.summary}</p>
            {plan.reasoning && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm opacity-80">Details</summary>
                <pre className="text-xs opacity-80 whitespace-pre-wrap mt-1">{plan.reasoning}</pre>
              </details>
            )}
            {!!plan.files?.length && (
              <div className="mt-3">
                <h3 className="font-semibold text-sm">Files</h3>
                <ul className="text-sm list-disc pl-5">
                  {plan.files.map((f) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-3">
              <h3 className="font-semibold text-sm">Operations</h3>
              {!plan.ops.length ? (
                <p className="opacity-70 text-sm">No ops proposed.</p>
              ) : (
                <ul className="text-xs space-y-2">
                  {plan.ops.map((op, i) => (
                    <li key={i} className="rounded border border-neutral-800 p-2">
                      <code className="whitespace-pre-wrap block">{JSON.stringify(op, null, 2)}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>
    </main>
  );
}

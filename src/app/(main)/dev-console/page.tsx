'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CodeBlock from '@/components/code-block';

// ------- tiny helpers -------
type Item = { name: string; type: 'file'|'dir' };
type ChatMsg = { role: 'user'|'assistant'|'system'; content: string };
type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };
type Plan = { summary?: string; files?: string[]; ops?: Op[]; explainer?: string };

async function api(path: string, body?: any, key?: string) {
  const r = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-dev-key': key } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `API ${path} failed`);
  return j;
}

const btn = 'px-3 py-2 rounded bg-black text-white hover:bg-neutral-800 disabled:opacity-50';
const ghost = 'px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900 disabled:opacity-50';
const input = 'border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800 text-sm';
const panel = 'rounded border border-neutral-800 bg-neutral-950/60 p-3';

// ------- gate (password) -------
function useGate() {
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const pubKey = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search).get('key') || '';
    const saved = localStorage.getItem('bat_console_ok') === '1';
    const match = Boolean(pubKey) && (q === pubKey || saved);
    setOk(match);
    setChecking(false);
  }, [pubKey]);

  function authenticate(entered: string) {
    const match = Boolean(pubKey) && entered === pubKey;
    if (match) localStorage.setItem('bat_console_ok', '1');
    setOk(match);
    return match;
  }
  return { ok, checking, authenticate, pubKey };
}

// ------- page -------
export default function DevConsolePage() {
  const { ok, checking, authenticate, pubKey } = useGate();

  // file explorer + editor
  const [cwd, setCwd] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [selFile, setSelFile] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  // chat
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'system', content: 'You are an AI code assistant for a Next.js + TypeScript repo. Prefer minimal diffs, list file paths explicitly, and output a plan with operations.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [plan, setPlan] = useState<Plan|null>(null);

  // terminal
  const [cmd, setCmd] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo(0, 1e9); }, [log]);

  const devKey = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const q = new URLSearchParams(window.location.search).get('key') || '';
    return q || pubKey || '';
  }, [pubKey]);

  // load root listing
  useEffect(() => {
    if (!ok) return;
    void refresh('');
  }, [ok]);

  async function refresh(dir: string) {
    setBusy(true);
    try {
      const j = await api('/api/repo/ls', { path: dir }, devKey);
      const arr: Item[] = (j.items || []).map((x: Item) => x);
      // Display `dir/foo` in name to keep selection simple
      const norm = arr.map(it => ({
        ...it,
        name: dir ? `${dir}/${it.name.replace(/^\/+/,'')}` : it.name.replace(/^\/+/,'')
      }));
      norm.sort((a,b) => a.type===b.type ? a.name.localeCompare(b.name) : a.type==='dir' ? -1 : 1);
      setItems(norm);
      setCwd(dir);
    } finally {
      setBusy(false);
    }
  }

  async function openPath(full: string, isDir: boolean) {
    if (isDir) return refresh(full);
    setBusy(true);
    try {
      const j = await api('/api/repo/read', { path: full }, devKey);
      setSelFile(full);
      setCode(j.content ?? '');
      setDirty(false);
      pushLog(`opened ${full}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveFile() {
    if (!selFile || !dirty) return;
    setBusy(true);
    try {
      await api('/api/repo/write', { path: selFile, content: code, message: `update ${selFile} (dev console)` }, devKey);
      setDirty(false);
      pushLog(`✓ saved ${selFile}`);
    } finally {
      setBusy(false);
    }
  }

  // --- chat to plan ---
  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput('');
    setMessages(m => [...m, { role: 'user', content: msg }]);
    try {
      const res = await api('/api/ai/devchat', { messages: [...messages, { role: 'user', content: msg }] }, devKey);
      setPlan(res.plan || null);
      setMessages(m => [...m, { role: 'assistant', content: res.explainer || 'Plan prepared. Review and Apply when ready.' }]);
    } catch (e:any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ ' + (e?.message || 'AI error') }]);
    }
  }

  async function applyPlan() {
    if (!plan?.ops?.length) return;
    pushLog(`applying ${plan.ops.length} change(s)…`);
    try {
      const res = await api('/api/repo/apply', { ops: plan.ops }, devKey);
      pushLog(res?.log || 'Committed.');
      if (res?.deployTriggered) pushLog('Triggered deploy hook.');
      // refresh tree if we touched files under current dir
      await refresh(cwd);
    } catch (e:any) {
      pushLog('❌ ' + (e?.message || 'apply failed'));
    }
  }

  // --- terminal (ls / cat / mkdir / rm) ---
  function pushLog(s: string) { setLog(l => [...l, s]); }
  async function runCmd() {
    const line = cmd.trim();
    if (!line) return;
    setCmd('');
    pushLog(`$ ${line}`);
    const [bin, ...rest] = line.split(/\s+/);
    try {
      if (bin === 'ls') {
        const dir = rest[0] || cwd || '';
        const j = await api('/api/repo/ls', { path: dir }, devKey);
        const out = (j.items || []).map((i:Item) => `${i.type==='dir' ? '[d]' : ' -'} ${dir ? `${dir}/` : ''}${i.name}`).join('\n');
        pushLog(out || '(empty)');
      } else if (bin === 'cat') {
        const p = rest.join(' ');
        const j = await api('/api/repo/read', { path: p }, devKey);
        pushLog(j.content ?? '(not found)');
      } else if (bin === 'mkdir') {
        const p = rest.join(' ');
        await api('/api/repo/mkdir', { path: p }, devKey);
        pushLog(`created ${p}/.gitkeep`);
        await refresh(cwd);
      } else if (bin === 'rm') {
        const p = rest.join(' ');
        await api('/api/repo/rm', { path: p }, devKey);
        pushLog(`removed ${p}`);
        if (p === selFile) { setSelFile(''); setCode(''); setDirty(false); }
        await refresh(cwd);
      } else if (bin === 'open') {
        const p = rest.join(' ');
        await openPath(p, false);
      } else {
        pushLog('commands: ls [dir], cat <path>, mkdir <path>, rm <path>, open <file>');
      }
    } catch (e:any) {
      pushLog('! ' + (e?.message || 'error'));
    }
  }

  // ------- UI -------
  if (checking) {
    return <main className="p-6 text-sm opacity-70">Loading…</main>;
  }
  if (!ok) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <div className={`${panel} text-center`}>
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="font-semibold">Authorization Required</h2>
          <p className="opacity-70 text-sm mb-4">Enter password to access Bat Computer Dev Console.</p>
          <PasswordForm onSubmit={(pw) => {
            if (!authenticate(pw)) alert('Invalid password.');
          }} />
        </div>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-[1fr_320px] gap-4 p-4 md:p-6">
      {/* left: chat/editor/terminal */}
      <section className="space-y-4">
        <Tabs defaultValue="chat" className={`${panel}`}>
          <TabsList>
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="term">Terminal</TabsTrigger>
          </TabsList>

          {/* Chat */}
          <TabsContent value="chat" className="mt-3 space-y-3">
            <div className="max-h-[280px] overflow-auto space-y-2">
              {messages.filter(m => m.role!=='system').map((m,i) => (
                <div key={i} className="text-sm">
                  <span className="opacity-60">{m.role==='user'?'You':'AI'}:</span>{' '}
                  <span className="whitespace-pre-wrap">{m.content}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                className={`${input} flex-1`}
                value={chatInput}
                onChange={(e)=>setChatInput(e.target.value)}
                placeholder="Describe the change you want…"
                onKeyDown={(e)=> e.key==='Enter' && sendChat()}
              />
              <button className={btn} onClick={sendChat}>Send</button>
            </div>

            <div className="rounded border border-neutral-800 p-2">
              <h3 className="font-medium text-sm mb-2">Plan</h3>
              {!plan ? (
                <p className="opacity-70 text-sm">Ask for a change to generate a plan.</p>
              ) : (
                <div className="space-y-2">
                  {plan.summary && <p className="text-sm whitespace-pre-wrap">{plan.summary}</p>}
                  {plan.files?.length ? (
                    <ul className="list-disc pl-5 text-sm">
                      {plan.files.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  ) : null}
                  {plan.ops?.length ? (
                    <>
                      <CodeBlock language="json" code={JSON.stringify(plan.ops, null, 2)} />
                      <button className={btn} onClick={applyPlan}>Apply {plan.ops.length} change(s)</button>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Editor */}
          <TabsContent value="editor" className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <input className={`${input} flex-1`} value={selFile} onChange={(e)=>setSelFile(e.target.value)} placeholder="Select or type a file path…" />
              <button className={ghost} onClick={saveFile} disabled={!dirty || !selFile || busy}>Save</button>
            </div>
            <textarea
              className={`${input} font-mono min-h-[340px]`}
              value={code}
              onChange={(e)=>{ setCode(e.target.value); setDirty(true); }}
              placeholder="// open a file from the tree or terminal to edit…"
            />
          </TabsContent>

          {/* Terminal */}
          <TabsContent value="term" className="mt-3 space-y-2">
            <div ref={logRef} className="border border-neutral-800 rounded p-3 min-h-[220px] max-h-[320px] overflow-auto whitespace-pre-wrap font-mono text-xs bg-neutral-950 text-neutral-100">
              {log.join('\n') || 'Bat Computer CLI v1.0. Type "ls", "cat <path>", "mkdir <path>", "rm <path>", "open <file>".'}
            </div>
            <div className="flex gap-2">
              <input className={`${input} font-mono flex-1`} value={cmd} onChange={(e)=>setCmd(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && runCmd()} placeholder="> Enter command…" />
              <button className={ghost} onClick={runCmd}>Run</button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* right: file explorer + live log */}
      <aside className="space-y-4">
        <div className={panel}>
          <h3 className="font-semibold mb-2 text-sm">File Explorer</h3>
          <div className="flex gap-2 mb-2">
            <button className={ghost} onClick={()=>refresh('')}>root</button>
            <button className={ghost} onClick={()=>refresh('src')}>src</button>
            <button className={ghost} onClick={()=>refresh('public')}>public</button>
          </div>
          <div className="max-h-[420px] overflow-auto text-sm">
            {busy ? <div className="opacity-70">Loading…</div> : (
              items.map(it => {
                const isDir = it.type === 'dir';
                const leaf = it.name.split('/').slice(-1)[0];
                return (
                  <div
                    key={it.name}
                    className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-900 cursor-pointer"
                    onClick={()=>openPath(it.name, isDir)}
                    title={it.name}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4">{isDir ? '📁' : '📄'}</span>
                      <span className="truncate">{leaf}</span>
                    </div>
                    <span className="text-[11px] opacity-50">{isDir ? 'dir' : 'file'}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={panel}>
          <h3 className="font-semibold mb-2 text-sm">Live Log</h3>
          <div className="text-xs font-mono whitespace-pre-wrap opacity-80">
            {log.slice(-12).join('\n') || '> System ready.'}
          </div>
        </div>
      </aside>
    </main>
  );
}

// ------- small password form -------
function PasswordForm({ onSubmit }: { onSubmit: (pw: string)=>void }) {
  const [pw, setPw] = useState('');
  return (
    <form
      onSubmit={(e)=>{ e.preventDefault(); onSubmit(pw); }}
      className="flex flex-col items-center gap-3"
    >
      <input
        type="password"
        className="border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800 w-full"
        value={pw}
        onChange={(e)=>setPw(e.target.value)}
        placeholder="••••••••"
      />
      <button className="px-3 py-2 rounded bg-black text-white hover:bg-neutral-800">Authenticate</button>
    </form>
  );
}

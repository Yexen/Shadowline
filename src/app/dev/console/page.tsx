'use client';

import { useEffect, useRef, useState } from 'react';

const gateOK = typeof window !== 'undefined'
  ? new URLSearchParams(window.location.search).get('key') === (process.env.NEXT_PUBLIC_DUMMY || '')
  : false;

export default function DevConsole() {
  const [prompt, setPrompt] = useState('');
  const [targetPath, setTargetPath] = useState('src/app/example/page.tsx');
  const [code, setCode] = useState('');
  const [cmd, setCmd] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logRef.current?.scrollTo(0, 1e9); }, [log]);

  function append(line: string) { setLog(l => [...l, line]); }

  async function generate() {
    append(`> ai: ${targetPath}`);
    const r = await fetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, targetPath }),
      headers: { 'Content-Type': 'application/json' },
    });
    const j = await r.json();
    if (r.ok) {
      setCode(j.code);
      append(`✓ generated ${targetPath} (${j.code?.length || 0} bytes)`);
    } else {
      append(`! ai error: ${j.error?.slice?.(0,200) || 'unknown'}`);
    }
  }

  async function save() {
    append(`> save ${targetPath}`);
    const r = await fetch('/api/repo/write', {
      method: 'POST',
      body: JSON.stringify({ path: targetPath, content: code, message: `update ${targetPath} (console)` }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (r.ok) append('✓ committed');
    else append('! commit failed');
  }

  // tiny “terminal”
  async function run() {
    const line = cmd.trim();
    setCmd('');
    if (!line) return;
    append(`$ ${line}`);

    const [bin, ...rest] = line.split(/\s+/);
    try {
      if (bin === 'ls') {
        const path = rest[0] || '';
        const r = await fetch('/api/repo/ls', { method: 'POST', body: JSON.stringify({ path }), headers: { 'Content-Type': 'application/json' }});
        const j = await r.json();
        append(j.items.map((i:any)=>`${i.type==='dir'?'[d]':' -'} ${i.name}`).join('\n') || '(empty)');
      } else if (bin === 'cat') {
        const path = rest.join(' ');
        const r = await fetch('/api/repo/read', { method: 'POST', body: JSON.stringify({ path }), headers: { 'Content-Type': 'application/json' }});
        const j = await r.json();
        append(j.content ?? '(not found)');
      } else if (bin === 'mkdir') {
        const path = rest.join(' ');
        await fetch('/api/repo/mkdir', { method: 'POST', body: JSON.stringify({ path }), headers: { 'Content-Type': 'application/json' }});
        append(`created ${path}/.gitkeep`);
      } else if (bin === 'rm') {
        const path = rest.join(' ');
        await fetch('/api/repo/rm', { method: 'POST', body: JSON.stringify({ path }), headers: { 'Content-Type': 'application/json' }});
        append(`removed ${path}`);
      } else {
        append('commands: ls [path], cat <path>, mkdir <path>, rm <path>');
      }
    } catch (e:any) {
      append(`! ${e.message || e}`);
    }
  }

  // simple client-side gate (optional)
  useEffect(() => {
    const want = new URLSearchParams(location.search).get('key');
    if (want !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
      alert('Dev Console locked. Append ?key=YOUR_KEY to URL or set NEXT_PUBLIC_DEV_CONSOLE_KEY');
    }
  }, []);

  return (
    <main className="max-w-5xl mx-auto p-6 grid gap-6">
      <h1 className="text-2xl font-bold">Dev Console</h1>

      <section className="grid gap-2">
        <label className="font-mono text-sm">target path</label>
        <input
          className="border rounded px-3 py-2 font-mono"
          value={targetPath}
          onChange={e=>setTargetPath(e.target.value)}
          placeholder="e.g. src/components/MyCard.tsx"
        />
        <label className="font-mono text-sm">prompt</label>
        <textarea
          className="border rounded px-3 py-2 min-h-[120px]"
          value={prompt}
          onChange={e=>setPrompt(e.target.value)}
          placeholder="Describe what you want…"
        />
        <div className="flex gap-2">
          <button onClick={generate} className="px-3 py-2 rounded bg-black text-white">Generate</button>
          <button onClick={save} className="px-3 py-2 rounded border">Save to GitHub</button>
        </div>
      </section>

      <section className="grid gap-2">
        <label className="font-mono text-sm">code</label>
        <textarea
          className="border rounded px-3 py-2 min-h-[240px] font-mono"
          value={code}
          onChange={e=>setCode(e.target.value)}
          placeholder="// AI output will appear here"
        />
      </section>

      <section className="grid gap-2">
        <label className="font-mono text-sm">terminal</label>
        <div ref={logRef} className="border rounded p-3 min-h-[160px] max-h-[220px] overflow-auto whitespace-pre-wrap font-mono text-sm bg-neutral-950 text-neutral-100">
          {log.join('\n')}
        </div>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 font-mono flex-1"
            value={cmd}
            onChange={e=>setCmd(e.target.value)}
            placeholder="ls src, cat src/app/page.tsx, mkdir public/covers, rm README.md"
            onKeyDown={(e)=>{ if (e.key==='Enter') run(); }}
          />
          <button onClick={run} className="px-3 py-2 rounded border">Run</button>
        </div>
      </section>
    </main>
  );
}

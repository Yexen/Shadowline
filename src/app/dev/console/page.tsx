
'use client';

import { useEffect, useRef, useState } from 'react';

const VERSION = 'Dev Console v2 — MOCK UI';

export default function DevConsole() {
  // gate check (client-only)
  useEffect(() => {
    const want = new URLSearchParams(location.search).get('key');
    if (want !== process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY) {
      alert('Console locked. Append ?key=YOUR_KEY');
    }
  }, []);

  const [prompt, setPrompt] = useState('');
  const [targetPath, setTargetPath] = useState('src/app/example/page.tsx');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  // mini “terminal”
  const [cmd, setCmd] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo(0, 9e9); }, [log]);
  const append = (s: string) => setLog(l => [...l, s]);

  async function generate() {
    setSaving(true);
    append(`> ai generate → ${targetPath}`);
    const r = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, targetPath }),
    });
    const j = await r.json();
    if (!r.ok || j.error) append('! ai error: ' + (j.error || 'unknown'));
    else {
      setCode(j.code || '');
      append(`✓ code (${(j.code || '').length} bytes)`);
    }
    setSaving(false);
  }

  async function saveToRepo() {
    if (!code.trim()) { append('! nothing to save'); return; }
    setSaving(true);
    append(`> save ${targetPath}`);
    const r = await fetch('/api/repo/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: targetPath,
        content: code,
        message: `update ${targetPath} (console v2)`,
      }),
    });
    append(r.ok ? '✓ committed' : '! commit failed');
    setSaving(false);
  }

  async function runCmd() {
    const line = cmd.trim();
    if (!line) return;
    setCmd('');
    append(`$ ${line}`);
    const [bin, ...rest] = line.split(/\s+/);
    try {
      if (bin === 'ls') {
        const path = rest[0] || '';
        const r = await fetch('/api/repo/ls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
        const j = await r.json();
        append(j.items?.map((i: any) => `${i.type === 'dir' ? '[d]' : ' -'} ${i.name}`).join('\n') || '(empty)');
      } else if (bin === 'cat') {
        const path = rest.join(' ');
        const r = await fetch('/api/repo/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
        const j = await r.json();
        append(j.content ?? '(not found)');
      } else if (bin === 'mkdir') {
        const path = rest.join(' ');
        await fetch('/api/repo/mkdir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
        append(`created ${path}/.gitkeep`);
      } else if (bin === 'rm') {
        const path = rest.join(' ');
        await fetch('/api/repo/rm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
        append(`removed ${path}`);
      } else {
        append('commands: ls [path], cat <path>, mkdir <path>, rm <path>');
      }
    } catch (e: any) {
      append('! ' + (e.message || e));
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: '32px auto', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: '#10b981' }} />
        <h1 style={{ margin: 0, fontWeight: 800 }}>{VERSION}</h1>
        <span style={{ opacity: 0.6 }}>(/dev/console)</span>
      </header>

      <section style={{ display: 'grid', gap: 12, marginTop: 8 }}>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>target path</label>
        <input
          style={{ border: '1px solid #333', background: '#0b0b0d', color: '#fff', padding: '10px 12px', borderRadius: 8, fontFamily: 'monospace' }}
          value={targetPath}
          onChange={e => setTargetPath(e.target.value)}
          placeholder="e.g. src/components/MyCard.tsx"
        />
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>prompt</label>
        <textarea
          style={{ border: '1px solid #333', background: '#0b0b0d', color: '#fff', padding: 12, borderRadius: 8, minHeight: 120 }}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe what you want built…"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button disabled={saving} onClick={generate} style={{ padding: '10px 14px', borderRadius: 8, background: '#111827', color: 'white', border: '1px solid #374151' }}>
            ✨ Generate
          </button>
          <button disabled={saving} onClick={saveToRepo} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #374151' }}>
            💾 Save to GitHub
          </button>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>code</label>
        <textarea
          style={{ width: '100%', border: '1px solid #333', background: '#0b0b0d', color: '#d1d5db', padding: 12, borderRadius: 8, minHeight: 240, fontFamily: 'monospace' }}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="// AI output will appear here"
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <label style={{ fontFamily: 'monospace', fontSize: 12 }}>terminal</label>
        <div
          ref={logRef}
          style={{ border: '1px solid #333', background: '#0b0b0d', color: '#a7f3d0', padding: 12, borderRadius: 8, minHeight: 160, maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}
        >
          {log.join('\n')}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            style={{ flex: 1, border: '1px solid #333', background: '#0b0b0d', color: '#fff', padding: '10px 12px', borderRadius: 8, fontFamily: 'monospace' }}
            value={cmd}
            onChange={e => setCmd(e.target.value)}
            placeholder="ls src, cat src/app/page.tsx, mkdir public/covers, rm README.md"
            onKeyDown={(e) => e.key === 'Enter' && runCmd()}
          />
          <button onClick={runCmd} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #374151' }}>
            ▶︎ Run
          </button>
        </div>
      </section>
    </main>
  );
}

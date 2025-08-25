'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/** ---------------------------
 *  Simple guard (same as before)
 *  ---------------------------
 */
function useGate() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const want = new URLSearchParams(location.search).get('key');
    const have = process.env.NEXT_PUBLIC_DEV_CONSOLE_KEY || '';
    setOk(!!have && want === have);
    if (!have) console.warn('NEXT_PUBLIC_DEV_CONSOLE_KEY not set');
  }, []);
  return ok;
}

/** ---------------------------
 *  Tiny helpers for API calls
 *  ---------------------------
 */
async function api(path: string, body: any) {
  const r = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || `API ${path} failed`);
  return j;
}

async function ls(path = ''): Promise<{name: string; type: 'file'|'dir'}[]> {
  const j = await api('/api/repo/ls', { path });
  return j.items as {name:string; type:'file'|'dir'}[];
}

async function cat(path: string): Promise<string|null> {
  const j = await api('/api/repo/read', { path });
  return j.content ?? null;
}

async function write(path: string, content: string, message?: string) {
  return api('/api/repo/write', { path, content, message: message || `update ${path} (console)` });
}

async function mkdirp(path: string) {
  return api('/api/repo/mkdir', { path });
}

async function rm(path: string) {
  return api('/api/repo/rm', { path });
}

async function aiGenerate(prompt: string, targetPath: string) {
  const j = await api('/api/ai/generate', { prompt, targetPath });
  return j.code as string;
}

/** ---------------------------
 *  Minimal styles (Tailwind classes assumed in your app)
 *  ---------------------------
 */
const paneCls = 'rounded border border-neutral-800 bg-neutral-950/60 backdrop-blur p-3';
const btn = 'px-3 py-2 rounded bg-black text-white hover:bg-neutral-800 disabled:opacity-50';
const btnGhost = 'px-3 py-2 rounded border border-neutral-700 hover:bg-neutral-900 disabled:opacity-50';
const input = 'border rounded px-3 py-2 bg-neutral-950/70 border-neutral-800';

/** ---------------------------
 *  File Explorer
 *  ---------------------------
 */
type NodeKind = { name: string; type: 'file'|'dir' };

function NodeRow(props: {
  node: NodeKind;
  root: string;
  onOpen: (fullPath: string, isDir: boolean) => void;
}) {
  const { node, root, onOpen } = props;
  const rel = node.name;
  const base = root ? `${root.replace(/\/+$/,'')}/` : '';
  const full = `${base}${rel}`;
  const isDir = node.type === 'dir';
  return (
    <div
      className="flex items-center justify-between px-2 py-1 rounded hover:bg-neutral-900 cursor-pointer"
      onClick={() => onOpen(full, isDir)}
      title={full}
    >
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 text-neutral-400">{isDir ? '📁' : '📄'}</span>
        <span className="truncate">{rel.replace(/^.*\//,'')}</span>
      </div>
      <span className="text-xs opacity-50">{isDir ? 'dir' : 'file'}</span>
    </div>
  );
}

/** ---------------------------
 *  Preset prompts for AI
 *  ---------------------------
 */
const PRESETS: { label: string; target: string; prompt: string }[] = [
  {
    label: '🧱 Component: Card',
    target: 'src/components/CardShowcase.tsx',
    prompt:
`Make a React/TSX component called CardShowcase that exports default.
It renders a responsive grid of cards with title, description, and an image (use placeholder /covers/sample.jpg).
Use Tailwind classes. No external deps.`,
  },
  {
    label: '🗺 Page: About',
    target: 'src/app/about/page.tsx',
    prompt:
`Create a Next.js app route page component (export default) for /about.
Dark theme. Heading "About Shadowline". Short paragraph. Two sections with subheadings.
Use existing fonts/classes (Tailwind).`,
  },
  {
    label: '🪪 Dialog: Image Upload',
    target: 'src/components/ImageUploadDialog.tsx',
    prompt:
`Create a TSX component called ImageUploadDialog with props {open:boolean; onClose:()=>void; onPick:(file:File)=>void }.
It renders a basic modal with a file input and two buttons. No external UI libs. Tailwind only.`,
  },
];

/** ---------------------------
 *  Main Console
 *  ---------------------------
 */
export default function DevConsole() {
  const gateOk = useGate();

  // explorer state
  const [cwd, setCwd] = useState<string>('');           // current folder path ('', 'src', 'public', etc.)
  const [items, setItems] = useState<NodeKind[]>([]);
  const [loadingLS, setLoadingLS] = useState(false);

  // editor state
  const [targetPath, setTargetPath] = useState('src/app/example/page.tsx');
  const [code, setCode] = useState('');
  const [dirty, setDirty] = useState(false);

  // ai state
  const [prompt, setPrompt] = useState('Make a simple TSX component that says Hello Gotham.');
  const [thinking, setThinking] = useState(false);

  // preview
  const [previewHtml, setPreviewHtml] = useState<string>('');

  // terminal
  const [cmd, setCmd] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => { logRef.current?.scrollTo(0, 1e9); }, [log]);
  const append = (s: string) => setLog(l => [...l, s]);

  // load root on mount
  useEffect(() => { refreshLS(''); }, []);

  async function refreshLS(dir: string) {
    setLoadingLS(true);
    try {
      const arr = await ls(dir);
      // show relative names (GitHub "contents" returns full path)
      const trimmed = arr.map(x => {
        const last = x.name.replace(/^\/+/,'').split('/').slice(-1).join('/');
        return { name: last ? (dir ? `${dir}/${last}` : last) : x.name, type: x.type };
      });
      setItems(trimmed.sort((a,b)=>a.type===b.type?a.name.localeCompare(b.name):a.type==='dir'?-1:1));
      setCwd(dir);
    } catch (e:any) {
      append(`! ls error: ${e.message || e}`);
    } finally {
      setLoadingLS(false);
    }
  }

  async function openNode(fullPath: string, isDir: boolean) {
    if (isDir) {
      await refreshLS(fullPath);
    } else {
      try {
        const txt = await cat(fullPath);
        setTargetPath(fullPath);
        setCode(txt ?? '');
        setDirty(false);
        setPreviewHtml('');
        append(`opened ${fullPath}`);
      } catch (e:any) {
        append(`! open error: ${e.message || e}`);
      }
    }
  }

  async function handleGen() {
    try {
      setThinking(true);
      append(`> ai → ${targetPath}`);
      const out = await aiGenerate(prompt, targetPath);
      setCode(out || '');
      setDirty(true);
      // naive static preview: if user generated raw HTML (not React), we can show it
      if (/<\/?html|<\/?main|<\/?section|<\/?article/i.test(out) && !/export\s+default|import\s+React/i.test(out)) {
        setPreviewHtml(out);
      } else {
        setPreviewHtml(`<pre style="white-space:pre-wrap;color:#0f0;background:#111;padding:12px;">(Static preview only shows raw HTML)\n\n${escapeHtml(out).slice(0,20000)}</pre>`);
      }
      append(`✓ generated (${(out||'').length} bytes)`);
    } catch (e:any) {
      append(`! ai error: ${e.message || e}`);
    } finally {
      setThinking(false);
    }
  }

  async function handleSave() {
    try {
      append(`> save ${targetPath}`);
      await write(targetPath, code, `update ${targetPath} (console)`);
      setDirty(false);
      append(`✓ committed`);
    } catch (e:any) {
      append(`! save error: ${e.message || e}`);
    }
  }

  async function handleMkdir() {
    const name = promptModal('New folder path (e.g. src/components)');
    if (!name) return;
    try {
      await mkdirp(name);
      append(`created ${name}/.gitkeep`);
      // refresh the parent dir the user is looking at if applicable
      const parent = name.replace(/\/+$/,'').split('/').slice(0,-1).join('/');
      await refreshLS(parent);
    } catch (e:any) {
      append(`! mkdir error: ${e.message || e}`);
    }
  }

  async function handleDelete() {
    const sure = confirm(`Delete ${targetPath}? This commits a removal.`);
    if (!sure) return;
    try {
      await rm(targetPath);
      append(`removed ${targetPath}`);
      setTargetPath('src/app/example/page.tsx');
      setCode('');
      setPreviewHtml('');
      setDirty(false);
      // refresh current dir
      const parent = targetPath.split('/').slice(0, -1).join('/');
      await refreshLS(parent);
    } catch (e:any) {
      append(`! rm error: ${e.message || e}`);
    }
  }

  // tiny terminal commands backed by the same APIs
  async function runCmd() {
    const line = cmd.trim();
    setCmd('');
    if (!line) return;
    append(`$ ${line}`);
    const [bin, ...rest] = line.split(/\s+/);
    try {
      if (bin === 'ls') {
        const dir = rest[0] || '';
        const items = await ls(dir);
        append(items.map(i => `${i.type==='dir'?'[d]':' -'} ${i.name}`).join('\n') || '(empty)');
      } else if (bin === 'cat') {
        const p = rest.join(' ');
        const txt = await cat(p);
        append(txt ?? '(not found)');
      } else if (bin === 'mkdir') {
        const p = rest.join(' ');
        await mkdirp(p);
        append(`created ${p}/.gitkeep`);
      } else if (bin === 'rm') {
        const p = rest.join(' ');
        await rm(p);
        append(`removed ${p}`);
      } else if (bin === 'gen') {
        // gen <path> <...prompt>
        const p = rest[0];
        const pr = rest.slice(1).join(' ');
        if (!p || !pr) return append('usage: gen <path> <prompt text>');
        setTargetPath(p);
        setPrompt(pr);
        await handleGen();
      } else {
        append('commands: ls [path], cat <path>, mkdir <path>, rm <path>, gen <path> <prompt>');
      }
    } catch (e:any) {
      append(`! ${e.message || e}`);
    }
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty) handleSave();
      }
      if (meta && e.key === 'Enter') {
        e.preventDefault();
        handleGen();
      }
      if (e.key === '`') {
        (document.getElementById('console-cmd') as HTMLInputElement)?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, prompt, targetPath, code]);

  // helper: apply a preset
  function usePreset(p: typeof PRESETS[number]) {
    setTargetPath(p.target);
    setPrompt(p.prompt);
  }

  const previewUrlHint = useMemo(() => {
    // Helpful hint: if editing something under public/, it will be live at /<rest> after deploy
    if (targetPath.startsWith('public/')) {
      return '/' + targetPath.replace(/^public\/+/,'');
    }
    return '';
  }, [targetPath]);

  if (!gateOk) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Dev Console Locked</h1>
        <p className="opacity-70 mt-2">
          Append <code>?key=YOUR_KEY</code> to the URL and set <code>NEXT_PUBLIC_DEV_CONSOLE_KEY</code>.
        </p>
      </main>
    );
  }

  return (
    <main className="grid grid-cols-[280px_1fr] gap-4 p-4 md:p-6">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className={paneCls}>
          <h2 className="font-semibold mb-2">Explorer</h2>
          <div className="flex gap-2 mb-2">
            <button className={btnGhost} onClick={()=>refreshLS('')}>root</button>
            <button className={btnGhost} onClick={()=>refreshLS('src')}>src</button>
            <button className={btnGhost} onClick={()=>refreshLS('public')}>public</button>
          </div>
          <div className="text-xs opacity-70 mb-2 truncate">cwd: {cwd || '/'}</div>
          <div className="max-h-[50vh] overflow-auto rounded border border-neutral-800">
            {loadingLS ? (
              <div className="p-3 text-sm opacity-70">Loading…</div>
            ) : (
              items.map(n => (
                <NodeRow key={n.name} node={n} root={''} onOpen={openNode} />
              ))
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button className={btnGhost} onClick={handleMkdir}>New folder</button>
          </div>
        </div>

        <div className={paneCls}>
          <h2 className="font-semibold mb-2">AI Presets</h2>
          <div className="grid gap-2">
            {PRESETS.map(p => (
              <button key={p.label} className={btnGhost} onClick={()=>usePreset(p)}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className={paneCls}>
          <h2 className="font-semibold mb-2">Shortcuts</h2>
          <ul className="text-sm space-y-1 opacity-80">
            <li><kbd className="px-1 py-0.5 border rounded">⌘/Ctrl</kbd> + <kbd className="px-1 py-0.5 border rounded">Enter</kbd> Generate</li>
            <li><kbd className="px-1 py-0.5 border rounded">⌘/Ctrl</kbd> + <kbd className="px-1 py-0.5 border rounded">S</kbd> Save</li>
            <li><kbd className="px-1 py-0.5 border rounded">`</kbd> Focus terminal</li>
          </ul>
        </div>
      </aside>

      {/* Main panes */}
      <section className="grid grid-rows-[auto_auto_1fr_auto] gap-4">
        {/* AI input */}
        <div className={paneCls}>
          <div className="grid gap-2">
            <label className="font-mono text-xs">target path</label>
            <input
              className={input}
              value={targetPath}
              onChange={e=>{ setTargetPath(e.target.value); setPreviewHtml(''); }}
              placeholder="e.g. src/components/MyCard.tsx"
            />
            <label className="font-mono text-xs">prompt</label>
            <textarea
              className={`${input} min-h-[100px]`}
              value={prompt}
              onChange={e=>setPrompt(e.target.value)}
              placeholder="Describe what you want…"
            />
            <div className="flex gap-2">
              <button className={btn} disabled={thinking} onClick={handleGen}>✨ Generate</button>
              <button className={btnGhost} disabled={!dirty && !code} onClick={handleSave}>💾 Save to GitHub</button>
              <button className={btnGhost} disabled={!targetPath} onClick={handleDelete}>🗑 Delete file</button>
              {previewUrlHint && <span className="text-xs opacity-70 ml-auto">after deploy: {previewUrlHint}</span>}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className={paneCls}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Editor</h2>
            <span className="text-xs opacity-70">{dirty ? '• unsaved' : 'saved'}</span>
          </div>
          <textarea
            className={`${input} font-mono min-h-[240px]`}
            value={code}
            onChange={e=>{ setCode(e.target.value); setDirty(true); }}
            placeholder="// AI output or file content will appear here"
          />
        </div>

        {/* Preview */}
        <div className={paneCls}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Preview</h2>
            <span className="text-xs opacity-70">(static HTML only)</span>
          </div>
          <div className="rounded border border-neutral-800 overflow-hidden min-h-[220px] bg-white">
            {previewHtml ? (
              <iframe
                title="preview"
                sandbox="allow-same-origin"
                className="w-full h-[320px] bg-white"
                srcDoc={previewHtml}
              />
            ) : (
              <div className="p-4 text-sm text-neutral-600">No preview yet. Generate HTML or paste raw HTML.</div>
            )}
          </div>
        </div>

        {/* Terminal */}
        <div className={paneCls}>
          <h2 className="font-semibold mb-2">Terminal</h2>
          <div
            ref={logRef}
            className="border border-neutral-800 rounded p-3 min-h-[120px] max-h-[180px] overflow-auto whitespace-pre-wrap font-mono text-sm bg-neutral-950 text-neutral-100"
          >
            {log.join('\n')}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              id="console-cmd"
              className={`${input} font-mono flex-1`}
              value={cmd}
              onChange={e=>setCmd(e.target.value)}
              placeholder="ls src, cat src/app/page.tsx, mkdir public/covers, rm README.md, gen src/app/test/page.tsx Hello page"
              onKeyDown={(e)=>{ if (e.key==='Enter') runCmd(); }}
            />
            <button className={btnGhost} onClick={runCmd}>Run</button>
          </div>
        </div>
      </section>
    </main>
  );
}

/** escape for static preview */
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (ch) =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[ch]
  );
}

/** super tiny prompt modal */
function promptModal(msg: string) {
  // eslint-disable-next-line no-alert
  const v = prompt(msg);
  if (!v) return '';
  return v.trim();
}

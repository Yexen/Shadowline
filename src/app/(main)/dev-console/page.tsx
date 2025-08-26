'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Paperclip,
  RotateCcw,
  Search as SearchIcon,
  TerminalSquare,
  MessageSquare,
  FileCode2,
  Eye,
  Save,
  FolderClosed,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

/* ----------------------------- tiny api helper ---------------------------- */
async function api<T = any>(path: string, body?: any, key?: string): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { 'x-dev-key': key } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `API ${path} failed`);
  return j as T;
}

/* ---------------------------------- types --------------------------------- */
type ChatMsg = { role: 'user'|'assistant'|'system'; content: string };
type Op =
  | { type: 'write'; path: string; content: string; message?: string }
  | { type: 'mkdir'; path: string; message?: string }
  | { type: 'delete'; path: string; message?: string };
type PlanResponse = { summary: string; reasoning?: string; files?: string[]; ops: Op[] };
type FileNode = { name: string; path: string; type: 'file'|'dir'; children?: FileNode[] };

/* ------------------------------- persistence ------------------------------ */
const LS = {
  TAB: 'dc.tab',
  CHAT: 'dc.chat',
  EDITOR_FILE: 'dc.editor.file',
  EDITOR_CONTENT: 'dc.editor.content',
  PREVIEW: 'dc.preview',
};

/* ---------------------------------- page ---------------------------------- */
export default function DevConsolePage() {
  /* gate with ?key=… (optional, still works without) */
  const [devKey, setDevKey] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDevKey(new URLSearchParams(window.location.search).get('key') || '');
    }
  }, []);

  /* ------------------------------- top controls ------------------------------ */
  const [tab, setTab] = useState<'chat'|'editor'|'terminal'>(
    (typeof window !== 'undefined' && (localStorage.getItem(LS.TAB) as any)) || 'chat'
  );
  useEffect(() => { localStorage.setItem(LS.TAB, tab); }, [tab]);

  const [search, setSearch] = useState('');

  /* ---------------------------------- chat ---------------------------------- */
  const [chat, setChat] = useState<ChatMsg[]>(
    () => (typeof window !== 'undefined' && JSON.parse(localStorage.getItem(LS.CHAT) || 'null')) || [
      { role:'system', content: 'You are Bat Computer. Be concise, ask for missing details.' },
    ]
  );
  useEffect(() => { localStorage.setItem(LS.CHAT, JSON.stringify(chat)); }, [chat]);

  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);

  async function sendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput('');
    const next = [...chat, { role: 'user', content: msg }];
    setChat(next);
    setChatBusy(true);
    try {
      // your AI endpoint (adjust if you named it differently)
      const r = await api<{reply: string}>('/api/ai/chat', { messages: next }, devKey);
      setChat((c) => [...c, { role: 'assistant', content: r.reply || '…' }]);
    } catch (e:any) {
      setChat((c) => [...c, { role: 'assistant', content: '❌ ' + (e?.message || 'chat failed') }]);
    } finally {
      setChatBusy(false);
    }
  }

  /* --------------------------------- editor --------------------------------- */
  const [tree, setTree] = useState<FileNode[]|null>(null);
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>({});
  const [currentPath, setCurrentPath] = useState<string>(() => localStorage.getItem(LS.EDITOR_FILE) || '');
  const [content, setContent] = useState<string>(() => localStorage.getItem(LS.EDITOR_CONTENT) || '');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);
  const [previewOut, setPreviewOut] = useState<string>(() => localStorage.getItem(LS.PREVIEW) || '');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { localStorage.setItem(LS.EDITOR_FILE, currentPath); }, [currentPath]);
  useEffect(() => { localStorage.setItem(LS.EDITOR_CONTENT, content); }, [content]);
  useEffect(() => { localStorage.setItem(LS.PREVIEW, previewOut); }, [previewOut]);

  // load initial tree
  useEffect(() => {
    (async () => {
      try {
        // expects { tree: FileNode[] }
        const r = await api<{tree: FileNode[]}>('/api/repo/ls', { path: '' }, devKey);
        setTree(r.tree);
      } catch { /* keep null */ }
    })();
  }, [devKey]);

  async function openFile(path: string) {
    try {
      const r = await api<{content: string}>('/api/repo/read', { path }, devKey);
      setCurrentPath(path);
      setContent(r.content ?? '');
      setUndoStack([]);
      setRedoStack([]);
      setTab('editor');
    } catch (e:any) {
      setPreviewOut('❌ ' + (e?.message || 'read failed'));
    }
  }

  function onEdit(v: string) {
    setUndoStack((s) => [...s, content]);
    setRedoStack([]);
    setContent(v);
  }

  function undo() {
    setUndoStack((s) => {
      if (!s.length) return s;
      const prev = s[s.length - 1];
      setRedoStack((r) => [...r, content]);
      setContent(prev);
      return s.slice(0, -1);
    });
    // keep focus
    contentRef.current?.focus();
  }

  async function previewExecute() {
    if (!currentPath) return setPreviewOut('Open a file first.');
    try {
      const r = await api<{log:string}>('/api/repo/apply', {
        ops: [{ type: 'write', path: currentPath, content }],
        dryRun: true,
      }, devKey);
      setPreviewOut(r?.log || 'No output.');
    } catch (e:any) {
      setPreviewOut('❌ ' + (e?.message || 'preview failed'));
    }
  }

  async function commitChanges() {
    if (!currentPath) return setPreviewOut('Open a file first.');
    try {
      const r = await api<{log:string; deployTriggered?: boolean}>('/api/repo/apply', {
        ops: [{ type: 'write', path: currentPath, content }],
      }, devKey);
      setPreviewOut((s) => (s ? s + '\n' : '') + (r.log || 'Committed.'));
      if (r.deployTriggered) setPreviewOut((s) => s + '\nTriggered Vercel deploy hook.');
    } catch (e:any) {
      setPreviewOut('❌ ' + (e?.message || 'commit failed'));
    }
  }

  // ask AI for suggested files when in Editor and there is a question in chat
  useEffect(() => {
    if (tab !== 'editor') return;
    const lastUser = [...chat].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    (async () => {
      try {
        const r = await api<{paths:string[]}>('/api/ai/plan', { question: lastUser.content }, devKey);
        setSuggestedPaths(r.paths || []);
      } catch { /* ignore */ }
    })();
  }, [tab, chat, devKey]);

  /* -------------------------------- terminal ------------------------------- */
  const [termLog, setTermLog] = useState<string[]>([
    'Bat Computer CLI v1.0. Type "help" for commands.',
  ]);
  const [termCmd, setTermCmd] = useState('');
  async function runCmd() {
    const cmd = termCmd.trim();
    if (!cmd) return;
    setTermCmd('');
    setTermLog((l) => [...l, `> ${cmd}`]);
    try {
      const r = await api<{out:string}>('/api/repo/run', { cmd }, devKey);
      setTermLog((l) => [...l, r.out || '']);
    } catch (e:any) {
      setTermLog((l) => [...l, '❌ ' + (e?.message || 'exec failed')]);
    }
  }

  /* ------------------------------ file explorer ---------------------------- */
  const filteredTree = useMemo(() => {
    if (!tree) return null;
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const pick = (n: FileNode): FileNode | null => {
      if (n.type === 'file' && (n.name.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)))
        return n;
      if (n.type === 'dir' && n.children) {
        const kids = n.children.map(pick).filter(Boolean) as FileNode[];
        if (kids.length) return { ...n, children: kids };
      }
      return null;
    };
    return tree.map(pick).filter(Boolean) as FileNode[];
  }, [tree, search]);

  function Dir({ node }: { node: FileNode }) {
    const isOpen = !!openDirs[node.path];
    return (
      <div className="ml-2">
        <button
          onClick={() => setOpenDirs((m) => ({ ...m, [node.path]: !isOpen }))}
          className="flex items-center gap-1 text-amber-300 hover:text-amber-200"
        >
          <ChevronRight className={cn('h-4 w-4 transition', isOpen && 'rotate-90')} />
          <FolderClosed className="h-4 w-4" />
          <span>{node.name}</span>
        </button>
        {isOpen && node.children?.length ? (
          <div className="ml-4 mt-1">
            {node.children.map((c) =>
              c.type === 'dir' ? (
                <Dir key={c.path} node={c} />
              ) : (
                <button
                  key={c.path}
                  onClick={() => openFile(c.path)}
                  className="block px-1 py-0.5 text-left text-amber-200 hover:text-amber-100"
                >
                  {c.name}
                </button>
              )
            )}
          </div>
        ) : null}
      </div>
    );
  }

  /* --------------------------------- attach -------------------------------- */
  const fileInputRef = useRef<HTMLInputElement>(null);
  function onAttachFiles(files: FileList | null) {
    if (!files?.length) return;
    // For now just echo names into chat. You can stream them to /api/uploads later.
    const names = Array.from(files).map((f) => f.name).join(', ');
    setChat((c) => [...c, { role:'assistant', content:`📎 Attached: ${names}` }]);
  }

  /* --------------------------------- render -------------------------------- */
  return (
    <main className="mx-auto max-w-[1200px] px-4 md:px-6 py-8">
      {/* title row + search */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-headline text-3xl tracking-wide">BAT COMPUTER</h1>
        <div className="relative w-64">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files…"
            className="pl-9 h-9 bg-black/40 border-white/10"
          />
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        </div>
      </div>

      {/* tabs */}
      <div className="mb-3 flex gap-2">
        <TabButton
          active={tab === 'chat'}
          onClick={() => setTab('chat')}
          icon={<MessageSquare className="h-4 w-4" />}
          label="AI Chat"
        />
        <TabButton
          active={tab === 'editor'}
          onClick={() => setTab('editor')}
          icon={<FileCode2 className="h-4 w-4" />}
          label="Editor"
        />
        <TabButton
          active={tab === 'terminal'}
          onClick={() => setTab('terminal')}
          icon={<TerminalSquare className="h-4 w-4" />}
          label="Terminal"
        />
        {currentPath && tab === 'editor' && (
          <span className="ml-3 rounded border border-white/10 px-2 py-1 text-xs opacity-80">
            {currentPath}
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* left: main panel */}
        <section className="col-span-12 lg:col-span-8">
          <div className="rounded border border-white/10 bg-black/40">
            {tab === 'chat' && (
              <div className="flex h-[460px] flex-col">
                <div className="flex-1 overflow-auto p-3 space-y-2 text-sm">
                  {chat
                    .filter((m) => m.role !== 'system')
                    .map((m, i) => (
                      <div key={i} className={cn('max-w-[90%]', m.role === 'user' ? 'ml-auto text-right' : 'mr-auto')}>
                        <div
                          className={cn(
                            'inline-block rounded px-3 py-2',
                            m.role === 'user'
                              ? 'bg-amber-500/20 border border-amber-500/30'
                              : 'bg-white/5 border border-white/10'
                          )}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center gap-2 p-3">
                  <Button
                    variant="ghost"
                    className="h-9 px-2 text-amber-300 hover:text-amber-200"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => onAttachFiles(e.target.files)}
                  />
                  <Input
                    className="h-9 flex-1 bg-black/60 border-white/10"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me to modify the app…"
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                  />
                  <Button className="h-9" onClick={sendChat} disabled={chatBusy}>
                    {chatBusy ? 'Thinking…' : 'Send'}
                  </Button>
                </div>
              </div>
            )}

            {tab === 'editor' && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 p-3">
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-amber-300 hover:text-amber-200"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-amber-300 hover:text-amber-200"
                    onClick={undo}
                    title="Undo"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button variant="outline" className="h-8" onClick={previewExecute}>
                      <Eye className="mr-2 h-4 w-4" /> Preview
                    </Button>
                    <Button className="h-8" onClick={commitChanges}>
                      <Save className="mr-2 h-4 w-4" /> Commit
                    </Button>
                  </div>
                </div>
                <Separator className="bg-white/10" />
                {/* suggested paths */}
                {suggestedPaths.length ? (
                  <div className="px-3 py-2 text-xs text-white/70">
                    Suggested files:&nbsp;
                    {suggestedPaths.map((p, i) => (
                      <button
                        key={p + i}
                        className="underline decoration-dotted hover:text-amber-300"
                        onClick={() => openFile(p)}
                      >
                        {p}
                      </button>
                    )).reduce((prev, curr) => (prev.length ? [...prev, <span key={prev.length}>, </span>, curr] : [curr]), [] as any)}
                  </div>
                ) : null}
                <div className="p-3">
                  <textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => onEdit(e.target.value)}
                    className="h-[340px] w-full resize-none rounded border border-white/10 bg-black/60 p-3 font-mono text-sm outline-none"
                    placeholder="// open a file from the explorer to edit…"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {tab === 'terminal' && (
              <div className="flex h-[460px] flex-col">
                <div className="flex-1 overflow-auto p-3 font-mono text-sm text-amber-200">
                  {termLog.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center gap-2 p-3">
                  <span className="text-amber-300">❯</span>
                  <Input
                    className="h-9 flex-1 bg-black/60 border-white/10 font-mono"
                    value={termCmd}
                    onChange={(e) => setTermCmd(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runCmd()}
                    placeholder="Enter command…"
                  />
                  <Button className="h-9" onClick={runCmd}>Run</Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview panel */}
          <div className="mt-4 rounded border border-white/10 bg-black/40">
            <div className="flex items-center justify-between p-2 text-xs uppercase tracking-wide text-white/60">
              <span>Preview Output</span>
            </div>
            <Separator className="bg-white/10" />
            <pre className="max-h-[220px] overflow-auto p-3 text-sm whitespace-pre-wrap">
              {previewOut || '—'}
            </pre>
          </div>
        </section>

        {/* right: explorer + live log */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="rounded border border-amber-700/40 bg-black/40">
            <div className="border-b border-amber-700/30 px-3 py-2 text-xs font-medium tracking-wide text-amber-300">
              FILE EXPLORER
            </div>
            <div className="p-2 text-amber-200 text-sm">
              {!filteredTree ? (
                <div className="opacity-70">Loading…</div>
              ) : (
                filteredTree.map((n) =>
                  n.type === 'dir' ? (
                    <Dir key={n.path} node={n} />
                  ) : (
                    <button
                      key={n.path}
                      onClick={() => openFile(n.path)}
                      className="block px-1 py-0.5 text-left hover:text-amber-100"
                    >
                      {n.name}
                    </button>
                  )
                )
              )}
            </div>
          </div>

          <div className="rounded border border-amber-700/40 bg-black/40">
            <div className="border-b border-amber-700/30 px-3 py-2 text-xs font-medium tracking-wide text-amber-300">
              LIVE LOG
            </div>
            <div className="p-3 font-mono text-xs text-amber-300/90 space-y-1 max-h-[260px] overflow-auto">
              <div>› Initializing Bat Computer OS v3.1</div>
              <div>› File system integrity: OK.</div>
              <div>› Power levels: 98.7%</div>
              <div>› Running diagnostics on all subsystems…</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ---------------------------------- ui ---------------------------------- */
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded px-3 py-1.5 text-sm',
        'bg-black/40 text-white/80 hover:text-white',
        active ? 'outline outline-1 outline-amber-400' : 'border border-white/10'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

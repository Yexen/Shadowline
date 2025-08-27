'use client';

import { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Paperclip, Undo2, Send, Search, FileText, Folder,
  ChevronRight, ChevronDown, Play, GitCommitVertical, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------- Local API endpoints (your existing routes) ----------
const API = {
  ls: '/api/repo/ls',
  read: '/api/repo/read',
  write: '/api/repo/write',
  preview: '/api/repo/preview',     // keep if you add later; safe no-op otherwise
  commit: '/api/repo/commit',       // keep if you add later; safe no-op otherwise
  chatUpload: '/api/ai/chat',       // accepts multipart (files)
  devchat: '/api/ai/devchat',       // repo-aware JSON chat
};

// ---------- Types ----------
type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string; ts: number };
type ChatThread = { id: string; title: string; messages: ChatMsg[] };
const LS_THREADS_KEY = 'devconsole_threads_v1';
const LS_ACTIVE_THREAD = 'devconsole_active_thread_v1';

type FsItem = { name: string; path: string; type: 'dir' | 'file'; children?: FsItem[] };

// ---------- Helpers ----------
const uid = (p='id') => `${p}_${Math.random().toString(36).slice(2,10)}`;
const loadThreads = (): ChatThread[] => {
  try { return JSON.parse(localStorage.getItem(LS_THREADS_KEY) || '[]'); } catch { return []; }
};
const saveThreads = (t: ChatThread[]) => localStorage.setItem(LS_THREADS_KEY, JSON.stringify(t));

// Build a tree from a flat list of file paths, safely
function buildTree(paths: string[]): FsItem[] {
  const root: Record<string, any> = {};
  (paths || []).forEach((p) => {
    if (!p || typeof p !== 'string') return;
    const segs = p.replace(/^\/+/, '').split('/').filter(Boolean);
    let cur = root;
    segs.forEach((seg, i) => {
      cur[seg] = cur[seg] || { __children: {}, __file: false };
      if (i === segs.length - 1) cur[seg].__file = true;
      cur = cur[seg].__children;
    });
  });

  const toItems = (node: Record<string, any>, base = ''): FsItem[] =>
    Object.keys(node || {}).sort((a,b)=>a.localeCompare(b)).map((name) => {
      const n = node[name] || {};
      const hasKids = n.__children && Object.keys(n.__children).length > 0;
      const full = base ? `${base}/${name}` : name;
      if (n.__file && !hasKids) return { name, path: `/${full}`, type: 'file' };
      return {
        name,
        path: `/${full}`,
        type: 'dir',
        children: toItems(n.__children || {}, full),
      };
    });

  return [{
    name: process.env.NEXT_PUBLIC_REPO_NAME || 'repo',
    path: '/',
    type: 'dir',
    children: toItems(root),
  }];
}

export default function DevConsolePage() {
  // global/search
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chat'|'editor'|'terminal'>('chat');

  // Preview panel
  const [preview, setPreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(true);

  // Chat
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [draft, setDraft] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Editor
  const [openPath, setOpenPath] = useState('');
  const [openContent, setOpenContent] = useState('');
  const [openSha, setOpenSha] = useState<string | undefined>(undefined);
  const [unsaved, setUnsaved] = useState(false);
  const [busyEditor, setBusyEditor] = useState(false);

  // Terminal (local sim for now)
  const [termLog, setTermLog] = useState<string[]>(['Bat Computer CLI v1.0. Type "help" for commands.']);
  const [termDraft, setTermDraft] = useState('');
  const [termBusy, setTermBusy] = useState(false);

  // File Explorer
  const [tree, setTree] = useState<FsItem[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '/': true });

  // ---------- Boot: chats ----------
  useEffect(() => {
    const t = loadThreads();
    if (t.length === 0) {
      const first = { id: uid('thread'), title: 'New chat', messages: [] } as ChatThread;
      setThreads([first]); setActiveThreadId(first.id);
      saveThreads([first]); localStorage.setItem(LS_ACTIVE_THREAD, first.id);
    } else {
      setThreads(t);
      const saved = localStorage.getItem(LS_ACTIVE_THREAD);
      const id = saved && t.some(x=>x.id===saved) ? saved : t[0].id;
      setActiveThreadId(id); localStorage.setItem(LS_ACTIVE_THREAD, id);
    }
  }, []);
  useEffect(() => { chatScrollRef.current?.scrollTo({ top: 9e9 }); }, [threads, activeThreadId]);

  // ---------- Boot: file tree from /api/repo/ls ----------
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch(API.ls, { cache: 'no-store' });
        if (!res.ok) throw new Error(`ls HTTP ${res.status}`);
        const data = await res.json();
        const files: string[] = Array.isArray(data?.files) ? data.files : Array.isArray(data) ? data : [];
        if (!stop) setTree(buildTree(files));
      } catch (e:any) {
        if (!stop) {
          setTree([{ name: 'error (tree)', path: '/', type: 'dir', children: [] }]);
          setPreview(`⚠️ Could not load file tree: ${e?.message ?? e}`); setPreviewOpen(true);
        }
      }
    })();
    return () => { stop = true; };
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId)!;

  // ---------- Chat actions ----------
  const newThread = () => {
    const t = { id: uid('thread'), title: 'New chat', messages: [] } as ChatThread;
    const next = [t, ...threads]; setThreads(next); saveThreads(next);
    setActiveThreadId(t.id); localStorage.setItem(LS_ACTIVE_THREAD, t.id);
  };

  const sendChat = async (text: string) => {
    if (!text.trim() || !activeThread) return;
    setSending(true);

    // optimistic user
    const user: ChatMsg = { role: 'user', content: text.trim(), ts: Date.now() };
    const optimistic = threads.map(t =>
      t.id === activeThread.id ? { ...t, messages: [...t.messages, user] } : t
    );
    setThreads(optimistic); saveThreads(optimistic); setDraft('');

    try {
      let aiReply = '';

      if (pendingFiles.length > 0) {
        // multipart upload to /api/ai/chat
        const form = new FormData();
        form.set('message', text.trim());
        form.set('threadId', activeThread.id);
        pendingFiles.forEach((f, i) => form.append('files', f, f.name || `file-${i}`));
        const up = await fetch(API.chatUpload, { method: 'POST', body: form });
        if (!up.ok) throw new Error(`chat upload HTTP ${up.status}`);
        const jd = await up.json();
        aiReply = jd.reply ?? '(no reply)';
        setPendingFiles([]);
      } else {
        // repo-aware dev chat with context
        const r = await fetch(API.devchat, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            context: openPath ? { openPath, openContent } : undefined,
            threadId: activeThread.id,
          }),
        });
        if (!r.ok) throw new Error(`devchat HTTP ${r.status}`);
        const jd = await r.json();
        aiReply = jd.reply ?? '(no reply)';
      }

      const ai: ChatMsg = { role: 'assistant', content: aiReply, ts: Date.now()+1 };
      const next = threads.map(t => t.id===activeThread.id ? { ...t, messages:[...t.messages, ai] } : t);
      setThreads(next); saveThreads(next);
    } catch (e:any) {
      const aiErr: ChatMsg = { role: 'assistant', content:`⚠️ Chat failed: ${e?.message ?? e}`, ts: Date.now()+1 };
      const next = threads.map(t => t.id===activeThread.id ? { ...t, messages:[...t.messages, aiErr] } : t);
      setThreads(next); saveThreads(next);
    } finally {
      setSending(false);
    }
  };

  const undoLast = () => {
    if (!activeThread) return;
    const msgs = [...activeThread.messages]; if (!msgs.length) return;
    const nextThread = { ...activeThread, messages: msgs.slice(0, -1) };
    const next = threads.map(t => t.id===activeThread.id ? nextThread : t);
    setThreads(next); saveThreads(next);
  };

  const attachFiles = (fl: FileList | null) => {
    if (!fl?.length) return;
    setPendingFiles(prev => [...prev, ...Array.from(fl)]);
  };
  const removePending = (idx: number) => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  // ---------- Editor actions (wired to /api/repo/*) ----------
  const openFile = async (p: string) => {
    if (!p) return;
    setActiveTab('editor');
    setBusyEditor(true);
    try {
      const res = await fetch(API.read, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: p }),
      });
      if (!res.ok) throw new Error(`read HTTP ${res.status}`);
      const json = await res.json();
      setOpenPath(json.path || p);
      setOpenContent(json.content ?? '');
      setOpenSha(json.sha);         // keep sha if your API returns it
      setUnsaved(false);
      setPreview(`Opened ${json.path || p}`); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Open failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const saveFile = async () => {
    if (!openPath) return;
    setBusyEditor(true);
    try {
      const res = await fetch(API.write, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: openPath,
          content: openContent,
          sha: openSha,
          message: `dev-console: update ${openPath}`,
        }),
      });
      if (!res.ok) throw new Error(`write HTTP ${res.status}`);
      const json = await res.json();
      setUnsaved(false);
      if (json.sha) setOpenSha(json.sha);
      setPreview(`✅ Saved ${json.path || openPath}`); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`❌ Save failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const execPreview = async () => {
    setBusyEditor(true);
    try {
      const res = await fetch(API.preview, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: openPath || null,
          content: openPath ? openContent : null,
        }),
      });
      if (!res.ok) throw new Error(`preview HTTP ${res.status}`);
      const json = await res.json();
      setPreview(json.output || '(no preview output)'); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Preview failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  const commitChanges = async () => {
    setBusyEditor(true);
    try {
      const res = await fetch(API.commit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `BatConsole commit ${new Date().toISOString()}` }),
      });
      if (!res.ok) throw new Error(`commit HTTP ${res.status}`);
      const json = await res.json();
      setPreview(json.result || 'Committed.'); setPreviewOpen(true);
    } catch (e:any) {
      setPreview(`⚠️ Commit failed: ${e?.message ?? e}`); setPreviewOpen(true);
    } finally {
      setBusyEditor(false);
    }
  };

  // ---------- Terminal (local demo) ----------
  const runTerm = async (cmd: string) => {
    if (!cmd.trim()) return;
    setTermLog(l => [...l, `❯ ${cmd}`]);
    setTermDraft('');
    setTermBusy(true);
    try {
      const out =
        cmd === 'help' ? 'commands: help, ls, build, deploy'
        : cmd === 'ls' ? 'src  public  next.config.ts'
        : cmd === 'build' ? 'Building… (demo)'
        : cmd === 'deploy' ? 'Triggering deploy… (demo)'
        : `Unknown command: ${cmd}`;
      setTermLog(l => [...l, out]);
    } finally {
      setTermBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 md:px-6 pb-10">
      <div className="grid grid-cols-12 gap-4 mt-6">
        {/* Main */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded border border-white/10 bg-neutral-950/60">
            {/* Header: tabs + search */}
            <div className="flex flex-col gap-2 border-b border-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
                  <TabsList className="bg-black/40">
                    <TabsTrigger value="chat" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger value="editor" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="data-[state=active]:border data-[state=active]:border-amber-500 data-[state=active]:text-amber-400">
                      Terminal
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
                  <Input
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                    placeholder="Search files, commands, or past chats…"
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-0">
              <Tabs value={activeTab} onValueChange={(v)=>setActiveTab(v as any)}>
                {/* Chat */}
                <TabsContent value="chat" className="p-0 m-0">
                  <div className="grid grid-cols-12">
                    <div className="col-span-12 lg:col-span-8 border-r border-white/10">
                      <div ref={chatScrollRef} className="h-[420px] overflow-auto p-3 space-y-3">
                        {activeThread?.messages.length
                          ? activeThread.messages.map((m,i)=>(
                              <div key={i} className="text-sm leading-6">
                                <span className="opacity-60 mr-2">
                                  {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI' : 'System'}:
                                </span>
                                <span className={m.role==='assistant' ? 'text-amber-300/90' : ''}>{m.content}</span>
                              </div>
                            ))
                          : <div className="p-3 text-sm opacity-70">Start a conversation. I can propose code edits, diffs, and terminal commands.</div>}
                      </div>

                      {/* Attachment chips */}
                      {!!pendingFiles.length && (
                        <div className="border-t border-white/10 px-2 pt-2 flex flex-wrap gap-2">
                          {pendingFiles.map((f, i)=>(
                            <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-amber-500/50 text-amber-300">
                              {f.name}
                              <button onClick={()=>removePending(i)} className="opacity-70 hover:opacity-100">
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-white/10 p-2 flex items-center gap-2">
                        <Button variant="ghost" className="text-amber-400 hover:text-amber-300" onClick={()=>fileInputRef.current?.click()} title="Attach files">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e)=>attachFiles(e.target.files)} />
                        <Button variant="ghost" className="text-amber-400 hover:text-amber-300" onClick={undoLast} title="Undo last">
                          <Undo2 className="h-4 w-4" />
                        </Button>
                        <Input
                          value={draft}
                          onChange={(e)=>setDraft(e.target.value)}
                          onKeyDown={(e)=>e.key==='Enter' && !sending && sendChat(draft)}
                          placeholder="Ask the Bat Computer to modify the app…"
                          className="flex-1"
                        />
                        <Button onClick={()=>sendChat(draft)} disabled={sending || !draft.trim()}>
                          <Send className="h-4 w-4 mr-1" /> {sending ? 'Sending…' : 'Send'}
                        </Button>
                      </div>
                    </div>

                    {/* Threads */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-wide opacity-70">Threads</div>
                          <Button size="sm" variant="outline" onClick={newThread}>New</Button>
                        </div>
                        <div className="space-y-1 max-h-[420px] overflow-auto">
                          {threads.map(t=>(
                            <button
                              key={t.id}
                              onClick={()=>{ setActiveThreadId(t.id); localStorage.setItem(LS_ACTIVE_THREAD, t.id); }}
                              className={cn(
                                'w-full text-left px-2 py-1 rounded border border-transparent hover:border-white/10',
                                activeThreadId===t.id && 'border-amber-500/70 text-amber-300'
                              )}
                            >
                              <div className="text-sm">{t.title}</div>
                              <div className="text-[11px] opacity-60">{t.messages.length} message{t.messages.length===1?'':'s'}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Editor */}
                <TabsContent value="editor" className="p-0 m-0">
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input value={openPath} onChange={(e)=>setOpenPath(e.target.value)} placeholder="Type a path (e.g., /src/app/page.tsx) or open from the tree…" />
                      <Button variant="outline" onClick={()=>openFile(openPath)} disabled={!openPath || busyEditor}>
                        Open
                      </Button>
                      <Button onClick={execPreview} variant="secondary" disabled={busyEditor}>
                        <Play className="h-4 w-4 mr-1" /> Preview
                      </Button>
                      <Button onClick={saveFile} disabled={!unsaved || !openPath || busyEditor}>
                        Save Changes
                      </Button>
                      <Button onClick={commitChanges} variant="outline" disabled={busyEditor}>
                        <GitCommitVertical className="h-4 w-4 mr-1" /> Commit
                      </Button>
                    </div>
                    <div className="rounded border border-white/10 bg-black/40">
                      <textarea
                        className="w-full h-[360px] bg-transparent p-3 font-mono text-sm outline-none"
                        value={openContent}
                        onChange={(e)=>{ setOpenContent(e.target.value); setUnsaved(true); }}
                        placeholder="// open a file from the tree or set a path, then edit…"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Terminal */}
                <TabsContent value="terminal" className="p-0 m-0">
                  <div className="p-3">
                    <div className="rounded border border-white/10 bg-black/40 h-[420px] overflow-auto p-3 font-mono text-sm">
                      {termLog.map((l,i)=><div key={i}>{l}</div>)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={termDraft}
                        onChange={(e)=>setTermDraft(e.target.value)}
                        onKeyDown={(e)=>e.key==='Enter' && !termBusy && runTerm(termDraft)}
                        placeholder="❯ Enter command…"
                      />
                      <Button onClick={()=>runTerm(termDraft)} disabled={termBusy}>
                        {termBusy ? 'Running…' : 'Run'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview */}
            <Separator className="bg-white/10" />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide opacity-70">Preview</div>
                <Button variant="ghost" size="sm" onClick={()=>setPreviewOpen(v=>!v)}>{previewOpen ? 'Hide' : 'Show'}</Button>
              </div>
              {previewOpen && (
                <div className="mt-2 rounded border border-white/10 bg-black/40 min-h-[120px] p-3 text-sm">
                  {preview || <span className="opacity-60">Nothing to preview yet.</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar (amber) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded border border-amber-500/40 bg-black/40">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-amber-400">FILE EXPLORER</div>
            <Separator className="bg-amber-500/30" />
            <div className="p-2 max-h-[520px] overflow-auto text-sm">
              <ExplorerTree
                nodes={tree ?? []}
                expanded={expanded}
                onToggle={(p)=>setExpanded(e=>({ ...e, [p]: !e[p] }))}
                onOpenFile={(p)=>openFile(p)}
              />
            </div>
          </div>

          <div className="rounded border border-amber-500/40 bg-black/40">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-amber-400">LIVE LOG</div>
            <Separator className="bg-amber-500/30" />
            <div className="p-3 font-mono text-xs space-y-1 text-amber-200/80">
              <div>› Initializing Bat Computer OS v3.1</div>
              <div>› File system integrity: OK.</div>
              <div>› Power levels: 98.7%</div>
              <div>› Running diagnostics on all subsystems…</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Explorer Tree ----------
function ExplorerTree({
  nodes, expanded, onToggle, onOpenFile, depth = 0,
}: {
  nodes: FsItem[];
  expanded: Record<string, boolean>;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
  depth?: number;
}) {
  if (!nodes?.length) {
    return <div className="text-xs opacity-60 px-3 py-2">No files yet. Is <code>/api/repo/ls</code> returning a list?</div>;
  }
  return (
    <div className="space-y-1">
      {nodes.map((n) => {
        const isDir = n.type === 'dir';
        const isOpen = !!expanded[n.path];
        return (
          <div key={n.path}>
            <button
              onClick={()=> isDir ? onToggle(n.path) : onOpenFile(n.path)}
              className={cn('w-full flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5', !isDir && 'text-amber-200/90')}
              style={{ paddingLeft: depth * 14 + 8 }}
              title={n.path}
            >
              {isDir ? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <FileText className="h-4 w-4" />}
              {isDir ? <Folder className="h-4 w-4 opacity-70" /> : null}
              <span className="truncate">{n.name}</span>
            </button>
            {isDir && isOpen && n.children?.length ? (
              <ExplorerTree nodes={n.children} expanded={expanded} onToggle={onToggle} onOpenFile={onOpenFile} depth={depth+1} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Paperclip, Undo2, Send, Search, FileText, Folder, ChevronRight, ChevronDown, Play, GitCommitVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

// ----------------------------
// Types
// ----------------------------
type ChatMsg = { role: 'user' | 'assistant' | 'system'; content: string; ts: number };
type ChatThread = { id: string; title: string; messages: ChatMsg[] };

const LS_THREADS_KEY = 'devconsole_threads_v1';
const LS_ACTIVE_THREAD = 'devconsole_active_thread_v1';

// simple fake fs listing you can replace from API later
type FsItem = { name: string; path: string; type: 'dir' | 'file'; children?: FsItem[] };

// ----------------------------
// Helpers
// ----------------------------
function loadThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(LS_THREADS_KEY);
    return raw ? (JSON.parse(raw) as ChatThread[]) : [];
  } catch {
    return [];
  }
}
function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(LS_THREADS_KEY, JSON.stringify(threads));
}
function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ----------------------------
// Page
// ----------------------------
export default function DevConsolePage() {
  // UI state
  const [activeTab, setActiveTab] = useState<'chat' | 'editor' | 'terminal'>('chat');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(true);

  // --- Chat ---
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [draft, setDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Editor (UI only for now) ---
  const [openPath, setOpenPath] = useState<string>('');
  const [openContent, setOpenContent] = useState<string>('');
  const [unsaved, setUnsaved] = useState(false);

  // --- Terminal (simulated) ---
  const [termLog, setTermLog] = useState<string[]>(['Bat Computer CLI v1.0. Type "help" for commands.']);
  const [termDraft, setTermDraft] = useState('');

  // File Explorer (replace with API data later)
  const tree: FsItem[] = useMemo<FsItem[]>(
    () => [
      {
        name: 'shadows-of-gotham',
        path: '/',
        type: 'dir',
        children: [
          { name: 'src', path: '/src', type: 'dir', children: [{ name: 'app', path: '/src/app', type: 'dir' }] },
          { name: 'public', path: '/public', type: 'dir' },
          { name: 'next.config.ts', path: '/next.config.ts', type: 'file' },
        ],
      },
    ],
    []
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '/': true });

  // ---------------------------------
  // Load chat threads from localStorage
  // ---------------------------------
  useEffect(() => {
    const t = loadThreads();
    setThreads(t);
    const savedActive = localStorage.getItem(LS_ACTIVE_THREAD) || '';
    if (savedActive && t.some((x) => x.id === savedActive)) {
      setActiveThreadId(savedActive);
    } else {
      // create one default thread if none
      if (t.length === 0) {
        const first: ChatThread = { id: uid('thread'), title: 'New chat', messages: [] };
        setThreads([first]);
        setActiveThreadId(first.id);
        saveThreads([first]);
        localStorage.setItem(LS_ACTIVE_THREAD, first.id);
      } else {
        setActiveThreadId(t[0].id);
        localStorage.setItem(LS_ACTIVE_THREAD, t[0].id);
      }
    }
  }, []);

  // auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: 'smooth' });
  }, [threads, activeThreadId]);

  const activeThread = threads.find((t) => t.id === activeThreadId)!;

  // ---------------------------------
  // Chat actions
  // ---------------------------------
  function newThread() {
    const t: ChatThread = { id: uid('thread'), title: 'New chat', messages: [] };
    const updated = [t, ...threads];
    setThreads(updated);
    setActiveThreadId(t.id);
    saveThreads(updated);
    localStorage.setItem(LS_ACTIVE_THREAD, t.id);
  }

  function renameThread(id: string, title: string) {
    const updated = threads.map((t) => (t.id === id ? { ...t, title } : t));
    setThreads(updated);
    saveThreads(updated);
  }

  function deleteThread(id: string) {
    const updated = threads.filter((t) => t.id !== id);
    setThreads(updated);
    saveThreads(updated);
    if (activeThreadId === id && updated.length) {
      setActiveThreadId(updated[0].id);
      localStorage.setItem(LS_ACTIVE_THREAD, updated[0].id);
    }
  }

  function sendChat(text: string) {
    if (!text.trim() || !activeThread) return;
    const userMsg: ChatMsg = { role: 'user', content: text.trim(), ts: Date.now() };
    const assistantMsg: ChatMsg = {
      role: 'assistant',
      content:
        "🤖 (demo) I'll analyze your repo and propose changes here. Hook me to `/api/ai/devchat` to go live.",
      ts: Date.now() + 1,
    };
    const updated = threads.map((t) =>
      t.id === activeThread.id ? { ...t, messages: [...t.messages, userMsg, assistantMsg] } : t
    );
    setThreads(updated);
    saveThreads(updated);
    setDraft('');
  }

  function undoLast() {
    if (!activeThread) return;
    const msgs = [...activeThread.messages];
    // remove last assistant reply (if any), else last user
    const idx = msgs.length - 1;
    if (idx < 0) return;
    const lastRole = msgs[idx].role;
    const cut = lastRole === 'assistant' ? 1 : 1;
    const updatedThread = { ...activeThread, messages: msgs.slice(0, msgs.length - cut) };
    const updated = threads.map((t) => (t.id === activeThread.id ? updatedThread : t));
    setThreads(updated);
    saveThreads(updated);
  }

  function attachFiles(files: FileList | null) {
    if (!files || !files.length || !activeThread) return;
    const names = Array.from(files).map((f) => f.name).join(', ');
    const note: ChatMsg = {
      role: 'user',
      content: `Attached: ${names}`,
      ts: Date.now(),
    };
    const updated = threads.map((t) => (t.id === activeThread.id ? { ...t, messages: [...t.messages, note] } : t));
    setThreads(updated);
    saveThreads(updated);
  }

  // ---------------------------------
  // Editor actions (UI only)
  // ---------------------------------
  function openFile(path: string) {
    setActiveTab('editor');
    setOpenPath(path);
    // load stub content; later replace by GET /api/repo/read?path=...
    setOpenContent(`// editing ${path}\n\nexport const demo = true;`);
    setUnsaved(false);
  }
  function saveFile() {
    // POST /api/repo/write { path, content }
    setUnsaved(false);
    setPreview(`Saved ${openPath} (demo). Wire this to /api/repo/write to make it real.`);
    setPreviewOpen(true);
  }
  function execPreview() {
    // Show a "dry-run" preview result
    setPreview(`(Preview) Would apply changes to ${openPath || '[multiple files]'}…`);
    setPreviewOpen(true);
  }
  function commitChanges() {
    setPreview(`(Commit) Would commit changes to branch & trigger deploy (demo).`);
    setPreviewOpen(true);
  }

  // ---------------------------------
  // Terminal (simulated)
  // ---------------------------------
  function runTerm(cmd: string) {
    if (!cmd.trim()) return;
    setTermLog((l) => [...l, `❯ ${cmd}`]);
    // simple demo responses
    if (cmd === 'help') {
      setTermLog((l) => [...l, 'commands: help, ls, build, deploy']);
    } else if (cmd === 'ls') {
      setTermLog((l) => [...l, 'src  public  next.config.ts']);
    } else if (cmd === 'build') {
      setTermLog((l) => [...l, 'Building… (demo)']);
    } else if (cmd === 'deploy') {
      setTermLog((l) => [...l, 'Triggering deploy… (demo)']);
    } else {
      setTermLog((l) => [...l, `Unknown command: ${cmd}`]);
    }
    setTermDraft('');
  }

  // ---------------------------------
  // UI
  // ---------------------------------
  return (
    <div className="mx-auto w-full max-w-[1300px] px-4 md:px-6 pb-10">
      {/* Console Title row (under global header/cover) */}
      <div className="flex items-center justify-between gap-3 mt-6 mb-3">
        <h1 className="font-headline text-3xl tracking-wide">BAT COMPUTER</h1>
        {/* search inside console area */}
        <div className="flex items-center gap-2 w-full max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files, commands, or past chats…"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main console panel */}
        <div className="col-span-12 lg:col-span-9">
          <div className="rounded border border-white/10 bg-neutral-950/60">
            <div className="flex items-center justify-between px-3 py-2">
              <Tabs
                defaultValue="chat"
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="w-full"
              >
                <TabsList className="bg-black/40">
                  <TabsTrigger
                    value="chat"
                    className={cn(
                      'data-[state=active]:border data-[state=active]:border-amber-500',
                      'data-[state=active]:text-amber-400'
                    )}
                  >
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger
                    value="editor"
                    className={cn(
                      'data-[state=active]:border data-[state=active]:border-amber-500',
                      'data-[state=active]:text-amber-400'
                    )}
                  >
                    Editor
                  </TabsTrigger>
                  <TabsTrigger
                    value="terminal"
                    className={cn(
                      'data-[state=active]:border data-[state=active]:border-amber-500',
                      'data-[state=active]:text-amber-400'
                    )}
                  >
                    Terminal
                  </TabsTrigger>
                </TabsList>

                {/* ---------------- Chat ---------------- */}
                <TabsContent value="chat" className="p-0">
                  <Separator className="bg-white/10" />
                  <div className="grid grid-cols-12">
                    {/* Left: messages */}
                    <div className="col-span-12 lg:col-span-8 border-r border-white/10">
                      <div ref={scrollRef} className="h-[420px] overflow-auto p-3 space-y-3">
                        {activeThread?.messages.length ? (
                          activeThread.messages.map((m, i) => (
                            <div key={i} className="text-sm leading-6">
                              <span className="opacity-60 mr-2">
                                {m.role === 'user' ? 'You' : m.role === 'assistant' ? 'AI' : 'System'}:
                              </span>
                              <span className={m.role === 'assistant' ? 'text-amber-300/90' : ''}>{m.content}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-sm opacity-70">
                            Start a conversation. I can propose code edits, diffs, and terminal commands.
                          </div>
                        )}
                      </div>

                      <div className="border-t border-white/10 p-2 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="text-amber-400 hover:text-amber-300"
                          onClick={() => fileInputRef.current?.click()}
                          title="Attach files"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          multiple
                          onChange={(e) => attachFiles(e.target.files)}
                        />

                        <Button
                          variant="ghost"
                          className="text-amber-400 hover:text-amber-300"
                          onClick={undoLast}
                          title="Undo last"
                        >
                          <Undo2 className="h-4 w-4" />
                        </Button>

                        <Input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendChat(draft)}
                          placeholder="Ask the Bat Computer to modify the app…"
                          className="flex-1"
                        />
                        <Button onClick={() => sendChat(draft)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>

                    {/* Right: thread list */}
                    <div className="col-span-12 lg:col-span-4">
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-xs uppercase tracking-wide opacity-70">Threads</div>
                          <Button size="sm" variant="outline" onClick={newThread}>
                            New
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-[420px] overflow-auto">
                          {threads.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setActiveThreadId(t.id);
                                localStorage.setItem(LS_ACTIVE_THREAD, t.id);
                              }}
                              className={cn(
                                'w-full text-left px-2 py-1 rounded border border-transparent hover:border-white/10',
                                activeThreadId === t.id && 'border-amber-500/70 text-amber-300'
                              )}
                            >
                              <div className="text-sm">{t.title}</div>
                              <div className="text-[11px] opacity-60">
                                {t.messages.length} message{t.messages.length === 1 ? '' : 's'}
                              </div>
                              {/* quick inline rename/delete controls could be added here */}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ---------------- Editor ---------------- */}
                <TabsContent value="editor" className="p-0">
                  <Separator className="bg-white/10" />
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={openPath}
                        onChange={(e) => setOpenPath(e.target.value)}
                        placeholder="Select or type a file path (e.g., /src/app/page.tsx)…"
                      />
                      <Button variant="outline" onClick={() => openFile(openPath)} disabled={!openPath}>
                        Open
                      </Button>
                      <Button onClick={execPreview} variant="secondary">
                        <Play className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button onClick={saveFile} disabled={!unsaved || !openPath}>
                        Save Changes
                      </Button>
                      <Button onClick={commitChanges} variant="outline">
                        <GitCommitVertical className="h-4 w-4 mr-1" />
                        Commit
                      </Button>
                    </div>

                    <div className="rounded border border-white/10 bg-black/40">
                      <textarea
                        className="w-full h-[360px] bg-transparent p-3 font-mono text-sm outline-none"
                        value={openContent}
                        onChange={(e) => {
                          setOpenContent(e.target.value);
                          setUnsaved(true);
                        }}
                        placeholder="// open a file from the tree or set a path, then edit…"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ---------------- Terminal ---------------- */}
                <TabsContent value="terminal" className="p-0">
                  <Separator className="bg-white/10" />
                  <div className="p-3">
                    <div className="rounded border border-white/10 bg-black/40 h-[420px] overflow-auto p-3 font-mono text-sm">
                      {termLog.map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        value={termDraft}
                        onChange={(e) => setTermDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runTerm(termDraft)}
                        placeholder="❯ Enter command…"
                      />
                      <Button onClick={() => runTerm(termDraft)}>Run</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview panel */}
            <Separator className="bg-white/10" />
            <div className="p-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide opacity-70">Preview</div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewOpen((v) => !v)}>
                  {previewOpen ? 'Hide' : 'Show'}
                </Button>
              </div>
              {previewOpen && (
                <div className="mt-2 rounded border border-white/10 bg-black/40 min-h-[120px] p-3 text-sm">
                  {preview || <span className="opacity-60">Nothing to preview yet.</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar: File Explorer + Live Log */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="rounded border border-amber-500/40 bg-black/40">
            <div className="px-3 py-2 text-xs font-semibold tracking-wider text-amber-400">FILE EXPLORER</div>
            <Separator className="bg-amber-500/30" />
            <div className="p-2 max-h-[520px] overflow-auto text-sm">
              <ExplorerTree
                nodes={tree}
                expanded={expanded}
                onToggle={(p) => setExpanded((e) => ({ ...e, [p]: !e[p] }))}
                onOpenFile={(p) => openFile(p)}
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

// ----------------------------
// File Explorer (UI only)
// ----------------------------
function ExplorerTree({
  nodes,
  expanded,
  onToggle,
  onOpenFile,
  depth = 0,
}: {
  nodes: FsItem[];
  expanded: Record<string, boolean>;
  onToggle: (path: string) => void;
  onOpenFile: (path: string) => void;
  depth?: number;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((n) => {
        const isDir = n.type === 'dir';
        const isOpen = !!expanded[n.path];
        return (
          <div key={n.path}>
            <button
              onClick={() => (isDir ? onToggle(n.path) : onOpenFile(n.path))}
              className={cn(
                'w-full flex items-center gap-2 rounded px-2 py-1 hover:bg-white/5',
                !isDir && 'text-amber-200/90'
              )}
              style={{ paddingLeft: depth * 14 + 8 }}
              title={n.path}
            >
              {isDir ? (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />) : <FileText className="h-4 w-4" />}
              {isDir ? <Folder className="h-4 w-4 opacity-70" /> : null}
              <span className="truncate">{n.name}</span>
            </button>
            {isDir && isOpen && n.children?.length ? (
              <ExplorerTree
                nodes={n.children}
                expanded={expanded}
                onToggle={onToggle}
                onOpenFile={onOpenFile}
                depth={depth + 1}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
